import { cn } from '@/lib/utils';
import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className,
    hover = true
}) => {
    return (
        <div
            className={cn(
                "relative rounded-3xl overflow-hidden",
                "bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-white/70 dark:bg-slate-900/50",
                "backdrop-blur-xl",
                "border border-blue-100/50 dark:border-slate-700/30",
                "shadow-xl shadow-blue-100/20 dark:shadow-black/20",
                hover && "transition-all duration-300 hover:shadow-2xl hover:shadow-blue-200/30 dark:hover:shadow-black/30 hover:-translate-y-1 hover:border-blue-200",
                className
            )}
        >
            {/* Glass reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-transparent to-transparent dark:from-white/5 pointer-events-none" />

            {children}
        </div>
    );
};
