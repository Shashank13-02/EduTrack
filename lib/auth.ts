import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key'
);

export interface JWTPayload {
    userId: string;
    email: string;
    role: 'TEACHER' | 'STUDENT' | 'ADMIN';
    isVerified: boolean;
}

/**
 * Sign a JWT token
 */
export async function signToken(payload: any): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET);
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as JWTPayload;
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

/**
 * Get token from cookies (server component)
 */
export async function getTokenFromCookies(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    return token?.value || null;
}

/**
 * Get token from request (for API routes and middleware)
 */
export function getTokenFromRequest(request: NextRequest): string | null {
    return request.cookies.get('token')?.value || null;
}

/**
 * Get current user from request
 */
export async function getUserFromRequest(request: NextRequest): Promise<JWTPayload | null> {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    return await verifyToken(token);
}

/**
 * Get current user from cookies (server component)
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
    const token = await getTokenFromCookies();
    if (!token) return null;
    return await verifyToken(token);
}

/**
 * Compatibility helper for API routes
 */
export async function verifyAuth(request: NextRequest) {
    const user = await getUserFromRequest(request);
    return {
        authenticated: !!user,
        user: user
    };
}

export { getUserFromRequest as getSession };
