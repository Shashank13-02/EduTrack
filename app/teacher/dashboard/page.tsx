'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
    Users, TrendingUp, TrendingDown, Calendar, AlertTriangle,
    Award, BookOpen, Target, Activity, Clock, GraduationCap
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface AnalyticsData {
    totalStudents: number;
    avgAttendance: number;
    avgPerformance: number;
    activeStudents: number;
    riskDistribution: {
        low: number;
        medium: number;
        high: number;
    };
    departmentPerformance: Array<{
        department: string;
        avgScore: number;
        studentCount: number;
    }>;
    performanceTrend: Array<{
        month: string;
        avgScore: number;
        attendance: number;
    }>;
    subjectPerformance: Array<{
        subject: string;
        avgScore: number;
        maxScore: number;
    }>;
    attendanceTrend: Array<{
        week: string;
        attendance: number;
    }>;
}

function TeacherDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            fetchAnalytics();
        }
    }, [mounted]);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('/api/teacher/analytics');

            if (response.status === 401 || response.status === 404) {
                router.push('/auth/login');
                return;
            }

            const data = await response.json();
            if (response.ok) {
                setAnalyticsData(data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !mounted) return <Loading text="Loading Analytics Dashboard..." />;

    if (!analyticsData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-slate-600 dark:text-slate-400">No analytics data available</p>
            </div>
        );
    }

    const riskData = [
        { name: 'Low Risk', value: analyticsData.riskDistribution.low, color: '#10b981' },
        { name: 'Medium Risk', value: analyticsData.riskDistribution.medium, color: '#f59e0b' },
        { name: 'High Risk', value: analyticsData.riskDistribution.high, color: '#ef4444' },
    ];

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Analytics Dashboard
                    </h1>
                    <p className="text-muted-foreground dark:text-slate-400 mt-1">
                        Comprehensive overview of student performance and engagement
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block mx-2"></div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 italic">Faculty Analytics</span>
                        <span className="text-xs text-slate-500">Real-time Insights</span>
                    </div>
                </div>
            </div>

            {/* Key Metrics Cards - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Students */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl transform transition-transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                <Users className="w-8 h-8" />
                            </div>
                            <TrendingUp className="w-5 h-5 opacity-70" />
                        </div>
                        <div className="text-4xl font-bold mb-1">{analyticsData.totalStudents}</div>
                        <div className="text-blue-100 font-medium text-sm">Total Students</div>
                        <div className="mt-3 pt-3 border-t border-white/20">
                            <span className="text-xs text-blue-100">{analyticsData.activeStudents} active this week</span>
                        </div>
                    </div>
                </div>

                {/* Average Attendance */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl transform transition-transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                <Calendar className="w-8 h-8" />
                            </div>
                            {analyticsData.avgAttendance >= 75 ? (
                                <TrendingUp className="w-5 h-5 opacity-70" />
                            ) : (
                                <TrendingDown className="w-5 h-5 opacity-70" />
                            )}
                        </div>
                        <div className="text-4xl font-bold mb-1">{analyticsData.avgAttendance}%</div>
                        <div className="text-green-100 font-medium text-sm">Avg Attendance</div>
                        <div className="mt-3 pt-3 border-t border-white/20">
                            <span className="text-xs text-green-100">
                                {analyticsData.avgAttendance >= 75 ? 'Excellent' : 'Needs Attention'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Average Performance */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-xl transform transition-transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                <Award className="w-8 h-8" />
                            </div>
                            <TrendingUp className="w-5 h-5 opacity-70" />
                        </div>
                        <div className="text-4xl font-bold mb-1">{analyticsData.avgPerformance}%</div>
                        <div className="text-purple-100 font-medium text-sm">Avg Performance</div>
                        <div className="mt-3 pt-3 border-t border-white/20">
                            <span className="text-xs text-purple-100">Class average score</span>
                        </div>
                    </div>
                </div>

                {/* High Risk Students */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl transform transition-transform hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            {analyticsData.riskDistribution.high > 0 && (
                                <div className="bg-red-700/50 px-2 py-1 rounded-full text-xs">Alert</div>
                            )}
                        </div>
                        <div className="text-4xl font-bold mb-1">{analyticsData.riskDistribution.high}</div>
                        <div className="text-orange-100 font-medium text-sm">High Risk Students</div>
                        <div className="mt-3 pt-3 border-t border-white/20">
                            <span className="text-xs text-orange-100">Requires intervention</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Trend Chart */}
                <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-xl border border-border">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-card-foreground">Performance Trend</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analyticsData.performanceTrend}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="avgScore"
                                stroke="#6366f1"
                                fillOpacity={1}
                                fill="url(#colorScore)"
                                name="Avg Score (%)"
                            />
                            <Area
                                type="monotone"
                                dataKey="attendance"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorAttendance)"
                                name="Attendance (%)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Risk Distribution Pie Chart */}
                <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-xl border border-border">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-card-foreground">Student Risk Distribution</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={riskData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{analyticsData.riskDistribution.low}</div>
                            <div className="text-xs text-green-700 dark:text-green-300">Low Risk</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analyticsData.riskDistribution.medium}</div>
                            <div className="text-xs text-orange-700 dark:text-orange-300">Medium Risk</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{analyticsData.riskDistribution.high}</div>
                            <div className="text-xs text-red-700 dark:text-red-300">High Risk</div>
                        </div>
                    </div>
                </div>

                {/* Department Performance */}
                <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-xl border border-border">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-card-foreground">Department Performance</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.departmentPerformance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="department"
                                stroke="#64748b"
                                style={{ fontSize: '11px' }}
                                angle={-15}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Legend />
                            <Bar
                                dataKey="avgScore"
                                fill="#6366f1"
                                name="Avg Score (%)"
                                radius={[8, 8, 0, 0]}
                            >
                                {analyticsData.departmentPerformance.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Subject Performance */}
                <div className="bg-card text-card-foreground rounded-2xl p-6 shadow-xl border border-border">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-card-foreground">Subject Performance</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analyticsData.subjectPerformance} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
                            <YAxis
                                dataKey="subject"
                                type="category"
                                stroke="#64748b"
                                style={{ fontSize: '11px' }}
                                width={100}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Legend />
                            <Bar
                                dataKey="avgScore"
                                fill="#8b5cf6"
                                name="Avg Score"
                                radius={[0, 8, 8, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Attendance Trend */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-6">
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-card-foreground">Weekly Attendance Trend</h3>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analyticsData.attendanceTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="week" stroke="#64748b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="attendance"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: '#10b981', r: 5 }}
                            activeDot={{ r: 7 }}
                            name="Attendance (%)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                    onClick={() => router.push('/teacher/students')}
                    className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-6 shadow-lg transform transition-all hover:scale-105"
                >
                    <Users className="w-8 h-8 mb-3" />
                    <div className="text-lg font-bold mb-1">Student Monitoring</div>
                    <div className="text-sm text-blue-100">View detailed student data</div>
                </button>

                <button
                    onClick={() => router.push('/teacher/attendance')}
                    className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-6 shadow-lg transform transition-all hover:scale-105"
                >
                    <Calendar className="w-8 h-8 mb-3" />
                    <div className="text-lg font-bold mb-1">Attendance</div>
                    <div className="text-sm text-green-100">Manage attendance sessions</div>
                </button>

                <button
                    onClick={() => router.push('/teacher/marks')}
                    className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-6 shadow-lg transform transition-all hover:scale-105"
                >
                    <Award className="w-8 h-8 mb-3" />
                    <div className="text-lg font-bold mb-1">Marks Management</div>
                    <div className="text-sm text-purple-100">Update student grades</div>
                </button>
            </div>
        </div>
    );
}

export default function TeacherDashboardPage() {
    return (
        <Suspense fallback={<Loading text="Loading Analytics Dashboard..." />}>
            <TeacherDashboard />
        </Suspense>
    );
}
