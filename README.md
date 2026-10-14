# NER-LOGIX (AI-NER-Connect)
> **AI-Driven Logistics & High-Altitude Corridor Intelligence for North-Eastern Region (NER)**  
> Built for Smart India Hackathon (Problem SIH26002)

---

## 🌟 Presentation Demo Highlights

This project is built to deliver a **100% complete, fully working single-link experience** for presentations and evaluations.

- **Single Link Unified Access**: The React frontend and Express API are unified under a single origin (`http://localhost:5173` or your Vercel deployment URL). All frontend navigation and `/api/*` endpoints work seamlessly through the same domain.
- **Realistic Mission Database**: Embedded persistent database seeded with realistic Trans-Himalayan military and civilian freight data:
  - 6 Active High-Altitude Convoys (AS-01-HC-4821, AS-01-MD-9104, AR-02-TX-3329, etc.)
  - Real Indian National Highway corridors (NH-27, NH-52, NH-13 Guwahati ⇄ Tawang corridor)
  - Sela Pass Alpine Hazard Sector (4,170m apex altitude)
  - Live Weather Doppler & LEWS Landslide risk indices
- **Full Real-Time Interactivity**:
  - Live SSE / Local Ticker continuous vehicle movement along actual mountain topography.
  - Simulation Operator can inject a Landslide / Roadblock scenario.
  - Admin dispatches dynamic AI Reroute around hazardous sectors.
  - Driver terminal instantly receives updated routing instructions without refreshing!

---

## 🚀 Quick Run (Single Link)

### 1. Start the Complete Stack
```bash
npm start
```
*Starts both the Operations Engine API (`localhost:3001`) and the Vite UI (`localhost:5173`) with automated reverse proxying.*

### 2. Access the Single Link
Open your browser to:
👉 **[http://localhost:5173](http://localhost:5173)**

All features, including map rendering, telemetry streams, database persistence, and API calls, operate through this single link.

---

## ☁️ Deploying to Vercel (1-Click Hosting)

The repository is fully configured for Vercel deployment with:
- [`vercel.json`](vercel.json): Handles SPA route fallbacks and maps `/api/*` to the serverless engine.
- [`api/index.ts`](api/index.ts): Serverless entry point exporting the Express application.
- Serverless Database Adapter: Automatically switches database storage to `/tmp` in cloud environments while preserving seed datasets.

### Option A: GitHub Import (Recommended for Vercel Dashboard)
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete single link vercel configuration and database"
   git push origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your GitHub repository (`NerAi`).
4. Keep the default settings (Framework: Vite, Build: `npm run build`, Output: `dist`).
5. Click **Deploy**. Your project will be live with a single `.vercel.app` HTTPS URL!

### Option B: Deploy via Vercel CLI
```bash
npx vercel login
npx vercel --prod
```

---

## 🔑 Demo Login Accounts

| Role | Operator ID / Email | Password | Recommended Presentation Flow |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@nerlogix.in` (or `ADM-01`) | `admin123` | **Tactical Control Center**: Monitor 6 live convoys, inspect corridor elevations, trigger AI reroutes around roadblocks. |
| **Driver** | `rohit@nerlogix.in` (or `DRV-01`) | `driver123` | **Driver HUD**: Turn-by-turn mountain guidance, high-altitude oxygen/fuel gauges, instant reroute alert dispatch. |
| **Simulation Operator** | `sim@nerlogix.in` (or `SIM-01`) | `sim123` | **Disaster Simulation**: Inject rockfalls, cloudbursts, and landslides to demonstrate dynamic system adaptability. |

---

## 🎯 5-Minute Presentation Walkthrough Script

1. **The Challenge (Landing Page - `/`)**:
   - Highlight the extreme terrain of the North-East Region: frequent landslides, monsoon floods, extreme altitude passes like Sela Pass (4,170m), and limited cellular connectivity.

2. **Command & Control GIS (`/admin/vehicle-gis`)**:
   - Log in as Admin (`admin@nerlogix.in` / `admin123`).
   - Showcase the 3D-styled interactive GIS corridor from Guwahati to Tawang.
   - Click on any vehicle marker (e.g. `CONVOY-01`) to inspect real-time elevation profile, speed, cargo temperature, and fuel levels.

3. **Disaster Simulation (`/simulation/dashboard`)**:
   - Open in a split tab or switch to Simulation Operator (`sim@nerlogix.in` / `sim123`).
   - Trigger a **Landslide** at KM 414 near Sela Pass.
   - Observe how the network updates instantly and marks the sector hazardous.

4. **Dynamic AI Rerouting (`/admin/reroute`)**:
   - Return to Admin Console and review the high-risk alert.
   - Click **Approve Reroute** to divert the convoy onto the Mandala-Shergaon Bypass (NH-13B).
   - Watch the vehicle change path on the map with recalculation of ETA, slope incline, and fuel projection.

5. **Driver HUD (`/driver/dashboard`)**:
   - Log in as Driver (`rohit@nerlogix.in` / `driver123`).
   - Show how the driver in the field receives the audio chime and tactical notification order from Command without any manual page refresh.
