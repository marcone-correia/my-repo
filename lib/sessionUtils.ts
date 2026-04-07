import { randomUUID, randomBytes } from "crypto";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/I/1 to avoid confusion

export function generateAccessCode(): string {
  const bytes = randomBytes(4);
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += CHARS[bytes[i] % CHARS.length];
  }
  return `TL-${code}`;
}

export function generateMagicToken(): string {
  return randomUUID();
}
