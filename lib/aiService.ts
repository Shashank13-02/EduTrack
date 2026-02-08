const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.DEEPSEEK_API_KEY;

export interface AIServiceResponse {
    content: string;
    error?: string;
}

export async function generateAIConsultation(prompt: string): Promise<AIServiceResponse> {
    if (!API_KEY) return { content: "", error: "OPENROUTER_API_KEY not configured" };

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "EduTrack AI",
            },
            body: JSON.stringify({
                model: "tngtech/deepseek-r1t2-chimera:free",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are an expert academic and career mentor for college students. Provide structured, practical guidance. If asked for JSON, output JSON only.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0.4,
                max_tokens: 2000,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.error?.message || `API Error: ${response.status}`);
        }

        return { content: data.choices?.[0]?.message?.content || "" };
    } catch (error: any) {
        return { content: "", error: error.message || "Failed to connect to AI service" };
    }
}

export async function generateLearningPath(studentData: any) {
    const prompt = `
        Based on the following student profile, generate a personalized 7-day learning routine.
        The routine should focus on developing their weak skills while maintaining their strong ones.
        Keep the tone encouraging and professional.

        Student Profile:
        - Name: ${studentData.name}
        - Department: ${studentData.department}
        - Year: ${studentData.year}
        - Bio: ${studentData.bio}
        - Technical Skills: ${(studentData.technicalSkills || []).join(', ')}
        - Soft Skills: ${(studentData.softSkills || []).join(', ')}
        - Career Goals: ${(studentData.careerGoals || []).join(', ')}
        - Hobbies: ${(studentData.hobbies || []).join(', ')}
        
        Recent Performance:
        - Attendance: ${studentData.attendancePercent}%
        - Average Score: ${studentData.averageScore}%
        - Engagement: ${studentData.engagementScore}%
        
        Output the response in JSON format only with the following structure:
        {
            "dailyRoutine": [
                {
                    "day": "Monday",
                    "tasks": [
                        { "title": "Task Name", "description": "Short description", "time": "e.g. 09:00 AM", "type": "study|skill|rest" }
                    ]
                }
            ]
        }
    `;

    const result = await generateAIConsultation(prompt);
    if (result.error) return { error: result.error };

    try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : result.content);
    } catch (e) {
        return { error: 'Failed to parse AI response' };
    }
}

export async function generateCareerRoadmap(studentData: any) {
    const prompt = `
You are an expert career mentor for college students.

Create a personalized career roadmap based on the student profile below.
The roadmap must be realistic for a college student and should help them become internship/job-ready.

Student Profile:
- Name: ${studentData.name}
- Department: ${studentData.department}
- Year: ${studentData.year}
- Student Type: ${studentData.studentType || "CORE"} (CORE or NON_CORE)
- Career Goals: ${(studentData.careerGoals || []).join(", ")}
- Current Technical Skills: ${(studentData.technicalSkills || []).join(", ")}
- Current Soft Skills: ${(studentData.softSkills || []).join(", ")}
- Interests/Hobbies: ${(studentData.hobbies || []).join(", ")}

Rules:
1) Make 1 roadmap only.
2) Create exactly 5 milestones.
3) Each milestone must include:
   - title
   - durationWeeks (number)
   - description (2-3 lines)
   - keySkills (array)
   - projects (array of 1-3)
   - resources (array of 3-6)
   - deliverables (array)
4) Output ONLY valid JSON.

JSON format:
{
  "roadmapTitle": "string",
  "targetRole": "string",
  "milestones": [
    {
      "title": "string",
      "durationWeeks": 2,
      "description": "string",
      "keySkills": ["string"],
      "projects": ["string"],
      "resources": ["string"],
      "deliverables": ["string"],
      "status": "locked"
    }
  ]
}
`;

    const result = await generateAIConsultation(prompt);
    if (result.error) return { error: result.error };

    try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : result.content);
    } catch (e) {
        return { error: "Failed to parse AI response" };
    }
}

