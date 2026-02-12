# EduTrack - AI-Powered Education Analytics Platform

EduTrack is an advanced, AI-driven educational analytics platform designed to transform how institutions track performance, attendance, and student success. It provides real-time insights, risk prediction, and personalized study roadmaps to bridge the gap between data and actionable learning outcomes.

![EduTrack Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop)



## 🚀 Features

### For Teachers & Administrators
- **Real-Time Analytics Dashboard**: Visual insights into class performance, subject-wise trends, and attendance patterns.
- **Risk Prediction Engine**: AI algorithms automatically flag students at risk based on attendance and grade trends.
- **Automated Reporting**: Generate comprehensive performance reports with a single click.
- **Smart Attendance**: Efficient tracking and history logs for every student.

### For Students
- **Personalized Learning Path**: AI-generated 7-day study plans tailored to individual strengths and weaknesses.
- **AI Chatbot Tutor**: 24/7 academic assistant powered by DeepSeek Coder (via OpenRouter) for instant doubt resolution.
- **Skill Gap Analysis**: Radar charts and detailed breakdowns of core vs. non-core skills.
- **Performance Tracking**: Monitor progress across quizzes, assignments, and exams.
- **Dark/Light Mode**: Fully responsive theme with seamless transitions and persistent user preference.
- **Review System**: Get instant feedback on where to improve.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (React 19, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom, high-contrast semantic theme.
- **Database**: [MongoDB](https://www.mongodb.com/) (Atlas for production, In-Memory for dev).
- **Authentication**: JWT-based secure auth with HttpOnly cookies.
- **AI/ML**: Custom prediction logic & template-based generative AI for study plans.
- **Visualization**: [Recharts](https://recharts.org/) for interactive data plotting.



## 🛡️ Security
- **RBAC**: Strict Role-Based Access Control ensures students cannot access teacher/admin routes.
- **Data Protection**: Passwords are hashed using `bcrypt`.
- **Session Management**: Secure, HTTP-only cookies prevent XSS attacks.



---
**Created by Shashank13-02 (Team - Civicnova)**
