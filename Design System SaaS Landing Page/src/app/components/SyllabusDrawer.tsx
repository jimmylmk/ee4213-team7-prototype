import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, FileText, X } from "lucide-react";
import { Course } from "../data/courseData";
import { Button } from "./ui/button";
import { m } from "motion/react";
import { AnimatedOverlay } from "./AnimatedOverlay";
import { usePrefersReducedMotion } from "../utils/motion";

interface SyllabusDrawerProps {
  course: Course;
  open: boolean;
  isEnrolled: boolean;
  isStaged: boolean;
  stageBlockReason?: string | null;
  onClose: () => void;
  onSelectCourse?: (code: string) => void;
  onStage: (code: string) => void;
}

function CompassIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="A friendly explorer holding a compass, searching for a missing document"
      className="syllabus-float h-44 w-44"
    >
      <style>{`
        @keyframes syllabus-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .syllabus-float { animation: syllabus-float 3.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .syllabus-float { animation: none; } }
      `}</style>
      <ellipse cx="100" cy="180" rx="52" ry="8" fill="#171717" opacity="0.08" />
      <circle cx="100" cy="100" r="72" fill="#ece9ff" />
      <circle cx="100" cy="100" r="56" fill="#fff" stroke="#171717" strokeWidth="4" />
      <circle cx="100" cy="100" r="48" fill="none" stroke="#d9ccff" strokeWidth="2" strokeDasharray="3 5" />
      <path d="M100 56 L112 100 L100 144 L88 100 Z" fill="#d9ff63" stroke="#171717" strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 56 L112 100 L88 100 Z" fill="#6c4cff" stroke="#171717" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="100" cy="100" r="5" fill="#171717" />
      <rect x="92" y="36" width="16" height="10" rx="3" fill="#171717" />
      <circle cx="82" cy="84" r="0" />
      <path d="M150 52 q10 -10 20 0" fill="none" stroke="#6c4cff" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 128 q8 -9 16 0" fill="none" stroke="#6c4cff" strokeWidth="3" strokeLinecap="round" />
      <text x="156" y="48" fontSize="20" fontWeight="700" fill="#171717">?</text>
    </svg>
  );
}

export function SyllabusDrawer({
  course,
  open,
  isEnrolled,
  isStaged,
  stageBlockReason,
  onClose,
  onStage,
}: SyllabusDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const stageDisabled = isEnrolled || isStaged || Boolean(stageBlockReason);
  const stageLabel = isEnrolled
    ? 'Currently Enrolled'
    : isStaged
      ? 'Already Staged'
      : `Stage ${course.code} in Timetable`;

  return (
    <AnimatedOverlay
      open={open}
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <m.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="syllabus-drawer-title"
        tabIndex={-1}
        className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl outline-none"
        initial={{ x: reducedMotion ? 0 : "100%" }}
        animate={{ x: 0 }}
        exit={{ x: reducedMotion ? 0 : "100%" }}
        transition={{ duration: reducedMotion ? 0 : 0.18, ease: "easeOut" }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-black/10 px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Official Syllabus</p>
            <h2 id="syllabus-drawer-title" className="truncate text-base font-bold">
              {course.code} · {course.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close syllabus drawer"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-black/10 hover:bg-[#f5f4ef]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1">
          {course.syllabusPdf ? (
            <div className="flex h-full flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 bg-[#f8f7f3] px-5 py-2 text-xs">
                <span className="flex items-center gap-2 font-medium">
                  <FileText className="h-3.5 w-3.5 text-[#6c4cff]" aria-hidden="true" />
                  {course.syllabusYear === '2025/26' ? '2025/26 Official CityU Syllabus · Latest Active Catalog Edition (Unchanged for 2026/27)' : '2026/27 Official CityU Course Syllabus · Revised for Current Intake'} · Offline Archived PDF
                </span>
                <a
                  href={course.syllabusPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-semibold text-[#6c4cff] hover:underline"
                >
                  Open PDF in New Tab
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </div>
              <iframe
                key={course.syllabusPdf}
                src={course.syllabusPdf}
                title={`${course.code} Official CityU Syllabus`}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-5 overflow-y-auto px-6 py-10 text-center">
              <CompassIllustration />
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-bold">
                  Looks like this course's official syllabus PDF isn&rsquo;t in our offline archive yet.
                </h3>
                <p className="text-sm text-muted-foreground">
                  Nothing is wrong with your schedule — we simply haven&rsquo;t archived {course.code}&rsquo;s official
                  syllabus. You can still read its summary in the Course Inspector.
                </p>
              </div>
              <Button onClick={onClose} className="bg-[#171717] text-white hover:bg-[#6c4cff]">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to Course Inspector Summary
              </Button>
            </div>
          )}
        </div>

        <footer className="sticky bottom-0 border-t border-black/10 bg-white px-5 py-3">
          {stageBlockReason && <p id="syllabus-credit-limit" className="mb-2 text-xs font-medium text-red-600">{stageBlockReason}</p>}
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
            <Button
              size="sm"
              disabled={stageDisabled}
              aria-describedby={stageBlockReason ? 'syllabus-credit-limit' : undefined}
              onClick={() => onStage(course.code)}
              className="bg-[#171717] text-xs text-white hover:bg-[#6c4cff]"
            >
              {stageLabel}
              {!stageDisabled && <ArrowRight className="ml-1.5 h-3.5 w-3.5" />}
            </Button>
          </div>
        </footer>
      </m.div>
    </AnimatedOverlay>
  );
}
