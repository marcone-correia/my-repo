"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FormEntryPage() {
  const router = useRouter();
  const [mode, setMode]             = useState<"start" | "return" | null>(null);
  const [accessCode, setAccessCode] = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const handleStart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/form/create", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create session.");
      const { magicToken, accessCode: code } = await res.json();
      // Show the user their code, then redirect
      router.push(`/form/${magicToken}?new=1&code=${code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!accessCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/form/session?code=${encodeURIComponent(accessCode.trim())}`);
      if (!res.ok) {
        setError("Code not found. Double-check and try again.");
        setLoading(false);
        return;
      }
      const session = await res.json();
      router.push(`/form/${session.magic_token}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <header className="border-b border-stone-200 bg-[#FAF9F7]">
        <div className="max-w-xl mx-auto px-6 h-12 flex items-center">
          <a href="/" className="font-serif text-lg font-bold text-stone-900 tracking-tight">Throughline</a>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-6 py-14">
        <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight mb-3">
          I-485 Form Assistant
        </h1>
        <p className="text-stone-500 text-[15px] leading-relaxed mb-10">
          Answer questions one at a time and Throughline will fill out the official USCIS I-485 form for you. Your progress is saved automatically.
        </p>

        {!mode && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("start")}
              className="w-full rounded-xl py-4 px-6 text-left border-2 border-stone-200 hover:border-[#3d6b4a] transition-colors bg-white"
            >
              <p className="text-[15px] font-semibold text-stone-900">Start a new form</p>
              <p className="text-sm text-stone-500 mt-0.5">Begin filling out the I-485 from scratch. You'll get a save code to return later.</p>
            </button>
            <button
              onClick={() => setMode("return")}
              className="w-full rounded-xl py-4 px-6 text-left border-2 border-stone-200 hover:border-[#3d6b4a] transition-colors bg-white"
            >
              <p className="text-[15px] font-semibold text-stone-900">Return to a saved form</p>
              <p className="text-sm text-stone-500 mt-0.5">Continue where you left off. Enter your access code or use your magic link.</p>
            </button>
          </div>
        )}

        {mode === "start" && (
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="font-semibold text-stone-900 mb-3">Before you begin</h2>
            <ul className="space-y-2 text-sm text-stone-600 mb-6">
              <li className="flex gap-2"><span className="text-[#3d6b4a] font-bold">1.</span> We'll give you a 6-character access code (e.g. TL-4X9K) — write it down.</li>
              <li className="flex gap-2"><span className="text-[#3d6b4a] font-bold">2.</span> Bookmark the URL — it's your magic link to return anytime.</li>
              <li className="flex gap-2"><span className="text-[#3d6b4a] font-bold">3.</span> Your answers are saved automatically after each section.</li>
            </ul>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full rounded-xl py-3.5 px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#3d6b4a" }}
            >
              {loading ? "Creating your form…" : "Start the I-485 Assistant →"}
            </button>
            <button onClick={() => setMode(null)} className="mt-3 text-sm text-stone-400 hover:text-stone-600 w-full text-center">← Back</button>
          </div>
        )}

        {mode === "return" && (
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="font-semibold text-stone-900 mb-1">Enter your access code</h2>
            <p className="text-sm text-stone-500 mb-4">Your code looks like <span className="font-mono font-semibold">TL-4X9K</span>. Or use your magic link directly.</p>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleReturn()}
              placeholder="TL-XXXX"
              className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm font-mono text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#3d6b4a] focus:ring-1 focus:ring-[#3d6b4a] mb-3"
            />
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <button
              onClick={handleReturn}
              disabled={loading || !accessCode.trim()}
              className="w-full rounded-xl py-3.5 px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: "#3d6b4a" }}
            >
              {loading ? "Looking up…" : "Continue →"}
            </button>
            <button onClick={() => setMode(null)} className="mt-3 text-sm text-stone-400 hover:text-stone-600 w-full text-center">← Back</button>
          </div>
        )}

        <p className="mt-8 text-xs text-stone-400 text-center leading-relaxed">
          This tool is for educational purposes only. Always review your completed form with a licensed immigration attorney before filing with USCIS.
        </p>
      </div>
    </div>
  );
}
