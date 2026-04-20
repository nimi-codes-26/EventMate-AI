import { useState, useEffect } from "react";
import { dbAPI } from "../services/firebase";
import { useHubStore } from "../store/useHubStore";
import { useAuth } from "../context/AuthContext";
import { format, isFuture } from "date-fns";
import { Clock, MapPin, FastForward, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const { hubs } = useHubStore();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      const data = await dbAPI.getEvents();

      const futureEvents = data
        .filter((evt) => evt.datetime && isFuture(new Date(evt.datetime)))
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

      setEvents(futureEvents);
      setLoading(false);
    };

    fetchUpcoming();
  }, []);

  const handleBook = async (eventId) => {
    if (!currentUser) return toast.error("Please login first");

    try {
      await dbAPI.bookSession(currentUser.uid, eventId);
      toast.success("Event booked!");
    } catch {
      toast.error("Booking failed");
    }
  };

  const nextEvent = events[0];

  return (
    <PageTransition>
      <div className="space-y-8 max-w-6xl mx-auto text-white">
        <div className="glass-panel p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200">
                <FastForward size={16} /> Upcoming events
              </div>
              <h1 className="mt-4 text-3xl font-semibold">Stay ahead of every session</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Discover the most important sessions across hubs and reserve your seat instantly.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-slate-300">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Next available</p>
                <p className="mt-3 text-lg font-semibold text-white">{nextEvent ? format(new Date(nextEvent.datetime), "MMM d, h:mm a") : "None scheduled"}</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-slate-300">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total ahead</p>
                <p className="mt-3 text-lg font-semibold text-white">{events.length} sessions</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="glass-panel p-8 space-y-4">
            <div className="h-24 rounded-3xl bg-white/5 animate-pulse" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-52 rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="glass-panel p-8 text-center text-slate-400">
            <h2 className="text-xl font-semibold text-white">No upcoming events found</h2>
            <p className="mt-3">Once events are added to your hubs they will appear here.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => {
              const hubName = hubs.find((h) => h.id === evt.hubId)?.name || "Global";

              return (
                <motion.div
                  key={evt.id}
                  whileHover={{ y: -4 }}
                  className="card flex flex-col"
                >
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">{format(new Date(evt.datetime), "EEEE, MMM d")}</p>
                    <h3 className="mt-3 text-xl font-semibold text-white">{evt.title}</h3>
                    <p className="mt-3 text-sm text-slate-400 leading-relaxed">{evt.desc}</p>
                  </div>

                  <div className="mt-5 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                        <Clock size={14} /> {evt.time}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                        <MapPin size={14} /> {hubName}
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => handleBook(evt.id)}
                        className="btn-primary rounded-full px-4 py-3 text-sm"
                      >
                        <CalendarCheck size={16} /> Book
                      </button>
                      <Link
                        to={`/hubs/${evt.hubId}`}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-slate-200 hover:bg-white/10 transition"
                      >
                        View hub
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}