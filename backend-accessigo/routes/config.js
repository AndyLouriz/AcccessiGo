// routes/config.js — System configuration management endpoints (Supabase)
import express from 'express';
const router = express.Router();
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { getConfig, setConfig, getAllConfigs, deleteConfig } from '../utils/config.js';
import { logAudit } from '../utils/audit.js';

// All config routes require admin/moderator authentication
router.use(authenticate, requireAdmin);

// ── GET /api/config ──────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const configs = await getAllConfigs();
    res.json({ configs });
  } catch (err) {
    console.error('Error fetching configs:', err);
    res.status(500).json({ error: 'Failed to fetch configurations.' });
  }
});

// ── GET /api/config/:key ─────────────────────────────────
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await getConfig(key);
    
    if (value === null) {
      return res.status(404).json({ error: 'Configuration key not found.' });
    }
    
    res.json({ key, value });
  } catch (err) {
    console.error('Error fetching config:', err);
    res.status(500).json({ error: 'Failed to fetch configuration.' });
  }
});

// ── PUT /api/config/:key ─────────────────────────────────
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, dataType = 'string' } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required.' });
    }

    if (!['string', 'boolean', 'integer', 'json'].includes(dataType)) {
      return res.status(400).json({ error: 'Invalid dataType.' });
    }

    const oldValue = await getConfig(key);
    const newValue = await setConfig(key, value, dataType, req.user.id);

    await logAudit(req.user.id, 'update_config', 'system_config', null, 
      { [key]: oldValue }, { [key]: newValue }, req);

    res.json({
      message: 'Configuration updated.',
      key,
      value: newValue,
    });
  } catch (err) {
    console.error('Error updating config:', err);
    res.status(500).json({ error: 'Failed to update configuration.' });
  }
});

// ── POST /api/config ─────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { key, value, dataType = 'string' } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required.' });
    }

    if (!['string', 'boolean', 'integer', 'json'].includes(dataType)) {
      return res.status(400).json({ error: 'Invalid dataType.' });
    }

    const existing = await getConfig(key);
    if (existing !== null) {
      return res.status(409).json({ error: 'Configuration key already exists. Use PUT to update.' });
    }

    const newValue = await setConfig(key, value, dataType, req.user.id);

    await logAudit(req.user.id, 'create_config', 'system_config', null, 
      null, { [key]: newValue }, req);

    res.status(201).json({
      message: 'Configuration created.',
      key,
      value: newValue,
    });
  } catch (err) {
    console.error('Error creating config:', err);
    res.status(500).json({ error: 'Failed to create configuration.' });
  }
});

// ── DELETE /api/config/:key ──────────────────────────────
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await getConfig(key);

    if (value === null) {
      return res.status(404).json({ error: 'Configuration key not found.' });
    }

    await deleteConfig(key);

    await logAudit(req.user.id, 'delete_config', 'system_config', null, 
      { [key]: value }, null, req);

    res.json({ message: 'Configuration deleted.' });
  } catch (err) {
    console.error('Error deleting config:', err);
    res.status(500).json({ error: 'Failed to delete configuration.' });
  }
});

export default router;
