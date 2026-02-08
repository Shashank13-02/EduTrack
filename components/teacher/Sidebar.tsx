'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    MessageSquare,
    FileText,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    ShieldCheck,
    Calendar,
    ClipboardList,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface NavItem {
    title: string;
    href: string;
    icon: any;
}

const navItems: NavItem[] = [
    { title: 'Analytics Dashboard', href: '/teacher/dashboard', icon: BarChart3 },
    { title: 'Student Monitoring', href: '/teacher/students', icon: Users },
    { title: 'Attendance', href: '/teacher/attendance', icon: Calendar },
    { title: 'Marks Management', href: '/teacher/marks', icon: ClipboardList },
    { title: 'Risk Alerts', href: '/teacher/risk', icon: AlertTriangle },
    { title: 'Knowledge Base', href: '/teacher/upload', icon: FileText },
];

interface TeacherSidebarProps {
    isCollapsed: boolean;
    onToggle: (collapsed: boolean) => void;
}

export function TeacherSidebar({ isCollapsed, onToggle }: TeacherSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            // Fire and forget - don't wait for the API call
            fetch('/api/auth/logout', { method: 'POST' }).catch(console.error);
            // Add a small delay for visual feedback
            await new Promise(resolve => setTimeout(resolve, 500));
            router.push('/auth/login');
        } catch (error) {
            console.error('Logout failed:', error);
            router.push('/auth/login');
        }
    };

    if (!mounted) return null;

    const tabParam = searchParams?.get('tab');

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? '80px' : '280px' }}
            className={cn(
                "fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300",
                "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 shadow-2xl"
            )}
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <GraduationCap className="text-white w-6 h-6" />
                            </div>
                            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Faculty
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isCollapsed && (
                    <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <GraduationCap className="text-white w-6 h-6" />
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={cn(
                                    "relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden",
                                    isActive
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 flex-shrink-0 transition-colors",
                                    isActive ? "text-white" : "group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                                )} />

                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="font-medium whitespace-nowrap"
                                        >
                                            {item.title}
                                        </motion.span>
                                    )}
                                </AnimatePresence>

                                {isActive && !isCollapsed && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute right-0 w-1 h-6 bg-white rounded-l-full"
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Admin Privilege (Mock for now) */}
            {!isCollapsed && (
                <div className="px-6 mb-4">
                    <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wider">Faculty Status</span>
                        </div>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Verified Academic Member</p>
                    </div>
                </div>
            )}

            {/* Footer Controls */}
            <div className="p-4 space-y-3">
                <Button
                    variant="ghost"
                    onClick={() => onToggle(!isCollapsed)}
                    className="w-full justify-center text-slate-500 hover:text-indigo-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl py-6"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : (
                        <div className="flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5" />
                            <span>Collapse View</span>
                        </div>
                    )}
                </Button>

                <motion.button
                    whileTap={!isLoggingOut ? { scale: 0.95 } : {}}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={cn(
                        "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                        isLoggingOut
                            ? "bg-gradient-to-r from-red-600 to-pink-700 cursor-not-allowed"
                            : "bg-gradient-to-r from-red-500 to-pink-600 hover:shadow-red-500/30",
                        "text-white shadow-lg shadow-red-500/20",
                        isCollapsed && "justify-center"
                    )}
                >
                    {isLoggingOut && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-red-700 to-pink-800 flex items-center justify-center gap-3"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                            {!isCollapsed && (
                                <span className="font-semibold">Logging out...</span>
                            )}
                        </motion.div>
                    )}
                    <LogOut className={cn("w-5 h-5 flex-shrink-0", isLoggingOut && "opacity-0")} />
                    {!isCollapsed && (
                        <span className={cn("font-semibold", isLoggingOut && "opacity-0")}>Sign Out</span>
                    )}
                </motion.button>
            </div>
        </motion.div>
    );
}
