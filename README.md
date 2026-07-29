# 💼 Smart Job Portal

A full-stack recruitment platform that connects **job seekers with employers**, enabling secure authentication, job posting, applications, applicant management, and AI-powered career assistance.

🔗 **Live Demo:** https://smart-job-portal-jade.vercel.app

## ✨ Features

- 🔐 Secure user authentication with JWT
- 💼 Job posting and application management
- 📋 Application tracking for job seekers
- 👨‍💼 Employer dashboard for managing applicants
- 📄 Resume upload and AI-powered resume analysis
- 🤖 AI job matching using candidate skills and job descriptions
- 📊 Skill gap analysis and job readiness scoring
- 🎯 Personalized learning roadmaps and interview recommendations
- 👥 Separate workflows for job seekers and employers

## 🤖 AI Features

The application integrates the **Google Gemini API** to provide:

- **Resume Analysis** – Extracts skills, experience, education, and projects and generates a job-readiness score.
- **Job Matching** – Compares candidate skills with job requirements and provides a match percentage and fit level.
- **Skill Gap Analysis** – Identifies missing skills based on target jobs.
- **Learning Recommendations** – Generates personalized learning roadmaps and interview preparation suggestions.

## 🏗️ Core Recruitment Flow

```text
Job Seeker
    ↓
Register / Login
    ↓
Upload Resume
    ↓
Browse & Apply for Jobs
    ↓
Track Applications

Employer
    ↓
Register / Login
    ↓
Post Jobs
    ↓
View Applicants
    ↓
Shortlist / Reject Candidates
```

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS, JavaScript
- **Backend:** Node.js, Express.js
- **AI:** Google Gemini API
- **Database:** Supabase PostgreSQL
- **Authentication:** JWT, bcryptjs
- **APIs:** REST API, Supabase API, Gemini API
- **Deployment:** Vercel
- **Tools:** Git, GitHub

## 📊 Project Highlights

- Built a full-stack recruitment platform with **secure authentication, job posting, and application tracking**.
- Developed REST APIs using **Node.js and Express.js**.
- Implemented separate workflows for **job seekers and employers**.
- Integrated **Supabase PostgreSQL** for application and recruitment data.
- Implemented JWT-based authentication with password hashing using **bcryptjs**.
- Integrated Gemini API features for **resume analysis, job matching, and skill-gap analysis**.
- Built dashboards for managing jobs, applicants, and applications.
- Developed as a **team project** and presented at a **college project expo**.

## 📈 Project Scale

- **15 REST API endpoints**
- **10 PostgreSQL tables**
- React-based responsive frontend
- AI-powered career assistance using Gemini API

## 🚀 Run Locally

```bash
git clone https://github.com/Rags-8/Smart-Job-Portal.git
cd Smart-Job-Portal

# Frontend
cd Smart_Job_Portal/Smart_Job_Portal
npm install
npm run dev
```

Configure the required environment variables for the frontend and backend before running the application.

## 👩‍💻 Team Project

Smart Job Portal was developed as a collaborative college project and presented at a **college project expo**.

**S G Raghavi Sai**  
Computer Science & Engineering (Artificial Intelligence)

[GitHub](https://github.com/Rags-8) • [LinkedIn](https://www.linkedin.com/in/s-g-raghavi-sai-a7a4482bb/)

**License:** MIT
