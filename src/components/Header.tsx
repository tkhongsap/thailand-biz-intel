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
    <header className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-cyan)] flex items-center justify-center text-white text-sm font-bold">
          BI
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wide text-[var(--text-primary)] font-display">
            TH-BIZ INTEL
          </h1>
          <p className="text-[9px] font-mono tracking-[0.15em] text-[var(--text-muted)] uppercase">
            Area-Based Business Intelligence · Chiang Mai
          </p>
        </div>
      </div>

      {/* Right side: status + clock */}
      <div className="flex items-center gap-4">
        <span className="live-badge">Live</span>
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          BKK {time}
        </span>
      </div>
    </header>
  );
}
