'use client';

import React from 'react';
import { CheckCircle, XCircle, Lightbulb, TrendingUp } from 'lucide-react';

interface SkillScore {
    _id: string;
    skillName: string;
    score: number;
    level: 'weak' | 'average' | 'strong';
}

interface SkillGapSectionProps {
    skillScores: SkillScore[];
}

export function SkillGapSection({ skillScores }: SkillGapSectionProps) {
    const strongSkills = skillScores.filter(s => s.level === 'strong');
    const weakSkills = skillScores.filter(s => s.level === 'weak');
    const averageSkills = skillScores.filter(s => s.level === 'average');

    // Generate improvement suggestions based on weak skills
    const improvementSuggestions = weakSkills.map(skill => ({
        skill: skill.skillName,
        suggestion: `Practice ${skill.skillName} with online tutorials and assignments`,
        resources: ['Khan Academy', 'Coursera', 'YouTube Tutorials']
    }));

    return (
        <div className="space-y-6">
            {/* Strong Skills */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Strong Skills ✅</h3>
                    <span className="ml-auto px-3 py-1 bg-green-600 dark:bg-green-500 text-white text-sm font-medium rounded-full">
                        {strongSkills.length} skills
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {strongSkills.length > 0 ? (
                        strongSkills.map((skill) => (
                            <div
                                key={skill._id}
                                className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-800 dark:text-slate-100">{skill.skillName}</span>
                                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${skill.score}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">{skill.score}%</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 dark:text-slate-400 col-span-full text-center py-4">
                            Keep working to develop strong skills!
                        </p>
                    )}
                </div>
            </div>

            {/* Average Skills */}
            {averageSkills.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Developing Skills 📈</h3>
                        <span className="ml-auto px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-full">
                            {averageSkills.length} skills
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {averageSkills.map((skill) => (
                            <div
                                key={skill._id}
                                className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-800 dark:text-slate-100">{skill.skillName}</span>
                                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${skill.score}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{skill.score}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weak Skills */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-4">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Needs Improvement ❌</h3>
                    <span className="ml-auto px-3 py-1 bg-red-600 dark:bg-red-500 text-white text-sm font-medium rounded-full">
                        {weakSkills.length} skills
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {weakSkills.length > 0 ? (
                        weakSkills.map((skill) => (
                            <div
                                key={skill._id}
                                className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer border border-slate-200 dark:border-slate-700"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-800 dark:text-slate-100">{skill.skillName}</span>
                                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                        <div
                                            className="bg-red-600 dark:bg-red-500 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${skill.score}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">{skill.score}%</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-600 dark:text-slate-400 col-span-full text-center py-4">
                            Great! No weak areas identified.
                        </p>
                    )}
                </div>
            </div>

            {/* Improvement Suggestions */}
            {improvementSuggestions.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-100">Suggested Improvements 💡</h3>
                    </div>
                    <div className="space-y-3">
                        {improvementSuggestions.map((item, index) => (
                            <div key={index} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                        <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 dark:text-slate-100 mb-1">{item.skill}</h4>
                                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{item.suggestion}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {item.resources.map((resource, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-md"
                                                >
                                                    {resource}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
