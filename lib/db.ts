import { sql } from "@vercel/postgres";

export interface DocumentEntry {
  url: string;
  filename: string;
  uploadedAt: string;
  flagged: boolean;
}

export interface FormSession {
  id: string;
  access_code: string;
  magic_token: string;
  form_data: Record<string, string>;
  completed_parts: string[];
  intake_answers: Record<string, string> | null;
  documents: Record<string, DocumentEntry> | null;
  last_review: Record<string, unknown> | null;
  last_review_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function createSession(
  accessCode: string,
  magicToken: string,
  intakeAnswers?: Record<string, string>
): Promise<FormSession> {
  const result = await sql<FormSession>`
    INSERT INTO form_sessions (access_code, magic_token, intake_answers)
    VALUES (${accessCode}, ${magicToken}, ${JSON.stringify(intakeAnswers ?? {})}::jsonb)
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

export async function saveIntakeAnswers(
  token: string,
  answers: Record<string, string>
): Promise<FormSession | null> {
  const result = await sql<FormSession>`
    UPDATE form_sessions
    SET intake_answers = ${JSON.stringify(answers)}::jsonb, updated_at = NOW()
    WHERE magic_token = ${token}
    RETURNING *
  `;
  return result.rows[0] ?? null;
}

export async function saveDocuments(
  token: string,
  documents: Record<string, DocumentEntry>
): Promise<FormSession | null> {
  const result = await sql<FormSession>`
    UPDATE form_sessions
    SET documents = ${JSON.stringify(documents)}::jsonb, updated_at = NOW()
    WHERE magic_token = ${token}
    RETURNING *
  `;
  return result.rows[0] ?? null;
}

export async function saveLastReview(
  token: string,
  report: Record<string, unknown>
): Promise<FormSession | null> {
  const result = await sql<FormSession>`
    UPDATE form_sessions
    SET last_review = ${JSON.stringify(report)}::jsonb, last_review_at = NOW(), updated_at = NOW()
    WHERE magic_token = ${token}
    RETURNING *
  `;
  return result.rows[0] ?? null;
}

export async function flagDocuments(
  token: string,
  flaggedKeys: string[]
): Promise<void> {
  const session = await getSessionByToken(token);
  if (!session?.documents) return;
  const updated: Record<string, DocumentEntry> = {};
  for (const [key, entry] of Object.entries(session.documents)) {
    updated[key] = { ...entry, flagged: flaggedKeys.includes(key) };
  }
  await saveDocuments(token, updated);
}

export async function deleteSession(token: string): Promise<void> {
  await sql`DELETE FROM form_sessions WHERE magic_token = ${token}`;
}
