
'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    CheckCircle2,
    AlertCircle,
    X,
    Loader2,
    BookOpen,
    ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const categories = [
    { id: 'syllabus', label: 'Syllabus/Curriculum', icon: BookOpen },
    { id: 'attendance', label: 'Attendance Policies', icon: CheckCircle2 },
    { id: 'exams', label: 'Exam Information', icon: FileText },
    { id: 'cgpa', label: 'Grading/CGPA', icon: ShieldCheck },
    { id: 'scholarship', label: 'Scholarships', icon: AlertCircle },
    { id: 'general', label: 'General Knowledge', icon: BookOpen },
];

export default function UploadPDFPage() {
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState('general');
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
        type: null,
        message: '',
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setStatus({ type: null, message: '' });
        } else {
            setFile(null);
            if (selectedFile) {
                setStatus({ type: 'error', message: 'Please select a valid PDF file.' });
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setStatus({ type: null, message: '' });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);

        try {
            const response = await fetch('/api/admin/upload-pdf', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: 'Knowledge base updated successfully! The AI can now use this information.' });
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                setStatus({ type: 'error', message: result.error || 'Failed to upload PDF.' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setStatus({ type: null, message: '' });
    };

    return (
        <div className="max-w-5xl mx-auto py-6 px-4 sm:py-10 sm:px-6 lg:py-12 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="mb-8 text-center lg:text-left"
            >
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    Update Knowledge Base
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                    Upload PDF documents to enhance the AI chatbot with the latest college information. Select a category and start embedding knowledge seamlessly.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* File Selection Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <div
                        className={cn(
                            "relative border-2 border-dashed rounded-3xl p-6 sm:p-8 lg:p-12 transition-all duration-300 shadow-lg",
                            "flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px] lg:min-h-[360px]",
                            file
                                ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-900/10"
                                : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md hover:shadow-xl"
                        )}
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            className="hidden"
                            id="pdf-upload"
                        />

                        {file ? (
                            <div className="text-center w-full space-y-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                                    <FileText className="text-white w-8 h-8 sm:w-10 sm:h-10" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate max-w-md mx-auto">
                                    {file.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={clearFile}
                                        className="rounded-full px-6 py-2 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Remove
                                    </Button>
                                    <Button
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                        className="rounded-full px-8 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg"
                                    >
                                        {isUploading ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Embedding...</>
                                        ) : (
                                            <><Upload className="w-4 h-4 mr-2" /> Upload Now</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <label
                                htmlFor="pdf-upload"
                                className="text-center cursor-pointer group w-full h-full flex flex-col items-center justify-center space-y-4"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-950/30 transition-all duration-300 shadow-md">
                                    <Upload className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 w-8 h-8 sm:w-10 sm:h-10" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                                    Drag & Drop PDF Here
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    or click to browse your files
                                </p>
                                <p className="text-xs text-slate-400 pt-2">
                                    Supported: PDF only • Max size: 10MB
                                </p>
                            </label>
                        )}
                    </div>

                    <AnimatePresence>
                        {status.type && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.4 }}
                                className={cn(
                                    "mt-6 p-4 sm:p-5 rounded-2xl flex items-start gap-3 border shadow-sm",
                                    status.type === 'success'
                                        ? "bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300"
                                        : "bg-red-50/80 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300"
                                )}
                            >
                                {status.type === 'success' ? (
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                )}
                                <p className="text-sm sm:text-base font-medium">{status.message}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Category Selection Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            Choose Category
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left shadow-sm",
                                        category === cat.id
                                            ? "bg-indigo-600 text-white shadow-md"
                                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md"
                                    )}
                                >
                                    <cat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", category === cat.id ? "text-white" : "text-indigo-600 dark:text-indigo-400")} />
                                    <span className="font-medium text-sm sm:text-base">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <h4 className="text-base sm:text-lg font-bold mb-3 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5" />
                            AI Enhancement Details
                        </h4>
                        <p className="text-sm text-indigo-100 leading-relaxed mb-4">
                            Your PDF uploads create intelligent vector embeddings stored in Pinecone, empowering the chatbot with accurate, context-rich responses for students.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-200 bg-white/10 rounded-lg p-2 justify-center">
                            <span>Vector DB: Pinecone</span>
                            <span className="opacity-50">|</span>
                            <span>Embed Model: OpenAI</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
