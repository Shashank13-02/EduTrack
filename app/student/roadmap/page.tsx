'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cubicBezier } from "@popmotion/easing";
import {
    Route,
    Compass,
    BookOpen,
    ExternalLink,
    Sparkles,
    RefreshCw,
    Target,
    AlertCircle
} from 'lucide-react';
import { CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading, LoadingSpinner } from '@/components/ui/Loading';
import { cn } from '@/lib/utils';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { MagicCard } from '@/components/ui/MagicCard';

export default function CareerRoadmap() {
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRoadmap();
    }, []);

    const fetchRoadmap = async () => {
        try {
            const response = await fetch('/api/student/roadmap');
            const result = await response.json();
            if (response.ok) {
                setData(result.roadmap);
            }
        } catch (error) {
            console.error('Error fetching roadmap:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateNewRoadmap = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await fetch('/api/student/roadmap', {
                method: 'POST',
            });
            const result = await response.json();
            if (response.ok) {
                setData(result.roadmap);
            } else {
                setError(result.error || 'Failed to generate roadmap');
            }
        } catch (error) {
            setError('Error connecting to AI service');
        } finally {
            setIsGenerating(false);
        }
    };

    if (isLoading) return <Loading text="Mapping your career path..." />;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.2 }
        }
    };

    const itemVariants: Variants = {
  hidden: { y: 50, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 15,
    },
  },
};
 const lineVariants: Variants = {
  hidden: { height: "0%" },
  visible: {
    height: "100%",
    transition: {
      duration: 1.5,
      ease: cubicBezier(0.42, 0, 0.58, 1), // ✅ typed easing function
    },
  },
};

    const circleVariants: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring" as const,
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

    return (
        <div className="p-8 max-w-6xl mx-auto pb-20 relative bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <ParticleBackground />
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <Compass className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        Career Roadmap
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">AI-guided milestones for your professional journey</p>
                </div>
                <Button
                    onClick={generateNewRoadmap}
                    disabled={isGenerating}
                    className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-2xl px-6 h-14 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 group"
                >
                    {isGenerating ? (
                        <><LoadingSpinner size="sm" className="mr-2" /> Generating...</>
                    ) : (
                        <><Sparkles className="w-5 h-5 mr-2" /> Generate Career Path</>
                    )}
                </Button>
            </div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-800/30"
                >
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </motion.div>
            )}

            {!data || !data.roadmaps || data.roadmaps.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-[2rem] p-16 text-center shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Route className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">No roadmap found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        Tell the AI your department and career goals, and it will map out your journey with actionable milestones and resources.
                    </p>
                    <Button
                        onClick={generateNewRoadmap}
                        disabled={isGenerating}
                        className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl px-8"
                    >
                        {isGenerating ? 'Analyzing Opportunities...' : 'Create My Career Roadmap ✨'}
                    </Button>
                </motion.div>
            ) : (
                <div className="space-y-12">
                    {data.roadmaps.map((roadmap: any, rIdx: number) => (
                        <div key={rIdx} className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm"
                            >
                                <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-300">{roadmap.title}</h2>
                                <Badge className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-none px-4 py-2">
                                    {data.department} Track
                                </Badge>
                            </motion.div>

                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="relative flex flex-col gap-8"
                            >
                                {/* Roadmap line */}
                                <motion.div 
                                    variants={lineVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="absolute left-10 lg:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-indigo-200 via-blue-200 to-indigo-200 dark:from-indigo-500 via-blue-500 to-indigo-500 hidden lg:block lg:-translate-x-1/2"
                                />

                                {roadmap.milestones.map((milestone: any, mIdx: number) => (
                                    <motion.div
                                        key={mIdx}
                                        variants={itemVariants}
                                        className={cn(
                                            "relative flex flex-col lg:flex-row items-start lg:items-center gap-8",
                                            mIdx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                                        )}
                                    >
                                        {/* Milestone Circle */}
                                        <motion.div 
                                            variants={circleVariants}
                                            className="absolute left-10 lg:left-1/2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-4 border-indigo-400 dark:border-indigo-500 z-10 lg:-translate-x-1/2 shadow-lg flex items-center justify-center group"
                                        >
                                            <div className="w-2 h-2 bg-indigo-600 dark:bg-indigo-400 rounded-full group-hover:scale-150 transition-transform" />
                                        </motion.div>

                                        {/* Card content */}
                                        <div className="flex-1 w-full lg:w-1/2">
                                            <MagicCard className="rounded-[2rem]" glow>
                                                <CardContent className="p-8">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                                                                <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{milestone.title}</h3>
                                                            </div>
                                                        </div>
                                                        <Badge className="rounded-lg capitalize text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600">
                                                            {milestone.status}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                                        {milestone.description}
                                                    </p>

                                                    {milestone.resources && milestone.resources.length > 0 && (
                                                        <div className="space-y-3">
                                                            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                                <BookOpen className="w-3 h-3" />
                                                                Success Resources
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {milestone.resources.map((res: string, idx: number) => (
                                                                    <motion.div 
                                                                        key={idx} 
                                                                        whileHover={{ scale: 1.05 }}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50/50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-300 text-[10px] font-bold group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white dark:group-hover:text-white transition-colors cursor-pointer"
                                                                    >
                                                                        {res}
                                                                        <ExternalLink className="w-3 h-3" />
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </MagicCard>
                                        </div>
                                        {/* Empty space on opposite side for desktop */}
                                        <div className="hidden lg:block lg:flex-1" />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    ))}
                </div>
            )}

            {data && data.lastUpdated && (
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-16 text-center"
                    >
                        <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
                            <Sparkles className="w-3 h-3" />
                            AI Roadmap last refined on {new Date(data.lastUpdated).toLocaleString()}
                        </p>
                    </motion.div>
                </AnimatePresence>
            )}
        </div>
    );
}