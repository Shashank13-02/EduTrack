'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        if (resolvedTheme === 'dark') {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    };

    if (!mounted) {
        return <div className="w-14 h-14" />; // Prevent hydration mismatch
    }

    return (
        <motion.button
            onClick={toggleTheme}
            className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle theme"
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            />

            <div className="relative z-10">
                {resolvedTheme === 'light' ? (
                    <motion.div
                        key="moon"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <MdDarkMode className="w-6 h-6 text-slate-700" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <MdLightMode className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                )}
            </div>

            {/* Glow effect */}
            <motion.div
                className="absolute inset-0 rounded-2xl blur-md bg-gradient-to-br from-blue-400 to-purple-600 opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                style={{ zIndex: -1 }}
            />
        </motion.button>
    );
}
