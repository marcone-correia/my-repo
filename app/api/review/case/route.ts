import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/systemPrompt";
import { getSessionByToken, saveLastReview, flagDocuments } from "@/lib/db";
import { IntakeAnswers } from "@/lib/intakeTypes";

export const maxDuration = 300;

interface UploadedFile {
  filename: string;
  mediaType: "image/jpeg" | "image/png" | "application/pdf";
  data: string;
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function mediaTypeFromFilename(name: string): "application/pdf" | "image/jpeg" | "image/png" {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  return "image/jpeg";
}

function estimateTokens(file: UploadedFile): number {
  const bytes = file.data.length * 0.75;
  const mb = bytes / (1024 * 1024);
  return Math.ceil(mb * (file.mediaType === "application/pdf" ? 1500 : 2000));
}

function createBatches(files: UploadedFile[]): UploadedFile[][] {
  const MAX = 22000;
  const batches: UploadedFile[][] = [];
  let current: UploadedFile[] = [];
  let tokens = 0;
  for (const f of files) {
    const t = estimateTokens(f);
    if (current.length > 0 && tokens + t > MAX) { batches.push(current); current = [f]; tokens = t; }
    else { current.push(f); tokens += t; }
  }
  if (current.length > 0) batches.push(current);
  return batches;
}

function buildBlocks(files: UploadedFile[]): Anthropic.Messages.ContentBlockParam[] {
  const blocks: Anthropic.Messages.ContentBlockParam[] = [];
  for (const f of files) {
    if (f.mediaType === "application/pdf") {
      blocks.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: f.data }, title: f.filename } as Anthropic.Messages.DocumentBlockParam);
    } else {
      blocks.push({ type: "image", source: { type: "base64", media_type: f.mediaType, data: f.data } } as Anthropic.Messages.ImageBlockParam);
    }
    blocks.push({ type: "text", text: `(File: ${f.filename})` });
  }
  return blocks;
}

function stripJson(raw: string): string {
  const s = raw.indexOf("{");
  const e = raw.lastIndexOf("}");
  return s !== -1 && e !== -1 ? raw.slice(s, e + 1) : raw;
}

async function runBatch(files: UploadedFile[], system: string, isSingle: boolean): Promise<string> {
  const blocks = buildBlocks(files);
  blocks.push({
    type: "text",
    text: isSingle
      ? "Review all uploaded documents and respond ONLY with a single raw JSON object matching the structure defined in the system prompt. No markdown, no text outside the JSON."
      : `Identify and analyze these documents. Return only raw JSON: {"documents_identified":[{"filename":"string","identified_as":"string","note":"string|null"}],"findings":[{"tier":"RED|YELLOW|GREEN|PURPLE","document":"string","issue":"string","why_it_matters":"string","action":"string","link":"string|null"}],"daca_ap_notes":"string|null"}`,
  });
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: isSingle ? 16000 : 8192,
    system,
    messages: [{ role: "user", content: blocks }],
  });
  return msg.content[0].type === "text" ? msg.content[0].text : "{}";
}

async function synthesize(batchResults: string[], filenames: string[], system: string): Promise<string> {
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system,
    messages: [{
      role: "user",
      content: `You previously analyzed these documents across ${batchResults.length} batches: ${filenames.join(", ")}\n\n${batchResults.map((r, i) => `Batch ${i + 1}:\n${r}`).join("\n\n")}\n\nNow produce the final consolidated report as a single raw JSON object matching the structure in your system prompt. No markdown.`,
    }],
  });
  return msg.content[0].type === "text" ? msg.content[0].text : "{}";
}

/** Map finding document names to our docType keys for flagging */
function detectFlaggedKeys(findings: Array<{ tier: string; document: string }>): string[] {
  const map: Array<[string, string]> = [
    ["I-485", "i485"], ["I-130A", "i130a"], ["I-130", "i130"],
    ["I-864", "i864"], ["I-765", "i765"], ["I-131", "i131"],
    ["Passport", "passport_beneficiary"], ["Birth Certificate", "birth_cert"],
    ["I-94", "i94"], ["DACA", "daca_i797"], ["EAD", "ead_card"],
    ["Advance Parole", "advance_parole_doc"], ["Tax Return", "tax_return_recent"],
    ["W-2", "w2_1099_recent"], ["Pay Stub", "pay_stubs"],
    ["Marriage", "marriage_cert"], ["Joint Bank", "joint_bank_statements"],
  ];
  const flagged = new Set<string>();
  for (const f of findings) {
    if (f.tier !== "RED" && f.tier !== "YELLOW") continue;
    for (const [term, key] of map) {
      if (f.document.toLowerCase().includes(term.toLowerCase())) {
        flagged.add(key);
        break;
      }
    }
  }
  return Array.from(flagged);
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const send = (ctrl: ReadableStreamDefaultController, msg: object) =>
    ctrl.enqueue(encoder.encode(JSON.stringify(msg) + "\n"));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { token } = await request.json();
        if (!token) throw new Error("token is required.");

        const session = await getSessionByToken(token);
        if (!session) throw new Error("Session not found.");

        const docs = session.documents ?? {};
        const entries = Object.values(docs);
        if (entries.length === 0) throw new Error("No documents uploaded yet.");

        send(controller, { type: "progress", message: `Fetching ${entries.length} uploaded document${entries.length !== 1 ? "s" : ""}…` });

        // Fetch each blob file and convert to base64
        const files: UploadedFile[] = [];
        for (const entry of entries) {
          try {
            const resp = await fetch(entry.url, {
              headers: process.env.BLOB_READ_WRITE_TOKEN
                ? { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
                : {},
            });
            if (!resp.ok) continue;
            const buf = await resp.arrayBuffer();
            const data = Buffer.from(buf).toString("base64");
            files.push({
              filename: entry.filename,
              mediaType: mediaTypeFromFilename(entry.filename),
              data,
            });
          } catch { /* skip unreadable files */ }
        }

        if (files.length === 0) throw new Error("Could not fetch any uploaded files.");

        const intake = session.intake_answers as IntakeAnswers | null;
        const system = buildSystemPrompt(intake ?? {
          petitionerType: "usc", entryMethod: "advance_parole",
          currentStatus: "daca", priorRemoval: "no", filingStage: "concurrent",
        });

        const batches = createBatches(files);
        let report: Record<string, unknown>;

        if (batches.length === 1) {
          send(controller, { type: "progress", message: "Reviewing your documents with Throughline AI…" });
          const raw = await runBatch(files, system, true);
          report = JSON.parse(stripJson(raw));
        } else {
          send(controller, { type: "progress", message: `Processing in ${batches.length} batches…` });
          const results: string[] = [];
          for (let i = 0; i < batches.length; i++) {
            send(controller, { type: "progress", message: `Analyzing batch ${i + 1} of ${batches.length}…` });
            results.push(await runBatch(batches[i], system, false));
            if (i < batches.length - 1) await new Promise(r => setTimeout(r, 65000));
          }
          send(controller, { type: "progress", message: "Generating final report…" });
          const raw = await synthesize(results, files.map(f => f.filename), system);
          report = JSON.parse(stripJson(raw));
        }

        // Save report to session and flag affected cards
        await saveLastReview(token, report);
        const flagged = detectFlaggedKeys((report.findings ?? []) as Array<{ tier: string; document: string }>);
        if (flagged.length > 0) await flagDocuments(token, flagged);

        send(controller, { type: "result", report });
      } catch (err) {
        send(controller, { type: "error", message: err instanceof Error ? err.message : "Review failed." });
      }
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
