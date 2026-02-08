'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { getRiskLevelColor, getRiskLevelText } from '@/lib/riskPredictor';
import { PerformanceBarChart } from '@/components/charts/PerformanceChart';
import { SkillRadarChart } from '@/components/charts/SkillRadar';
import { AttendanceCalendar } from '@/components/dashboard/AttendanceCalendar';
import { ProgressGraph } from '@/components/dashboard/ProgressGraph';
import { EngagementMetrics } from '@/components/dashboard/EngagementMetrics';
import { SkillGapSection } from '@/components/dashboard/SkillGapSection';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { PDFReportGenerator } from '@/components/dashboard/PDFReportGenerator';
import {
    User, GraduationCap, TrendingUp, Calendar, Activity,
    Brain, Bell, Download, Award, Target, ChevronRight, Route
} from 'lucide-react';
import { calculateGrade, getGradeColor } from '@/lib/gradeCalculator';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { MagicCard } from '@/components/ui/MagicCard';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { cn } from '@/lib/utils';

export default function StudentDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/student/me', { cache: 'no-store' });

            if (response.status === 401 || response.status === 404) {
                // Token invalid or user not found (likely due to DB reset)
                router.push('/auth/login');
                return;
            }

            const result = await response.json();
            if (response.ok) {
                setData(result);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Loading text="Loading your personalized dashboard..." />;
    if (!data) return <div className="min-h-screen flex items-center justify-center">Error loading data</div>;

    const performanceData = data.performanceRecords.map((p: any) => ({
        subject: p.subjectName,
        midSem1: p.midSem1 || 0,
        midSem2: p.midSem2 || 0,
        endSem: p.endSem || 0,
        assignment: p.assignment || 0,
    }));

    const skillData = data.skillScores.map((s: any) => ({
        skill: s.skillName,
        score: s.score,
    }));

    return (
        <div className="min-h-screen bg-background transition-colors duration-500">
            {/* Particle Background */}
            <ParticleBackground />

            {/* Hero Header */}
            <header className="relative bg-gradient-to-r from-primary via-indigo-600 to-violet-600 dark:from-primary/80 dark:via-indigo-900 dark:to-violet-900 shadow-xl overflow-hidden z-10">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>

                <div className="container mx-auto px-4 py-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                                <GraduationCap className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                                    Welcome back, {data.student.name}! 👋
                                </h1>
                                <p className="text-blue-50 text-sm md:text-base opacity-90">
                                    {data.student.department} • Year {data.student.year} • {data.student.studentType || 'Student'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <ThemeToggle />
                            <Link href="/student/learning-path">
                                <Button
                                    variant="ghost"
                                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm rounded-xl px-6"
                                >
                                    <Brain className="w-4 h-4 mr-2" />
                                    Daily Routine
                                </Button>
                            </Link>
                            <Link href="/student/roadmap">
                                <Button
                                    variant="ghost"
                                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm rounded-xl px-6"
                                >
                                    <Route className="w-4 h-4 mr-2" />
                                    Career Roadmap
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                {/* AI Quick Insight Section */}
                <motion.section
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    <div className="group cursor-pointer" onClick={() => router.push('/student/learning-path')}>
                        <MagicCard className="rounded-3xl" gradient glow>
                            <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-3xl relative overflow-hidden">
                                <Brain className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold mb-2 text-white relative z-10">Refine Learning Path</h3>
                                <p className="text-blue-100 text-sm mb-4 relative z-10">Get a personalized 7-day routine based on your latest performance.</p>
                                <div className="flex items-center gap-2 font-bold text-xs text-white relative z-10">
                                    EXPLORE ROUTINE <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </MagicCard>
                    </div>

                    <div className="group cursor-pointer" onClick={() => router.push('/student/roadmap')}>
                        <MagicCard className="rounded-3xl" gradient glow>
                            <div className="p-8 bg-gradient-to-br from-purple-600 to-pink-700 dark:from-purple-700 dark:to-pink-800 rounded-3xl relative overflow-hidden">
                                <Route className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold mb-2 text-white relative z-10">Career Roadmap</h3>
                                <p className="text-purple-100 text-sm mb-4 relative z-10">Visualize your journey from student to professional milestones.</p>
                                <div className="flex items-center gap-2 font-bold text-xs text-white relative z-10">
                                    VIEW ROADMAP <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </MagicCard>
                    </div>

                    <Card className="
    rounded-3xl 
    border 
    border-blue-900/40 
    shadow-lg 
    bg-gradient-to-br 
    from-slate-900 
    via-blue-950 
    to-indigo-950 
    p-6
">
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 mb-2">
                                    Skill Progress
                                </h3>

                                <p className="text-slate-300 text-sm">
                                    You are doing great in{' '}
                                    <span className="text-cyan-400 font-semibold">
                                        {data.skillScores?.[0]?.skillName || 'core subjects'}
                                    </span>
                                    !
                                </p>
                            </div>

                            <Link href="/student/profile">
                                <Button
                                    variant="ghost"
                                    className="
                    text-cyan-400 
                    p-0 
                    hover:bg-transparent 
                    hover:text-cyan-300 
                    flex 
                    items-center 
                    gap-1 
                    font-bold 
                    text-xs
                "
                                >
                                    UPDATE SKILLS <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                    </Card>

                </motion.section>
                {/* Profile Overview */}
                <section className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-2xl font-bold text-indigo-700 dark:text-slate-100">Profile Overview</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                        <MagicCard className="glass-card hover:shadow-lg" glow>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                        <AnimatedCounter value={data.attendancePercent} suffix="%" />
                                    </div>
                                </div>
                                <div className="text-muted-foreground font-medium">Attendance</div>
                                <div className="text-xs text-muted-foreground/80 mt-1">
                                    {data.attendancePercent >= 75 ? '✅ Good standing' : '⚠️ Below 75%'}
                                </div>
                            </CardContent>
                        </MagicCard>

                        <MagicCard className="glass-card hover:shadow-lg" glow>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                                        <AnimatedCounter value={data.averageScore} suffix="%" />
                                    </div>
                                </div>
                                <div className="text-muted-foreground font-medium">Average Score</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className={`inline-block px-2 py-1 rounded border text-xs font-semibold ${getGradeColor(calculateGrade(data.averageScore).grade)}`}>
                                        Grade {calculateGrade(data.averageScore).grade}
                                    </div>
                                    <span className="text-xs text-muted-foreground">across all subjects</span>
                                </div>
                            </CardContent>
                        </MagicCard>

                        <MagicCard className="glass-card hover:shadow-lg" glow>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                    <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                                        <AnimatedCounter value={Math.round(data.engagementScore)} suffix="%" />
                                    </div>
                                </div>
                                <div className="text-muted-foreground font-medium">Engagement</div>
                                <div className="text-xs text-muted-foreground/80 mt-1">Class participation</div>
                            </CardContent>
                        </MagicCard>

                        <MagicCard className="glass-card hover:shadow-lg" glow>
                            <CardContent className="pt-6 text-center">
                                <Badge className={`${getRiskLevelColor(data.riskLevel)} text-xl px-6 py-3 mb-2`}>
                                    {getRiskLevelText(data.riskLevel)}
                                </Badge>
                                <div className="text-muted-foreground font-medium mt-2">Risk Status</div>
                                <div className="text-xs text-muted-foreground/80 mt-1">
                                    {data.riskLevel === 'low' ? '🎯 Keep it up!' : '📈 Needs attention'}
                                </div>
                            </CardContent>
                        </MagicCard>
                    </div>
                </section>

                {/* Alerts & Notifications */}
                <section className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-6 h-6 text-amber-400" />
                        <h2 className="text-2xl font-bold text-slate-100">
                            Alerts & Notifications
                        </h2>
                    </div>

                    <AlertsPanel
                        attendancePercent={data.attendancePercent}
                        averageScore={data.averageScore}
                        riskLevel={data.riskLevel}
                    />
                </section>


                {/* Performance Analytics */}
                <section className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-2xl font-bold text-indigo-700 dark:text-slate-100">Performance Analytics</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                        {performanceData.length > 0 && (
                            <Card className="glass-card">
                                <CardHeader>
                                    <CardTitle>Subject-wise Performance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <PerformanceBarChart data={performanceData} />
                                </CardContent>
                            </Card>
                        )}

                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Performance Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProgressGraph performanceRecords={data.performanceRecords} />
                            </CardContent>
                        </Card>
                    </div>

                    {data.performanceRecords.length > 0 && (
                        <Card className="glass-card overflow-hidden">
                            <CardHeader>
                                <CardTitle>Academic Scorecard</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:bg-slate-800/50 text-indigo-700 dark:text-slate-400 uppercase text-[10px] font-bold">
                                            <tr>
                                                <th className="px-6 py-4">Subject</th>
                                                <th className="px-4 py-4">Mid-Sem 1 (10)</th>
                                                <th className="px-4 py-4">Mid-Sem 2 (10)</th>
                                                <th className="px-4 py-4">Assignment (10)</th>
                                                <th className="px-4 py-4 text-indigo-600 dark:text-indigo-400 font-bold">End-Sem (70)</th>
                                                <th className="px-4 py-4 text-right">Weighted Avg</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-blue-100 dark:divide-slate-800">
                                            {data.performanceRecords.map((record: any) => {
                                                const avg = Math.round(
                                                    ((record.midSem1 || 0) + (record.midSem2 || 0) + (record.assignment || 0) + (record.endSem || 0)) /
                                                    ((record.midSem1 !== null ? 10 : 0) + (record.midSem2 !== null ? 10 : 0) + (record.assignment !== null ? 10 : 0) + (record.endSem !== null ? 70 : 0)) * 100
                                                ) || 0;

                                                return (
                                                    <tr key={record._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-6 py-4 font-semibold text-indigo-900 dark:text-slate-100">{record.subjectName}</td>
                                                        <td className="px-4 py-4 text-indigo-700 dark:text-slate-400">{record.midSem1 ?? '—'}</td>
                                                        <td className="px-4 py-4 text-indigo-700 dark:text-slate-400">{record.midSem2 ?? '—'}</td>
                                                        <td className="px-4 py-4 text-indigo-700 dark:text-slate-400">{record.assignment ?? '—'}</td>
                                                        <td className="px-4 py-4 font-bold text-indigo-600 dark:text-indigo-400">{record.endSem ?? '—'}</td>
                                                        <td className="px-4 py-4 text-right">
                                                            <Badge variant="outline" className={cn("font-bold", avg >= 75 ? "border-green-500 text-green-600 dark:text-green-400 dark:border-green-400" : avg >= 60 ? "border-yellow-500 text-yellow-600 dark:text-yellow-400 dark:border-yellow-400" : "border-red-500 text-red-600 dark:text-red-400 dark:border-red-400")}>
                                                                {avg}%
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </section>

                {/* Attendance Tracking */}
                <section className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h2 className="text-2xl font-bold text-indigo-700 dark:text-slate-100">Attendance Tracking</h2>
                    </div>

                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            <AttendanceCalendar
                                attendanceRecords={data.attendanceRecords}
                                totalSessionsInMonth={data.totalClassesInMonth}
                            />
                        </CardContent>
                    </Card>
                </section>

                {/* Engagement & Activity */}
                <section className="mb-8 animate-fade-in">
                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            <EngagementMetrics
                                engagementScore={data.engagementScore}
                                performanceRecords={data.performanceRecords}
                            />
                        </CardContent>
                    </Card>
                </section>

                {/* Reports Download */}
                <section className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                        <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h2 className="text-2xl font-bold text-indigo-700 dark:text-slate-100">Download Reports</h2>
                    </div>

                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            <PDFReportGenerator
                                studentData={data.student}
                                performanceRecords={data.performanceRecords}
                                skillScores={data.skillScores}
                                attendancePercent={data.attendancePercent}
                                averageScore={data.averageScore}
                                riskLevel={data.riskLevel}
                                latestReport={data.latestReport}
                            />
                        </CardContent>
                    </Card>
                </section>
            </div>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:bg-slate-900 border-t border-blue-200 dark:border-slate-800 text-indigo-700 dark:text-slate-200 py-8 mt-12 shadow-inner">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm dark:text-black">
                        © 2026 EduTrack - Personalized Student Performance Tracking System
                    </p>
                    <p className="text-xs text-indigo-600 dark:text-slate-400 mt-2">
                        Powered by AI • Built with ❤️ for Student Success
                    </p>
                </div>
            </footer>
        </div >
    );
}
