import { NextResponse, type NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get user from token
    const user = await getUserFromRequest(request);



    // Public routes that don't require authentication
    const publicRoutes = ['/', '/auth/login', '/auth/register'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // API routes are handled separately
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
        let redirectUrl = '/student/dashboard';
        if (user.role.toUpperCase() === 'TEACHER') redirectUrl = '/teacher/dashboard';
        if (user.role.toUpperCase() === 'ADMIN') redirectUrl = '/admin/pre-registration';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        if (user.role.toUpperCase() !== 'ADMIN') {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // Protect teacher routes
    if (pathname.startsWith('/teacher')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        if (user.role.toUpperCase() !== 'TEACHER') {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // Protect student routes
    if (pathname.startsWith('/student')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        if (user.role.toUpperCase() !== 'STUDENT') {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
