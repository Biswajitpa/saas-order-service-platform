import React from "react";

export function Card({ className="", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border border-white/12 bg-white/6 shadow-glow ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-5 pt-5 pb-3">
      <div className="text-lg font-semibold">{title}</div>
      {subtitle && <div className="text-sm text-white/60 mt-1">{subtitle}</div>}
    </div>
  );
}

export function CardBody({ className="", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}
