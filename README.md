# MY ECO TRIP

A full-stack MERN app for planning sustainable trips. Users register/log in, then fill in a place, dates, group size, and budget — an AI planner generates a day-by-day eco-friendly itinerary. The landing page features an interactive 3D globe (built with Three.js / react-three-fiber) marking sample eco-destinations.

## Stack

- **MongoDB** + Mongoose — users and trips
- **Express** — REST API, JWT auth
- **React** (Vite) + Tailwind CSS + Framer Motion + react-three-fiber — frontend & 3D globe
- **Node.js** — server runtime
- AI itinerary generation via Anthropic's Claude API (or OpenAI, configurable)

## Project structure

```
myecotrip/
├── server/              # Express API
│   ├── config/          # DB connection + AI service
│   ├── middleware/       # auth + error handling
│   ├── models/           # User, Trip (Mongoose schemas)
│   ├── routes/           # auth.js, trips.js
│   ├── server.js         # entry point
│   └── .env.example
└── client/              # React (Vite) frontend
    ├── src/
    │   ├── api/          # axios client
    │   ├── components/   # EcoGlobe, PlanTripModal, TripCard, Navbar, ProtectedRoute
    │   ├── context/      # AuthContext
    │   ├── pages/        # Landing, Login, Register, Dashboard, TripDetail
    │   ├── App.jsx
    │   └── main.jsx
    └── .env.example
```

## Setup

### 1. Prerequisites

- Node.js 18+
- A MongoDB connection string (local MongoDB, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- An API key from [Anthropic](https://console.anthropic.com/) (default) or [OpenAI](https://platform.openai.com/)

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

```
MONGO_URI=mongodb://localhost:27017/myecotrip   # or your Atlas URI
JWT_SECRET=some_long_random_string
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
AI_PROVIDER=anthropic                            # or "openai"
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...                            # only needed if AI_PROVIDER=openai
```

Run it:

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health` to confirm it's up.

### 3. Frontend

In a new terminal:

```bash
cd client
npm install
cp .env.example .env
```

Edit `.env` if your API isn't on the default port:

```
VITE_API_URL=http://localhost:5000/api
```

Run it:

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## How the AI planning works

1. User clicks **"Plan a new trip"** on the dashboard and fills in destination, dates, number of travelers, budget, currency, and optional preferences.
2. The frontend POSTs this to `POST /api/trips`.
3. The backend saves a placeholder trip (`status: "generating"`), then calls the AI provider (`server/config/aiService.js`) with a structured prompt asking for strict JSON: a summary, an eco score, a day-by-day itinerary, and a packing list.
4. The AI's JSON response is parsed and saved onto the trip (`status: "ready"`). If parsing or the API call fails, the trip is marked `"failed"` and the user can retry from the dashboard.
5. The dashboard polls every 4 seconds while any trip is `"generating"`, so the card updates automatically once the plan is ready.

To switch AI providers, change `AI_PROVIDER` in `server/.env` to `openai` and set `OPENAI_API_KEY`. No other code changes needed — both providers are already wired up in `aiService.js`.

## Notes on the design

- Palette is forest/earth-toned ("eco" without going cliché green-on-white): deep pine background, moss/amber accents, parchment text.
- The hero globe rotates slowly and shows pulsing pins for sample eco-destinations; users can drag to rotate it manually.
- The "Plan a new trip" button has a pulsing ring animation that echoes the globe's glowing pins, tying the two together visually.
- All interactive elements have visible keyboard focus states, and animations respect `prefers-reduced-motion`.

## Security notes for production

- Passwords are hashed with bcrypt; never stored in plain text.
- JWTs expire after 7 days; change `JWT_SECRET` to a long random value before deploying.
- Auth routes are rate-limited (30 requests / 15 min) to slow down brute-force attempts.
- CORS is restricted to `CLIENT_ORIGIN` — update this to your deployed frontend's URL.
- Consider adding HTTPS, helmet.js, and stricter rate limiting on `/api/trips` before going live.
