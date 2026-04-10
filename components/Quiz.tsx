"use client";

import { useState } from "react";
import { IntakeAnswers } from "@/lib/intakeTypes";

// ─── Questions & feedback ─────────────────────────────────────────────────────

const QUESTIONS = [
  {
    key: "petitionerType" as const,
    text: "Who is the petitioner — the person filing the green card petition?",
    options: [
      {
        value: "usc",
        label: "A U.S. citizen",
        feedback: "When the petitioner is a U.S. citizen, there's no wait for a visa to become available — the case can be filed right away.",
      },
      {
        value: "lpr",
        label: "A permanent resident (green card holder)",
        feedback: "When the petitioner is a permanent resident, there may be a waiting period before a visa becomes available. We'll factor this into the review.",
      },
    ],
  },
  {
    key: "entryMethod" as const,
    text: "How did the immigrant (the person applying for the green card) most recently enter the United States?",
    options: [
      {
        value: "visa",
        label: "On a valid visa (tourist, student, work, or other)",
        feedback: "This is one of the most common entry types for adjustment of status filers. We'll check that the entry is correctly documented.",
      },
      {
        value: "advance_parole",
        label: "With an Advance Parole travel document",
        feedback: "Important: the Advance Parole re-entry is the legal foundation of eligibility to apply from inside the U.S. We'll specifically check that this is documented correctly.",
      },
      {
        value: "without_inspection",
        label: "Without going through official border inspection",
        feedback: "Entering without inspection may affect eligibility to adjust status inside the U.S. We'll flag this for review.",
      },
      {
        value: "other",
        label: "Other / not sure",
        feedback: "No problem — we'll assess the entry documentation from what gets uploaded.",
      },
    ],
  },
  {
    key: "currentStatus" as const,
    text: "What is the immigrant's current immigration status?",
    options: [
      {
        value: "daca",
        label: "Has DACA",
        feedback: "DACA recipients who have traveled on Advance Parole and re-entered can typically adjust status. We'll verify the key documents.",
      },
      {
        value: "valid_status",
        label: "Has a valid, unexpired visa or other lawful status",
        feedback: "Maintaining lawful status strengthens the application. We'll confirm the status documents are in order.",
      },
      {
        value: "overstay",
        label: "Had a status that has since expired",
        feedback: "An expired status is common and doesn't automatically disqualify the case — but the circumstances matter. We'll flag any concerns.",
      },
      {
        value: "no_status",
        label: "No current immigration status",
        feedback: "This may affect eligibility depending on how the immigrant entered. We'll flag this area for review.",
      },
      {
        value: "unknown",
        label: "Not sure",
        feedback: "That's okay — upload what you have and we'll assess from there.",
      },
    ],
  },
  {
    key: "priorRemoval" as const,
    text: "Has the immigrant ever been ordered to leave, deported, or removed from the U.S.?",
    options: [
      {
        value: "no",
        label: "No",
        feedback: "No prior removal orders — that's one less complexity to navigate.",
      },
      {
        value: "yes",
        label: "Yes",
        feedback: "A prior removal order is a significant factor. We'll flag this clearly in the report.",
      },
      {
        value: "unknown",
        label: "Not sure",
        feedback: "We'll flag this for review — it's important to confirm before filing.",
      },
    ],
  },
  {
    key: "filingStage" as const,
    text: "Where is this case in the green card process?",
    options: [
      {
        value: "concurrent",
        label: "Filing the petition and green card application together for the first time",
        feedback: "This is called concurrent filing — the most common path for immediate relatives of U.S. citizens. We'll check for both the I-130 and I-485 in the package.",
      },
      {
        value: "post_i130_approval",
        label: "The petition was already approved — now filing the green card application separately",
        feedback: "The I-130 approval notice (I-797) should be in the package. We'll check for it.",
      },
      {
        value: "unknown",
        label: "Not sure",
        feedback: "No problem — we'll identify the filing stage from the documents.",
      },
    ],
  },
] as const;

// ─── Summary builders ─────────────────────────────────────────────────────────

