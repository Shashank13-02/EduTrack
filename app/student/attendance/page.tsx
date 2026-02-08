'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    QrCode,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    AlertCircle,
    MapPin,
    Navigation,
    Loader2,
    RefreshCw,
    Scan,
    Camera
} from 'lucide-react';
import { Loading } from '@/components/ui/Loading';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { QRScanner } from '@/components/ui/QRScanner';
import { cn } from '@/lib/utils';
import { calculateDistance } from '@/lib/geolocation';

function StudentAttendance() {
    const [isLoading, setIsLoading] = useState(true);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, late: 0, percentage: 0 });
    const [sessionCode, setSessionCode] = useState('');
    const [isMarking, setIsMarking] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string; details?: string } | null>(null);
    const [mounted, setMounted] = useState(false);

    // Scanner and Location state
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [activeSessionLocation, setActiveSessionLocation] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchAttendance = useCallback(async () => {
        try {
            const response = await fetch('/api/student/attendance');
            const data = await response.json();

            if (response.ok) {
                setAttendanceData(data.attendance || []);
                setStats({
                    total: data.total || 0,
                    present: data.present || 0,
                    absent: data.absent || 0,
                    late: data.late || 0,
                    percentage: data.percentage || 0
                });
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            fetchAttendance();
            detectLocation();
        }
    }, [mounted, fetchAttendance]);

    const detectLocation = () => {
        setIsDetectingLocation(true);
        if (!navigator.geolocation) {
            setMessage({ type: 'error', text: 'Geolocation is not supported by your browser' });
            setIsDetectingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setIsDetectingLocation(false);
            },
            (error) => {
                console.error('Location error:', error);
                setMessage({ type: 'info', text: 'Location access required', details: 'Please enable location to mark attendance accurately.' });
                setIsDetectingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 5000 }
        );
    };

    const markAttendance = async (codeOverride?: string) => {
        const code = codeOverride || sessionCode;
        if (!code.trim()) {
            setMessage({ type: 'error', text: 'Please enter a session code' });
            return;
        }

        setIsMarking(true);
        setMessage(null);

        try {
            // Get fresh location if possible
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });

                    const response = await fetch('/api/student/attendance/mark-qr', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sessionCode: code.trim().toUpperCase(),
                            latitude,
                            longitude,
                        }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        setMessage({ type: 'success', text: data.message || 'Attendance marked successfully!' });
                        setSessionCode('');
                        fetchAttendance(); // Refresh data
                        setActiveSessionLocation(null);
                    } else {
                        setMessage({
                            type: 'error',
                            text: data.error || 'Failed to mark attendance',
                            details: data.message
                        });

                        // If it's a location error, we might have received the session coords in the debug log
                        // But for now, we'll just handle the error display
                    }
                    setIsMarking(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setMessage({ type: 'error', text: 'Location access is required to mark attendance' });
                    setIsMarking(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } catch (error) {
            console.error('Error marking attendance:', error);
            setMessage({ type: 'error', text: 'Error marking attendance' });
            setIsMarking(false);
        }
    };

    const handleScanSuccess = (decodedText: string) => {
        setIsScannerOpen(false);
        setSessionCode(decodedText);
        markAttendance(decodedText);
    };

    if (isLoading || !mounted) return <Loading text="Syncing Attendance Profile..." />;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'present': return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
            case 'late': return <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
            case 'absent': return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'late': return 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800';
            case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 px-4 md:px-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-3.5 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Navigation className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Smart Attendance</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Geolocation-verified classroom tracking</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className={cn(
                        "w-3 h-3 rounded-full animate-pulse",
                        userLocation ? "bg-green-500" : "bg-amber-500"
                    )} />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {isDetectingLocation ? "Detecting XP Zone..." : userLocation ? "In Session Zone" : "Awaiting Location"}
                    </span>
                    <Button variant="ghost" size="sm" onClick={detectLocation} className="h-8 w-8 p-0 rounded-xl">
                        <RefreshCw className={cn("w-4 h-4", isDetectingLocation && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* Message Alert */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className={cn(
                            'p-5 rounded-2xl flex flex-col gap-1 border-2 shadow-xl',
                            message.type === 'success'
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                : message.type === 'info'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {message.type === 'success' ? (
                                <div className="bg-green-500 p-1.5 rounded-full"><CheckCircle className="w-5 h-5 text-white" /></div>
                            ) : message.type === 'info' ? (
                                <div className="bg-blue-500 p-1.5 rounded-full"><MapPin className="w-5 h-5 text-white" /></div>
                            ) : (
                                <div className="bg-red-500 p-1.5 rounded-full"><AlertCircle className="w-5 h-5 text-white" /></div>
                            )}
                            <p className="font-bold text-lg">{message.text}</p>
                        </div>
                        {message.details && (
                            <p className="text-sm ml-11 opacity-80 font-medium">{message.details}</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: Calendar, color: 'blue' },
                    { label: 'Present', value: stats.present, icon: CheckCircle, color: 'green' },
                    { label: 'Absent', value: stats.absent, icon: XCircle, color: 'red' },
                    { label: 'Late', value: stats.late, icon: Clock, color: 'orange' }
                ].map((stat, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-800 border-none shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden group">
                        <CardContent className="p-6 relative">
                            <div className={cn(
                                "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 group-hover:scale-110 transition-transform",
                                `bg-${stat.color}-500`
                            )} />
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                            <div className="flex items-end justify-between">
                                <p className="text-4xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                                <stat.icon className={cn("w-6 h-6", `text-${stat.color}-500`)} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Attendance Percentage Promo */}
            <div className="relative rounded-[2rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-8 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white">Academic Engagement</h2>
                        <p className="text-indigo-100 font-medium max-w-md">Your attendance performance reflects your commitment to learning. Keep it above 75% for optimal results.</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-white/70 text-sm font-bold uppercase tracking-widest">Active Score</p>
                            <p className="text-6xl font-black text-white">{stats.percentage}%</p>
                        </div>
                        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <TrendingUp className="w-10 h-10 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mark Attendance Action Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-white dark:bg-slate-800 border-none shadow-sm rounded-[2rem] p-4">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-3 text-2xl font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">
                            <QrCode className="w-7 h-7 text-indigo-600" />
                            Live Verification
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-4">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-700">
                                <Scan className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Visual Scanning</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Scan the teacher's dynamic QR code for instant, secure verification.</p>
                            </div>
                            <Button
                                onClick={() => setIsScannerOpen(true)}
                                className="bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-8 py-6 h-auto rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-xl"
                            >
                                <Camera className="w-5 h-5 mr-3" />
                                Launch Camera Scanner
                            </Button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-800 px-4 text-slate-500 font-black">OR MANUAL ENTRY</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Input
                                    type="text"
                                    placeholder="Enter Code (DDMMYY-XXXX)"
                                    value={sessionCode}
                                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => e.key === 'Enter' && markAttendance()}
                                    className="h-14 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-xl font-mono text-xl font-bold tracking-widest pl-12"
                                    disabled={isMarking}
                                />
                                <QrCode className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            </div>
                            <Button
                                onClick={() => markAttendance()}
                                disabled={isMarking || !sessionCode.trim()}
                                className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-tighter shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2"
                            >
                                {isMarking ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                Submit
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-[2rem] p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none group-hover:scale-125 transition-transform duration-700" />

                    <div className="relative z-10 space-y-6 h-full flex flex-col justify-between">
                        <div>
                            <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-inner">
                                <MapPin className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mb-2 uppercase italic leading-none">Geo-Gate<br />Security</h3>
                            <p className="text-white/60 font-medium text-sm leading-relaxed">Attendance is only valid when verified within the classroom perimeter (50m).</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                                <div className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-400/10 px-2 py-1 rounded-md">Status</div>
                                <div className="flex-1 text-sm font-bold truncate">
                                    {userLocation ? "Location Locked" : "GPS Signal Required"}
                                </div>
                                <div className={cn("w-2 h-2 rounded-full", userLocation ? "bg-green-500" : "bg-red-500")} />
                            </div>
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-widest text-center">Protocol: EduTrack-V2.5</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Attendance History */}
            <Card className="bg-white dark:bg-slate-800 border-none shadow-sm rounded-[2rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-100 dark:border-slate-700 flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        <Calendar className="w-7 h-7 text-indigo-600" />
                        Attendance Journal
                    </CardTitle>
                    <Badge className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 px-4 py-1.5 rounded-full font-bold">
                        Latest {attendanceData.length > 5 ? '5' : attendanceData.length} records
                    </Badge>
                </CardHeader>
                <CardContent className="p-0">
                    {attendanceData.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                                <Calendar className="w-10 h-10 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-bold">No entries found in your journal</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Scan a QR to register your first day</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {attendanceData.slice(0, 10).map((record, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2",
                                            record.status === 'present' ? "border-green-100 bg-green-50 dark:bg-green-950/20" :
                                                record.status === 'absent' ? "border-red-100 bg-red-50 dark:bg-red-950/20" :
                                                    "border-orange-100 bg-orange-50 dark:bg-orange-950/20"
                                        )}>
                                            <span className="text-xs font-black uppercase text-slate-400 leading-none mb-1">
                                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-xl font-black leading-none text-slate-700 dark:text-slate-200">
                                                {new Date(record.date).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-black text-lg text-slate-900 dark:text-white leading-none mb-1">
                                                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                            </p>
                                            <p className="text-sm font-bold text-slate-400">
                                                Verified at {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:block text-right">
                                            <p className="text-[10px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-1">Status Protocol</p>
                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Classroom Synced</p>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2",
                                            getStatusColor(record.status)
                                        )}>
                                            {record.status}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {attendanceData.length > 10 && (
                        <div className="p-6 bg-slate-50 dark:bg-slate-950/50 text-center">
                            <Button variant="ghost" className="text-sm font-black text-indigo-600 uppercase tracking-widest">
                                Load Full History
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* QR Scanner Modal */}
            {isScannerOpen && (
                <QRScanner
                    onScanSuccess={handleScanSuccess}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}
        </div>
    );
}

export default function StudentAttendancePage() {
    return (
        <Suspense fallback={<Loading text="Initializing Protocol..." />}>
            <div className="bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
                <StudentAttendance />
            </div>
        </Suspense>
    );
}
