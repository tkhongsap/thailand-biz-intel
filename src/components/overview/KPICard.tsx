"use client";

import { useEffect, useRef, useState } from "react";

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  accentColor: string;
  delay?: number;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
}

function useCountUp(target: number, duration = 1000, delay = 0): number {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) return;
    const timer = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime.current) startTime.current = timestamp;
        const elapsed = timestamp - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        setCurrent(Math.floor(target * eased));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);

  return current;
}

export default function KPICard({
  label,
  value,
  subtitle,
  accentColor,
  delay = 0,
}: KPICardProps) {
  return (
    <div
      className="glass-card hover-glow p-4 relative overflow-hidden fade-in-up"
      style={{
        borderLeft: `4px solid ${accentColor}`,
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute top-0 left-0 w-16 h-full opacity-10"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
      />

      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-1">
        {label}
      </p>
      <p
        className="font-display text-2xl font-bold"
        style={{ color: accentColor }}
      >
        {value}
      </p>
      {subtitle && (
        <p className="font-mono text-[10px] text-[var(--text-secondary)] mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export { useCountUp };
