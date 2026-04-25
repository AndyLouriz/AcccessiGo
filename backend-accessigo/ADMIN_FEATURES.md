# AccessiGo Admin Features Implementation Guide

## Overview
This document describes the newly implemented administrative and system features for AccessiGo, including the admin dashboard, audit logging, barrier tracking, system configuration, and data backup.

---

## 1. Admin Dashboard

### Access
- **URL**: `http://localhost:3000/admin.html` (or `file:///.../admin.html`)
- **Requirements**: Must be logged in as an admin or moderator

### Features

#### Dashboard View
- **Statistics**: Overview of active locations, pending reviews, contributors, audio guides
- **Recent Reports**: Latest accessibility location submissions
- **Top Locations**: Highest rated accessibility locations

#### Pending Reports
- Review submitted locations waiting for approval
- Filter by keyword or sort by date
- **Approve**: Marks location as active and published
- **Reject**: Archives the location and rejection reports

#### Users & Roles
- View all users with their email, role, and contribution count
- Filter by role (user, moderator, admin)
- **Change Role**: Update user permissions and responsibilities
- Contribution tracking shows how many locations each user has reported

#### Audit Logs
- Complete accountability trail of all admin actions
- Filter by:
  - Action type (approve, reject, role updates, config changes)
  - Entity type (locations, users, reports, configurations)
  - Date range
  - User
- View detailed change history (old vs new values)
- Track IP address and user agent for security

#### System Configuration
- Manage accessible parameters without code changes
- Available configurations:
  - `app.name`, `app.version`
  - `map.center_lat`, `map.center_lng`, `map.zoom_default`
  - `audio.enabled`, `audio.language`
  - `reports.auto_approve_count`, `reports.auto_archive_days`
  - `security.audit_retention_days`, `security.max_login_attempts`
  - `maintenance.allow_registrations`
- Supports multiple data types: string, boolean, integer, JSON

---

## 2. Audit Trail Logging (4.2)

### What Gets Logged
Every admin action is automatically logged:
- Location approvals and rejections
- User role updates
- Configuration changes
- Barrier reports
- Issue status updates

### Audit Log Data
Each entry contains:
- **Timestamp**: When the action occurred
- **User**: Who performed the action (ID, name, email)
- **Action**: What was done (approve_location, update_user_role, etc.)
- **Entity**: What was affected (locations, users, reports, system_config)
- **Old Value**: Previous state (JSON)
- **New Value**: Updated state (JSON)
- **IP Address**: Source IP for security tracking
- **User Agent**: Browser/client information

### API Endpoints
```
GET /api/admin/audit-logs
  Query params:
    - action: approve_location | reject_location | update_user_role | update_config
    - entityType: locations | users | reports | system_config
    - entityId: specific entity ID
    - userId: specific user ID
    - startDate: ISO date
    - endDate: ISO date
    - limit: max results (default 100)
    - offset: pagination

GET /api/admin/audit-logs/:entityType/:entityId
  View full history for a specific entity
```

---

## 3. Barrier & Accessibility Issues Tracking (3.2, 3.3)

### Barriers
Represent physical or structural accessibility obstacles:
- **Types**: ramp_damage, poor_signage, no_access, stairs_only, narrow_passage, etc.
- **Severity Levels**: low, medium, high, critical
- **Tracked by**: User ID, verification status, report count

### Accessibility Issues
Community-reported problems that need resolution:
- **Priority**: low, medium, high, urgent
- **Status**: open, in_progress, resolved, closed
- **Community Validation**: Users can upvote to validate issues
- **Automatic Detection**: System identifies high-risk areas based on barrier count

### High-Risk Locations
The system automatically identifies locations with:
- Multiple barriers
- Critical severity barriers
- Unresolved accessibility issues
- High issue priority/upvotes

### API Endpoints
```
GET /api/barriers/high-risk
  Returns top locations with accessibility barriers

GET /api/barriers/location/:locationId
  Get all barriers for a specific location

POST /api/barriers
  Report a new barrier
  Body: { location_id, barrier_type, description, severity }

GET /api/barriers/issues
  List accessibility issues with filtering
  Query: location_id, status, priority, limit, offset

POST /api/barriers/issues
  Report an accessibility issue
  Body: { location_id, issue_type, description, priority }

PUT /api/barriers/issues/:id/status
  Update issue status (admin/moderator only)
  Body: { status: "open|in_progress|resolved|closed" }

POST /api/barriers/issues/:id/vote
  Community voting on issues
  Body: { upvote: true | false }

GET /api/barriers/analytics
  Get barrier and issue trends and statistics
```

