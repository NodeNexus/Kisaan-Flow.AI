# KisanFlow AI 🌾

> **Built for the AMD Developer Hackathon 2025**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/NodeNexus/Kisaan-Flow.AI)

**KisanFlow AI** is an autonomous, multi-agent agricultural advisor for Indian farmers. A 5-agent AI workforce — powered by **AMD Instinct™ MI300X** via Fireworks AI — generates a complete, hyper-localized farming plan (crop selection → mandi prices → government subsidies → logistics) in **under 90 seconds**, in the farmer's native language.

---

## 🚀 Powered by AMD Instinct™ MI300X

A 5-agent sequential CrewAI workflow generates 15,000–25,000 tokens per run. On commodity GPU inference (20–30 tok/s), that's a **10–15 minute wait**. On AMD MI300X via Fireworks AI (**100+ tok/s**), it completes in **under 90 seconds** — the difference between a batch job and a real-time web app.

| Spec | Value |
|------|-------|
| GPU Memory | 192 GB HBM3 |
| Memory Bandwidth | 5.3 TB/s |
| Inference Speed (LLaMA 3.1 70B) | 100+ tok/s |
| KisanFlow Full Advisory | < 90 seconds |

---

## 🤖 The Agentic Workforce

| # | Agent | Role |
|---|-------|------|
| 1 | 🌱 **Chief Agronomist** (कृषि विज्ञानी) | Soil, weather, and crop recommendation |
| 2 | 📊 **Agricultural Economist** (कृषि अर्थशास्त्री) | Live Mandi prices via web search |
| 3 | 🏛️ **Government Policy Advisor** (योजना सलाहकार) | PM-Kisan, PMFBY, subsidies |
| 4 | 🚛 **Supply Chain Coordinator** (आपूर्ति श्रृंखला) | Logistics, cold storage, FPO linkage |
| 5 | 🙏 **Krishi Mitra** (कृषि मित्र) | Synthesizes all reports in farmer's language |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **AI Inference** | Fireworks AI (AMD Instinct™ MI300X) |
| **Agent Orchestration** | CrewAI + LangChain |
| **Backend** | FastAPI, Python 3.11 |
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion |
| **State Management** | Zustand |
| **Database** | PostgreSQL (SQLModel) |
| **Vector Memory** | Qdrant |
| **Deployment** | Render.com (render.yaml IaC) |

---

## 🚀 One-Click Deploy to Render

Click the button above, or:

1. Fork this repository to your GitHub account
2. Go to [render.com](https://render.com) → **New → Blueprint**
3. Connect your fork — Render reads `render.yaml` automatically
4. Set the required environment variable:
   - `FIREWORKS_API_KEY` → Your Fireworks AI key (get one at [fireworks.ai](https://fireworks.ai))
5. After deployment, set `VITE_API_URL` in the **frontend static site** environment to your backend URL (e.g. `https://kisanflow-api.onrender.com`)

> **Note:** Qdrant is not provisioned by Render's free tier. For demos, set `DEMO_MODE=true` on the backend service to bypass all external API calls and stream a pre-recorded advisory.

---

## 🏃‍♂️ Running Locally

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose

### 1. Clone and set up

```bash
git clone https://github.com/NodeNexus/Kisaan-Flow.AI.git
cd Kisaan-Flow.AI
```

### 2. Start infrastructure

```bash
docker-compose up -d
# Starts: PostgreSQL (5432), Qdrant (6333), MinIO (9000)
```

### 3. Configure the backend

```bash
cd backend
cp .env.example .env
# Edit .env — add your FIREWORKS_API_KEY
```

### 4. Start the backend

```bash
# From the repo root (not inside /backend)
python -m venv venv
venv\Scripts\activate         # Windows
# source venv/bin/activate    # macOS/Linux

pip install -r backend/requirements.txt
PYTHONPATH=. uvicorn backend.main:app --reload
```

> On Windows PowerShell: `$env:PYTHONPATH="."; uvicorn backend.main:app --reload`

### 5. Start the frontend

```bash
cd frontend
npm install
# For local dev (no VITE_API_URL needed — defaults to localhost:8000)
npm run dev
```

Visit **http://localhost:5173** 🎉

### Quick Demo Mode (no API key needed)

```bash
# In backend/.env
DEMO_MODE=true
```
This streams a pre-recorded, beautiful Hindi advisory via WebSocket — zero external API calls required.

---

## 🌐 Project Structure

```
Kisaan-Flow.AI/
├── render.yaml                 # Render.com IaC blueprint
├── docker-compose.yml          # Local infrastructure
├── .gitignore
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── main.py                 # FastAPI app + WebSocket manager
│   ├── agents/
│   │   ├── core_agents.py      # 5 CrewAI agent definitions
│   │   └── tasks.py            # Agent task definitions
│   ├── core/
│   │   ├── config.py           # Pydantic settings
│   │   └── workflow.py         # CrewAI crew orchestration
│   ├── database/
│   │   ├── models.py           # SQLModel ORM models
│   │   ├── sql_db.py           # PostgreSQL connection
│   │   └── vector_db.py        # Qdrant client
│   └── tools/
│       └── cached_search.py    # Demo-safe DuckDuckGo wrapper
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf              # SPA routing + gzip + caching
    ├── src/
    │   ├── App.tsx             # Landing page
    │   ├── Dashboard.tsx       # AI workflow UI
    │   ├── store.ts            # Zustand state (WebSocket)
    │   └── index.css           # Premium CSS design system
    └── index.html
```

---

## 🗺 Roadmap

- [ ] **WhatsApp Bot** — Twilio integration for voice-note farming advice
- [ ] **Pincode Weather** — Auto-fetch soil and weather data by PIN code
- [ ] **Crop Disease Vision** — LLaMA Vision for image-based disease detection
- [ ] **Voice Output** — Text-to-speech advisory in local languages
- [ ] **FPO Marketplace** — Direct connection to buyer networks

---

## 📄 License

MIT License — Built for the AMD Developer Hackathon 2025.

*Powered by [Fireworks AI](https://fireworks.ai) running on AMD Instinct™ MI300X accelerators.*