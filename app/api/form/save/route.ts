import { NextRequest, NextResponse } from "next/server";
import { saveFormData } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, formData, completedParts } = body as {
      token: string;
      formData: Record<string, string>;
      completedParts: string[];
    };

    if (!token || !formData) {
      return NextResponse.json({ error: "token and formData are required." }, { status: 400 });
    }

    const session = await saveFormData(token, formData, completedParts ?? []);

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, updatedAt: session.updated_at });
  } catch (err) {
    console.error("Failed to save form data:", err);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
}
