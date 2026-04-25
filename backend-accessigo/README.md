# AccessiGo Backend — Barangay Sta. Rita

Full REST API backend for the **AccessiGo** accessibility mapping web app.

---

## Stack

| Layer       | Technology          |
|-------------|---------------------|
| Runtime     | Node.js 18+         |
| Framework   | Express 4           |
| Database    | SQLite (better-sqlite3) |
| Auth        | JWT + bcrypt        |
| Validation  | express-validator   |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# Edit .env and set a strong JWT_SECRET

# 3. Seed the database with the 28 locations + demo users
npm run seed

# 4. Start the server
npm start
# → http://localhost:3000
```

---

## Environment Variables (.env)

| Variable       | Default   | Description                        |
|----------------|-----------|------------------------------------|
| `PORT`         | `3000`    | Server port                        |
| `JWT_SECRET`   | *(none)*  | **Required.** Long random string   |
| `JWT_EXPIRES_IN` | `7d`   | Access token lifetime              |
| `NODE_ENV`     | `development` | Set to `production` in prod   |

---

## API Reference

### Auth — `/api/auth`

| Method | Path            | Auth | Description                  |
|--------|-----------------|------|------------------------------|
| POST   | `/register`     | —    | Create account               |
| POST   | `/login`        | —    | Login, get tokens            |
| POST   | `/refresh`      | —    | Exchange refresh → access token |
| POST   | `/logout`       | —    | Invalidate refresh token     |
| GET    | `/me`           | ✅   | Get current user profile     |
| PUT    | `/me`           | ✅   | Update name / password       |

**Register / Login response:**
```json
{
  "user":  { "id": 1, "name": "Juan", "email": "juan@email.com", "role": "user" },
  "token": "<jwt_access_token>",
  "refreshToken": "<refresh_token>"
}
```

---

### Locations — `/api/locations`

| Method | Path                  | Auth     | Description                         |
|--------|-----------------------|----------|-------------------------------------|
| GET    | `/`                   | Optional | List locations (filter, search, paginate) |
| GET    | `/:id`                | Optional | Get single location + ratings       |
| POST   | `/`                   | ✅       | Submit new location                 |
| PUT    | `/:id`                | ✅       | Update location (owner or admin)    |
| DELETE | `/:id`                | Admin    | Delete location                     |
| POST   | `/:id/rate`           | ✅       | Rate a location (1–5)               |
| POST   | `/:id/checkin`        | Optional | Record a check-in                   |

**Query Parameters (GET /locations):**

| Param    | Example          | Description                       |
|----------|------------------|-----------------------------------|
| `type`   | `?type=ramp`     | Filter by type                    |
| `q`      | `?q=barangay`    | Full-text search name/street/desc |
| `limit`  | `?limit=20`      | Pagination limit (default 100)    |
| `offset` | `?offset=20`     | Pagination offset                 |
| `status` | `?status=pending`| Admins only: filter by status     |

**Location Types:** `ramp` · `audio` · `elevator` · `service` · `park` · `danger`

---

### Stats — `/api/stats`

| Method | Path        | Auth | Description              |
|--------|-------------|------|--------------------------|
| GET    | `/api/stats`| —    | Aggregate counts & top-5 |

---

### Admin — `/api/admin`  *(admin/moderator only)*

| Method | Path                    | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/pending`              | List pending submissions   |
| POST   | `/approve/:id`          | Approve & publish          |
| POST   | `/reject/:id`           | Reject submission          |
| GET    | `/users`                | List all users             |
| PUT    | `/users/:id/role`       | Change user role           |
| GET    | `/reports`              | Activity log               |

---

## Database Schema

```
users           — id, name, email, password (bcrypt), role, created_at
locations       — id, name, type, street, description, rating, check_ins,
                  map_x, map_y, audio_cue, status, reported_by → users.id
ratings         — location_id, user_id, score (1-5)   [unique per user/loc]
checkins        — location_id, user_id, created_at
reports         — location_id, user_id, reporter, status
refresh_tokens  — user_id, token, expires_at
```

---

## Connecting the Frontend

1. Copy `public/script.js` → replace your original `script.js`
2. Make sure `index.html` and `styles.css` are also in the `public/` folder,  
   **or** keep them in their original location and set `API_BASE` at the top of `script.js`:

```js
// script.js — line 7
const API_BASE = 'http://localhost:3000/api';
```

3. Open `index.html` with Live Server (VS Code) or any local HTTP server.  
   The frontend will connect to the running Express backend.

---

## Demo Credentials (after `npm run seed`)

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@accessigo.ph     | admin1234  |
| User  | demo@accessigo.ph      | demo1234   |

---

## User Roles

| Role        | Permissions                                                     |
|-------------|-----------------------------------------------------------------|
| `user`      | View locations, submit new (pending review), rate, check in     |
| `moderator` | All user permissions + approve/reject pending, edit any location |
| `admin`     | All moderator permissions + manage users, delete locations       |

---

## Production Deployment

```bash
# Set strong secrets
NODE_ENV=production
JWT_SECRET=<64-char random string>

# Use a process manager
npm install -g pm2
pm2 start server.js --name accessigo

# Optionally put Nginx in front as a reverse proxy
```

For production, consider replacing SQLite with PostgreSQL via `pg` or `prisma`.
