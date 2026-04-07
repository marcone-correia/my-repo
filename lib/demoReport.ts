import { ReviewReport } from "@/components/ReportView";

const demoReport: ReviewReport = {
  overall_status: "NEEDS ATTENTION",
  plain_summary:
    "Carlos's package has the core documents in place, but two issues need to be fixed before you file: the I-485 lists the wrong entry date, and the I-864 appears to have been signed with the wrong date. Address those two items first — everything else is in good shape or can be fixed quickly.",

  documents_identified: [
    { filename: "I-485_Carlos_M.pdf",          identified_as: "I-485 Application to Register Permanent Residence", note: null },
    { filename: "I-130_Sofia_M.pdf",            identified_as: "I-130 Petition for Alien Relative", note: null },
    { filename: "I-130A_Carlos_M.pdf",          identified_as: "I-130A Supplemental Information for Spouse", note: null },
    { filename: "I-864_Affidavit_Support.pdf",  identified_as: "I-864 Affidavit of Support", note: "Signed by Sofia M." },
    { filename: "marriage_certificate.pdf",     identified_as: "Marriage Certificate", note: "Cook County, Illinois — June 4, 2022" },
    { filename: "birth_cert_carlos.pdf",        identified_as: "Birth Certificate — Carlos M.", note: "Issued in São Paulo, Brazil" },
    { filename: "passport_carlos_bio.pdf",      identified_as: "Passport — Carlos M. (bio page)", note: null },
    { filename: "I-94_reentry_2025.pdf",        identified_as: "I-94 Arrival/Departure Record — AP Re-entry", note: "January 13, 2025" },
    { filename: "I-94_original_2015.pdf",       identified_as: "I-94 Arrival/Departure Record — Prior Entry", note: "2015 B-2 visa entry" },
    { filename: "DACA_approval_I797.pdf",       identified_as: "DACA Approval Notice (I-797)", note: "Most recent approval" },
    { filename: "EAD_card_front_back.pdf",      identified_as: "EAD Card (front and back)", note: null },
    { filename: "advance_parole_I131.pdf",      identified_as: "Advance Parole Document (I-131 approval)", note: null },
    { filename: "tax_return_2024.pdf",          identified_as: "Federal Tax Return 2024 — Sofia M.", note: null },
    { filename: "tax_return_2023.pdf",          identified_as: "Federal Tax Return 2023 — Sofia M.", note: null },
    { filename: "W2_2024_Meridian.pdf",         identified_as: "W-2 2024 — Meridian Financial Group", note: "Income: $112,000" },
    { filename: "W2_2023_Meridian.pdf",         identified_as: "W-2 2023 — Meridian Financial Group", note: null },
    { filename: "pay_stubs_nov2025.pdf",        identified_as: "Pay Stubs — November 2025", note: "3 stubs included" },
    { filename: "I-693_sealed.pdf",             identified_as: "I-693 Medical Exam (sealed envelope)", note: "Do not open" },
    { filename: "passport_photos_carlos.jpg",   identified_as: "Passport Photos — Carlos M.", note: "2 photos" },
    { filename: "couple_photos.pdf",            identified_as: "Couple Photos / Evidence of Relationship", note: "23 photos" },
  ],

  findings: [
    {
      tier: "RED",
      document: "I-485 — Application to Register Permanent Residence",
      issue:
        "Your I-485 lists the original 2015 visa entry as Carlos's most recent arrival, but it should show the January 13, 2025 Advance Parole re-entry.",
      why_it_matters:
        "Carlos's eligibility to apply for a green card from inside the U.S. is based on that 2025 re-entry — not the 2015 one. If the form shows the wrong entry, the application is built on an incorrect foundation and will likely be returned or rejected by USCIS.",
      action:
        "Correct Items 10–12 on the I-485 to reflect the January 13, 2025 re-entry date, entry class, and the I-94 number from the Advance Parole re-entry. Ask your paralegal to review the corrected form before printing and signing.",
      link: "https://www.uscis.gov/i-485",
    },
    {
      tier: "RED",
      document: "I-864 — Affidavit of Support",
      issue:
        "The date in the signature field of Sofia's I-864 appears to read '03/15/1988' — which looks like a birthdate, not today's date.",
      why_it_matters:
        "USCIS will reject a form where the signature date is clearly wrong. This is a common mistake, but it means the form needs to be redone — you can't correct it with whiteout or initials.",
      action:
        "Print a fresh copy of the I-864, have Sofia fill it out again, and write today's actual date in the signature field. Do not alter or write over the existing form.",
      link: "https://www.uscis.gov/i-864",
    },
    {
      tier: "YELLOW",
      document: "Tax Returns — 3-Year Requirement",
      issue:
        "Sofia's 2022 federal tax return is missing. The package includes 2024 and 2023, but USCIS requires all three years.",
      why_it_matters:
        "A missing tax year is one of the most common reasons USCIS sends a Request for Evidence (RFE), which pauses your case and adds months to the timeline.",
      action:
        "Find your 2022 federal tax return (Form 1040). If you don't have a copy, download it free from IRS.gov under 'Get Your Tax Record' → 'Get Transcript.' Include it alongside your W-2s from that year.",
      link: "https://www.irs.gov/individuals/get-transcript",
    },
    {
      tier: "YELLOW",
      document: "Pay Stubs — Recency",
      issue:
        "The most recent pay stub in the package is from November 2025 — about four months ago.",
      why_it_matters:
        "USCIS wants to see that the sponsor's income is current, typically within the past 3 months. Older stubs may prompt a Request for Evidence even if the income amount is sufficient.",
      action:
        "Download or request your two or three most recent pay stubs from Meridian Financial Group — most employers make these available through an HR portal or payroll system. Add these to the package.",
      link: null,
    },
    {
      tier: "GREEN",
      document: "Advance Parole Re-entry I-94",
      issue:
        "Carlos's I-94 confirms a re-entry date of January 13, 2025, showing he returned to the U.S. on his Advance Parole travel document.",
      why_it_matters:
        "This document is the cornerstone of Carlos's eligibility to apply for a green card from inside the U.S. It's present, legible, and shows the correct re-entry date.",
      action: "No action needed — keep this document near the front of your package.",
      link: null,
    },
    {
      tier: "GREEN",
      document: "Marriage Certificate",
      issue:
        "Government-issued marriage certificate from Cook County, Illinois, dated June 4, 2022. Legible, official seal visible, in English — no translation needed.",
      why_it_matters:
        "This establishes the legal basis of the spousal relationship that the entire application depends on.",
      action: "Looks good as submitted.",
      link: null,
    },
    {
      tier: "GREEN",
      document: "I-130 and I-130A",
      issue:
        "Both the sponsorship petition (I-130) and the supplemental form (I-130A) are present, fully completed, and signed by Sofia M.",
      why_it_matters:
        "These forms establish Sofia's relationship to Carlos and her role as the petitioner.",
      action: "No action needed.",
      link: null,
    },
    {
      tier: "GREEN",
      document: "Couple Photos — 23 Photos",
      issue:
        "The package includes 23 photos showing Carlos and Sofia at their wedding reception, a birthday party with extended family, and travel photos with friends present.",
      why_it_matters:
        "USCIS looks for evidence of a genuine, shared life. A mix of events and social photos with other people present is much stronger than selfies alone — this package demonstrates that well.",
      action: "Strong relationship evidence. No changes needed.",
      link: null,
    },
    {
      tier: "PURPLE",
      document: "Birth Certificate — Carlos M. (Brazil)",
      issue:
        "Carlos's birth certificate appears to be a standard short-form certificate issued in São Paulo. U.S. immigration rules for Brazil typically require a specific long-form version.",
      why_it_matters:
        "Brazil requires a document called a Certidão de Nascimento em Inteiro Teor for U.S. immigration purposes. A standard short-form certificate may not meet the requirement and could result in a Request for Evidence after you file.",
      action:
        "Ask your paralegal to confirm whether the version you have meets the requirement. If not, you'll need to request the long-form certificate from Brazil before filing.",
      link: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-reciprocity-and-civil-documents-by-country.html",
    },
  ],

  daca_ap_check: {
    applicable: true,
    ap_document_found: true,
    reentry_i94_found: true,
    basis_appears_correct: false,
    summary:
      "Carlos has a valid Advance Parole document and an I-94 confirming re-entry on January 13, 2025 — the two key pieces of evidence for this type of case. However, the I-485 currently shows the 2015 entry, not the 2025 AP re-entry, as the most recent arrival. This must be corrected before filing.",
    flags: [
      "The I-485 must be corrected to show the January 13, 2025 Advance Parole re-entry as the most recent entry in Items 10–12. This is the foundation of Carlos's eligibility.",
    ],
  },

  disclaimer:
    "This review is for informational purposes only and does not constitute legal advice. Consult a licensed immigration attorney before filing.",
};

export default demoReport;
