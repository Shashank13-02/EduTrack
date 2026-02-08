'use client';

import React from 'react';
import { Download, FileText, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface PDFReportGeneratorProps {
    studentData: any;
    performanceRecords: any[];
    skillScores: any[];
    attendancePercent: number;
    averageScore: number;
    riskLevel: string;
    latestReport: any;
}

export function PDFReportGenerator({
    studentData,
    performanceRecords,
    skillScores,
    attendancePercent,
    averageScore,
    riskLevel,
    latestReport
}: PDFReportGeneratorProps) {

    const downloadAIReport = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('EduTrack - AI Performance Report', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(format(new Date(), 'MMMM dd, yyyy'), 105, 30, { align: 'center' });

        // Student Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text('Student Information', 20, 55);
        doc.setFontSize(11);
        doc.text(`Name: ${studentData.name}`, 20, 65);
        doc.text(`Department: ${studentData.department}`, 20, 72);
        doc.text(`Year: ${studentData.year}`, 20, 79);
        doc.text(`Student Type: ${studentData.studentType || 'N/A'}`, 20, 86);
        doc.text(`Risk Level: ${riskLevel.toUpperCase()}`, 20, 93);

        // Performance Summary
        doc.setFontSize(16);
        doc.text('Performance Summary', 20, 108);
        doc.setFontSize(11);
        doc.text(`Attendance: ${attendancePercent}%`, 20, 118);
        doc.text(`Average Score: ${averageScore}%`, 20, 125);

        // Performance Table
        if (performanceRecords.length > 0) {
            autoTable(doc, {
                startY: 135,
                head: [['Subject', 'Mid 1', 'Mid 2', 'Asgn', 'End Sem', 'Avg']],
                body: performanceRecords.map(p => {
                    const avg = Math.round(
                        ((p.midSem1 || 0) + (p.midSem2 || 0) + (p.assignment || 0) + (p.endSem || 0)) /
                        ((p.midSem1 !== null ? 10 : 0) + (p.midSem2 !== null ? 10 : 0) + (p.assignment !== null ? 10 : 0) + (p.endSem !== null ? 70 : 0)) * 100
                    ) || 0;
                    return [
                        p.subjectName,
                        p.midSem1 ?? '—',
                        p.midSem2 ?? '—',
                        p.assignment ?? '—',
                        p.endSem ?? '—',
                        `${avg}%`
                    ];
                }),
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] }
            });
        }

        // Skills Table
        if (skillScores.length > 0) {
            const finalY = (doc as any).lastAutoTable.finalY || 135;
            autoTable(doc, {
                startY: finalY + 10,
                head: [['Skill', 'Score', 'Level']],
                body: skillScores.map(s => [
                    s.skillName,
                    `${s.score}%`,
                    s.level.toUpperCase()
                ]),
                theme: 'grid',
                headStyles: { fillColor: [139, 92, 246] }
            });
        }

        // AI Feedback
        if (latestReport) {
            doc.addPage();
            doc.setFillColor(139, 92, 246);
            doc.rect(0, 0, 210, 30, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text('AI Generated Feedback', 105, 18, { align: 'center' });

            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            const splitText = doc.splitTextToSize(latestReport.reportText, 170);
            doc.text(splitText, 20, 45);

            // Study Plan
            const textHeight = splitText.length * 7;
            doc.setFontSize(14);
            doc.text('7-Day Study Plan', 20, 55 + textHeight);
            doc.setFontSize(10);

            let yPos = 65 + textHeight;
            latestReport.recommendedPlan.forEach((item: string, index: number) => {
                doc.text(`${index + 1}. ${item}`, 25, yPos);
                yPos += 7;
            });
        }

        doc.save(`EduTrack_AI_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    const downloadWeeklySummary = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(16, 185, 129);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('Weekly Performance Summary', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(format(new Date(), 'MMMM dd, yyyy'), 105, 30, { align: 'center' });

        // Student Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text(`Student: ${studentData.name}`, 20, 55);
        doc.setFontSize(11);
        doc.text(`Department: ${studentData.department} | Year: ${studentData.year}`, 20, 63);

        // Weekly Stats
        doc.setFontSize(16);
        doc.text('This Week\'s Overview', 20, 78);

        doc.setFontSize(11);
        const stats = [
            `Overall Performance: ${averageScore}%`,
            `Attendance Rate: ${attendancePercent}%`,
            `Risk Status: ${riskLevel.toUpperCase()}`,
            `Active Subjects: ${performanceRecords.length}`,
            `Skills Tracked: ${skillScores.length}`
        ];

        let yPos = 88;
        stats.forEach(stat => {
            doc.text(`• ${stat}`, 25, yPos);
            yPos += 8;
        });

        // Performance by Subject
        if (performanceRecords.length > 0) {
            autoTable(doc, {
                startY: yPos + 5,
                head: [['Subject', 'Mid 1', 'Mid 2', 'Asgn', 'End Sem', 'Avg']],
                body: performanceRecords.map(p => {
                    const avg = Math.round(
                        ((p.midSem1 || 0) + (p.midSem2 || 0) + (p.assignment || 0) + (p.endSem || 0)) /
                        ((p.midSem1 !== null ? 10 : 0) + (p.midSem2 !== null ? 10 : 0) + (p.assignment !== null ? 10 : 0) + (p.endSem !== null ? 70 : 0)) * 100
                    ) || 0;
                    return [
                        p.subjectName,
                        p.midSem1 ?? '—',
                        p.midSem2 ?? '—',
                        p.assignment ?? '—',
                        p.endSem ?? '—',
                        `${avg}%`
                    ];
                }),
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] }
            });
        }

        // Skills Progress
        if (skillScores.length > 0) {
            const finalY = (doc as any).lastAutoTable.finalY || yPos;
            doc.setFontSize(16);
            doc.text('Skills Progress', 20, finalY + 15);

            const strongSkills = skillScores.filter(s => s.level === 'strong');
            const weakSkills = skillScores.filter(s => s.level === 'weak');

            doc.setFontSize(11);
            doc.text(`Strong Skills (${strongSkills.length}): ${strongSkills.map(s => s.skillName).join(', ') || 'None'}`, 20, finalY + 25, { maxWidth: 170 });
            doc.text(`Needs Improvement (${weakSkills.length}): ${weakSkills.map(s => s.skillName).join(', ') || 'None'}`, 20, finalY + 35, { maxWidth: 170 });
        }

        doc.save(`EduTrack_Weekly_Summary_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={downloadAIReport}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                    <Download className="w-5 h-5" />
                    <span>Download AI Report PDF</span>
                </button>

                <button
                    onClick={downloadWeeklySummary}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                    <Calendar className="w-5 h-5" />
                    <span>Download Weekly Summary</span>
                </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-900 text-sm mb-1">Export Your Reports</h4>
                        <p className="text-sm text-blue-700">
                            Download comprehensive PDF reports with your performance data, AI feedback, and personalized study plans.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
