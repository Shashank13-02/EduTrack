'use client';

import React, { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, subDays, subWeeks } from 'date-fns';

interface ProgressData {
    date: string;
    score: number;
}

interface ProgressGraphProps {
    performanceRecords: any[];
}

export function ProgressGraph({ performanceRecords }: ProgressGraphProps) {
    const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('weekly');

    // Generate sample trend data based on performance records
    const generateTrendData = (): ProgressData[] => {
        const today = new Date();
        const data: ProgressData[] = [];

        const calculateSubjectScore = (record: any) => {
            const scores = [
                { val: record.midSem1, max: 10 },
                { val: record.midSem2, max: 10 },
                { val: record.endSem, max: 70 },
                { val: record.assignment, max: 10 }
            ];
            const published = scores.filter(s => s.val !== null);
            if (published.length === 0) return 0;
            const total = published.reduce((acc, s) => acc + (s.val || 0), 0);
            const max = published.reduce((acc, s) => acc + s.max, 0);
            return (total / max) * 100;
        };

        if (timeRange === 'weekly') {
            // Last 7 days
            for (let i = 6; i >= 0; i--) {
                const date = subDays(today, i);
                // Simulate score with slight variations
                const baseScore = performanceRecords.length > 0
                    ? performanceRecords.reduce((acc, r) => acc + calculateSubjectScore(r), 0) / performanceRecords.length
                    : 75;
                const score = Math.min(100, Math.max(0, baseScore + (Math.random() * 10 - 5)));
                data.push({
                    date: format(date, 'MMM dd'),
                    score: Math.round(score),
                });
            }
        } else {
            // Last 4 weeks
            for (let i = 3; i >= 0; i--) {
                const date = subWeeks(today, i);
                const baseScore = performanceRecords.length > 0
                    ? performanceRecords.reduce((acc, r) => acc + calculateSubjectScore(r), 0) / performanceRecords.length
                    : 75;
                const score = Math.min(100, Math.max(0, baseScore + (Math.random() * 15 - 7.5)));
                data.push({
                    date: format(date, 'MMM dd'),
                    score: Math.round(score),
                });
            }
        }

        return data;
    };

    const trendData = generateTrendData();

    return (
        <div className="progress-graph">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Performance Trend</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeRange('weekly')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${timeRange === 'weekly'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Weekly
                    </button>
                    <button
                        onClick={() => setTimeRange('monthly')}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${timeRange === 'monthly'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Monthly
                    </button>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                    <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <YAxis domain={[0, 100]} stroke="#6b7280" style={{ fontSize: '12px' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        name="Average Score (%)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
