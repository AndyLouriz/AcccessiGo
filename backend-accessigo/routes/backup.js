// routes/backup.js — Data backup and export endpoints
import express from 'express';
const router = express.Router();
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  createDatabaseBackup,
  exportDataAsJSON,
  exportTableAsCSV,
  listBackups,
  deleteBackup,
  getDatabaseStats,
  cleanupOldBackups,
} from '../utils/backup.js';
import { logAudit } from '../utils/audit.js';

// All backup routes require admin authentication
router.use(authenticate, requireAdmin);

// ── GET /api/backup/stats ──────────────────────────────
// Get database statistics
router.get('/stats', (req, res) => {
  const stats = getDatabaseStats();
  res.json({ stats });
});

// ── POST /api/backup/create ────────────────────────────
// Create a new database backup
router.post('/create', (req, res) => {
  const result = createDatabaseBackup();

  if (result.success) {
    logAudit(req.user.id, 'create_backup', 'backup', null, null, {
      filename: result.filename,
      size: result.size,
    }, req);
  }

  res.json(result);
});

// ── GET /api/backup/list ──────────────────────────────
// List all available backups
router.get('/list', (req, res) => {
  const backups = listBackups();
  res.json({ backups, count: backups.length });
});

// ── DELETE /api/backup/:filename ──────────────────────
// Delete a specific backup
router.delete('/:filename', (req, res) => {
  const result = deleteBackup(req.params.filename);

  if (result.success) {
    logAudit(req.user.id, 'delete_backup', 'backup', null, { filename: req.params.filename }, null, req);
  }

  res.json(result);
});

// ── POST /api/backup/cleanup ──────────────────────────
// Cleanup old backups, keep only recent ones
router.post('/cleanup', (req, res) => {
  const { keepCount = 10 } = req.body;
  
  if (keepCount < 1 || keepCount > 100) {
    return res.status(400).json({ error: 'keepCount must be between 1 and 100' });
  }

  const result = cleanupOldBackups(keepCount);

  if (result.success) {
    logAudit(req.user.id, 'cleanup_backups', 'backup', null, null, {
      deleted: result.deleted,
      remaining: result.remaining,
    }, req);
  }

  res.json(result);
});

// ── GET /api/backup/export/json ────────────────────────
// Export data as JSON
router.get('/export/json', (req, res) => {
  const { dataType = 'all' } = req.query;
  
  const validTypes = ['all', 'locations', 'users', 'barriers', 'issues', 'logs', 'reports', 'ratings', 'checkins'];
  if (!validTypes.includes(dataType)) {
    return res.status(400).json({ error: 'Invalid dataType' });
  }

  const result = exportDataAsJSON(dataType);

  if (result.success) {
    logAudit(req.user.id, 'export_data', 'backup', null, null, { dataType }, req);
    
    // Return as downloadable JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="accessigo_export_${dataType}_${new Date().toISOString().split('T')[0]}.json"`);
    res.json(result.data);
  } else {
    res.status(500).json(result);
  }
});

// ── GET /api/backup/export/csv/:table ──────────────────
// Export a specific table as CSV
router.get('/export/csv/:table', (req, res) => {
  const { table } = req.params;
  
  const validTables = ['locations', 'users', 'barriers', 'issues', 'reports', 'audit_logs', 'ratings', 'checkins'];
  if (!validTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table name' });
  }

  try {
    const csv = exportTableAsCSV(table);

    logAudit(req.user.id, 'export_csv', 'backup', null, null, { table }, req);

    // Return as downloadable CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="accessigo_${table}_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/backup/schedule ──────────────────────────
// Schedule automatic daily backups (admin config)
router.post('/schedule', (req, res) => {
  const { enabled = true, time = '02:00', keepDays = 30 } = req.body;

  // This would typically update system config or a scheduler
  // For now, just confirm the settings
  logAudit(req.user.id, 'configure_backup_schedule', 'system_config', null, null, {
    enabled,
    time,
    keepDays,
  }, req);

  res.json({
    success: true,
    message: 'Backup schedule configured',
    config: { enabled, time, keepDays },
  });
});

export default router;
