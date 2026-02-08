'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowButtonProps extends HTMLMotionProps<"button"> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    glowColor?: string;
    className?: string;
}

export function GlowButton({
    children,
    variant = 'primary',
    glowColor,
    className = '',
    ...props
}: GlowButtonProps) {
    const baseStyles = 'relative px-6 py-3 rounded-2xl font-semibold transition-all duration-300 overflow-hidden group';

    const variantStyles = {
        primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl',
        ghost: 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20',
    };

    const defaultGlow = variant === 'primary' ? 'from-blue-400 to-purple-400'
        : variant === 'secondary' ? 'from-purple-400 to-pink-400'
            : 'from-white/40 to-white/40';

    return (
        <motion.button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            {...props}
        >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Glow effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${glowColor || defaultGlow} opacity-0 group-hover:opacity-75 blur-lg transition-opacity duration-300 -z-10`} />

            {/* Content */}
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </motion.button>
    );
}
