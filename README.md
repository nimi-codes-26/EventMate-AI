# EventMate AI

## Description

EventMate AI is an intelligent event management platform that leverages artificial intelligence to help users discover, schedule, and navigate events seamlessly. The application provides a comprehensive dashboard for event organizers and attendees, featuring AI-powered chat assistance, personalized recommendations, and smart scheduling capabilities.

## Features

- **AI Scheduling**: Intelligent conflict-free schedule building with personalized recommendations
- **Event Discovery**: Advanced search and filtering to find relevant events based on user preferences
- **Navigation Assistance**: Real-time venue navigation and session location guidance
- **AI Chat Assistant**: Context-aware conversational AI for event-related queries and support
- **Dashboard**: Comprehensive management interface for events, schedules, and user profiles

## Tech Stack

- **Frontend**: React with Vite for fast development and building
- **Backend**: Node.js with Express server
- **Database**: Firebase Firestore for real-time data management
- **Authentication**: Google Authentication for secure user login
- **AI Integration**: Google Gemini API for intelligent chat and recommendations
- **Deployment**: Google Cloud Run for scalable containerized deployment
- **Styling**: Tailwind CSS for responsive and modern UI design

## Setup Instructions

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Google account for authentication and API access

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ai-event-assistant
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Gemini API key and other required variables

4. **Start the development servers**:
   - Backend: `npm run dev:server`
   - Frontend: `npm run dev` (in a new terminal)

5. **Open your browser** to `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## How It Works

EventMate AI operates through a client-server architecture with AI integration:

1. **User Interface**: React-based frontend provides an intuitive dashboard for event management
2. **Authentication**: Google OAuth ensures secure user access and personalized experiences
3. **Data Management**: Firebase handles real-time event data, user profiles, and schedules
4. **AI Processing**: Backend server integrates with Google Gemini API to provide intelligent responses and recommendations
5. **Smart Scheduling**: Algorithm analyzes user preferences and event constraints to suggest optimal schedules
6. **Real-time Updates**: WebSocket connections enable live event updates and chat functionality

The system uses machine learning models to understand user intent, match events to interests, and provide contextual assistance throughout the event lifecycle.

## Assumptions

- Users have access to modern web browsers with JavaScript enabled
- Google services (Authentication, Gemini API) are available and accessible
- Internet connectivity is required for real-time features and AI functionality
- Event data is managed through Firebase, assuming proper security rules are configured
- The application is designed for desktop and mobile web usage, with responsive design
- API rate limits and quotas for Google services are within acceptable usage patterns
```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
VITE_AI_API_URL=http://localhost:5000/api/chat
```

### Firebase Configuration
Update `src/services/firebase.js` with your Firebase project credentials.

## 🎯 Features

- ✅ **Responsive Design** - Works on all devices
- ✅ **Real-time Chat** - Instant messaging with AI
- ✅ **Event Management** - Full CRUD operations for events
- ✅ **User Authentication** - Secure login/registration
- ✅ **Schedule Planning** - Personal event calendars
- ✅ **Premium UI** - Glassmorphism design with animations
- ✅ **Offline AI** - Always works, even without API keys

## 🐛 Troubleshooting

### AI Chat Not Working
1. Check if backend server is running: `curl http://localhost:5000/api/health`
2. Verify that `.env` contains a real Gemini key or bearer token, not the placeholder value.
3. If you set `GEMINI_API_URL`, verify it matches your API type (`generateText` or `generateContent`).
4. If the backend is configured but chat still falls back, the key may be valid but quota or billing is exhausted.
   - Look for `RESOURCE_EXHAUSTED`, `QUOTA`, or `RATE_LIMIT` errors in the backend logs.
5. Restart both frontend and backend servers

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Conflicts
- Frontend runs on port 5173 by default
- Backend runs on port 5000 by default
- Change ports in respective config files if needed