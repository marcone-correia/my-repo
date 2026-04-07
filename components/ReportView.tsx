"use client";

import { useState, useEffect, useRef } from "react";

interface DocumentIdentified { filename: string; identified_as: string; note: string | null; }
interface Finding {
  tier: "RED" | "YELLOW" | "GREEN" | "PURPLE";
  document: string;
  issue: string;
  why_it_matters: string;
  action: string;
  link: string | null;
}
interface DacaApCheck {
  applicable: boolean;
  ap_document_found: boolean | null;
  reentry_i94_found: boolean | null;
  basis_appears_correct: boolean | null;
  summary: string;
  flags: string[];
}

export interface ReviewReport {
  overall_status: "READY TO FILE" | "NEARLY READY" | "NEEDS ATTENTION";
  plain_summary: string;
  documents_identified: DocumentIdentified[];
  findings: Finding[];
  daca_ap_check: DacaApCheck;
  disclaimer: string;
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const TIER = {
  RED:    { color: "#A32D2D", bg: "#FBEAEA", border: "#E8BFBF", accentBorder: "#A32D2D", prefix: "Problem:",           dot: "🔴" },
  YELLOW: { color: "#854F0B", bg: "#FDF4E7", border: "#F0D5A8", accentBorder: "#C07A1A", prefix: "Fix before filing:", dot: "🟡" },
  GREEN:  { color: "#3B6D11", bg: "#EEF5E8", border: "#C3DCAF", accentBorder: "#3B6D11", prefix: "Looks good:",        dot: "🟢" },
  PURPLE: { color: "#534AB7", bg: "#EEEDFB", border: "#C5C1ED", accentBorder: "#534AB7", prefix: "Ask your paralegal:",dot: "🟣" },
} as const;

const STATUS = {
  "READY TO FILE":   { color: "#3B6D11", bg: "#EEF5E8", border: "#C3DCAF", label: "Ready to File" },
  "NEARLY READY":    { color: "#854F0B", bg: "#FDF4E7", border: "#F0D5A8", label: "Nearly Ready" },
  "NEEDS ATTENTION": { color: "#A32D2D", bg: "#FBEAEA", border: "#E8BFBF", label: "Needs Attention" },
};

const TIER_ORDER: Finding["tier"][] = ["RED", "YELLOW", "GREEN", "PURPLE"];

const TIER_SECTION_ID: Record<Finding["tier"], string> = {
  RED:    "must-fix",
  YELLOW: "review-before-filing",
  GREEN:  "looking-good",
  PURPLE: "talk-to-paralegal",
};

const SECTION_HEADINGS: Record<Finding["tier"], string> = {
  RED:    "Must Fix",
  YELLOW: "Review Before Filing",
  GREEN:  "Looking Good",
  PURPLE: "Talk to Your Paralegal",
};

const EMPTY_STATES: Record<Finding["tier"], string> = {
  RED:    "No case-blocking issues found. Keep going — check the sections below for items to address before filing.",
  YELLOW: "Nothing here needs fixing right now. Review the other sections to make sure your package is complete.",
  GREEN:  "We haven't confirmed any complete items yet. Upload your full document package for a complete review.",
  PURPLE: "No paralegal referrals at this time. If your situation changes or you have questions about your specific case, our team is here.",
};

const NAV_ITEMS = [
  { id: "overview",              label: "Overview" },
  { id: "documents",             label: "Documents Reviewed" },
  { id: "must-fix",              label: "Must Fix" },
  { id: "review-before-filing",  label: "Review Before Filing" },
  { id: "looking-good",          label: "Looking Good" },
  { id: "talk-to-paralegal",     label: "Talk to Your Paralegal" },
  { id: "entry-status",          label: "Entry & Status" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-xl font-bold text-stone-800 mb-4 tracking-tight">
      {children}
    </h2>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const t = TIER[finding.tier];
  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-sm"
      style={{ border: `1px solid ${t.border}`, borderLeft: `4px solid ${t.accentBorder}` }}
    >
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 leading-none">
            {finding.document}
          </p>
          <span
            className="flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ color: t.color, backgroundColor: t.bg }}
          >
            {t.dot} {t.prefix.replace(":", "")}
          </span>
        </div>
        <p className="text-[15px] font-medium text-stone-800 leading-snug mb-2">
          <span style={{ color: t.color }} className="font-semibold">{t.prefix}</span>{" "}
          {finding.issue}
        </p>
        {finding.why_it_matters && (
          <p className="text-sm text-stone-500 leading-relaxed">{finding.why_it_matters}</p>
        )}
      </div>
      <div
        className="px-5 py-3 flex items-start gap-2.5"
        style={{ backgroundColor: t.bg, borderTop: `1px solid ${t.border}` }}
      >
        <span className="flex-shrink-0 text-sm font-bold mt-0.5" style={{ color: t.color }}>→</span>
        <p className="text-sm font-medium leading-relaxed" style={{ color: t.color }}>{finding.action}</p>
      </div>
      {finding.link && (
        <div className="px-5 py-2.5 border-t border-stone-100 bg-stone-50">
          <a href={finding.link} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2">
            USCIS reference →
          </a>
        </div>
      )}
    </div>
  );
}

function DacaCheck({ check }: { check: DacaApCheck }) {
  const rows = [
    { label: "Advance Parole document found",     value: check.ap_document_found },
    { label: "Re-entry I-94 found",               value: check.reentry_i94_found },
    { label: "Eligibility basis appears correct",  value: check.basis_appears_correct },
  ];
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-200">
      <div className="px-5 pt-5 pb-4">
        <div className="space-y-3 mb-4">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-stone-700">{label}</span>
              {value === null
                ? <span className="text-xs font-medium text-stone-400 px-2 py-0.5 bg-stone-100 rounded-full">N/A</span>
                : value
                ? <span className="text-xs font-semibold text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded-full border border-emerald-200">✓ Yes</span>
                : <span className="text-xs font-semibold text-red-700 px-2 py-0.5 bg-red-50 rounded-full border border-red-200">✗ No</span>
              }
            </div>
          ))}
        </div>
        {check.summary && (
          <p className="text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-4">{check.summary}</p>
        )}
      </div>
      {(check.flags ?? []).length > 0 && (
        <div className="px-5 py-3 bg-amber-50 border-t border-amber-200">
          {check.flags.map((flag, i) => (
            <p key={i} className="text-sm text-amber-800 flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">⚠</span>{flag}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReportView({
  report,
  onReset,
  isDemo,
}: {
  report: ReviewReport;
  onReset?: () => void;
  isDemo?: boolean;
}) {
  const status = STATUS[report.overall_status] ?? STATUS["NEEDS ATTENTION"];
  const findings = report.findings ?? [];
  const redCount    = findings.filter(f => f.tier === "RED").length;
  const yellowCount = findings.filter(f => f.tier === "YELLOW").length;

  // ── Scroll-spy ────────────────────────────────────────────────────────────
  const [activeId, setActiveId] = useState("overview");
  const intersectingIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const ids = NAV_ITEMS.map(n => n.id);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            intersectingIds.current.add(entry.target.id);
          } else {
            intersectingIds.current.delete(entry.target.id);
          }
        });
        // Always highlight the first section currently in view (document order)
        const first = ids.find(id => intersectingIds.current.has(id));
        if (first) setActiveId(first);
      },
      { rootMargin: "-56px 0px -68% 0px", threshold: 0 }
    );

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-cream-50 border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between gap-4">
          <span className="font-serif text-lg font-bold text-stone-900 tracking-tight">Throughline</span>
          <div className="flex items-center gap-3">
            {isDemo && (
              <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                Demo
              </span>
            )}
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ color: status.color, backgroundColor: status.bg, border: `1px solid ${status.border}` }}
            >
              {status.label}
            </span>
          </div>
        </div>
      </header>

      {/* ── Demo banner ────────────────────────────────────────────────────── */}
      {isDemo && (
        <div className="max-w-5xl mx-auto px-6">
          <p className="py-3 text-sm text-stone-500 border-b border-stone-200">
            Sample report — Carlos &amp; Sofia M. Fictional data for demonstration purposes.{" "}
            <a href="/" className="underline underline-offset-2 text-stone-600 hover:text-stone-800">
              Start a real review →
            </a>
          </p>
        </div>
      )}

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex gap-10 pt-8 pb-20">

          {/* ── Left sidebar ───────────────────────────────────────────────── */}
          <aside className="hidden md:block w-48 flex-shrink-0">
            <nav className="sticky top-14 space-y-0.5" aria-label="Report sections">
              {NAV_ITEMS.map(({ id, label }) => {
                const isActive = activeId === id;
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block text-sm py-1.5 px-3 rounded-lg transition-colors"
                    style={isActive
                      ? { color: "#3d6b4a", fontWeight: 600, backgroundColor: "#EEF5E8" }
                      : { color: "#a8a29e" }
                    }
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#57534e"; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#a8a29e"; }}
                  >
                    {label}
                  </a>
                );
              })}

              {onReset && (
                <button
                  onClick={onReset}
                  className="mt-4 block text-xs px-3 py-1 text-stone-400 hover:text-stone-600 underline underline-offset-2 transition-colors"
                >
                  Start over
                </button>
              )}
            </nav>
          </aside>

          {/* ── Report content ─────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-10">

            {/* Overview */}
            <section id="overview" aria-label="Overview">
              <div
                className="rounded-xl px-6 py-5"
                style={{ backgroundColor: status.bg, border: `1px solid ${status.border}` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: status.color }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: status.color }}>
                    {status.label}
                  </span>
                </div>
                <p className="font-serif text-lg font-bold text-stone-900 leading-snug mb-2">
                  {report.plain_summary}
                </p>
                {(redCount > 0 || yellowCount > 0) && (
                  <p className="text-sm" style={{ color: status.color }}>
                    {[
                      redCount > 0    && `${redCount} issue${redCount > 1 ? "s" : ""} to fix before filing`,
                      yellowCount > 0 && `${yellowCount} item${yellowCount > 1 ? "s" : ""} to address`,
                    ].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </section>

            {/* Documents Reviewed */}
            <section id="documents" aria-label="Documents Reviewed">
              <SectionHeading>Documents Reviewed</SectionHeading>
              {(report.documents_identified ?? []).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.documents_identified.map((doc, i) => (
                    <div key={i} className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3.5 flex items-start gap-3">
                      <span className="flex-shrink-0 mt-0.5 text-stone-300 text-base">
                        {doc.identified_as.toLowerCase().includes("photo") ? "🖼" : "📄"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-800 leading-snug">{doc.identified_as}</p>
                        {doc.note && <p className="text-xs text-stone-500 mt-0.5">{doc.note}</p>}
                        <p className="text-xs text-stone-400 mt-0.5 truncate">{doc.filename}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-400">No documents identified.</p>
              )}
            </section>

            {/* Findings by tier */}
            {TIER_ORDER.map((tier) => {
              const group = findings.filter(f => f.tier === tier);
              const t = TIER[tier];
              return (
                <section
                  key={tier}
                  id={TIER_SECTION_ID[tier]}
                  aria-label={SECTION_HEADINGS[tier]}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span aria-hidden="true">{t.dot}</span>
                    <h2 className="font-serif text-xl font-bold text-stone-800 tracking-tight">
                      {SECTION_HEADINGS[tier]}
                    </h2>
                    {group.length > 0 && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: t.color, backgroundColor: t.bg }}
                      >
                        {group.length}
                      </span>
                    )}
                  </div>
                  {group.length > 0 ? (
                    <div className="space-y-3">
                      {group.map((f, i) => <FindingCard key={i} finding={f} />)}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-400 leading-relaxed">{EMPTY_STATES[tier]}</p>
                  )}
                </section>
              );
            })}

            {/* Entry & Status */}
            <section id="entry-status" aria-label="Entry & Status">
              <SectionHeading>Entry &amp; Status</SectionHeading>
              {report.daca_ap_check?.applicable ? (
                <DacaCheck check={report.daca_ap_check} />
              ) : (
                <p className="text-sm text-stone-400 leading-relaxed">
                  We were unable to assess your entry and status from the uploaded documents. Make sure your I-94, visa documents, and any parole or status notices are included in your upload.
                </p>
              )}
            </section>

            {/* Disclaimer */}
            <div className="border-t border-stone-200 pt-6">
              <p className="text-xs text-stone-400 leading-relaxed">
                {report.disclaimer ?? "This review is for informational purposes only and does not constitute legal advice. Consult a licensed immigration attorney before filing."}
              </p>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
