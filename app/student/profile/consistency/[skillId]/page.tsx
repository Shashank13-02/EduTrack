'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Flame,
    Trophy,
    TrendingUp,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Zap,
    Target,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import {
    getLevelColor,
    getLevelLabel,
    getXPProgress,
    getCategoryLabel,
    getXPNeededForNextLevel,
    formatTimeSpent,
    getActivityStats,
    checkDailyActivityExists,
} from '@/lib/skillProgress';

interface SkillActivity {
    date: Date;
    timeSpent: number;
    notes: string;
    xpGained: number;
}

interface SkillData {
    _id: string;
    name: string;
    category: string;
    level: number;
    xp: number;
    streak: number;
    bestStreak: number;
    lastPracticed: Date;
    addedDate: Date;
    activities: SkillActivity[];
    milestones: any[];
}

export default function SkillDetailPage() {
    const params = useParams();
    const router = useRouter();
    const skillId = params.skillId as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [skill, setSkill] = useState<SkillData | null>(null);
    const [timeSpent, setTimeSpent] = useState('');
    const [notes, setNotes] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchSkillData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skillId]);

    const fetchSkillData = async () => {
        try {
            const response = await fetch(`/api/student/skills/${skillId}/activity`);
            const data = await response.json();

            if (response.ok) {
                setSkill(data.skill);
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to load skill data' });
            }
        } catch (error) {
            console.error('Error fetching skill:', error);
            setMessage({ type: 'error', text: 'Error loading skill data' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogActivity = async () => {
        if (!skill) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/student/skills/${skillId}/activity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timeSpent: parseInt(timeSpent) || 0,
                    notes: notes.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: data.leveledUp
                        ? `🎉 Level up! You reached Level ${skill.level + 1}!`
                        : 'Activity logged successfully!',
                });
                setTimeSpent('');
                setNotes('');
                fetchSkillData(); // Refresh data
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to log activity' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Error logging activity' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <Loading text="Loading skill details..." />;
    if (!skill) return <div className="p-8 text-center">Skill not found</div>;

    const progress = getXPProgress(skill.xp, skill.level);
    const xpNeeded = getXPNeededForNextLevel(skill.xp, skill.level);
    const stats = getActivityStats(skill.activities || []);
    const alreadyLoggedToday = checkDailyActivityExists(skill.activities || []);

    return (
        <div className="p-8 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-8"
            >
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4 rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Profile
                </Button>

                <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-4xl font-bold text-foreground">{skill.name}</h1>
                    <Badge className={cn('text-sm px-3 py-1 border', getLevelColor(skill.level))}>
                        {getLevelLabel(skill.level)}
                    </Badge>
                    <Badge className="text-xs px-2 py-1 border bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                        {getCategoryLabel(skill.category)}
                    </Badge>
                </div>
            </motion.div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        'mb-6 p-4 rounded-xl flex items-center gap-3',
                        message.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-red-50 text-red-700 border border-red-100'
                    )}
                >
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    {message.text}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* XP Progress Card */}
                    <Card className="rounded-3xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                XP Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-end gap-2">
                                    <span className="text-5xl font-bold text-black dark:text-white">{skill.xp}</span>
                                    <span className="text-2xl text-slate-600 dark:text-slate-300 mb-1">XP</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-700 dark:text-slate-200">Level {skill.level}</span>
                                        <span className="text-slate-700 dark:text-slate-200">
                                            {skill.level >= 5 ? 'Max Level!' : `${xpNeeded} XP to next level`}
                                        </span>
                                    </div>
                                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full relative"
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                        </motion.div>
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-300 text-right">{progress}%</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Logger */}
                    <Card className="rounded-3xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Log Today's Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {alreadyLoggedToday ? (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-green-700 mb-1">
                                        Activity Completed Today!
                                    </h3>
                                    <p className="text-sm text-green-600">
                                        Great job! Come back tomorrow to continue your streak.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                            Time Spent (minutes)
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="30"
                                            value={timeSpent}
                                            onChange={(e) => setTimeSpent(e.target.value)}
                                            className="w-full"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                            Notes (optional)
                                        </label>
                                        <textarea
                                            placeholder="What did you work on today?"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full h-24 p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary transition-all outline-none bg-background text-foreground resize-none"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleLogActivity}
                                        disabled={isSubmitting}
                                        className="w-full rounded-xl py-6 text-lg font-semibold"
                                    >
                                        {isSubmitting ? (
                                            'Logging...'
                                        ) : (
                                            <>
                                                <Zap className="w-5 h-5 mr-2" />
                                                Complete Activity (+20 XP)
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity History */}
                    <Card className="rounded-3xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                Activity History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {skill.activities && skill.activities.length > 0 ? (
                                <div className="space-y-3">
                                    {skill.activities.map((activity, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-muted/50 rounded-xl p-4 border border-border"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                    <span className="font-medium text-black dark:text-white">
                                                        {new Date(activity.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <Badge className="bg-primary/10 text-primary border-primary/20">
                                                    +{activity.xpGained} XP
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                                                {activity.timeSpent > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{formatTimeSpent(activity.timeSpent)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {activity.notes && (
                                                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 italic">
                                                    "{activity.notes}"
                                                </p>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-muted/50 rounded-xl">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-400 dark:text-slate-500 opacity-50" />
                                    <p className="text-slate-700 dark:text-slate-200">No activities logged yet</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                                        Start logging activities to track your progress!
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Streak Card */}
                    <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-500" />
                                Streaks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center">
                                <div className="text-6xl font-bold text-orange-500 mb-2">
                                    {skill.streak}
                                </div>
                                <div className="text-sm text-slate-700 dark:text-slate-200">Current Streak</div>
                            </div>
                            <div className="flex items-center justify-center gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-xl">
                                <Trophy className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm font-medium">Best: {skill.bestStreak} days</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card className="rounded-3xl border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                                <span className="text-sm text-slate-700 dark:text-slate-200">Total Activities</span>
                                <span className="font-semibold text-black dark:text-white">{stats.totalActivities}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                                <span className="text-sm text-slate-700 dark:text-slate-200">Total Time</span>
                                <span className="font-semibold text-black dark:text-white">
                                    {formatTimeSpent(stats.totalTimeSpent)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                                <span className="text-sm text-slate-700 dark:text-slate-200">Avg Time/Activity</span>
                                <span className="font-semibold text-black dark:text-white">
                                    {formatTimeSpent(stats.averageTimePerActivity)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-xl">
                                <span className="text-sm text-slate-700 dark:text-slate-200">Active Days</span>
                                <span className="font-semibold text-black dark:text-white">{stats.activeDays}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
