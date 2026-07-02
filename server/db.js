import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'courts.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS courts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    osm_id TEXT UNIQUE,
    name TEXT NOT NULL,
    address TEXT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    hoops INTEGER DEFAULT 2,
    surface TEXT DEFAULT 'concrete',
    lights INTEGER DEFAULT 0,
    status TEXT DEFAULT 'free',
    players INTEGER DEFAULT 0,
    added_by TEXT DEFAULT 'community',
    source TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    court_id INTEGER NOT NULL,
    player_alias TEXT NOT NULL DEFAULT 'Anonymous',
    checked_in_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (court_id) REFERENCES courts(id)
  );
`);

export default db;
