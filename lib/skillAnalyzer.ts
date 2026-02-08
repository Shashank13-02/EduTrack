export type SkillLevel = 'weak' | 'average' | 'strong';

export interface SkillTemplate {
    name: string;
    category: string;
}

export const ALL_SKILLS: SkillTemplate[] = [
    { name: 'Data Structures & Algorithms', category: 'Technical Skills' },
    { name: 'Database Management (DBMS)', category: 'Technical Skills' },
    { name: 'Object-Oriented Programming (OOP)', category: 'Technical Skills' },
    { name: 'Operating Systems (OS)', category: 'Technical Skills' },
    { name: 'Computer Networks (CN)', category: 'Technical Skills' },
    { name: 'Web Development', category: 'Technical Skills' },
    { name: 'Problem Solving', category: 'Technical Skills' },
    { name: 'Communication Skills', category: 'Soft Skills' },
    { name: 'Presentation Skills', category: 'Soft Skills' },
    { name: 'Excel & Tools Proficiency', category: 'Tools' },
    { name: 'Domain Knowledge', category: 'Business' },
    { name: 'Resume Readiness', category: 'Professional' },
    { name: 'Basic Programming', category: 'Technical Skills' },
];

export function getSkills(): SkillTemplate[] {
    return ALL_SKILLS;
}

/**
 * Calculate skill score based on performance metrics
 * Formula: (quiz * 0.4) + (assignment * 0.3) + (attendance * 0.1) + (engagement * 0.2)
 */
export function calculateSkillScore(
    quizScore: number,
    assignmentScore: number,
    attendancePercent: number,
    engagementScore: number
): number {
    const score =
        quizScore * 0.4 +
        assignmentScore * 0.3 +
        attendancePercent * 0.1 +
        engagementScore * 0.2;

    return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Classify skill level based on score
 * 0-40: weak
 * 41-70: average
 * 71-100: strong
 */
export function classifySkillLevel(score: number): SkillLevel {
    if (score <= 40) return 'weak';
    if (score <= 70) return 'average';
    return 'strong';
}

/**
 * Get skill level color
 */
export function getSkillLevelColor(level: SkillLevel): string {
    switch (level) {
        case 'weak':
            return 'text-red-600 bg-red-50';
        case 'average':
            return 'text-yellow-600 bg-yellow-50';
        case 'strong':
            return 'text-green-600 bg-green-50';
    }
}

/**
 * Identify weak skills (score <= 40)
 */
export function identifyWeakSkills(skillScores: { skillName: string; score: number; level: SkillLevel }[]): string[] {
    return skillScores
        .filter((skill) => skill.level === 'weak')
        .map((skill) => skill.skillName);
}
