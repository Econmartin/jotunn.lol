-- Jotunn snapshot store
-- Run: npm run worker:db:migrate         (local dev, creates ./worker/.wrangler/...)
-- Run: npm run worker:db:migrate:remote  (production D1)

CREATE TABLE IF NOT EXISTS snapshots (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  ts             INTEGER NOT NULL,          -- Unix ms
  fuel           INTEGER,                   -- raw fuel units from Network Node dynamic field
  solar_system_id INTEGER                   -- from Location Registry dynamic fields
);

CREATE INDEX IF NOT EXISTS idx_snapshots_ts ON snapshots (ts DESC);
