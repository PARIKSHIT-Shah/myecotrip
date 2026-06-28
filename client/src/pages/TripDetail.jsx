import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/client";
import Navbar from "../components/Navbar";

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTrip() {
      try {
        const { data } = await api.get(`/trips/${id}`);
        setTrip(data.trip);
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't load this trip.");
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pine text-parchment">
        <Navbar />
        <div className="text-sage py-20 text-center">Loading trip...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-pine text-parchment">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-red-300 mb-4">{error || "Trip not found."}</p>
          <button onClick={() => navigate("/dashboard")} className="text-amber underline">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pine text-parchment">
      <Navbar />

      <main className="px-6 md:px-12 py-10 max-w-4xl mx-auto">
        <Link to="/dashboard" className="text-sage hover:text-parchment text-sm mb-6 inline-block">
          ← Back to dashboard
        </Link>

        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber mb-3">
            {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
          </p>
          <h1 className="font-display text-4xl mb-4">{trip.destination}</h1>
          <div className="flex items-center gap-4 text-sm text-sage flex-wrap">
            <span>{trip.members} traveler{trip.members > 1 ? "s" : ""}</span>
            <span>·</span>
            <span>{trip.budget} {trip.currency} total budget</span>
            {trip.ecoScore != null && (
              <>
                <span>·</span>
                <span className="text-amber">Eco score {trip.ecoScore}/100</span>
              </>
            )}
          </div>
        </div>

        {trip.aiSummary && (
          <div className="bg-forest/50 border border-sage/15 rounded-2xl p-6 mb-6">
            <p className="font-mono text-xs uppercase tracking-wide text-moss mb-3">Trip overview</p>
            <p className="text-parchment/90 leading-relaxed">{trip.aiSummary}</p>
          </div>
        )}

        {(trip.bestTimeToVisit || trip.weatherNotes || trip.localTransportTips || trip.carbonFootprintEstimate) && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {trip.bestTimeToVisit && (
              <div className="bg-forest/40 border border-sage/15 rounded-2xl p-5">
                <p className="font-mono text-[10px] uppercase tracking-wide text-amber mb-2">
                  Best time to visit
                </p>
                <p className="text-sm text-parchment/85 leading-relaxed">{trip.bestTimeToVisit}</p>
              </div>
            )}
            {trip.weatherNotes && (
              <div className="bg-forest/40 border border-sage/15 rounded-2xl p-5">
                <p className="font-mono text-[10px] uppercase tracking-wide text-amber mb-2">
                  Weather
                </p>
                <p className="text-sm text-parchment/85 leading-relaxed">{trip.weatherNotes}</p>
              </div>
            )}
            {trip.localTransportTips && (
              <div className="bg-forest/40 border border-sage/15 rounded-2xl p-5">
                <p className="font-mono text-[10px] uppercase tracking-wide text-amber mb-2">
                  Getting around
                </p>
                <p className="text-sm text-parchment/85 leading-relaxed">{trip.localTransportTips}</p>
              </div>
            )}
            {trip.carbonFootprintEstimate && (
              <div className="bg-forest/40 border border-sage/15 rounded-2xl p-5">
                <p className="font-mono text-[10px] uppercase tracking-wide text-amber mb-2">
                  Carbon footprint
                </p>
                <p className="text-sm text-parchment/85 leading-relaxed">{trip.carbonFootprintEstimate}</p>
              </div>
            )}
          </div>
        )}

        {trip.stayOptions?.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-2xl mb-6">Where to stay</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {trip.stayOptions.map((stay, idx) => (
                <div key={idx} className="bg-forest/40 border border-sage/15 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-lg">{stay.name}</h3>
                    {stay.pricePerNight && (
                      <span className="font-mono text-xs text-amber">{stay.pricePerNight}/night</span>
                    )}
                  </div>
                  {stay.type && (
                    <span className="font-mono text-[10px] uppercase tracking-wide text-sage">{stay.type}</span>
                  )}
                  {stay.whyEco && (
                    <p className="text-sm text-parchment/80 mt-2">🌱 {stay.whyEco}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {trip.itinerary?.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-2xl mb-6">Day-by-day itinerary</h2>
            <div className="space-y-4">
              {trip.itinerary.map((day, i) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-forest/40 border border-sage/15 rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg">
                      Day {day.day}{day.title ? ` — ${day.title}` : ""}
                    </h3>
                    {day.estimatedCost && (
                      <span className="font-mono text-xs text-amber">{day.estimatedCost}</span>
                    )}
                  </div>
                  {day.activities?.length > 0 && (
                    <ul className="space-y-2.5 mb-4">
                      {day.activities.map((activity, idx) => (
                        <li key={idx} className="text-sm text-parchment/85 flex gap-2">
                          <span className="text-moss shrink-0">·</span>
                          <span>
                            {activity.time && (
                              <span className="font-mono text-[10px] uppercase tracking-wide text-sage mr-2">
                                {activity.time}
                              </span>
                            )}
                            {activity.description}
                            {activity.location && (
                              <span className="text-sage/70"> — {activity.location}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {day.localFoodHighlight && (
                    <p className="text-xs text-parchment/80 mb-3">
                      🍽️ <span className="text-sage">{day.localFoodHighlight}</span>
                    </p>
                  )}
                  {day.ecoTip && (
                    <p className="text-xs text-sage bg-pine/50 rounded-lg px-3 py-2 inline-block">
                      🌱 {day.ecoTip}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {trip.packingList?.length > 0 && (
          <div className="bg-forest/40 border border-sage/15 rounded-2xl p-6 mb-10">
            <h2 className="font-display text-xl mb-4">Packing list</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {trip.packingList.map((item, idx) => (
                <span key={idx} className="text-sm text-parchment/85 flex gap-2">
                  <span className="text-moss">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}