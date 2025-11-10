Backend Docker build notes

Expected project shape (customize as needed):
- package.json with a "start" script (e.g. "node server.js" or a framework command)
- App listens on 0.0.0.0:4000 inside the container

Dockerfile behavior:
- Installs production deps (omit dev) with npm ci if package-lock.json exists, otherwise npm install
- Copies the project files and runs "npm start"

If using TypeScript:
1) Add a build stage and copy compiled files to the runtime image
2) Example multi-stage Dockerfile:

```
FROM node:20-alpine AS deps
WORKDIR /srv/app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /srv/app
ENV NODE_ENV=production
ENV PORT=4000
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --no-audit --no-fund; else npm install --omit=dev --no-audit --no-fund; fi
COPY --from=deps /srv/app/dist ./dist
EXPOSE 4000
CMD ["node","dist/index.js"]
```

Compose integration:
- docker-compose.yml expects backend context at ./backend, port 4000
- Environment variables for DB are injected by compose

