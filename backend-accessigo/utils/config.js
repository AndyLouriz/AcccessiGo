// utils/config.js — System configuration management (Supabase)
import db from '../db.js';

/**
 * Get a configuration value (async)
 * @param {string} key - Config key
 * @param {any} defaultValue - Default value if not found
 * @returns {Promise<any>} Configuration value
 */
export async function getConfig(key, defaultValue = null) {
  try {
    const { data: rows, error } = await db
      .from('system_config')
      .select('value, data_type')
      .eq('key', key)
      .limit(1);
    
    if (error || !rows || rows.length === 0) return defaultValue;

    const data = rows[0];
    try {
      switch (data.data_type) {
        case 'boolean':
          return data.value === 'true' || data.value === '1';
        case 'integer':
          return parseInt(data.value, 10);
        case 'json':
          return JSON.parse(data.value);
        default:
          return data.value;
      }
    } catch (err) {
      console.error(`Config parse error for key "${key}":`, err.message);
      return defaultValue;
    }
  } catch (error) {
    console.error(`Config fetch error for key "${key}":`, error.message);
    return defaultValue;
  }
}

/**
 * Set a configuration value (async)
 * @param {string} key - Config key
 * @param {any} value - Config value
 * @param {string} dataType - Data type (string, boolean, integer, json)
 * @param {number} userId - ID of user making the change
 */
export async function setConfig(key, value, dataType = 'string', userId = null) {
  let stringValue = value;
  
  if (dataType === 'json') {
    stringValue = typeof value === 'string' ? value : JSON.stringify(value);
  } else if (dataType === 'boolean') {
    stringValue = value ? '1' : '0';
  } else {
    stringValue = String(value);
  }

  try {
    const { data: existing } = await db
      .from('system_config')
      .select('id')
      .eq('key', key)
      .single();

    if (existing) {
      await db
        .from('system_config')
        .update({ value: stringValue, data_type: dataType, updated_by: userId })
        .eq('key', key);
    } else {
      await db
        .from('system_config')
        .insert([{ key, value: stringValue, data_type: dataType, updated_by: userId }]);
    }

    return await getConfig(key);
  } catch (error) {
    console.error(`Config set error for key "${key}":`, error.message);
    return null;
  }
}

/**
 * Get all configuration values (async)
 * @returns {Promise<object>} All config values as key-value pairs
 */
export async function getAllConfigs() {
  try {
    const { data: rows, error } = await db
      .from('system_config')
      .select('key, value, data_type');
    
    if (error || !rows) return {};

    const result = {};
    for (const row of rows) {
      result[row.key] = await getConfig(row.key);
    }

    return result;
  } catch (error) {
    console.error('Error fetching all configs:', error.message);
    return {};
  }
}

/**
 * Delete a configuration value (async)
 * @param {string} key - Config key
 */
export async function deleteConfig(key) {
  try {
    await db
      .from('system_config')
      .delete()
      .eq('key', key);
  } catch (error) {
    console.error(`Config delete error for key "${key}":`, error.message);
  }
}

/**
 * Initialize default system configurations (async)
 */
export async function initializeDefaults() {
  const defaults = {
    'app.name': { value: 'AccessiGo', type: 'string' },
    'app.version': { value: '1.0.0', type: 'string' },
    'map.center_lat': { value: '14.3520', type: 'string' },
    'map.center_lng': { value: '121.0068', type: 'string' },
    'map.zoom_default': { value: '13', type: 'integer' },
    'audio.enabled': { value: 'true', type: 'boolean' },
    'audio.language': { value: 'en', type: 'string' },
    'reports.auto_approve_count': { value: '3', type: 'integer' },
    'reports.auto_archive_days': { value: '90', type: 'integer' },
    'security.audit_retention_days': { value: '365', type: 'integer' },
    'security.max_login_attempts': { value: '5', type: 'integer' },
    'maintenance.allow_registrations': { value: 'true', type: 'boolean' },
  };

  for (const [key, { value, type }] of Object.entries(defaults)) {
    try {
      // Use limit(1) instead of .single() to avoid throwing on no results
      const { data: rows, error: checkError } = await db
        .from('system_config')
        .select('id')
        .eq('key', key)
        .limit(1);
      
      // If no rows found and no error, insert the default
      if ((!rows || rows.length === 0) && !checkError) {
        await db
          .from('system_config')
          .insert([{ key, value, data_type: type }]);
      }
    } catch (error) {
      // Silently skip if system_config table doesn't exist yet
      // This happens before schema.sql is run in Supabase
      if (error.message && (error.message.includes('relation') || error.message.includes('doesn\'t exist'))) {
        console.warn('⚠️  system_config table not found. Run schema.sql in Supabase first.');
        return;
      }
      console.warn(`⚠️  Could not initialize config key "${key}":`, error.message);
    }
  }
}

export default { getConfig, setConfig, getAllConfigs, deleteConfig, initializeDefaults };
