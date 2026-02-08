'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, TrendingDown, Calendar, Users, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { getRiskLevelColor } from '@/lib/riskPredictor';

interface AtRiskStudent {
    student: any;
    attendancePercent: number;
    averageScore: number;
    engagementScore: number;
    riskLevel: string;
    reasons: string[];
    interventions: string[];
}

interface RiskAlertsPanelProps {
    atRiskStudents: AtRiskStudent[];
    onStudentClick: (studentId: string) => void;
}

export function RiskAlertsPanel({ atRiskStudents, onStudentClick }: RiskAlertsPanelProps) {
    if (atRiskStudents.length === 0) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <Users className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">All Students on Track! 🎉</h3>
                <p className="text-green-600">No high-risk or medium-risk students detected at this time.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                    <h3 className="text-xl font-semibold text-gray-800">At-Risk Students ({atRiskStudents.length})</h3>
                </div>
            </div>

            <div className="grid gap-4">
                {atRiskStudents.map((item) => (
                    <div
                        key={item.student._id}
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500"
                        onClick={() => onStudentClick(item.student._id)}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900">{item.student.name}</h4>
                                    <Badge className={getRiskLevelColor(item.riskLevel as any)}>
                                        {item.riskLevel.toUpperCase()} RISK
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {item.student.department} • Year {item.student.year}
                                </p>
                            </div>

                            <div className="flex gap-3 text-sm">
                                <div className="text-center p-2 bg-blue-50 rounded-lg">
                                    <div className="font-bold text-blue-700">{item.attendancePercent}%</div>
                                    <div className="text-xs text-blue-600">Attendance</div>
                                </div>
                                <div className="text-center p-2 bg-purple-50 rounded-lg">
                                    <div className="font-bold text-purple-700">{item.averageScore}%</div>
                                    <div className="text-xs text-purple-600">Avg Score</div>
                                </div>
                            </div>
                        </div>

                        {/* Reasons */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-semibold text-gray-700">Risk Factors:</span>
                            </div>
                            <ul className="space-y-1">
                                {item.reasons.map((reason, idx) => (
                                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                        <span className="text-red-500 mt-1">•</span>
                                        {reason}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Interventions */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-blue-700" />
                                <span className="text-sm font-semibold text-blue-900">Recommended Interventions:</span>
                            </div>
                            <ul className="space-y-2">
                                {item.interventions.slice(0, 3).map((intervention, idx) => (
                                    <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">→</span>
                                        {intervention}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStudentClick(item.student._id);
                                }}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                View Full Details
                            </button>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Send Feedback
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
