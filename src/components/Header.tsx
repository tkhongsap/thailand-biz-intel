"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Bangkok",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between px-3 md:px-5 py-2 md:py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] flex items-center justify-center text-white text-xs md:text-sm font-bold shrink-0">
          BI
        </div>
        <div className="min-w-0">
          <h1 className="text-xs md:text-sm font-bold tracking-wide text-[var(--text-primary)] font-display truncate">
            TH-BIZ INTEL
          </h1>
          <p className="text-[8px] md:text-[9px] font-mono tracking-[0.15em] text-[var(--text-muted)] uppercase hidden sm:block">
            Area-Based Business Intelligence · Chiang Mai
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <span className="live-badge">Live</span>
        <span className="font-mono text-[10px] md:text-xs text-[var(--text-secondary)]">
          BKK {time}
        </span>
      </div>
    </header>
  );
}
