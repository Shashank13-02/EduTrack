import React from 'react';
import { cn } from '@/lib/utils';

export function Loading({ text = 'Loading...' }: { text?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] py-12 space-y-6">
            <div className="relative w-20 h-20">
                {/* Background ring */}
                <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full opacity-50"></div>
                {/* Spinning ring */}
                <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-400 rounded-full animate-spin border-t-transparent shadow-[0_0_15px_rgba(79,70,229,0.3)]"></div>
                {/* Pulse inner circle */}
                <div className="absolute inset-4 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full animate-pulse"></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-bold animate-pulse tracking-widest text-xs uppercase">{text}</p>
        </div>
    );
}

export function LoadingSpinner({
    size = 'md',
    className
}: {
    size?: 'sm' | 'md' | 'lg',
    className?: string
}) {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <div className={cn(sizeClasses[size], "border-white/20 rounded-full")}></div>
            <div
                className={cn(
                    sizeClasses[size],
                    "border-white rounded-full animate-spin border-t-transparent absolute"
                )}
            ></div>
        </div>
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-card rounded-xl shadow-md border border-border p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
    );
}
