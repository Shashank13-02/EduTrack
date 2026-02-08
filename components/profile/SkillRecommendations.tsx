'use client';

import { motion } from 'framer-motion';
import { Sparkles, Plus, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getCategoryLabel } from '@/lib/skillProgress';

interface SkillRecommendation {
    name: string;
    category: string;
    reason: string;
}

interface SkillRecommendationsProps {
    recommendations: SkillRecommendation[];
    onAddSkill?: (skillName: string, category: string) => void;
}

export function SkillRecommendations({ recommendations, onAddSkill }: SkillRecommendationsProps) {
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'technical': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'language': return 'bg-green-100 text-green-700 border-green-200';
            case 'soft': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'project': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (recommendations.length === 0) {
        return (
            <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:bg-card border border-blue-100 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-indigo-700 dark:text-slate-100">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        Recommended Skills
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-indigo-600 dark:text-muted-foreground">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 text-indigo-300 dark:text-muted-foreground/50" />
                        <p className="text-sm font-medium">Add career goals to get personalized skill recommendations!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/10 dark:to-orange-950/10 border border-yellow-200 dark:border-yellow-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-indigo-700 dark:text-slate-100">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                    Recommended Skills
                </CardTitle>
                <p className="text-sm text-white dark:text-muted-foreground mt-1">
                    AI-powered suggestions based on your goals and performance
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                        <motion.div
                            key={rec.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white dark:bg-card border border-blue-200 dark:border-border rounded-xl p-4 hover:shadow-md transition-all duration-300 hover:border-indigo-400 dark:hover:border-primary/50 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-primary" />
                                        <h4 className="font-semibold text-indigo-900 dark:text-foreground">{rec.name}</h4>
                                        <Badge className={`text-xs px-2 py-0.5 border ${getCategoryColor(rec.category)}`}>
                                            {getCategoryLabel(rec.category)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-indigo-700 dark:text-muted-foreground">{rec.reason}</p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="shrink-0 rounded-lg hover:bg-primary hover:text-primary-foreground hover:border-primary"
                                    onClick={() => onAddSkill?.(rec.name, rec.category)}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
