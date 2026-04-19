"use client";

import { useState, useRef, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/src/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary:   "bg-flow/15    hover:bg-flow/25    border-flow/35    text-flow",
  secondary: "bg-foam/5     hover:bg-foam/10    border-foam/20    text-foam",
  danger:    "bg-toxic/15   hover:bg-toxic/25   border-toxic/35   text-toxic",
  ghost:     "bg-transparent hover:bg-foam/5    border-transparent text-foam/60 hover:text-foam",
};

interface Ripple { id: number; x: number; y: number }

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function RippleButton({
  children,
  className,
  variant = "primary",
  disabled,
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const id = Date.now();
      setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 650);
    }
    onClick?.(e);
  };

  return (
    <motion.button
      ref={ref}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled   ? {} : { scale: 0.97 }}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "relative overflow-hidden rounded-xl border px-5 py-2.5",
        "font-semibold text-sm transition-colors duration-200",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...(props as object)}
    >
      {/* Ripple splash */}
      {ripples.map(r => (
        <motion.span
          key={r.id}
          initial={{ scale: 0, opacity: 0.45 }}
          animate={{ scale: 5, opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="absolute h-8 w-8 rounded-full bg-white/20 pointer-events-none"
          style={{ left: r.x - 16, top: r.y - 16 }}
        />
      ))}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
