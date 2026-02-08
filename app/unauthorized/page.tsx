import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md">
                <CardContent className="pt-6 text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">
                        You don&apos;t have permission to access this page. Please login with the appropriate account.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/auth/login">
                            <Button variant="default">Go to Login</Button>
                        </Link>
                        <Link href="/">
                            <Button variant="secondary">Go Home</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
