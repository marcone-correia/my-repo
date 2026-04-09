"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Quiz from "@/components/Quiz";
import { IntakeAnswers } from "@/lib/intakeTypes";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    setIsDemo(new URLSearchParams(window.location.search).get("demo") === "true");
  }, []);

  const [state, setState]         = useState<"intake" | "idle" | "creating">("intake");
  const [resumeCode, setResumeCode] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [resumeLoading, setResumeLoading] = useState(false);

  // After quiz completes: create a session with intake answers → redirect to dashboard
  const handleQuizComplete = useCallback(async (answers: IntakeAnswers) => {
    setState("creating");
    try {
      const res = await fetch("/api/form/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intakeAnswers: answers }),
      });
      if (!res.ok) throw new Error("Failed to create session.");
      const { magicToken } = await res.json();
      router.push(`/dashboard/${magicToken}`);
    } catch {
      // Fall back to showing the upload UI if something went wrong
      setState("idle");
    }
  }, [router]);

  const handleResume = async () => {
    const code = resumeCode.trim().toUpperCase();
    if (!code) return;
    setResumeLoading(true);
    setResumeError("");
    try {
      const res = await fetch(`/api/form/session?code=${encodeURIComponent(code)}`);
      if (!res.ok) {
        setResumeError("Code not found — double-check and try again.");
        setResumeLoading(false);
        return;
      }
      const session = await res.json();
      router.push(`/dashboard/${session.magic_token}`);
    } catch {
      setResumeError("Something went wrong. Please try again.");
      setResumeLoading(false);
    }
  };

  if (isDemo) {
    // Lazy-load demo mode to avoid importing heavy deps when not needed
    return <DemoLoader />;
  }

  if (state === "intake") return <Quiz onComplete={handleQuizComplete} />;

  if (state === "creating") {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-[#3d6b4a] rounded-full animate-spin mb-4" />
          <p className="text-stone-500 text-sm">Setting up your case…</p>
        </div>
      </div>
    );
  }

  // idle — shouldn't normally be reached in new flow, kept as fallback
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">Throughline</h1>
        <p className="mt-2 text-stone-500 text-sm leading-relaxed">
          Have a case code? Pick up where you left off.
        </p>
      </header>

      <div className="bg-white border border-stone-200 rounded-xl px-5 py-5">
        <p className="text-sm font-semibold text-stone-800 mb-1">Resume your case</p>
        <p className="text-xs text-stone-500 mb-3">Enter your access code (e.g. TL-4X9K)</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={resumeCode}
            onChange={(e) => setResumeCode(e.target.value.toUpperCase())}
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
    </main>
  );
}

// Demo loader — only imported when ?demo=true
function DemoLoader() {
  const [loaded, setLoaded] = useState(false);
  const [ReportView, setReportView] = useState<React.ComponentType<{ report: unknown; isDemo?: boolean }> | null>(null);
  const [demoReport, setDemoReport] = useState<unknown>(null);

  useEffect(() => {
    Promise.all([
      import("@/components/ReportView"),
      import("@/lib/demoReport"),
    ]).then(([rv, dr]) => {
      setReportView(() => rv.default);
      setDemoReport(dr.default);
      setLoaded(true);
    });
  }, []);

  if (!loaded || !ReportView || !demoReport) return null;
  return <ReportView report={demoReport} isDemo />;
}
