
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Load env vars

import mongoose from 'mongoose';
import { connectDB } from '../lib/db';
import User from '../models/User';
import Attendance from '../models/Attendance';
import Performance from '../models/Performance';
import { calculateRiskLevel } from '../lib/riskPredictor';
import { generateMockAIReport } from '../lib/aiGenerator';
import { seedData } from '../lib/seed-data';

async function verifyAnalysis() {
    try {
        console.log("🔍 Connecting to Database...");
        await connectDB();

        // Ensure data exists
        if (await User.countDocuments() === 0) {
            console.log("⚠️ No data found. Seeding...");
            await seedData();
        }


        console.log(`\n🏫 Generatng Class Performance Report...`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const students = await User.find({ role: 'STUDENT' });
        console.log(`Found ${students.length} students.`);

        const classMetrics = {
            totalStudents: students.length,
            highRiskCount: 0,
            averageClassScore: 0,
            averageAttendance: 0
        };

        const highRiskStudents = [];

        for (const student of students) {
            // 1. Attendance
            const attendanceRecords = await Attendance.find({ studentId: student._id });
            const totalDays = attendanceRecords.length;
            const presentDays = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
            const attendancePercent = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

            // 2. Performance
            const performanceRecords = await Performance.find({ studentId: student._id });

            let avgScore = 0;
            if (performanceRecords.length > 0) {
                const subjectScores = performanceRecords.map(p => {
                    // Simple weighted sum based on max values: 10 + 10 + 70 + 10 = 100
                    const mid1 = p.midSem1 || 0;
                    const mid2 = p.midSem2 || 0;
                    const end = p.endSem || 0;
                    const assign = p.assignment || 0;
                    return mid1 + mid2 + end + assign;
                });
                avgScore = subjectScores.reduce((a, b) => a + b, 0) / subjectScores.length;
            }

            const avgEngagement = performanceRecords.length > 0
                ? performanceRecords.reduce((acc, curr) => acc + curr.engagementScore, 0) / performanceRecords.length
                : 0;

            // 3. Risk
            const riskLevel = calculateRiskLevel({
                attendancePercent,
                averageScore: avgScore,
                engagementScore: avgEngagement
            });

            // Aggregate
            classMetrics.averageClassScore += avgScore;
            classMetrics.averageAttendance += attendancePercent;

            if (riskLevel === 'high') {
                classMetrics.highRiskCount++;
                highRiskStudents.push({
                    name: student.name,
                    email: student.email,
                    attendance: attendancePercent.toFixed(1),
                    score: avgScore.toFixed(1),
                    reason: 'Multiple factors below threshold'
                });
            }
        }

        // Finalize Averages
        if (classMetrics.totalStudents > 0) {
            classMetrics.averageClassScore /= classMetrics.totalStudents;
            classMetrics.averageAttendance /= classMetrics.totalStudents;
        }

        // Output Report
        console.log(`\n📊 CLASS SUMMARY`);
        console.log(`   Average Score:      ${classMetrics.averageClassScore.toFixed(1)}%`);
        console.log(`   Average Attendance: ${classMetrics.averageAttendance.toFixed(1)}%`);
        console.log(`   Students At Risk:   ${classMetrics.highRiskCount} / ${classMetrics.totalStudents}`);

        if (highRiskStudents.length > 0) {
            console.log(`\n🚨 STUDENTS REQUIRING IMMEDIATE ATTENTION`);
            highRiskStudents.forEach(s => {
                console.log(`   - ${s.name} (${s.email})`);
                console.log(`     Attendance: ${s.attendance}% | Score: ${s.score}%`);
            });

            // Generate AI Insight for the first high-risk student
            const firstRisk = highRiskStudents[0];
            console.log(`\n🤖 AI Recommended Intervention for ${firstRisk.name}:`);
            const mockData = {
                name: firstRisk.name,
                attendancePercent: parseFloat(firstRisk.attendance),
                averageScore: parseFloat(firstRisk.score),
                weakSkills: ['Core Concepts', 'Discipline'],
                riskLevel: 'high' as any
            };
            const insight = generateMockAIReport(mockData);
            console.log(`   "${insight.reportText.split('\n')[0].replace(/\*\*/g, '')}..."`);
            console.log(`   Plan: ${insight.recommendedPlan[0]}`);
            console.log(`   Plan: ${insight.recommendedPlan[7] || insight.recommendedPlan[insight.recommendedPlan.length - 1]}`);
        } else {
            console.log(`\n✅ No students strictly classified as 'HIGH' risk.`);
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyAnalysis();
