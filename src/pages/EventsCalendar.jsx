import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { dbAPI } from "../services/firebase";
import { useHubStore } from "../store/useHubStore";
import { useAuth } from "../context/AuthContext";
import { format, isSameDay, addDays, isAfter, isBefore } from "date-fns";
import { Clock, MapPin, CalendarCheck } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";

export default function EventsCalendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const { hubs } = useHubStore();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const data = await dbAPI.getEvents();
      setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const handleBook = async (eventId) => {
    if (!currentUser) return toast.error("Login required");

    try {
      await dbAPI.bookSession(currentUser.uid, eventId);
      toast.success("Booked successfully");
    } catch {
      toast.error("Booking failed");
    }
  };

  const filteredEvents = events
    .filter((evt) => evt.datetime && isSameDay(new Date(evt.datetime), date))
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  const totalForDate = filteredEvents.length;
  const weekEvents = events.filter((evt) => {
    if (!evt.datetime) return false;
    const eventDate = new Date(evt.datetime);
    return isAfter(eventDate, date) && isBefore(eventDate, addDays(date, 7));
  }).length;

  return (
    <PageTransition>
      <div className="space-y-8 max-w-6xl mx-auto text-white">
        <div className="glass-panel p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Event planner</p>
              <h1 className="mt-3 text-3xl font-semibold">Event Calendar</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Browse daily sessions, book your next meeting, and manage every hub from one premium dashboard.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Selected date</p>
                <p className="mt-2 text-lg font-semibold text-white">{format(date, "EEEE, MMMM d")}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Events this day</p>
                <p className="mt-2 text-lg font-semibold text-white">{totalForDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <section className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">Calendar view</h2>
            <div className="rounded-[1.75rem] overflow-hidden border border-white/10">
              <Calendar onChange={setDate} value={date} className="rounded-[1.75rem] overflow-hidden" />
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-300">
              <div className="rounded-3xl border border-white/10 bg-[#0b1220]/80 p-4">
                <p className="text-slate-400">Upcoming this week</p>
                <p className="mt-2 text-lg font-semibold text-white">{weekEvents} sessions</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0b1220]/80 p-4">
                <p className="text-slate-400">Book faster</p>
                <p className="mt-2 text-lg font-semibold text-white">Tap any session to reserve your spot</p>
              </div>
            </div>
          </section>

          <section className="glass-panel p-6">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-semibold">Sessions for {format(date, "MMM d")}</h2>
                <p className="text-sm text-slate-400">{totalForDate} event{totalForDate === 1 ? "" : "s"} found</p>
              </div>
              <span className="badge">{events.length} total events</span>
            </div>

            {loading ? (
              <div className="space-y-4">
                <div className="h-28 rounded-3xl bg-white/5 animate-pulse" />
                <div className="h-28 rounded-3xl bg-white/5 animate-pulse" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-white/10 bg-[#0b1220]/80 p-10 text-center text-slate-400">
                No events are scheduled for this day. Select another date or add a hub from the admin panel.
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredEvents.map((evt) => {
                  const hubName = hubs.find((h) => h.id === evt.hubId)?.name || "Unknown";
                  return (
                    <motion.article
                      key={evt.id}
                      whileHover={{ y: -4 }}
                      className="card"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-white">{evt.title}</h3>
                          <p className="mt-3 text-sm text-slate-400">{evt.desc}</p>
                        </div>
                        <button
                          onClick={() => handleBook(evt.id)}
                          className="btn-primary rounded-full px-6 py-3 text-sm"
                        >
                          <CalendarCheck size={16} />
                          Reserve
                        </button>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-400">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                          <Clock size={14} /> {evt.time}
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                          <MapPin size={14} /> {hubName}
                        </span>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageTransition>
  );
}
