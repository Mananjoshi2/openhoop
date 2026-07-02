import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';
import { scrapeAndSeed, seedFallback } from './scrape.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// Serve built frontend in production
if (isProd) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
}

// ── Auto-seed on cold start ──────────────────────────────────────────────────
const count = db.prepare('SELECT COUNT(*) as c FROM courts').get();
// Always seed curated courts (INSERT OR IGNORE skips existing rows)
seedFallback();
if (count.c === 0) {
  console.log('[init] Empty DB — also fetching from Overpass…');
  scrapeAndSeed();
}

// ── Courts ───────────────────────────────────────────────────────────────────

app.get('/api/courts', (req, res) => {
  const { q, status } = req.query;
  let sql = 'SELECT * FROM courts WHERE 1=1';
  const params = [];
  if (q) { sql += ' AND (LOWER(name) LIKE ? OR LOWER(address) LIKE ?)'; params.push(`%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`); }
  if (status && status !== 'all') { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY name ASC';
  res.json(db.prepare(sql).all(...params));
});

app.get('/api/courts/:id', (req, res) => {
  const court = db.prepare('SELECT * FROM courts WHERE id = ?').get(req.params.id);
  if (!court) return res.status(404).json({ error: 'Not found' });
  const checkins = db.prepare(
    "SELECT player_alias, checked_in_at FROM checkins WHERE court_id = ? AND checked_in_at > datetime('now', '-4 hours') ORDER BY checked_in_at DESC LIMIT 20"
  ).all(court.id);
  res.json({ ...court, checkins });
});

app.post('/api/courts', (req, res) => {
  const { name, address, lat, lng, hoops = 2, surface = 'concrete', lights = 0, added_by = 'community' } = req.body;
  if (!name || !lat || !lng) return res.status(400).json({ error: 'name, lat, and lng are required' });
  const result = db.prepare(
    'INSERT INTO courts (name, address, lat, lng, hoops, surface, lights, added_by, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(name, address || '', lat, lng, hoops, surface, lights ? 1 : 0, added_by, 'user');
  const court = db.prepare('SELECT * FROM courts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(court);
});

// ── Check-in / Check-out ─────────────────────────────────────────────────────

app.post('/api/courts/:id/checkin', (req, res) => {
  const { alias = 'Anonymous' } = req.body;
  const court = db.prepare('SELECT * FROM courts WHERE id = ?').get(req.params.id);
  if (!court) return res.status(404).json({ error: 'Not found' });

  db.prepare('INSERT INTO checkins (court_id, player_alias) VALUES (?, ?)').run(court.id, alias);

  const playerCount = court.players + 1;
  const status = playerCount >= 10 ? 'full' : playerCount >= 3 ? 'some' : 'free';
  db.prepare('UPDATE courts SET players = ?, status = ? WHERE id = ?').run(playerCount, status, court.id);

  res.json({ players: playerCount, status });
});

app.post('/api/courts/:id/checkout', (req, res) => {
  const court = db.prepare('SELECT * FROM courts WHERE id = ?').get(req.params.id);
  if (!court) return res.status(404).json({ error: 'Not found' });

  const playerCount = Math.max(0, court.players - 1);
  const status = playerCount >= 10 ? 'full' : playerCount >= 3 ? 'some' : 'free';
  db.prepare('UPDATE courts SET players = ?, status = ? WHERE id = ?').run(playerCount, status, court.id);

  res.json({ players: playerCount, status });
});

// ── Stats ────────────────────────────────────────────────────────────────────

app.get('/api/stats', (req, res) => {
  const total   = db.prepare("SELECT COUNT(*) as c FROM courts").get().c;
  const active  = db.prepare("SELECT COUNT(*) as c FROM courts WHERE status = 'full'").get().c;
  const some    = db.prepare("SELECT COUNT(*) as c FROM courts WHERE status = 'some'").get().c;
  const free    = db.prepare("SELECT COUNT(*) as c FROM courts WHERE status = 'free'").get().c;
  const players = db.prepare("SELECT COALESCE(SUM(players), 0) as c FROM courts").get().c;
  const user_added = db.prepare("SELECT COUNT(*) as c FROM courts WHERE source = 'user'").get().c;
  res.json({ total, active, some, free, players, user_added });
});

// ── Admin: re-scrape ─────────────────────────────────────────────────────────

app.post('/api/scrape', async (_req, res) => {
  const added = await scrapeAndSeed();
  res.json({ added });
});

// SPA fallback — serve index.html for any non-API route in production
if (isProd) {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => console.log(`[OpenHoop] API running at http://localhost:${PORT}`));
