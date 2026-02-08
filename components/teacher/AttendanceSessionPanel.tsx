'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, Power, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';

interface AttendanceSessionPanelProps {
    onSessionStart: () => void;
    onSessionEnd: () => void;
}

export function AttendanceSessionPanel({ onSessionStart, onSessionEnd }: AttendanceSessionPanelProps) {
    const [activeSession, setActiveSession] = useState<any>(null);
    const [qrCode, setQrCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        fetchActiveSession();
        const interval = setInterval(fetchActiveSession, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchActiveSession = async () => {
        try {
            const response = await fetch('/api/teacher/attendance/session');
            const data = await response.json();
            if (data.session) {
                setActiveSession(data.session);
                setQrCode(data.qrCode);
            } else {
                setActiveSession(null);
                setQrCode('');
            }
        } catch (error) {
            console.error('Error fetching session:', error);
        }
    };

    const startSession = async () => {
        setIsStarting(true);
        try {
            // Get teacher's current location
            if (!navigator.geolocation) {
                alert('Geolocation is not supported by your browser');
                setIsStarting(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    const response = await fetch('/api/teacher/attendance/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            subject: 'General',
                            latitude,
                            longitude,
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setActiveSession(data.session);
                        setQrCode(data.qrCode);
                        onSessionStart();
                    } else {
                        const error = await response.json();
                        alert(error.error || 'Failed to start session');
                    }
                    setIsStarting(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    alert('Please enable location access to start attendance session');
                    setIsStarting(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } catch (error) {
            console.error('Error starting session:', error);
            setIsStarting(false);
        }
    };

    const endSession = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/teacher/attendance/session', {
                method: 'PATCH',
            });

            if (response.ok) {
                setActiveSession(null);
                setQrCode('');
                onSessionEnd();
            }
        } catch (error) {
            console.error('Error ending session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (activeSession) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                            Active Attendance Session
                        </h3>
                        <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                                Session Code: <span className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">{activeSession.sessionCode}</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-500">
                                Date: {new Date(activeSession.date).toLocaleDateString()} • Today's Session
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={endSession}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    >
                        {isLoading ? <LoadingSpinner size="sm" /> : <Power className="w-4 h-4 mr-2" />}
                        End Session
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* QR Code */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 text-center border border-blue-100 dark:border-blue-900/50">
                        <h4 className="font-semibold text-gray-800 dark:text-slate-100 mb-4 flex items-center justify-center gap-2">
                            <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Scan QR Code
                        </h4>
                        {qrCode && (
                            <div className="bg-white p-4 rounded-lg inline-block">
                                <img src={qrCode} alt="Session QR Code" className="w-64 h-64 mx-auto" />
                            </div>
                        )}
                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-4">
                            Students can scan this code to mark attendance
                        </p>
                    </div>

                    {/* Session Stats */}
                    <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-600 dark:bg-green-700 rounded-lg">
                                    <CheckCircle className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-green-700 dark:text-green-400">{activeSession.attendedStudents?.length || 0}</div>
                                    <div className="text-sm text-green-600 dark:text-green-300">Students Marked Present (Today)</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Session Details</span>
                            </div>
                            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                                <p>Started: {new Date(activeSession.startTime).toLocaleTimeString()}</p>
                                <p>Subject: {activeSession.subject || 'General'}</p>
                                {activeSession.location && (
                                    <p className="flex items-center gap-1">
                                        📍 Location verification enabled (50m range)
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Attendance List */}
                {activeSession.attendedStudents && activeSession.attendedStudents.length > 0 && (
                    <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <h4 className="font-semibold text-gray-800 dark:text-slate-100">
                                Students Present ({activeSession.attendedStudents.length})
                            </h4>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-2 custom-scrollbar">
                            {activeSession.attendedStudents.map((student: any, index: number) => (
                                <div
                                    key={student._id || index}
                                    className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-purple-100 dark:border-purple-900/50 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {student.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                                            {student.name || 'Unknown Student'}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-slate-400 truncate">
                                            {student.email || 'No email'}
                                        </p>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 text-center border border-slate-200 dark:border-slate-700">
            <QrCode className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 mb-2">No Active Session</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6">Start an attendance session to allow students to mark their attendance</p>
            <Button
                variant="default"
                onClick={startSession}
                disabled={isStarting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
                {isStarting ? (
                    <span className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Starting...
                    </span>
                ) : (
                    <>
                        <QrCode className="w-4 h-4 mr-2" />
                        Start Attendance Session
                    </>
                )}
            </Button>
        </div>
    );
}
