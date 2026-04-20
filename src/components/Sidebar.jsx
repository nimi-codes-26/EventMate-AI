import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useHubStore } from "../store/useHubStore";
import {
  LogIn,
  LogOut,
  Navigation,
  Settings,
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const { hubs } = useHubStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const sections = [
    {
      title: "Workspace",
      items: [
        { to: "/chat", icon: Navigation, label: "Chat Assistant" },
        { to: "/profile", icon: User, label: "Profile" },
      ],
    },
    {
      title: "Events",
      items: [
        { to: "/events", icon: CalendarDays, label: "Event Calendar" },
        { to: "/upcoming", icon: Clock, label: "Upcoming" },
        { to: "/my-schedule", icon: CalendarDays, label: "My Schedule" },
      ],
    },
    {
      title: "Platform",
      items: [
        { to: "/admin", icon: Settings, label: "Manage Platform" },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 88 : 280 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sidebar relative z-20 flex min-h-screen flex-col border-r border-white/10 bg-[#0f172a] px-4 py-5 text-white shadow-glow"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-[-14px] top-6 inline-flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <div className="mb-8 flex flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/20">
          <Navigation size={20} />
        </div>
        {!isCollapsed && (
          <div>
            <p className="text-lg font-bold text-white">EventMate AI</p>
            <p className="text-xs text-slate-400">Premium event assistant</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            {!isCollapsed && <p className="sidebar-section-title">{section.title}</p>}
            <ul className="nav-list">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? "active" : "hover:bg-white/5"}`
                    }
                  >
                    <item.icon size={18} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {!isCollapsed && (
          <div className="mb-6">
            <p className="sidebar-section-title">Event Hubs</p>
            <ul className="space-y-2">
              {hubs.length === 0 ? (
                <li className="text-sm text-slate-500">No hubs loaded</li>
              ) : (
                hubs.map((hub) => (
                  <li key={hub.id}>
                    <NavLink
                      to={`/hubs/${hub.id}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                    >
                      <span className="h-2 w-2 rounded-full bg-indigo-400" />
                      <span className="truncate">{hub.name}</span>
                    </NavLink>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="auth-section mt-4">
        {currentUser ? (
          <div className="user-profile">
            <div className="avatar">{currentUser.email?.[0]?.toUpperCase() || <User size={16} />}</div>
            {!isCollapsed && (
              <div className="user-info">
                <p className="user-name">{currentUser.displayName || "Event Planner"}</p>
                <p className="user-email">{currentUser.email}</p>
              </div>
            )}
            {!isCollapsed && (
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <LogOut size={18} />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="auth-btn"
          >
            <LogIn size={18} />
            {!isCollapsed && <span>Login</span>}
          </button>
        )}
      </div>
    </motion.aside>
  );
}
