'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';

interface PerformanceData {
    subject: string;
    midSem1: number;
    midSem2: number;
    endSem: number;
    assignment: number;
}

export function PerformanceBarChart({ data }: { data: PerformanceData[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 'auto']} />
                <Tooltip />
                <Legend />
                <Bar dataKey="midSem1" fill="#3b82f6" name="Mid-Sem 1 (10)" stackId="a" />
                <Bar dataKey="midSem2" fill="#818cf8" name="Mid-Sem 2 (10)" stackId="a" />
                <Bar dataKey="assignment" fill="#10b981" name="Assignment (10)" stackId="a" />
                <Bar dataKey="endSem" fill="#6366f1" name="End-Sem (70)" stackId="a" />
            </BarChart>
        </ResponsiveContainer>
    );
}

interface TrendData {
    date: string;
    score: number;
}

export function PerformanceTrendChart({ data }: { data: TrendData[] }) {
    return (
        <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Average Score" />
            </LineChart>
        </ResponsiveContainer>
    );
}
