import { ActivityType } from '@/models/ActivityLog';

/**
 * Client-side activity logger
 * Sends activity logs to the server
 */
export async function logActivity(
    activityType: ActivityType,
    description: string,
    metadata?: Record<string, any>
): Promise<boolean> {
    try {
        const response = await fetch('/api/activity/log', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                activityType,
                description,
                metadata,
            }),
        });

        if (!response.ok) {
            console.warn('Failed to log activity:', activityType);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error logging activity:', error);
        return false;
    }
}

/**
 * Server-side activity logger
 * Creates activity logs directly in the database
 */
export async function logActivityServer(params: {
    userId: string;
    userRole: 'TEACHER' | 'STUDENT' | 'ADMIN';
    userName: string;
    userEmail: string;
    activityType: ActivityType;
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}): Promise<void> {
    try {
        const { connectDB } = await import('@/lib/db');
        const ActivityLog = (await import('@/models/ActivityLog')).default;

        await connectDB();

        await ActivityLog.create({
            userId: params.userId,
            userRole: params.userRole,
            userName: params.userName,
            userEmail: params.userEmail,
            activityType: params.activityType,
            description: params.description,
            metadata: params.metadata || {},
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
        });
    } catch (error) {
        // Don't throw errors - activity logging should not break the main flow
        console.error('Error logging activity to database:', error);
    }
}

/**
 * Activity type constants for easy reference
 */
export const ACTIVITY_TYPES = {
    LOGIN: 'LOGIN' as ActivityType,
    LOGOUT: 'LOGOUT' as ActivityType,
    REGISTER: 'REGISTER' as ActivityType,
    PROFILE_UPDATE: 'PROFILE_UPDATE' as ActivityType,
    MARKS_SUBMITTED: 'MARKS_SUBMITTED' as ActivityType,
    MARKS_UPDATED: 'MARKS_UPDATED' as ActivityType,
    ATTENDANCE_MARKED: 'ATTENDANCE_MARKED' as ActivityType,
    ATTENDANCE_SESSION_CREATED: 'ATTENDANCE_SESSION_CREATED' as ActivityType,
    SKILL_ADDED: 'SKILL_ADDED' as ActivityType,
    SKILL_UPDATED: 'SKILL_UPDATED' as ActivityType,
    AI_REPORT_GENERATED: 'AI_REPORT_GENERATED' as ActivityType,
    CAREER_ROADMAP_GENERATED: 'CAREER_ROADMAP_GENERATED' as ActivityType,
    USER_VERIFIED: 'USER_VERIFIED' as ActivityType,
    USER_DELETED: 'USER_DELETED' as ActivityType,
    CHAT_MESSAGE_SENT: 'CHAT_MESSAGE_SENT' as ActivityType,
    OTHER: 'OTHER' as ActivityType,
};

/**
 * Helper to format activity descriptions
 */
export const activityDescriptions = {
    login: (userName: string) => `${userName} logged in`,
    logout: (userName: string) => `${userName} logged out`,
    register: (userName: string, role: string) => `${userName} registered as ${role}`,
    profileUpdate: (userName: string) => `${userName} updated their profile`,
    marksSubmitted: (teacherName: string, subject: string, studentCount: number) =>
        `${teacherName} submitted marks for ${subject} (${studentCount} students)`,
    marksUpdated: (teacherName: string, subject: string, studentName: string) =>
        `${teacherName} updated marks for ${studentName} in ${subject}`,
    attendanceMarked: (teacherName: string, presentCount: number, totalCount: number) =>
        `${teacherName} marked attendance (${presentCount}/${totalCount} present)`,
    attendanceSessionCreated: (teacherName: string, subject: string) =>
        `${teacherName} created attendance session for ${subject}`,
    skillAdded: (userName: string, skillName: string) => `${userName} added skill: ${skillName}`,
    skillUpdated: (userName: string, skillName: string) => `${userName} updated skill: ${skillName}`,
    aiReportGenerated: (userName: string) => `AI report generated for ${userName}`,
    careerRoadmapGenerated: (userName: string) => `Career roadmap generated for ${userName}`,
    userVerified: (actorName: string, userName: string) => `${actorName} verified user ${userName}`, // For system verification
    userDeleted: (actorName: string, userName: string) => `${actorName} deleted user ${userName}`,
    chatMessageSent: (userName: string, chatRoom: string) => `${userName} sent a message in ${chatRoom}`,
};
