"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { FormSession, DocumentEntry } from "@/lib/db";
import type { IntakeAnswers } from "@/lib/intakeTypes";
import { ReviewReport } from "@/components/ReportView";
import { SECTIONS } from "@/lib/formDefinition";

// ─── Types ────────────────────────────────────────────────────────────────────

type DocMap = Record<string, DocumentEntry>;

interface DocDef {
  key: string;
  label: string;
  tooltip: string;
  optional?: boolean;
  isI485?: boolean;
  condition?: (a: IntakeAnswers) => boolean;
}

interface SectionDef {
  title: string;
  docs: DocDef[];
}

// ─── Document definitions ─────────────────────────────────────────────────────

const THIS_YEAR = new Date().getFullYear();

const SECTIONS_DEF: SectionDef[] = [
  {
    title: "USCIS Forms",
    docs: [
      { key: "i485", label: "I-485 Application to Register Permanent Residence", isI485: true, tooltip: "The main green card application form filed with USCIS. Use Throughline to fill it in, or upload a completed PDF." },
      { key: "i130", label: "I-130 Petition for Alien Relative", tooltip: "Filed by the U.S. citizen or LPR sponsor to establish the qualifying family relationship." },
      { key: "i130a", label: "I-130A Supplemental Information for Spouse Beneficiary", tooltip: "Required when the I-130 is for a spouse. Provides additional background on the beneficiary." },
      { key: "i864", label: "I-864 Affidavit of Support", tooltip: "The petitioner's signed financial commitment to prevent the beneficiary from becoming a public charge." },
      { key: "i765", label: "I-765 Employment Authorization (concurrent filing)", tooltip: "Filed with the I-485 to request a work permit while the green card is pending." },
      { key: "i131", label: "I-131 Application for Advance Parole", tooltip: "Allows travel outside the U.S. while the I-485 is pending. Required if you plan to travel internationally.", condition: (a) => a.entryMethod === "advance_parole" || a.currentStatus === "daca" },
      { key: "g1145", label: "G-1145 e-Notification of Application Acceptance", optional: true, tooltip: "Optional. Sign up for email/text notification when USCIS accepts your application package." },
    ],
  },
  {
    title: "Identity & Status Documents",
    docs: [
      { key: "passport_beneficiary", label: "Passport — beneficiary", tooltip: "Current passport biographical data page. Must be valid and not expired." },
      { key: "birth_cert_beneficiary", label: "Birth certificate — beneficiary", tooltip: "Official birth certificate with certified English translation if in another language." },
      { key: "i94", label: "I-94 Arrival/Departure Record", tooltip: "Your official record of U.S. entry. Download the most recent record at cbp.dhs.gov/i94." },
      { key: "visa_status_doc", label: "Current visa or immigration status document", tooltip: "The visa stamp in your passport, valid EAD card, or other current status document." },
      { key: "daca_i797", label: "DACA approval notice (I-797)", tooltip: "Your most recent I-797 Notice of Action approving your DACA. Required for DACA-based adjustment cases.", condition: (a) => a.currentStatus === "daca" },
      { key: "ead_card", label: "EAD card (DACA)", tooltip: "Your current Employment Authorization Document issued under DACA.", condition: (a) => a.currentStatus === "daca" },
      { key: "advance_parole_doc", label: "Advance Parole travel document (I-512L)", tooltip: "The I-512L document used for your most recent Advance Parole re-entry. Critical for DACA-based adjustment.", condition: (a) => a.entryMethod === "advance_parole" },
      { key: "prior_passport", label: "Prior passport (if applicable)", optional: true, tooltip: "Any previous passport, especially the one stamped at your most recent U.S. entry." },
    ],
  },
  {
    title: "Financial Documents",
    docs: [
      { key: "tax_return_recent", label: `Federal tax return — ${THIS_YEAR - 1}`, tooltip: "Most recent year federal income tax return. The I-864 requires at least 3 years of tax history." },
      { key: "tax_return_prior", label: `Federal tax return — ${THIS_YEAR - 2}`, tooltip: "Prior year federal income tax return for the I-864." },
      { key: "tax_return_2yr", label: `Federal tax return — ${THIS_YEAR - 3}`, tooltip: "Two years prior federal income tax return for the I-864." },
      { key: "w2_1099_recent", label: `W-2s or 1099s — ${THIS_YEAR - 1}`, tooltip: "Wage and income documents for the most recent tax year, supporting the I-864." },
      { key: "pay_stubs", label: "Recent pay stubs (last 3 months)", tooltip: "Current evidence of employment and income. Strengthens the petitioner's financial showing on the I-864." },
      { key: "employment_verification", label: "Employment verification letter", tooltip: "Letter from the petitioner's employer confirming current employment, title, and annual salary." },
    ],
  },
  {
    title: "Relationship Evidence",
    docs: [
      { key: "marriage_cert", label: "Marriage certificate", tooltip: "Official marriage certificate. Requires certified English translation if in another language." },
      { key: "birth_cert_petitioner", label: "Birth certificate or citizenship doc — petitioner", tooltip: "U.S. birth certificate, U.S. passport, or naturalization certificate for the U.S. citizen petitioner." },
      { key: "joint_bank_statements", label: "Joint bank account statements", tooltip: "Statements showing both names on an account. Demonstrates commingled finances — a strong bona fide marriage indicator." },
      { key: "lease_mortgage", label: "Lease or mortgage showing shared address", tooltip: "Lease agreement or mortgage statement with both names at the same address." },
      { key: "photos_together", label: "Photos together", tooltip: "Recent photos of the couple — at events, with family, traveling together." },
      { key: "support_letters", label: "Third-party support letters", tooltip: "Letters from friends, family, or community members who know the couple and can attest to the relationship." },
      { key: "additional_evidence", label: "Additional relationship evidence", optional: true, tooltip: "Any other supporting documents — joint bills, travel records, correspondence, cards, etc." },
    ],
  },
];

