/**
 * Run this after placing i485.pdf in public/forms/ to list all fillable field names.
 * Usage: node scripts/listPdfFields.js
 */
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

async function main() {
  const pdfPath = path.join(__dirname, "../public/forms/i485.pdf");
  if (!fs.existsSync(pdfPath)) {
    console.error("❌  public/forms/i485.pdf not found.");
    process.exit(1);
  }
  const bytes = fs.readFileSync(pdfPath);
  const doc   = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const form  = doc.getForm();
  const fields = form.getFields();
  console.log(`\n✅  Found ${fields.length} fields:\n`);
  fields.forEach(f => {
    const type = f.constructor.name.replace("PDF", "");
    console.log(`  [${type.padEnd(12)}]  ${f.getName()}`);
  });
}
main().catch(console.error);
