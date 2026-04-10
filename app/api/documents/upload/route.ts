import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSessionByToken, saveDocuments, DocumentEntry } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file    = formData.get("file") as File | null;
    const docType = formData.get("docType") as string | null;
    const token   = formData.get("token") as string | null;

    if (!file || !docType || !token) {
      return NextResponse.json({ error: "file, docType, and token are required." }, { status: 400 });
    }

    const session = await getSessionByToken(token);
    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    // Upload to Vercel Blob
    let blob;
    try {
      const pathname = `cases/${token}/${docType}/${file.name}`;
      blob = await put(pathname, file, { access: "private" });
    } catch (err) {
      console.error("Blob upload failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Blob upload failed: ${msg}` }, { status: 500 });
    }

    // Update documents in session
    const existing = session.documents ?? {};
    const entry: DocumentEntry = {
      url:        blob.url,
      filename:   file.name,
      uploadedAt: new Date().toISOString(),
      flagged:    false,
    };
    const updated = { ...existing, [docType]: entry };
    try {
      await saveDocuments(token, updated);
    } catch (err) {
      console.error("DB save failed:", err);
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `DB save failed: ${msg}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, document: entry });
  } catch (err) {
    console.error("Document upload failed:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
