import { NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/db";
import { generateAccessCode, generateMagicToken } from "@/lib/sessionUtils";

export async function POST(request: NextRequest) {
  try {
    let intakeAnswers: Record<string, string> | undefined;
    try {
      const body = await request.json();
      if (body?.intakeAnswers) intakeAnswers = body.intakeAnswers;
    } catch { /* no body or not JSON — that's fine */ }

    const accessCode = generateAccessCode();
    const magicToken = generateMagicToken();
    const session = await createSession(accessCode, magicToken, intakeAnswers);

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
