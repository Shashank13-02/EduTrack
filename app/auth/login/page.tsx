'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { FloatingOrbs } from '@/components/ui/FloatingOrbs';
import { ParticleBackground } from '@/components/ui/ParticleBackground';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            // Safely parse response
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error('Failed to parse response:', text);
                setError(`Server Error: ${response.status} ${response.statusText}`);
                setIsLoading(false);
                return;
            }

            if (!response.ok) {
                setError(data.error || 'Login failed');
                setIsLoading(false);
                return;
            }

            // Redirect based on role
            const role = data.user?.role?.toUpperCase();
            if (role === 'ADMIN') {
                router.push('/admin/pre-registration');
            } else if (role === 'TEACHER') {
                router.push('/teacher/dashboard');
            } else {
                router.push('/student/dashboard');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 transition-colors duration-500 overflow-hidden">
            <FloatingOrbs />
            <ParticleBackground />

            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-4xl grid md:grid-cols-2 gap-8 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden"
                >
                    {/* Left Side - Branding */}
                    <GlassCard
                        className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden rounded-3xl
  bg-gradient-to-br from-white/60 via-blue-50/60 to-purple-50/60
  dark:from-slate-800/60 dark:via-slate-700/40 dark:to-slate-800/60
  backdrop-blur-xl"
                    >

                        {/* Soft glow blobs */}
                        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full 
        bg-blue-500/20 blur-3xl"></div>

                        <div className="absolute -bottom-28 -right-28 w-80 h-80 rounded-full 
        bg-purple-500/20 blur-3xl"></div>

                        {/* subtle grid overlay */}
                        <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(to right, rgba(0,0,0,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.6) 1px, transparent 1px)",
                                backgroundSize: "28px 28px",
                            }}
                        />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                    <GraduationCap className="text-white w-6 h-6" />
                                </div>

                                <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
                                    EduTrack
                                </span>
                            </div>

                            <h1 className="text-4xl font-black mb-6 text-slate-900 dark:text-white">
                                Welcome Back to <br />
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    The Future of Learning
                                </span>
                            </h1>

                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-12">
                                Access your personalized AI-powered learning dashboard and continue your journey.
                            </p>
                        </div>

                        <div className="relative z-10 grid grid-cols-2 gap-8">
                            <div>
                                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">12K+</div>
                                <div className="text-sm text-slate-600 dark:text-slate-300">Active Students</div>
                            </div>

                            <div>
                                <div className="text-3xl font-black text-purple-600 dark:text-purple-400">98%</div>
                                <div className="text-sm text-slate-600 dark:text-slate-300">Satisfaction Rate</div>
                            </div>
                        </div>
                    </GlassCard>



                    {/* Right Side - Login Form */}
                    <div className="p-8 md:p-12">
                        {/* Mobile Logo */}
                        <div className="md:hidden flex items-center justify-center gap-3 mb-8">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <GraduationCap className="text-white w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">EduTrack</span>
                        </div>

                        <h2 className="text-3xl font-black mb-3 text-slate-900 dark:text-white">Login</h2>
                        <p className="text-slate-500 dark:text-slate-300 mb-8">Access your personalized dashboard</p>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-300/20 dark:focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-300/20 dark:focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <GlowButton type="submit" disabled={isLoading} className="w-full text-lg py-3 rounded-2xl flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner className="w-5 h-5" />
                                        Logging in...
                                    </>
                                ) : (
                                    <>
                                        Login
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </GlowButton>
                        </form>

                        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-300">
                            Don't have an account?{' '}
                            <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                Register here
                            </Link>
                        </p>

                        <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Demo Credentials:</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">Teacher: teacher@edu.com / teacher123</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300">Student: core1@student.com / student123</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingSpinner className="absolute inset-0 m-auto w-12 h-12" />}>
            <LoginContent />
        </Suspense>
    );
}