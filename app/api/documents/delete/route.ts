import { NextRequest, NextResponse } from "next/server";
import { del, list } from "@vercel/blob";
import { getSessionByToken, saveDocuments, deleteSession } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { token, docType, deleteAll } = await request.json() as {
      token: string;
      docType?: string;
      deleteAll?: boolean;
    };

    if (!token) {
      return NextResponse.json({ error: "token is required." }, { status: 400 });
    }

    const session = await getSessionByToken(token);
    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    if (deleteAll) {
      // Delete all blobs for this session, then the session itself
      try {
        const blobs = await list({ prefix: `cases/${token}/` });
        if (blobs.blobs.length > 0) {
          await del(blobs.blobs.map((b) => b.url));
        }
      } catch { /* blob deletion best-effort */ }
      await deleteSession(token);
      return NextResponse.json({ ok: true, deleted: "session" });
    }

    if (!docType) {
      return NextResponse.json({ error: "docType is required when not deleting all." }, { status: 400 });
    }

    // Delete a single document
    const docEntry = session.documents?.[docType];
    if (docEntry?.url) {
      try { await del(docEntry.url); } catch { /* best-effort */ }
    }

    const updated = { ...session.documents };
    delete updated[docType];
    await saveDocuments(token, updated);

    return NextResponse.json({ ok: true, deleted: docType });
  } catch (err) {
    console.error("Document delete failed:", err);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
