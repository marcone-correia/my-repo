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

    return NextResponse.json({ ok: true, message: "Database table created successfully." });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
