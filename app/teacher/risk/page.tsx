'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import { RiskAlertsPanel } from '@/components/teacher/RiskAlertsPanel';
import { AlertTriangle } from 'lucide-react';

function RiskAlerts() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            fetchRiskAlerts();
        }
    }, [mounted]);

    const fetchRiskAlerts = async () => {
        try {
            const response = await fetch('/api/teacher/risk-alerts');
            const data = await response.json();
            if (response.ok) {
                setAtRiskStudents(data.atRiskStudents);
            }
        } catch (error) {
            console.error('Error fetching risk alerts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStudentClick = (studentId: string) => {
        router.push(`/teacher/student/${studentId}`);
    };

    if (isLoading || !mounted) return <Loading text="Loading Risk Alerts..." />;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">At-Risk Students & Interventions</h1>
                    <p className="text-muted-foreground dark:text-slate-400 text-sm">Monitor and support struggling students</p>
                </div>
            </div>

            <RiskAlertsPanel
                atRiskStudents={atRiskStudents}
                onStudentClick={handleStudentClick}
            />
        </div>
    );
}

export default function RiskAlertsPage() {
    return (
        <Suspense fallback={<Loading text="Loading Risk Alerts..." />}>
            <RiskAlerts />
        </Suspense>
    );
}
