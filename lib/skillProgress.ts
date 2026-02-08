/**
 * Skill Progression Utilities
 * Handles XP calculation, level determination, and streak tracking
 */

export interface SkillData {
    name: string;
    category: 'technical' | 'language' | 'soft' | 'project' | 'other';
    level: number;
    xp: number;
    addedDate: Date;
    lastPracticed: Date;
    streak: number;
    bestStreak: number;
    milestones: {
        date: Date;
        description: string;
        xpGained: number;
    }[];
}

// XP thresholds for each level
const XP_THRESHOLDS = {
    1: 0,      // Beginner
    2: 100,    // Learning
    3: 300,    // Intermediate
    4: 600,    // Advanced
    5: 1000,   // Expert
};

/**
 * Calculate skill level based on XP
 */
export function calculateSkillLevel(xp: number): number {
    if (xp >= XP_THRESHOLDS[5]) return 5;
    if (xp >= XP_THRESHOLDS[4]) return 4;
    if (xp >= XP_THRESHOLDS[3]) return 3;
    if (xp >= XP_THRESHOLDS[2]) return 2;
    return 1;
}

/**
 * Get XP needed for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
    if (currentLevel >= 5) return 0; // Max level
    return XP_THRESHOLDS[(currentLevel + 1) as keyof typeof XP_THRESHOLDS];
}

/**
 * Get XP progress percentage to next level
 */
export function getXPProgress(xp: number, level: number): number {
    if (level >= 5) return 100; // Max level

    const currentThreshold = XP_THRESHOLDS[level as keyof typeof XP_THRESHOLDS];
    const nextThreshold = XP_THRESHOLDS[(level + 1) as keyof typeof XP_THRESHOLDS];
    const xpInCurrentLevel = xp - currentThreshold;
    const xpNeededForLevel = nextThreshold - currentThreshold;

    return Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100));
}

/**
 * Calculate XP from performance records
 * Awards XP based on academic performance
 */
export function calculateXPFromPerformance(performanceRecords: any[]): number {
    let totalXP = 0;

    for (const record of performanceRecords) {
        // Award XP for each assessment component
        if (record.midSem1) totalXP += Math.round(record.midSem1 / 5); // Max 20 XP
        if (record.midSem2) totalXP += Math.round(record.midSem2 / 5);
        if (record.assignment) totalXP += Math.round(record.assignment / 10); // Max 10 XP
        if (record.endSem) totalXP += Math.round(record.endSem / 4); // Max 25 XP
    }

    return totalXP;
}

/**
 * Calculate learning streak
 * Returns current and best streak based on practice dates
 */
