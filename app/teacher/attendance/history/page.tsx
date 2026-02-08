'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    ArrowLeft,
    Users,
    Clock,
    CheckCircle,
    Search,
    ChevronDown,
    ChevronUp,
    User
} from 'lucide-react';
import { Loading } from '@/components/ui/Loading';

interface Student {
    _id: string;
    name: string;
    email: string;
    department?: string;
    year?: number;
}

interface Session {
    _id: string;
    sessionCode: string;
    subject: string;
    startTime: string;
    endTime?: string;
    isActive: boolean;
    date: string;
    attendedStudents: Student[];
    attendedCount: number;
}

export default function AttendanceHistoryPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [sessionsByDate, setSessionsByDate] = useState<Record<string, Session[]>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/teacher/attendance/history');
            const data = await response.json();
            if (response.ok) {
                setSessionsByDate(data.sessionsByDate);
                // Auto-expand the first 3 dates
                const dates = Object.keys(data.sessionsByDate).slice(0, 3);
                setExpandedDates(new Set(dates));
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleDate = (date: string) => {
        const newExpanded = new Set(expandedDates);
        if (newExpanded.has(date)) {
            newExpanded.delete(date);
        } else {
            newExpanded.add(date);
        }
        setExpandedDates(newExpanded);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const filterStudents = (students: Student[]) => {
        if (!searchQuery) return students;
        return students.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    if (isLoading) return <Loading text="Loading Attendance History..." />;

    const dateKeys = Object.keys(sessionsByDate).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                    </button>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-xl">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Attendance History</h1>
                        <p className="text-muted-foreground dark:text-slate-400 text-sm">View past attendance sessions</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border border-slate-200 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            {/* Sessions by Date */}
            {dateKeys.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-12 text-center border border-slate-200 dark:border-slate-700">
                    <Calendar className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-2">No Attendance History</h3>
                    <p className="text-gray-600 dark:text-slate-400">Start an attendance session to see records here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {dateKeys.map((dateKey) => {
                        const sessions = sessionsByDate[dateKey];
                        const totalStudents = sessions.reduce((sum, s) => sum + s.attendedCount, 0);
                        const isExpanded = expandedDates.has(dateKey);

                        return (
                            <div
                                key={dateKey}
                                className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden"
                            >
                                {/* Date Header */}
                                <button
                                    onClick={() => toggleDate(dateKey)}
                                    className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-lg">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">
                                                {formatDate(dateKey)}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                                {sessions.length} session{sessions.length !== 1 ? 's' : ''} • {totalStudents} total attendance
                                            </p>
                                        </div>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>

                                {/* Sessions List */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="border-t border-slate-200 dark:border-slate-700"
                                        >
                                            <div className="p-6 space-y-4">
                                                {sessions.map((session) => {
                                                    const filteredStudents = filterStudents(session.attendedStudents);

                                                    return (
                                                        <div
                                                            key={session._id}
                                                            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/50"
                                                        >
                                                            {/* Session Header */}
                                                            <div className="flex items-start justify-between mb-4">
                                                                <div>
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                                                            {session.sessionCode}
                                                                        </span>
                                                                        {session.isActive && (
                                                                            <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">
                                                                                ACTIVE
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 dark:text-slate-400">
                                                                        Subject: {session.subject}
                                                                    </p>
                                                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-slate-500">
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            Started: {new Date(session.startTime).toLocaleTimeString()}
                                                                        </span>
                                                                        {session.endTime && (
                                                                            <span className="flex items-center gap-1">
                                                                                <Clock className="w-3 h-3" />
                                                                                Ended: {new Date(session.endTime).toLocaleTimeString()}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg text-center">
                                                                    <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                                                        {session.attendedCount}
                                                                    </div>
                                                                    <div className="text-xs text-green-600 dark:text-green-300">
                                                                        Present
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Students List */}
                                                            {filteredStudents.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                                        <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                                                                            Students Present ({filteredStudents.length})
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                        {filteredStudents.map((student) => (
                                                                            <div
                                                                                key={student._id}
                                                                                className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-900/50"
                                                                            >
                                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                                                    {student.name.charAt(0).toUpperCase()}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                                                        {student.name}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                                                                                        {student.email}
                                                                                    </p>
                                                                                </div>
                                                                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="text-center text-sm text-gray-500 dark:text-slate-400 py-4">
                                                                    {searchQuery ? 'No students match your search' : 'No students attended this session'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