function buildSummary(answers: IntakeAnswers): string {
  const petitioner = answers.petitionerType === "usc"
    ? "a U.S. citizen"
    : "a permanent resident";

  const entryMap: Record<string, string> = {
    visa:                "entered on a valid visa",
    advance_parole:      "entered on Advance Parole",
    without_inspection:  "entered without going through official border inspection",
    other:               "entered through another method",
  };

  const statusMap: Record<string, string> = {
    daca:         "currently has DACA",
    valid_status: "has a valid, unexpired immigration status",
    overstay:     "has a status that has since expired",
    no_status:    "has no current immigration status",
    unknown:      "has an unclear immigration status",
  };

  const filingMap: Record<string, string> = {
    concurrent:          "This is a concurrent filing — we'll check for both the I-130 petition and I-485 application.",
    post_i130_approval:  "The I-130 petition was already approved — we'll check for the approval notice (I-797) and the I-485 application.",
    unknown:             "We'll identify the filing stage from the documents.",
  };

  const removalNote = answers.priorRemoval === "yes"
    ? " The immigrant has a prior removal order — we'll flag this prominently in the report."
    : "";

  const apNote = (answers.entryMethod === "advance_parole" || answers.currentStatus === "daca")
    ? " We'll pay special attention to the Advance Parole re-entry documentation."
    : "";

  const entry  = entryMap[answers.entryMethod]   ?? "entered through an unclear method";
  const status = statusMap[answers.currentStatus] ?? "has an unclear status";
  const filing = filingMap[answers.filingStage]   ?? "";

  return `The petitioner is ${petitioner}. The immigrant ${entry} and ${status}.${removalNote} ${filing}${apNote}`.trim();
}

export function buildCaseContext(answers: IntakeAnswers): string {
  const petitioner = answers.petitionerType === "usc" ? "U.S. Citizen" : "Lawful Permanent Resident";
  const entryMap: Record<string, string> = {
    visa: "Valid visa entry", advance_parole: "Advance Parole re-entry",
    without_inspection: "Entry without inspection", other: "Other/unclear",
  };
  const statusMap: Record<string, string> = {
    daca: "DACA recipient", valid_status: "Valid visa/status",
    overstay: "Overstay (status expired)", no_status: "No current status", unknown: "Unknown",
  };
  const filingMap: Record<string, string> = {
    concurrent: "Concurrent (I-130 + I-485 together)",
    post_i130_approval: "Post I-130 approval (I-485 only)",
    unknown: "Unknown",
  };
  return [
    `Petitioner: ${petitioner}`,
    `Entry method: ${entryMap[answers.entryMethod] ?? answers.entryMethod}`,
    `Current status: ${statusMap[answers.currentStatus] ?? answers.currentStatus}`,
    `Prior removal: ${answers.priorRemoval}`,
    `Filing stage: ${filingMap[answers.filingStage] ?? answers.filingStage}`,
  ].join("\n");
}

// ─── Component ────────────────────────────────────────────────────────────────

// step 0 = welcome, 1–5 = questions, 6 = summary
const TOTAL_STEPS = 6;

