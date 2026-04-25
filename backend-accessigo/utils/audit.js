// utils/audit.js — Audit logging helper for accountability tracking (Supabase)
import db from '../db.js';

/**
 * Log an audit trail entry for any admin action (async)
 */
export async function logAudit(userId, action, entityType, entityId = null, oldValue = null, newValue = null, req = null) {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress) : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    await db
      .from('audit_logs')
      .insert([{
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_value: oldValue ? oldValue : null,
        new_value: newValue ? newValue : null,
        ip_address: ipAddress,
        user_agent: userAgent,
      }]);
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

/**
 * Retrieve audit logs with optional filtering (async)
 */
export async function getAuditLogs(filters = {}) {
  try {
    const { action, entityType, entityId, userId, startDate, endDate, limit = 100, offset = 0 } = filters;

    let query = db
      .from('audit_logs')
      .select('*, users(name, email)', { count: 'exact' });

    if (action) query = query.eq('action', action);
    if (entityType) query = query.eq('entity_type', entityType);
    if (entityId) query = query.eq('entity_id', entityId);
    if (userId) query = query.eq('user_id', userId);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;
    return data || [];
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return [];
  }
}

/**
 * Get total count of audit logs (async)
 */
export async function getAuditLogCount(filters = {}) {
  try {
    const { action, entityType, entityId, userId, startDate, endDate } = filters;

    let query = db
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });

    if (action) query = query.eq('action', action);
    if (entityType) query = query.eq('entity_type', entityType);
    if (entityId) query = query.eq('entity_id', entityId);
    if (userId) query = query.eq('user_id', userId);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { count, error } = await query;
    return count || 0;
  } catch (err) {
    console.error('Error counting audit logs:', err);
    return 0;
  }
}

/**
 * Clear old audit logs (async)
 */
export async function pruneOldAuditLogs(daysToKeep = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const iso = cutoffDate.toISOString();

    const { error } = await db
      .from('audit_logs')
      .delete()
      .lt('created_at', iso);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error pruning audit logs:', err);
    return false;
  }
}

export default { logAudit, getAuditLogs, getAuditLogCount, pruneOldAuditLogs };
