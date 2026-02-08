'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import { AttendanceSessionPanel } from '@/components/teacher/AttendanceSessionPanel';
import { QrCode, Calendar } from 'lucide-react';

function AttendanceManagement() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            fetchData();
        }
    }, [mounted]);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/teacher/students');
            const data = await response.json();
            if (response.ok) {
                setStudents(data.students);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStudentClick = (studentId: string) => {
        router.push(`/teacher/student/${studentId}`);
    };

    if (isLoading || !mounted) return <Loading text="Loading Attendance..." />;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                        <QrCode className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Attendance Management</h1>
                        <p className="text-muted-foreground dark:text-slate-400 text-sm">Start sessions and track attendance</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/teacher/attendance/history')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200"
                >
                    <Calendar className="w-4 h-4" />
                    View History
                </button>
            </div>

            <AttendanceSessionPanel
                onSessionStart={() => { }}
                onSessionEnd={() => {
                    fetchData();
                }}
            />

            {/* Low Attendance Students */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    Students with Low Attendance (&lt;75%)
                </h3>
                <div className="space-y-2">
                    {students
                        .filter(s => s.attendancePercent < 75)
                        .map(student => (
                            <div
                                key={student._id}
                                className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer"
                                onClick={() => handleStudentClick(student._id)}
                            >
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-slate-100">{student.name}</div>
                                    <div className="text-sm text-gray-600 dark:text-slate-400">{student.department} • Year {student.year}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{student.attendancePercent}%</div>
                                    <div className="text-xs text-orange-700 dark:text-orange-300">Attendance</div>
                                </div>
                            </div>
                        ))}
                    {students.filter(s => s.attendancePercent < 75).length === 0 && (
                        <p className="text-center text-gray-500 dark:text-slate-400 py-8">All students have good attendance!</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AttendanceManagementPage() {
    return (
        <Suspense fallback={<Loading text="Loading Attendance..." />}>
            <AttendanceManagement />
        </Suspense>
    );
}
