'use client';

import { motion } from 'framer-motion';

export const FloatingOrbs = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500">
            <motion.div
                className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl"
                animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute top-1/2 -right-20 w-80 h-80 bg-gradient-to-br from-pink-400/30 to-orange-400/30 rounded-full blur-3xl"
                animate={{
                    x: [0, -120, 0],
                    y: [0, 100, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-br from-violet-400/20 to-indigo-400/20 rounded-full blur-3xl"
                animate={{
                    x: [0, -80, 0],
                    y: [0, -80, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute top-3/4 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"
                animate={{
                    x: [0, 100, 0],
                    y: [0, 80, 0],
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
};
