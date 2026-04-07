import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import path from "path";
import fs from "fs";
import { getSessionByToken } from "@/lib/db";
import { FIELD_MAP, PART2_BASIS_FIELDS, PART6_RACE_FIELDS, PART6_ETHNICITY_FIELDS } from "@/lib/i485FieldMap";

const PDF_PATH = path.join(process.cwd(), "public", "forms", "i485.pdf");

function formatDate(value: string): string {
  if (!value) return "";
  // Accepts YYYY-MM-DD (HTML date input) → MM/DD/YYYY
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return `${match[2]}/${match[3]}/${match[1]}`;
  return value;
}

async function fillPdf(
  formData: Record<string, string>,
  preview: boolean
): Promise<Uint8Array> {
  if (!fs.existsSync(PDF_PATH)) {
    throw new Error(
      "I-485 PDF not found at public/forms/i485.pdf. Please download the official USCIS I-485 (edition 09/17/19) and place it there."
    );
  }

  const pdfBytes = fs.readFileSync(PDF_PATH);
  const pdfDoc  = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form    = pdfDoc.getForm();

  // Helper: set a text field safely
  function setText(fieldName: string, value: string) {
    try {
      const field = form.getTextField(fieldName);
      field.setText(value);
    } catch {
      // field not found — expected until we verify against live PDF
    }
  }

  // Helper: set a checkbox safely
  function setCheckbox(fieldName: string, checked: boolean) {
    try {
      const field = form.getCheckBox(fieldName);
      checked ? field.check() : field.uncheck();
    } catch {
      // field not found
    }
  }

  // Helper: set a yes/no pair
  function setYesNo(baseFieldId: string, answer: string) {
    // Try standard USCIS naming: Pt9LineXX_YesNoYes / Pt9LineXX_YesNoNo
    const base = FIELD_MAP[baseFieldId] as string;
    if (!base) return;
    setCheckbox(`${base}Yes`, answer === "yes");
    setCheckbox(`${base}No`,  answer === "no");
    // Also try alternate suffix patterns
    setCheckbox(`${base}_Yes`, answer === "yes");
    setCheckbox(`${base}_No`,  answer === "no");
  }

  // ── Fill standard text / date fields ──────────────────────────────────────
  for (const [questionId, value] of Object.entries(formData)) {
    if (!value) continue;

    const pdfField = FIELD_MAP[questionId];
    if (!pdfField) continue;

    // Skip special-cased fields handled below
    if (
      questionId === "Pt2Line1_AdjustmentBasis" ||
      questionId === "Pt6Line1_Ethnicity" ||
      questionId === "Pt6Line2_Race" ||
      questionId.endsWith("_YesNo")
    ) continue;

    const fieldName = Array.isArray(pdfField) ? pdfField[0] : pdfField;

    // Date fields
    const dateFields = [
      "Pt1Line3_DateofBirth",
      "Pt3Line3_DateLastEntry",
      "Pt3Line8_PassportExpiration",
      "Pt3Line12_VisaExpiration",
      "Pt4Line1_DateFrom",
      "Pt4Line2_DateFrom",
      "Pt4Line2_DateTo",
      "Pt5Line1_DateFrom",
      "Pt5Line1_DateTo",
      "Pt5Line2_DateFrom",
      "Pt5Line2_DateTo",
    ];

    if (dateFields.includes(questionId)) {
      setText(fieldName, formatDate(value));
    } else {
      setText(fieldName, value);
    }
  }

  // ── Part 2 — Basis of eligibility checkboxes ──────────────────────────────
  const basis = formData["Pt2Line1_AdjustmentBasis"];
  if (basis) {
    for (const [key, cbField] of Object.entries(PART2_BASIS_FIELDS)) {
      setCheckbox(cbField, key === basis);
    }
  }

  // ── Part 6 — Ethnicity checkboxes ─────────────────────────────────────────
  const ethnicity = formData["Pt6Line1_Ethnicity"];
  if (ethnicity) {
    for (const [key, cbField] of Object.entries(PART6_ETHNICITY_FIELDS)) {
      setCheckbox(cbField, key === ethnicity);
    }
  }

  // ── Part 6 — Race checkboxes ───────────────────────────────────────────────
  const race = formData["Pt6Line2_Race"];
  if (race) {
    for (const [key, cbField] of Object.entries(PART6_RACE_FIELDS)) {
      setCheckbox(cbField, key === race);
    }
  }

  // ── Part 9 — Yes/No pairs ─────────────────────────────────────────────────
  const yesNoFields = Object.keys(FIELD_MAP).filter((k) => k.endsWith("_YesNo"));
  for (const fieldId of yesNoFields) {
    const answer = formData[fieldId];
    if (answer) setYesNo(fieldId, answer);
  }

  // ── DRAFT watermark ────────────────────────────────────────────────────────
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

  form.flatten();
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
