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
| **Database** | SQLite (SQLModel) |
| **Vector Memory** | Qdrant (Optional / Demo Mode uses zero DBs) |
| **Deployment** | Render.com (100% Free Single Web Service) |

---

## 🚀 100% Free Deploy to Render

The repository uses a multi-stage Dockerfile to build the React frontend and serve it directly from the FastAPI backend, utilizing an ephemeral SQLite database to keep costs at zero.

1. Fork this repository to your GitHub account
2. Go to [render.com](https://render.com) dashboard and click **New → Web Service**
3. Select **"Build and deploy from a Git repository"** and connect your fork
4. Render will automatically detect the `Dockerfile`. Use the following settings:
   - **Environment**: Docker
   - **Plan**: Free
5. Expand **Advanced** and add the required Environment Variable:
   - `FIREWORKS_API_KEY` → Your Fireworks AI key (get one at [fireworks.ai](https://fireworks.ai))
6. Click **Create Web Service**

> **Note on Free Tier:** Render spins down free web services after 15 minutes of inactivity. When it wakes up, the ephemeral SQLite database is wiped. This is actually ideal for a hackathon demo, as it automatically clears old test data!

> **Demo Mode:** If you don't have an API key, add an environment variable `DEMO_MODE=true` in the Render dashboard. This bypasses all external AI calls and streams a beautiful pre-recorded advisory instantly.

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
├── Dockerfile                  # Multi-stage root build (Frontend + Backend)
├── docker-compose.yml          # Local infrastructure
├── .gitignore
│
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── main.py                 # FastAPI app + WebSocket + Static Files
│   ├── agents/
│   │   ├── core_agents.py      # 5 CrewAI agent definitions
│   │   └── tasks.py            # Agent task definitions
│   ├── core/
│   │   ├── config.py           # Pydantic settings (SQLite default)
│   │   └── workflow.py         # CrewAI crew orchestration
│   ├── database/
│   │   ├── models.py           # SQLModel ORM models
│   │   ├── sql_db.py           # SQLite connection
│   │   └── vector_db.py        # Qdrant client (Optional)
│   └── tools/
│       └── cached_search.py    # Demo-safe DuckDuckGo wrapper
│
└── frontend/
    ├── src/
    │   ├── App.tsx             # Landing page
    │   ├── Dashboard.tsx       # AI workflow UI
    │   ├── store.ts            # Zustand state (Relative Paths)
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