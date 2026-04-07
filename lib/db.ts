import { sql } from "@vercel/postgres";

export interface FormSession {
  id: string;
  access_code: string;
  magic_token: string;
  form_data: Record<string, string>;
  completed_parts: string[];
  created_at: string;
  updated_at: string;
}

export async function createSession(accessCode: string, magicToken: string): Promise<FormSession> {
  const result = await sql<FormSession>`
    INSERT INTO form_sessions (access_code, magic_token)
    VALUES (${accessCode}, ${magicToken})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getSessionByToken(token: string): Promise<FormSession | null> {
  const result = await sql<FormSession>`
    SELECT * FROM form_sessions WHERE magic_token = ${token}
  `;
  return result.rows[0] ?? null;
}

export async function getSessionByAccessCode(code: string): Promise<FormSession | null> {
  const result = await sql<FormSession>`
    SELECT * FROM form_sessions WHERE UPPER(access_code) = UPPER(${code})
  `;
  return result.rows[0] ?? null;
}

export async function saveFormData(
  token: string,
  formData: Record<string, string>,
  completedParts: string[]
): Promise<FormSession | null> {
  const result = await sql<FormSession>`
    UPDATE form_sessions
    SET
      form_data       = ${JSON.stringify(formData)}::jsonb,
      completed_parts = ${JSON.stringify(completedParts)}::jsonb,
      updated_at      = NOW()
    WHERE magic_token = ${token}
    RETURNING *
  `;
  return result.rows[0] ?? null;
}
