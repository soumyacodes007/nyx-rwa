import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

const init = (db) => {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS proof_jobs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      payload TEXT NOT NULL,
      result TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS watcher_state (
      name TEXT PRIMARY KEY,
      cursor TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      key TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      source_status TEXT NOT NULL,
      source_timestamp TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
};

export const openAppDatabase = (databasePath) => {
  mkdirSync(dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  init(db);
  return db;
};

export const getSnapshot = (db, key) => {
  const row = db
    .prepare("SELECT key, payload, source_status, source_timestamp, updated_at FROM snapshots WHERE key = ?")
    .get(key);

  if (!row) {
    return null;
  }

  return {
    key: row.key,
    payload: JSON.parse(row.payload),
    sourceStatus: row.source_status,
    sourceTimestamp: row.source_timestamp,
    updatedAt: row.updated_at
  };
};

export const upsertSnapshot = (db, key, payload, sourceStatus) => {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO snapshots (key, payload, source_status, source_timestamp, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      payload = excluded.payload,
      source_status = excluded.source_status,
      source_timestamp = excluded.source_timestamp,
      updated_at = excluded.updated_at
  `).run(key, JSON.stringify(payload), sourceStatus, now, now, now);
};

export const upsertWatcherCursor = (db, name, cursor) => {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO watcher_state (name, cursor, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      cursor = excluded.cursor,
      updated_at = excluded.updated_at
  `).run(name, cursor, now);
};

export const getWatcherCursor = (db, name) => {
  const row = db
    .prepare("SELECT cursor, updated_at FROM watcher_state WHERE name = ?")
    .get(name);

  return row
    ? {
        cursor: row.cursor,
        updatedAt: row.updated_at
      }
    : null;
};

