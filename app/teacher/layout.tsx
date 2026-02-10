'use client';

import React, { useState, useEffect } from 'react';
import { TeacherSidebar } from '@/components/teacher/Sidebar';
import { motion } from 'framer-motion';

import { ParticleBackground } from '@/components/ui/ParticleBackground';

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex transition-colors duration-500">
            <div className="fixed inset-0 pointer-events-none z-0">
                <ParticleBackground />
            </div>

            <TeacherSidebar isCollapsed={isCollapsed} onToggle={setIsCollapsed} />

            <motion.main
                initial={false}
                animate={{
                    paddingLeft: isCollapsed ? '80px' : '280px',
                }}
                className="flex-1 w-full min-h-screen relative z-10"
            >
                <div className="max-w-[1600px] mx-auto p-4 md:p-10">
                    {children}
                </div>
            </motion.main>
        </div>
    );
}
