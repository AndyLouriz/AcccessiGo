// routes/barriers.js — Accessibility barriers and issues tracking (Supabase)
import express from 'express';
const router = express.Router();
import { body, validationResult } from 'express-validator';
import db from '../db.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { logAudit } from '../utils/audit.js';

// ── GET /api/barriers/high-risk ────────────────────────
router.get('/high-risk', optionalAuth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const { data: locations, error: locError } = await db
      .from('locations')
      .select('*')
      .eq('status', 'active')
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (locError) throw locError;

    const { data: barriers } = await db.from('barriers').select('location_id, severity');

    const barriersByLoc = {};
    barriers?.forEach(b => {
      if (!barriersByLoc[b.location_id]) {
        barriersByLoc[b.location_id] = [];
      }
      barriersByLoc[b.location_id].push(b);
    });

    const { count: total } = await db
      .from('locations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const highRisk = (locations || [])
      .filter(l => barriersByLoc[l.id])
      .map(l => ({
        ...l,
        barrier_count: barriersByLoc[l.id].length,
        avg_severity: barriersByLoc[l.id].length > 0 
          ? barriersByLoc[l.id].reduce((sum, b) => sum + (b.severity === 'critical' ? 4 : b.severity === 'high' ? 3 : b.severity === 'medium' ? 2 : 1), 0) / barriersByLoc[l.id].length
          : 0
      }))
      .sort((a, b) => b.barrier_count - a.barrier_count || b.avg_severity - a.avg_severity);

    res.json({ total, count: highRisk.length, locations: highRisk });
  } catch (err) {
    console.error('Error fetching high-risk locations:', err);
    res.status(500).json({ error: 'Failed to fetch locations.' });
  }
});

// ── GET /api/barriers/location/:locationId ────────────
router.get('/location/:locationId', optionalAuth, async (req, res) => {
  try {
    const { data: barriers, error } = await db
      .from('barriers')
      .select('*, users(name)')
      .eq('location_id', req.params.locationId)
      .order('severity', { ascending: false })
      .order('report_count', { ascending: false });

    if (error) throw error;
    res.json({ barriers: barriers || [] });
  } catch (err) {
    console.error('Error fetching barriers:', err);
    res.status(500).json({ error: 'Failed to fetch barriers.' });
  }
});

// ── POST /api/barriers ──────────────────────────────────
router.post('/', authenticate, [
  body('location_id').isInt().withMessage('Location ID is required.'),
  body('barrier_type').trim().notEmpty().withMessage('Barrier type is required.'),
  body('description').optional().trim(),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { location_id, barrier_type, description, severity } = req.body;

    const { data: loc, error: locError } = await db
      .from('locations')
      .select('id')
      .eq('id', location_id)
      .single();

    if (locError || !loc) return res.status(404).json({ error: 'Location not found.' });

    const { data: barrier, error: insertError } = await db
      .from('barriers')
      .insert([{
        location_id,
        user_id: req.user.id,
        barrier_type,
        description: description || '',
        severity: severity || 'medium',
      }])
      .select();

    if (insertError) throw insertError;

    await logAudit(req.user.id, 'create_barrier', 'barriers', barrier[0].id, null, {
      location_id,
      barrier_type,
      severity: severity || 'medium'
    }, req);

    res.status(201).json({
      message: 'Barrier reported.',
      barrier_id: barrier[0].id,
    });
  } catch (err) {
    console.error('Error creating barrier:', err);
    res.status(500).json({ error: 'Failed to report barrier.' });
  }
});

// ── GET /api/barriers/issues ───────────────────────────
router.get('/issues', optionalAuth, async (req, res) => {
  try {
    const { location_id, status, priority, limit = 100, offset = 0 } = req.query;

    let query = db
      .from('accessibility_issues')
      .select('*, users(name), locations(name)', { count: 'exact' });

    if (location_id) query = query.eq('location_id', parseInt(location_id));
    if (status && ['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      query = query.eq('status', status);
    }
    if (priority && ['low', 'medium', 'high', 'urgent'].includes(priority)) {
      query = query.eq('priority', priority);
    }

    query = query
      .order('priority', { ascending: false })
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data: issues, error, count } = await query;

    if (error) throw error;
    res.json({ total: count, count: issues?.length || 0, issues: issues || [] });
  } catch (err) {
    console.error('Error fetching issues:', err);
    res.status(500).json({ error: 'Failed to fetch issues.' });
  }
});

// ── POST /api/barriers/issues ───────────────────────────
router.post('/issues', authenticate, [
  body('location_id').isInt().withMessage('Location ID is required.'),
  body('issue_type').trim().notEmpty().withMessage('Issue type is required.'),
  body('description').trim().notEmpty().withMessage('Description is required.'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { location_id, issue_type, description, priority } = req.body;

    const { data: loc, error: locError } = await db
      .from('locations')
      .select('id')
      .eq('id', location_id)
      .single();

    if (locError || !loc) return res.status(404).json({ error: 'Location not found.' });

    const { data: issue, error: insertError } = await db
      .from('accessibility_issues')
      .insert([{
        location_id,
        user_id: req.user.id,
        issue_type,
        description,
        priority: priority || 'medium',
      }])
      .select();

    if (insertError) throw insertError;

    await logAudit(req.user.id, 'create_issue', 'accessibility_issues', issue[0].id, null, {
      issue_type,
      priority: priority || 'medium'
    }, req);

    res.status(201).json({
      message: 'Issue reported.',
      issue_id: issue[0].id,
    });
  } catch (err) {
    console.error('Error creating issue:', err);
    res.status(500).json({ error: 'Failed to report issue.' });
  }
});

