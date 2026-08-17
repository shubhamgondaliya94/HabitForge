# HabitForge

A gamified RPG habit tracker built with the MERN stack (MongoDB, Express, React, Node.js). Turn daily rituals into legend — level up your hero, unlock achievement badges, and compete on global leaderboards.

## Features

- **Gamified Habit System** — Complete habits, earn XP, and level up your RPG avatar
- **Streak Mechanics** — Track daily streaks with automated streak calculation
- **Achievement Badges** — Unlock rare badges for milestones, streaks, categories, and time-based challenges
- **Global Leaderboard** — Compete against friends or the entire realm
- **AI Coach** — Personalized habit recommendations and daily quests
- **Premium Tier** — Unlimited habits, CSV export, and advanced analytics
- **Heatmap & Analytics** — Visualize your progress with GitHub-style contribution heatmaps and 30-day analytics
- **Social Features** — Add friends and compare progress

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Dev DB | MongoDB Memory Server (zero-config) |

## Architecture

```
habitforge/
├── backend/                  # Express API server
│   ├── config.js             # Centralized environment config
│   ├── server.js             # Entry point
│   ├── controllers/          # Route handlers (auth, habits, completions, etc.)
│   ├── middleware/           # Auth, sanitization, rate limiting
│   ├── models/               # Mongoose schemas (SignUp, HabitInfo, CompletionLog, etc.)
│   ├── routes/               # Express route definitions
│   ├── services/             # Business logic (gamification, streaks, badges)
│   ├── utils/                # Logger, date utilities, seed data
│   └── .env                  # Environment variables (NOT committed)
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # UI components (Auth, Dashboard, Analytics, Leaderboard, etc.)
│   │   ├── api.js            # Axios API client with JWT interceptor
│   │   └── App.jsx           # Root app with error boundaries
│   └── dist/                 # Production build output
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### 1. Clone and Install Dependencies

```bash
git clone <repo-url>
cd habitforge

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies (in a separate terminal)
cd ../frontend && npm install
```

### 2. Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
JWT_SECRET=your_super_secret_random_string_here
MONGODB_URI=mongodb://localhost:27017/habitforge
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/habitforge

NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Production requirements:**
- `JWT_SECRET` must be set (no fallback)
- `MONGODB_URI` must be set (MongoMemoryServer fallback is disabled)
- `FRONTEND_URL` must be set (CORS will be restricted to this origin)
- `NODE_ENV=production`

### 3. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm start
# Runs on http://localhost:5000
# Auto-falls back to MongoMemoryServer if MONGODB_URI is not set

# Terminal 2: Frontend
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 4. Access the App

Open http://localhost:5173 in your browser. The app will show the **Auth Page** by default. Create a hero account, then log in to access the dashboard.

## API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/register` | POST | Create new account | No |
| `/api/auth/login` | POST | Log in with username/email + password | No |
| `/api/auth/me` | GET | Get current user profile | Yes |
| `/api/auth/toggle-premium` | POST | Toggle premium status | Yes |
| `/api/auth/profile` | PUT | Update username/avatar | Yes |
| `/api/auth/add-friend` | POST | Add a friend by username | Yes |
| `/api/auth/account` | DELETE | Delete account and all data | Yes |
| `/api/habits` | GET | List all habits | Yes |
| `/api/habits` | POST | Create a new habit | Yes |
| `/api/habits/:id` | GET | Get a single habit | Yes |
| `/api/habits/:id` | PUT | Update a habit | Yes |
| `/api/habits/:id` | DELETE | Delete a habit | Yes |
| `/api/completions/toggle` | POST | Toggle completion for a habit | Yes |
| `/api/completions/heatmap` | GET | Get 365-day heatmap data | Yes |
| `/api/completions/analytics` | GET | Get 30-day analytics | Yes |
| `/api/completions/export` | GET | Export CSV (Premium) | Yes |
| `/api/leaderboard` | GET | Get leaderboard (with pagination) | Yes |
| `/api/ai/coach` | GET | Get AI coach insights | Yes |
| `/api/health` | GET | Server health check | No |
| `/api/seed` | POST | Re-seed demo data | No |

## Production Deployment

### 1. Environment Setup

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<strong_random_256bit_secret>
MONGODB_URI=<mongodb_atlas_or_production_uri>
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Build Frontend

```bash
cd frontend
npm run build
```

The `dist/` folder contains the static production build. Serve it via a static host (e.g., Vercel, Netlify, or Nginx).

### 3. Deploy Backend

- **Vercel/Netlify**: Not recommended for long-running Node.js servers. Use Render, Railway, or Fly.io.
- **Railway/Render**: Set environment variables in the dashboard, deploy from Git.
- **Docker**: A `Dockerfile` can be added; the app needs Node.js 18+ and a MongoDB connection.
- **MongoDB Atlas**: Whitelist your deployment IP or allow all IPs (0.0.0.0/0) in Atlas Network Access.

### 4. CORS & Security

In production:
- CORS is restricted to `FRONTEND_URL` only
- Rate limiting is active (100 req / 15min per IP, 10 req / 15min for auth endpoints)
- JWT secret is required (no fallback)
- Input sanitization (XSS protection) is applied to all write endpoints
- MongoMemoryServer fallback is disabled

## Free vs Premium Tiers

| Feature | Free | Premium |
|---------|------|---------|
| Max Habits | 25 | Unlimited |
| CSV Export | No | Yes |
| Analytics | 30-day | 30-day + extended |
| Leaderboard | Global | Global + Friends |

Toggle premium status in-app from the navbar or via `POST /api/auth/toggle-premium`.

## Database Collections

| Collection | Purpose |
|------------|---------|
| `sign_up` | User accounts (username, email, password hash, XP, level, badges) |
| `habit_info` | Habits (name, category, frequency, streak, owner) |
| `completionlogs` | Daily completion records (habit, date, XP earned) |
| `login_info` | Login attempt history (success/failure) |

## Security Notes

- **JWT Secret**: Must be a strong, random string in production. The app throws on startup if not set.
- **Rate Limiting**: Brute-force protection on login/register endpoints.
- **XSS Protection**: All input strings are HTML-escaped before processing.
- **CORS**: Restricted to known frontend origins in production.
- **MongoDB Injection**: Mongoose schema validation mitigates injection risks.

## License

MIT
