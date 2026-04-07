"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ReportView, { ReviewReport } from "@/components/ReportView";
import Quiz from "@/components/Quiz";
import { IntakeAnswers } from "@/lib/intakeTypes";
import demoReport from "@/lib/demoReport";

type AppState = "intake" | "idle" | "loading" | "done" | "error";

const ACCEPTED_EXT = ".pdf,.jpg,.jpeg,.png";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX_DIM = 1600;
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) { height = Math.round((height * MAX_DIM) / width); width = MAX_DIM; }
        else { width = Math.round((width * MAX_DIM) / height); height = MAX_DIM; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      resolve(dataUrl.split(",")[1]);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function getMediaType(file: File): "application/pdf" | "image/jpeg" | "image/png" | null {
  if (file.type === "application/pdf") return "application/pdf";
  if (file.type === "image/jpeg") return "image/jpeg";
  if (file.type === "image/png") return "image/png";
  if (file.name.endsWith(".pdf")) return "application/pdf";
  if (file.name.endsWith(".jpg") || file.name.endsWith(".jpeg")) return "image/jpeg";
  if (file.name.endsWith(".png")) return "image/png";
  return null;
}

export default function Home() {
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    setIsDemo(new URLSearchParams(window.location.search).get("demo") === "true");
  }, []);

  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [state, setState] = useState<AppState>("intake");
  const [intake, setIntake] = useState<IntakeAnswers | null>(null);
  const [caseContext, setCaseContext] = useState("");
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [progressMsg, setProgressMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter((f) => getMediaType(f) !== null);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...valid.filter((f) => !existing.has(f.name + f.size))];
    });
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); }, [addFiles]);
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) addFiles(Array.from(e.target.files)); };

  const MAX_PDF_BYTES = 40 * 1024 * 1024; // 40 MB — PDFs only (images are compressed before this check)

  const runReview = async () => {
    if (files.length === 0) return;
    const pdfSize = files.filter(f => getMediaType(f) === "application/pdf").reduce((sum, f) => sum + f.size, 0);
    if (pdfSize > MAX_PDF_BYTES) {
      setErrorMsg(`Your PDFs total ${(pdfSize / 1024 / 1024).toFixed(1)} MB, which exceeds the 40 MB limit. Try splitting the review into two batches.`);
      setState("error");
      return;
    }
    setState("loading"); setReport(null); setErrorMsg(""); setProgressMsg("");
    try {
      const filePayloads = await Promise.all(files.map(async (file) => {
        const mediaType = getMediaType(file)!;
        const isPdf = mediaType === "application/pdf";
        const data = isPdf ? await fileToBase64(file) : await compressImage(file);
        return { filename: file.name, mediaType: isPdf ? mediaType : "image/jpeg" as const, data };
      }));
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: filePayloads, intake, caseContext }),
      });
      if (!res.ok || !res.body) throw new Error("Something went wrong.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const msg = JSON.parse(line);
          if (msg.type === "progress") setProgressMsg(msg.message);
          else if (msg.type === "result") { setReport(msg.report as ReviewReport); setState("done"); }
          else if (msg.type === "error") throw new Error(msg.message);
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
      setState("error");
    }
  };

  const handleQuizComplete = (answers: IntakeAnswers, context: string) => {
    setIntake(answers);
    setCaseContext(context);
    setState("idle");
  };

  const reset = () => { setFiles([]); setReport(null); setErrorMsg(""); setProgressMsg(""); setIntake(null); setCaseContext(""); setState("intake"); };

  if (isDemo) return <ReportView report={demoReport} isDemo />;
  if (state === "intake") return <Quiz onComplete={handleQuizComplete} />;
  if (state === "done" && report) return <ReportView report={report} onReset={reset} />;

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">Throughline</h1>
        <p className="mt-2 text-stone-500 text-sm leading-relaxed">
          Now upload your documents — all at once is fine.
        </p>
      </header>

      {state !== "done" && (
        <>
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed px-8 py-12 text-center transition-colors ${dragging ? "border-sage-600 bg-sage-600/5" : "border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50"}`}
          >
            <input ref={inputRef} type="file" multiple accept={ACCEPTED_EXT} className="sr-only" onChange={onInputChange} />
            <div className="pointer-events-none">
              <svg className="mx-auto mb-3 h-10 w-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm font-medium text-stone-600">Drop files here, or click to browse</p>
              <p className="mt-1 text-xs text-stone-400">PDF, JPG, PNG — multiple files accepted</p>
            </div>
          </div>

          {files.length > 0 && (
            <ul className="mt-4 space-y-2">
              {files.map((file, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-white border border-stone-200 px-4 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex-shrink-0 text-stone-400 text-sm">{file.name.endsWith(".pdf") ? "📄" : "🖼"}</span>
                    <span className="truncate text-sm text-stone-700">{file.name}</span>
                    <span className="flex-shrink-0 text-xs text-stone-400">{(file.size / 1024).toFixed(0)} KB</span>
                  </div>
                  <button onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} className="flex-shrink-0 ml-3 text-stone-400 hover:text-stone-600 transition-colors" aria-label="Remove file">×</button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6">
            <button
              onClick={runReview}
              disabled={files.length === 0 || state === "loading"}
              className={`w-full rounded-lg py-3 px-6 text-sm font-medium transition-colors ${files.length === 0 || state === "loading" ? "bg-stone-200 text-stone-400 cursor-not-allowed" : "text-white"}`}
              style={files.length > 0 && state !== "loading" ? { backgroundColor: "#3d6b4a" } : undefined}
            >
              {state === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {progressMsg || "Reviewing your documents…"}
                </span>
              ) : "Run Review"}
            </button>
            {files.length > 0 && state === "idle" && (
              <p className="mt-2 text-center text-xs text-stone-400">{files.length} file{files.length !== 1 ? "s" : ""} selected</p>
            )}
          </div>
        </>
      )}

      {state === "error" && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-5 py-4">
          <p className="text-sm font-medium text-red-800">Something went wrong</p>
          <p className="mt-1 text-sm text-red-700">{errorMsg}</p>
          <button onClick={reset} className="mt-3 text-sm text-red-700 underline underline-offset-2 hover:text-red-900">Try again</button>
        </div>
      )}

    </main>
  );
}
