'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui/Loading';
import { StudentMonitoringTable } from '@/components/teacher/StudentMonitoringTable';
import { Users } from 'lucide-react';

function StudentMonitoring() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ riskLevel: '' });
    const [sortBy, setSortBy] = useState('name');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            fetchStudents();
        }
    }, [searchQuery, filters, sortBy, mounted]);

    const fetchStudents = async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (filters.riskLevel) params.append('riskLevel', filters.riskLevel);
            if (sortBy) params.append('sortBy', sortBy);

            const response = await fetch(`/api/teacher/students?${params.toString()}`);
            const data = await response.json();
            if (response.ok) {
                setStudents(data.students);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStudentClick = (studentId: string) => {
        router.push(`/teacher/student/${studentId}`);
    };

    if (isLoading || !mounted) return <Loading text="Loading Students..." />;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Student Monitoring</h1>
                    <p className="text-muted-foreground dark:text-slate-400 text-sm">Track and manage student performance</p>
                </div>
            </div>

            <StudentMonitoringTable
                students={students}
                onSearchChange={setSearchQuery}
                onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
                onSortChange={setSortBy}
                onStudentClick={handleStudentClick}
            />
        </div>
    );
}

export default function StudentMonitoringPage() {
    return (
        <Suspense fallback={<Loading text="Loading Students..." />}>
            <StudentMonitoring />
        </Suspense>
    );
}
