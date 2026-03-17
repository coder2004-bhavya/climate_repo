## ClimateScope (React + Node + Flask)

This project is a full-stack upgrade of your climate app:

- **Frontend**: React + TypeScript (Vite) in `frontend/`
- **Backend**: Node.js + TypeScript (Express) in `backend/`
- **ML service**: Flask (your existing model) in the repo root (`app.py`)
- **Shared types**: TypeScript types + Zod schemas in `packages/shared/`

### Ports (local)

- **Flask ML service**: `http://localhost:8000`
- **Node API**: `http://localhost:4000`
- **React UI**: `http://localhost:5173`

---

## Run locally

### 1) Start the Flask ML service

In the project root (`c:\Users\KIIT0001\Desktop\climate_change`):

```bash
python -m pip install -r requirements.txt
python app.py
```

Health check: `GET /health` on port 8000.

### 2) Install Node dependencies

In the project root:

```bash
npm install
```

Build shared types once:

```bash
cd packages/shared
npm run build
```

### 3) Start the Node backend

```bash
cd backend
copy .env.example .env
npm run dev
```

Backend health check: `GET http://localhost:4000/health`

### 4) Start the React frontend

```bash
cd frontend
copy .env.example .env
npm run dev
```

Open: `http://localhost:5173`

---

## Environment variables

### `backend/.env`

- **PORT**: default `4000`
- **CORS_ORIGIN**: default `http://localhost:5173`
- **JWT_SECRET**: set a strong secret in production
- **OPENWEATHER_API_KEY**: required for `/api/weather`
- **ML_SERVICE_URL**: Flask base URL (default `http://localhost:8000`)
- **SQLITE_PATH**: SQLite db file (default `./data/app.db`)

### `frontend/.env`

- **VITE_API_BASE_URL**: default `http://localhost:4000`

---

## Main API routes (Node backend)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/weather?city=...` (public; requires `OPENWEATHER_API_KEY`)
- `POST /api/predict` (JWT required; proxies Flask)
- `GET /api/cities` / `POST /api/cities` / `DELETE /api/cities/:id` (JWT required)
- `GET /api/history` (JWT required)

---

## Deploy (free)

See `DEPLOY.md`. For the full-stack version, deploy **backend** and **frontend** separately:

- **Backend**: Render/Railway/Fly as a Node service
- **Frontend**: Render Static Site / Netlify / Vercel
- **Flask ML**: Render/Railway/Fly as a Python service

(Then set `ML_SERVICE_URL` on the backend to point to the deployed Flask service URL, and set `VITE_API_BASE_URL` on the frontend to the deployed Node backend URL.)
