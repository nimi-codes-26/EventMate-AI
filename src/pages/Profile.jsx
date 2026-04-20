import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { dbAPI } from "../services/firebase";
import toast from "react-hot-toast";
import { Save, User } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function Profile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    bio: "",
    organization: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      const data = await dbAPI.getProfile(currentUser.uid);
      if (data) {
        setFormData({
          fullName: data.fullName || currentUser.displayName || "",
          phone: data.phone || "",
          bio: data.bio || "",
          organization: data.organization || "",
        });
      }
      setLoading(false);
    };

    loadProfile();
  }, [currentUser]);

  const initials = (name) => {
    if (!name) return currentUser?.email?.[0]?.toUpperCase() || "E";
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dbAPI.updateProfile(currentUser.uid, {
        ...formData,
        email: currentUser.email,
      });
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error("Failed to update profile");
      console.error(err);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
          Loading profile...
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl space-y-8 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-[#0b1220]/95 p-8 shadow-glow">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-sky-400 text-3xl font-bold text-white shadow-lg shadow-indigo-500/20">
                {initials(formData.fullName)}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Your profile</p>
                <h1 className="mt-3 text-3xl font-semibold">Manage your account</h1>
                <p className="text-sm text-slate-400">Keep your bio, organization and contact details up to date.</p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300">
              {currentUser?.email}
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-[#0b1220]/90 p-8 shadow-[0_35px_120px_rgba(15,23,42,0.35)]">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Full name</label>
                <input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Jane Doe"
                  className="input-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Organization</label>
                <input
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Acme Events"
                  className="input-base"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Email</label>
                <input value={currentUser.email} readOnly className="input-base bg-[#111827] opacity-70 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Phone</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 123 456 7890"
                  className="input-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Bio</label>
              <textarea
                rows="5"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Describe your role and event goals..."
                className="input-base"
              />
            </div>

            <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3">
              <Save size={18} /> Save profile
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
