'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    Circle,
    Coffee,
    BookOpen,
    Zap,
    Loader2,
    PartyPopper,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
    taskId: string;
    title: string;
    description: string;
    time?: string;
    type: 'study' | 'skill' | 'rest';
    completed: boolean;
    completedAt: Date | null;
    index: number;
}

interface TodaysTasksProps {
    dayNumber: number;
    dayName: string; // (kept for compatibility, not used)
    date: string;
    tasks: Task[];
    completionStats: {
        completed: number;
        total: number;
        percentage: number;
    };
    onTaskToggle: (taskId: string) => Promise<void>;
}

export function TodaysTasks({
    dayNumber,
    date,
    tasks,
    completionStats,
    onTaskToggle
}: TodaysTasksProps) {
    const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);

    /* 🇮🇳 IST DATE FIX (THIS IS THE KEY PART) */
    const istDate = new Date(
        new Date(date).toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
        })
    );

    useEffect(() => {
        if (completionStats.percentage === 100 && completionStats.total > 0) {
            setShowCelebration(true);
            const timer = setTimeout(() => setShowCelebration(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [completionStats.percentage, completionStats.total]);

    const handleTaskToggle = async (taskId: string) => {
        setLoadingTaskId(taskId);
        try {
            await onTaskToggle(taskId);
        } finally {
            setLoadingTaskId(null);
        }
    };

    const getTaskIcon = (type: string) => {
        switch (type) {
            case 'rest':
                return <Coffee className="w-5 h-5 text-emerald-500" />;
            case 'skill':
                return <Zap className="w-5 h-5 text-amber-500" />;
            default:
                return <BookOpen className="w-5 h-5 text-blue-500" />;
        }
    };

    const getTaskColor = (type: string) => {
        switch (type) {
            case 'rest':
                return 'border-emerald-200 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30';
            case 'skill':
                return 'border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/30';
            default:
                return 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/30';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Day {dayNumber}
                    </h2>

                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {istDate.toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            timeZone: 'Asia/Kolkata',
                        })}
                    </p>
                </div>

                <div className="text-right">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {completionStats.percentage}%
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {completionStats.completed} / {completionStats.total} tasks
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionStats.percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                />
            </div>

            {/* Celebration */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center"
                    >
                        <PartyPopper className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                        <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                            Perfect Day! 🎉
                        </h3>
                        <p className="text-green-600 dark:text-green-300">
                            You've completed all tasks for today. Keep up the amazing work!
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tasks List */}
            <div className="space-y-3">
                {tasks.map((task, index) => (
                    <motion.div
                        key={task.taskId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                            'border-2 rounded-2xl p-5 transition-all cursor-pointer',
                            getTaskColor(task.type),
                            task.completed && 'opacity-60',
                            loadingTaskId === task.taskId && 'pointer-events-none'
                        )}
                        onClick={() => handleTaskToggle(task.taskId)}
                    >
                        <div className="flex items-start gap-4">
                            {/* Checkbox */}
                            <div className="flex-shrink-0 pt-1">
                                {loadingTaskId === task.taskId ? (
                                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                ) : task.completed ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                ) : (
                                    <Circle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                )}
                            </div>

                            {/* Task Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    {getTaskIcon(task.type)}
                                    {task.time && (
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            {task.time}
                                        </span>
                                    )}
                                </div>

                                <h4
                                    className={cn(
                                        'text-lg font-bold mb-2',
                                        task.completed
                                            ? 'line-through text-gray-500 dark:text-gray-400'
                                            : 'text-gray-900 dark:text-white'
                                    )}
                                >
                                    {task.title}
                                </h4>

                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {task.description}
                                </p>

                                {task.completed && task.completedAt && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                        ✓ Completed at{' '}
                                        {new Date(task.completedAt).toLocaleTimeString('en-IN', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            timeZone: 'Asia/Kolkata',
                                        })}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {tasks.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No tasks scheduled for today</p>
                </div>
            )}
        </div>
    );
}
