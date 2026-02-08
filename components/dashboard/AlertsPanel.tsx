'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Bell, AlertCircle, Info } from 'lucide-react';

interface Alert {
    id: string;
    type: 'risk' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
}

interface AlertsPanelProps {
    attendancePercent: number;
    averageScore: number;
    riskLevel: string;
}

export function AlertsPanel({
    attendancePercent,
    averageScore,
    riskLevel,
}: AlertsPanelProps) {

    const generateAlerts = (): Alert[] => {
        const alerts: Alert[] = [];

        if (riskLevel === 'high' || riskLevel === 'medium') {
            alerts.push({
                id: 'risk-1',
                type: 'risk',
                title: `${riskLevel === 'high' ? 'High' : 'Medium'} Risk Alert`,
                message: `Your current risk level is ${riskLevel}. Please focus on improving attendance and performance.`,
                timestamp: new Date(),
            });
        }

        if (attendancePercent < 75) {
            alerts.push({
                id: 'attendance-1',
                type: 'warning',
                title: 'Low Attendance Warning',
                message: `Your attendance is ${attendancePercent}%. You need at least 75% to maintain good standing.`,
                timestamp: new Date(),
            });
        }

        if (averageScore < 60) {
            alerts.push({
                id: 'performance-1',
                type: 'warning',
                title: 'Performance Alert',
                message: `Your average score is ${averageScore}%. Consider reviewing study materials and seeking help.`,
                timestamp: new Date(),
            });
        }

        if (Math.random() > 0.5) {
            alerts.push({
                id: 'test-1',
                type: 'info',
                title: 'Upcoming Test Reminder',
                message: 'You have a Data Structures exam scheduled for next week. Start preparing now!',
                timestamp: new Date(),
            });
        }

        return alerts;
    };

    const [alerts, setAlerts] = useState<Alert[]>(generateAlerts());

    const dismissAlert = (id: string) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'risk':
                return <AlertTriangle className="w-5 h-5" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5" />;
            case 'info':
                return <Bell className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    const getAlertStyles = (type: string) => {
        switch (type) {
            case 'risk':
                return `
                    bg-red-900/30 
                    border border-red-500/40 
                    text-red-100
                `;
            case 'warning':
                return `
                    bg-amber-900/30 
                    border border-amber-500/40 
                    text-amber-100
                `;
            case 'info':
                return `
                    bg-blue-900/30 
                    border border-blue-500/40 
                    text-blue-100
                `;
            default:
                return `
                    bg-slate-800 
                    border border-slate-600 
                    text-slate-200
                `;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'risk':
                return 'text-red-400';
            case 'warning':
                return 'text-amber-400';
            case 'info':
                return 'text-blue-400';
            default:
                return 'text-slate-400';
        }
    };

    if (alerts.length === 0) {
        return (
            <div className="bg-emerald-900/30 border border-emerald-500/40 rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-900/60 rounded-full mb-3">
                    <Bell className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-emerald-100 mb-1">
                    All Clear! 🎉
                </h3>
                <p className="text-sm text-emerald-200">
                    You have no alerts at this time. Keep up the great work!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {alerts.map(alert => (
                <div
                    key={alert.id}
                    className={`
                        ${getAlertStyles(alert.type)}
                        rounded-xl p-4 shadow-lg
                        animate-slide-in
                        transition-all duration-300
                    `}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className={`
                                p-2 rounded-lg 
                                bg-slate-900/60 
                                ${getIconColor(alert.type)}
                            `}
                        >
                            {getAlertIcon(alert.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">
                                        {alert.title}
                                    </h4>
                                    <p className="text-sm opacity-90">
                                        {alert.message}
                                    </p>
                                </div>

                                <button
                                    onClick={() => dismissAlert(alert.id)}
                                    className="
                                        p-1 
                                        rounded-lg 
                                        text-slate-300 
                                        hover:bg-slate-700/50 
                                        hover:text-white 
                                        transition-colors
                                    "
                                    aria-label="Dismiss alert"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