### Statistics Included in `/api/stats`
```json
{
  "barriers": {
    "totalBarriers": 25,
    "totalOpenIssues": 12,
    "bySeverity": [
      { "severity": "critical", "count": 3 },
      { "severity": "high", "count": 8 }
    ],
    "highRiskLocations": [
      { "id": 5, "name": "...", "barrier_count": 5, "issue_count": 3 }
    ],
    "topOpenIssues": [...]
  }
}
```

---

## 4. System Configuration (4.3)

### Purpose
Allows administrators to manage system parameters without code changes or redeploy.

### Default Configurations
```
App Settings:
  - app.name: "AccessiGo"
  - app.version: "1.0.0"

Map Settings:
  - map.center_lat: "14.3520"
  - map.center_lng: "121.0068"
  - map.zoom_default: "13"

Audio Settings:
  - audio.enabled: true
  - audio.language: "en"

Report Settings:
  - reports.auto_approve_count: 3
  - reports.auto_archive_days: 90

Security Settings:
  - security.audit_retention_days: 365
  - security.max_login_attempts: 5

Maintenance:
  - maintenance.allow_registrations: true
```

### API Endpoints
```
GET /api/config
  Retrieve all configurations

GET /api/config/:key
  Get a specific configuration
  Returns: { key: "...", value: "..." }

PUT /api/config/:key
  Update a configuration
  Body: { value: "...", dataType: "string|boolean|integer|json" }

POST /api/config
  Create a new configuration
  Body: { key: "...", value: "...", dataType: "string|boolean|integer|json" }

DELETE /api/config/:key
  Delete a configuration
```

### Configuration Types
- **string**: Text values
- **boolean**: true/false (stored as "1"/"0")
- **integer**: Numeric values
- **json**: Complex objects stored as JSON strings

### Audit Trail
All configuration changes are automatically logged with before/after values.

---

## 5. Data Backup & Export (4.4)

### Backup Features
- **Automatic Creation**: Create database snapshots on demand
- **Retention Policy**: Keep only recent backups based on count
- **Format**: SQLite database files (compatible with original)
- **Location**: `./backups/` folder

### Export Formats

#### JSON Export
- Export entire database or specific tables
- Includes all relational data
- Suitable for archival or migration

```
GET /api/backup/export/json?dataType=all|locations|users|barriers|issues|logs
```

#### CSV Export
- Export specific tables as CSV
- Spreadsheet-compatible format
- Suitable for reporting and external analysis

```
GET /api/backup/export/csv/locations
GET /api/backup/export/csv/users
GET /api/backup/export/csv/barriers
GET /api/backup/export/csv/issues
GET /api/backup/export/csv/audit_logs
```

### API Endpoints

#### Backup Management
```
POST /api/backup/create
  Create a new database backup
  Returns: { filename, size, timestamp }

GET /api/backup/list
  List all available backups
  Returns: Array of backup files with metadata

DELETE /api/backup/:filename
  Delete a specific backup file

POST /api/backup/cleanup
  Remove old backups, keep only recent ones
  Body: { keepCount: 10 }

GET /api/backup/stats
  Get database statistics
  Returns table counts and database size
```

#### Data Export
```
GET /api/backup/export/json?dataType=all
  Export as JSON
  Query: dataType = all|locations|users|barriers|issues|logs|reports|ratings|checkins

GET /api/backup/export/csv/:table
  Export as CSV
  Params: table = locations|users|barriers|issues|reports|audit_logs|ratings|checkins

POST /api/backup/schedule
  Configure automatic backup scheduling
  Body: { enabled: true, time: "02:00", keepDays: 30 }
```

### Backup Naming Convention
```
accessigo_YYYY-MM-DDTHH-MM-SS.db
Example: accessigo_2026-04-16T14-30-45.db
```

### Recovery Procedure
1. Stop the AccessiGo server
2. Navigate to `./backups/` folder
3. Copy desired backup file to parent directory
4. Rename to `accessigo.db`
5. Restart server

### Database Statistics
Available via `GET /api/backup/stats`:
```json
{
  "locations": { "count": 28 },
  "users": { "count": 150 },
  "barriers": { "count": 45 },
  "accessibility_issues": { "count": 23 },
  "audit_logs": { "count": 2000 },
  "databaseSize": 2097152
}
```

---

## Security Considerations

### Authentication
- All admin features require JWT authentication
- Must have admin or moderator role
- Token includes user ID, email, and role

