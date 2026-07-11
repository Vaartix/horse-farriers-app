// src/db/schema.ts
// SQLite CREATE TABLE statements for all entities.

export const DATABASE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT,
    phone TEXT,
    full_name TEXT NOT NULL,
    preferred_units TEXT NOT NULL DEFAULT 'imperial' CHECK(preferred_units IN ('imperial', 'metric')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES teams(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    role TEXT NOT NULL DEFAULT 'employee' CHECK(role IN ('owner', 'employee')),
    visible_barn_ids TEXT,
    can_edit_records INTEGER NOT NULL DEFAULT 1,
    can_view_invoices INTEGER NOT NULL DEFAULT 0,
    can_create_invoices INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS barns (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES teams(id),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS owners (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL REFERENCES teams(id),
    barn_id TEXT NOT NULL REFERENCES barns(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS horses (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES owners(id),
    barn_id TEXT NOT NULL REFERENCES barns(id),
    name TEXT NOT NULL,
    breed TEXT,
    date_of_birth TEXT,
    color TEXT,
    discipline TEXT,
    behavioral_flags TEXT NOT NULL DEFAULT '{"kicks":false,"bites":false,"pullsBack":false,"needsSedation":false,"difficultToCatch":false,"customWarning":null}',
    photo_uri TEXT,
    shoeing_cycle_weeks INTEGER NOT NULL DEFAULT 6,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS shoeing_sessions (
    id TEXT PRIMARY KEY,
    horse_id TEXT NOT NULL REFERENCES horses(id),
    farrier_id TEXT NOT NULL REFERENCES users(id),
    session_date TEXT NOT NULL,
    general_notes TEXT,
    vet_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('synced', 'pending', 'conflict'))
  );

  CREATE TABLE IF NOT EXISTS hoof_records (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES shoeing_sessions(id),
    position TEXT NOT NULL CHECK(position IN ('LF', 'RF', 'LH', 'RH')),
    toe_length REAL,
    heel_angle REAL,
    sole_depth REAL,
    shoe_type TEXT,
    shoe_size TEXT,
    shoe_material TEXT,
    pad_type TEXT,
    packing_type TEXT,
    nail_type TEXT,
    nail_size TEXT,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hoof_photos (
    id TEXT PRIMARY KEY,
    hoof_record_id TEXT NOT NULL REFERENCES hoof_records(id),
    local_uri TEXT NOT NULL,
    cloud_uri TEXT,
    photo_type TEXT NOT NULL CHECK(photo_type IN ('before', 'after', 'xray', 'other')),
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK(operation IN ('insert', 'update', 'delete')),
    payload TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'failed')),
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_error TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_horses_name ON horses(name);
  CREATE INDEX IF NOT EXISTS idx_horses_owner_id ON horses(owner_id);
  CREATE INDEX IF NOT EXISTS idx_barns_team_id ON barns(team_id);
  CREATE INDEX IF NOT EXISTS idx_owners_barn_id ON owners(barn_id);
  CREATE INDEX IF NOT EXISTS idx_shoeing_sessions_horse_id ON shoeing_sessions(horse_id);
  CREATE INDEX IF NOT EXISTS idx_shoeing_sessions_date ON shoeing_sessions(session_date);
  CREATE INDEX IF NOT EXISTS idx_hoof_records_session_id ON hoof_records(session_id);
  CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
  CREATE INDEX IF NOT EXISTS idx_sync_queue_lookup ON sync_queue(table_name, record_id);
`;
