'use client';

import { StudentSidebar } from '@/components/student/Sidebar';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <StudentSidebar />
            <main className="flex-1 h-full overflow-y-auto relative">
                {children}
            </main>
        </div>
    );
}
