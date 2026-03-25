"use client";

interface DocumentIdentified { filename: string; identified_as: string; note: string; }
interface LooksGoodItem { item: string; note: string; }
interface MissingDocument { document: string; why_required: string; severity: "REQUIRED" | "RECOMMENDED"; }
interface Flag { issue: string; why_it_matters: string; what_to_do: string; risk_level: "HIGH" | "MEDIUM" | "LOW"; }
interface DacaApCheck { ap_document_found: boolean; reentry_i94_found: boolean; basis_appears_correct: boolean; summary: string; flags: string[]; }

export interface ReviewReport {
  overall_status: "READY TO FILE" | "NEARLY READY" | "NEEDS ATTENTION";
  plain_summary: string;
  documents_identified: DocumentIdentified[];
  looks_good: LooksGoodItem[];
  missing: MissingDocument[];
  flags: Flag[];
  daca_ap_check: DacaApCheck;
}

const statusConfig = {
  "READY TO FILE": { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500", label: "Ready to File" },
  "NEARLY READY": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", dot: "bg-amber-500", label: "Nearly Ready" },
  "NEEDS ATTENTION": { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", dot: "bg-red-500", label: "Needs Attention" },
};
const riskConfig = {
  HIGH: { bg: "bg-red-100", text: "text-red-700", label: "High Risk" },
  MEDIUM: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium Risk" },
  LOW: { bg: "bg-stone-100", text: "text-stone-600", label: "Low Risk" },
};
const severityConfig = {
  REQUIRED: { bg: "bg-red-100", text: "text-red-700" },
  RECOMMENDED: { bg: "bg-amber-100", text: "text-amber-700" },
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-lg font-semibold text-stone-800 mb-3">{children}</h2>;
}
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-stone-200 rounded-lg p-5 ${className}`}>{children}</div>;
}

export default function ReportView({ report }: { report: ReviewReport }) {
  const status = statusConfig[report.overall_status] ?? statusConfig["NEEDS ATTENTION"];
  return (
    <div className="space-y-6">
      <div className={`rounded-lg border ${status.bg} ${status.border} px-5 py-4 flex items-start gap-3`}>
        <span className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${status.dot}`} />
        <div>
          <p className={`font-sans font-semibold text-sm uppercase tracking-wide ${status.text}`}>{status.label}</p>
          <p className="mt-1 text-stone-700 text-sm leading-relaxed">{report.plain_summary}</p>
        </div>
      </div>

      {report.documents_identified.length > 0 && (
        <div>
          <SectionHeading>Documents Reviewed</SectionHeading>
          <Card>
            <ul className="divide-y divide-stone-100">
              {report.documents_identified.map((doc, i) => (
                <li key={i} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-stone-800">{doc.identified_as}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{doc.filename}</p>
                  {doc.note && <p className="mt-1 text-sm text-stone-600">{doc.note}</p>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {report.looks_good.length > 0 && (
        <div>
          <SectionHeading>Looks Good</SectionHeading>
          <Card>
            <ul className="space-y-3">
              {report.looks_good.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 text-emerald-600">✓</span>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{item.item}</p>
                    {item.note && <p className="text-sm text-stone-500 mt-0.5">{item.note}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {report.missing.length > 0 && (
        <div>
          <SectionHeading>Missing Documents</SectionHeading>
          <div className="space-y-3">
            {report.missing.map((item, i) => {
              const sev = severityConfig[item.severity] ?? severityConfig.REQUIRED;
              return (
                <Card key={i}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-stone-800">{item.document}</p>
                    <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>{item.severity}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-stone-600">{item.why_required}</p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {report.flags.length > 0 && (
        <div>
          <SectionHeading>Potential Issues</SectionHeading>
          <div className="space-y-3">
            {report.flags.map((flag, i) => {
              const risk = riskConfig[flag.risk_level] ?? riskConfig.LOW;
              return (
                <Card key={i}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-semibold text-stone-800">{flag.issue}</p>
                    <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${risk.bg} ${risk.text}`}>{risk.label}</span>
                  </div>
                  <p className="text-sm text-stone-600 mb-2"><span className="font-medium text-stone-700">Why it matters: </span>{flag.why_it_matters}</p>
                  <p className="text-sm text-stone-600"><span className="font-medium text-stone-700">What to do: </span>{flag.what_to_do}</p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <SectionHeading>Advance Parole / DACA Check</SectionHeading>
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: "AP Document Found", value: report.daca_ap_check.ap_document_found },
              { label: "Re-entry I-94 Found", value: report.daca_ap_check.reentry_i94_found },
              { label: "Basis Appears Correct", value: report.daca_ap_check.basis_appears_correct },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={value ? "text-emerald-600" : "text-stone-400"}>{value ? "✓" : "–"}</span>
                <span className="text-sm text-stone-700">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-stone-600">{report.daca_ap_check.summary}</p>
          {report.daca_ap_check.flags.length > 0 && (
            <ul className="mt-3 space-y-1">
              {report.daca_ap_check.flags.map((f, i) => (
                <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">⚠</span>{f}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="text-xs text-stone-400 leading-relaxed pb-6">
        This review is generated by AI and is not legal advice. Please consult a licensed immigration attorney before filing.
      </p>
    </div>
  );
}
