import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import systemPrompt from "@/lib/systemPrompt";

export const maxDuration = 60;

interface UploadedFile {
  filename: string;
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "application/pdf";
  data: string;
}

interface ReviewRequest {
  files: UploadedFile[];
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const body: ReviewRequest = await request.json();
    const { files } = body;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 500 });
    }

    const contentBlocks: Anthropic.Messages.ContentBlockParam[] = [];

    for (const file of files) {
      if (file.mediaType === "application/pdf") {
        contentBlocks.push({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: file.data },
          title: file.filename,
        } as Anthropic.Messages.DocumentBlockParam);
      } else {
        contentBlocks.push({
          type: "image",
          source: { type: "base64", media_type: file.mediaType, data: file.data },
        } as Anthropic.Messages.ImageBlockParam);
      }
      contentBlocks.push({ type: "text", text: `(File name: ${file.filename})` });
    }

    contentBlocks.push({
      type: "text",
      text: `You are an expert US immigration paralegal assistant specializing in employment-based and family-based green card petitions.

Review all uploaded documents above and respond ONLY with a single raw JSON object — no markdown fences, no commentary, no explanation outside the JSON.

Return exactly this shape:
{
  "overall_status": "READY TO FILE | NEARLY READY | NEEDS ATTENTION",
  "plain_summary": "string",
  "documents_identified": [{ "filename": "string", "identified_as": "string", "note": "string" }],
  "looks_good": [{ "item": "string", "note": "string" }],
  "missing": [{ "document": "string", "why_required": "string", "severity": "REQUIRED | RECOMMENDED" }],
  "flags": [{ "issue": "string", "why_it_matters": "string", "what_to_do": "string", "risk_level": "HIGH | MEDIUM | LOW" }],
  "daca_ap_check": { "ap_document_found": true, "reentry_i94_found": true, "basis_appears_correct": true, "summary": "string", "flags": ["string"] }
}

Rules:
- overall_status must be exactly one of the three string values shown.
- All fields are required; use empty arrays [] when nothing applies.
- For daca_ap_check booleans, use false when the document was not uploaded.
- Be direct and honest. These users need accurate information, not false reassurance.
- Do NOT output any text outside the JSON object.`,
    });

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      system: systemPrompt || undefined,
      messages: [{ role: "user", content: contentBlocks }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const report = JSON.parse(jsonText);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Review API error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
