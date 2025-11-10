FROM node:20-alpine
WORKDIR /srv/app

# Install production deps first for better caching
COPY package*.json ./
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev --no-audit --no-fund; \
    else \
      npm install --omit=dev --no-audit --no-fund; \
    fi

# Copy application source
COPY . .

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Ensure the app listens on 0.0.0.0:4000 inside container
# Your package.json should have: "start": "node server.js" (or similar)
CMD ["npm", "start"]

