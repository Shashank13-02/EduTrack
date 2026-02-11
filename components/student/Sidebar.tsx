'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    User,
    Calendar,
    Route,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Brain,
    GraduationCap,
    Bell,
    FileText,
    MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard' },
    { title: 'Profile', icon: User, href: '/student/profile' },
    { title: 'Attendance', icon: Calendar, href: '/student/attendance' },
    { title: 'Learning Path', icon: Brain, href: '/student/learning-path' },
    { title: 'AI Assistant', icon: MessageCircle, href: '/student/chatbot' },
    { title: 'Career Roadmap', icon: Route, href: '/student/roadmap' },
    { title: 'Reports & Updates', icon: FileText, href: '/student/reports', badge: true },
];

export function StudentSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    // Fetch unread reports count
    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const fetchUnreadCount = async () => {
            try {
                const response = await fetch('/api/student/notifications', { signal });
                if (!response.ok) return;

                const result = await response.json();
                const aiReports = result.notifications.filter(
                    (n: any) => n.type === 'AI_REPORT' && !n.isRead
                );
                setUnreadCount(aiReports.length);
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') return;
                console.error('Error fetching unread count:', error);
            }
        };

        fetchUnreadCount();
        // Refresh count every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => {
            controller.abort();
            clearInterval(interval);
        };
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
            console.error('Logout error:', error);
            router.push('/auth/login');
        }
    };


    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            className={cn(
                "relative bg-white",
                "dark:from-slate-900 dark:via-slate-900 dark:to-slate-800",
                "border-r border-gray-200 dark:border-slate-700 z-50 flex flex-col",
                "shadow-[0_0_30px_rgba(59,130,246,0.1)] dark:shadow-[0_0_30px_rgba(99,102,241,0.15)]",
                "h-full overflow-hidden"
            )}
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3 border-b border-gray-200 dark:border-slate-700">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                    <GraduationCap className="w-6 h-6 text-white" />
                </div>
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    >
                        EduTrack
                    </motion.span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const showBadge = item.badge && unreadCount > 0;

                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:text-gray-900 dark:hover:text-white"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive
                                        ? "text-white"
                                        : "text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                )} />
                                {!isCollapsed && (
                                    <span className="font-medium flex-1">{item.title}</span>
                                )}
                                {showBadge && !isCollapsed && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] text-center"
                                    >
                                        {unreadCount}
                                    </motion.span>
                                )}
                                {showBadge && isCollapsed && (
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                )}
                                {isActive && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute left-0 w-1 h-full bg-white rounded-r-full shadow-lg"
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
                <div className={cn("flex justify-center", isCollapsed ? "" : "w-full")}>
                    <ThemeToggle />
                </div>

                {/* Logout Button */}
                <motion.button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    whileHover={!isLoggingOut ? { scale: 1.02 } : {}}
                    whileTap={!isLoggingOut ? { scale: 0.98 } : {}}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden",
                        isLoggingOut
                            ? "bg-gradient-to-r from-red-600 to-pink-700 cursor-not-allowed"
                            : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700",
                        "text-white shadow-lg shadow-red-500/30 group"
                    )}
                >
                    {isLoggingOut && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-red-700 to-pink-800 flex items-center justify-center"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                        </motion.div>
                    )}
                    <LogOut className={cn("w-5 h-5", isLoggingOut && "opacity-0")} />
                    {!isCollapsed && (
                        <span className={cn("font-medium", isLoggingOut && "opacity-0")}>
                            {isLoggingOut ? "Logging out..." : "Logout"}
                        </span>
                    )}
                </motion.button>

                {/* Collapse Toggle */}
                <button
                    onClick={toggleSidebar}
                    className={cn(
                        "w-full flex items-center justify-center p-2 rounded-lg",
                        "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 dark:text-gray-400",
                        "transition-colors"
                    )}
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>
        </motion.aside>
    );
}
