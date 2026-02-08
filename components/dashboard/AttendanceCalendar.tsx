'use client';

import React, { useMemo } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AttendanceRecord {
    date: string | Date;
    status: 'present' | 'absent' | 'late';
}

interface AttendanceCalendarProps {
    attendanceRecords: AttendanceRecord[];
    month?: Date;
    totalSessionsInMonth?: number; // Total classes held in the month
}

export function AttendanceCalendar({ attendanceRecords, month = new Date(), totalSessionsInMonth }: AttendanceCalendarProps) {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Filter attendance records for this month
    const monthlyRecords = useMemo(() => {
        return attendanceRecords.filter((r) => {
            const recordDate = typeof r.date === 'string' ? parseISO(r.date) : new Date(r.date);
            return isWithinInterval(recordDate, { start: monthStart, end: monthEnd });
        });
    }, [attendanceRecords, monthStart, monthEnd]);

    // Calculate monthly attendance statistics
    const monthlyStats = useMemo(() => {
        const totalClassesInMonth = totalSessionsInMonth || monthlyRecords.length;
        const presentCount = monthlyRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        const absentCount = monthlyRecords.filter(r => r.status === 'absent').length;
        const lateCount = monthlyRecords.filter(r => r.status === 'late').length;

        // If totalSessionsInMonth is provided, use it; otherwise use records count (backward compatible)
        const attendancePercent = totalClassesInMonth > 0
            ? Math.min(100, Math.round((presentCount / totalClassesInMonth) * 100))
            : (monthlyRecords.length > 0 ? Math.round((presentCount / monthlyRecords.length) * 100) : 0);

        return {
            totalClassesInMonth,
            presentCount,
            absentCount,
            lateCount,
            attendancePercent,
        };
    }, [monthlyRecords, totalSessionsInMonth]);

    // Generate weekly attendance data for graph
    const weeklyData = useMemo(() => {
        const weeks: { week: string; present: number; absent: number; total: number; percent: number }[] = [];
        let currentWeekStart = new Date(monthStart);

        while (currentWeekStart <= monthEnd) {
            let weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            if (weekEnd > monthEnd) weekEnd = monthEnd;

            const weekRecords = monthlyRecords.filter((r) => {
                const recordDate = typeof r.date === 'string' ? parseISO(r.date) : new Date(r.date);
                return isWithinInterval(recordDate, { start: currentWeekStart, end: weekEnd });
            });

            const weekPresent = weekRecords.filter(r => r.status === 'present' || r.status === 'late').length;
            const weekAbsent = weekRecords.filter(r => r.status === 'absent').length;
            const weekTotal = weekRecords.length;
            const weekPercent = weekTotal > 0 ? Math.round((weekPresent / weekTotal) * 100) : 0;

            weeks.push({
                week: `Week ${weeks.length + 1}`,
                present: weekPresent,
                absent: weekAbsent,
                total: weekTotal,
                percent: weekPercent,
            });

            currentWeekStart = new Date(weekEnd);
            currentWeekStart.setDate(currentWeekStart.getDate() + 1);
        }

        return weeks;
    }, [monthlyRecords, monthStart, monthEnd]);

    const getStatusForDay = (day: Date) => {
        const record = monthlyRecords.find((r) => {
            const recordDate = typeof r.date === 'string' ? parseISO(r.date) : r.date;
            return isSameDay(recordDate, day);
        });
        return record?.status;
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'present':
                return 'bg-green-500';
            case 'absent':
                return 'bg-red-500';
            case 'late':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-200';
        }
    };

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'present':
                return <CheckCircle2 className="w-3 h-3 text-white" />;
            case 'absent':
                return <XCircle className="w-3 h-3 text-white" />;
            case 'late':
                return <Clock className="w-3 h-3 text-white" />;
            default:
                return null;
        }
    };

    return (
        <div className="attendance-calendar space-y-6">
            {/* Header with Monthly Stats */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-white">
                            {format(month, 'MMMM yyyy')}
                        </h3>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                            {monthlyStats.attendancePercent}%
                        </div>
                        <div className="text-xs text-gray-500">Monthly Attendance</div>
                    </div>
                </div>

                {/* Monthly Summary */}
                <div className="grid grid-cols-4 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{monthlyStats.totalClassesInMonth}</div>
                        <div className="text-xs text-gray-600">Total Classes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{monthlyStats.presentCount}</div>
                        <div className="text-xs text-gray-600">Present</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">{monthlyStats.lateCount}</div>
                        <div className="text-xs text-gray-600">Late</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{monthlyStats.absentCount}</div>
                        <div className="text-xs text-gray-600">Absent</div>
                    </div>
                </div>
            </div>

            {/* Weekly Attendance Graph */}
            {weeklyData.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <h4 className="text-sm font-semibold text-gray-800">Weekly Attendance Trend</h4>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <YAxis domain={[0, 100]} stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                }}
                                formatter={(value: number) => [`${value}%`, 'Attendance']}
                            />
                            <Bar dataKey="percent" name="Attendance %" radius={[8, 8, 0, 0]}>
                                {weeklyData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.percent >= 75 ? '#10b981' : entry.percent >= 50 ? '#f59e0b' : '#ef4444'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-xs font-semibold text-gray-600 text-center">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                    const status = getStatusForDay(day);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toISOString()}
                            className={`
                                relative aspect-square rounded-lg flex items-center justify-center
                                transition-all duration-200 hover:scale-110 cursor-pointer
                                ${getStatusColor(status)}
                                ${isToday ? 'ring-2 ring-blue-600 ring-offset-2' : ''}
                                ${!status ? 'opacity-30' : 'shadow-sm'}
                            `}
                            title={status ? `${format(day, 'MMM d')}: ${status}` : format(day, 'MMM d')}
                        >
                            <span className={`text-xs font-medium ${status ? 'text-white' : 'text-gray-500'}`}>
                                {format(day, 'd')}
                            </span>
                            {status && (
                                <div className="absolute bottom-0.5 right-0.5">
                                    {getStatusIcon(status)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-xs text-gray-600">Present</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-500"></div>
                    <span className="text-xs text-gray-600">Late</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-xs text-gray-600">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-200"></div>
                    <span className="text-xs text-gray-600">No data</span>
                </div>
            </div>
        </div>
    );
}
