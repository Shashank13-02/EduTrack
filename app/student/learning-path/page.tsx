'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    Sparkles,
    Coffee,
    BookOpen,
    Zap,
    RefreshCw,
    AlertCircle,
    CalendarDays,
    BarChart3,
    Grid3x3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loading, LoadingSpinner } from '@/components/ui/Loading';
import { cn } from '@/lib/utils';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { ConsistencyTracker } from '@/components/student/ConsistencyTracker';
import { TodaysTasks } from '@/components/student/TodaysTasks';
import { WeeklyReport } from '@/components/student/WeeklyReport';

type ActiveTab = 'today' | 'overview' | 'report';

export default function LearningPath() {
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('today');

    // Today's data
    const [todayData, setTodayData] = useState<any>(null);
    const [todayLoading, setTodayLoading] = useState(false);

    // Weekly data
    const [weeklyData, setWeeklyData] = useState<any>(null);
    const [weeklyLoading, setWeeklyLoading] = useState(false);

    useEffect(() => {
        fetchLearningPath();
    }, []);

    useEffect(() => {
        if (activeTab === 'today' && data) {
            fetchTodayTasks();
        } else if (activeTab === 'report') {
            fetchWeeklyReport();
        }
    }, [activeTab, data]);

    const fetchLearningPath = async () => {
        try {
            const response = await fetch('/api/student/learning-path');
            const result = await response.json();
            if (response.ok) {
                setData(result.path);
            }
        } catch (error) {
            console.error('Error fetching learning path:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTodayTasks = async () => {
        setTodayLoading(true);
        try {
            const response = await fetch('/api/student/learning-path/today');
            const result = await response.json();
            if (response.ok) {
                setTodayData(result);
            } else {
                setError(result.error);
            }
        } catch (error) {
            console.error('Error fetching today\'s tasks:', error);
            setError('Failed to load today\'s tasks');
        } finally {
            setTodayLoading(false);
        }
    };

    const fetchWeeklyReport = async () => {
        setWeeklyLoading(true);
        try {
            const response = await fetch('/api/student/learning-path/weekly-report');
            const result = await response.json();
            if (response.ok) {
                setWeeklyData(result);
            } else {
                setError(result.error);
            }
        } catch (error) {
            console.error('Error fetching weekly report:', error);
            setError('Failed to load weekly report');
        } finally {
            setWeeklyLoading(false);
        }
    };

    const handleTaskToggle = async (taskId: string) => {
        try {
            const response = await fetch('/api/student/learning-path/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId,
                    date: todayData?.date
                })
            });
            const result = await response.json();
            if (response.ok) {
                setError(null);
                // Refresh today's data
                await fetchTodayTasks();
            } else {
                setError(result.error);
            }
        } catch (error) {
            console.error('Error toggling task:', error);
            setError('Failed to update task');
        }
    };

    const generateNewPath = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await fetch('/api/student/learning-path', {
                method: 'POST',
            });
            const result = await response.json();
            if (response.ok) {
                setData(result.path);
                // Refresh today's data if on today tab
                if (activeTab === 'today') {
                    await fetchTodayTasks();
                }
            } else {
                setError(result.error || 'Failed to generate path');
            }
        } catch (error) {
            setError('Error connecting to AI service');
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) return <Loading text="Fetching your learning path..." />;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    const getTaskIcon = (type: string) => {
        switch (type) {
            case 'rest': return <Coffee className="w-4 h-4 text-emerald-500" />;
            case 'skill': return <Zap className="w-4 h-4 text-amber-500" />;
            default: return <BookOpen className="w-4 h-4 text-blue-500" />;
        }
    };

    const getTaskColor = (type: string) => {
        switch (type) {
            case 'rest': return "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700";
            case 'skill': return "bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700";
            default: return "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700";
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto pb-20 relative min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
            <ParticleBackground />

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-amber-500" />
                        Learning Path
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">Your AI-optimized daily routine for skill development</p>
                </div>
                <Button
                    onClick={generateNewPath}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 rounded-2xl px-6 h-14 shadow-lg shadow-blue-100 group"
                >
                    {isGenerating ? (
                        <><LoadingSpinner size="sm" className="mr-2" /> Generating...</>
                    ) : (
                        <><RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" /> Refresh AI Routine</>
                    )}
                </Button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {!data || !data.dailyRoutine || data.dailyRoutine.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-16 text-center shadow-sm border border-gray-100">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Brain className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No routine generated yet</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Generative AI can create a custom 7-day schedule focused on your department, goals, and current skill levels.
                    </p>
                    <Button
                        onClick={generateNewPath}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8"
                    >
                        {isGenerating ? 'Analyzing Profile...' : 'Generate My Daily Routine 🚀'}
                    </Button>
                </div>
            ) : (
                <>
                    {/* Consistency Tracker - Show on today and report tabs */}
                    {(activeTab === 'today' || activeTab === 'report') && todayData && (
                        <div className="mb-8">
                            <ConsistencyTracker
                                dayNumber={todayData.dayNumber}
                                currentStreak={todayData.streak.current}
                                longestStreak={todayData.streak.longest}
                                totalDays={todayData.streak.totalDays}
                            />
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-8 flex-wrap">
                        <Button
                            onClick={() => setActiveTab('today')}
                            className={cn(
                                "rounded-xl px-6 h-12 transition-all",
                                activeTab === 'today'
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            <CalendarDays className="w-5 h-5 mr-2" />
                            Today's Focus
                        </Button>
                        <Button
                            onClick={() => setActiveTab('overview')}
                            className={cn(
                                "rounded-xl px-6 h-12 transition-all",
                                activeTab === 'overview'
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            <Grid3x3 className="w-5 h-5 mr-2" />
                            7-Day Overview
                        </Button>
                        <Button
                            onClick={() => setActiveTab('report')}
                            className={cn(
                                "rounded-xl px-6 h-12 transition-all",
                                activeTab === 'report'
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            <BarChart3 className="w-5 h-5 mr-2" />
                            Weekly Report
                        </Button>
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'today' && (
                            <motion.div
                                key="today"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                {todayLoading ? (
                                    <Loading text="Loading today's tasks..." />
                                ) : todayData ? (
                                    <TodaysTasks
                                        dayNumber={todayData.dayNumber}
                                        dayName={todayData.dayName}
                                        date={todayData.date}
                                        tasks={todayData.tasks}
                                        completionStats={todayData.completionStats}
                                        onTaskToggle={handleTaskToggle}
                                    />
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>Failed to load today's tasks. Please try again.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                variants={containerVariants}
                                className="grid grid-cols-1 md:grid-cols-7 gap-4"
                            >
                                {data.dailyRoutine.map((dayPlan: any) => (
                                    <motion.div
                                        key={dayPlan.day}
                                        variants={itemVariants}
                                        className="space-y-4"
                                    >
                                        <div className="text-center pb-2">
                                            <h3 className="font-bold text-slate-100">
                                                {dayPlan.day}
                                            </h3>
                                            <div className="w-1 h-1 bg-blue-600 rounded-full mx-auto mt-1" />
                                        </div>

                                        <div className="space-y-3">
                                            {dayPlan.tasks.map((task: any, tIdx: number) => (
                                                <motion.div
                                                    key={tIdx}
                                                    whileHover={{ y: -2 }}
                                                    className={cn(
                                                        "p-4 rounded-3xl border transition-all cursor-pointer relative group",
                                                        getTaskColor(task.type)
                                                    )}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getTaskIcon(task.type)}
                                                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                                                            {task.time || 'flexible'}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                                        {task.title}
                                                    </h4>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                        {task.description}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'report' && (
                            <motion.div
                                key="report"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                {weeklyLoading ? (
                                    <Loading text="Generating weekly report..." />
                                ) : weeklyData ? (
                                    <WeeklyReport
                                        weekData={weeklyData.weekData}
                                        weeklyAverage={weeklyData.weeklyAverage}
                                        totalTasksCompleted={weeklyData.totalTasksCompleted}
                                        totalTasks={weeklyData.totalTasks}
                                        insights={weeklyData.insights}
                                    />
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>Failed to load weekly report. Please try again.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {data && data.lastUpdated && (
                <p className="text-center text-xs text-gray-400 mt-8">
                    Last optimized by AI on {new Date(data.lastUpdated).toLocaleString()}
                </p>
            )}
        </div>
    );
}
