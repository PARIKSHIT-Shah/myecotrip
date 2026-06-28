import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-pine text-parchment flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-forest/60 border border-sage/15 rounded-2xl p-8 backdrop-blur-sm"
      >
        <Link to="/" className="font-display text-lg mb-8 inline-block">
          MY ECO TRIP
        </Link>
        <h1 className="font-display text-3xl mb-2">Welcome back</h1>
        <p className="text-sage text-sm mb-8">Log in to see your trips.</p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wide text-sage mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-pine/70 border border-sage/20 rounded-lg px-4 py-3 text-parchment placeholder:text-sage/40 focus:border-moss outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wide text-sage mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              className="w-full bg-pine/70 border border-sage/20 rounded-lg px-4 py-3 text-parchment placeholder:text-sage/40 focus:border-moss outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber text-pine font-semibold rounded-full py-3.5 hover:bg-amber/90 transition-colors disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-sage text-sm mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-amber hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
