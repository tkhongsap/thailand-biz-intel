"use client";

interface ShimmerProps {
  className?: string;
}

export default function Shimmer({ className = "" }: ShimmerProps) {
  return <div className={`shimmer ${className}`} />;
}
