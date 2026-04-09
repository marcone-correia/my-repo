import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS form_sessions (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        access_code      TEXT UNIQUE NOT NULL,
        magic_token      TEXT UNIQUE NOT NULL,
        form_data        JSONB NOT NULL DEFAULT '{}',
        completed_parts  JSONB NOT NULL DEFAULT '[]',
        created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_form_sessions_access_code ON form_sessions(access_code)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_form_sessions_magic_token ON form_sessions(magic_token)`;

    // Migration: add new columns if they don't exist
    await sql`ALTER TABLE form_sessions ADD COLUMN IF NOT EXISTS intake_answers JSONB NOT NULL DEFAULT '{}'`;
    await sql`ALTER TABLE form_sessions ADD COLUMN IF NOT EXISTS documents JSONB NOT NULL DEFAULT '{}'`;
    await sql`ALTER TABLE form_sessions ADD COLUMN IF NOT EXISTS last_review JSONB`;
    await sql`ALTER TABLE form_sessions ADD COLUMN IF NOT EXISTS last_review_at TIMESTAMPTZ`;

    return NextResponse.json({ ok: true, message: "Database table ready with all columns." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
