// server.js — AccessiGo Express API Server
import dotenv from 'dotenv';
dotenv.config();

import express, { json, urlencoded, static as expressStatic } from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

import authRoutes from './routes/auth.js';
import locationRoutes from './routes/locations.js';
import statsRoutes from './routes/stats.js';
import adminRoutes from './routes/admin.js';
import configRoutes from './routes/config.js';
import barriersRoutes from './routes/barriers.js';
import backupRoutes from './routes/backup.js';
import { initializeDefaults } from './utils/config.js';

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5500',     // Live Server (VS Code)
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  'file://',                   // Opening index.html directly
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g., curl, mobile apps, file://)
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      return cb(null, true);
    }
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ──────────────────────────────────────────
app.use(json());
app.use(urlencoded({ extended: true }));

// ── Static frontend (optional — serves the HTML if same server) ──
app.use(expressStatic(join(__dirname, 'public')));

// ── Request logger (dev) ──────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`  ${req.method.padEnd(6)} ${req.path}`);
    next();
  });
}

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/stats',     statsRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/config',    configRoutes);
app.use('/api/barriers',  barriersRoutes);
app.use('/api/backup',    backupRoutes);

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status:  'ok',
    app:     'AccessiGo API',
    version: '1.0.0',
    ts:      new Date().toISOString(),
  });
});

// ── 404 handler ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ── Global error handler ──────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────
const server = app.listen(PORT, async () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   AccessiGo API — Barangay Sta. Rita     ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`\n  🚀  Server running at  http://localhost:${PORT}`);
  console.log(`  📍  Health check:      http://localhost:${PORT}/api/health`);
  console.log(`  🗄️   Database:         Supabase`);
  console.log(`  🌱  Run seed:          npm run seed\n`);
  
  // Initialize default system configurations (non-blocking)
  try {
    await initializeDefaults();
  } catch (error) {
    console.warn('⚠️  Config initialization skipped:', error.message);
  }
});

// Handle uncaught errors to keep server running
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
