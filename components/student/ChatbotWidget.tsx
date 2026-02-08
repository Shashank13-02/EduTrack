'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Loader2,
    Trash2,
    AlertCircle,
    Sparkles,
    MessageSquare,
    Plus,
    History,
    ChevronLeft,
} from 'lucide-react';

import { ChatMessageComponent } from './ChatMessage';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import {
    format,
    isToday,
    isYesterday,
    isWithinInterval,
    subDays,
    startOfDay,
} from 'date-fns';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    sources?: Array<{ title?: string; category?: string }>;
    createdAt?: Date | string;
}

interface ChatSession {
    id: string;
    title: string;
    lastMessageAt: string | Date;
    createdAt: string | Date;
}

const SIDEBAR_WIDTH = 300;

export function ChatbotWidget() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const [sessionsLoading, setSessionsLoading] = useState(true);

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // ----------------------------
    // Responsive Detection
    // ----------------------------
    useEffect(() => {
        const check = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // On mobile, start closed. On desktop, start open.
            setSidebarOpen(!mobile);
        };

        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // ----------------------------
    // Auto-resize textarea
    // ----------------------------
    useEffect(() => {
        if (!inputRef.current) return;
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }, [input]);

    // ----------------------------
    // Scroll to bottom
    // ----------------------------
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ----------------------------
    // Initial Load
    // ----------------------------
    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            await Promise.all([loadSessions(), loadLatestSession()]);
        } catch (err) {
            console.error('Error loading initial data:', err);
        } finally {
            setInitialLoading(false);
        }
    };

    const loadSessions = async () => {
        try {
            const response = await fetch('/api/student/chatbot/history?listSessions=true');
            const data = await response.json();
            if (response.ok && data.success) {
                setSessions(data.sessions);
            }
        } catch (err) {
            console.error('Error loading sessions:', err);
        } finally {
            setSessionsLoading(false);
        }
    };

    const loadLatestSession = async () => {
        try {
            const response = await fetch('/api/student/chatbot/history');
            const data = await response.json();
            if (response.ok && data.success) {
                setMessages(data.messages || []);
                setCurrentSessionId(data.sessionId || null);
            }
        } catch (err) {
            console.error('Error loading latest session:', err);
        }
    };

    const loadSessionMessages = async (sessionId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/student/chatbot/history?sessionId=${sessionId}`);
            const data = await response.json();
            if (response.ok && data.success) {
                setMessages(data.messages);
                setCurrentSessionId(sessionId);
                if (isMobile) setSidebarOpen(false);
            } else {
                throw new Error(data.error || 'Failed to load session');
            }
        } catch (err: any) {
            console.error('Error loading session messages:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = useCallback(() => {
        setMessages([]);
        setCurrentSessionId(null);
        setError(null);
        if (isMobile) setSidebarOpen(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, [isMobile]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput || loading) return;

        const userMessage: Message = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: trimmedInput,
            createdAt: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/student/chatbot/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmedInput,
                    sessionId: currentSessionId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            if (data.success && data.message) {
                setMessages((prev) => [...prev, data.message]);

                if (data.isNewSession) {
                    setCurrentSessionId(data.sessionId);
                    loadSessions();
                }
            }
        } catch (err: any) {
            console.error('Error sending message:', err);
            setError(err.message || 'Failed to send message. Please try again.');

            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: "I'm sorry, I encountered an error processing your request. Please try again.",
                createdAt: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
            inputRef.current?.focus();
        }
    };

    const clearHistory = async () => {
        if (!confirm('Are you sure you want to clear your entire chat history?')) return;

        try {
            const response = await fetch('/api/student/chatbot/clear', { method: 'DELETE' });
            const data = await response.json();

            if (response.ok && data.success) {
                setMessages([]);
                setSessions([]);
                setCurrentSessionId(null);
                setError(null);
            } else {
                throw new Error(data.error || 'Failed to clear history');
            }
        } catch (err: any) {
            console.error('Error clearing history:', err);
            setError(err.message || 'Failed to clear history');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);

    // ----------------------------
    // Group sessions by date
    // ----------------------------
    const groupedSessions = useMemo(() => {
        const groups: { [key: string]: ChatSession[] } = {
            Today: [],
            Yesterday: [],
            'Previous 7 Days': [],
            'Previous 30 Days': [],
            Older: [],
        };

        const now = new Date();
        const yesterday = startOfDay(subDays(now, 1));
        const sevenDaysAgo = startOfDay(subDays(now, 7));
        const thirtyDaysAgo = startOfDay(subDays(now, 30));

        sessions.forEach((session) => {
            const date = new Date(session.lastMessageAt);
            if (isToday(date)) groups.Today.push(session);
            else if (isYesterday(date)) groups.Yesterday.push(session);
            else if (isWithinInterval(date, { start: sevenDaysAgo, end: yesterday }))
                groups['Previous 7 Days'].push(session);
            else if (isWithinInterval(date, { start: thirtyDaysAgo, end: sevenDaysAgo }))
                groups['Previous 30 Days'].push(session);
            else groups.Older.push(session);
        });

        return Object.entries(groups).filter(([_, items]) => items.length > 0);
    }, [sessions]);

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="relative flex h-full bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden">
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {sidebarOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: sidebarOpen ? (isMobile ? 0 : SIDEBAR_WIDTH) : 0,
                    x: isMobile ? (sidebarOpen ? 0 : -280) : 0,
                    opacity: 1,
                }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                style={{ width: isMobile ? 280 : (sidebarOpen ? SIDEBAR_WIDTH : 0) }}
                className={cn(
                    'flex flex-col bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 h-full z-40 overflow-hidden shadow-2xl md:shadow-lg',
                    isMobile ? 'fixed left-0 top-0 bottom-0' : 'relative'
                )}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between flex-shrink-0 min-w-[280px]">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat History</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(false)}
                        className="text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </div>

                {/* New Chat Button */}
                <div className="p-4 flex-shrink-0 min-w-[280px]">
                    <Button
                        onClick={startNewChat}
                        className="w-full justify-start gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        New Chat
                    </Button>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 min-w-[280px]">
                    <div className="space-y-6">
                        {sessionsLoading ? (
                            <div className="flex justify-center py-6">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : (
                            groupedSessions.map(([group, items]) => (
                                <div key={group} className="space-y-2">
                                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 px-2 sticky top-0 bg-white dark:bg-slate-800 py-1 z-10">
                                        {group}
                                    </h3>
                                    <div className="space-y-2">
                                        {items.map((session) => (
                                            <button
                                                key={session.id}
                                                onClick={() => loadSessionMessages(session.id)}
                                                className={cn(
                                                    'w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 flex items-center gap-3 group',
                                                    currentSessionId === session.id
                                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                                                        : 'bg-gray-50 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800',
                                                    'hover:shadow-md'
                                                )}
                                            >
                                                <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                                                <span className="truncate flex-1">{session.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex-shrink-0 min-w-[280px]">
                    <Button
                        onClick={clearHistory}
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2 transition-colors"
                        disabled={sessions.length === 0}
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear History
                    </Button>
                </div>
            </motion.aside>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 shadow-sm z-20 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        {!sidebarOpen && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
                            >
                                <History className="w-5 h-5" />
                            </Button>
                        )}

                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md md:w-12 md:h-12 flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-white md:w-6 md:h-6" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white md:text-xl truncate">
                                AI Study Assistant
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {currentSessionId
                                    ? sessions.find((s) => s.id === currentSessionId)?.title || 'Active Discussion'
                                    : 'Ask me about academics'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0">
                    <div className="space-y-4 md:space-y-6">
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center min-h-full text-center px-4 md:px-8 py-8"
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-xl md:w-24 md:h-24">
                                    <Sparkles className="w-10 h-10 text-white md:w-12 md:h-12" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 md:text-2xl md:mb-4">
                                    Welcome to AI Study Assistant!
                                </h3>
                                <p className="text-base text-gray-600 dark:text-gray-300 max-w-md mb-6 md:text-lg">
                                    I can help you with questions about:
                                </p>
                                <ul className="text-base text-gray-600 dark:text-gray-300 space-y-3 md:text-lg md:space-y-4">
                                    <li className="flex items-center gap-3 justify-center">
                                        <span className="text-blue-500">📚</span> First year syllabus
                                    </li>
                                    <li className="flex items-center gap-3 justify-center">
                                        <span className="text-blue-500">📅</span> Attendance policies
                                    </li>
                                    <li className="flex items-center gap-3 justify-center">
                                        <span className="text-blue-500">📝</span> Exam rules and regulations
                                    </li>
                                    <li className="flex items-center gap-3 justify-center">
                                        <span className="text-blue-500">🎓</span> CGPA calculation
                                    </li>
                                    <li className="flex items-center gap-3 justify-center">
                                        <span className="text-blue-500">💰</span> Scholarship information
                                    </li>
                                </ul>
                            </motion.div>
                        ) : (
                            <>
                                {messages.map((msg) => (
                                    <ChatMessageComponent key={msg.id} {...msg} />
                                ))}

                                {loading && (
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md md:w-10 md:h-10">
                                            <Sparkles className="w-4 h-4 text-white md:w-5 md:h-5" />
                                        </div>
                                        <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700/50 shadow-md md:px-5 md:py-4">
                                            <div className="flex gap-2">
                                                <span
                                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: '0ms' }}
                                                />
                                                <span
                                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: '200ms' }}
                                                />
                                                <span
                                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                    style={{ animationDelay: '400ms' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mx-4 mb-3 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl flex items-start gap-3 shadow-md md:mx-6 md:mb-4 flex-shrink-0"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700 dark:text-red-300 md:text-base">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="p-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-gray-200 dark:border-slate-700 shadow-md md:p-6 flex-shrink-0">
                    <form onSubmit={sendMessage} className="flex gap-3 md:gap-4">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about syllabus, attendance, exams, CGPA, scholarships..."
                            className={cn(
                                'flex-1 px-4 py-3 rounded-xl resize-none overflow-y-auto',
                                'bg-gray-100/80 dark:bg-slate-700/80',
                                'text-gray-900 dark:text-white',
                                'placeholder-gray-500 dark:placeholder-gray-400',
                                'border border-gray-200/50 dark:border-slate-600/50',
                                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                                'transition-all duration-300 shadow-sm',
                                'max-h-[150px] text-sm md:text-base md:px-5 md:py-4'
                            )}
                            rows={1}
                            disabled={loading}
                        />

                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className={cn(
                                'px-4 py-3 rounded-xl font-medium transition-all duration-300',
                                'bg-gradient-to-r from-blue-600 to-indigo-700',
                                'hover:from-blue-700 hover:to-indigo-800',
                                'text-white shadow-md hover:shadow-lg',
                                'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
                                'flex items-center gap-2 md:px-6 md:py-4 flex-shrink-0'
                            )}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin md:w-6 md:h-6" />
                            ) : (
                                <Send className="w-5 h-5 md:w-6 md:h-6" />
                            )}
                        </button>
                    </form>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center md:text-sm">
                        Press Enter to send • Shift+Enter for new line
                    </p>
                </div>
            </div>
        </div>
    );
}
