# OpenHoop 🏀

A crowdsourced basketball court finder. Search courts near you, see who's already there, join a pickup game, or just find somewhere to get shots up. More cities coming soon.

**Live demo:** https://openhoop.onrender.com

---

## What it does

- **Find courts near you** on an interactive map with 60+ locations and more being added
- **See live activity** so you know if a court is empty, has a pickup forming, or has a full game running
- **Check in** when you show up so other players know the court is live
- **Add a court** by dropping a pin anywhere on the map and filling in the details
- **Search and filter** by court name or activity level

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Map | react-leaflet + Leaflet, CartoDB dark tiles (no API key needed) |
| Backend | Node.js, Express |
| Database | SQLite via better-sqlite3 (auto-seeded on startup) |
| Court data | Hand-curated GTA courts + OpenStreetMap Overpass API |
| Deployment | Render (free tier) |

## Running locally

```bash
git clone https://github.com/Mananjoshi2/openhoop.git
cd openhoop

# Install root (frontend) deps
npm install

# Install server deps
cd server && npm install && cd ..

# Run frontend + backend together
npm run dev
```

Frontend runs at `http://localhost:5173`, API at `http://localhost:4000`.

## Project structure

```
openhoop/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx       # Home page with live stats
│   │   ├── MapApp.jsx        # Main map + sidebar
│   │   └── Vision.jsx        # About / mission page
│   ├── components/
│   │   ├── CourtDetail.jsx   # Court info panel
│   │   ├── AddCourtModal.jsx # Add court form
│   │   └── ...
│   └── hooks/
│       └── useCourts.js      # API hook
├── server/
│   ├── index.js              # Express API
│   ├── db.js                 # SQLite schema
│   └── scrape.js             # Overpass scraper + 60+ seeded courts
└── render.yaml               # Render deployment config
```

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courts` | List all courts (supports `?q=` and `?status=`) |
| GET | `/api/courts/:id` | Single court with recent check-ins |
| POST | `/api/courts` | Add a new court |
| POST | `/api/courts/:id/checkin` | Check in to a court |
| POST | `/api/courts/:id/checkout` | Check out of a court |
| GET | `/api/stats` | Aggregate stats (total, active, players) |
| POST | `/api/scrape` | Re-fetch courts from OpenStreetMap |

## Deploying to Render

1. Fork this repo
2. Create a new **Web Service** on [Render](https://render.com) connected to your fork
3. Set build command: `npm install && npm run build && cd server && npm install`
4. Set start command: `npm run start`
5. Add environment variable: `NODE_VERSION = 20.13.1`
6. Deploy — courts are auto-seeded on first startup, no database setup needed
