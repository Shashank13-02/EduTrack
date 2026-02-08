'use client';

import React from 'react';
import { Users, GraduationCap, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ClassAnalyticsProps {
    data: {
        totalStudents: number;
        avgAttendance: number;
        avgPerformance: number;
        riskDistribution: {
            low: number;
            medium: number;
            high: number;
        };
    };
}

export function ClassAnalytics({ data }: ClassAnalyticsProps) {
    const riskData = [
        { name: 'Low Risk', value: data.riskDistribution.low, color: '#10b981' },
        { name: 'Medium Risk', value: data.riskDistribution.medium, color: '#f59e0b' },
        { name: 'High Risk', value: data.riskDistribution.high, color: '#ef4444' },
    ];

    return (
        <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <Users className="w-10 h-10 opacity-80" />
                        <div className="text-right">
                            <div className="text-4xl font-bold">{data.totalStudents}</div>
                        </div>
                    </div>
                    <div className="text-blue-100 font-medium">Total Students</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <Calendar className="w-10 h-10 opacity-80" />
                        <div className="text-right">
                            <div className="text-4xl font-bold">{data.avgAttendance}%</div>
                        </div>
                    </div>
                    <div className="text-green-100 font-medium">Avg Attendance</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="w-10 h-10 opacity-80" />
                        <div className="text-right">
                            <div className="text-4xl font-bold">{data.avgPerformance}%</div>
                        </div>
                    </div>
                    <div className="text-purple-100 font-medium">Avg Performance</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                        < AlertTriangle className="w-10 h-10 opacity-80" />
                        <div className="text-right">
                            <div className="text-4xl font-bold">{data.riskDistribution.high}</div>
                        </div>
                    </div>
                    <div className="text-orange-100 font-medium">High Risk Students</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6">
                {/* Risk Distribution Chart */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        Risk Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={riskData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
