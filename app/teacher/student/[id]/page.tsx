'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading, LoadingSpinner } from '@/components/ui/Loading';
import { Input } from '@/components/ui/Input';
import { getRiskLevelColor, getRiskLevelText } from '@/lib/riskPredictor';
import {
    FileText,
    User,
    Mail,
    Calendar,
    TrendingUp,
    ChevronLeft,
    GraduationCap,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    History,
    Clock,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PerformanceBarChart } from '@/components/charts/PerformanceChart';
import {
    Info,
    CheckCircle,
    BrainCircuit,
    Award,
    School,
    MessageCircle,
    Target as TargetIcon
} from 'lucide-react';

// Helper component for multi-line text or bullet points
const FormattedText = ({ text, className }: { text: string; className?: string }) => {
    if (!text) return null;
    const blocks = text.split(/\n|•/).filter(b => b.trim().length > 0);
    return (
        <div className={cn("space-y-2", className)}>
            {blocks.map((block, i) => (
                <p key={i} className="flex gap-2">
                    {blocks.length > 1 && <span className="text-indigo-500/70 shrink-0">•</span>}
                    {block.trim()}
                </p>
            ))}
        </div>
    );
};

export default function StudentDetailPage() {
    const router = useRouter();
    const params = useParams();
    const studentId = params?.id as string; // ✅ safe

    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isUpdatingPerformance, setIsUpdatingPerformance] = useState(false);
    const [data, setData] = useState<any>(null);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const [attendanceForm, setAttendanceForm] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'present' as 'present' | 'absent' | 'late',
    });

    const [performanceForm, setPerformanceForm] = useState({
        subjectName: '',
        midSem1: '',
        midSem2: '',
        endSem: '',
        assignment: '',
    });

    useEffect(() => {
        if (!studentId) return;
        fetchStudentData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId]);

    const fetchStudentData = async () => {
        try {
            const response = await fetch(`/api/teacher/student/${studentId}`, { cache: 'no-store' });
            const result = await response.json();
            if (response.ok) {
                setData(result);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/teacher/attendance/mark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    ...attendanceForm,
                }),
            });

            if (response.ok) {
                alert('Attendance marked successfully!');
                fetchStudentData();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleUpdatePerformance = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateError(null);
        setIsUpdatingPerformance(true);

        try {
            const response = await fetch('/api/teacher/performance/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    subjectName: performanceForm.subjectName,
                    midSem1: parseInt(performanceForm.midSem1) || 0,
                    midSem2: parseInt(performanceForm.midSem2) || 0,
                    endSem: parseInt(performanceForm.endSem) || 0,
                    assignment: parseInt(performanceForm.assignment) || 0,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Performance updated successfully!');
                fetchStudentData();
                setPerformanceForm({
                    subjectName: '',
                    midSem1: '',
                    midSem2: '',
                    endSem: '',
                    assignment: '',
                });
            } else {
                setUpdateError(data.error || 'Failed to update performance. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            setUpdateError('An error occurred. Please check your connection and try again.');
        } finally {
            setIsUpdatingPerformance(false);
        }
    };

    const generateAIReport = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId }),
            });

            if (response.ok) {
                alert('AI Report generated successfully!');
                fetchStudentData();
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) return <Loading text="Loading student details..." />;
    if (!data) return <div>Error loading student</div>;

    const performanceData = data.performanceRecords.map((p: any) => ({
        subject: p.subjectName,
        midSem1: p.midSem1 || 0,
        midSem2: p.midSem2 || 0,
        endSem: p.endSem || 0,
        assignment: p.assignment || 0,
    }));
    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Student Profile
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Viewing detailed performance and academic records
                    </p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Profile Overview Card */}
                <Card className="lg:col-span-2 overflow-hidden border-none bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-3xl">
                    <div className="h-32 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 p-6 relative">
                        <div className="absolute top-6 right-6 flex gap-2">
                            <Badge className={cn("px-3 py-1 text-xs font-bold border-none shadow-lg", getRiskLevelColor(data.riskLevel))}>
                                {getRiskLevelText(data.riskLevel)}
                            </Badge>
                        </div>
                    </div>

                    <CardContent className="pt-0 px-8 pb-8">
                        <div className="relative -mt-12 mb-6 flex flex-col md:flex-row md:items-end gap-6">
                            <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-800 p-2 shadow-xl">
                                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                                    <User className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                                </div>
                            </div>
                            <div className="pb-2">
                                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{data.student.name}</h2>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                                        <Mail className="w-4 h-4" />
                                        {data.student.email}
                                    </span>
                                    <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full hidden md:block"></span>
                                    <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
                                        <GraduationCap className="w-4 h-4" />
                                        {data.student.department || 'Academic Dept.'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 pt-4">
                            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/40">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-600 rounded-lg text-white">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Attendance</span>
                                </div>
                                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                                    {data.attendancePercent}%
                                </div>
                                <div className="mt-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">Consistency Score</div>
                            </div>

                            <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/40">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-purple-600 rounded-lg text-white">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg. Score</span>
                                </div>
                                <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                                    {data.averageScore}%
                                </div>
                                <div className="mt-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">Academic Ranking</div>
                            </div>

                            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/40">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-emerald-600 rounded-lg text-white">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Enrollment</span>
                                </div>
                                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight">
                                    Year {data.student.year || 'N/A'}
                                    <br />
                                    <span className="text-xs font-normal text-slate-500">Year {data.student.year || '1'}</span>
                                </div>
                                <div className="mt-2 text-[10px] text-slate-400 uppercase tracking-widest font-bold">Status: Active</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Left col sidebar or action buttons? No, just keep it clean */}
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Mark Attendance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mark Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleMarkAttendance} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                                <Input
                                    type="date"
                                    value={attendanceForm.date}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                <div className="flex gap-4">
                                    {['present', 'absent', 'late'].map((status) => (
                                        <label key={status} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                value={status}
                                                checked={attendanceForm.status === status}
                                                onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value as any })}
                                                className="w-4 h-4"
                                            />
                                            <span className="capitalize">{status}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90">
                                Mark Attendance
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Update Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Update Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdatePerformance} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject Name</label>
                                <Input
                                    type="text"
                                    placeholder="e.g., Mathematics"
                                    value={performanceForm.subjectName}
                                    onChange={(e) => setPerformanceForm({ ...performanceForm, subjectName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mid-Sem 1</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="10"
                                        placeholder="0-10"
                                        value={performanceForm.midSem1}
                                        onChange={(e) => setPerformanceForm({ ...performanceForm, midSem1: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mid-Sem 2</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="10"
                                        placeholder="0-10"
                                        value={performanceForm.midSem2}
                                        onChange={(e) => setPerformanceForm({ ...performanceForm, midSem2: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">End-Sem</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="70"
                                        placeholder="0-70"
                                        value={performanceForm.endSem}
                                        onChange={(e) => setPerformanceForm({ ...performanceForm, endSem: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assignment</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="10"
                                        placeholder="0-10"
                                        value={performanceForm.assignment}
                                        onChange={(e) => setPerformanceForm({ ...performanceForm, assignment: e.target.value })}
                                    />
                                </div>
                            </div>
                            {updateError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {updateError}
                                </div>
                            )}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90"
                                disabled={isUpdatingPerformance}
                            >
                                {isUpdatingPerformance ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <LoadingSpinner size="sm" />
                                        Updating...
                                    </span>
                                ) : (
                                    'Update Performance'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Chart */}
            {performanceData.length > 0 && (
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Performance Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PerformanceBarChart data={performanceData} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Subject Scorecard</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold">
                                        <tr>
                                            <th className="px-4 py-3">Subject</th>
                                            <th className="px-2 py-3">M1</th>
                                            <th className="px-2 py-3">M2</th>
                                            <th className="px-2 py-3">AS</th>
                                            <th className="px-2 py-3 text-indigo-600 font-bold">ES</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {data.performanceRecords.map((record: any) => (
                                            <tr key={record._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{record.subjectName}</td>
                                                <td className="px-2 py-3 text-slate-600 dark:text-slate-400">{record.midSem1 ?? '—'}</td>
                                                <td className="px-2 py-3 text-slate-600 dark:text-slate-400">{record.midSem2 ?? '—'}</td>
                                                <td className="px-2 py-3 text-slate-600 dark:text-slate-400">{record.assignment ?? '—'}</td>
                                                <td className="px-2 py-3 font-semibold text-indigo-600 dark:text-indigo-400">{record.endSem ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* AI Report */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>🤖 AI Analysis Report</CardTitle>
                        <Button
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 border-none hover:opacity-90"
                            onClick={generateAIReport}
                            disabled={isGenerating}
                        >
                            {isGenerating ? <LoadingSpinner size="sm" /> : 'Generate Report'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {data.latestReport ? (
                        (() => {
                            let reportData: any = null;
                            try {
                                reportData = typeof data.latestReport.reportText === 'string'
                                    ? JSON.parse(data.latestReport.reportText)
                                    : data.latestReport.reportText;
                            } catch {
                                reportData = { overallAssessment: data.latestReport.reportText };
                            }

                            if (!reportData || (!reportData.overallAssessment && !reportData.teacherMessage)) {
                                return <p className="text-gray-500 italic">Report content unavailable in full format.</p>;
                            }

                            return (
                                <div className="space-y-8">
                                    {/* Overall Assessment */}
                                    {reportData.overallAssessment && (
                                        <div className="space-y-3">
                                            <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                <Info className="w-5 h-5 text-indigo-500" />
                                                Executive Summary
                                            </h4>
                                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 italic text-slate-600 dark:text-slate-400 leading-relaxed shadow-sm">
                                                <FormattedText text={reportData.overallAssessment} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Strengths */}
                                        {reportData.strengths?.length > 0 && (
                                            <div className="p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/20">
                                                <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
                                                    <Award className="w-5 h-5" />
                                                    Core Strengths
                                                </h4>
                                                <ul className="space-y-3">
                                                    {reportData.strengths.map((strength: string, idx: number) => (
                                                        <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3">
                                                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                                            {strength}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Risk Assessment */}
                                        <div className={cn(
                                            "p-6 rounded-3xl border shadow-sm",
                                            data.riskLevel === 'high'
                                                ? "bg-pink-50/30 dark:bg-pink-950/20 border-pink-100 dark:border-pink-900/30"
                                                : "bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30"
                                        )}>
                                            <h4 className={cn(
                                                "font-bold mb-4 flex items-center gap-2",
                                                data.riskLevel === 'high' ? "text-pink-700 dark:text-pink-400" : "text-indigo-700 dark:text-indigo-400"
                                            )}>
                                                <AlertTriangle className="w-5 h-5" />
                                                Risk Profile: {data.riskLevel?.toUpperCase()}
                                            </h4>
                                            <div className="space-y-2">
                                                {reportData.riskAssessment?.factors?.map((f: string, i: number) => (
                                                    <p key={i} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2 items-start">
                                                        <span className="opacity-50 mt-1.5">•</span> {f}
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Academic & Behavioral Grid */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {reportData.academicPerformance && (
                                            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                                    <School className="w-5 h-5 text-blue-500" />
                                                    Academic Standing
                                                </h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 block">Strong Performance</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {reportData.academicPerformance.topSubjects?.map((s: string, i: number) => (
                                                                <Badge key={i} variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/50">{s}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2 block">Intervention Needed</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {reportData.academicPerformance.strugglingSubjects?.map((s: string, i: number) => (
                                                                <Badge key={i} variant="outline" className="bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-900/50">{s}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {reportData.behavioralInsights && (
                                            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                                                    <BrainCircuit className="w-5 h-5 text-purple-500" />
                                                    Behavioral Insights
                                                </h4>
                                                <div className="mb-3">
                                                    <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-none px-3 py-1">
                                                        {reportData.behavioralInsights.engagementLevel} Engagement
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                                    "{reportData.behavioralInsights.observations}"
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Plan */}
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                            <TargetIcon className="w-5 h-5 text-orange-500" />
                                            Strategic Intervention Plan
                                        </h4>
                                        <div className="grid gap-4">
                                            {reportData.actionPlan?.immediate?.length > 0 && (
                                                <div className="p-5 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30">
                                                    <div className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                                        <Clock className="w-4 h-4" /> Priority 1: 1-2 Weeks
                                                    </div>
                                                    <ul className="space-y-2">
                                                        {reportData.actionPlan.immediate.map((item: string, i: number) => (
                                                            <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex gap-3">
                                                                <span className="text-indigo-500 font-bold">•</span> {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Teacher Message */}
                                    {reportData.teacherMessage && (
                                        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-500/20">
                                            <div className="flex items-center gap-2 mb-3 text-white/70 font-bold uppercase tracking-widest text-[10px]">
                                                <MessageCircle className="w-5 h-5" />
                                                Feedback Message to Student
                                            </div>
                                            <div className="text-lg leading-relaxed font-medium italic">
                                                <FormattedText text={`"${reportData.teacherMessage}"`} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()
                    ) : (
                        <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                            <BrainCircuit className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 italic">No AI report generated yet. Click &quot;Generate Report&quot; to provide AI insights for this student.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
