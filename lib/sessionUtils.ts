import { v4 as uuidv4 } from "crypto";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/I/1 to avoid confusion

export function generateAccessCode(): string {
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return `TL-${code}`;
}

export function generateMagicToken(): string {
  // Use crypto.randomUUID in Node 14.17+
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}
