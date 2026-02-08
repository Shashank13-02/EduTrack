import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AIReport from '@/models/AIReport';
import Notification from '@/models/Notification';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Get student session
        const session = await getSession(request);
        if (!session || session.role.toLowerCase() !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all AI reports for this student
        const reports = await AIReport.find({ studentId: session.userId })
            .sort({ createdAt: -1 })
            .populate('studentId', 'name department year')
            .lean();

        // Get associated notifications to find who generated each report
        const reportIds = reports.map(r => r._id);
        const notifications = (await Notification.find({
            reportId: { $in: reportIds },
            type: 'AI_REPORT'
        })
            .populate('generatedBy', 'name department')
            .lean()) as any[];

        // Map notifications to reports
        const reportsWithTeacher = reports.map(report => {
            const notification = notifications.find(
                (n: any) => n.reportId?.toString() === report._id.toString()
            );

            let parsedReport;
            try {
                parsedReport = typeof report.reportText === 'string'
                    ? JSON.parse(report.reportText)
                    : report.reportText;
            } catch {
                parsedReport = { teacherMessage: report.reportText };
            }

            return {
                ...report,
                reportData: parsedReport,
                teacherName: (notification as any)?.generatedBy?.name || 'Faculty',
                teacherDepartment: (notification as any)?.generatedBy?.department || '',
                isRead: notification?.isRead || false,
                notificationId: notification?._id,
            };
        });

        return NextResponse.json({
            success: true,
            reports: reportsWithTeacher,
        });
    } catch (error: any) {
        console.error('Error fetching AI reports:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reports', details: error.message },
            { status: 500 }
        );
    }
}
