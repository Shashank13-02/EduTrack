'use client';

import React, { Suspense } from 'react';
import { Loading } from '@/components/ui/Loading';
import { MarksManagementPanel } from '@/components/teacher/MarksManagementPanel';
import { ClipboardList } from 'lucide-react';

function MarksManagement() {
    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl">
                    <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Marks Management</h1>
                    <p className="text-muted-foreground dark:text-slate-400 text-sm">Update and manage student grades</p>
                </div>
            </div>

            <MarksManagementPanel />
        </div>
    );
}

export default function MarksManagementPage() {
    return (
        <Suspense fallback={<Loading text="Loading Marks Management..." />}>
            <MarksManagement />
        </Suspense>
    );
}
