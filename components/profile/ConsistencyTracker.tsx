'use client';

import { motion } from 'framer-motion';
import { Flame, Award, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { calculateMomentumScore } from '@/lib/skillProgress';

interface ConsistencyTrackerProps {
    skills: any[];
    weeklyActivity?: { date: string; count: number }[];
}

export function ConsistencyTracker({ skills, weeklyActivity = [] }: ConsistencyTrackerProps) {
    const momentumScore = calculateMomentumScore(skills);
    const totalStreak = skills.reduce((sum, s) => sum + s.streak, 0);
    const avgStreak = skills.length > 0 ? Math.round(totalStreak / skills.length) : 0;
    const bestStreak = Math.max(...skills.map(s => s.bestStreak || 0), 0);

    // Generate last 7 weeks of activity (49 days like GitHub)
    const generateHeatmap = () => {
        const days = [];
        const today = new Date();

        for (let i = 48; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Count skills practiced on this day
            const count = skills.filter(skill => {
                const practiceDate = new Date(skill.lastPracticed).toISOString().split('T')[0];
                return practiceDate === dateStr;
            }).length;

            days.push({ date: dateStr, count, day: date.getDay() });
        }

        return days;
    };

    const heatmapData = generateHeatmap();

    const getHeatColor = (count: number) => {
        if (count === 0) return 'bg-muted border-border';
        if (count === 1) return 'bg-green-200 border-green-300';
        if (count === 2) return 'bg-green-400 border-green-500';
        if (count >= 3) return 'bg-green-600 border-green-700';
        return 'bg-muted border-border';
    };

    const getMomentumColor = (score: number) => {
        if (score >= 70) return 'text-green-600 bg-green-100 border-green-200';
        if (score >= 40) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
        return 'text-orange-600 bg-orange-100 border-orange-200';
    };

    const getMomentumLabel = (score: number) => {
        if (score >= 70) return '🔥 On Fire!';
        if (score >= 40) return '📈 Building Momentum';
        return '🌱 Getting Started';
    };

    return (
        <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:bg-card border border-blue-100 dark:border-slate-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-white dark:text-black">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Consistency Tracker
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Momentum Score */}
                <div className="bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-2xl p-6 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-white dark:text-black">Momentum Score</span>
                        <Badge className={`text-sm px-3 py-1 border font-semibold ${getMomentumColor(momentumScore)}`}>
                            {getMomentumLabel(momentumScore)}
                        </Badge>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-bold text-indigo-900 dark:text-foreground">{momentumScore}</span>
                        <span className="text-2xl text-indigo-600 dark:text-muted-foreground mb-1">/100</span>
                    </div>
                    <div className="mt-3 h-2 bg-blue-100 dark:bg-muted rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${momentumScore}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                        />
                    </div>
                </div>

                {/* Streak Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-card border border-blue-200 dark:border-border rounded-xl p-4 text-center shadow-sm">
                        <div className="text-3xl font-bold text-indigo-600 dark:text-primary mb-1">{avgStreak}</div>
                        <div className="text-xs text-indigo-600 dark:text-muted-foreground font-medium">Avg Streak</div>
                    </div>
                    <div className="bg-white dark:bg-card border border-blue-200 dark:border-border rounded-xl p-4 text-center shadow-sm">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{bestStreak}</div>
                        <div className="text-xs text-indigo-600 dark:text-muted-foreground font-medium">Best Streak</div>
                    </div>
                    <div className="bg-white dark:bg-card border border-blue-200 dark:border-border rounded-xl p-4 text-center shadow-sm">
                        <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">{totalStreak}</div>
                        <div className="text-xs text-indigo-600 dark:text-muted-foreground font-medium">Total Days</div>
                    </div>
                </div>

                {/* Activity Heatmap */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-4 h-4 text-indigo-600 dark:text-muted-foreground" />
                        <h4 className="text-sm font-semibold text-indigo-700 dark:text-foreground">Last 7 Weeks Activity</h4>
                    </div>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                        {Array.from({ length: 7 }).map((_, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-1">
                                {Array.from({ length: 7 }).map((_, dayIndex) => {
                                    const dataIndex = weekIndex * 7 + dayIndex;
                                    const dayData = heatmapData[dataIndex];

                                    return (
                                        <motion.div
                                            key={`${weekIndex}-${dayIndex}`}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: dataIndex * 0.01 }}
                                            className={cn(
                                                'w-3 h-3 rounded-sm border transition-all hover:scale-125',
                                                dayData ? getHeatColor(dayData.count) : 'bg-muted border-border'
                                            )}
                                            title={dayData ? `${dayData.date}: ${dayData.count} skills practiced` : ''}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-indigo-600 dark:text-muted-foreground font-medium">
                        <span>Less</span>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-sm bg-blue-100 dark:bg-muted border border-blue-200 dark:border-border" />
                            <div className="w-3 h-3 rounded-sm bg-green-200 border border-green-300" />
                            <div className="w-3 h-3 rounded-sm bg-green-400 border border-green-500" />
                            <div className="w-3 h-3 rounded-sm bg-green-600 border border-green-700" />
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}
