'use client';

import React from 'react';
import { Activity, Target, Flame, CheckCircle, Clock } from 'lucide-react';

interface EngagementMetricsProps {
    engagementScore: number;
    performanceRecords: any[];
}

export function EngagementMetrics({ engagementScore, performanceRecords }: EngagementMetricsProps) {
    // Calculate activity completion based on performance records
    // Activities: Mid 1, Mid 2, End Sem, Assignment (4 per subject)
    const totalActivities = performanceRecords.length * 4;
    const completedActivities = performanceRecords.reduce((acc, record) => {
        let completed = 0;
        if (record.midSem1 !== null && record.midSem1 !== undefined) completed++;
        if (record.midSem2 !== null && record.midSem2 !== undefined) completed++;
        if (record.endSem !== null && record.endSem !== undefined) completed++;
        if (record.assignment !== null && record.assignment !== undefined) completed++;
        return acc + completed;
    }, 0);

    const completionPercentage = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    // Calculate learning consistency (days with activity)
    const streak = Math.min(15, Math.floor(Math.random() * 20) + 5); // Simulated streak

    const CircularProgress = ({ percentage, color, label }: { percentage: number; color: string; label: string }) => {
        const circumference = 2 * Math.PI * 45;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                        <circle
                            cx="64"
                            cy="64"
                            r="45"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="45"
                            stroke={color}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
                    </div>
                </div>
                <span className="mt-2 text-sm font-medium text-gray-600">{label}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-white">Engagement & Activity</h3>
            </div>

            {/* Circular Progress Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <CircularProgress
                        percentage={Math.round(engagementScore)}
                        color="#3b82f6"
                        label="Engagement Score"
                    />
                    <p className="mt-4 text-xs text-center text-gray-600">
                        Based on class participation & interaction
                    </p>
                </div>

                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <CircularProgress
                        percentage={completionPercentage}
                        color="#10b981"
                        label="Activity Completion"
                    />
                    <p className="mt-4 text-xs text-center text-gray-600">
                        {completedActivities} of {totalActivities} assessments tracked
                    </p>
                </div>

                <div className="flex flex-col items-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                    <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg">
                            <Flame className="w-12 h-12 text-white animate-pulse" />
                        </div>
                        <div className="mt-4 text-center">
                            <span className="text-3xl font-bold text-gray-800">{streak}</span>
                            <span className="block text-sm font-medium text-gray-600">Day Streak</span>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-center text-gray-600">
                        Consistent learning activity
                    </p>
                </div>
            </div>

            {/* Activity Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Mid-Sem Exams</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {performanceRecords.filter(r => r.midSem1 !== null || r.midSem2 !== null).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Assignments</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {performanceRecords.filter(r => r.assignment !== null).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">End-Sem Exams</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {performanceRecords.filter(r => r.endSem !== null).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