// ── PUT /api/barriers/issues/:id/status ────────────────
router.put('/issues/:id/status', authenticate, [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status.'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { status } = req.body;
    
    const { data: issue, error: fetchError } = await db
      .from('accessibility_issues')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !issue) return res.status(404).json({ error: 'Issue not found.' });

    if (req.user.role !== 'admin' && req.user.role !== 'moderator' && req.user.id !== issue.user_id) {
      return res.status(403).json({ error: 'Permission denied.' });
    }

    await db
      .from('accessibility_issues')
      .update({ status })
      .eq('id', issue.id);

    await logAudit(req.user.id, 'update_issue_status', 'accessibility_issues', issue.id,
      { status: issue.status }, { status }, req);

    res.json({ message: 'Issue status updated.', status });
  } catch (err) {
    console.error('Error updating issue status:', err);
    res.status(500).json({ error: 'Failed to update issue.' });
  }
});

// ── POST /api/barriers/issues/:id/vote ──────────────────
router.post('/issues/:id/vote', authenticate, [
  body('upvote').isBoolean().withMessage('Upvote must be boolean.'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { upvote } = req.body;
    
    const { data: issue, error: fetchError } = await db
      .from('accessibility_issues')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !issue) return res.status(404).json({ error: 'Issue not found.' });

    // Upsert vote
    await db
      .from('issue_votes')
      .upsert({
        issue_id: issue.id,
        user_id: req.user.id,
        upvote,
      }, { onConflict: 'issue_id,user_id' });

    // Recalculate upvotes
    const { data: votes } = await db
      .from('issue_votes')
      .select('*')
      .eq('issue_id', issue.id)
      .eq('upvote', true);

    const upvotes = votes?.length || 0;

    await db
      .from('accessibility_issues')
      .update({ upvotes })
      .eq('id', issue.id);

    res.json({ message: 'Vote recorded.', upvotes });
  } catch (err) {
    console.error('Error voting on issue:', err);
    res.status(500).json({ error: 'Failed to record vote.' });
  }
});

// ── GET /api/barriers/analytics ────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    // Severity distribution
    const { data: barrierData } = await db.from('barriers').select('severity');
    const bySeverity = {};
    ['low', 'medium', 'high', 'critical'].forEach(s => bySeverity[s] = 0);
    barrierData?.forEach(b => {
      if (bySeverity[b.severity] !== undefined) bySeverity[b.severity]++;
    });

    // Top barrier types
    const { data: typeData } = await db.from('barriers').select('barrier_type');
    const typeCount = {};
    typeData?.forEach(b => {
      typeCount[b.barrier_type] = (typeCount[b.barrier_type] || 0) + 1;
    });
    const topBarriers = Object.entries(typeCount)
      .map(([type, count]) => ({ barrier_type: type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Most problematic locations
    const { data: allBarriers } = await db.from('barriers').select('location_id');
    const { data: allIssues } = await db.from('accessibility_issues').select('location_id');
    const { data: activeLocations } = await db.from('locations').select('id, name, street').eq('status', 'active');

    const barriersByLoc = {};
    const issuesByLoc = {};
    allBarriers?.forEach(b => barriersByLoc[b.location_id] = (barriersByLoc[b.location_id] || 0) + 1);
    allIssues?.forEach(i => issuesByLoc[i.location_id] = (issuesByLoc[i.location_id] || 0) + 1);

    const topProblematicLocations = (activeLocations || [])
      .map(l => ({
        id: l.id,
        name: l.name,
        street: l.street,
        barrier_count: barriersByLoc[l.id] || 0,
        issue_count: issuesByLoc[l.id] || 0,
      }))
      .filter(l => l.barrier_count > 0 || l.issue_count > 0)
      .sort((a, b) => (b.barrier_count + b.issue_count) - (a.barrier_count + a.issue_count))
      .slice(0, 10);

    // Issue status distribution
    const { data: issueStatusData } = await db.from('accessibility_issues').select('status');
    const issuesByStatus = {};
    ['open', 'in_progress', 'resolved', 'closed'].forEach(s => issuesByStatus[s] = 0);
    issueStatusData?.forEach(i => {
      if (issuesByStatus[i.status] !== undefined) issuesByStatus[i.status]++;
    });

    // Priority distribution
    const { data: issuePriorityData } = await db.from('accessibility_issues').select('priority');
    const byPriority = {};
    ['low', 'medium', 'high', 'urgent'].forEach(p => byPriority[p] = 0);
    issuePriorityData?.forEach(i => {
      if (byPriority[i.priority] !== undefined) byPriority[i.priority]++;
    });

    res.json({
      barriers: {
        bySeverity,
        topTypes: topBarriers,
      },
      issues: {
        byStatus: issuesByStatus,
        byPriority,
        topProblematicLocations,
      },
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

export default router;
