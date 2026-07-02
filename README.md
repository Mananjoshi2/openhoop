# OpenHoop 🏀

Crowdsourced basketball court finder for the Greater Toronto Area. Find a run, check in, and own the court.

**Live demo:** https://openhoop.onrender.com

---

## What it does

- **Interactive dark map** of 60+ real GTA basketball courts across Toronto, Mississauga, Brampton, Etobicoke, and York
- **Live status** — courts show as Free, Pickup Forming, or Game On based on check-ins
- **Check In** to a court to let other ballers know you're there
- **Add a Court** — drop a pin on the map and submit a court the community hasn't found yet
- **Search & filter** courts by name or activity status

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
