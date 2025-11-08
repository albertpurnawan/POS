# Multi-stage Dockerfile for building and serving a Vite React app

# -------- Builder stage --------
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (leverage Docker layer cache)
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy rest of the source and build
COPY . .
RUN npm run build

# -------- Runtime stage --------
FROM nginx:alpine AS runtime

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Optional: basic healthcheck on nginx
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1

# Default command provided by nginx image