### Authorization
- Role-based access control (RBAC)
- Admins: Full access
- Moderators: Approve/reject locations, manage issues
- Users: Submit locations and issues

### Audit Trail
- All changes logged with user, IP, and timestamp
- Cannot be modified (append-only)
- Retention based on configuration

### Data Protection
- Passwords hashed with bcryptjs
- Database file permissions restricted
- Backups stored separately from main DB

---

## Usage Examples

### Approve a Pending Location
```bash
curl -X POST http://localhost:3000/api/admin/approve/15 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Get Audit Logs for a User
```bash
curl http://localhost:3000/api/admin/audit-logs?userId=5&limit=50 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Update System Configuration
```bash
curl -X PUT http://localhost:3000/api/config/map.zoom_default \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value": "15", "dataType": "integer"}'
```

### Create a Database Backup
```bash
curl -X POST http://localhost:3000/api/backup/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Export Locations as CSV
```bash
curl http://localhost:3000/api/backup/export/csv/locations \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -o locations.csv
```

---

## Database Tables

### audit_logs
```sql
CREATE TABLE audit_logs (
  id          INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   INTEGER,
  old_value   TEXT,
  new_value   TEXT,
  ip_address  TEXT,
  user_agent  TEXT,
  created_at  TEXT NOT NULL
);
```

### system_config
```sql
CREATE TABLE system_config (
  id         INTEGER PRIMARY KEY,
  key        TEXT NOT NULL UNIQUE,
  value      TEXT NOT NULL,
  data_type  TEXT,
  updated_by INTEGER REFERENCES users(id),
  updated_at TEXT NOT NULL
);
```

### barriers
```sql
CREATE TABLE barriers (
  id          INTEGER PRIMARY KEY,
  location_id INTEGER NOT NULL REFERENCES locations(id),
  user_id     INTEGER REFERENCES users(id),
  barrier_type TEXT NOT NULL,
  description TEXT,
  severity    TEXT NOT NULL,
  verified    BOOLEAN NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
```

### accessibility_issues
```sql
CREATE TABLE accessibility_issues (
  id          INTEGER PRIMARY KEY,
  location_id INTEGER NOT NULL REFERENCES locations(id),
  user_id     INTEGER NOT NULL REFERENCES users(id),
  issue_type  TEXT NOT NULL,
  description TEXT,
  priority    TEXT NOT NULL,
  status      TEXT NOT NULL,
  upvotes     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
```

### issue_votes
```sql
CREATE TABLE issue_votes (
  id        INTEGER PRIMARY KEY,
  issue_id  INTEGER NOT NULL REFERENCES accessibility_issues(id),
  user_id   INTEGER NOT NULL REFERENCES users(id),
  upvote    BOOLEAN NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(issue_id, user_id)
);
```

---

## Next Steps

### Recommended Enhancements
1. Implement scheduled automatic backups
2. Add email notifications for critical issues
3. Create admin reporting dashboard
4. Implement data anonymization for exports
5. Add two-factor authentication for admins
6. Create mobile admin app
7. Implement real-time notifications
8. Add advanced filtering and search
9. Create role-based dashboard views
10. Implement data retention policies

---

## Support & Troubleshooting

### Common Issues

**Backups not created**
- Check `./backups/` directory exists
- Verify database file permissions
- Check disk space availability

**Audit logs not showing**
- Verify user has admin role
- Check authentication token
- Ensure database migrations ran

**Configuration changes not applying**
- Restart application to reload config
- Verify data type matches expected format
- Check audit logs for change history

**Export failures**
- Check table name spelling
- Verify user has admin role
- Ensure sufficient disk space

---

## Configuration Properties Reference

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| app.name | string | "AccessiGo" | Application name |
| app.version | string | "1.0.0" | Application version |
| map.center_lat | string | "14.3520" | Default map latitude |
| map.center_lng | string | "121.0068" | Default map longitude |
| map.zoom_default | integer | 13 | Default map zoom level |
| audio.enabled | boolean | true | Enable audio navigation |
| audio.language | string | "en" | Audio language code |
| reports.auto_approve_count | integer | 3 | Auto-approve after N confirmations |
| reports.auto_archive_days | integer | 90 | Archive unreviewed after days |
| security.audit_retention_days | integer | 365 | Keep audit logs for days |
| security.max_login_attempts | integer | 5 | Failed login attempt limit |
| maintenance.allow_registrations | boolean | true | Allow new user registrations |
