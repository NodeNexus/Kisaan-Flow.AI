# ── Stage 1: Build ──────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies (use ci for deterministic installs)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source
COPY . .

# Build production bundle
# VITE_API_URL is injected at build time via --build-arg or Render env var
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Serve ──────────────────────────────────────────────────
FROM nginx:alpine

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config with SPA routing + gzip + caching
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
