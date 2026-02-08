'use client';

import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { getRiskLevelColor, getRiskLevelText } from '@/lib/riskPredictor';

interface Student {
    _id: string;
    name: string;
    email: string;
    department: string;
    year: number;
    attendancePercent: number;
    averageScore: number;
    engagementScore: number;
    riskLevel: string;
}

interface StudentMonitoringTableProps {
    students: Student[];
    onSearchChange: (search: string) => void;
    onFilterChange: (filter: { riskLevel?: string }) => void;
    onSortChange: (sortBy: string) => void;
    onStudentClick: (studentId: string) => void;
}

export function StudentMonitoringTable({
    students,
    onSearchChange,
    onFilterChange,
    onSortChange,
    onStudentClick,
}: StudentMonitoringTableProps) {
    const [search, setSearch] = useState('');
    const [riskLevelFilter, setRiskLevelFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');

    const handleSearchChange = (value: string) => {
        setSearch(value);
        onSearchChange(value);
    };

    const handleRiskLevelFilter = (value: string) => {
        setRiskLevelFilter(value);
        onFilterChange({ riskLevel: value });
    };

    const handleSort = (value: string) => {
        setSortBy(value);
        onSortChange(value);
    };

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <select
                        value={riskLevelFilter}
                        onChange={(e) => handleRiskLevelFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">All Risk Levels</option>
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => handleSort(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="name">Sort by Name</option>
                        <option value="attendance">Sort by Attendance</option>
                        <option value="score">Sort by Score</option>
                        <option value="risk">Sort by Risk</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Student</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Attendance</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Avg Score</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Engagement</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Risk Level</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {students.length > 0 ? (
                                students.map((student) => (
                                    <tr
                                        key={student._id}
                                        className="hover:bg-blue-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{student.name}</div>
                                                <div className="text-sm text-gray-500">{student.department} • Year {student.year}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-semibold text-gray-900">{student.attendancePercent}%</div>
                                                {student.attendancePercent < 75 && (
                                                    <span className="text-xs text-red-600">⚠️</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{student.averageScore}%</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-semibold text-gray-900">{Math.round(student.engagementScore)}%</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={getRiskLevelColor(student.riskLevel as any)}>
                                                {getRiskLevelText(student.riskLevel as any)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    onStudentClick(student._id);
                                                }}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                                                type="button"
                                            >
                                                View Details →
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                        <p>No students found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
                <span>Showing {students.length} student{students.length !== 1 ? 's' : ''}</span>
            </div>
        </div>
    );
}
