import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSessionByToken, saveDocuments, DocumentEntry } from "@/lib/db";

export async function POST(request: NextRequest): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const { token } = JSON.parse(clientPayload ?? "{}");
        if (!token) throw new Error("token required");
        const session = await getSessionByToken(token);
        if (!session) throw new Error("Session not found");

        return {
          access: "private" as const,
          allowedContentTypes: ["image/jpeg", "image/png", "application/pdf"],
          maximumSizeInBytes: 200 * 1024 * 1024, // 200MB
          tokenPayload: clientPayload ?? "",
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { token, docType } = JSON.parse(tokenPayload ?? "{}");
        if (!token || !docType) return;
        const session = await getSessionByToken(token);
        if (!session) return;

        const filename = decodeURIComponent(blob.pathname.split("/").pop() ?? blob.pathname);
        const entry: DocumentEntry = {
          url: blob.url,
          filename,
          uploadedAt: new Date().toISOString(),
          flagged: false,
        };
        await saveDocuments(token, { ...(session.documents ?? {}), [docType]: entry });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
