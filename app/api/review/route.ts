import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { IntakeAnswers } from "@/lib/intakeTypes";

export const maxDuration = 300;

interface UploadedFile {
  filename: string;
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "application/pdf";
  data: string;
}

interface ReviewRequest {
  files: UploadedFile[];
  intake?: IntakeAnswers;
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Conservative token estimate from base64 data length
// base64 length × 0.75 = bytes; then ~1500 tokens/MB for PDFs, ~2000/MB for images
function estimateTokens(file: UploadedFile): number {
  const bytes = file.data.length * 0.75;
  const mb = bytes / (1024 * 1024);
  return Math.ceil(mb * (file.mediaType === "application/pdf" ? 1500 : 2000));
}

// Group files into batches that each stay safely under the 30K TPM limit
function createBatches(files: UploadedFile[]): UploadedFile[][] {
  const MAX_BATCH_TOKENS = 22000;
  const batches: UploadedFile[][] = [];
  let current: UploadedFile[] = [];
  let currentTokens = 0;

  for (const file of files) {
    const t = estimateTokens(file);
    if (current.length > 0 && currentTokens + t > MAX_BATCH_TOKENS) {
      batches.push(current);
      current = [file];
      currentTokens = t;
    } else {
      current.push(file);
      currentTokens += t;
    }
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

function buildContentBlocks(files: UploadedFile[]): Anthropic.Messages.ContentBlockParam[] {
  const blocks: Anthropic.Messages.ContentBlockParam[] = [];
  for (const file of files) {
    if (file.mediaType === "application/pdf") {
      blocks.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: file.data },
        title: file.filename,
      } as Anthropic.Messages.DocumentBlockParam);
    } else {
      blocks.push({
        type: "image",
        source: { type: "base64", media_type: file.mediaType, data: file.data },
      } as Anthropic.Messages.ImageBlockParam);
    }
    blocks.push({ type: "text", text: `(File name: ${file.filename})` });
  }
  return blocks;
}

async function analyzeBatch(files: UploadedFile[], batchNum: number, total: number, systemPrompt: string): Promise<string> {
  const blocks = buildContentBlocks(files);
  blocks.push({
    type: "text",
    text: `This is batch ${batchNum} of ${total}. Identify and analyze these documents. Return a JSON object with this shape:
{
  "documents_identified": [{ "filename": "string", "identified_as": "string", "note": "string or null" }],
  "findings": [{ "tier": "RED|YELLOW|GREEN|PURPLE", "document": "string", "issue": "string", "why_it_matters": "string", "action": "string", "link": "string or null" }],
  "daca_ap_notes": "string or null"
}
Return only raw JSON. No markdown, no text outside the JSON.`,
  });

  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: systemPrompt || undefined,
    messages: [{ role: "user", content: blocks }],
  });

  if (msg.stop_reason === "max_tokens") {
    throw new Error(`Batch ${batchNum} response was truncated. Try reducing the number of files.`);
  }

  return msg.content[0].type === "text" ? msg.content[0].text : "{}";
}

async function synthesize(batchResults: string[], filenames: string[], systemPrompt: string): Promise<string> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: systemPrompt || undefined,
    messages: [{
      role: "user",
      content: `Synthesize these ${batchResults.length} partial document analyses into one complete Case Readiness Report.

Full file list:
${filenames.join("\n")}

Batch analyses:
${batchResults.map((r, i) => `--- Batch ${i + 1} ---\n${r}`).join("\n\n")}

Produce the final unified JSON report in the exact format defined in your system prompt. Order findings: RED, YELLOW, GREEN, PURPLE. Return only raw JSON.`,
    }],
  });

  if (msg.stop_reason === "max_tokens") {
    throw new Error("The final report was too long to complete. Try uploading fewer files at once.");
  }

  return msg.content[0].type === "text" ? msg.content[0].text : "{}";
}

function stripJson(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ type: "error", message: "ANTHROPIC_API_KEY is not configured." }), { status: 500 });
  }

  let body: ReviewRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ type: "error", message: "Invalid request body." }), { status: 400 });
  }

  const { files, intake } = body;
  if (!files || files.length === 0) {
    return new Response(JSON.stringify({ type: "error", message: "No files provided." }), { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(intake ?? {
    petitionerType: "usc",
    entryMethod: "advance_parole",
    currentStatus: "daca",
    priorRemoval: "no",
    filingStage: "concurrent",
  });

  const encoder = new TextEncoder();
  const send = (controller: ReadableStreamDefaultController, msg: object) =>
    controller.enqueue(encoder.encode(JSON.stringify(msg) + "\n"));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const batches = createBatches(files);

        if (batches.length === 1) {
          // Small upload — single pass, stream tokens directly
          send(controller, { type: "progress", message: "Reviewing your documents…" });
          const blocks = buildContentBlocks(files);
          blocks.push({
            type: "text",
            text: "Review all uploaded documents and respond ONLY with a single raw JSON object matching the structure defined in the system prompt. No markdown, no text outside the JSON.",
          });

          let raw = "";
          const s = client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 16000,
            system: systemPrompt,
            messages: [{ role: "user", content: blocks }],
          });
          for await (const chunk of s) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              raw += chunk.delta.text;
            }
          }
          const finalMsg = await s.finalMessage();
          if (finalMsg.stop_reason === "max_tokens") {
            throw new Error("The report was too long to complete in one pass. Try uploading fewer files at once.");
          }
          const report = JSON.parse(stripJson(raw));
          send(controller, { type: "result", report });

        } else {
          // Large upload — process in batches, then synthesize
          send(controller, {
            type: "progress",
            message: `Large packet detected. Processing in ${batches.length} batches — this may take a few minutes.`,
          });

          const batchResults: string[] = [];

          for (let i = 0; i < batches.length; i++) {
            send(controller, {
              type: "progress",
              message: `Analyzing batch ${i + 1} of ${batches.length} (${batches[i].length} file${batches[i].length !== 1 ? "s" : ""})…`,
            });

            let result: string;
            try {
              result = await analyzeBatch(batches[i], i + 1, batches.length, systemPrompt);
            } catch (err) {
              // Rate limited — wait 65s and retry once
              if (err instanceof Error && err.message.includes("rate_limit")) {
                send(controller, { type: "progress", message: "Rate limit reached — waiting 65 seconds before retrying…" });
                await new Promise(r => setTimeout(r, 65000));
                result = await analyzeBatch(batches[i], i + 1, batches.length, systemPrompt);
              } else {
                throw err;
              }
            }
            batchResults.push(result);

            // Pause between batches to stay under the per-minute token limit
            if (i < batches.length - 1) {
              send(controller, {
                type: "progress",
                message: `Batch ${i + 1} done. Waiting before next batch (${batches.length - i - 1} remaining)…`,
              });
              await new Promise(r => setTimeout(r, 65000));
            }
          }

          send(controller, { type: "progress", message: "Generating final report…" });
          const raw = await synthesize(batchResults, files.map(f => f.filename), systemPrompt);
          const report = JSON.parse(stripJson(raw));
          send(controller, { type: "result", report });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        send(controller, { type: "error", message });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
