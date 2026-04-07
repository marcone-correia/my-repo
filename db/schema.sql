CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS form_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code      TEXT UNIQUE NOT NULL,
  magic_token      TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  form_data        JSONB NOT NULL DEFAULT '{}',
  completed_parts  JSONB NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_sessions_access_code ON form_sessions(access_code);
CREATE INDEX IF NOT EXISTS idx_form_sessions_magic_token ON form_sessions(magic_token);
