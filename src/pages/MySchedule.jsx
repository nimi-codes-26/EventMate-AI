import { useState, useEffect } from "react";
import { dbAPI } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useHubStore } from "../store/useHubStore";
import toast from "react-hot-toast";
import { CalendarX2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import PageTransition from "../components/PageTransition";

export default function MySchedule() {
  const { currentUser } = useAuth();
  const { hubs } = useHubStore();
  const [bookedEvents, setBookedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const bookings = await dbAPI.getUserBookings(currentUser.uid);
      const bookedIds = bookings.map((b) => b.eventId);

      const allEvents = await dbAPI.getEvents();

      const myAgenda = allEvents
        .filter((e) => bookedIds.includes(e.id))
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

      setBookedEvents(myAgenda);
    } catch (e) {
      toast.error("Failed to load schedule");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSchedule();
  }, [currentUser]);

  const handleCancel = async (eventId) => {
    try {
      await dbAPI.cancelBooking(currentUser.uid, eventId);
      toast.success("Booking cancelled");
      fetchSchedule();
    } catch {
      toast.error("Cancel failed");
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8 max-w-6xl mx-auto text-white">
        <div className="glass-panel p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">My schedule</p>
              <h1 className="mt-3 text-3xl font-semibold">Your booked sessions</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Keep your agenda on track with a polished view of all confirmed sessions and venues.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-slate-300">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total bookings</p>
                <p className="mt-3 text-lg font-semibold text-white">{bookedEvents.length}</p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-slate-300">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Next session</p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {bookedEvents[0] ? format(new Date(bookedEvents[0].datetime), "MMM d, h:mm a") : "No upcoming bookings"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="glass-panel p-8 text-slate-300">
            <div className="h-24 rounded-3xl bg-white/5 animate-pulse" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-60 rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        ) : bookedEvents.length === 0 ? (
          <div className="glass-panel p-10 text-center text-slate-400">
            <h2 className="text-xl font-semibold text-white">No bookings yet</h2>
            <p className="mt-3">Explore events and reserve sessions to build your agenda.</p>
            <Link to="/events" className="btn-primary mt-6 inline-flex items-center justify-center gap-2 px-6 py-3">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookedEvents.map((evt) => {
              const hubName = hubs.find((h) => h.id === evt.hubId)?.name || "Unknown";

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
                  <div className="mt-6 flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2 text-sm text-slate-400">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                        🕒 {evt.time}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                        📍 {hubName}
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => handleCancel(evt.id)}
                        className="border border-red-400 text-red-400 rounded-full px-4 py-3 text-sm hover:bg-red-500/10 transition"
                      >
                        <CalendarX2 size={16} /> Cancel
                      </button>
                      <Link
                        to={`/hubs/${evt.hubId}`}
                        className="rounded-full bg-indigo-500 px-4 py-3 text-center text-sm text-white hover:bg-indigo-600 transition"
                      >
                        View hub <ArrowRight size={16} />
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