// ─── Case summary helpers ─────────────────────────────────────────────────────

function caseSummaryLine(a: IntakeAnswers): string {
  const petitioner = a.petitionerType === "usc" ? "U.S. citizen petitioner" : "LPR petitioner";
  const entry: Record<string, string> = { visa: "visa entry", advance_parole: "Advance Parole re-entry", without_inspection: "entry without inspection", other: "other entry" };
  const status: Record<string, string> = { daca: "DACA", valid_status: "valid status", overstay: "overstayed status", no_status: "no current status", unknown: "unknown status" };
  const stage: Record<string, string> = { concurrent: "concurrent filing", post_i130_approval: "post-I-130 approval", unknown: "stage unknown" };
  return `${petitioner} · ${entry[a.entryMethod] ?? a.entryMethod} · ${status[a.currentStatus] ?? a.currentStatus} · ${stage[a.filingStage] ?? a.filingStage}`;
}

// ─── I-485 form progress ──────────────────────────────────────────────────────

const I485_SECTIONS = ["getting_started", "part1", "part2", "part3", "part4", "part5", "part6", "part9"];

function i485Progress(completedParts: string[]): number {
  const done = I485_SECTIONS.filter((s) => completedParts.includes(s)).length;
  return Math.round((done / I485_SECTIONS.length) * 100);
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ entry }: { entry: DocumentEntry | undefined }) {
  if (!entry) return <span className="text-xs text-stone-400">Not uploaded</span>;
  if (entry.flagged) return <span className="flex items-center gap-1 text-xs text-amber-700 font-medium"><span>⚠</span>Flagged in last review</span>;
  return <span className="flex items-center gap-1 text-xs text-[#3d6b4a] font-medium"><span>✓</span>{entry.filename}</span>;
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block ml-1">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="w-4 h-4 rounded-full bg-stone-200 text-stone-500 text-[10px] font-bold leading-none flex items-center justify-center hover:bg-stone-300 transition-colors flex-shrink-0"
        aria-label="Info"
      >?</button>
      {show && (
        <span className="absolute z-50 left-6 top-0 w-64 bg-stone-900 text-white text-xs rounded-lg px-3 py-2 leading-relaxed shadow-xl">
          {text}
        </span>
      )}
    </span>
  );
}

