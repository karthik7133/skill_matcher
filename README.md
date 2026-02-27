# 🚀 Smart Internship Matching & Recommendation Platform

An intelligent platform that connects students with the perfect internship opportunities using AI-powered resume parsing and a sophisticated skill-matching engine.

## ✨ Key Features

### 📄 Intelligent Resume Parsing
- **AI-Powered Extraction**: Uses Google Gemini (Generative AI) to automatically extract education, skills, and projects from uploaded PDF resumes.
- **Auto-Population**: Instantly fills out the student profile, saving time and ensuring accuracy.
- **Robust Fallback**: Includes a built-in local parser as a fallback in case of API limits.

### 🧠 Smart Matching Engine
- **Relevance Scoring**: Calculates a "Match Score" for every student against open internships based on:
  - Required vs. possessed skills.
  - Project relevance and technology stack.
  - Education alignment.
- **Top Candidates for Recruiters**: Recruiters see a ranked list of students for their postings, highlighting the best fits first.
- **Personalized Recommendations**: Students get a curated feed of internships where they have the highest match probability.

### 👤 Profile & Dashboard
- **Dynamic Student Profiles**: Showcase skills, projects, and education in a professional layout.
- **Recruiter Hub**: Manage internship postings, view applicants, and track recruitment status.
- **Real-time Status Tracking**: Students can monitor their application progress (Pending, Shortlisted, Rejected).

### 🛠 Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **AI**: Google Generative AI (Gemini).
- **File Handling**: Multer (Uploads), PDF-Parse (Extraction).

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account
- Google Gemini API Key

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. `node server.js`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---
*Built with ❤️ for students and recruiters.*
