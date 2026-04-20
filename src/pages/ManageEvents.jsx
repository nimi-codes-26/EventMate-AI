import { useEffect, useState } from "react";
import { dbAPI } from "../services/firebase";
import { useHubStore } from "../store/useHubStore";
import toast from "react-hot-toast";
import { Edit3, Plus, Trash2, Save, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "../components/PageTransition";

export default function ManageEvents() {
  const { hubs, fetchHubs, loading: loadingHubs } = useHubStore();
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedHub, setSelectedHub] = useState(null);

  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    hubId: "",
    desc: "",
  });

  const [hubForm, setHubForm] = useState({
    name: "",
    location: "",
    description: "",
  });

  useEffect(() => {
    fetchHubs();
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoadingEvents(true);
    const data = await dbAPI.getEvents();
    setEvents(
      data
        .map((event) => ({
          ...event,
          datetime: event.datetime || `${event.date}T${event.time}`,
        }))
        .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    );
    setLoadingEvents(false);
  };

  const resetEventForm = () => {
    setSelectedEvent(null);
    setEventForm({ title: "", date: "", time: "", hubId: "", desc: "" });
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    if (!eventForm.title || !eventForm.date || !eventForm.time || !eventForm.hubId) {
      return toast.error("Fill all required event fields.");
    }

    const datetime = new Date(`${eventForm.date}T${eventForm.time}`).toISOString();
    const payload = { ...eventForm, datetime };

    try {
      if (selectedEvent) {
        await dbAPI.updateEvent(selectedEvent.id, payload);
        toast.success("Event updated successfully.");
      } else {
        await dbAPI.addEvent(payload);
        toast.success("Event created successfully.");
      }

      resetEventForm();
      loadEvents();
    } catch (error) {
      toast.error("Could not save event.");
      console.error(error);
    }
  };

  const handleHubSubmit = async (e) => {
    e.preventDefault();

    if (!hubForm.name || !hubForm.location) {
      return toast.error("Hub name and location are required.");
    }

    try {
      if (selectedHub) {
        await dbAPI.updateHub(selectedHub.id, hubForm);
        toast.success("Hub updated successfully.");
      } else {
        await dbAPI.addHub(hubForm);
        toast.success("Hub added successfully.");
      }

      setHubForm({ name: "", location: "", description: "" });
      setSelectedHub(null);
      fetchHubs();
    } catch (error) {
      toast.error("Could not save hub.");
      console.error(error);
    }
  };

  const handleDeleteEvent = async (id) => {
    const confirmed = window.confirm("Delete this event permanently?");
    if (!confirmed) return;

    try {
      await dbAPI.deleteEvent(id);
      toast.success("Event deleted.");
      loadEvents();
    } catch (error) {
      toast.error("Failed to delete event.");
    }
  };

  const handleDeleteHub = async (id) => {
    const confirmed = window.confirm("Delete this hub and remove it from active navigation?");
    if (!confirmed) return;

    try {
      await dbAPI.deleteHub(id);
      toast.success("Hub deleted.");
      fetchHubs();
    } catch (error) {
      toast.error("Failed to delete hub.");
    }
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    const date = event.datetime ? new Date(event.datetime).toISOString().slice(0, 10) : event.date;
    setEventForm({
      title: event.title,
      date,
      time: event.time,
      hubId: event.hubId,
      desc: event.desc,
    });
  };

  const handleEditHub = (hub) => {
    setSelectedHub(hub);
    setHubForm({
      name: hub.name,
      location: hub.location,
      description: hub.description || "",
    });
  };

  return (
    <PageTransition>
      <div className="space-y-8 text-white">
        <div className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">
          <div className="glass-panel border-white/10 p-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Platform control</p>
                <h1 className="mt-3 text-3xl font-semibold">Hub & Event management</h1>
              </div>
              <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                {selectedEvent ? "Edit mode active" : "Create new assets"}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <section className="rounded-[2rem] border border-white/10 bg-[#0f172a]/80 p-5 shadow-glow">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-semibold">Create event</h2>
                    <p className="text-sm text-slate-400">Add or update session details.</p>
                  </div>
                  <div className="badge">
                    <Plus size={16} /> {selectedEvent ? "Edit" : "New"}
                  </div>
                </div>

                <form onSubmit={handleEventSubmit} className="glass-form">
                  <div className="form-group">
                    <label>Event title</label>
                    <input
                      className="input-base"
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      placeholder="AI keynote session"
                      required
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        className="input-base"
                        type="date"
                        value={eventForm.date}
                        onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Time</label>
                      <input
                        className="input-base"
                        type="time"
                        value={eventForm.time}
                        onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Event hub</label>
                    <select
                      className="input-base"
                      value={eventForm.hubId}
                      onChange={(e) => setEventForm({ ...eventForm, hubId: e.target.value })}
                      required
                    >
                      <option value="" disabled>
                        Select a hub location
                      </option>
                      {hubs.map((hub) => (
                        <option key={hub.id} value={hub.id}>{hub.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="input-base"
                      rows="4"
                      value={eventForm.desc}
                      onChange={(e) => setEventForm({ ...eventForm, desc: e.target.value })}
                      placeholder="Add a short event summary"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="submit" className="btn-primary">
                      <Save size={16} /> {selectedEvent ? "Update event" : "Create event"}
                    </button>
                    {selectedEvent && (
                      <button type="button" onClick={resetEventForm} className="border border-white/10 rounded-3xl px-5 py-3 text-sm text-slate-300 hover:bg-white/5 transition">
                        <XCircle size={16} /> Cancel edit
                      </button>
                    )}
                  </div>
                </form>
              </section>

              <section className="rounded-[2rem] border border-white/10 bg-[#0f172a]/80 p-5 shadow-glow">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedHub ? "Edit hub" : "Create hub"}</h2>
                    <p className="text-sm text-slate-400">{selectedHub ? "Update existing venue details." : "Add an event location to your network."}</p>
                  </div>
                  <div className="badge">Hub</div>
                </div>

                <form onSubmit={handleHubSubmit} className="glass-form">
                  <div className="form-group">
                    <label>Hub name</label>
                    <input
                      className="input-base"
                      value={hubForm.name}
                      onChange={(e) => setHubForm({ ...hubForm, name: e.target.value })}
                      placeholder="Center stage"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      className="input-base"
                      value={hubForm.location}
                      onChange={(e) => setHubForm({ ...hubForm, location: e.target.value })}
                      placeholder="Building 2, Floor 1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="input-base"
                      rows="3"
                      value={hubForm.description}
                      onChange={(e) => setHubForm({ ...hubForm, description: e.target.value })}
                      placeholder="Add capacity or venue notes"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2">
                      <Plus size={16} /> {selectedHub ? "Save hub" : "Add hub"}
                    </button>
                    {selectedHub && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHub(null);
                          setHubForm({ name: "", location: "", description: "" });
                        }}
                        className="border border-white/10 rounded-3xl px-5 py-3 text-sm text-slate-300 hover:bg-white/5 transition"
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>
                </form>
              </section>
            </div>
          </div>

          <div className="space-y-6">
            <section className="glass-panel border-white/10 p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-2xl font-semibold">Infrastructure status</h2>
                  <p className="text-sm text-slate-400">Manage hubs and published event sessions.</p>
                </div>
                <div className="badge">Live</div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {loadingHubs ? (
                  <div className="card">Loading hubs...</div>
                ) : hubs.length === 0 ? (
                  <div className="card">No hubs yet. Add one to begin.</div>
                ) : (
                  hubs.map((hub) => {
                    const eventCount = events.filter((evt) => evt.hubId === hub.id).length;
                    return (
                      <motion.div key={hub.id} whileHover={{ y: -4 }} className="card">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="card-title">{hub.name}</h3>
                            <p className="card-desc">{hub.location}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEditHub(hub)} className="badge" title="Edit hub">
                              <Edit3 size={14} /> Edit
                            </button>
                            <button onClick={() => handleDeleteHub(hub.id)} className="logout-btn" title="Delete hub">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="card-desc">{hub.description || "No description provided."}</p>
                          <span className="badge">{eventCount} events</span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="glass-panel border-white/10 p-6">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-2xl font-semibold">Published events</h2>
                  <p className="text-sm text-slate-400">Review, edit, or remove scheduled sessions.</p>
                </div>
                <span className="badge">{events.length} total</span>
              </div>

              {loadingEvents ? (
                <div className="card">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="card">No events scheduled yet.</div>
              ) : (
                <div className="grid gap-4">
                  {events.map((evt) => (
                    <motion.div key={evt.id} whileHover={{ y: -4 }} className="card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="card-title">{evt.title}</h3>
                          <div className="card-meta">
                            <span>{evt.date || new Date(evt.datetime).toLocaleDateString()}</span>
                            <span>{evt.time}</span>
                            <span>{hubs.find((hub) => hub.id === evt.hubId)?.name || "No hub"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEditEvent(evt)} className="badge">
                            <Edit3 size={14} /> Edit
                          </button>
                          <button onClick={() => handleDeleteEvent(evt.id)} className="logout-btn" title="Delete event">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="card-desc mt-4">{evt.desc || "No description."}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
