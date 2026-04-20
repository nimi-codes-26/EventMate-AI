import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import PageTransition from "../components/PageTransition";

export default function Register() {
  const { registerWithEmail, currentUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate("/chat");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await registerWithEmail(email, password);
      toast.success("Account created successfully");
      navigate("/chat");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#050714] text-white sm:px-10">
        <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f172a]/80 p-8 shadow-[0_35px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-sky-400/5" />
          <div className="relative z-10 space-y-6">
            <div className="space-y-3 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Create your account</p>
              <h2 className="text-3xl font-bold">Join EventMate AI</h2>
              <p className="text-sm text-slate-300">
                Register to save schedules, book sessions, and chat with your AI event planner.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm text-slate-300">
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
                />
              </label>

              <label className="block text-sm text-slate-300">
                Password
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
                />
              </label>

              <label className="block text-sm text-slate-300">
                Confirm Password
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-3xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 px-6 py-3"
              >
                <UserPlus size={18} />
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-300 hover:text-indigo-200">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
