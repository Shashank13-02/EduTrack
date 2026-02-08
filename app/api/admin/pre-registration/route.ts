import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PreRegisteredUser from '@/models/PreRegisteredUser';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

// GET - Fetch all pre-registered users AND registered users
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Check if user is admin or teacher
        const user = await getUserFromRequest(request);
        if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role'); // STUDENT or TEACHER
        const status = searchParams.get('status'); // registered or pending

        let allUsers: any[] = [];

        // Fetch from PreRegisteredUser (pending pre-registrations)
        if (status !== 'registered') {
            const preRegFilter: any = { isRegistered: false };
            if (role && (role === 'STUDENT' || role === 'TEACHER')) {
                preRegFilter.role = role;
            }

            const preRegUsers = await PreRegisteredUser.find(preRegFilter)
                .select('-createdBy')
                .sort({ createdAt: -1 })
                .lean();

            allUsers = preRegUsers.map(u => ({
                ...u,
                isRegistered: false,
                source: 'prereg'
            }));
        }

        // Fetch from User (already registered users)
        if (status !== 'pending') {
            const userFilter: any = {};
            if (role && (role === 'STUDENT' || role === 'TEACHER')) {
                userFilter.role = role;
            }

            const registeredUsers = await User.find(userFilter)
                .select('name email role department year registrationId subject yearsTaught createdAt')
                .sort({ createdAt: -1 })
                .lean();

            const mappedRegisteredUsers = registeredUsers.map(u => ({
                _id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                department: u.department,
                year: u.year,
                registrationId: u.registrationId,
                subject: u.subject,
                yearsTaught: u.yearsTaught,
                isRegistered: true,
                createdAt: u.createdAt,
                source: 'user'
            }));

            allUsers = [...allUsers, ...mappedRegisteredUsers];
        }

        // Sort by creation date (newest first)
        allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            success: true,
            count: allUsers.length,
            users: allUsers,
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
