require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const tripRoutes = require("./routes/trips");

const app = express();

// --- Middleware ---
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",");
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin requests (e.g. curl, server-to-server, same-origin)
      if (!origin) {
        return callback(null, true);
      }
      // Allow the explicitly configured origin(s)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow any Vercel deployment URL containing "myecotrip" (covers every
      // preview URL shape Vercel generates, while still blocking unrelated sites)
      if (/^https:\/\/.*myecotrip.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      // Don't throw — just decline CORS for this origin without crashing the request
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

// --- Routes ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "MY ECO TRIP API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`MY ECO TRIP API running on port ${PORT}`);
  });
});
