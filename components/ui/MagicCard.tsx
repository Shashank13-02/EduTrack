'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface MagicCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  gradient?: boolean;
  glow?: boolean;
  className?: string;
}

export function MagicCard({
  children,
  gradient = false,
  glow = true,
  className = '',
  ...props
}: MagicCardProps) {
  return (
    <motion.div
      className={`relative group ${className}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {/* Gradient border */}
      {gradient && (
        <div
          className="
            pointer-events-none
            absolute -inset-[1px] rounded-[inherit]
            bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500
            opacity-0 group-hover:opacity-100
            transition-opacity duration-500 blur-sm
          "
        />
      )}

      {/* Glow */}
      {glow && (
        <div
          className="
            pointer-events-none
            absolute -inset-[2px] rounded-[inherit]
            bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20
            opacity-0 group-hover:opacity-100
            transition-opacity duration-500 blur-xl
          "
        />
      )}

      {/* CARD BODY */}
      <div
        className="
          relative h-full rounded-[inherit]
          backdrop-blur-xl
          border border-slate-300/70 dark:border-slate-700/40
          shadow-xl dark:shadow-2xl
          transition-all duration-300
        "
      >
        {/* Glass overlay (lighter in light mode) */}
        <div
          className="
            pointer-events-none
            absolute inset-0 rounded-[inherit]
            bg-gradient-to-br
            from-white/60 to-transparent
            dark:from-white/10 dark:to-transparent
          "
        />

        {/* CONTENT */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
