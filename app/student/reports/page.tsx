'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    TrendingUp,
    CheckCircle2,
    Clock,
    User,
    CalendarDays,
} from 'lucide-react';

import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/Card';

import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Target,
    Activity,
    AlertTriangle,
    CheckCircle,
    Info,
    MessageCircle,
    BrainCircuit,
    Award,
    School
} from 'lucide-react';

// Helper component for multi-line text or bullet points
const FormattedText = ({ text, className }: { text: string; className?: string }) => {
    if (!text) return null;

    // Split by newlines or "•"
    const blocks = text.split(/\n|•/).filter(b => b.trim().length > 0);

    return (
        <div className={cn("space-y-2", className)}>
            {blocks.map((block, i) => (
                <p key={i} className="flex gap-2">
                    {blocks.length > 1 && <span className="text-blue-500/70 shrink-0">•</span>}
                    {block.trim()}
                </p>
            ))}
        </div>
    );
};

interface Report {
    _id: string;
    reportData: any;
    riskLevel: string;
    teacherName: string;
    teacherDepartment: string;
    isRead: boolean;
    notificationId: string;
    createdAt: string;
}

export default function StudentReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch('/api/student/reports');
            const data = await response.json();

            if (response.ok) {
                setReports(data.reports || []);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch('/api/student/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId }),
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleReportClick = (report: Report) => {
        setSelectedReport(report);

        if (!report.isRead && report.notificationId) {
            markAsRead(report.notificationId);

            setReports((prev) =>
                prev.map((r) => (r._id === report._id ? { ...r, isRead: true } : r))
            );
        }
    };

    // ✅ Theme-matched risk colors (blue/purple based)
    const getRiskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'low':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40';
            case 'medium':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40';
            case 'high':
                return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-900/40';
            default:
                return 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300 border border-slate-200 dark:border-slate-900/40';
        }
    };

    if (isLoading) return <Loading text="Loading your reports..." />;

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Reports & Updates
                </h1>
                <p className="text-muted-foreground mt-2">
                    AI-generated performance reports from your teachers
                </p>
            </div>

            {reports.length === 0 ? (
                <Card className="text-center p-12 border bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-md rounded-2xl">
                    <FileText className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        No Reports Yet
                    </h3>
                    <p className="text-muted-foreground">
                        Your teachers haven’t generated any performance reports for you yet.
                    </p>
                </Card>
            ) : (
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Reports List */}
                    <div className="space-y-4">
                        {reports.map((report, index) => (
                            <motion.div
                                key={report._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                            >
                                <Card
                                    onClick={() => handleReportClick(report)}
                                    className={cn(
                                        'cursor-pointer transition-all duration-200 rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-md',
                                        'hover:shadow-xl hover:-translate-y-1',
                                        selectedReport?._id === report._id &&
                                        'ring-2 ring-blue-500/70'
                                    )}
                                >
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-sm">
                                                    <FileText className="w-5 h-5 text-white" />
                                                </div>

                                                <div>
                                                    <h3 className="font-semibold text-foreground">
                                                        Performance Report
                                                    </h3>

                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                        <User className="w-3.5 h-3.5" />
                                                        <span>{report.teacherName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {!report.isRead && (
                                                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse mt-2" />
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge className={cn('rounded-full', getRiskColor(report.riskLevel))}>
                                                Risk: {report.riskLevel}
                                            </Badge>

                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {report.reportData?.teacherMessage ||
                                                report.reportData?.overallAssessment ||
                                                'Click to view full report'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Report Details */}
                    <div className="sticky top-8 h-fit">
                        {selectedReport ? (
                            <motion.div
                                key={selectedReport._id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                <Card className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            Detailed Report
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-6">
                                        {/* Teacher Info */}
                                        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 border border-blue-200/50 dark:border-blue-900/30 flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                                                    Generated by
                                                </div>
                                                <div className="font-bold text-foreground text-lg">
                                                    {selectedReport.teacherName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {selectedReport.teacherDepartment}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-white dark:bg-slate-950 rounded-full shadow-sm">
                                                <User className="w-6 h-6 text-purple-600" />
                                            </div>
                                        </div>

                                        {/* Overall Assessment */}
                                        {selectedReport.reportData?.overallAssessment && (
                                            <div className="space-y-2">
                                                <h4 className="font-bold text-foreground flex items-center gap-2">
                                                    <Info className="w-5 h-5 text-blue-500" />
                                                    Overall Assessment
                                                </h4>
                                                <div className="p-4 rounded-xl bg-background dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 italic text-muted-foreground leading-relaxed">
                                                    <FormattedText text={selectedReport.reportData.overallAssessment} />
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {/* Strengths */}
                                            {selectedReport.reportData?.strengths?.length > 0 && (
                                                <div className="p-5 rounded-2xl border bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-900/40">
                                                    <h4 className="font-bold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                                                        <Award className="w-5 h-5" />
                                                        Strengths
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {selectedReport.reportData.strengths.map((strength: string, idx: number) => (
                                                            <li key={idx} className="text-sm text-emerald-900/70 dark:text-emerald-300/70 flex items-start gap-2">
                                                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                                {strength}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Risk Level Details */}
                                            {selectedReport.reportData?.riskAssessment && (
                                                <div className={cn(
                                                    "p-5 rounded-2xl border",
                                                    selectedReport.riskLevel.toLowerCase() === 'high'
                                                        ? "bg-pink-50/30 dark:bg-pink-950/20 dark:border-pink-900/40"
                                                        : "bg-blue-50/30 dark:bg-blue-950/20 dark:border-blue-900/40"
                                                )}>
                                                    <h4 className={cn(
                                                        "font-bold mb-3 flex items-center gap-2",
                                                        selectedReport.riskLevel.toLowerCase() === 'high' ? "text-pink-700 dark:text-pink-400" : "text-blue-700 dark:text-blue-400"
                                                    )}>
                                                        <AlertTriangle className="w-5 h-5" />
                                                        Risk: {selectedReport.riskLevel}
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {selectedReport.reportData.riskAssessment.factors?.map((f: string, i: number) => (
                                                            <p key={i} className="text-xs text-muted-foreground flex gap-1.5 items-start">
                                                                <span className="opacity-50 mt-1">•</span> {f}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Academic Performance */}
                                        {selectedReport.reportData?.academicPerformance && (
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-foreground flex items-center gap-2">
                                                    <School className="w-5 h-5 text-indigo-500" />
                                                    Academic Status: {selectedReport.reportData.academicPerformance.status}
                                                </h4>
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    <div className="p-4 rounded-xl border dark:border-slate-800 mb-4 bg-white/40 dark:bg-slate-950/40">
                                                        <div className="text-xs font-bold text-emerald-600 mb-2 uppercase tracking-wide">Top Subjects</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedReport.reportData.academicPerformance.topSubjects?.map((s: string, i: number) => (
                                                                <Badge key={i} variant="outline" className="bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/50">{s}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="p-4 rounded-xl border dark:border-slate-800 mb-4 bg-white/40 dark:bg-slate-950/40">
                                                        <div className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-wide">Needs Attention</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedReport.reportData.academicPerformance.strugglingSubjects?.map((s: string, i: number) => (
                                                                <Badge key={i} variant="outline" className="bg-amber-50/50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-900/50">{s}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Behavioral & Engagement */}
                                        {selectedReport.reportData?.behavioralInsights && (
                                            <div className="p-5 rounded-2xl border dark:border-slate-800 bg-white/40 dark:bg-slate-950/40">
                                                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                                    <BrainCircuit className="w-5 h-5 text-purple-500" />
                                                    Behavioral Insights
                                                </h4>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-xs text-muted-foreground">Engagement Level:</span>
                                                    <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-none">
                                                        {selectedReport.reportData.behavioralInsights.engagementLevel}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                    {selectedReport.reportData.behavioralInsights.observations}
                                                </p>
                                            </div>
                                        )}

                                        {/* Areas for Improvement & Action Plan Toggle */}
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-foreground flex items-center gap-2 border-b dark:border-slate-800 pb-2">
                                                <Target className="w-5 h-5 text-orange-500" />
                                                Strategic Action Plan
                                            </h4>

                                            <div className="grid gap-4">
                                                {selectedReport.reportData?.actionPlan?.immediate?.length > 0 && (
                                                    <div className="p-4 rounded-xl border border-blue-200/50 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-950/10">
                                                        <div className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                                                            <Clock className="w-4 h-4" /> Immediate Priorities (1-2 Weeks)
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {selectedReport.reportData.actionPlan.immediate.map((item: string, i: number) => (
                                                                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                                                    <span className="text-blue-500">•</span> {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {selectedReport.reportData?.actionPlan?.shortTerm?.length > 0 && (
                                                    <div className="p-4 rounded-xl border border-purple-200/50 dark:border-purple-900/30 bg-purple-50/20 dark:bg-purple-950/10">
                                                        <div className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-2">
                                                            <CalendarDays className="w-4 h-4" /> Short-Term Goals (1 Month)
                                                        </div>
                                                        <ul className="space-y-2">
                                                            {selectedReport.reportData.actionPlan.shortTerm.map((item: string, i: number) => (
                                                                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                                                                    <span className="text-purple-500">•</span> {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Teacher Message */}
                                        {selectedReport.reportData?.teacherMessage && (
                                            <div className="relative overflow-hidden p-6 rounded-3xl text-white shadow-lg group">
                                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 group-hover:scale-105 transition-transform duration-500 shadow-xl" />
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-3 text-white/80 font-semibold uppercase tracking-widest text-[10px]">
                                                        <MessageCircle className="w-4 h-4" />
                                                        Encouragement Note
                                                    </div>
                                                    <div className="text-base leading-relaxed font-medium italic">
                                                        <FormattedText text={`"${selectedReport.reportData.teacherMessage}"`} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <Card className="text-center p-12 rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-md">
                                <FileText className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
                                <p className="text-muted-foreground">
                                    Select a report to view details
                                </p>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