export default function Quiz({
  onComplete,
  onResume,
}: {
  onComplete: (answers: IntakeAnswers) => void;
  onResume?: (code: string) => Promise<void>;
}) {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<Partial<IntakeAnswers>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [resumeCode, setResumeCode]     = useState("");
  const [resumeError, setResumeError]   = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);

  const handleResume = async () => {
    const code = resumeCode.trim().toUpperCase();
    if (!code || !onResume) return;
    setResumeLoading(true);
    setResumeError("");
    try {
      await onResume(code);
    } catch {
      setResumeError("Code not found — double-check and try again.");
      setResumeLoading(false);
    }
  };

  const isWelcome  = step === 0;
  const isSummary  = step === 6;
  const isQuestion = step >= 1 && step <= 5;
  const qIndex     = step - 1; // 0–4
  const currentQ   = isQuestion ? QUESTIONS[qIndex] : null;
  const progress   = step > 0 ? (step / TOTAL_STEPS) * 100 : 0;

  const selectedFeedback = currentQ
    ? (currentQ.options as readonly { value: string; label: string; feedback: string }[])
        .find(o => o.value === selected)?.feedback
    : null;

  const goForward = () => {
    if (isWelcome) {
      setStep(1);
      setSelected(null);
      return;
    }
    if (isQuestion && currentQ && selected) {
      setAnswers(prev => ({ ...prev, [currentQ.key]: selected }));
      setSelected(null);
      setStep(step + 1);
      return;
    }
    if (isSummary) {
      onComplete(answers as IntakeAnswers);
    }
  };

  const goBack = () => {
    if (step === 0) return;
    setStep(step - 1);
    // Restore the previous answer as selected so the card highlights correctly
    if (step > 1) {
      const prevQ = QUESTIONS[step - 2];
      const prevVal = answers[prevQ.key] as string | undefined;
      setSelected(prevVal ?? null);
    } else {
      setSelected(null);
    }
  };

  const canContinue = isWelcome || isSummary || (isQuestion && selected !== null);
  const completeAnswers = answers as IntakeAnswers;

  return (
    <div className="min-h-screen bg-cream-50">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-cream-50 border-b border-stone-200">
        <div className="max-w-xl mx-auto px-6 h-12 flex items-center">
          <span className="font-serif text-lg font-bold text-stone-900 tracking-tight">Throughline</span>
        </div>
        {step > 0 && (
          <div className="h-0.5 bg-stone-100">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, backgroundColor: "#3d6b4a" }}
            />
          </div>
        )}
      </header>

      <div className="max-w-xl mx-auto px-6 py-10">

        {/* ── Welcome ────────────────────────────────────────────────────── */}
        {isWelcome && (
          <div>
            <div className="flex justify-center mb-5">
              <img src="/dhs-seal.png" alt="U.S. Department of Homeland Security" className="w-20 h-20 object-contain" />
            </div>

            <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight mb-3 text-center">
              Let's Start Your Green Card Application.
            </h1>
            <p className="text-stone-500 text-[15px] leading-relaxed mb-8 text-center">
              We'll ask 5 quick questions about your case, then you'll upload your documents. Throughline will check everything and tell you exactly what's ready, what's missing, and what to fix — based on official USCIS filing requirements.
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-8">
              <p className="text-xs font-semibold text-stone-700 mb-4 flex items-center gap-2">
                <span>⚡</span> How to get the most out of this
              </p>
              <ol className="space-y-3">
                {[
                  "Answer based on your actual situation. Accuracy here leads to a more specific, useful report.",
                  "If you're unsure about something, pick the closest answer — there's a \"not sure\" option for anything unclear.",
                  "Upload everything you have, even if incomplete. Throughline will tell you what's missing.",
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-stone-200 text-stone-600 text-xs flex items-center justify-center font-semibold">{i + 1}</span>
                    {tip}
                  </li>
                ))}
              </ol>
            </div>

            <button
              onClick={goForward}
              className="w-full rounded-xl py-3.5 px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#3d6b4a" }}
            >
              Get Started →
            </button>

            <p className="mt-4 text-xs text-stone-400 text-center">Takes about 2 minutes. Your answers are confidential.</p>

            {onResume && (
              <div className="mt-8 pt-6 border-t border-stone-200">
                <p className="text-sm font-semibold text-stone-700 mb-1">Already have a case?</p>
                <p className="text-xs text-stone-400 mb-3">Enter your access code to pick up where you left off.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={resumeCode}
                    onChange={(e) => { setResumeCode(e.target.value.toUpperCase()); setResumeError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleResume()}
                    placeholder="TL-XXXX"
                    className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm font-mono text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#3d6b4a] focus:ring-1 focus:ring-[#3d6b4a]"
                  />
                  <button
                    onClick={handleResume}
                    disabled={resumeLoading || !resumeCode.trim()}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "#3d6b4a" }}
                  >
                    {resumeLoading ? "…" : "Resume →"}
                  </button>
                </div>
                {resumeError && <p className="mt-2 text-xs text-red-600">{resumeError}</p>}
              </div>
            )}

            <p className="mt-6 text-xs text-stone-400 leading-relaxed text-center">
              Throughline is an educational tool and does not constitute legal advice.
            </p>
          </div>
        )}

        {/* ── Question ───────────────────────────────────────────────────── */}
        {isQuestion && currentQ && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
              Question {qIndex + 1} of 5
            </p>
            <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight mb-6 leading-snug">
              {currentQ.text}
            </h2>

            <div className="space-y-3">
              {(currentQ.options as readonly { value: string; label: string; feedback: string }[]).map(opt => {
                const isSelected = selected === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelected(opt.value)}
                    className="w-full text-left rounded-xl px-5 py-4 transition-all duration-150"
                    style={{
                      backgroundColor: isSelected ? "#EEF5E8" : "#ffffff",
                      border: `2px solid ${isSelected ? "#3d6b4a" : "#e7e5e4"}`,
                    }}
                  >
                    <span className="text-[15px] font-medium text-stone-800 leading-snug">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedFeedback && (
              <p className="mt-4 text-sm text-stone-500 leading-relaxed pl-1 transition-all">
                {selectedFeedback}
              </p>
            )}

            <button
              onClick={goForward}
              disabled={!selected}
              className="mt-6 w-full rounded-xl py-3.5 px-6 text-[15px] font-semibold transition-all duration-150"
              style={selected
                ? { backgroundColor: "#3d6b4a", color: "#ffffff" }
                : { backgroundColor: "#e7e5e4", color: "#a8a29e", cursor: "not-allowed" }
              }
            >
              Continue
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={goBack}
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* ── Summary ────────────────────────────────────────────────────── */}
        {isSummary && (
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight mb-6">
              Here's what we know about your case
            </h2>

            <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-6 py-5 mb-4">
              <p className="text-[15px] text-stone-700 leading-relaxed">
                {buildSummary(completeAnswers)}
              </p>
            </div>

            <p className="text-sm text-stone-400 leading-relaxed mb-6">
              Your answers help us review your documents more accurately. You can change them by going back.
            </p>

            <button
              onClick={goForward}
              className="w-full rounded-xl py-3.5 px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#3d6b4a" }}
            >
              Set Up My Case →
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={goBack}
                className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
