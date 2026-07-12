# ── Stage 1: Build React Frontend ──────────────────────────────────────
FROM node:20-alpine AS build-frontend

WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend/ ./
# We don't need VITE_API_URL anymore since the frontend is served by the same backend
RUN npm run build

# ── Stage 2: Setup Python Backend ──────────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (for SQLite/psycopg2 if needed, though we use SQLite now)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend assets into backend static folder
COPY --from=build-frontend /frontend/dist ./static

# Set PYTHONPATH so 'from backend.xxx import' works
ENV PYTHONPATH=/app

EXPOSE 8000

# Start FastAPI
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
