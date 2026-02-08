/**
 * Grade calculation utilities for marks management
 */

export interface GradeResult {
    grade: string;
    percentage: number;
    points: number;
    status: 'pass' | 'fail';
}

export const GRADE_THRESHOLDS = [
    { grade: 'A+', min: 95, max: 100, points: 10 },
    { grade: 'A', min: 90, max: 94, points: 9 },
    { grade: 'B+', min: 85, max: 89, points: 8 },
    { grade: 'B', min: 80, max: 84, points: 7 },
    { grade: 'C+', min: 75, max: 79, points: 6 },
    { grade: 'C', min: 70, max: 74, points: 5 },
    { grade: 'D', min: 60, max: 69, points: 4 },
    { grade: 'F', min: 0, max: 59, points: 0 },
];

/**
 * Calculate letter grade based on percentage
 */
export function calculateGrade(percentage: number): GradeResult {
    const threshold = GRADE_THRESHOLDS.find(
        (t) => percentage >= t.min && percentage <= t.max
    );

    if (!threshold) {
        return {
            grade: 'N/A',
            percentage: 0,
            points: 0,
            status: 'fail',
        };
    }

    return {
        grade: threshold.grade,
        percentage: Math.round(percentage * 10) / 10,
        points: threshold.points,
        status: percentage >= 60 ? 'pass' : 'fail',
    };
}

/**
 * Get color for grade badge
 */
export function getGradeColor(grade: string): string {
    switch (grade) {
        case 'A+':
        case 'A':
            return 'bg-green-100 text-green-800 border-green-300';
        case 'B+':
        case 'B':
            return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'C+':
        case 'C':
            return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'D':
            return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'F':
            return 'bg-red-100 text-red-800 border-red-300';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-300';
    }
}

/**
 * Calculate class statistics for a set of marks
 */
export interface ClassStats {
    average: number;
    median: number;
    highest: number;
    lowest: number;
    passCount: number;
    failCount: number;
    totalStudents: number;
    gradeDistribution: { [key: string]: number };
}

export function calculateClassStats(percentages: number[]): ClassStats {
    if (percentages.length === 0) {
        return {
            average: 0,
            median: 0,
            highest: 0,
            lowest: 0,
            passCount: 0,
            failCount: 0,
            totalStudents: 0,
            gradeDistribution: {},
        };
    }

    const sorted = [...percentages].sort((a, b) => a - b);
    const sum = percentages.reduce((acc, val) => acc + val, 0);
    const average = sum / percentages.length;
    const median = sorted[Math.floor(sorted.length / 2)];

    const gradeDistribution: { [key: string]: number } = {};
    GRADE_THRESHOLDS.forEach((t) => {
        gradeDistribution[t.grade] = 0;
    });

    let passCount = 0;
    let failCount = 0;

    percentages.forEach((p) => {
        const result = calculateGrade(p);
        gradeDistribution[result.grade]++;
        if (result.status === 'pass') {
            passCount++;
        } else {
            failCount++;
        }
    });

    return {
        average: Math.round(average * 10) / 10,
        median: Math.round(median * 10) / 10,
        highest: Math.max(...percentages),
        lowest: Math.min(...percentages),
        passCount,
        failCount,
        totalStudents: percentages.length,
        gradeDistribution,
    };
}
