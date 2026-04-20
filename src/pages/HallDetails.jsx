import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { dbAPI } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useHubStore } from "../store/useHubStore";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, CalendarCheck } from "lucide-react";
import PageTransition from "../components/PageTransition";
import EmptyState from "../components/EmptyState";

export default function HallDetails() {
  const { hubId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { hubs, fetchHubs } = useHubStore();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentHub = hubs.find((h) => h.id === hubId);

  useEffect(() => {
    if (hubs.length === 0) {
      fetchHubs();
    }
  }, [hubs.length, fetchHubs]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const data = await dbAPI.getEventsByHub(hubId);
      data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
      setEvents(data);
      setLoading(false);
    };
    if (hubId) fetchEvents();
  }, [hubId]);

  const handleBook = async (eventId) => {
    if (!currentUser) return toast.error("Please sign in to book sessions");
    try {
      await dbAPI.bookSession(currentUser.uid, eventId);
      toast.success("Successfully booked your spot!");
    } catch (e) {
      toast.error("Booking failed");
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-surface/80 p-6 shadow-glow">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft size={18} /> Back to events
          </button>
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-indigo-300">Hub overview</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{currentHub?.name || "Event hub details"}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Browse the schedule for {currentHub?.name || "this location"} and book sessions instantly.
              {currentHub?.description ? ` ${currentHub.description}` : ""}
            </p>
          </div>
        </div>

        {loading ? (
          <EmptyState
            icon={Clock}
            title="Loading hub schedule"
            desc="Fetching events and preparing your experience."
          />
        ) : events.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No events scheduled"
            desc="This hub doesn't have any sessions yet. Check other locations or come back soon."
            action={
              <button className="btn-primary" onClick={() => navigate("/events")}>Explore events</button>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {events.map((evt) => (
              <motion.article
                key={evt.id}
                whileHover={{ y: -4 }}
                className="rounded-[2rem] border border-white/10 bg-[#0f172a]/80 p-6 shadow-xl shadow-black/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{evt.title}</h2>
                    <div className="mt-3 flex flex-col gap-2 text-sm text-slate-400">
                      <span className="inline-flex items-center gap-2">
                        <Clock size={16} /> {evt.time}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin size={16} /> {currentHub?.name || "Venue"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBook(evt.id)}
                    className="btn-primary rounded-full px-5 py-3 text-sm"
                  >
                    <CalendarCheck size={18} /> Book
                  </button>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-slate-400">{evt.desc}</p>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
