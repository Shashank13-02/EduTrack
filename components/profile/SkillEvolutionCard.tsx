'use client';

import { motion } from 'framer-motion';
import { Award, TrendingUp, TrendingDown, Minus, ChevronRight, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { getLevelColor, getLevelLabel, getXPProgress, getCategoryLabel } from '@/lib/skillProgress';
import { useRouter } from 'next/navigation';

interface Skill {
    _id?: string;
    name: string;
    category: string;
    level: number;
    xp: number;
    streak: number;
    lastPracticed: Date;
}

interface SkillEvolutionCardProps {
    skills: Skill[];
    onSkillClick?: (skill: Skill) => void;
}

export function SkillEvolutionCard({ skills, onSkillClick }: SkillEvolutionCardProps) {
    const router = useRouter();

    const handleSkillClick = (skill: Skill) => {
        if (onSkillClick) {
            onSkillClick(skill);
        } else if (skill._id) {
            // Navigate to skill detail page
            router.push(`/student/profile/consistency/${skill._id}`);
        }
    };

    const getTrendIcon = (trend: 'up' | 'stable' | 'down') => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
            default: return <Minus className="w-4 h-4 text-gray-400" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'technical': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'language': return 'bg-green-100 text-green-700 border-green-200';
            case 'soft': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'project': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (skills.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/50 rounded-2xl border-2 border-dashed border-border">
                <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Skills Tracked Yet</h3>
                <p className="text-sm text-muted-foreground">
                    Start your journey by adding your first skill below!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {skills.map((skill, index) => {
                const progress = getXPProgress(skill.xp, skill.level);
                const daysSinceLastPractice = Math.floor(
                    (Date.now() - new Date(skill.lastPracticed).getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                    <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleSkillClick(skill)}
                        className="group bg-card border border-border rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                                        {skill.name}
                                    </h4>
                                    <Badge className={cn('text-xs px-2 py-0.5 border', getCategoryColor(skill.category))}>
                                        {getCategoryLabel(skill.category)}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Zap className="w-3.5 h-3.5 text-yellow-500" />
                                        <span>{skill.streak} day streak</span>
                                    </div>
                                    <span className="text-xs">
                                        {daysSinceLastPractice === 0
                                            ? 'Practiced today'
                                            : daysSinceLastPractice === 1
                                                ? 'Practiced yesterday'
                                                : `${daysSinceLastPractice} days ago`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Badge className={cn('text-sm px-3 py-1 border font-semibold', getLevelColor(skill.level))}>
                                    {getLevelLabel(skill.level)}
                                </Badge>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>

                        {/* XP Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-muted-foreground font-medium">Level {skill.level}</span>
                                <span className="text-muted-foreground">
                                    {skill.xp} XP • {progress}% to next level
                                </span>
                            </div>
                            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 }}
                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full relative"
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