// ─── Single document card ─────────────────────────────────────────────────────

function DocCard({
  def,
  entry,
  token,
  completedParts,
  onUploaded,
  onDeleted,
}: {
  def: DocDef;
  entry: DocumentEntry | undefined;
  token: string;
  completedParts: string[];
  onUploaded: (key: string, doc: DocumentEntry) => void;
  onDeleted: (key: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("docType", def.key);
      fd.append("token", token);
      const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Upload failed.");
      }
      const { document } = await res.json();
      onUploaded(def.key, document);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    }
    setUploading(false);
  }, [def.key, token, onUploaded]);

  const handleDelete = useCallback(async () => {
    await fetch("/api/documents/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, docType: def.key }),
    });
    onDeleted(def.key);
  }, [def.key, token, onDeleted]);

  const progress = def.isI485 ? i485Progress(completedParts) : null;
  const isI485Complete = progress === 100;

  return (
    <div className={`flex items-start justify-between gap-3 py-3 border-b border-stone-100 last:border-b-0 ${entry?.flagged ? "bg-amber-50 -mx-4 px-4 rounded" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-sm text-stone-800 leading-snug">{def.label}</span>
          {def.optional && <span className="text-[10px] text-stone-400 bg-stone-100 rounded px-1.5 py-0.5">optional</span>}
          <Tooltip text={def.tooltip} />
        </div>
        <div className="mt-0.5">
          <StatusBadge entry={entry} />
          {entry && (
            <span className="text-[10px] text-stone-400 ml-2">{new Date(entry.uploadedAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          {def.isI485 && (
            <a
              href={`/form/${token}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#3d6b4a] text-[#3d6b4a] hover:bg-[#EEF5E8] transition-colors whitespace-nowrap"
            >
              {isI485Complete ? "Download ↓" : progress! > 0 ? `${progress}% done →` : "Fill with Throughline →"}
            </a>
          )}
          {entry ? (
            <button
              onClick={handleDelete}
              className="text-xs text-stone-400 hover:text-red-500 transition-colors px-1"
              title="Remove"
            >×</button>
          ) : (
            <>
              <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              <button
                onClick={() => { setUploadError(null); inputRef.current?.click(); }}
                disabled={uploading}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </>
          )}
        </div>
        {uploadError && (
          <p className="text-[10px] text-red-600 max-w-[160px] text-right leading-tight">{uploadError}</p>
        )}
      </div>
    </div>
  );
}

// ─── Document section ─────────────────────────────────────────────────────────

