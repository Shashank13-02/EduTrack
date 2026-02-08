'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, Award, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { calculateGrade, calculateClassStats, getGradeColor, GRADE_THRESHOLDS } from '@/lib/gradeCalculator';
import { calculateWeightedAverage } from '@/lib/utils';

interface PerformanceRecord {
    studentId: string;
    studentName: string;
    midSem1: number | null;
    midSem2: number | null;
    endSem: number | null;
    assignment: number | null;
}

interface MarksStatisticsCardProps {
    performanceRecords: PerformanceRecord[];
    subjectName: string;
}

export function MarksStatisticsCard({ performanceRecords, subjectName }: MarksStatisticsCardProps) {
    // Calculate percentages for all students
    const percentages = performanceRecords.map(record => {
        return calculateWeightedAverage([
            { score: record.midSem1 || 0, max: 10 },
            { score: record.midSem2 || 0, max: 10 },
            { score: record.endSem || 0, max: 70 },
            { score: record.assignment || 0, max: 10 }
        ]);
    }).filter(p => p > 0); // Filter out students with no marks

    // Calculate statistics
    const stats = calculateClassStats(percentages);

    // Prepare chart data
    const gradeChartData = GRADE_THRESHOLDS.map(threshold => ({
        grade: threshold.grade,
        count: stats.gradeDistribution[threshold.grade] || 0,
        fill: threshold.grade.startsWith('A') ? '#10b981' :
            threshold.grade.startsWith('B') ? '#3b82f6' :
                threshold.grade.startsWith('C') ? '#f59e0b' :
                    threshold.grade === 'D' ? '#f97316' : '#ef4444'
    }));

    const classGrade = calculateGrade(stats.average);

    if (percentages.length === 0) {
        return (
            <Card className="glass-card">
                <CardContent className="pt-6">
                    <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No marks published yet for {subjectName}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Class Average</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.average}%</p>
                                <div className={`inline-block mt-1 px-2 py-1 rounded border text-xs font-semibold ${getGradeColor(classGrade.grade)}`}>
                                    Grade {classGrade.grade}
                                </div>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Highest Score</p>
                                <p className="text-3xl font-bold text-green-600">{stats.highest}%</p>
                                <p className="text-xs text-gray-500 mt-1">Grade {calculateGrade(stats.highest).grade}</p>
                            </div>
                            <Award className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Lowest Score</p>
                                <p className="text-3xl font-bold text-orange-600">{stats.lowest}%</p>
                                <p className="text-xs text-gray-500 mt-1">Grade {calculateGrade(stats.lowest).grade}</p>
                            </div>
                            <TrendingDown className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Pass Rate</p>
                                <p className="text-3xl font-bold text-purple-600">
                                    {Math.round((stats.passCount / stats.totalStudents) * 100)}%
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{stats.passCount}/{stats.totalStudents} students</p>
                            </div>
                            <Users className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Grade Distribution Chart */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Grade Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={gradeChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="grade" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#3b82f6" name="Number of Students" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Additional Stats */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Additional Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-700 font-medium">Median Score</p>
                            <p className="text-2xl font-bold text-blue-900">{stats.median}%</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-sm text-green-700 font-medium">Passed Students</p>
                            <p className="text-2xl font-bold text-green-900">{stats.passCount}</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-sm text-red-700 font-medium">Failed Students</p>
                            <p className="text-2xl font-bold text-red-900">{stats.failCount}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
