import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import PlanTripModal from "../components/PlanTripModal";
import TripCard from "../components/TripCard";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState("");

  const fetchTrips = useCallback(async () => {
    try {
      const { data } = await api.get("/trips");
      setTrips(data.trips);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Poll while any trip is still generating, so the UI updates without a manual refresh
  useEffect(() => {
    const hasGenerating = trips.some((t) => t.status === "generating");
    if (!hasGenerating) return;
    const interval = setInterval(fetchTrips, 4000);
    return () => clearInterval(interval);
  }, [trips, fetchTrips]);

  async function handleCreateTrip(form) {
    setSubmitting(true);
    setBanner("");
    try {
      const { data } = await api.post("/trips", form);
      setTrips((prev) => [data.trip, ...prev]);
      setModalOpen(false);
    } catch (err) {
      const message = err.response?.data?.message || "Couldn't create your trip. Please try again.";
      setBanner(message);
      if (err.response?.data?.trip) {
        setTrips((prev) => [err.response.data.trip, ...prev]);
        setModalOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    setTrips((prev) => prev.filter((t) => t._id !== id));
    try {
      await api.delete(`/trips/${id}`);
    } catch (err) {
      fetchTrips();
    }
  }

  async function handleRetry(id) {
    setTrips((prev) => prev.map((t) => (t._id === id ? { ...t, status: "generating" } : t)));
    try {
      const { data } = await api.post(`/trips/${id}/retry`);
      setTrips((prev) => prev.map((t) => (t._id === id ? data.trip : t)));
    } catch (err) {
      fetchTrips();
    }
  }

  return (
    <div className="min-h-screen bg-pine text-parchment">
      <Navbar />

      <main className="px-6 md:px-12 py-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber mb-3">
              Dashboard
            </p>
            <h1 className="font-display text-3xl md:text-4xl">
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-amber text-pine font-semibold whitespace-nowrap self-start"
          >
            <span className="absolute inset-0 rounded-full border-2 border-amber animate-pulseRing" />
            + Plan a new trip
          </button>
        </div>

        {banner && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-amber/15 border border-amber/30 text-amber text-sm">
            {banner}
          </div>
        )}

        {loading ? (
          <div className="text-sage py-20 text-center">Loading your trips...</div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-sage/20 rounded-2xl">
            <p className="font-display text-2xl mb-3">No trips yet</p>
            <p className="text-sage mb-6">
              Plan your first sustainable getaway — it takes about a minute.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-moss hover:bg-moss/80 transition-colors font-medium"
            >
              Plan a trip
            </button>
          </div>
        ) : (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {trips.map((trip) => (
                <TripCard key={trip._id} trip={trip} onDelete={handleDelete} onRetry={handleRetry} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <PlanTripModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateTrip}
        submitting={submitting}
      />
    </div>
  );
}