function DocSection({
  section,
  docs,
  intake,
  token,
  completedParts,
  onUploaded,
  onDeleted,
}: {
  section: SectionDef;
  docs: DocMap;
  intake: IntakeAnswers | null;
  token: string;
  completedParts: string[];
  onUploaded: (key: string, doc: DocumentEntry) => void;
  onDeleted: (key: string) => void;
}) {
  const visibleCards = section.docs.filter((d) => !d.condition || !intake || d.condition(intake));
  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-3">{section.title}</h2>
      <div className="bg-white border border-stone-200 rounded-xl px-4 py-1">
        {visibleCards.map((def) => (
          <DocCard
            key={def.key}
            def={def}
            entry={docs[def.key]}
            token={token}
            completedParts={completedParts}
            onUploaded={onUploaded}
            onDeleted={onDeleted}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Bulk upload panel ────────────────────────────────────────────────────────

function BulkUploadPanel({
  token,
  onUploaded,
}: {
  token: string;
  onUploaded: (key: string, doc: DocumentEntry) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<Array<{ file: File; status: "pending" | "uploading" | "done" | "unassigned"; assignedKey?: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const allDocDefs = SECTIONS_DEF.flatMap((s) => s.docs);

  function guessDocKey(filename: string): string | null {
    const lower = filename.toLowerCase();
    if (lower.includes("i-485") || lower.includes("i485")) return "i485";
    if (lower.includes("i-130a") || lower.includes("i130a")) return "i130a";
    if (lower.includes("i-130") || lower.includes("i130")) return "i130";
    if (lower.includes("i-864") || lower.includes("i864")) return "i864";
    if (lower.includes("i-765") || lower.includes("i765")) return "i765";
    if (lower.includes("i-131") || lower.includes("i131")) return "i131";
    if (lower.includes("passport") && lower.includes("petitioner")) return "birth_cert_petitioner";
    if (lower.includes("passport")) return "passport_beneficiary";
    if (lower.includes("birth") && lower.includes("petitioner")) return "birth_cert_petitioner";
    if (lower.includes("birth")) return "birth_cert_beneficiary";
    if (lower.includes("i-94") || lower.includes("i94")) return "i94";
    if (lower.includes("marriage")) return "marriage_cert";
    if (lower.includes("daca") && lower.includes("i-797")) return "daca_i797";
    if (lower.includes("daca") || lower.includes("i-797")) return "daca_i797";
    if (lower.includes("ead")) return "ead_card";
    if (lower.includes("advance") || lower.includes("parole") || lower.includes("i-512")) return "advance_parole_doc";
    if (lower.includes("tax") && lower.match(/2024|2023|2022|2021/)) {
      const yr = lower.match(/2024|2023|2022|2021/)?.[0];
      if (yr === String(THIS_YEAR - 1)) return "tax_return_recent";
      if (yr === String(THIS_YEAR - 2)) return "tax_return_prior";
      return "tax_return_2yr";
    }
    if (lower.includes("tax")) return "tax_return_recent";
    if (lower.includes("w-2") || lower.includes("w2")) return "w2_1099_recent";
    if (lower.includes("1099")) return "w2_1099_recent";
    if (lower.includes("pay stub") || lower.includes("paystub")) return "pay_stubs";
    if (lower.includes("employ")) return "employment_verification";
    if (lower.includes("bank")) return "joint_bank_statements";
    if (lower.includes("lease") || lower.includes("mortgage")) return "lease_mortgage";
    if (lower.includes("photo")) return "photos_together";
    return null;
  }

  const processFiles = useCallback(async (files: File[]) => {
    const items = files.map((file) => ({
      file,
      status: "pending" as const,
      assignedKey: guessDocKey(file.name) ?? undefined,
    }));
    setQueue((prev) => [...prev, ...items]);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const key = item.assignedKey;
      if (!key) {
        setQueue((prev) => prev.map((q) => q.file === item.file ? { ...q, status: "unassigned" } : q));
        continue;
      }
      setQueue((prev) => prev.map((q) => q.file === item.file ? { ...q, status: "uploading" } : q));
      try {
        const fd = new FormData();
        fd.append("file", item.file);
        fd.append("docType", key);
        fd.append("token", token);
        const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
        if (res.ok) {
          const { document } = await res.json();
          onUploaded(key, document);
          setQueue((prev) => prev.map((q) => q.file === item.file ? { ...q, status: "done" } : q));
        }
      } catch {
        setQueue((prev) => prev.map((q) => q.file === item.file ? { ...q, status: "unassigned" } : q));
      }
    }
  }, [token, onUploaded]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const assignFile = async (fileIndex: number, key: string) => {
    const item = queue[fileIndex];
    setQueue((prev) => prev.map((q, i) => i === fileIndex ? { ...q, status: "uploading", assignedKey: key } : q));
    try {
      const fd = new FormData();
      fd.append("file", item.file);
      fd.append("docType", key);
      fd.append("token", token);
      const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { document } = await res.json();
        onUploaded(key, document);
        setQueue((prev) => prev.map((q, i) => i === fileIndex ? { ...q, status: "done" } : q));
      }
    } catch {
      setQueue((prev) => prev.map((q, i) => i === fileIndex ? { ...q, status: "unassigned" } : q));
    }
  };

  const unassigned = queue.filter((q) => q.status === "unassigned");

  return (
    <div className="mt-4 mb-28">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors"
      >
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
        Have everything ready? Upload all documents at once
      </button>

      {open && (
        <div className="mt-3 bg-white border border-stone-200 rounded-xl p-4">
          {/* Drop zone */}
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${dragging ? "border-[#3d6b4a] bg-[#EEF5E8]" : "border-stone-300 hover:border-stone-400"}`}
          >
            <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="sr-only"
              onChange={(e) => { if (e.target.files) processFiles(Array.from(e.target.files)); }} />
            <p className="text-sm font-medium text-stone-600">Drop all your documents here, or click to browse</p>
            <p className="text-xs text-stone-400 mt-1">Throughline will try to identify each file automatically</p>
          </div>

          {/* Queue status */}
          {queue.length > 0 && (
            <div className="mt-4 space-y-2">
              {queue.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    item.status === "done" ? "bg-[#3d6b4a]" :
                    item.status === "uploading" ? "bg-amber-400 animate-pulse" :
                    item.status === "unassigned" ? "bg-red-400" : "bg-stone-300"
                  }`} />
                  <span className="flex-1 truncate text-stone-700">{item.file.name}</span>
                  {item.status === "done" && <span className="text-xs text-[#3d6b4a]">Assigned ✓</span>}
                  {item.status === "unassigned" && (
                    <select
                      className="text-xs border border-stone-200 rounded px-2 py-1 text-stone-700"
                      defaultValue=""
                      onChange={(e) => e.target.value && assignFile(i, e.target.value)}
                    >
                      <option value="">Assign to…</option>
                      {allDocDefs.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                    </select>
                  )}
                  {item.status === "uploading" && <span className="text-xs text-stone-400">Uploading…</span>}
                </div>
              ))}
            </div>
          )}

          {unassigned.length > 0 && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded px-3 py-2">
              {unassigned.length} file{unassigned.length !== 1 ? "s" : ""} couldn't be auto-identified. Use the dropdown to assign each one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard component ─────────────────────────────────────────────────

export default function Dashboard({ session }: { session: FormSession }) {
  const token  = session.magic_token;
  const intake = (session.intake_answers ?? null) as IntakeAnswers | null;

  const [docs, setDocs]               = useState<DocMap>(session.documents ?? {});
  const [lastReport]                  = useState<ReviewReport | null>((session.last_review as ReviewReport | null) ?? null);
  const [privacyDismissed, setPrivacyDismissed] = useState(false);
  const [copied, setCopied]           = useState(false);
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => {
    setPrivacyDismissed(!!localStorage.getItem(`tl-privacy-${token}`));
  }, [token]);

  const dismissPrivacy = () => {
    localStorage.setItem(`tl-privacy-${token}`, "1");
    setPrivacyDismissed(true);
  };

  const copyMagicLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUploaded = useCallback((key: string, doc: DocumentEntry) => {
    setDocs((prev) => ({ ...prev, [key]: doc }));
  }, []);

  const handleDeleted = useCallback((key: string) => {
    setDocs((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }, []);

  const deleteCase = async () => {
    if (!confirm("Delete your entire case and all uploaded files? This cannot be undone.")) return;
    setDeleting(true);
    await fetch("/api/documents/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, deleteAll: true }),
    });
    window.location.href = "/";
  };

  const uploadedCount = Object.keys(docs).length;

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-[#FAF9F7] border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <span className="font-serif text-lg font-bold text-stone-900 tracking-tight">Throughline</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">Case <span className="font-mono font-semibold text-stone-600">{session.access_code}</span></span>
            <button onClick={copyMagicLink} className="text-xs text-stone-500 hover:text-stone-800 transition-colors border border-stone-200 rounded-lg px-2.5 py-1">
              {copied ? "Copied ✓" : "Copy link"}
            </button>
          </div>
        </div>
      </header>

      {/* Case summary bar */}
      {intake && intake.petitionerType && (
        <div className="bg-white border-b border-stone-100">
          <div className="max-w-4xl mx-auto px-4 py-2.5">
            <p className="text-xs text-stone-500">{caseSummaryLine(intake)}</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Privacy notice */}
        {!privacyDismissed && (
          <div className="flex items-start gap-3 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 mb-6 text-sm text-stone-600">
            <span className="mt-0.5">🔒</span>
            <span className="flex-1 leading-relaxed">Your documents are stored securely and only used to power your case review. You can delete your case and all files at any time using the link at the bottom of this page.</span>
            <button onClick={dismissPrivacy} className="text-stone-400 hover:text-stone-600 text-lg leading-none flex-shrink-0">×</button>
          </div>
        )}

        {/* I-485 assistant entry point */}
        <div className="mb-8 bg-white border border-stone-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-stone-800">Filling out your I-485?</p>
            <p className="text-xs text-stone-500 mt-0.5">
              {i485Progress(session.completed_parts) > 0
                ? `${i485Progress(session.completed_parts)}% complete — pick up where you left off`
                : "Answer questions one at a time and we'll fill the official form for you."}
            </p>
          </div>
          <a
            href={`/form/${token}`}
            className="flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: "#3d6b4a" }}
          >
            {i485Progress(session.completed_parts) > 0 ? "Continue I-485 →" : "Start I-485 →"}
          </a>
        </div>

        {/* Document sections */}
        {SECTIONS_DEF.map((section) => (
          <DocSection
            key={section.title}
            section={section}
            docs={docs}
            intake={intake}
            token={token}
            completedParts={session.completed_parts}
            onUploaded={handleUploaded}
            onDeleted={handleDeleted}
          />
        ))}

        {/* Bulk upload */}
        <BulkUploadPanel token={token} onUploaded={handleUploaded} />

        {/* Footer links */}
        <div className="mt-4 pb-32 text-center">
          {session.last_review_at && (
            <p className="text-xs text-stone-400 mb-2">
              Last reviewed: {new Date(session.last_review_at).toLocaleDateString()}
            </p>
          )}
          <button
            onClick={deleteCase}
            disabled={deleting}
            className="text-xs text-stone-400 hover:text-red-500 transition-colors"
          >
            {deleting ? "Deleting…" : "Delete my case and all files"}
          </button>
        </div>
      </div>

      {/* Sticky footer review bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 px-4 py-3 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <p className="text-sm text-stone-500">
            {uploadedCount > 0
              ? <><span className="font-semibold text-stone-800">{uploadedCount} document{uploadedCount !== 1 ? "s" : ""}</span> uploaded{lastReport ? " · Previously reviewed" : ""}</>
              : <span className="text-stone-400">Upload documents above to run your review</span>
            }
          </p>
          <a
            href={uploadedCount > 0 ? `/dashboard/${token}/report` : undefined}
            aria-disabled={uploadedCount === 0}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity flex-shrink-0 ${uploadedCount === 0 ? "opacity-40 pointer-events-none" : "hover:opacity-90"}`}
            style={{ backgroundColor: "#3d6b4a" }}
          >
            {lastReport ? "View / Re-run Review" : "Run Case Readiness Review"}
          </a>
        </div>
      </div>
    </div>
  );
}
