import { RiskLevel } from '@/models/AIReport';

export interface RiskFactors {
    attendancePercent: number;
    averageScore: number;
    engagementScore: number;
}

/**
 * Calculate risk level based on attendance and performance
 * HIGH: attendance < 60% OR avgScore < 50
 * MEDIUM: attendance 60-75% OR avgScore 50-65
 * LOW: otherwise
 */
export function calculateRiskLevel(factors: RiskFactors): RiskLevel {
    const { attendancePercent, averageScore } = factors;

    // High risk conditions
    if (attendancePercent < 60 || averageScore < 50) {
        return 'high';
    }

    // Medium risk conditions
    if (
        (attendancePercent >= 60 && attendancePercent <= 75) ||
        (averageScore >= 50 && averageScore <= 65)
    ) {
        return 'medium';
    }

    // Low risk (good standing)
    return 'low';
}

/**
 * Alias for calculateRiskLevel (backward compatibility)
 */
export function predictRiskLevel(attendancePercent: number, averageScore: number, engagementScore: number): RiskLevel {
    return calculateRiskLevel({ attendancePercent, averageScore, engagementScore });
}

/**
 * Get risk level badge color
 */
export function getRiskLevelColor(riskLevel: RiskLevel): string {
    switch (riskLevel) {
        case 'high':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low':
            return 'bg-green-100 text-green-800 border-green-200';
    }
}

/**
 * Get risk level display text
 */
export function getRiskLevelText(riskLevel: RiskLevel): string {
    switch (riskLevel) {
        case 'high':
            return 'High Risk';
        case 'medium':
            return 'Medium Risk';
        case 'low':
            return 'Low Risk';
    }
}

/**
 * Get risk recommendations
 */
export function getRiskRecommendations(riskLevel: RiskLevel, factors: RiskFactors): string[] {
    const recommendations: string[] = [];

    if (factors.attendancePercent < 75) {
        recommendations.push('Improve attendance to maintain consistent learning');
    }

    if (factors.averageScore < 65) {
        recommendations.push('Focus on strengthening fundamental concepts');
    }

    if (factors.engagementScore < 60) {
        recommendations.push('Increase class participation and engagement');
    }

    if (riskLevel === 'high') {
        recommendations.push('Consider one-on-one tutoring sessions');
        recommendations.push('Set up weekly progress check-ins with teacher');
    }

    if (riskLevel === 'medium') {
        recommendations.push('Allocate more time for self-study');
        recommendations.push('Join peer study groups');
    }

    return recommendations;
}
