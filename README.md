# DoubtDesk — Full-Stack Realtime Doubt Resolution & AI Mentorship Engine

> **Internship Capstone Project**  
> Developed for **CodingMates (OPC) Pvt. Ltd.** (Dhuri, Punjab, India)  
> *Tagline:* **"Learn Today, Lead Tomorrow."**

---

## 🌟 Executive Summary

**DoubtDesk** is an enterprise-grade full-stack mentorship and doubt resolution platform engineered for coding bootcamps and IT academies. It solves the critical bottleneck in developer education: long queue turnaround times and repetitive questions.

Unlike standard CRUD issue boards, DoubtDesk introduces:
1. **Full-Stack Neural AI First-Responder & Code Diff Engine** (Sub-second preliminary triage).
2. **Self-Growing Knowledge Base (FAQ Auto-Indexer)** (Auto-converts resolved doubts into searchable solutions).
3. **Response-Time SLA Tracker & Auto-Escalation** (15-minute resolution target with automated interim AI assistance).
4. **Student Satisfaction & Resolution Sign-Off** (Quality assurance mechanism where students must approve solutions before tickets close).
5. **Spatial Scrollytelling Portal** (Cinematic, smooth perspective transitions built with modern design principles).

---

## 🏗️ Architecture & Technology Stack

```
doubtdesk/
├── backend/                  # Node.js + Express + MongoDB REST API
│   ├── config/               # Database connection (with in-memory fallback)
│   ├── controllers/          # Business logic (Auth, Doubt, Response, AI, FAQ)
│   ├── middleware/           # JWT verification, Role RBAC, Rate limiting, Error handler
│   ├── models/               # Mongoose Schemas (User, Doubt, Response, FAQ)
│   ├── routes/               # API endpoint routing
│   ├── services/             # Background SLA Monitor & Escalation Engine
│   └── server.js             # Main server entrypoint
│
└── frontend/                 # React 18 + Vite SPA
    ├── src/
    │   ├── api/              # Axios instance with interceptors
    │   ├── components/       # Spatial HUD, AI Diagnostic Card, AIDoubtBot, Stepper
    │   ├── context/          # Auth and Toast Context providers
    │   ├── hooks/            # Mouse parallax & window hooks
    │   ├── pages/            # Landing, Signup, Login, Dashboard, DoubtDetail, KnowledgeBase
    │   └── index.css         # Plus Jakarta Sans + Inter + JetBrains Mono design tokens
    └── vite.config.js        # Vite build configuration with proxy
```

### Stack Highlights:
- **Frontend**: React 18, Vite, Three.js / Canvas, CSS Modules / Custom Properties, Plus Jakarta Sans & Inter typography.
- **Backend**: Node.js, Express, MongoDB / Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `express-validator`, `helmet`, `express-mongo-sanitize`, `express-rate-limit`.
- **AI Intelligence**: Google Gemini 1.5 Flash API + domain-specific heuristic AST/rule-based reasoning engine.

---

## 🚀 Key Features

### 1. 🤖 24/7 AI DoubtBot & Code Tutor (Students Only)
- Floating interactive drawer with syntax-highlighted code execution blocks and 1-click copy.
- Explains MERN stack concepts, debugging strategies, and async lifecycle traps.
- Strictly guarded: Hidden before login and inaccessible to mentors.

### 2. ⚡ AI First-Responder & Side-by-Side Code Diffs
- Submits doubts for instant deep-learning code analysis.
- Structured 3-tab diagnostic card: Root Cause Analysis, Before/After Code Diff, and Prevention Checklist.

### 3. 📚 Self-Growing Knowledge Base (FAQ Engine)
- The instant a mentor resolves a doubt, it is auto-indexed into a searchable Knowledge Base (`/faq`).
- Real-time search across resolved errors with category filters and "👍 Helpful" community voting.
- Saves hundreds of mentor hours by preventing duplicate tickets.

### 4. ⏱️ Response-Time SLA Tracker & Auto-Escalation
- 15-minute resolution target per ticket.
- Background worker automatically flags overdue doubts with a pulsing `🔥 PRIORITY ESCALATED` badge and posts an interim AI diagnostic in the thread.

### 5. 🛡️ Student Resolution Verification Sign-Off
- Mentors propose solutions but cannot unilaterally close tickets.
- Students review the solution with a 1–5 star rating or request further clarification.

---

## 🛠️ Getting Started Locally

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone Repository
```bash
git clone <your-github-repo-url>
cd doubtdesk
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
MONGO_URI=mongodb://127.0.0.1:27017/doubtdesk
CLIENT_ORIGIN=http://localhost:5173
# Optional: Add Google Gemini API key for live Gemini 1.5 Flash reasoning
GEMINI_API_KEY=
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register new student or mentor | Public |
| `POST` | `/api/auth/login` | Sign in & receive JWT token | Public |
| `GET` | `/api/doubts` | Get doubts (Student: own, Mentor: all) | Private |
| `POST` | `/api/doubts` | Submit new doubt ticket | Student |
| `PUT` | `/api/doubts/:id/assign` | Claim doubt ticket | Mentor |
| `PUT` | `/api/doubts/:id/propose-resolution` | Propose solution for student review | Mentor |
| `PUT` | `/api/doubts/:id/verify-resolution` | Student sign-off (Accept or Reject) | Student |
| `POST` | `/api/responses/:id` | Post thread response | Private |
| `POST` | `/api/ai/chat` | 24/7 AI DoubtBot conversation | Student |
| `POST` | `/api/ai/analyze` | AI code diff & root cause diagnosis | Private |
| `GET` | `/api/faq` | Search self-growing Knowledge Base | Private |
| `POST` | `/api/faq/:id/helpful` | Upvote FAQ solution | Private |

---

## 👨‍💻 Author & Internship Credits

- **Project:** DoubtDesk
- **Organization:** CodingMates (OPC) Pvt. Ltd.
- **Location:** Dhuri, Punjab, India
- **Year:** 2026
