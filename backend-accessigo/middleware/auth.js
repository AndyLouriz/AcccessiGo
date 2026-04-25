// middleware/auth.js — JWT verification middleware
import jwt from 'jsonwebtoken';
import db from '../db.js';

// Helper to wrap async middleware
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error('Middleware error:', err);
      next(err);
    });
  };
}

/**
 * Verify JWT from Authorization: Bearer <token>
 * Attaches req.user = { id, name, email, role } on success.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const token = header.slice(7);
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[AUTH] Verifying token for user ${payload.id}`);
    
    // Verify user still exists in DB (using Supabase)
    // Note: NOT using .single() to avoid throwing errors on empty results
    const { data: users, error } = await db
      .from('users')
      .select('id, name, email, role')
      .eq('id', payload.id)
      .limit(1);
    
    if (error) {
      console.error('[AUTH] Database error:', error);
      return res.status(401).json({ error: 'Authentication failed.' });
    }
    
    if (!users || users.length === 0) {
      console.warn(`[AUTH] User ID ${payload.id} not found in database`);
      return res.status(401).json({ error: 'User not found.' });
    }
    
    const user = users[0];
    console.log(`[AUTH] User ${user.email} authenticated successfully`);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      console.warn('[AUTH] Token expired');
      return res.status(401).json({ error: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    console.error('[AUTH] Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid token.' });
  }
});

/**
 * Same as authenticate but doesn't block unauthenticated requests —
 * just attaches req.user if a valid token is present.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { data: users, error } = await db
      .from('users')
      .select('id, name, email, role')
      .eq('id', payload.id)
      .limit(1);
    
    if (!error && users && users.length > 0) {
      req.user = users[0];
      console.log(`[OPTIONAL_AUTH] User ${users[0].email} attached to request`);
    }
  } catch (err) {
    // Ignore token/DB errors in optional auth
    console.warn('[OPTIONAL_AUTH] Error attaching user:', err.message);
  }
  next();
});

/** Require admin or moderator role. Must be used after authenticate(). */
function requireAdmin(req, res, next) {
  if (!req.user || !['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

export { authenticate, optionalAuth, requireAdmin };

