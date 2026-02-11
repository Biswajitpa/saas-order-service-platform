import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className="", ...props }: Props) {
  return (
    <input
      className={`w-full rounded-xl bg-white/6 border border-white/12 px-3 py-2.5 text-sm outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10 ${className}`}
      {...props}
    />
  );
}
