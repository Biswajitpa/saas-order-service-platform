import { motion } from "framer-motion";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  size?: "sm" | "md";
};

export function Button({ variant="primary", size="md", className="", ...props }: Props) {
  const base = "rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-white/20";
  const v = variant === "primary"
    ? "bg-white/12 hover:bg-white/16 border border-white/15 shadow-glow"
    : "bg-transparent hover:bg-white/8 border border-white/12";
  const s = size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-2.5 text-sm";
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      className={`${base} ${v} ${s} ${className}`}
      {...props}
    />
  );
}
