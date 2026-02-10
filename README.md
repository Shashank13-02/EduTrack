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

## 🏁 Getting Started (End-to-End)

Follow these steps to run the project locally or deploy it to the cloud.

### Prerequisites
- Node.js 18+ installed.
- (Optional) A MongoDB Atlas account for production data.

### 1. Clone the Repository
```bash
git clone https://github.com/Shashank13-02/EduTrack.git
cd EduTrack
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
The project comes with a default configuration that works out-of-the-box using an in-memory database. 
For production/persistence, create a `.env.local` file:

```env
MOGNODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/edutrack
JWT_SECRET=your-secure-secret-key
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# AI Configuration (DeepSeek / OpenRouter)
DEEPSEEK_API_KEY=your-api-key
# or
OPENAI_API_KEY=your-api-key

```

### 4. Seed the Database
Populate the app with comprehensive demo data (Teachers, Students, Marks, Attendance):

```bash
npm run seed
```

### 5. Run the Application
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3002) to see the app in action.

## 🔑 Demo Credentials

**Teacher Portal**  
Email: `teacher@edu.com`  
Password: `teacher123`

**Student Portal**  
Email: `core1@student.com`  
Password: `student123`

## ☁️ Deployment Guide

This project is optimized for deployment on **Vercel**.

1.  Push your code to your GitHub repository (`https://github.com/Shashank13-02/EduTrack`).
2.  Go to [Vercel](https://vercel.com) and "Add New Project".
3.  Import the `EduTrack` repository.
4.  In the **Environment Variables** section, add:
    -   `MONGODB_URI`: Your MongoDB Atlas connection string.
    -   `JWT_SECRET`: A random, strong string.
5.  Click **Deploy**.

**Note:** For the database, it is highly recommended to use **MongoDB Atlas** (Cloud) instead of the in-memory database for deployed versions.

## 🛡️ Security
- **RBAC**: Strict Role-Based Access Control ensures students cannot access teacher/admin routes.
- **Data Protection**: Passwords are hashed using `bcrypt`.
- **Session Management**: Secure, HTTP-only cookies prevent XSS attacks.

## 📄 License
This project is licensed under the MIT License.

---
**Created by Shashank13-02**
