# 🚀 EventMate AI 

## Overview

**EventMate AI** is an intelligent event management platform designed to simplify how users discover, plan, and navigate events.

It combines AI-driven recommendations, real-time data, and a clean interface to deliver a seamless event experience for both organizers and attendees.

---

## 🔗 Live Demo & Repository

- 🌐 Live App: <your-deployment-url>
- 📂 Repository: <your-repo-url>

---

## ✨ Key Features

- 🧠 **AI-Powered Scheduling**  
  Automatically builds conflict-free schedules based on user preferences  

- 🔍 **Smart Event Discovery**  
  Find relevant events using intelligent filtering and recommendations  

- 📍 **Live Navigation Assistance**  
  Easily locate sessions and venues in real time  

- 💬 **AI Assistant**  
  Context-aware chat for queries, bookings, and guidance  

- 📊 **Unified Dashboard**  
  Manage events, schedules, and user activity in one place  

---

## 🛠 Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS  

**Backend**
- Node.js
- Express  

**Database & Services**
- Firebase Firestore (real-time data)
- Google Authentication (secure login)  

**AI Integration**
- Google Gemini API  

**Deployment**
- Google Cloud Run  

---

## 📁 Project Structure

```

eventmate-ai/
├── client/          # Frontend (React)
├── server/          # Backend (Node.js/Express)
├── public/          # Static assets
├── .env.example     # Environment variables template
├── package.json
└── README.md

````

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Google account (for authentication & APIs)

---

### Installation

```bash
git clone <your-repo-url>
cd eventmate-ai
npm install
````

---

### Environment Setup

Create a `.env` file based on `.env.example` and add:

* Gemini API Key
* Firebase configuration
* Required backend variables

---

### Run Locally

```bash
# Start backend
npm run dev:server

# Start frontend (new terminal)
npm run dev
```

App runs at:
👉 [http://localhost:5173](http://localhost:5173)

---

### Production Build

```bash
npm run build
npm run preview
```

---

## 🧠 How It Works

EventMate AI follows a modular client-server architecture:

1. **Frontend (React)**
   Interactive dashboard and UI

2. **Authentication Layer**
   Google OAuth for secure access

3. **Backend Services**
   API handling, scheduling logic, AI integration

4. **AI Engine (Gemini API)**
   Generates intelligent responses and recommendations

5. **Database (Firebase Firestore)**
   Stores events, users, and schedules in real time

6. **Scheduling Logic**
   Optimizes event selection based on conflicts and preferences

---

## ⚡ Design Focus

* Clean, premium UI (glassmorphism-inspired)
* Mobile-first responsive design
* Real-world usability over feature overload
* Scalable and modular architecture

---

## 📌 Assumptions

* Users have stable internet connectivity
* Google services (Auth, Gemini) are available and properly configured
* API usage remains within quota limits
* Modern browser environment (JavaScript enabled)

---

## ⚠️ Important Notes

* Sensitive data (API keys, tokens) are excluded via `.gitignore`
* Repository follows a clean and maintainable structure
* Single-branch workflow (`main`) as per submission guidelines

---

## 🐛 Troubleshooting

### AI Chat Issues

* Ensure backend is running:
  [http://localhost:5000/api/health](http://localhost:5000/api/health)
* Verify `.env` contains valid API keys
* Check backend logs for quota or rate limit errors

---

### Build Issues

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

### Port Conflicts

* Frontend: `5173`
* Backend: `5000`

---

## 📈 Future Improvements

* Advanced personalization using user behavior
* Multi-event collaboration features
* Offline-first enhancements
* Improved recommendation algorithms

---

## 👤 Author

* Your Name

---

## 📄 License

This project is licensed under the MIT License.

---

## 🤝 Submission Context

This project was built as part of **Prompt Wars Virtual** by @hack2skill, focusing on:

* AI-driven problem solving
* Practical usability
* Clean architecture and implementation
* Effective use of Google services

---
## 📝 Final Note

EventMate AI was built with a focus on solving real-world event planning challenges using AI.

The project is still evolving, and there’s plenty of scope for improvement.  
Feedback, suggestions, and contributions are always welcome.

```
