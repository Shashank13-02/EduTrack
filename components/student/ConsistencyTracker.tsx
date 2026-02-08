'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar } from 'lucide-react';

interface ConsistencyTrackerProps {
    dayNumber: number;
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
}

export function ConsistencyTracker({
    dayNumber,
    currentStreak,
    longestStreak,
    totalDays
}: ConsistencyTrackerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-orange-200 dark:border-slate-600 shadow-lg"
        >
            <div className="flex items-center justify-between flex-wrap gap-4">
                {/* Day Journey */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Your Learning Journey</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Day {dayNumber}
                        </h3>
                    </div>
                </div>

                {/* Current Streak */}
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${currentStreak > 0
                            ? 'bg-gradient-to-br from-red-500 to-orange-600'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                        <Flame className={`w-6 h-6 ${currentStreak > 0 ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                            }`} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Current Streak</p>
                        <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                        </h3>
                    </div>
                </div>

                {/* Longest Streak */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                        <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Best Streak</p>
                        <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
                        </h3>
                    </div>
                </div>

                {/* Total Learning Days */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">{totalDays}</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Total Days</p>
                        <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            Learning
                        </h3>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
