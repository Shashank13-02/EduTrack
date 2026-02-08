'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    Users,
    BookOpen,
    Mail,
    Building2,
    Calendar,
    IdCard,
    Plus,
    Trash2,
    Search,
    Filter,
    CheckCircle,
    Clock,
    ArrowRight,
    AlertCircle,
    Upload,
    FileText,
    Download,
    X,
    LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/GlassCard';
import { LoadingSpinner } from '@/components/ui/Loading';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function AdminPreRegistrationPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [preRegUsers, setPreRegUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'registered'>('all');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // CSV Upload states
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form states
    const [studentForm, setStudentForm] = useState({
        name: '',
        email: '',
        department: '',
        year: '',
        registrationId: '',
    });

    const [teacherForm, setTeacherForm] = useState({
        name: '',
        email: '',
        department: '',
        subject: '',
        yearsTaught: [] as number[],
    });

    const departments = [
        "Mechanical", "Electrical", "Production & Industrial", "Metallurgy",
        "Chemical", "Civil", "Electronics and Communication", "Mining",
        "Computer Science & Engineering", "Computer Science & Engineering (Cyber Security)",
        "Information Technology"
    ];

    useEffect(() => {
        fetchPreRegUsers();
    }, [activeTab]);

    const fetchPreRegUsers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/pre-registration?role=${activeTab}`);
            const data = await response.json();
            if (response.ok) {
                setPreRegUsers(data.users);
            }
        } catch (err) {
            console.error('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Fire and forget - don't wait for the API call
            fetch('/api/auth/logout', { method: 'POST' }).catch(console.error);
            // Add a small delay for visual feedback
            await new Promise(resolve => setTimeout(resolve, 500));
            router.push('/auth/login');
        } catch (err) {
            console.error('Logout error:', err);
            router.push('/auth/login');
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/admin/pre-registration/student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentForm),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to add student');
                return;
            }

            setSuccess('Student pre-registered successfully!');
            setStudentForm({ name: '', email: '', department: '', year: '', registrationId: '' });
            fetchPreRegUsers();
        } catch (err) {
            setError('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/admin/pre-registration/teacher', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teacherForm),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to add teacher');
                return;
            }

            setSuccess('Teacher pre-registered successfully!');
            setTeacherForm({ name: '', email: '', department: '', subject: '', yearsTaught: [] });
            fetchPreRegUsers();
        } catch (err) {
            setError('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this pre-registration?')) return;

        try {
            const response = await fetch(`/api/admin/pre-registration/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchPreRegUsers();
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to delete');
            }
        } catch (err) {
            alert('An error occurred');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.csv')) {
                alert('Please select a CSV file');
                return;
            }
            setUploadFile(file);
        }
    };

    const handleCSVUpload = async () => {
        if (!uploadFile) return;

        setIsUploading(true);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('role', activeTab);

            const response = await fetch('/api/admin/pre-registration/bulk-upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setUploadResult(data);
                fetchPreRegUsers();
                setUploadFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (err) {
            alert('An error occurred during upload');
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = (role: 'STUDENT' | 'TEACHER') => {
        let csvContent = '';
        if (role === 'STUDENT') {
            csvContent = 'name,email,department,year,registrationId\n';
            csvContent += 'John Doe,john@university.edu,Computer Science & Engineering,1,CS2024001\n';
            csvContent += 'Jane Smith,jane@university.edu,Electrical,2,EE2023045\n';
        } else {
            csvContent = 'name,email,department,subject,yearsTaught\n';
            csvContent += 'Dr. Smith,smith@university.edu,Computer Science & Engineering,Data Structures,"1,2,3"\n';
            csvContent += 'Prof. Johnson,johnson@university.edu,Electrical,Circuit Theory,"2,3,4"\n';
        }

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${role.toLowerCase()}_template.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredUsers = preRegUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'pending' && !user.isRegistered) ||
            (statusFilter === 'registered' && user.isRegistered);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <span className="p-2 bg-blue-600 rounded-xl text-white">
                                <UserPlus className="w-6 h-6" />
                            </span>
                            Admin Pre-Registration
                        </h1>
                        <p className="text-slate-500 mt-1">Manage verified students and teachers authorized to join the platform.</p>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <Button
                            onClick={() => setShowUploadModal(true)}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Import CSV
                        </Button>

                        <Button
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 relative overflow-hidden disabled:opacity-80 disabled:cursor-not-allowed"
                        >
                            {isLoggingOut && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-red-700 flex items-center justify-center gap-2"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    <span>Logging out...</span>
                                </motion.div>
                            )}
                            <LogOut className={cn("w-4 h-4", isLoggingOut && "opacity-0")} />
                            <span className={cn(isLoggingOut && "opacity-0")}>Logout</span>
                        </Button>

                        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <button
                                onClick={() => setActiveTab('STUDENT')}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'STUDENT' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <Users className="w-4 h-4" />
                                Students
                            </button>
                            <button
                                onClick={() => setActiveTab('TEACHER')}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'TEACHER' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <BookOpen className="w-4 h-4" />
                                Teachers
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Add Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl sticky top-8">
                            <h2 className="text-xl font-black mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" />
                                Add {activeTab === 'STUDENT' ? 'Student' : 'Teacher'}
                            </h2>

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </div>
                            )}

                            {success && (
                                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> {success}
                                </div>
                            )}

                            <form onSubmit={activeTab === 'STUDENT' ? handleAddStudent : handleAddTeacher} className="space-y-4">
                                <Input
                                    label="Full Name"
                                    placeholder="Enter full name"
                                    value={activeTab === 'STUDENT' ? studentForm.name : teacherForm.name}
                                    onChange={(e) => activeTab === 'STUDENT' ? setStudentForm({ ...studentForm, name: e.target.value }) : setTeacherForm({ ...teacherForm, name: e.target.value })}
                                    required
                                />

                                <Input
                                    label="University Email"
                                    type="email"
                                    placeholder="email@university.edu"
                                    value={activeTab === 'STUDENT' ? studentForm.email : teacherForm.email}
                                    onChange={(e) => activeTab === 'STUDENT' ? setStudentForm({ ...studentForm, email: e.target.value }) : setTeacherForm({ ...teacherForm, email: e.target.value })}
                                    required
                                />

                                <Select
                                    label="Department"
                                    value={activeTab === 'STUDENT' ? studentForm.department : teacherForm.department}
                                    onChange={(e) => activeTab === 'STUDENT' ? setStudentForm({ ...studentForm, department: e.target.value }) : setTeacherForm({ ...teacherForm, department: e.target.value })}
                                    required
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </Select>

                                {activeTab === 'STUDENT' ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Select
                                                label="Current Year"
                                                value={studentForm.year}
                                                onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })}
                                                required
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </Select>
                                            <Input
                                                label="Reg ID"
                                                placeholder="e.g. CS2024"
                                                value={studentForm.registrationId}
                                                onChange={(e) => setStudentForm({ ...studentForm, registrationId: e.target.value })}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Input
                                            label="Subject Specialized"
                                            placeholder="e.g. Data Structures"
                                            value={teacherForm.subject}
                                            onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                                            required
                                        />
                                        <div className="space-y-2">
                                            <Label>Teaching Years</Label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[1, 2, 3, 4].map(y => (
                                                    <button
                                                        key={y}
                                                        type="button"
                                                        onClick={() => {
                                                            const newVal = teacherForm.yearsTaught.includes(y)
                                                                ? teacherForm.yearsTaught.filter(item => item !== y)
                                                                : [...teacherForm.yearsTaught, y];
                                                            setTeacherForm({ ...teacherForm, yearsTaught: newVal });
                                                        }}
                                                        className={`py-2 rounded-lg font-bold text-xs border-2 transition-all ${teacherForm.yearsTaught.includes(y) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}
                                                    >
                                                        Yr {y}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg border-b-4 border-blue-800 text-center"
                                >
                                    {isSubmitting ? <LoadingSpinner size="sm" /> : `Authorize ${activeTab === 'STUDENT' ? 'Student' : 'Teacher'}`}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Data List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
                                <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                {['all', 'pending', 'registered'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setStatusFilter(f as any)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${statusFilter === f ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                            {isLoading ? (
                                <div className="p-20 flex flex-col items-center gap-4">
                                    <LoadingSpinner size="lg" />
                                    <p className="text-slate-500 animate-pulse">Fetching records...</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="p-20 text-center">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No records found</h3>
                                    <p className="text-slate-500">Start by adding a new {activeTab.toLowerCase()} to the database.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                                <th className="px-6 py-4 text-xs uppercase font-black tracking-widest text-slate-400">Identity</th>
                                                <th className="px-6 py-4 text-xs uppercase font-black tracking-widest text-slate-400">Department</th>
                                                <th className="px-6 py-4 text-xs uppercase font-black tracking-widest text-slate-400">Specifics</th>
                                                <th className="px-6 py-4 text-xs uppercase font-black tracking-widest text-slate-400">Status</th>
                                                <th className="px-6 py-4 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {filteredUsers.map((user) => (
                                                <motion.tr
                                                    key={user._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                <Mail className="w-3 h-3" /> {user.email}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                                            {user.department}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.role === 'STUDENT' ? (
                                                            <div className="text-sm space-y-1">
                                                                <p className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                                    <Calendar className="w-3.5 h-3.5" /> Yr {user.year}
                                                                </p>
                                                                <p className="text-xs text-slate-500">ID: {user.registrationId || 'N/A'}</p>
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm space-y-1">
                                                                <p className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 capitalize">
                                                                    <BookOpen className="w-3.5 h-3.5" /> {user.subject}
                                                                </p>
                                                                <p className="text-xs text-slate-500 italic">Years: {user.yearsTaught?.join(', ') || 'N/A'}</p>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.isRegistered ? (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                                                <CheckCircle className="w-3 h-3" /> Registered
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                                                                <Clock className="w-3 h-3" /> Pending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {!user.isRegistered && (
                                                            <button
                                                                onClick={() => handleDelete(user._id)}
                                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                                title="Revoke Authorization"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* CSV Upload Modal */}
                <AnimatePresence>
                    {showUploadModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            >
                                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <Upload className="w-6 h-6 text-emerald-600" />
                                        Import {activeTab === 'STUDENT' ? 'Students' : 'Teachers'} from CSV
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowUploadModal(false);
                                            setUploadFile(null);
                                            setUploadResult(null);
                                        }}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Template Download */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                                        <div className="flex items-start gap-3">
                                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                                            <div className="flex-1">
                                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Need a template?</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                                    Download the CSV template for {activeTab === 'STUDENT' ? 'students' : 'teachers'} to see the correct format.
                                                </p>
                                                <button
                                                    onClick={() => downloadTemplate(activeTab)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-sm"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download Template
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* File Upload */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Upload CSV File
                                        </label>
                                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="csv-upload"
                                            />
                                            <label htmlFor="csv-upload" className="cursor-pointer">
                                                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                                <p className="text-slate-700 dark:text-slate-300 font-bold mb-1">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-sm text-slate-500">CSV files only</p>
                                            </label>
                                        </div>

                                        {uploadFile && (
                                            <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{uploadFile.name}</p>
                                                        <p className="text-sm text-slate-500">{(uploadFile.size / 1024).toFixed(2)} KB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setUploadFile(null);
                                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                                    }}
                                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Results */}
                                    {uploadResult && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Upload Results</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                                        <p className="text-sm text-slate-500 mb-1">Total Rows</p>
                                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{uploadResult.totalRows}</p>
                                                    </div>
                                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Successful</p>
                                                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{uploadResult.successCount}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {uploadResult.errors && uploadResult.errors.length > 0 && (
                                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                                                    <h4 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" />
                                                        Errors ({uploadResult.errors.length})
                                                    </h4>
                                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                                        {uploadResult.errors.map((err: any, idx: number) => (
                                                            <div key={idx} className="text-sm bg-white dark:bg-slate-900 p-3 rounded-lg">
                                                                <p className="font-bold text-slate-900 dark:text-white">Row {err.row}: {err.email}</p>
                                                                <p className="text-red-600 dark:text-red-400">{err.error}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Upload Button */}
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleCSVUpload}
                                            disabled={!uploadFile || isUploading}
                                            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <LoadingSpinner size="sm" />
                                                    <span className="ml-2">Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-5 h-5 mr-2" />
                                                    Upload CSV
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setShowUploadModal(false);
                                                setUploadFile(null);
                                                setUploadResult(null);
                                            }}
                                            className="px-6 py-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-2xl"
                                        >
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
