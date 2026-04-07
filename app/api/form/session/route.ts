import { NextRequest, NextResponse } from "next/server";
import { getSessionByToken, getSessionByAccessCode } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const code  = searchParams.get("code");

  if (!token && !code) {
    return NextResponse.json({ error: "Provide token or code." }, { status: 400 });
  }

  try {
    const session = token
      ? await getSessionByToken(token)
      : await getSessionByAccessCode(code!);

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (err) {
    console.error("Failed to retrieve session:", err);
    return NextResponse.json({ error: "Failed to retrieve session." }, { status: 500 });
  }
}
