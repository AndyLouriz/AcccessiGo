// utils/backup.js — Database backup and export utilities
import db from '../db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Create a full database backup
 * @returns {object} Backup info {filename, size, timestamp}
 */
export function createDatabaseBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilename = `accessigo_${timestamp}.db`;
  const backupPath = path.join(BACKUP_DIR, backupFilename);

  try {
    const dbPath = path.join(__dirname, '..', 'accessigo.db');
    fs.copyFileSync(dbPath, backupPath);

    const stats = fs.statSync(backupPath);
    return {
      success: true,
      filename: backupFilename,
      path: backupPath,
      size: stats.size,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Export data as JSON
 * @param {string} dataType - Type of data to export (all, locations, users, barriers, issues, logs)
 * @returns {object} Exported data
 */
export function exportDataAsJSON(dataType = 'all') {
  const exportData = {};
  const timestamp = new Date().toISOString();

  try {
    if (['all', 'locations'].includes(dataType)) {
      exportData.locations = db.prepare(
        'SELECT * FROM locations ORDER BY created_at DESC'
      ).all();
    }

    if (['all', 'users'].includes(dataType)) {
      exportData.users = db.prepare(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
      ).all();
    }

    if (['all', 'ratings'].includes(dataType)) {
      exportData.ratings = db.prepare(
        'SELECT * FROM ratings ORDER BY created_at DESC'
      ).all();
    }

    if (['all', 'barriers'].includes(dataType)) {
      exportData.barriers = db.prepare(
        'SELECT * FROM barriers ORDER BY created_at DESC'
      ).all();
    }

    if (['all', 'issues'].includes(dataType)) {
      exportData.issues = db.prepare(
        'SELECT * FROM accessibility_issues ORDER BY created_at DESC'
      ).all();
    }

    if (['all', 'reports'].includes(dataType)) {
      exportData.reports = db.prepare(
        'SELECT * FROM reports ORDER BY created_at DESC'
      ).all();
    }

    if (['all', 'logs'].includes(dataType)) {
      exportData.auditLogs = db.prepare(
        'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10000'
      ).all();
    }

    if (['all', 'checkins'].includes(dataType)) {
      exportData.checkins = db.prepare(
        'SELECT * FROM checkins ORDER BY created_at DESC'
      ).all();
    }

    return {
      success: true,
      timestamp,
      dataType,
      data: exportData,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Export data as CSV format
 * @param {string} table - Table name to export
 * @returns {string} CSV data
 */
export function exportTableAsCSV(table) {
  const validTables = ['locations', 'users', 'barriers', 'issues', 'reports', 'audit_logs', 'ratings', 'checkins'];
  
  if (!validTables.includes(table)) {
    throw new Error(`Invalid table: ${table}`);
  }

  try {
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    
    if (rows.length === 0) {
      return '';
    }

    // Get headers from first row
    const headers = Object.keys(rows[0]);
    const csvLines = [headers.join(',')];

    // Add data rows
    rows.forEach(row => {
      const values = headers.map(h => {
        let val = row[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') {
          // Escape quotes and wrap in quotes if contains comma
          val = val.replace(/"/g, '""');
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            return `"${val}"`;
          }
          return val;
        }
        return String(val);
      });
      csvLines.push(values.join(','));
    });

    return csvLines.join('\n');
  } catch (err) {
    throw new Error(`CSV export error: ${err.message}`);
  }
}

/**
 * Get list of available backups
 * @returns {array} List of backup files
 */
export function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
      .filter(f => f.endsWith('.db'))
      .map(filename => {
        const filePath = path.join(BACKUP_DIR, filename);
        const stats = fs.statSync(filePath);
        return {
          filename,
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    return backups;
  } catch (err) {
    return [];
  }
}

/**
 * Delete an old backup file
 * @param {string} filename - Backup filename to delete
 */
export function deleteBackup(filename) {
  try {
    // Validate filename to prevent directory traversal
    if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
      throw new Error('Invalid filename');
    }

    const filePath = path.join(BACKUP_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Backup file not found');
    }

    fs.unlinkSync(filePath);
    return { success: true, message: 'Backup deleted' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Get database statistics for backup/recovery planning
 * @returns {object} Database stats
 */
export function getDatabaseStats() {
  try {
    const stats = {};

    const tables = [
      'locations', 'users', 'ratings', 'barriers', 
      'accessibility_issues', 'reports', 'checkins', 'audit_logs'
    ];

    tables.forEach(table => {
      const count = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get().c;
      const size = db.prepare(
        `SELECT SUM(pgsize) as size FROM dbstat WHERE name='${table}'`
      ).all(); // Note: dbstat may not be available without PRAGMA
      
      stats[table] = { count };
    });

    // Approximate database file size
    const dbPath = path.join(__dirname, '..', 'accessigo.db');
    if (fs.existsSync(dbPath)) {
      stats.databaseSize = fs.statSync(dbPath).size;
    }

    return stats;
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Cleanup old backups (keep only last N backups)
 * @param {number} keepCount - Number of recent backups to keep
 */
export function cleanupOldBackups(keepCount = 10) {
  try {
    const backups = listBackups();
    
    if (backups.length > keepCount) {
      const toDelete = backups.slice(keepCount);
      toDelete.forEach(backup => {
        deleteBackup(backup.filename);
      });
      
      return {
        success: true,
        deleted: toDelete.length,
        remaining: backups.slice(0, keepCount).length,
      };
    }

    return {
      success: true,
      deleted: 0,
      remaining: backups.length,
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export default {
  createDatabaseBackup,
  exportDataAsJSON,
  exportTableAsCSV,
  listBackups,
  deleteBackup,
  getDatabaseStats,
  cleanupOldBackups,
};
