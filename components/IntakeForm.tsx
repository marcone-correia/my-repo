"use client";

import { useState } from "react";
import { IntakeAnswers, PetitionerType, EntryMethod, CurrentStatus, PriorRemoval, FilingStage } from "@/lib/intakeTypes";

function Question({ number, label, hint, children }: {
  number: number;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-stone-100 pb-6 last:border-0 last:pb-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-1">Question {number} of 5</p>
      <p className="text-sm font-semibold text-stone-800 mb-1">{label}</p>
      {hint && <p className="text-xs text-stone-500 mb-3">{hint}</p>}
      <div className="space-y-2 mt-3">{children}</div>
    </div>
  );
}

function RadioOption({ name, value, current, label, detail, onChange }: {
  name: string;
  value: string;
  current: string | undefined;
  label: string;
  detail?: string;
  onChange: (v: string) => void;
}) {
  const selected = current === value;
  return (
    <label className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${selected ? "border-stone-400 bg-stone-50" : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="mt-0.5 flex-shrink-0 accent-[#3d6b4a]"
      />
      <div>
        <p className="text-sm font-medium text-stone-800">{label}</p>
        {detail && <p className="text-xs text-stone-500 mt-0.5">{detail}</p>}
      </div>
    </label>
  );
}

export default function IntakeForm({ onComplete }: { onComplete: (answers: IntakeAnswers) => void }) {
  const [started, setStarted] = useState(false);
  const [petitionerType, setPetitionerType] = useState<PetitionerType | undefined>();
  const [entryMethod, setEntryMethod] = useState<EntryMethod | undefined>();
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus | undefined>();
  const [priorRemoval, setPriorRemoval] = useState<PriorRemoval | undefined>();
  const [filingStage, setFilingStage] = useState<FilingStage | undefined>();

  const allAnswered = petitionerType && entryMethod && currentStatus && priorRemoval && filingStage;

  const handleSubmit = () => {
    if (!allAnswered) return;
    onComplete({ petitionerType, entryMethod, currentStatus, priorRemoval, filingStage });
  };

  if (!started) {
    return (
      <div className="text-center">
        <div className="bg-white border border-stone-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-stone-900 mb-3">Case Eligibility Check</h2>
          <p className="text-sm text-stone-500 mb-8 max-w-sm mx-auto">
            Answer 5 quick questions so Throughline can tailor your document review to your specific situation. Based on official USCIS eligibility criteria.
          </p>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-5 text-left mb-8">
            <p className="text-xs font-semibold text-stone-700 mb-4 flex items-center gap-2">
              <span>⚡</span> How to get the most out of this
            </p>
            <ol className="space-y-3">
              {[
                "Answer based on your actual situation, not what you wish it were. Accuracy here leads to a better, more specific report.",
                "If you're unsure about something, pick the closest answer — there's a \"not sure\" option for anything unclear.",
                "This takes about 2 minutes. Your answers are used only to customize your document review.",
              ].map((tip, i) => (
                <li key={i} className="flex gap-3 text-sm text-stone-600">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-stone-200 text-stone-600 text-xs flex items-center justify-center font-semibold">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ol>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full rounded-lg py-3 px-6 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: "#3d6b4a" }}
          >
            Start Check →
          </button>

          <p className="mt-4 text-xs text-stone-400">Takes about 2 minutes. Your answers are confidential.</p>
        </div>

        <p className="mt-4 text-xs text-stone-400 leading-relaxed max-w-sm mx-auto">
          This tool is for educational purposes only and does not constitute legal advice. Always consult a licensed immigration attorney before filing.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-6">

        <Question
          number={1}
          label="Who is sponsoring this green card application?"
          hint="This is the U.S.-based person filing on behalf of their spouse."
        >
          <RadioOption name="petitionerType" value="usc" current={petitionerType}
            label="U.S. Citizen"
            onChange={v => setPetitionerType(v as PetitionerType)} />
          <RadioOption name="petitionerType" value="lpr" current={petitionerType}
            label="Permanent Resident (Green Card Holder)"
            onChange={v => setPetitionerType(v as PetitionerType)} />
        </Question>

        <Question
          number={2}
          label="How did the applicant most recently enter the United States?"
          hint="Think about the last time they came into the U.S. and went through border or airport inspection."
        >
          <RadioOption name="entryMethod" value="visa" current={entryMethod}
            label="On a visa"
            detail="For example: tourist visa (B-2), student visa (F-1), work visa (H-1B), or any other valid entry document"
            onChange={v => setEntryMethod(v as EntryMethod)} />
          <RadioOption name="entryMethod" value="advance_parole" current={entryMethod}
            label="With an Advance Parole travel document"
            detail="A special travel permit issued by USCIS — often used by DACA recipients or people with pending applications"
            onChange={v => setEntryMethod(v as EntryMethod)} />
          <RadioOption name="entryMethod" value="without_inspection" current={entryMethod}
            label="Without going through official border inspection"
            detail="For example, crossed the border at a location other than an official port of entry"
            onChange={v => setEntryMethod(v as EntryMethod)} />
          <RadioOption name="entryMethod" value="other" current={entryMethod}
            label="Other / not sure"
            onChange={v => setEntryMethod(v as EntryMethod)} />
        </Question>

        <Question
          number={3}
          label="What is the applicant's current immigration status in the U.S.?"
        >
          <RadioOption name="currentStatus" value="daca" current={currentStatus}
            label="Has DACA"
            detail="Deferred Action for Childhood Arrivals — a program that provides temporary protection from deportation"
            onChange={v => setCurrentStatus(v as CurrentStatus)} />
          <RadioOption name="currentStatus" value="valid_status" current={currentStatus}
            label="Has a valid, unexpired visa or other lawful status"
            onChange={v => setCurrentStatus(v as CurrentStatus)} />
          <RadioOption name="currentStatus" value="overstay" current={currentStatus}
            label="Had a visa or status that has since expired"
            detail="Entered legally but the authorized stay period has passed"
            onChange={v => setCurrentStatus(v as CurrentStatus)} />
          <RadioOption name="currentStatus" value="no_status" current={currentStatus}
            label="Has no current immigration status"
            onChange={v => setCurrentStatus(v as CurrentStatus)} />
          <RadioOption name="currentStatus" value="unknown" current={currentStatus}
            label="Not sure"
            onChange={v => setCurrentStatus(v as CurrentStatus)} />
        </Question>

        <Question
          number={4}
          label="Has the applicant ever been formally ordered to leave the U.S., deported, or removed by immigration authorities?"
        >
          <RadioOption name="priorRemoval" value="no" current={priorRemoval}
            label="No"
            onChange={v => setPriorRemoval(v as PriorRemoval)} />
          <RadioOption name="priorRemoval" value="yes" current={priorRemoval}
            label="Yes"
            onChange={v => setPriorRemoval(v as PriorRemoval)} />
          <RadioOption name="priorRemoval" value="unknown" current={priorRemoval}
            label="Not sure"
            onChange={v => setPriorRemoval(v as PriorRemoval)} />
        </Question>

        <Question
          number={5}
          label="Where are you in the green card process?"
          hint="The green card process for a spouse typically has two main stages: first, the sponsor files a petition to establish the relationship; second, the applicant files for the green card itself. Sometimes both are filed at the same time."
        >
          <RadioOption name="filingStage" value="concurrent" current={filingStage}
            label="Filing everything together for the first time"
            detail="Submitting both the sponsorship petition (I-130) and the green card application (I-485) at the same time"
            onChange={v => setFilingStage(v as FilingStage)} />
          <RadioOption name="filingStage" value="post_i130_approval" current={filingStage}
            label="The sponsorship petition was already approved — now filing for the green card"
            detail="USCIS already approved the I-130, and you received an approval notice. Now filing the I-485 separately."
            onChange={v => setFilingStage(v as FilingStage)} />
          <RadioOption name="filingStage" value="unknown" current={filingStage}
            label="Not sure"
            onChange={v => setFilingStage(v as FilingStage)} />
        </Question>

      </div>

      <div className="mt-4">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className={`w-full rounded-lg py-3 px-6 text-sm font-medium transition-colors ${!allAnswered ? "bg-stone-200 text-stone-400 cursor-not-allowed" : "text-white"}`}
          style={allAnswered ? { backgroundColor: "#3d6b4a" } : undefined}
        >
          Continue to Document Upload
        </button>
        {!allAnswered && (
          <p className="mt-2 text-center text-xs text-stone-400">Answer all 5 questions to continue</p>
        )}
      </div>
    </div>
  );
}
