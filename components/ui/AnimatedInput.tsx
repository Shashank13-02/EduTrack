'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
    ({ label, className, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const [hasValue, setHasValue] = useState(false);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasValue(e.target.value !== '');
            if (props.onChange) {
                props.onChange(e);
            }
        };

        return (
            <div className="relative">
                <input
                    ref={ref}
                    {...props}
                    onChange={handleChange}
                    onFocus={(e) => {
                        setIsFocused(true);
                        if (props.onFocus) props.onFocus(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        if (props.onBlur) props.onBlur(e);
                    }}
                    className={cn(
                        "w-full px-4 pt-6 pb-2 rounded-xl",
                        "bg-white/50 dark:bg-slate-800/50",
                        "border-2 border-slate-200 dark:border-slate-700",
                        "focus:border-blue-500 dark:focus:border-blue-400",
                        "focus:ring-4 focus:ring-blue-500/10",
                        "transition-all duration-300",
                        "text-slate-900 dark:text-slate-100",
                        "placeholder:text-transparent",
                        className
                    )}
                />
                {label && (
                    <motion.label
                        initial={false}
                        animate={{
                            top: isFocused || hasValue ? '0.5rem' : '1.25rem',
                            fontSize: isFocused || hasValue ? '0.75rem' : '1rem',
                            color: isFocused ? 'rgb(59, 130, 246)' : 'rgb(100, 116, 139)',
                        }}
                        className="absolute left-4 pointer-events-none font-medium"
                    >
                        {label}
                    </motion.label>
                )}
                {isFocused && (
                    <motion.div
                        layoutId="input-border"
                        className="absolute inset-0 rounded-xl border-2 border-blue-500 pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </div>
        );
    }
);

AnimatedInput.displayName = 'AnimatedInput';
