import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PlanTripModal({ open, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    members: 1,
    budget: "",
    currency: "USD",
    preferences: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.destination.trim()) {
      setError("Please tell us where you're headed.");
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError("Please select both a start and end date.");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("Your end date can't be before your start date.");
      return;
    }
    if (Number(form.members) < 1) {
      setError("There must be at least 1 traveler.");
      return;
    }
    if (form.budget === "" || Number(form.budget) < 0) {
      setError("Please enter a valid budget.");
      return;
    }

    onSubmit(form);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-pine/80 backdrop-blur-sm px-4 py-8 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && !submitting && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-lg bg-forest border border-sage/15 rounded-2xl p-8 my-auto"
          >
            <button
              onClick={() => !submitting && onClose()}
              aria-label="Close"
              className="absolute top-5 right-5 text-sage hover:text-parchment transition-colors text-2xl leading-none"
            >
              &times;
            </button>

            <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber mb-3">
              New trip
            </p>
            <h2 className="font-display text-2xl mb-6">
              Tell the planner where you're going
            </h2>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-red-900/30 border border-red-700/40 text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="destination" className="block text-xs font-mono uppercase tracking-wide text-sage mb-2">
                  Place
                </label>
                <input
                  id="destination"
                  name="destination"
                  type="text"
                  value={form.destination}
                  onChange={handleChange}
                  placeholder="e.g. Kyoto, Japan"
                  className="w-full bg-pine/70 border border-sage/20 rounded-lg px-4 py-3 text-parchment placeholder:text-sage/40 focus:border-moss outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-xs font-mono uppercase tracking-wide text-sage mb-2">
                    Start date
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    className="w-full bg-pine/70 border border-sage/20 rounded-lg px-4 py-3 text-parchment focus:border-moss outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-xs font-mono uppercase tracking-wide text-sage mb-2">
                    End date
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    className="w-full bg-pine/70 border border-sage/20 rounded-lg px-4 py-3 text-parchment focus:border-moss outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="members" className="block text-xs font-mono uppercase tracking-wide text-sage mb-2">
                    Travelers
                  </label>
                  <input
                    id="members"
                    name="members"
                    type="number"
                    min={1}
                    value={form.members}
                    onChange={handleChange}
                    className="w-full bg-pine/70 border border-sage/20 rounded-lg px-4 py-3 text-parchment focus:border-moss outline-none transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="budget" className="block text-xs font-mono uppercase tracking-wide text-sage mb-2">
                    Budget
                  </label>
                  <div className="flex gap-2">
                    <select
                      name="currency"
                      value={form.currency}
                      onChange={handleChange}
                      className="bg-pine/70 border border-sage/20 rounded-lg px-2 py-3 text-parchment focus:border-moss outline-none transition-colors text-sm"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                    <input
                      id="budget"
                      name="budget"
                      type="number"
                      min={0}
                      value={form.budget}
                      onChange={handleChange}
                      placeholder="1200"
                      className="w-full bg-pine/70 border border-sage/20 rounded-lg px-4 py-3 text-parchment placeholder:text-sage/40 focus:border-moss outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="preferences" className="block text-xs font-mono uppercase tracking-wide text-sage mb-2">
                  Preferences <span className="text-sage/50">(optional)</span>
                </label>
                <textarea
                  id="preferences"
                  name="preferences"
                  rows={3}
                  value={form.preferences}
                  onChange={handleChange}
                  placeholder="e.g. love hiking, prefer trains over flights, vegetarian meals"
                  className="w-full bg-pine/70 border border-sage/20 rounded-lg px-4 py-3 text-parchment placeholder:text-sage/40 focus:border-moss outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber text-pine font-semibold rounded-full py-3.5 hover:bg-amber/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-pine/40 border-t-pine rounded-full animate-spin" />
                    Planning your trip...
                  </>
                ) : (
                  "Generate my itinerary"
                )}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
