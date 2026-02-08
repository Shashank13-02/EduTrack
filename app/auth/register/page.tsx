'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, BookOpen, Calendar, CheckCircle2, ArrowRight, Sparkles, Building2, ChevronRight, ChevronLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { FloatingOrbs } from '@/components/ui/FloatingOrbs';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Role, 2: Credentials, 3: OTP, 4: Completion
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        otp: '',
        role: 'STUDENT' as 'STUDENT' | 'TEACHER',
    });

    // Data returned from university database after OTP verification
    const [universityData, setUniversityData] = useState<any>(null);

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendOTP = async () => {
        if (!formData.email || !formData.password) {
            setError('Please enter your email and set a password');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to send verification code');
                setIsLoading(false);
                return;
            }

            setStep(3);
            setCountdown(60);
            setIsLoading(false);
        } catch (err) {
            setError('Network error. Please try again.');
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (formData.otp.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    otp: formData.otp
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Invalid or expired code');
                setIsLoading(false);
                return;
            }

            setUniversityData(data.userData);
            setStep(4);
            setIsLoading(false);
        } catch (err) {
            setError('Network error. Please try again.');
            setIsLoading(false);
        }
    };

    const handleSubmitRegistration = async () => {
        if (!formData.email || !formData.password || !formData.otp) {
            setError('Missing required information (Email, Password, or OTP). Please go back and ensure all steps are complete.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            console.log('Sending registration request for:', formData.email);
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    otp: formData.otp
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Registration failed');
                setIsLoading(false);
                return;
            }

            setSuccessMessage('Welcome to EduTrack! Your account has been verified and created.');
            setIsLoading(false);
        } catch (err) {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    if (successMessage) {
        return (
            <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-6">
                <ParticleBackground />
                <FloatingOrbs />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg relative z-10"
                >
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-8"
                        >
                            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                        </motion.div>

                        <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Account Verified!</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            {successMessage}
                        </p>

                        <Button
                            onClick={() => router.push(universityData?.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard')}
                            className="w-full py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <span>Go to Dashboard</span>
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
            <ParticleBackground />
            <FloatingOrbs />

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-5xl grid md:grid-cols-12 gap-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    {/* Left Side: Branding & Progress */}
                    <div className="hidden md:flex md:col-span-4 flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-purple-600 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="relative z-10">
                            <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <GraduationCap className="text-white w-6 h-6" />
                                </div>
                                <span className="font-bold text-2xl">EduTrack</span>
                            </Link>

                            <h1 className="text-3xl font-black mb-6 leading-tight">
                                University<br />Identity<br />Verification
                            </h1>

                            <div className="space-y-8 mt-12">
                                {[
                                    { s: 1, t: "Role Selection" },
                                    { s: 2, t: "Account Access" },
                                    { s: 3, t: "Email Verification" },
                                    { s: 4, t: "Final Step" }
                                ].map((item) => (
                                    <div key={item.s} className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step >= item.s ? 'bg-white text-blue-600 border-white' : 'border-white/30 text-white/30'}`}>
                                            {step > item.s ? <CheckCircle2 className="w-5 h-5" /> : item.s}
                                        </div>
                                        <span className={`font-semibold ${step >= item.s ? 'text-white' : 'text-white/30'}`}>
                                            {item.t}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 pt-12 border-t border-white/20 text-sm text-white/70">
                            Already have an account?
                            <Link href="/auth/login" className="block mt-1 font-bold text-white hover:underline">Sign In Instead</Link>
                        </div>
                    </div>

                    {/* Right Side: Step-based Form */}
                    <div className="md:col-span-8 p-8 md:p-12 bg-white dark:bg-slate-900">
                        <div className="h-full flex flex-col">
                            <div className="mb-8">
                                <div className="md:hidden flex justify-center mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                        <GraduationCap className="text-white w-6 h-6" />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Registration</h2>
                                <p className="text-slate-500 dark:text-slate-400">Step {step} of 4</p>
                            </div>

                            <AnimatePresence mode="wait">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium flex items-center gap-3"
                                    >
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                {/* Step 1: Role Selection */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <Label className="text-lg font-bold text-slate-800 dark:text-slate-200">Are you a student or teacher?</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { id: 'STUDENT', title: 'Student', icon: GraduationCap },
                                                { id: 'TEACHER', title: 'Teacher', icon: BookOpen }
                                            ].map(role => (
                                                <button
                                                    key={role.id}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, role: role.id as any })}
                                                    className={`p-6 rounded-2xl border-2 text-left transition-all group ${formData.role === role.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/50'}`}
                                                >
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${formData.role === role.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-primary'}`}>
                                                        <role.icon className="w-6 h-6" />
                                                    </div>
                                                    <h3 className={`text-lg font-bold ${formData.role === role.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        {role.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 mt-1">Verify university records as a {role.title.toLowerCase()}.</p>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="pt-6">
                                            <Button type="button" onClick={() => setStep(2)} className="w-full py-6 rounded-2xl text-lg font-bold">
                                                Continue
                                                <ChevronRight className="w-5 h-5 ml-2" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Account Details */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-5"
                                    >
                                        <div className="space-y-4">
                                            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                                                Note: Use the email address registered with the university.
                                            </p>

                                            <div className="relative group">
                                                <Label htmlFor="email">University Email</Label>
                                                <div className="relative mt-2">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="your.email@university.edu"
                                                        value={formData.email}
                                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                        required
                                                        className="pl-12 py-3.5 rounded-xl border-2 bg-slate-50/50 dark:bg-slate-800/50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative group">
                                                <Label htmlFor="password">Set Your Password</Label>
                                                <div className="relative mt-2">
                                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        placeholder="Create a strong password"
                                                        value={formData.password}
                                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                        required
                                                        minLength={6}
                                                        className="pl-12 py-3.5 rounded-xl border-2 bg-slate-50/50 dark:bg-slate-800/50"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-6">
                                            <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1 py-6 rounded-2xl font-bold">
                                                <ChevronLeft className="w-5 h-5 mr-2" />
                                                Back
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={handleSendOTP}
                                                disabled={isLoading}
                                                className="flex-[2] py-6 rounded-2xl font-bold"
                                            >
                                                {isLoading ? <LoadingSpinner size="sm" /> : "Verify Identity"}
                                                {!isLoading && <ShieldCheck className="w-5 h-5 ml-2" />}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: OTP Verification */}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="text-center space-y-2">
                                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Mail className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Check Your Inbox</h3>
                                            <p className="text-slate-500 text-sm">We've sent a 6-digit verification code to<br /><span className="font-bold text-slate-700 dark:text-slate-300">{formData.email}</span></p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex justify-center">
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    placeholder="000000"
                                                    value={formData.otp}
                                                    onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                                                    className="w-48 text-center text-3xl font-black tracking-widest py-4 border-b-4 border-primary bg-transparent focus:outline-none focus:border-blue-700 dark:text-white"
                                                />
                                            </div>

                                            <div className="text-center">
                                                {countdown > 0 ? (
                                                    <p className="text-xs text-slate-500">Resend code in <span className="font-bold">{countdown}s</span></p>
                                                ) : (
                                                    <button
                                                        onClick={handleSendOTP}
                                                        className="text-sm font-bold text-primary hover:underline"
                                                    >
                                                        Resend Code
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-6">
                                            <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1 py-6 rounded-2xl font-bold">
                                                Change Email
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={handleVerifyOTP}
                                                disabled={isLoading || formData.otp.length !== 6}
                                                className="flex-[2] py-6 rounded-2xl font-bold"
                                            >
                                                {isLoading ? <LoadingSpinner size="sm" /> : "Verify Code"}
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 4: Final Confirmation */}
                                {step === 4 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-4">
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <ShieldCheck className="text-emerald-500 w-5 h-5" />
                                                University Record Found
                                            </h3>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Full Name</p>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{universityData?.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Role</p>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{universityData?.role}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Department</p>
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{universityData?.department}</p>
                                                </div>
                                                {universityData?.role === 'STUDENT' ? (
                                                    <div>
                                                        <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Reg ID / Year</p>
                                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{universityData?.registrationId || 'N/A'} (Year {universityData?.year})</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Core Subject</p>
                                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{universityData?.subject}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-500 text-center italic">
                                            By clicking below, your account will be linked to this university profile.
                                        </p>

                                        <div className="pt-4">
                                            <GlowButton
                                                onClick={handleSubmitRegistration}
                                                disabled={isLoading}
                                                className="w-full py-6 rounded-2xl text-lg font-bold"
                                            >
                                                {isLoading ? (
                                                    <LoadingSpinner size="sm" />
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-5 h-5 mr-2" />
                                                        Complete Signup
                                                    </>
                                                )}
                                            </GlowButton>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
