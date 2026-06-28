import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import EcoGlobe from "../components/EcoGlobe";

const FEATURES = [
  {
    label: "Tell us your trip",
    title: "Place, dates, crew, budget",
    body: "Drop in your destination, travel window, group size, and budget. That's all the planner needs to start.",
  },
  {
    label: "AI builds the route",
    title: "A day-by-day itinerary",
    body: "Get a full plan: activities, eco tips, and rough costs for every single day of your trip.",
  },
  {
    label: "Travel lighter",
    title: "Lower impact by default",
    body: "Every plan favors local stays, low-carbon transport, and small-footprint experiences over the obvious tourist trail.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-pine text-parchment overflow-x-hidden">
      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6">
        <span className="font-display text-xl tracking-wide">
          MY ECO TRIP
        </span>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-sage hover:text-parchment transition-colors px-4 py-2"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-moss hover:bg-moss/80 transition-colors px-5 py-2 rounded-full font-medium"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 md:px-12 pt-6 pb-24 grid md:grid-cols-2 gap-8 items-center">
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-mono text-xs uppercase tracking-[0.2em] text-amber mb-6"
          >
            Eco-first AI trip planning
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-6xl leading-[1.05] mb-6"
          >
            Plan trips that{" "}
            <span className="text-moss italic">tread lightly</span>{" "}
            on the planet.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sage text-lg max-w-md mb-8"
          >
            Give us your place, dates, group, and budget. Our AI builds a
            sustainable day-by-day itinerary in seconds — pins on the globe
            mark where past travelers have gone.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <Link
              to="/register"
              className="relative inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-amber text-pine font-semibold overflow-hidden group"
            >
              <span className="absolute inset-0 rounded-full border-2 border-amber animate-pulseRing" />
              Plan my first trip
            </Link>
            <a
              href="#how-it-works"
              className="text-sm text-parchment/80 hover:text-parchment underline underline-offset-4"
            >
              See how it works
            </a>
          </motion.div>
        </div>

        {/* Globe */}
        <div className="relative h-[420px] md:h-[560px]">
          <div className="absolute inset-0 bg-radial-glow" />
          <EcoGlobe className="absolute inset-0" />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 md:px-12 py-24 bg-forest/40 border-t border-sage/10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber mb-4">
          How it works
        </p>
        <h2 className="font-display text-3xl md:text-4xl mb-14 max-w-xl">
          Three inputs. One ready-to-go itinerary.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-pine/60 border border-sage/15 rounded-2xl p-7 hover:border-moss/50 transition-colors"
            >
              <p className="font-mono text-xs text-moss mb-4">{f.label}</p>
              <h3 className="font-display text-xl mb-3">{f.title}</h3>
              <p className="text-sage text-sm leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="px-6 md:px-12 py-24 text-center">
        <h2 className="font-display text-3xl md:text-4xl mb-6 max-w-2xl mx-auto">
          Your next trip is one form away.
        </h2>
        <Link
          to="/register"
          className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-moss hover:bg-moss/80 transition-colors font-semibold"
        >
          Create your free account
        </Link>
      </section>

      <footer className="px-6 md:px-12 py-8 text-center text-xs text-sage/60 border-t border-sage/10">
        MY ECO TRIP — plan less, wander further, leave less behind.
      </footer>
    </div>
  );
}
