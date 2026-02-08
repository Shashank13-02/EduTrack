
import mongoose from 'mongoose';
import User from '../models/User';
import Attendance from '../models/Attendance';
import Performance from '../models/Performance';
import SkillScore from '../models/SkillScore';
import { hashPassword } from '../lib/password-utils';
import { getSkills, calculateSkillScore, classifySkillLevel } from '../lib/skillAnalyzer';
import { getPastDates } from '../lib/utils';
import { connectDB } from '../lib/db';

export async function seedData() {
    try {
        await connectDB();

        // check if data exists
        if (await User.countDocuments() > 0) {
            console.log('🌱 Data already exists, skipping seed.');
            return;
        }

        console.log('🌱 Starting database seeding...');

        // Clear existing data (just in case)
        await User.deleteMany({});
        await Attendance.deleteMany({});
        await Performance.deleteMany({});
        await SkillScore.deleteMany({});

        // Create Teacher
        console.log('Creating teacher account...');
        const teacher = await User.create({
            name: 'Dr. Aarav Patel',
            email: 'teacher@edu.com',
            passwordHash: await hashPassword('teacher123'),
            role: 'TEACHER',
            department: 'Computer Science & Engineering',
            yearsTaught: [1, 2, 3],
            subject: 'Computer Science', // Required for teachers
        });
        console.log('✅ Teacher created: teacher@edu.com / teacher123');

        // Create Students
        console.log('Creating student accounts...');
        const students = await User.create([
            {
                name: 'Vihaan Rao',
                email: 'core1@student.com',
                passwordHash: await hashPassword('student123'),
                role: 'STUDENT',
                department: 'Computer Science & Engineering',
                year: 3,
            },
            {
                name: 'Priya Sharma',
                email: 'core2@student.com',
                passwordHash: await hashPassword('student123'),
                role: 'STUDENT',
                department: 'Electronics and Communication',
                year: 2,
            },
            {
                name: 'Arjun Singh',
                email: 'noncore@student.com',
                passwordHash: await hashPassword('student123'),
                role: 'STUDENT',
                department: 'Mechanical',
                year: 3,
            },
        ]);
        console.log('✅ Students created (3)');

        // Seed Attendance (past 30 days)
        console.log('Seeding attendance data...');
        const pastDates = getPastDates(30);
        const attendanceRecords = [];

        for (const student of students) {
            for (const date of pastDates) {
                let status: 'present' | 'absent' | 'late';
                const random = Math.random();

                if (student.email === 'core1@student.com') {
                    // Good attendance
                    status = random > 0.15 ? 'present' : random > 0.05 ? 'late' : 'absent';
                } else if (student.email === 'core2@student.com') {
                    // Average attendance
                    status = random > 0.25 ? 'present' : random > 0.15 ? 'late' : 'absent';
                } else {
                    // Lower attendance
                    status = random > 0.40 ? 'present' : random > 0.30 ? 'late' : 'absent';
                }

                attendanceRecords.push({
                    studentId: student._id,
                    date,
                    status,
                    markedBy: teacher._id,
                });
            }
        }
        await Attendance.insertMany(attendanceRecords);

        // Seed Performance
        console.log('Seeding performance data...');
        const subjects = ['Mathematics', 'Database Systems', 'Web Development', 'Operating Systems', 'Networks'];
        const performanceRecords = [];

        for (const student of students) {
            for (const subject of subjects) {
                let quizScore, assignmentScore, examScore, engagementScore;

                if (student.email === 'core1@student.com') {
                    // High performer
                    quizScore = 75 + Math.floor(Math.random() * 20);
                    assignmentScore = 80 + Math.floor(Math.random() * 15);
                    examScore = 78 + Math.floor(Math.random() * 18);
                    engagementScore = 85 + Math.floor(Math.random() * 15);
                } else if (student.email === 'core2@student.com') {
                    // Average performer
                    quizScore = 60 + Math.floor(Math.random() * 20);
                    assignmentScore = 65 + Math.floor(Math.random() * 20);
                    examScore = 62 + Math.floor(Math.random() * 20);
                    engagementScore = 70 + Math.floor(Math.random() * 15);
                } else {
                    // Struggling student
                    quizScore = 40 + Math.floor(Math.random() * 20);
                    assignmentScore = 45 + Math.floor(Math.random() * 20);
                    examScore = 42 + Math.floor(Math.random() * 18);
                    engagementScore = 50 + Math.floor(Math.random() * 20);
                }

                performanceRecords.push({
                    studentId: student._id,
                    subjectName: subject,
                    midSem1: Math.min(10, Math.floor(quizScore / 10)), // Scale 100 to 10
                    midSem2: Math.min(10, Math.floor(quizScore / 10)),
                    endSem: Math.min(70, Math.floor(examScore * 0.7)), // Scale 100 to 70
                    assignment: Math.min(10, Math.floor(assignmentScore / 10)),
                    engagementScore,
                });
            }
        }
        await Performance.insertMany(performanceRecords);

        // Seed Skill Scores
        console.log('Seeding skill scores...');
        const skillRecords = [];

        for (const student of students) {
            const skills = getSkills();
            const studentPerformance = performanceRecords.filter(
                (p) => p.studentId.toString() === student._id.toString()
            );

            // Calculate average attendance for this student
            const studentAttendance = attendanceRecords.filter(
                (a) => a.studentId.toString() === student._id.toString()
            );
            const attendancePercent =
                (studentAttendance.filter((a) => a.status === 'present' || a.status === 'late').length /
                    studentAttendance.length) *
                100;

            for (const skill of skills) {
                // Use average of all performance metrics
                const avgScore = studentPerformance.reduce((sum, p) => {
                    return sum + ((p.midSem1 || 0) + (p.midSem2 || 0) + (p.endSem || 0) + (p.assignment || 0));
                }, 0) / (studentPerformance.length || 1);

                const avgEngagement =
                    studentPerformance.reduce((sum, p) => sum + p.engagementScore, 0) /
                    (studentPerformance.length || 1);

                const skillScore = calculateSkillScore(
                    avgScore, // Treating overall score as quiz equivalent
                    avgScore, // Treating overall score as assignment equivalent
                    attendancePercent,
                    avgEngagement
                );

                const level = classifySkillLevel(skillScore);

                skillRecords.push({
                    studentId: student._id,
                    skillName: skill.name,
                    score: skillScore,
                    level,
                });
            }
        }
        await SkillScore.insertMany(skillRecords);

        console.log('\n🎉 Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
}
