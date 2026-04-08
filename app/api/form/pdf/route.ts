import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PDFDict, PDFName, PDFNumber, rgb, degrees, StandardFonts } from "pdf-lib";
import path from "path";
import fs from "fs";
import { getSessionByToken } from "@/lib/db";
import {
  TEXT_FIELD_MAP,
  DROPDOWN_FIELD_MAP,
  GENDER_FIELD_BASE,
  BASIS_FIELD_MAP,
  ETHNICITY_FIELD_BASE,
  RACE_FIELD_BASE,
  RACE_OPTIONS,
  EYE_COLOR_FIELD_BASE,
  EYE_COLOR_OPTIONS,
  HAIR_COLOR_FIELD_BASE,
  HAIR_COLOR_OPTIONS,
  WEIGHT_FIELDS,
  BACKGROUND_YESNO_MAP,
  DATE_QUESTION_IDS,
} from "@/lib/i485FieldMap";

const PDF_PATH = path.join(process.cwd(), "public", "forms", "i485.pdf");

function formatDate(value: string): string {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[2]}/${match[3]}/${match[1]}`;
  return value;
}

async function fillPdf(
  formData: Record<string, string>,
  preview: boolean
): Promise<Uint8Array> {
  if (!fs.existsSync(PDF_PATH)) {
    throw new Error("I-485 PDF not found at public/forms/i485.pdf.");
  }

  const pdfBytes = fs.readFileSync(PDF_PATH);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  // pdf-lib throws when it encounters a rich text field (bit 26 of the Ff flag).
  // Clear that flag on all such fields before accessing the form, so pdf-lib
  // treats them as plain text fields and won't throw.
  const RICH_TEXT_FLAG = 1 << 25; // PDF spec bit 26 (1-indexed) = bit 25 (0-indexed)
  for (const [, obj] of pdfDoc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFDict)) continue;
    const ff = obj.lookupMaybe(PDFName.of("Ff"), PDFNumber);
    if (ff && ff.asNumber() & RICH_TEXT_FLAG) {
      obj.set(PDFName.of("Ff"), PDFNumber.of(ff.asNumber() & ~RICH_TEXT_FLAG));
    }
  }

  const form = pdfDoc.getForm();

  function setText(fieldName: string, value: string) {
    try { form.getTextField(fieldName).setText(value); } catch { /* field not found */ }
  }

  function setCheckbox(fieldName: string, checked: boolean) {
    try {
      const cb = form.getCheckBox(fieldName);
      checked ? cb.check() : cb.uncheck();
    } catch { /* field not found */ }
  }

  function setDropdown(fieldName: string, value: string) {
    try {
      const dd = form.getDropdown(fieldName);
      const opts = dd.getOptions();
      if (opts.includes(value)) dd.select(value);
    } catch { /* field not found */ }
  }

  // ── Text fields ──────────────────────────────────────────────────────────────
  for (const [qid, value] of Object.entries(formData)) {
    if (!value) continue;
    const fieldName = TEXT_FIELD_MAP[qid];
    if (!fieldName) continue;
    setText(fieldName, DATE_QUESTION_IDS.has(qid) ? formatDate(value) : value);
  }

  // ── Dropdown fields ──────────────────────────────────────────────────────────
  for (const [qid, value] of Object.entries(formData)) {
    if (!value) continue;
    const fieldName = DROPDOWN_FIELD_MAP[qid];
    if (!fieldName) continue;
    setDropdown(fieldName, value);
  }

  // ── Gender ───────────────────────────────────────────────────────────────────
  const gender = formData["Pt1Line18_Gender"];
  if (gender) {
    setCheckbox(`${GENDER_FIELD_BASE}[0]`, gender === "Male");
    setCheckbox(`${GENDER_FIELD_BASE}[1]`, gender === "Female");
  }

  // ── Part 2 — Basis of eligibility ───────────────────────────────────────────
  const basis = formData["Pt2Line1_AdjustmentBasis"];
  if (basis) {
    for (const [key, { field, index }] of Object.entries(BASIS_FIELD_MAP)) {
      setCheckbox(`${field}[${index}]`, key === basis);
    }
  }

  // ── Part 6 — Ethnicity ───────────────────────────────────────────────────────
  const ethnicity = formData["Pt6Line1_Ethnicity"];
  if (ethnicity) {
    setCheckbox(`${ETHNICITY_FIELD_BASE}[0]`, ethnicity === "Hispanic or Latino");
    setCheckbox(`${ETHNICITY_FIELD_BASE}[1]`, ethnicity === "Not Hispanic or Latino");
  }

  // ── Part 6 — Race ────────────────────────────────────────────────────────────
  const race = formData["Pt6Line2_Race"];
  if (race) {
    RACE_OPTIONS.forEach((opt, i) => {
      setCheckbox(`${RACE_FIELD_BASE}[${i}]`, race === opt);
    });
  }

  // ── Part 6 — Eye color ───────────────────────────────────────────────────────
  const eyeColor = formData["Pt6Line6_EyeColor"];
  if (eyeColor) {
    EYE_COLOR_OPTIONS.forEach((opt, i) => {
      setCheckbox(`${EYE_COLOR_FIELD_BASE}[${i}]`, eyeColor === opt);
    });
  }

  // ── Part 6 — Hair color ──────────────────────────────────────────────────────
  const hairColor = formData["Pt6Line7_HairColor"];
  if (hairColor) {
    HAIR_COLOR_OPTIONS.forEach((opt, i) => {
      setCheckbox(`${HAIR_COLOR_FIELD_BASE}[${i}]`, hairColor === opt);
    });
  }

  // ── Part 6 — Weight (3 digit boxes) ─────────────────────────────────────────
  const weightRaw = formData["Pt6Line5_WeightLbs"];
  if (weightRaw) {
    const digits = weightRaw.replace(/\D/g, "").padStart(3, "0").slice(-3);
    WEIGHT_FIELDS.forEach((field, i) => setText(field, digits[i]));
  }

  // ── Part 8 — Background Yes/No ───────────────────────────────────────────────
  for (const [qid, fieldBase] of Object.entries(BACKGROUND_YESNO_MAP)) {
    const answer = formData[qid];
    if (!answer) continue;
    setCheckbox(`${fieldBase}[0]`, answer === "yes");
    setCheckbox(`${fieldBase}[1]`, answer === "no");
  }

  // ── DRAFT watermark ──────────────────────────────────────────────────────────
  if (preview) {
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      page.drawText("DRAFT — NOT FOR FILING", {
        x: width / 2 - 220,
        y: height / 2,
        size: 52,
        font: helveticaBold,
        color: rgb(0.75, 0.75, 0.75),
        rotate: degrees(45),
        opacity: 0.25,
      });
    }
  }

  return pdfDoc.save();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token   = searchParams.get("token");
  const preview = searchParams.get("preview") === "true";

  if (!token) {
    return NextResponse.json({ error: "token is required." }, { status: 400 });
  }

  try {
    const session = await getSessionByToken(token);
    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const pdfBytes = await fillPdf(session.form_data, preview);

    const filename = preview ? "i485-draft.pdf" : "i485-completed.pdf";
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate PDF.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
