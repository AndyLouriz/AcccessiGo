// routes/locations.js — Accessibility Location CRUD + Ratings + Check-ins (Supabase)
import express from 'express';
const router = express.Router();
import { body, query, validationResult } from 'express-validator';
import db from '../db.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';

// ── Helpers ───────────────────────────────────────────────
const VALID_TYPES   = ['ramp', 'audio', 'elevator', 'service', 'park', 'danger'];
const VALID_STATUSES = ['active', 'pending', 'archived'];

async function recalcRating(locationId) {
  try {
    const { data: result, error } = await db
      .from('ratings')
      .select('score')
      .eq('location_id', locationId);
    
    if (error || !result || result.length === 0) return;
    
    const avg = result.reduce((sum, r) => sum + r.score, 0) / result.length;
    const rounded = Math.round(avg * 10) / 10;
    
    await db
      .from('locations')
      .update({ rating: rounded })
      .eq('id', locationId);
  } catch (err) {
    console.error('Error recalculating rating:', err);
  }
}

// ── GET /api/locations ────────────────────────────────────
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { type, status, q, limit = 100, offset = 0 } = req.query;
    
    let query = db.from('locations').select('*, users(name)', { count: 'exact' });

    if (type && VALID_TYPES.includes(type)) {
      query = query.eq('type', type);
    }

    // Non-admins only see active locations
    const showStatus = (req.user && ['admin','moderator'].includes(req.user.role))
      ? (status && VALID_STATUSES.includes(status) ? status : null)
      : 'active';
    
    if (showStatus) {
      query = query.eq('status', showStatus);
    }

    if (q) {
      query = query.or(`name.ilike.%${q}%,street.ilike.%${q}%,description.ilike.%${q}%`);
    }

    query = query.order('check_ins', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data: locations, error, count } = await query;

    if (error) throw error;

    res.json({ total: count, locations: locations || [] });
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: 'Failed to fetch locations.' });
  }
});

// ── GET /api/locations/:id ────────────────────────────────
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { data: loc, error: locError } = await db
      .from('locations')
      .select('*, users(name)')
      .eq('id', req.params.id)
      .single();

    if (locError || !loc) return res.status(404).json({ error: 'Location not found.' });
    
    if (loc.status !== 'active' && !(req.user && ['admin','moderator'].includes(req.user.role))) {
      return res.status(404).json({ error: 'Location not found.' });
    }

    // Get rating distribution
    const { data: ratings, error: ratingError } = await db
      .from('ratings')
      .select('score')
      .eq('location_id', loc.id);

    const ratingDist = {};
    [1,2,3,4,5].forEach(s => ratingDist[s] = 0);
    if (ratings) {
      ratings.forEach(r => ratingDist[r.score]++);
    }

    // User's own rating
    let userRating = null;
    if (req.user) {
      const { data: userRate } = await db
        .from('ratings')
        .select('score')
        .eq('location_id', loc.id)
        .eq('user_id', req.user.id)
        .single();
      userRating = userRate ? userRate.score : null;
    }

    res.json({ location: { ...loc, ratingDist, userRating } });
  } catch (err) {
    console.error('Error fetching location:', err);
    res.status(500).json({ error: 'Failed to fetch location.' });
  }
});

// ── POST /api/locations ───────────────────────────────────
router.post('/', authenticate, [
  body('name').trim().notEmpty().withMessage('Location name is required.'),
  body('type').isIn(VALID_TYPES).withMessage(`Type must be one of: ${VALID_TYPES.join(', ')}`),
  body('street').trim().notEmpty().withMessage('Street/landmark is required.'),
  body('description').optional().trim(),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('audio_cue').optional().trim(),
  body('map_x').optional().trim(),
  body('map_y').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { name, type, street, description, rating = 3, audio_cue, map_x = '50%', map_y = '50%' } = req.body;
    const status = ['admin', 'moderator'].includes(req.user.role) ? 'active' : 'pending';

    const { data: locationData, error: locError } = await db
      .from('locations')
      .insert([{
        name,
        type,
        street,
        description: description || '',
        rating,
        audio_cue: audio_cue || '',
        map_x,
        map_y,
        status,
        reported_by: req.user.id,
      }])
      .select();

    if (locError) throw locError;
    const location = locationData[0];

    // Create report record
    await db
      .from('reports')
      .insert([{
        location_id: location.id,
        user_id: req.user.id,
        status: status === 'active' ? 'approved' : 'pending',
      }]);

    res.status(201).json({
      message: status === 'active'
        ? 'Location published.'
        : 'Location submitted for review. Thank you!',
      location,
    });
  } catch (err) {
    console.error('Error creating location:', err);
    res.status(500).json({ error: 'Failed to create location.' });
  }
});

