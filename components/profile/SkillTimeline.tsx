'use client';

import { motion } from 'framer-motion';
import { Award, TrendingUp, Star, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatReadableDate } from '@/lib/utils';

interface TimelineEvent {
    date: Date;
    description: string;
    type: 'milestone' | 'level_up' | 'streak' | 'achievement';
    xpGained?: number;
    skillName?: string;
}

interface SkillTimelineProps {
    skills: any[];
}

export function SkillTimeline({ skills }: SkillTimelineProps) {
    // Generate timeline events from skills
    const generateTimeline = (): TimelineEvent[] => {
        const events: TimelineEvent[] = [];

        skills.forEach(skill => {
            // Add skill creation event
            events.push({
                date: new Date(skill.addedDate),
                description: `Started tracking ${skill.name}`,
                type: 'achievement',
                skillName: skill.name,
            });

            // Add milestone events
            skill.milestones?.forEach((milestone: any) => {
                events.push({
                    date: new Date(milestone.date),
                    description: milestone.description,
                    type: 'milestone',
                    xpGained: milestone.xpGained,
                    skillName: skill.name,
                });
            });

            // Add level-up events (inferred from current level)
            if (skill.level > 1) {
                for (let level = 2; level <= skill.level; level++) {
                    events.push({
                        date: new Date(skill.addedDate), // Approximate date
                        description: `Reached Level ${level} in ${skill.name}`,
                        type: 'level_up',
                        skillName: skill.name,
                    });
                }
            }

            // Add streak milestones
            if (skill.bestStreak >= 7) {
                events.push({
                    date: new Date(skill.lastPracticed),
                    description: `${skill.bestStreak}-day streak in ${skill.name}`,
                    type: 'streak',
                    skillName: skill.name,
                });
            }
        });

        // Sort by date descending
        return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
    };

    const timeline = generateTimeline();

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'level_up': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'milestone': return <Award className="w-4 h-4 text-purple-600" />;
            case 'streak': return <Zap className="w-4 h-4 text-orange-600" />;
            case 'achievement': return <Star className="w-4 h-4 text-blue-600" />;
            default: return <Award className="w-4 h-4" />;
        }
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'level_up': return 'border-green-500 bg-green-50 dark:bg-green-950/20';
            case 'milestone': return 'border-purple-500 bg-purple-50 dark:bg-purple-950/20';
            case 'streak': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
            case 'achievement': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
            default: return 'border-gray-500 bg-gray-50 dark:bg-gray-950/20';
        }
    };

    if (timeline.length === 0) {
        return (
            <Card className="rounded-3xl border-none shadow-sm bg-card">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
                        <Award className="w-5 h-5 text-purple-600" />
                        Skill Journey
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">Your skill milestones will appear here as you progress!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-3xl border-none shadow-sm bg-card">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
                    <Award className="w-5 h-5 text-purple-600" />
                    Skill Journey
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-transparent" />

                    <div className="space-y-6">
                        {timeline.map((event, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative pl-12"
                            >
                                {/* Timeline dot */}
                                <div className={`absolute left-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${getEventColor(event.type)}`}>
                                    {getEventIcon(event.type)}
                                </div>

                                <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-2">
                                        <p className="font-medium text-foreground">{event.description}</p>
                                        {event.xpGained && (
                                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                                                +{event.xpGained} XP
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatReadableDate(event.date)}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
