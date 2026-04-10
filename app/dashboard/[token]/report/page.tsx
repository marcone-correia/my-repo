"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReportView, { ReviewReport } from "@/components/ReportView";

export default function ReportPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [progress, setProgress] = useState("Starting review…");
  const [report, setReport] = useState<ReviewReport | null>(null);

  const runReview = async () => {
    setStatus("loading");
    setProgress("Starting review…");
    setReport(null);
    try {
      const res = await fetch("/api/review/case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok || !res.body) throw new Error("Review failed.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const msg = JSON.parse(line);
          if (msg.type === "progress") setProgress(msg.message);
          else if (msg.type === "result") {
            setReport(msg.report as ReviewReport);
            setStatus("done");
          } else if (msg.type === "error") throw new Error(msg.message);
        }
      }
    } catch (err) {
      setProgress(err instanceof Error ? err.message : "Review failed.");
      setStatus("error");
    }
  };

  // Check for existing report first, then auto-run if none
  useEffect(() => {
    fetch(`/api/form/session?token=${token}`)
      .then((r) => r.json())
      .then((s) => {
        if (s.last_review) {
          setReport(s.last_review as ReviewReport);
          setStatus("done");
        } else {
          runReview();
        }
      })
      .catch(() => runReview());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#FAF9F7] border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <a
            href={`/dashboard/${token}`}
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Back to Dashboard
          </a>
          <span className="font-serif text-lg font-bold text-stone-900 tracking-tight">Throughline</span>
          <div className="w-32" />
        </div>
      </header>

      {status === "loading" && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-10 h-10 border-2 border-stone-200 border-t-[#3d6b4a] rounded-full animate-spin" />
          <p className="text-stone-500 text-sm text-center max-w-xs">{progress}</p>
        </div>
      )}

      {status === "error" && (
        <div className="max-w-xl mx-auto px-6 py-12">
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 mb-6">
            <p className="text-sm font-semibold text-red-800 mb-1">Review failed</p>
            <p className="text-sm text-red-700">{progress}</p>
          </div>
          <button
            onClick={runReview}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "#3d6b4a" }}
          >
            Try Again →
          </button>
        </div>
      )}

      {status === "done" && report && (
        <div>
          <ReportView report={report} />
          <div className="max-w-5xl mx-auto px-6 py-8 border-t border-stone-100 flex items-center justify-between">
            <a
              href={`/dashboard/${token}`}
              className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
            >
              ← Back to Dashboard
            </a>
            <button
              onClick={runReview}
              className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#3d6b4a" }}
            >
              Re-run Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
