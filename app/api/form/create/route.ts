import { NextResponse } from "next/server";
import { createSession } from "@/lib/db";
import { generateAccessCode, generateMagicToken } from "@/lib/sessionUtils";

export async function POST() {
  try {
    const accessCode = generateAccessCode();
    const magicToken = generateMagicToken();
    const session = await createSession(accessCode, magicToken);

    return NextResponse.json({
      accessCode: session.access_code,
      magicToken: session.magic_token,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("Failed to create form session:", err);
    return NextResponse.json({ error: "Failed to create session." }, { status: 500 });
  }
}