// ── PUT /api/locations/:id ────────────────────────────────
router.put('/:id', authenticate, [
  body('name').optional().trim().notEmpty(),
  body('type').optional().isIn(VALID_TYPES),
  body('street').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('audio_cue').optional().trim(),
  body('map_x').optional().trim(),
  body('map_y').optional().trim(),
  body('status').optional().isIn(VALID_STATUSES),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { data: loc, error: fetchError } = await db
      .from('locations')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !loc) return res.status(404).json({ error: 'Location not found.' });

    const isAdmin = ['admin', 'moderator'].includes(req.user.role);
    const isOwner = loc.reported_by === req.user.id;
    if (!isAdmin && !isOwner) return res.status(403).json({ error: 'Not authorised.' });

    const allowedFields = ['name', 'type', 'street', 'description', 'audio_cue', 'map_x', 'map_y'];
    if (isAdmin) allowedFields.push('status', 'rating');

    const updates = {};
    for (const f of allowedFields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update.' });
    }
    
    updates.updated_at = new Date().toISOString();

    const { data: updated, error: updateError } = await db
      .from('locations')
      .update(updates)
      .eq('id', loc.id)
      .select();

    if (updateError) throw updateError;

    res.json({ message: 'Location updated.', location: updated[0] });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ error: 'Failed to update location.' });
  }
});

// ── DELETE /api/locations/:id ─────────────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: loc, error: fetchError } = await db
      .from('locations')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !loc) return res.status(404).json({ error: 'Location not found.' });

    await db.from('locations').delete().eq('id', loc.id);

    res.json({ message: 'Location deleted.' });
  } catch (err) {
    console.error('Error deleting location:', err);
    res.status(500).json({ error: 'Failed to delete location.' });
  }
});

// ── POST /api/locations/:id/rate ──────────────────────────
router.post('/:id/rate', authenticate, [
  body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be 1–5.'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { data: loc, error: locError } = await db
      .from('locations')
      .select('id')
      .eq('id', req.params.id)
      .eq('status', 'active')
      .single();

    if (locError || !loc) return res.status(404).json({ error: 'Location not found.' });

    // Upsert rating
    await db
      .from('ratings')
      .upsert({
        location_id: loc.id,
        user_id: req.user.id,
        score: req.body.score,
      }, { onConflict: 'location_id,user_id' });

    await recalcRating(loc.id);

    const { data: updated } = await db
      .from('locations')
      .select('rating')
      .eq('id', loc.id)
      .single();

    res.json({ 
      message: 'Rating saved.', 
      newRating: updated?.rating, 
      yourScore: req.body.score 
    });
  } catch (err) {
    console.error('Error rating location:', err);
    res.status(500).json({ error: 'Failed to save rating.' });
  }
});

// ── POST /api/locations/:id/checkin ──────────────────────
router.post('/:id/checkin', optionalAuth, async (req, res) => {
  try {
    const { data: loc, error: locError } = await db
      .from('locations')
      .select('id, check_ins')
      .eq('id', req.params.id)
      .eq('status', 'active')
      .single();

    if (locError || !loc) return res.status(404).json({ error: 'Location not found.' });

    await db
      .from('checkins')
      .insert([{
        location_id: loc.id,
        user_id: req.user ? req.user.id : null,
      }]);

    const { data: updated } = await db
      .from('locations')
      .update({ check_ins: loc.check_ins + 1 })
      .eq('id', loc.id)
      .select('check_ins');

    res.json({ 
      message: 'Checked in!', 
      checkIns: updated?.[0]?.check_ins || loc.check_ins + 1 
    });
  } catch (err) {
    console.error('Error checking in:', err);
    res.status(500).json({ error: 'Failed to check in.' });
  }
});

export default router;
