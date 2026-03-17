# Deploy Your Climate Change App for Free (Global Server)

Your project is now a **full stack app**:

- **Frontend**: React + TypeScript (`frontend/`)
- **Backend**: Node + TypeScript (`backend/`)
- **ML Service**: Flask (`app.py`)

Here are the best **free** options to deploy it globally.

---

## Recommended full-stack deployment (free)

Deploy these as **separate services**:

- **Flask ML Service** (Python web service): exposes `/health` and `/predict-json`
- **Node Backend API** (Node web service): set `ML_SERVICE_URL` to the Flask URL
- **React Frontend** (static site): set `VITE_API_BASE_URL` to the Node API URL

On Render this is typically:

- 1x **Web Service** (Python) for Flask
- 1x **Web Service** (Node) for backend
- 1x **Static Site** for frontend

---

## Option 1: Render (Recommended – Easiest)

**Free tier:** 750 hours/month, sleeps after 15 min inactivity, wakes on request.

1. **Push your code to GitHub** (if not already):
   - Create a repo at https://github.com/new
   - Push your `climate_change` folder

2. **Sign up at [Render](https://render.com)** (free, use GitHub login).

3. **New Web Service:**
   - Dashboard → **New +** → **Web Service**
   - Connect your GitHub repo
   - Settings:
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `gunicorn app:app` (or `gunicorn -b 0.0.0.0:$PORT app:app` if needed)
     - **Environment:** Add variable `OPENWEATHER_API_KEY` = your API key (do **not** put keys in code)

4. **Deploy** – Render builds and gives you a URL like `https://your-app.onrender.com`.

---

## Option 2: PythonAnywhere

**Free tier:** One web app, subdomain like `yourusername.pythonanywhere.com`.

1. Sign up at [PythonAnywhere](https://www.pythonanywhere.com).
2. **Upload project:** Files → Upload your project (or clone from GitHub).
3. **Virtualenv:** Create one, then `pip install -r requirements.txt`.
4. **Web tab:** Add a new web app → Manual config → set **WSGI file** to point to your app (e.g. `/home/yourusername/climate_change/app.py` with `application = app`).
5. **Static files:** Map `/static/` to your `static` folder.

---

## Option 3: Railway

**Free tier:** $5 credit/month (enough for a small app).

1. Sign up at [Railway](https://railway.app) (GitHub login).
2. **New Project** → **Deploy from GitHub** → select your repo.
3. Add **Procfile** in project root: `web: gunicorn app:app`
4. In **Variables**, add `OPENWEATHER_API_KEY`.
5. Deploy – Railway gives you a public URL.

---

## Option 4: Fly.io

**Free tier:** Small VMs free; good for always-on small apps.

1. Install [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/).
2. In project folder: `fly launch` (follow prompts).
3. Set secrets: `fly secrets set OPENWEATHER_API_KEY=your_key`
4. Deploy: `fly deploy`

---

## Before You Deploy – Checklist

- [ ] **API key:** Use environment variable `OPENWEATHER_API_KEY` everywhere (see `config.py` / `api/weather_api.py`). Never commit the real key.
- [ ] **Gunicorn:** Add `gunicorn` to `requirements.txt` for production (Render, Railway, etc.).
- [ ] **Port:** In code, use `os.environ.get("PORT", 8000)` and run on that port so the host can inject `PORT`.
- [ ] **Git:** Don’t commit `__pycache__`, `.env`, or `.pkl` if they contain secrets; use `.gitignore`.

---

## Quick Summary

| Platform        | Free tier        | Best for                    |
|----------------|------------------|-----------------------------|
| **Render**     | 750 hrs/mo       | Easiest, GitHub → deploy    |
| **PythonAnywhere** | 1 web app   | Simple, no credit card     |
| **Railway**    | $5 credit/mo     | Quick deploys               |
| **Fly.io**     | Small VMs        | More control, global regions |

**Recommendation:** Start with **Render**: connect GitHub, set build/start commands and `OPENWEATHER_API_KEY`, then deploy. Your app will be on a global URL for free.
