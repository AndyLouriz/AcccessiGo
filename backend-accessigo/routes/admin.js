// routes/admin.js — Admin-only moderation endpoints (Supabase)
import express from 'express';
const router = express.Router();
import db from '../db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { logAudit, getAuditLogs, getAuditLogCount } from '../utils/audit.js';

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ── GET /api/admin/pending ────────────────────────────────
router.get('/pending', async (req, res) => {
  try {
    const { data: pending, error } = await db
      .from('locations')
      .select('*, users(name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ count: pending?.length || 0, locations: pending || [] });
  } catch (err) {
    console.error('Error fetching pending locations:', err);
    res.status(500).json({ error: 'Failed to fetch pending locations.' });
  }
});

// ── POST /api/admin/approve/:id ───────────────────────────
router.post('/approve/:id', async (req, res) => {
  try {
    const { data: loc, error: fetchError } = await db
      .from('locations')
      .select('id, status')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !loc) return res.status(404).json({ error: 'Location not found.' });

    const oldStatus = loc.status;

    await db
      .from('locations')
      .update({ status: 'active' })
      .eq('id', loc.id);

    await db
      .from('reports')
      .update({ status: 'approved' })
      .eq('location_id', loc.id)
      .eq('status', 'pending');

    // Log audit trail
    await logAudit(req.user.id, 'approve_location', 'locations', loc.id, 
      { status: oldStatus }, { status: 'active' }, req);

    res.json({ message: 'Location approved and published.' });
  } catch (err) {
    console.error('Error approving location:', err);
    res.status(500).json({ error: 'Failed to approve location.' });
  }
});

// ── POST /api/admin/reject/:id ────────────────────────────
router.post('/reject/:id', async (req, res) => {
  try {
    const { data: loc, error: fetchError } = await db
      .from('locations')
      .select('id, status')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !loc) return res.status(404).json({ error: 'Location not found.' });

    const oldStatus = loc.status;

    await db
      .from('locations')
      .update({ status: 'archived' })
      .eq('id', loc.id);

    await db
      .from('reports')
      .update({ status: 'rejected' })
      .eq('location_id', loc.id)
      .eq('status', 'pending');

    // Log audit trail
    await logAudit(req.user.id, 'reject_location', 'locations', loc.id, 
      { status: oldStatus }, { status: 'archived' }, req);

    res.json({ message: 'Submission rejected.' });
  } catch (err) {
    console.error('Error rejecting location:', err);
    res.status(500).json({ error: 'Failed to reject location.' });
  }
});

// ── GET /api/admin/users ──────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { data: users, error } = await db
      .from('users')
      .select('id, name, email, role, created_at');

    if (error) throw error;

    // Get contribution counts
    const userIds = users?.map(u => u.id) || [];
    let contributions = {};

    if (userIds.length > 0) {
      const { data: contribData } = await db
        .from('locations')
        .select('reported_by')
        .in('reported_by', userIds);

      contributions = {};
      users.forEach(u => contributions[u.id] = 0);
      contribData?.forEach(loc => {
        if (contributions[loc.reported_by] !== undefined) {
          contributions[loc.reported_by]++;
        }
      });
    }

    const usersWithContrib = users?.map(u => ({
      ...u,
      contributions: contributions[u.id] || 0
    })) || [];

    res.json({ count: usersWithContrib.length, users: usersWithContrib });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// ── PUT /api/admin/users/:id/role ─────────────────────────
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }

    const { data: user, error: fetchError } = await db
      .from('users')
      .select('id, role')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !user) return res.status(404).json({ error: 'User not found.' });

    const oldRole = user.role;

    await db
      .from('users')
      .update({ role })
      .eq('id', user.id);

    // Log audit trail
    await logAudit(req.user.id, 'update_user_role', 'users', user.id, 
      { role: oldRole }, { role }, req);

    res.json({ message: `User role updated to ${role}.` });
  } catch (err) {
    console.error('Error updating user role:', err);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

// ── GET /api/admin/reports ────────────────────────────────
router.get('/reports', async (req, res) => {
  try {
    const { data: reports, error } = await db
      .from('reports')
      .select('*, locations(name), users(name)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    res.json({ reports: reports || [] });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports.' });
  }
});

// ── GET /api/admin/audit-logs ─────────────────────────────
router.get('/audit-logs', async (req, res) => {
  try {
    const { action, entityType, entityId, userId, startDate, endDate, limit = 100, offset = 0 } = req.query;

    let query = db
      .from('audit_logs')
      .select('*', { count: 'exact' });

    if (action) query = query.eq('action', action);
    if (entityType) query = query.eq('entity_type', entityType);
    if (entityId) query = query.eq('entity_id', parseInt(entityId));
    if (userId) query = query.eq('user_id', parseInt(userId));
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    query = query.order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Math.min(Number(limit), 500) - 1);

    const { data: logs, error, count } = await query;

    if (error) throw error;
    res.json({ total: count, count: logs?.length || 0, logs: logs || [] });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

// ── GET /api/admin/audit-logs/:entityType/:entityId ────────
router.get('/audit-logs/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const { data: logs, error } = await db
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', parseInt(entityId))
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;
    res.json({ logs: logs || [] });
  } catch (err) {
    console.error('Error fetching entity audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

export default router;
