# Aravalli Agri-Tech & Watershed Intelligence

AI-powered agri-tech web app for Southern Rajasthan farmers — crop diagnostics, mandi prices, soil planning, watershed monitoring, and a verified inputs shop.

---

## Quick Setup (< 10 steps)

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- API keys: Gemini Flash and OpenWeatherMap (free tier)

---

### 1. Clone / open the project
```bash
cd aravalli-agritech
```

### 2. Configure backend environment
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your keys:
#   GEMINI_API_KEY=your_gemini_key
#   GEMINI_MODEL=gemini-3.8-flash
#   OPENWEATHERMAP_API_KEY=your_owm_key
```

### 3. Install backend dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Start the backend
```bash
# Inside backend/ with venv active:
python main.py
# → Runs on http://localhost:8000
# → API docs at http://localhost:8000/docs
```

### 5. Install frontend dependencies (new terminal)
```bash
cd frontend
npm install
```

### 6. Start the frontend dev server
```bash
npm run dev
# → Opens at http://localhost:5173
# → All /api/* calls proxy to localhost:8000
```

### 7. Open the app
Visit **http://localhost:5173** in Chrome (best) or Firefox.

---

## What to test after setup

| Feature | How to test |
|---|---|
| **AI Agri-Doctor** (voice) | Home → mic button → speak a crop question in Hindi or English |
| **AI Agri-Doctor** (text) | Type "मेरी टमाटर में पीली पत्तियाँ हैं" → press send |
| **Crop Doctor** | Upload a leaf photo → wait for Gemini diagnosis |
| **Soil Plan** | Soil Plan page → degradation index + Gemini remediation plan loads |
| **20-Day Outlook** | Home page → outlook calendar with Optimal/Caution/Spray OK days |
| **Weather Alerts** | Alerts page → real alerts from OpenWeatherMap forecast |
| **Mandi Prices** | Crop Prices page → Gemini sell-timing advice per crop |
| **Shop + Cart** | Add items → Cart → fill delivery form → Place Order (mock COD) |
| **Lake Watch** | Lake Watch page → level cards + Leaflet map |
| **Dashboard** | Researcher & NGO → Recharts charts + CSV export |
| **Language switch** | Header → EN / हिन्दी / मेवाड़ी toggle |
| **Mobile layout** | DevTools → 390px width → bottom tab bar, single column |
| **PWA install** | Chrome → address bar install icon |

---

## Responsive breakpoints

| Width | Layout |
|---|---|
| 360–767px | Mobile: single column, sticky header, bottom tab bar |
| 768–1023px | Tablet: 2-col grids, hamburger nav |
| 1024–1279px | Desktop: full nav, 3-col product grid, side panels |
| 1280px+ | Max-width 1440px container |

---

## Project structure

```
aravalli-agritech/
├── design/           ← All 6 design screenshots
├── frontend/         ← React + Vite + Tailwind PWA
│   ├── public/       ← manifest.json, icons, sw.js
│   └── src/
│       ├── pages/    ← Home, CropDoctor, Shop, SoilPlan, Prices, Alerts, LakeWatch, Dashboard, MyFarm, Cart
│       ├── components/layout/  ← TopBar, Header, MainNav, BottomTabs, Footer
│       ├── components/ui/      ← ProductCard, OutlookCalendar, SampleDataLabel
│       ├── context/  ← LangContext, CartContext
│       ├── hooks/    ← useSpeech, useApi
│       └── locales/  ← en.json, hi.json, mewari.json
└── backend/          ← FastAPI + Gemini + OpenWeatherMap
    ├── main.py
    ├── routes/       ← agri_doctor, crop_doctor, soil_plan, prices, weather, alerts, shop, lake_watch, dashboard
    ├── services/     ← gemini_service, weather_service, rules_engine, database
    └── sample_data/  ← products.json, mandi_prices.json, soil_sample.json, lake_status.json, crops_config.json
```

---

## Data honesty

All prices, soil values, lake levels and scores are **sample / illustrative data** — clearly labelled with a "📊 Sample data" badge throughout the UI. No real market, government or telemetry data is presented as real.

**Replaced placeholders:**
- `[Partner name]` — partnership/certification claims
- `[Expert name]` — named agronomist
- `[Helpline number]` — phone numbers
- `[Brand]` — product brand names
- `[Certification]` — government certification badges

---

## AI safety rules

- Gemini always receives structured JSON context (weather, soil, prices)
- Gemini is instructed to use **only** the supplied data — never invent numbers
- Every diagnosis and pesticide suggestion carries: *"AI suggestion. Check the product label and ask a local expert before use."*
- Low-confidence or unclear image scans show an **expert help block** instead of a firm diagnosis
- No API keys are in frontend code — all secrets are backend `.env` only

---

## API endpoints

| Method | Endpoint | Feature |
|---|---|---|
| POST | `/api/agri-doctor` | AI Q&A with weather context |
| POST | `/api/crop-doctor` | Leaf image diagnosis |
| GET | `/api/soil-plan` | Degradation index + remediation |
| GET | `/api/prices` | Mandi prices + crop ranking |
| GET | `/api/weather` | Current + 5-day forecast |
| GET | `/api/outlook` | 20-day agricultural outlook |
| GET | `/api/alerts` | Weather alerts |
| GET | `/api/products` | Shop product listing |
| POST | `/api/cart` | Add to cart |
| DELETE | `/api/cart/{id}` | Remove from cart |
| POST | `/api/orders` | Place COD order |
| GET | `/api/lake-watch` | Lake/watershed status |
| GET | `/api/dashboard` | Researcher data + charts |

---

## Mewari language note

`frontend/src/locales/mewari.json` contains **placeholder strings only**, tagged `[needs native review]`. AI-generated Mewari translations are not reliable — all strings must be reviewed by a fluent Mewari speaker before production use.

---

## License
Sample / prototype build. Not for commercial deployment without review of data accuracy, regulatory compliance and native language verification.
