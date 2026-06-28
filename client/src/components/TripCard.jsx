import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const STATUS_STYLES = {
  ready: "bg-moss/20 text-moss border-moss/40",
  generating: "bg-amber/20 text-amber border-amber/40",
  failed: "bg-red-900/30 text-red-300 border-red-700/40",
};

const STATUS_LABEL = {
  ready: "Ready",
  generating: "Planning...",
  failed: "Failed",
};

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function TripCard({ trip, onDelete, onRetry }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="bg-forest/50 border border-sage/15 rounded-2xl p-6 hover:border-moss/40 transition-colors flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-display text-xl">{trip.destination}</h3>
        <span
          className={`text-[10px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_STYLES[trip.status]}`}
        >
          {STATUS_LABEL[trip.status]}
        </span>
      </div>

      <p className="font-mono text-xs text-sage mb-4">
        {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
      </p>

      <div className="flex items-center gap-4 text-sm text-sage/80 mb-4">
        <span>{trip.members} traveler{trip.members > 1 ? "s" : ""}</span>
        <span>·</span>
        <span>
          {trip.budget} {trip.currency}
        </span>
        {trip.ecoScore != null && (
          <>
            <span>·</span>
            <span className="text-amber">Eco {trip.ecoScore}/100</span>
          </>
        )}
      </div>

      {trip.aiSummary && (
        <p className="text-sm text-parchment/80 mb-5 line-clamp-3">{trip.aiSummary}</p>
      )}

      <div className="mt-auto flex items-center gap-3 pt-2">
        {trip.status === "ready" && (
          <Link
            to={`/trips/${trip._id}`}
            className="text-sm bg-moss hover:bg-moss/80 transition-colors px-4 py-2 rounded-full font-medium"
          >
            View itinerary
          </Link>
        )}
        {trip.status === "failed" && (
          <button
            onClick={() => onRetry(trip._id)}
            className="text-sm bg-amber text-pine hover:bg-amber/90 transition-colors px-4 py-2 rounded-full font-medium"
          >
            Retry planning
          </button>
        )}
        {trip.status === "generating" && (
          <span className="text-sm text-sage flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-sage/40 border-t-sage rounded-full animate-spin" />
            Generating...
          </span>
        )}
        <button
          onClick={() => onDelete(trip._id)}
          className="text-sm text-sage/60 hover:text-red-300 transition-colors ml-auto"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}
