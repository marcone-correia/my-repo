"use client";

import { useState, useCallback, useEffect } from "react";
import Quiz from "@/components/Quiz";
import { IntakeAnswers } from "@/lib/intakeTypes";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    setIsDemo(new URLSearchParams(window.location.search).get("demo") === "true");
  }, []);

  const [state, setState] = useState<"intake" | "idle" | "creating">("intake");

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

  const handleResume = async (code: string) => {
    const res = await fetch(`/api/form/session?code=${encodeURIComponent(code)}`);
    if (!res.ok) throw new Error("not found");
    const session = await res.json();
    router.push(`/dashboard/${session.magic_token}`);
  };

  if (isDemo) {
    // Lazy-load demo mode to avoid importing heavy deps when not needed
    return <DemoLoader />;
  }

  if (state === "intake") return <Quiz onComplete={handleQuizComplete} onResume={handleResume} />;

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

  // idle fallback — redirect back to intake
  return <Quiz onComplete={handleQuizComplete} onResume={handleResume} />;
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
      setReportView(() => rv.default as React.ComponentType<{ report: unknown; isDemo?: boolean }>);
      setDemoReport(dr.default);
      setLoaded(true);
    });
  }, []);

  if (!loaded || !ReportView || !demoReport) return null;
  return <ReportView report={demoReport} isDemo />;
}