export async function generatePerformanceFeedback(studentData: any, performanceData: any) {
    const prompt = `
You are an empathetic academic mentor providing personalized feedback to a college student.

Student Profile:
- Name: ${studentData.name}
- Department: ${studentData.department}
- Year: Year ${studentData.year}

Performance Metrics:
- Attendance: ${performanceData.attendancePercent}%
- Average Score: ${performanceData.averageScore || 'N/A'}%
- Engagement Score: ${performanceData.engagementScore || 'N/A'}%

Weak Areas Identified:
${performanceData.weakAreas && performanceData.weakAreas.length > 0
            ? performanceData.weakAreas.map((area: string, i: number) => `${i + 1}. ${area}`).join('\n')
            : '- None identified yet'}

Task: Write a personalized, encouraging message (150-200 words) to this student as their teacher.
Focus on:
1. Acknowledge their current performance (be specific with numbers)
2. Highlight 2-3 key areas that need improvement
3. Provide actionable suggestions
4. End with encouragement and offer to help

Tone: Professional but warm, motivating, solution-focused.
Output: Plain text message only, no JSON, no formatting.
`;

    const result = await generateAIConsultation(prompt);
    if (result.error) return { error: result.error };

    return { content: result.content.trim() };
}

export async function generateComprehensiveStudentReport(studentData: any, performanceData: any) {
    const prompt = `
You are an expert education analyst. Generate a comprehensive performance report for a college student.

Student Profile:
- Name: ${studentData.name}
- Department: ${studentData.department}
- Year: Year ${studentData.year}
- Student Type: ${studentData.studentType || 'CORE'}
- Career Goals: ${(studentData.careerGoals || []).join(', ') || 'Not specified'}
- Technical Skills: ${(studentData.technicalSkills || []).join(', ') || 'Not specified'}
- Soft Skills: ${(studentData.softSkills || []).join(', ') || 'Not specified'}

Performance Metrics:
- Attendance: ${performanceData.attendancePercent}%
- Average Score: ${performanceData.averageScore || 'N/A'}%
- Engagement Score: ${performanceData.engagementScore || 'N/A'}%
- Risk Level: ${performanceData.riskLevel || 'Not determined'}

Subject Performance:
${performanceData.subjectScores && performanceData.subjectScores.length > 0
            ? performanceData.subjectScores.map((s: any) => `- ${s.subject}: ${s.average}%`).join('\n')
            : '- No subject data available'}

Weak Areas:
${performanceData.weakAreas && performanceData.weakAreas.length > 0
            ? performanceData.weakAreas.map((area: string, i: number) => `${i + 1}. ${area}`).join('\n')
            : '- No significant weaknesses identified'}

Task: Generate a detailed student performance report in JSON format with the following structure:

{
  "overallAssessment": "2-3 sentence summary of the student's overall performance",
  "strengths": [
    "List 3-5 key strengths based on the data"
  ],
  "areasForImprovement": [
    {
      "area": "Specific area (e.g., Attendance, Subject Performance, Engagement)",
      "currentStatus": "Brief description of current state",
      "recommendations": ["Specific actionable recommendations"]
    }
  ],
  "attendanceAnalysis": {
    "status": "Good/Concerning/Critical",
    "insights": "2-3 sentences analyzing attendance pattern",
    "actionItems": ["Specific steps to improve or maintain"]
  },
  "academicPerformance": {
    "status": "Excellent/Good/Average/Below Average",
    "topSubjects": ["List top performing subjects"],
    "strugglingSubjects": ["List subjects needing attention"],
    "recommendations": ["Specific academic improvement strategies"]
  },
  "behavioralInsights": {
    "engagementLevel": "High/Medium/Low",
    "observations": "Insights based on engagement score",
    "suggestions": ["Ways to improve participation and engagement"]
  },
  "riskAssessment": {
    "level": "${performanceData.riskLevel || 'medium'}",
    "factors": ["Key factors contributing to risk level"],
    "mitigationStrategies": ["Specific intervention strategies"]
  },
  "actionPlan": {
    "immediate": ["Actions to take in next 1-2 weeks"],
    "shortTerm": ["Goals for next month"],
    "longTerm": ["Semester-end objectives"]
  },
  "teacherMessage": "Personal encouraging message from teacher (3-4 sentences)"
}

Output ONLY valid JSON. Be specific, constructive, and encouraging.
`;

    const result = await generateAIConsultation(prompt);
    if (result.error) return { error: result.error };

    try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        return JSON.parse(jsonMatch ? jsonMatch[0] : result.content);
    } catch (e) {
        return { error: 'Failed to parse AI response' };
    }
}
