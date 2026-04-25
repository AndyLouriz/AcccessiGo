// routes/stats.js — Public statistics endpoint (Supabase)
import express from 'express';
const router = express.Router();
import db from '../db.js';

// ── GET /api/stats ────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // Total active locations
    const { count: totalLocations } = await db
      .from('locations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Total contributors
    const { data: contributors } = await db
      .from('locations')
      .select('reported_by')
      .eq('status', 'active')
      .neq('reported_by', null);
    
    const totalContributors = new Set(contributors?.map(c => c.reported_by) || []).size;

    // Audio guides
    const { count: totalAudioGuides } = await db
      .from('locations')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'audio')
      .eq('status', 'active');

    // Safe routes (ramps + elevators + parks with rating >= 3)
    const { count: totalRoutes } = await db
      .from('locations')
      .select('*', { count: 'exact', head: true })
      .in('type', ['ramp', 'elevator', 'park'])
      .eq('status', 'active')
      .gte('rating', 3);

    // By type
    const { data: byTypeData } = await db
      .from('locations')
      .select('type')
      .eq('status', 'active');
    
    const byType = {};
    byTypeData?.forEach(loc => {
      byType[loc.type] = (byType[loc.type] || 0) + 1;
    });

    // Recent locations
    const { data: recentLocations } = await db
      .from('locations')
      .select('id, name, type, street, rating, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);

    // Top rated
    const { data: topRated } = await db
      .from('locations')
      .select('id, name, type, street, rating, check_ins')
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .order('check_ins', { ascending: false })
      .limit(5);

    // Barrier analytics
    const { count: totalBarriers } = await db
      .from('barriers')
      .select('*', { count: 'exact', head: true });

    const { data: issuesData, count: totalIssues } = await db
      .from('accessibility_issues')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'closed');

    // High-risk locations
    const { data: allLocations } = await db
      .from('locations')
      .select('id, name, street, status');

    const { data: allBarriers } = await db
      .from('barriers')
      .select('location_id');

    const { data: allIssues } = await db
      .from('accessibility_issues')
      .select('location_id')
      .neq('status', 'closed');

    const barriersByLoc = {};
    const issuesByLoc = {};
    
    allBarriers?.forEach(b => {
      barriersByLoc[b.location_id] = (barriersByLoc[b.location_id] || 0) + 1;
    });
    
    allIssues?.forEach(i => {
      issuesByLoc[i.location_id] = (issuesByLoc[i.location_id] || 0) + 1;
    });

    const highRiskLocations = (allLocations || [])
      .filter(l => l.status === 'active')
      .map(l => ({
        id: l.id,
        name: l.name,
        street: l.street,
        barrier_count: barriersByLoc[l.id] || 0,
        issue_count: issuesByLoc[l.id] || 0,
      }))
      .filter(l => (l.barrier_count + l.issue_count) > 0)
      .sort((a, b) => (b.barrier_count + b.issue_count) - (a.barrier_count + a.issue_count))
      .slice(0, 10);

    // Barriers by severity
    const { data: severityData } = await db
      .from('barriers')
      .select('severity');
    
    const barriersBySeverity = {};
    ['low', 'medium', 'high', 'critical'].forEach(s => barriersBySeverity[s] = 0);
    severityData?.forEach(b => {
      if (barriersBySeverity[b.severity] !== undefined) {
        barriersBySeverity[b.severity]++;
      }
    });

    // Top issues
    const { data: topIssues } = await db
      .from('accessibility_issues')
      .select('id, issue_type, location_id, priority, upvotes, status')
      .neq('status', 'closed')
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      totalLocations: totalLocations || 0,
      totalContributors,
      totalAudioGuides: totalAudioGuides || 0,
      totalRoutes: totalRoutes || 0,
      byType,
      recentLocations: recentLocations || [],
      topRated: topRated || [],
      barriers: {
        totalBarriers: totalBarriers || 0,
        totalOpenIssues: totalIssues || 0,
        bySeverity: barriersBySeverity,
        highRiskLocations,
        topOpenIssues: topIssues || [],
      },
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
});

export default router;
