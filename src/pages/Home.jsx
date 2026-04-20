import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import {
  Calendar,
  MapPin,
  MessageSquare,
  LayoutDashboard,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(currentUser ? "/chat" : "/login");
  };

  const features = [
    {
      title: "Smart Scheduling",
      desc: "Optimize your agenda with AI-driven planning.",
      icon: Calendar,
    },
    {
      title: "Live Navigation",
      desc: "Discover the best sessions across all venues.",
      icon: MapPin,
    },
    {
      title: "AI Assistant",
      desc: "Ask questions and book sessions instantly.",
      icon: MessageSquare,
    },
    {
      title: "Unified Dashboard",
      desc: "Manage everything in one premium workspace.",
      icon: LayoutDashboard,
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen w-full px-6 py-16 text-white sm:px-10 lg:px-16">
        <div className="relative mx-auto grid max-w-6xl gap-16">
          <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_25%)]" />
          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-indigo-300 shadow-glow">
                <Zap size={16} /> EventMate AI
              </span>

              <div className="space-y-6">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Premium AI for event planning and venue management.
                </h1>
                <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                  Build better schedules, discover sessions, and let AI recommend the best events for your audience.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3" onClick={handleStart}>
                  Get Started <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate("/events")}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-200 transition hover:border-indigo-300/30 hover:bg-white/10"
                >
                  Explore events
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_35px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <div className="space-y-5">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="text-indigo-300">AI event intelligence</span>
                  <span className="text-slate-500">Launch ready</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Designed for planners, venues, and teams.</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Save time with a polished workspace that keeps your schedule, chats, and bookings in sync.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {features.slice(0, 2).map((feature) => (
                    <div key={feature.title} className="rounded-3xl bg-slate-950/70 p-4">
                      <feature.icon size={20} className="mb-3 text-indigo-400" />
                      <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                      <p className="mt-2 text-sm text-slate-400">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-black/20"
              >
                <feature.icon className="mb-4 text-indigo-400" size={24} />
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-sm text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-[0_35px_80px_rgba(15,23,42,0.25)] backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-white">Launch your AI event command center.</h2>
            <p className="mt-3 max-w-2xl mx-auto text-sm text-slate-300">
              Grow your event operations with premium workflows, rich insights, and instant AI support.
            </p>
            <button onClick={handleStart} className="mt-8 btn-primary inline-flex items-center justify-center gap-2 px-8 py-3">
              Start your journey
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
