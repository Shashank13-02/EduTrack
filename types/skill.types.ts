// Skill-related types for consistency tracking

export interface SkillActivity {
    date: Date;
    timeSpent: number; // minutes
    notes: string;
    xpGained: number;
}

export interface SkillMilestone {
    date: Date;
    description?: string;
    xpGained: number;
}

export interface Skill {
    _id?: string;
    name: string;
    category: 'technical' | 'language' | 'soft' | 'project' | 'other';
    level: number;
    xp: number;
    addedDate: Date;
    lastPracticed: Date;
    streak: number;
    bestStreak: number;
    milestones: SkillMilestone[];
    activities: SkillActivity[];
}

export interface ActivityStats {
    totalActivities: number;
    totalTimeSpent: number; // minutes
    averageTimePerActivity: number;
    averageXpPerDay: number;
    activeDays: number;
}

export interface SkillProgressData {
    skill: Skill;
    stats: ActivityStats;
    nextLevelXP: number;
    progressPercent: number;
}