export function calculateStreak(lastPracticed: Date): { current: number; shouldReset: boolean } {
    const now = new Date();
    const daysSinceLastPractice = Math.floor(
        (now.getTime() - new Date(lastPracticed).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Streak breaks after 2 days of inactivity
    if (daysSinceLastPractice > 2) {
        return { current: 0, shouldReset: true };
    }

    return { current: 1, shouldReset: false };
}

/**
 * Generate skill recommendations based on career goals and performance
 */
export function generateSkillRecommendations(
    careerGoals: string[],
    currentSkills: string[],
    department: string
): { name: string; category: string; reason: string }[] {
    const recommendations: { name: string; category: string; reason: string }[] = [];

    // Technical skills based on department
    const departmentSkills: Record<string, string[]> = {
        'Computer Science & Engineering': ['Python', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'AI/ML'],
        'Information Technology': ['Cloud Computing', 'DevOps', 'Cybersecurity', 'Data Analytics'],
        'Electrical': ['Circuit Design', 'PCB Design', 'Power Systems', 'Control Systems'],
        'Mechanical': ['CAD/CAM', 'SolidWorks', 'Finite Element Analysis', '3D Printing'],
        'Civil': ['AutoCAD', 'Structural Analysis', 'Project Management', 'BIM'],
    };

    // Soft skills universally valuable
    const softSkills = [
        'Communication',
        'Leadership',
        'Problem Solving',
        'Team Collaboration',
        'Time Management',
        'Critical Thinking',
    ];

    // Recommend departmental skills not already added
    const deptSkills = departmentSkills[department] || [];
    for (const skill of deptSkills.slice(0, 3)) {
        if (!currentSkills.includes(skill)) {
            recommendations.push({
                name: skill,
                category: 'technical',
                reason: `Relevant for ${department}`,
            });
        }
    }

    // Recommend soft skills
    for (const skill of softSkills.slice(0, 2)) {
        if (!currentSkills.includes(skill)) {
            recommendations.push({
                name: skill,
                category: 'soft',
                reason: 'Essential for career growth',
            });
        }
    }

    // Career goal-based recommendations
    if (careerGoals.some(goal => goal.toLowerCase().includes('software'))) {
        if (!currentSkills.includes('Git')) {
            recommendations.push({
                name: 'Git',
                category: 'technical',
                reason: 'Essential for software development',
            });
        }
    }

    return recommendations.slice(0, 5); // Return top 5
}

/**
 * Get skill growth trend
 * Returns trend indicator based on recent XP gains
 */
export function getSkillTrend(milestones: any[]): 'up' | 'stable' | 'down' {
    if (milestones.length < 2) return 'stable';

    const recentMilestones = milestones.slice(-5); // Last 5 milestones
    const totalXP = recentMilestones.reduce((sum, m) => sum + m.xpGained, 0);
    const avgXP = totalXP / recentMilestones.length;

    const lastMilestone = recentMilestones[recentMilestones.length - 1];

    if (lastMilestone.xpGained > avgXP * 1.2) return 'up';
    if (lastMilestone.xpGained < avgXP * 0.8) return 'down';
    return 'stable';
}

/**
 * Get level color for UI display
 */
export function getLevelColor(level: number): string {
    switch (level) {
        case 1: return 'text-gray-600 bg-gray-100 border-gray-200';
        case 2: return 'text-blue-600 bg-blue-100 border-blue-200';
        case 3: return 'text-green-600 bg-green-100 border-green-200';
        case 4: return 'text-orange-600 bg-orange-100 border-orange-200';
        case 5: return 'text-purple-600 bg-purple-100 border-purple-200';
        default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
}

/**
 * Get level label
 */
export function getLevelLabel(level: number): string {
    switch (level) {
        case 1: return 'Beginner';
        case 2: return 'Learning';
        case 3: return 'Intermediate';
        case 4: return 'Advanced';
        case 5: return 'Expert';
        default: return 'Unknown';
    }
}

/**
 * Get category label
 */
export function getCategoryLabel(category: string): string {
    switch (category.toLowerCase()) {
        case 'technical': return 'Technical Skills';
        case 'soft': return 'Soft Skills';
        case 'language': return 'Languages';
        case 'project': return 'Projects';
        default: return category.charAt(0).toUpperCase() + category.slice(1);
    }
}

/**
 * Calculate momentum score (0-100)
 * Based on recent activity and XP gains
 */
export function calculateMomentumScore(skills: SkillData[]): number {
    let score = 0;
    const recentDays = 7;

    for (const skill of skills) {
        const daysSinceLastPractice = Math.floor(
            (Date.now() - new Date(skill.lastPracticed).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Award points for recent activity
        if (daysSinceLastPractice <= recentDays) {
            score += 10;
        }

        // Award points for active streaks
        score += skill.streak * 2;

        // Award points for recent milestones
        const recentMilestones = skill.milestones.filter(m => {
            const daysAgo = (Date.now() - new Date(m.date).getTime()) / (1000 * 60 * 60 * 24);
            return daysAgo <= recentDays;
        });
        score += recentMilestones.length * 5;
    }

    return Math.min(100, score);
}

/**
 * XP gain per daily activity
 */
export const XP_PER_ACTIVITY = 20;

/**
 * Calculate required XP for a specific level
 */
export function calculateRequiredXP(level: number): number {
    if (level >= 5) return XP_THRESHOLDS[5];
    return XP_THRESHOLDS[(level + 1) as keyof typeof XP_THRESHOLDS];
}

/**
 * Calculate level from total XP
 */
export function calculateLevel(xp: number): number {
    return calculateSkillLevel(xp);
}

/**
 * Update streak based on activity dates
 * Returns new streak value
 */
export function updateStreakLogic(
    lastActivityDate: Date | null,
    newActivityDate: Date,
    currentStreak: number
): { newStreak: number; streakContinued: boolean } {
    if (!lastActivityDate) {
        return { newStreak: 1, streakContinued: false };
    }

    const lastDate = new Date(lastActivityDate);
    const newDate = new Date(newActivityDate);

    // Normalize to start of day for accurate comparison
    lastDate.setHours(0, 0, 0, 0);
    newDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((newDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
        // Same day - streak doesn't change
        return { newStreak: currentStreak, streakContinued: false };
    } else if (daysDiff === 1) {
        // Consecutive day - increment streak
        return { newStreak: currentStreak + 1, streakContinued: true };
    } else {
        // Gap in streak - reset to 1
        return { newStreak: 1, streakContinued: false };
    }
}

/**
 * Check if activity already exists for today
 */
export function checkDailyActivityExists(
    activities: { date: Date }[],
    checkDate: Date = new Date()
): boolean {
    const today = new Date(checkDate);
    today.setHours(0, 0, 0, 0);

    return activities.some(activity => {
        const activityDate = new Date(activity.date);
        activityDate.setHours(0, 0, 0, 0);
        return activityDate.getTime() === today.getTime();
    });
}

/**
 * Calculate activity statistics
 */
export function getActivityStats(activities: { timeSpent: number; xpGained: number; date: Date }[]): {
    totalActivities: number;
    totalTimeSpent: number;
    averageTimePerActivity: number;
    averageXpPerDay: number;
    activeDays: number;
} {
    if (activities.length === 0) {
        return {
            totalActivities: 0,
            totalTimeSpent: 0,
            averageTimePerActivity: 0,
            averageXpPerDay: 0,
            activeDays: 0,
        };
    }

    const totalActivities = activities.length;
    const totalTimeSpent = activities.reduce((sum, a) => sum + a.timeSpent, 0);
    const totalXP = activities.reduce((sum, a) => sum + a.xpGained, 0);

    // Count unique days
    const uniqueDays = new Set(
        activities.map(a => new Date(a.date).toISOString().split('T')[0])
    );
    const activeDays = uniqueDays.size;

    return {
        totalActivities,
        totalTimeSpent,
        averageTimePerActivity: totalActivities > 0 ? Math.round(totalTimeSpent / totalActivities) : 0,
        averageXpPerDay: activeDays > 0 ? Math.round(totalXP / activeDays) : 0,
        activeDays,
    };
}

/**
 * Format time spent in human-readable format
 */
export function formatTimeSpent(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

/**
 * Get XP needed for next level
 */
export function getXPNeededForNextLevel(currentXP: number, currentLevel: number): number {
    if (currentLevel >= 5) return 0;
    const nextLevelThreshold = XP_THRESHOLDS[(currentLevel + 1) as keyof typeof XP_THRESHOLDS];
    return nextLevelThreshold - currentXP;
}
