"use client";

import { SECTIONS, getSectionStatus } from "@/lib/formDefinition";

interface Props {
  formData: Record<string, string>;
  currentSectionId: string;
  onNavigate: (sectionId: string) => void;
}

const STATUS_CONFIG = {
  not_started: { dot: "bg-stone-200",   label: "Not started" },
  in_progress: { dot: "bg-amber-400",   label: "In progress" },
  complete:    { dot: "bg-[#3d6b4a]",   label: "Complete"    },
  skipped:     { dot: "bg-stone-300",   label: "Skipped"     },
} as const;

export default function FormSidebar({ formData, currentSectionId, onNavigate }: Props) {
  return (
    <nav className="w-56 flex-shrink-0">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400 mb-4 px-2">
        Sections
      </p>
      <ul className="space-y-0.5">
        {SECTIONS.map((section) => {
          const status = section.layout === "review"
            ? "not_started"
            : getSectionStatus(section, formData);
          const { dot } = STATUS_CONFIG[status];
          const isActive = section.id === currentSectionId;

          const answered = section.questions.filter(
            (q) => formData[q.id] !== undefined && formData[q.id] !== ""
          ).length;
          const total = section.questions.length;

          return (
            <li key={section.id}>
              <button
                onClick={() => onNavigate(section.id)}
                className={`w-full text-left flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors text-sm ${
                  isActive
                    ? "bg-stone-100 text-stone-900 font-medium"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-800"
                }`}
              >
                <span className={`flex-shrink-0 w-2 h-2 rounded-full ${dot}`} />
                <span className="flex-1 leading-tight">{section.shortTitle}</span>
                {total > 0 && (
                  <span className="text-[10px] text-stone-400 flex-shrink-0">
                    {answered}/{total}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
