'use client';

import React from 'react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface SkillData {
    skill: string;
    score: number;
}

export function SkillRadarChart({ data }: { data: SkillData[] }) {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar name="Skill Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Legend />
            </RadarChart>
        </ResponsiveContainer>
    );
}
