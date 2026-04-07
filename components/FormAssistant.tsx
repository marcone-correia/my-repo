"use client";

import { useState, useEffect, useCallback } from "react";
import FormSidebar from "@/components/FormSidebar";
import { SECTIONS, Section, Question, getSectionStatus, getRequiredQuestions } from "@/lib/formDefinition";
import type { FormSession } from "@/lib/db";

// ─── Field renderers ──────────────────────────────────────────────────────────

function FieldInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  const base =
    "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#3d6b4a] focus:ring-1 focus:ring-[#3d6b4a] transition-colors";

  if (question.type === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={base}>
        <option value="">— select —</option>
        {question.options?.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  if (question.type === "radio") {
    return (
      <div className="space-y-2 mt-1">
        {question.options?.map((o) => {
          const selected = value === o.value;
          return (
            <label
              key={o.value}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                selected ? "border-[#3d6b4a] bg-[#EEF5E8]" : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={o.value}
                checked={selected}
                onChange={() => onChange(o.value)}
                className="mt-0.5 flex-shrink-0 accent-[#3d6b4a]"
              />
              <span className="text-sm text-stone-800">{o.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  const inputType =
    question.type === "date"   ? "date"  :
    question.type === "tel"    ? "tel"   :
    question.type === "email"  ? "email" :
    question.type === "number" ? "number" : "text";

  return (
    <input
      type={inputType}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder}
      className={base}
    />
  );
}

// ─── Grouped section layout ───────────────────────────────────────────────────

function GroupedSection({
  section,
  formData,
  onChange,
  onSave,
  saving,
}: {
  section: Section;
  formData: Record<string, string>;
  onChange: (id: string, val: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  // Group questions by their `group` label
  const groups: Map<string, Question[]> = new Map();
  for (const q of section.questions) {
    const key = q.group ?? "__ungrouped__";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(q);
  }

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">{section.title}</h2>
      <p className="text-sm text-stone-500 mb-8">Fill in your information below. Required fields are marked with *.</p>

      <div className="space-y-8">
        {Array.from(groups.entries()).map(([groupName, questions]) => (
          <div key={groupName}>
            {groupName !== "__ungrouped__" && (
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
                {groupName}
              </p>
            )}
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
              {questions.map((q) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {q.label}
                    {q.required ? <span className="text-red-400 ml-1">*</span> : <span className="text-stone-400 ml-1 font-normal">(optional)</span>}
                  </label>
                  {q.hint && <p className="text-xs text-stone-400 mb-1.5">{q.hint}</p>}
                  <FieldInput question={q} value={formData[q.id] ?? ""} onChange={(v) => onChange(q.id, v)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="mt-8 w-full rounded-xl py-3.5 px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: "#3d6b4a" }}
      >
        {saving ? "Saving…" : "Save & Continue"}
      </button>
    </div>
  );
}

// ─── One-at-a-time section layout ─────────────────────────────────────────────

function OneAtATimeSection({
  section,
  formData,
  onChange,
  onSectionComplete,
}: {
  section: Section;
  formData: Record<string, string>;
  onChange: (id: string, val: string) => void;
  onSectionComplete: () => void;
}) {
  const questions = section.questions;
  const [qIndex, setQIndex] = useState(0);
  const [showWarning, setShowWarning] = useState(!!section.warning);
  const [showExplanation, setShowExplanation] = useState(false);

  const q = questions[qIndex];
  const value = q ? (formData[q.id] ?? "") : "";
  const isLast = qIndex === questions.length - 1;

  useEffect(() => {
    setShowWarning(!!section.warning);
    setQIndex(0);
    setShowExplanation(false);
  }, [section.id]);

  if (showWarning && section.warning) {
    const lines = section.warning.split("\n\n");
    return (
      <div className="max-w-xl">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          {lines.map((line, i) => (
            <p key={i} className={`text-sm text-stone-700 leading-relaxed ${i > 0 ? "mt-3" : "font-semibold"}`}>
              {line}
            </p>
          ))}
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="w-full rounded-xl py-3.5 px-6 text-[15px] font-semibold text-white"
          style={{ backgroundColor: "#3d6b4a" }}
        >
          I understand — continue
        </button>
      </div>
    );
  }

  if (!q) return null;

  const handleSelect = (v: string) => {
    onChange(q.id, v);
    setShowExplanation(false);
    if (q.type === "yesno" || q.type === "radio") {
      setTimeout(() => {
        if (isLast) onSectionComplete();
        else setQIndex(i => i + 1);
      }, 300);
    }
  };

  return (
    <div className="max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
        {section.shortTitle} · {qIndex + 1} of {questions.length}
      </p>

      <h2 className="font-serif text-xl font-bold text-stone-900 leading-snug mb-6">
        {q.label}
      </h2>

      {q.hint && <p className="text-sm text-stone-500 mb-4">{q.hint}</p>}

      {/* Yes/No */}
      {q.type === "yesno" && (
        <div className="grid grid-cols-2 gap-3">
          {(["yes", "no"] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              className={`rounded-xl py-4 text-[15px] font-semibold border-2 transition-all ${
                value === opt
                  ? "border-[#3d6b4a] bg-[#EEF5E8] text-[#3d6b4a]"
                  : "border-stone-200 text-stone-700 hover:border-stone-300"
              }`}
            >
              {opt === "yes" ? "Yes" : "No"}
            </button>
          ))}
        </div>
      )}

      {/* Radio */}
      {q.type === "radio" && (
        <div className="space-y-2">
          {q.options?.map((o) => {
            const selected = value === o.value;
            return (
              <button
                key={o.value}
                onClick={() => handleSelect(o.value)}
                className={`w-full text-left rounded-xl px-5 py-4 border-2 transition-all text-sm font-medium ${
                  selected
                    ? "border-[#3d6b4a] bg-[#EEF5E8] text-stone-900"
                    : "border-stone-200 text-stone-700 hover:border-stone-300"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Explanation (Part 9) */}
      {q.explanation && (
        <div className="mt-4">
          <button
            onClick={() => setShowExplanation(v => !v)}
            className="text-xs text-[#3d6b4a] hover:underline"
          >
            {showExplanation ? "▲ Hide explanation" : "▼ What does this mean?"}
          </button>
          {showExplanation && (
            <p className="mt-2 text-xs text-stone-500 leading-relaxed bg-stone-50 border border-stone-200 rounded-lg px-4 py-3">
              {q.explanation}
            </p>
          )}
        </div>
      )}

      {/* Manual continue for non-auto-advance types */}
      {q.type !== "yesno" && q.type !== "radio" && (
        <button
          onClick={() => {
            if (isLast) onSectionComplete();
            else setQIndex(i => i + 1);
          }}
          disabled={q.required && !value}
          className="mt-6 w-full rounded-xl py-3.5 px-6 text-[15px] font-semibold transition-all"
          style={
            !q.required || value
              ? { backgroundColor: "#3d6b4a", color: "#ffffff" }
              : { backgroundColor: "#e7e5e4", color: "#a8a29e", cursor: "not-allowed" }
          }
        >
          {isLast ? "Complete section" : "Continue"}
        </button>
      )}

      {/* Back / Skip */}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => qIndex > 0 ? setQIndex(i => i - 1) : undefined}
          className="text-sm text-stone-400 hover:text-stone-600"
          disabled={qIndex === 0}
        >
          ← Back
        </button>
        {!q.required && (
          <button
            onClick={() => {
              if (isLast) onSectionComplete();
              else setQIndex(i => i + 1);
            }}
            className="text-sm text-stone-400 hover:text-stone-600"
          >
            Skip for now →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Review section ───────────────────────────────────────────────────────────

function ReviewSection({
  formData,
  token,
  onNavigate,
}: {
  formData: Record<string, string>;
  token: string;
  onNavigate: (id: string) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const required = getRequiredQuestions();
  const unanswered = required.filter((q) => !formData[q.id]);
  const isComplete = unanswered.length === 0;

  const handleDownload = async (preview: boolean) => {
    setDownloading(true);
    try {
      const url = `/api/form/pdf?token=${token}&preview=${preview}`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "Failed to generate PDF.");
        return;
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = preview ? "i485-draft.pdf" : "i485-completed.pdf";
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">Review & Preview</h2>
      <p className="text-sm text-stone-500 mb-8">Check your answers before downloading your completed I-485.</p>

      {unanswered.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            {unanswered.length} required question{unanswered.length !== 1 ? "s" : ""} still need{unanswered.length === 1 ? "s" : ""} an answer
          </p>
          <ul className="space-y-1">
            {unanswered.slice(0, 5).map((q) => (
              <li key={q.id} className="text-xs text-amber-700">• {q.label}</li>
            ))}
            {unanswered.length > 5 && (
              <li className="text-xs text-amber-600">…and {unanswered.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Section-by-section summary */}
      <div className="space-y-4 mb-8">
        {SECTIONS.filter((s) => s.layout !== "review").map((section) => {
          const answered = section.questions.filter((q) => formData[q.id]);
          const total    = section.questions.length;
          const status   = getSectionStatus(section, formData);
          return (
            <div key={section.id} className="bg-white border border-stone-200 rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-800">{section.title}</p>
                <p className="text-xs text-stone-400 mt-0.5">{answered.length} of {total} answered</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  status === "complete"    ? "bg-green-100 text-green-700"   :
                  status === "in_progress" ? "bg-amber-100 text-amber-700"  :
                  "bg-stone-100 text-stone-500"
                }`}>
                  {status === "complete" ? "Complete" : status === "in_progress" ? "In progress" : "Not started"}
                </span>
                <button
                  onClick={() => onNavigate(section.id)}
                  className="text-xs text-[#3d6b4a] hover:underline"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Download buttons */}
      <div className="space-y-3">
        <button
          onClick={() => handleDownload(true)}
          disabled={downloading}
          className="w-full rounded-xl py-3.5 px-6 text-[15px] font-semibold border-2 border-[#3d6b4a] text-[#3d6b4a] hover:bg-[#EEF5E8] transition-colors disabled:opacity-50"
        >
          {downloading ? "Generating…" : "Preview DRAFT PDF"}
        </button>
        <button
          onClick={() => handleDownload(false)}
          disabled={!isComplete || downloading}
          title={!isComplete ? "Answer all required questions to download the final version" : undefined}
          className="w-full rounded-xl py-3.5 px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#3d6b4a" }}
        >
          {downloading ? "Generating…" : "Download Completed I-485"}
        </button>
        {!isComplete && (
          <p className="text-center text-xs text-stone-400">
            Answer all required questions to unlock the final download.
          </p>
        )}
      </div>

      <p className="mt-6 text-xs text-stone-400 text-center leading-relaxed">
        Always review your completed form with a licensed immigration attorney before filing with USCIS.
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  token: string;
}

export default function FormAssistant({ token }: Props) {
  const [session, setSession]               = useState<FormSession | null>(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [formData, setFormData]             = useState<Record<string, string>>({});
  const [completedParts, setCompletedParts] = useState<string[]>([]);
  const [currentSectionId, setCurrentSectionId] = useState(SECTIONS[0].id);
  const [saving, setSaving]                 = useState(false);
  const [saveStatus, setSaveStatus]         = useState<"idle" | "saved" | "error">("idle");

  // ── Load session ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/form/session?token=${token}`);
        if (!res.ok) {
          setError("Session not found. Please check your link or access code.");
          return;
        }
        const data: FormSession = await res.json();
        setSession(data);
        setFormData(data.form_data ?? {});
        setCompletedParts(data.completed_parts ?? []);
      } catch {
        setError("Failed to load your session. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // ── Save to DB ──────────────────────────────────────────────────────────────
  const save = useCallback(
    async (data: Record<string, string>, parts: string[]) => {
      setSaving(true);
      try {
        const res = await fetch("/api/form/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, formData: data, completedParts: parts }),
        });
        setSaveStatus(res.ok ? "saved" : "error");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("error");
      } finally {
        setSaving(false);
      }
    },
    [token]
  );

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveAndAdvance = async () => {
    const parts = completedParts.includes(currentSectionId)
      ? completedParts
      : [...completedParts, currentSectionId];
    setCompletedParts(parts);
    await save(formData, parts);
    // Advance to next section
    const idx = SECTIONS.findIndex((s) => s.id === currentSectionId);
    if (idx < SECTIONS.length - 1) setCurrentSectionId(SECTIONS[idx + 1].id);
  };

  const handleSectionComplete = async () => {
    await handleSaveAndAdvance();
  };

  const handleNavigate = (sectionId: string) => {
    save(formData, completedParts); // auto-save on navigate
    setCurrentSectionId(sectionId);
  };

  // ── Render states ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-500 text-sm">Loading your form…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="text-stone-700 font-medium mb-2">Session not found</p>
          <p className="text-sm text-stone-500 mb-4">{error}</p>
          <a href="/form" className="text-[#3d6b4a] text-sm underline">Return to I-485 Assistant</a>
        </div>
      </div>
    );
  }

  const currentSection = SECTIONS.find((s) => s.id === currentSectionId) ?? SECTIONS[0];

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#FAF9F7] border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <a href="/" className="font-serif text-lg font-bold text-stone-900 tracking-tight">Throughline</a>
          <div className="flex items-center gap-4">
            {saveStatus === "saved" && <span className="text-xs text-[#3d6b4a]">✓ Saved</span>}
            {saveStatus === "error" && <span className="text-xs text-red-500">Save failed</span>}
            <span className="text-xs text-stone-400">
              Code: <span className="font-mono font-semibold text-stone-600">{session?.access_code}</span>
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 flex gap-10">
        {/* Sidebar */}
        <aside className="hidden md:block">
          <FormSidebar
            formData={formData}
            currentSectionId={currentSectionId}
            onNavigate={handleNavigate}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {currentSection.layout === "grouped" && (
            <GroupedSection
              section={currentSection}
              formData={formData}
              onChange={handleChange}
              onSave={handleSaveAndAdvance}
              saving={saving}
            />
          )}
          {currentSection.layout === "oneAtATime" && (
            <OneAtATimeSection
              section={currentSection}
              formData={formData}
              onChange={handleChange}
              onSectionComplete={handleSectionComplete}
            />
          )}
          {currentSection.layout === "review" && (
            <ReviewSection
              formData={formData}
              token={token}
              onNavigate={handleNavigate}
            />
          )}
        </main>
      </div>
    </div>
  );
}
