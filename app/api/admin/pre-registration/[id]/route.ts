import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PreRegisteredUser from '@/models/PreRegisteredUser';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();

        // Check if user is admin or teacher
        const user = await getUserFromRequest(request);
        if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
        }

        const { id } = await params;

        // Check if user is already registered
        const preRegUser = await PreRegisteredUser.findById(id);

        if (!preRegUser) {
            return NextResponse.json(
                { error: 'Pre-registered user not found' },
                { status: 404 }
            );
        }

        if (preRegUser.isRegistered) {
            return NextResponse.json(
                { error: 'Cannot delete: User has already registered' },
                { status: 400 }
            );
        }

        await PreRegisteredUser.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Pre-registered user deleted successfully',
        });

    } catch (error) {
        console.error('Error deleting pre-registered user:', error);
        return NextResponse.json(
            { error: 'Failed to delete pre-registered user' },
            { status: 500 }
        );
    }
}
