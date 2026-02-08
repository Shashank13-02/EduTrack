'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Save, CheckCircle, AlertCircle, Info, Send, Search, Download, Edit, X, ArrowUpDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loading, LoadingSpinner } from '@/components/ui/Loading';
import { MarksStatisticsCard } from '@/components/teacher/MarksStatisticsCard';
import { calculateGrade, getGradeColor } from '@/lib/gradeCalculator';
import { calculateWeightedAverage, cn } from '@/lib/utils';

interface Student {
    _id: string;
    name: string;
    email: string;
    department: string;
    year?: number;
    section?: string;
}

interface Marks {
    midSem1: number | null;
    midSem2: number | null;
    endSem: number | null;
    assignment: number | null;
}

export function MarksManagementPanel() {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [subject, setSubject] = useState('');
    const [marksData, setMarksData] = useState<{ [key: string]: Marks }>({});
    const [isSaving, setIsSaving] = useState(false);
    const [savingField, setSavingField] = useState<keyof Marks | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<'name' | 'total' | 'department'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showStatistics, setShowStatistics] = useState(false);
    const [editingField, setEditingField] = useState<keyof Marks | null>(null);
    const [assignedSubject, setAssignedSubject] = useState<string | null>(null);
    const [departmentFilter, setDepartmentFilter] = useState<string>('');
    const [publishedMarks, setPublishedMarks] = useState<Set<string>>(new Set());

    const subjects = ['Mathematics', 'Computer Science', 'Physics', 'History', 'English'];

    useEffect(() => {
        fetchTeacherProfile();
        fetchStudents();
    }, []);

    const fetchTeacherProfile = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();
            if (response.ok && data.user && data.user.subject) {
                setAssignedSubject(data.user.subject);
                setSubject(data.user.subject); // Automatically set the working subject
            }
        } catch (error) {
            console.error('Error fetching teacher profile:', error);
        }
    };

    useEffect(() => {
        if (subject) {
            fetchExistingMarks();
        }
    }, [subject]);

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/teacher/students');
            const data = await response.json();
            if (response.ok) {
                setStudents(data.students);
                // Initialize marks data if not already set by fetchExistingMarks
                setMarksData(prev => {
                    const newMarks = { ...prev };
                    data.students.forEach((s: any) => {
                        if (!newMarks[s._id]) {
                            newMarks[s._id] = {
                                midSem1: null,
                                midSem2: null,
                                endSem: null,
                                assignment: null
                            };
                        }
                    });
                    return newMarks;
                });
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchExistingMarks = async () => {
        try {
            const response = await fetch(`/api/teacher/performance/mark?subjectName=${subject}`);
            const data = await response.json();
            if (response.ok) {
                const existingMarks: { [key: string]: Marks } = {};
                const published = new Set<string>();

                data.performanceRecords.forEach((record: any) => {
                    existingMarks[record.studentId] = {
                        midSem1: record.midSem1,
                        midSem2: record.midSem2,
                        endSem: record.endSem,
                        assignment: record.assignment,
                    };

                    // Track which marks are published (exist in database)
                    if (record.midSem1 !== null) published.add(`${record.studentId}-midSem1`);
                    if (record.midSem2 !== null) published.add(`${record.studentId}-midSem2`);
                    if (record.endSem !== null) published.add(`${record.studentId}-endSem`);
                    if (record.assignment !== null) published.add(`${record.studentId}-assignment`);
                });

                setPublishedMarks(published);
                setMarksData(prev => {
                    const updated = { ...prev };
                    Object.keys(existingMarks).forEach(sid => {
                        updated[sid] = existingMarks[sid];
                    });
                    return updated;
                });
            }
        } catch (error) {
            console.error('Error fetching existing marks:', error);
        }
    };

    const handleMarkChange = (studentId: string, field: keyof Marks, value: string) => {
        // Check if this mark is published (locked from database)
        const markKey = `${studentId}-${field}`;
        if (publishedMarks.has(markKey)) {
            return; // Don't allow editing published marks
        }

        const numValue = value === '' ? null : parseFloat(value);

        // Validate range
        const maxValues = { midSem1: 10, midSem2: 10, endSem: 70, assignment: 10 };
        if (numValue !== null && (numValue < 0 || numValue > maxValues[field])) {
            setMessage({ type: 'error', text: `Invalid value for ${field}. Must be between 0 and ${maxValues[field]}` });
            return;
        }

        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: numValue
            }
        }));
    };

    // Calculate total for a student
    const calculateTotal = (studentId: string): number => {
        const marks = marksData[studentId];
        if (!marks) return 0;
        return calculateWeightedAverage([
            { score: marks.midSem1 || 0, max: 10 },
            { score: marks.midSem2 || 0, max: 10 },
            { score: marks.endSem || 0, max: 70 },
            { score: marks.assignment || 0, max: 10 }
        ]);
    };

    const publishMarks = async (type: keyof Marks) => {
        if (!subject) {
            setMessage({ type: 'error', text: 'Please select a subject first' });
            return;
        }

        if (!assignedSubject || assignedSubject !== subject) {
            setMessage({ type: 'error', text: `You are only authorized to grade ${assignedSubject || 'your assigned subject'}. You cannot grade ${subject}.` });
            return;
        }

        setIsSaving(true);
        setSavingField(type);
        setMessage(null);

        try {
            // Find students who actually have marks to publish for this field
            const studentsWithMarks = students.filter(s => marksData[s._id] && marksData[s._id][type] !== null);

            if (studentsWithMarks.length === 0) {
                setMessage({ type: 'error', text: `No marks entered for ${getLabel(type)}. Please enter marks before publishing.` });
                setIsSaving(false);
                setSavingField(null);
                return;
            }

            const updates = students.map(student => ({
                studentId: student._id,
                [type]: marksData[student._id] ? marksData[student._id][type] : null
            }));

            const response = await fetch('/api/teacher/performance/mark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectName: subject,
                    marksUpdates: updates
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Construct a message showing which students' marks were submitted
                const studentNames = studentsWithMarks.map(s => s.name).join(', ');
                const displayNames = studentNames.length > 50 ? `${studentsWithMarks.length} students` : studentNames;

                setMessage({
                    type: 'success',
                    text: `✓ Marks for ${getLabel(type)} have been submitted for: ${displayNames}. These marks are now locked and cannot be changed.`
                });
                fetchExistingMarks(); // Refresh locks
            } else {
                const errorMsg = data.error || 'Failed to publish marks. Please try again.';
                setMessage({ type: 'error', text: errorMsg });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while publishing. Please check your connection and try again.' });
        } finally {
            setIsSaving(false);
            setSavingField(null);
        }
    };

    const isFieldLocked = (field: keyof Marks) => {
        // A field is locked if ANY student has published marks for that field
        return students.some(s => publishedMarks.has(`${s._id}-${field}`));
    };

    const getLabel = (type: keyof Marks) => {
        switch (type) {
            case 'midSem1': return 'Mid-Sem 1 (10)';
            case 'midSem2': return 'Mid-Sem 2 (10)';
            case 'endSem': return 'End Sem (70)';
            case 'assignment': return 'Assignment (10)';
        }
    };

    // Get unique departments from students
    const availableDepartments = useMemo(() => {
        const depts = new Set(students.map(s => s.department).filter(Boolean));
        return Array.from(depts).sort();
    }, [students]);

    // Filter and sort students
    const filteredAndSortedStudents = useMemo(() => {
        let filtered = students.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.department?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDepartment = !departmentFilter || student.department === departmentFilter;
            return matchesSearch && matchesDepartment;
        });

        filtered.sort((a, b) => {
            if (sortField === 'name') {
                return sortOrder === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name);
            } else if (sortField === 'department') {
                const deptCompare = (a.department || '').localeCompare(b.department || '');
                if (deptCompare !== 0) {
                    return sortOrder === 'asc' ? deptCompare : -deptCompare;
                }
                // If same department, sort by name
                return a.name.localeCompare(b.name);
            } else {
                const aTotal = calculateTotal(a._id);
                const bTotal = calculateTotal(b._id);
                return sortOrder === 'asc' ? aTotal - bTotal : bTotal - aTotal;
            }
        });

        return filtered;
    }, [students, searchTerm, sortField, sortOrder, marksData, departmentFilter]);

    // Export to CSV
    const exportToCSV = () => {
        if (!subject) {
            setMessage({ type: 'error', text: 'Please select a subject first' });
            return;
        }

        const headers = ['Student Name', 'Email', 'Department', 'Year', 'Section', 'Mid-Sem 1', 'Mid-Sem 2', 'End Sem', 'Assignment', 'Total', 'Grade'];
        const rows = filteredAndSortedStudents.map(student => {
            const marks = marksData[student._id] || {};
            const total = calculateTotal(student._id);
            const grade = calculateGrade(total);
            return [
                student.name,
                student.email,
                student.department || 'N/A',
                student.year?.toString() || 'N/A',
                student.section || 'N/A',
                marks.midSem1 ?? '-',
                marks.midSem2 ?? '-',
                marks.endSem ?? '-',
                marks.assignment ?? '-',
                total.toFixed(1),
                grade.grade
            ];
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${subject}_marks_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Prepare performance records for statistics
    const performanceRecords = students.map(student => ({
        studentId: student._id,
        studentName: student.name,
        midSem1: marksData[student._id]?.midSem1 || null,
        midSem2: marksData[student._id]?.midSem2 || null,
        endSem: marksData[student._id]?.endSem || null,
        assignment: marksData[student._id]?.assignment || null,
    }));

    if (isLoading) return <Loading text="Loading Marks Management..." />;

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm bg-white/80">
                <div className="flex flex-col gap-6">
                    {/* Title and Subject Selection */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Marks Management System
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Precision grading and performance tracking for your students
                            </p>
                        </div>
                        <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-900/20 px-5 py-3 rounded-2xl border border-indigo-100 dark:border-indigo-800 shadow-sm transition-all hover:shadow-md">
                            <div className="relative">
                                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping absolute opacity-75"></div>
                                <div className="w-3 h-3 rounded-full bg-indigo-500 relative"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 dark:text-indigo-400">Current Subject</span>
                                <span className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                                    {assignedSubject || 'Checking...'}
                                </span>
                            </div>
                            {!assignedSubject && (
                                <span className="text-xs text-red-500 font-medium">Contact Admin</span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            onClick={() => setShowStatistics(!showStatistics)}
                            variant={showStatistics ? "default" : "ghost"}
                            disabled={!subject}
                        >
                            <BarChart3 className="w-4 h-4 mr-1" />
                            {showStatistics ? 'Hide' : 'Show'} Statistics
                        </Button>
                        <Button
                            size="sm"
                            onClick={exportToCSV}
                            variant="ghost"
                            disabled={!subject}
                        >
                            <Download className="w-4 h-4 mr-1" />
                            Export CSV
                        </Button>
                    </div>

                    {/* Search and Sort Controls */}
                    {subject && (
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <select
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">All Departments</option>
                                {availableDepartments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                            <div className="flex gap-2">
                                <select
                                    value={sortField}
                                    onChange={(e) => setSortField(e.target.value as 'name' | 'total' | 'department')}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="department">Sort by Department</option>
                                    <option value="total">Sort by Total</option>
                                </select>
                                <Button
                                    size="sm"
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    variant="ghost"
                                >
                                    <ArrowUpDown className="w-4 h-4 mr-1" />
                                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {message && (
                    <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
                        }`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                {assignedSubject && subject && assignedSubject !== subject && (
                    <div className="mt-4 p-4 rounded-lg flex items-center gap-3 bg-red-50 border border-red-200 text-red-800">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">
                            Warning: You are viewing marks for <strong>{subject}</strong>, but you are assigned to teach <strong>{assignedSubject}</strong>. You can only publish marks for your assigned subject.
                        </p>
                    </div>
                )}

                <div className="mt-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-100 dark:border-amber-900/50 flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed italic">
                        <strong>Security Policy:</strong> Marks once submitted and accepted are permanently locked to ensure academic integrity. Please cross-verify all entries before publishing.
                    </p>
                </div>
            </div>

            {/* Statistics and Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    {showStatistics && subject && (
                        <MarksStatisticsCard
                            performanceRecords={performanceRecords}
                            subjectName={subject}
                        />
                    )}
                </div>

                {subject && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Marking Progress
                        </h3>
                        <div className="space-y-4">
                            {[
                                { id: 'midSem1', label: 'Mid-Sem 1' },
                                { id: 'midSem2', label: 'Mid-Sem 2' },
                                { id: 'endSem', label: 'End Semester' },
                                { id: 'assignment', label: 'Assignment' }
                            ].map((exam) => {
                                const published = isFieldLocked(exam.id as keyof Marks);
                                const entered = students.filter(s => marksData[s._id] && marksData[s._id][exam.id as keyof Marks] !== null).length;
                                const progress = (entered / (students.length || 1)) * 100;

                                return (
                                    <div key={exam.id} className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                            <span className="text-slate-500">{exam.label}</span>
                                            <span className={published ? "text-green-500" : "text-amber-500"}>
                                                {published ? 'Published' : `${entered}/${students.length} Entered`}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-500",
                                                    published ? "bg-green-500" : "bg-indigo-500"
                                                )}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Marks Entry Table */}
            {subject && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Showing {filteredAndSortedStudents.length} Students
                            </span>
                        </div>
                        {departmentFilter && (
                            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                                {departmentFilter}
                            </span>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-indigo-50/50 dark:bg-slate-800/80 text-indigo-900 dark:text-slate-100 text-[10px] uppercase font-bold tracking-widest border-b border-indigo-100 dark:border-slate-800">
                                    <th className="px-6 py-4 text-left">Student Information</th>
                                    <th className="px-6 py-4 text-left">Academic Info</th>
                                    <th className="px-6 py-4 text-center">{getLabel('midSem1')}</th>
                                    <th className="px-6 py-4 text-center">{getLabel('midSem2')}</th>
                                    <th className="px-6 py-4 text-center">{getLabel('endSem')}</th>
                                    <th className="px-6 py-4 text-center">{getLabel('assignment')}</th>
                                    <th className="px-6 py-4 text-center bg-slate-100/30 dark:bg-slate-800/50">Final Score</th>
                                    <th className="px-6 py-4 text-center bg-slate-100/30 dark:bg-slate-800/50">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAndSortedStudents.map((student) => {
                                    const total = calculateTotal(student._id);
                                    const grade = calculateGrade(total);

                                    return (
                                        <tr key={student._id} className="hover:bg-indigo-50/20 dark:hover:bg-slate-800/30 transition-all duration-200 border-b border-slate-100 dark:border-slate-800 group">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{student.name}</div>
                                                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[150px]">{student.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{student.department || 'N/A'}</div>
                                                {student.year && (
                                                    <div className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full inline-block mt-1">Year {student.year}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        className={cn(
                                                            "w-16 px-2 py-1.5 border rounded-lg text-center text-sm font-semibold transition-all shadow-inner",
                                                            publishedMarks.has(`${student._id}-midSem1`)
                                                                ? "bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                                                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        )}
                                                        value={marksData[student._id]?.midSem1 ?? ''}
                                                        placeholder="0"
                                                        onChange={(e) => handleMarkChange(student._id, 'midSem1', e.target.value)}
                                                        disabled={publishedMarks.has(`${student._id}-midSem1`)}
                                                        min={0} max={10}
                                                    />
                                                    {publishedMarks.has(`${student._id}-midSem1`) && <CheckCircle className="w-4 h-4 text-green-500 drop-shadow-sm" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        className={cn(
                                                            "w-16 px-2 py-1.5 border rounded-lg text-center text-sm font-semibold transition-all shadow-inner",
                                                            publishedMarks.has(`${student._id}-midSem2`)
                                                                ? "bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                                                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        )}
                                                        value={marksData[student._id]?.midSem2 ?? ''}
                                                        placeholder="0"
                                                        onChange={(e) => handleMarkChange(student._id, 'midSem2', e.target.value)}
                                                        disabled={publishedMarks.has(`${student._id}-midSem2`)}
                                                        min={0} max={10}
                                                    />
                                                    {publishedMarks.has(`${student._id}-midSem2`) && <CheckCircle className="w-4 h-4 text-green-500 drop-shadow-sm" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        className={cn(
                                                            "w-20 px-2 py-1.5 border rounded-lg text-center text-sm font-semibold transition-all shadow-inner",
                                                            publishedMarks.has(`${student._id}-endSem`)
                                                                ? "bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                                                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        )}
                                                        value={marksData[student._id]?.endSem ?? ''}
                                                        placeholder="0"
                                                        onChange={(e) => handleMarkChange(student._id, 'endSem', e.target.value)}
                                                        disabled={publishedMarks.has(`${student._id}-endSem`)}
                                                        min={0} max={70}
                                                    />
                                                    {publishedMarks.has(`${student._id}-endSem`) && <CheckCircle className="w-4 h-4 text-green-500 drop-shadow-sm" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        className={cn(
                                                            "w-16 px-2 py-1.5 border rounded-lg text-center text-sm font-semibold transition-all shadow-inner",
                                                            publishedMarks.has(`${student._id}-assignment`)
                                                                ? "bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed"
                                                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                        )}
                                                        value={marksData[student._id]?.assignment ?? ''}
                                                        placeholder="0"
                                                        onChange={(e) => handleMarkChange(student._id, 'assignment', e.target.value)}
                                                        disabled={publishedMarks.has(`${student._id}-assignment`)}
                                                        min={0} max={10}
                                                    />
                                                    {publishedMarks.has(`${student._id}-assignment`) && <CheckCircle className="w-4 h-4 text-green-500 drop-shadow-sm" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center bg-slate-50/50 dark:bg-slate-800/20">
                                                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 drop-shadow-sm">
                                                    {total > 0 ? `${total.toFixed(0)}` : '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center bg-slate-50/50 dark:bg-slate-800/20">
                                                {total > 0 && (
                                                    <div className={cn(
                                                        "inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest shadow-sm border",
                                                        getGradeColor(grade.grade).replace('bg-', 'bg-').replace('text-', 'text-')
                                                    )}>
                                                        {grade.grade}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-700" colSpan={2}>Actions</td>
                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            size="sm"
                                            onClick={() => publishMarks('midSem1')}
                                            disabled={isSaving || !subject || isFieldLocked('midSem1')}
                                            className={isFieldLocked('midSem1') ? 'opacity-50 cursor-not-allowed' : ''}
                                        >
                                            {savingField === 'midSem1' ? (
                                                <>
                                                    <LoadingSpinner size="sm" className="mr-1" />
                                                    Publishing...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-3 h-3 mr-1" />
                                                    {isFieldLocked('midSem1') ? 'Published' : 'Publish'}
                                                </>
                                            )}
                                        </Button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            size="sm"
                                            onClick={() => publishMarks('midSem2')}
                                            disabled={isSaving || !subject || isFieldLocked('midSem2')}
                                            className={isFieldLocked('midSem2') ? 'opacity-50 cursor-not-allowed' : ''}
                                        >
                                            {savingField === 'midSem2' ? (
                                                <>
                                                    <LoadingSpinner size="sm" className="mr-1" />
                                                    Publishing...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-3 h-3 mr-1" />
                                                    {isFieldLocked('midSem2') ? 'Published' : 'Publish'}
                                                </>
                                            )}
                                        </Button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            size="sm"
                                            onClick={() => publishMarks('endSem')}
                                            disabled={isSaving || !subject || isFieldLocked('endSem')}
                                            className={isFieldLocked('endSem') ? 'opacity-50 cursor-not-allowed' : ''}
                                        >
                                            {savingField === 'endSem' ? (
                                                <>
                                                    <LoadingSpinner size="sm" className="mr-1" />
                                                    Publishing...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-3 h-3 mr-1" />
                                                    {isFieldLocked('endSem') ? 'Published' : 'Publish'}
                                                </>
                                            )}
                                        </Button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Button
                                            size="sm"
                                            onClick={() => publishMarks('assignment')}
                                            disabled={isSaving || !subject || isFieldLocked('assignment')}
                                            className={isFieldLocked('assignment') ? 'opacity-50 cursor-not-allowed' : ''}
                                        >
                                            {savingField === 'assignment' ? (
                                                <>
                                                    <LoadingSpinner size="sm" className="mr-1" />
                                                    Publishing...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-3 h-3 mr-1" />
                                                    {isFieldLocked('assignment') ? 'Published' : 'Publish'}
                                                </>
                                            )}
                                        </Button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-xs text-gray-500 font-medium">Auto-calculated</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-xs text-gray-500 font-medium">Auto-assigned</div>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
