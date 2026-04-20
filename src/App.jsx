import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import { Loader2 } from "lucide-react";

// Layout
import MainLayout from "./components/MainLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ChatAssistant from "./pages/ChatAssistant";
import HallDetails from "./pages/HallDetails";
import ManageEvents from "./pages/ManageEvents";
import EventsCalendar from "./pages/EventsCalendar";
import UpcomingEvents from "./pages/UpcomingEvents";
import MySchedule from "./pages/MySchedule";

function LoaderScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#05070e] text-white">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );
}

// 🔒 Protected Route
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoaderScreen />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

// 🚫 Public Route
function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoaderScreen />;
  if (currentUser) return <Navigate to="/chat" replace />;
  return children;
}

// 🧠 Home Route
function HomeRoute() {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoaderScreen />;
  if (currentUser) return <Navigate to="/chat" replace />;
  return <Home />;
}

// 🚀 Routes
function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeRoute />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ChatAssistant />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <MainLayout>
                <EventsCalendar />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/upcoming"
          element={
            <ProtectedRoute>
              <MainLayout>
                <UpcomingEvents />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-schedule"
          element={
            <ProtectedRoute>
              <MainLayout>
                <MySchedule />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/hubs/:hubId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <HallDetails />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ManageEvents />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// 🌍 ROOT
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}