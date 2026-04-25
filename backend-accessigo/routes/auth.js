// routes/auth.js — Register, Login, Token Refresh, Profile (Supabase)
import express from 'express';
const router = express.Router();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';

import db from '../db.js';
import { authenticate } from '../middleware/auth.js';

// ── Helpers ──────────────────────────────────────────────
function signAccess(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function makeRefreshToken(userId) {
  const token     = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  
  await db
    .from('refresh_tokens')
    .insert([{ user_id: userId, token, expires_at: expiresAt }]);
  
  return token;
}

// ── POST /api/auth/register ───────────────────────────────
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if email exists
    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Hash password and insert user
    const hash = await bcrypt.hash(password, 10);
    const { data: userData, error: insertError } = await db
      .from('users')
      .insert([{ name, email, password: hash, role: 'user' }])
      .select('id, name, email, role, created_at');

    if (insertError) throw insertError;
    const user = userData[0];

    const accessToken  = signAccess(user);
    const refreshToken = await makeRefreshToken(user.id);

    res.status(201).json({
      message: 'Account created successfully.',
      user:  { id: user.id, name: user.name, email: user.email, role: user.role },
      token: accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Failed to register.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    const { data: user, error: fetchError } = await db
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }

    const accessToken  = signAccess(user);
    const refreshToken = await makeRefreshToken(user.id);

    res.json({
      message: 'Login successful.',
      user:  { id: user.id, name: user.name, email: user.email, role: user.role },
      token: accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Failed to log in.' });
  }
});

// ── POST /api/auth/refresh ────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required.' });

    const { data: tokenData, error: fetchError } = await db
      .from('refresh_tokens')
      .select('*, users(id, name, email, role)')
      .eq('token', refreshToken)
      .single();

    if (fetchError || !tokenData) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      await db.from('refresh_tokens').delete().eq('token', refreshToken);
      return res.status(401).json({ error: 'Refresh token expired. Please log in again.' });
    }

    const user = tokenData.users;
    const accessToken = signAccess(user);

    res.json({ token: accessToken });
  } catch (err) {
    console.error('Error refreshing token:', err);
    res.status(500).json({ error: 'Failed to refresh token.' });
  }
});

// ── POST /api/auth/logout ─────────────────────────────────
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.from('refresh_tokens').delete().eq('token', refreshToken);
    }
    res.json({ message: 'Logged out.' });
  } catch (err) {
    console.error('Error logging out:', err);
    res.status(500).json({ error: 'Failed to log out.' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: user, error } = await db
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json({ user });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// ── PUT /api/auth/me ──────────────────────────────────────
router.put('/me', authenticate, [
  body('name').optional().trim().notEmpty(),
  body('currentPassword').optional(),
  body('newPassword').optional().isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    // Fetch full user record (need password hash for comparison)
    const { data: userRows, error: fetchErr } = await db
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .limit(1);

    if (fetchErr || !userRows || userRows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const user = userRows[0];
    const updates = {};

    if (req.body.name) updates.name = req.body.name;

    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        return res.status(400).json({ error: 'Current password required to change password.' });
      }
      const match = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!match) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }
      updates.password = await bcrypt.hash(req.body.newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }

    const { data: updatedRows, error: updateErr } = await db
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, role');

    if (updateErr) throw updateErr;
    res.json({ message: 'Profile updated.', user: updatedRows[0] });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;