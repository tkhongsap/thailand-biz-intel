"use client";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = "Something went wrong", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] p-8">
      <div className="w-14 h-14 rounded-full bg-[var(--accent-red)]/10 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <p className="text-sm font-display text-[var(--text-secondary)] mb-2">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 text-xs font-mono text-[var(--accent-blue)] border border-[var(--accent-blue)]/30 rounded-md hover:bg-[var(--accent-blue)]/10 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  );
}
