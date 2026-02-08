import { RiskLevel } from '@/models/AIReport';

export interface StudentData {
    name: string;
    attendancePercent: number;
    averageScore: number;
    weakSkills: string[];
    riskLevel: RiskLevel;
}

export interface AIGeneratedReport {
    reportText: string;
    recommendedPlan: string[];
    riskLevel: RiskLevel;
}

/**
 * Generate AI report using mock AI (template-based)
 */
export function generateMockAIReport(studentData: StudentData): AIGeneratedReport {
    const { name, attendancePercent, averageScore, weakSkills, riskLevel } = studentData;

    // Generate personalized feedback
    let reportText = `**Personalized Learning Analysis for ${name}**\n\n`;

    // Attendance analysis
    if (attendancePercent >= 90) {
        reportText += `✅ **Excellent Attendance**: Your attendance of ${attendancePercent}% shows strong commitment to learning.\n\n`;
    } else if (attendancePercent >= 75) {
        reportText += `⚠️ **Good Attendance**: Your ${attendancePercent}% attendance is solid, but there's room for improvement.\n\n`;
    } else {
        reportText += `🚨 **Attendance Concern**: Your ${attendancePercent}% attendance needs immediate attention. Consistent attendance is crucial for success.\n\n`;
    }

    // Performance analysis
    if (averageScore >= 80) {
        reportText += `🌟 **Strong Performance**: Your average score of ${averageScore}% demonstrates excellent understanding.\n\n`;
    } else if (averageScore >= 65) {
        reportText += `📊 **Moderate Performance**: Your ${averageScore}% average shows potential. Focus on consistency.\n\n`;
    } else {
        reportText += `📉 **Performance Needs Improvement**: Your ${averageScore}% average indicates you need additional support.\n\n`;
    }

    // Skill gap analysis
    if (weakSkills.length > 0) {
        reportText += `**Areas Requiring Immediate Attention**:\n`;
        weakSkills.forEach((skill) => {
            reportText += `- ${skill}\n`;
        });
        reportText += `\n`;
    } else {
        reportText += `✨ **All Skills Strong**: You're performing well across all skill areas!\n\n`;
    }

    reportText += `**Academic Focus**: Focus on strengthening your core foundation through systematic problem-solving, project work, and professional development.\n\n`;

    // Generate 7-day study plan
    const recommendedPlan = generate7DayPlan(studentData);

    return {
        reportText,
        recommendedPlan,
        riskLevel,
    };
}

/**
 * Generate a 7-day study plan based on student data
 */
function generate7DayPlan(studentData: StudentData): string[] {
    const { weakSkills, riskLevel } = studentData;
    const plan: string[] = [];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    if (weakSkills.length === 0) {
        // Student is doing well - maintenance plan
        plan.push('Day 1 (Monday): Review recent topics and solve 5 practice problems');
        plan.push('Day 2 (Tuesday): Work on a mini-project using current skills');
        plan.push('Day 3 (Wednesday): Peer teaching session - explain concepts to classmates');
        plan.push('Day 4 (Thursday): Explore advanced topics in your strongest area');
        plan.push('Day 5 (Friday): Weekly quiz revision and self-assessment');
        plan.push('Day 6 (Saturday): Personal project development');
        plan.push('Day 7 (Sunday): Rest and light reading of industry trends');
    } else {
        // Student has weak skills - targeted improvement plan
        plan.push(`Day 1 (Monday): Focus on ${weakSkills[0] || 'foundational concepts'} - watch tutorials and take notes`);
        plan.push(`Day 2 (Tuesday): Practice problems on ${weakSkills[0] || 'weak areas'} - solve at least 5 exercises`);
        plan.push(`Day 3 (Wednesday): ${weakSkills[1] || 'Second priority skill'} - complete online module or practical exercise`);
        plan.push(`Day 4 (Thursday): Hands-on practice - build a small project or case study`);
        plan.push(`Day 5 (Friday): Review and consolidate - create summary notes and mindset maps`);
        plan.push(`Day 6 (Saturday): Mock test or peer review on weak areas - identify remaining gaps`);
        plan.push(`Day 7 (Sunday): Light revision, professional development readout, and plan next week's focus`);
    }

    // Add extra recommendations based on risk level
    if (riskLevel === 'high') {
        plan.push('\n⚠️ HIGH PRIORITY: Schedule daily study sessions of at least 2 hours');
        plan.push('⚠️ Seek help from teachers or mentors immediately');
    } else if (riskLevel === 'medium') {
        plan.push('\n📌 Maintain consistent daily study routine of 1-1.5 hours');
    }

    return plan;
}

/**
 * Optional: OpenAI integration (if API key is provided)
 * This is a placeholder for real OpenAI integration
 */
export async function generateOpenAIReport(studentData: StudentData): Promise<AIGeneratedReport> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        // Fallback to mock AI
        return generateMockAIReport(studentData);
    }

    try {
        // This would be the actual OpenAI API call
        // For now, we'll use the mock generator
        console.log('OpenAI API key detected, but using mock generator for now');
        return generateMockAIReport(studentData);
    } catch (error) {
        console.error('OpenAI API error:', error);
        // Fallback to mock AI
        return generateMockAIReport(studentData);
    }
}
