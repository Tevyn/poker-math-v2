"use client";

interface FeedbackPanelProps {
  released: boolean;
  isWithinTolerance: boolean;
  truthPercent: number;
  onNext: () => void;
}

export function FeedbackPanel({
  released,
  isWithinTolerance,
  truthPercent,
  onNext,
}: FeedbackPanelProps) {
  if (!released) {
    return (
      <div
        data-testid="feedback-panel"
        data-released="false"
        aria-hidden
        className="h-20"
      />
    );
  }
  const verdict = isWithinTolerance ? "close enough" : "not quite";
  const verdictClass = isWithinTolerance
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";
  return (
    <div
      data-testid="feedback-panel"
      data-released="true"
      className="flex h-20 flex-col items-center justify-between gap-2"
    >
      <p className={`text-base font-semibold tracking-tight ${verdictClass}`}>
        {verdict} · {truthPercent.toFixed(1)}%
      </p>
      <button
        type="button"
        onClick={onNext}
        className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
      >
        next →
      </button>
    </div>
  );
}
