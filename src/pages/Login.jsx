import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";
import PageTransition from "../components/PageTransition";

export default function Login() {
  const { loginWithEmail, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (currentUser) {
      navigate("/chat");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      toast.success("Welcome back!");
      navigate("/chat");
    } catch (err) {
      toast.error(err.message || "Login failed");
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      toast.success("Signed in successfully!");
      navigate("/chat");
    } catch (err) {
      toast.error(err.message || "Google login failed");
    }

    setGoogleLoading(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-[#050714] text-white sm:px-10">
        <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f172a]/80 p-8 shadow-[0_35px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-400/5" />
          <div className="relative z-10 space-y-8">
            <div className="text-center space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Welcome back</p>
              <h2 className="text-3xl font-bold">Sign in to EventMate AI</h2>
              <p className="text-sm text-slate-300">
                Continue managing your events, schedule, and AI chat assistant.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm text-slate-300">
                Email
                <input
                  ref={emailRef}
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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full inline-flex items-center justify-center gap-2 px-6 py-3"
              >
                <LogIn size={18} />
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="h-px flex-1 bg-white/10" />
              <span>OR</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full rounded-3xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-white transition hover:border-indigo-300/30 hover:bg-white/10"
            >
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>

            <p className="text-center text-sm text-slate-400">
              Don’t have an account?{' '}
              <Link to="/register" className="text-indigo-300 hover:text-indigo-200">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
