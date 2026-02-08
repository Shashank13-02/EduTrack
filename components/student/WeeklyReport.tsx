'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Calendar,
    TrendingUp,
    Award
} from 'lucide-react';

interface WeekReportProps {
    weekData: {
        date: string;
        dayNumber: number;
        completionRate: number;
        tasksCompleted: number;
        totalTasks: number;
    }[];
    weeklyAverage: number;
    totalTasksCompleted: number;
    totalTasks: number;
    insights: string;
}

export function WeeklyReport({
    weekData,
    weeklyAverage,
    totalTasksCompleted,
    totalTasks,
    insights
}: WeekReportProps) {
    const maxCompletionRate = Math.max(...weekData.map(d => d.completionRate), 1);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-blue-500" />
                        Weekly Progress Report
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Last 7 days of your learning journey
                    </p>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                        <Award className="w-6 h-6 text-amber-500" />
                        <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                            {weeklyAverage}%
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Weekly Average
                    </p>
                </div>
            </div>

            {/* Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-blue-200 dark:border-slate-600 shadow-lg"
            >
                <div className="flex items-start gap-4">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                            AI Insights
                        </h3>
                        <p className="text-gray-700 dark:text-gray-200">{insights}</p>
                    </div>
                </div>
            </motion.div>

            {/* 7-Day Progress Bar Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    Daily Completion Rates
                </h3>
                <div className="space-y-4">
                    {weekData.map((day, index) => {
                        const date = new Date(day.date);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                        return (
                            <motion.div
                                key={day.date}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="space-y-2"
                            >
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                                        {dayName}, {formattedDate}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                                        {day.tasksCompleted}/{day.totalTasks} tasks
                                    </span>
                                    <span className={`font-bold min-w-[50px] text-right ${day.completionRate === 100
                                        ? 'text-green-600 dark:text-green-400'
                                        : day.completionRate >= 50
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                        {day.completionRate}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${day.completionRate}%` }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        className={`h-full rounded-full ${day.completionRate === 100
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                            : day.completionRate >= 50
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                                : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                            }`}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Tasks Completed</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {totalTasksCompleted}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Tasks Assigned</p>
                    <p className="text-3xl font-bold text-gray-700 dark:text-gray-200">
                        {totalTasks}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Active Days</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {weekData.filter(d => d.completionRate > 0).length}/7
                    </p>
                </div>
            </div>
        </div>
    );
}
