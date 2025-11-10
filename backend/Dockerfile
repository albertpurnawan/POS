FROM node:20-alpine AS deps
WORKDIR /srv/app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /srv/app
ENV NODE_ENV=production
ENV PORT=80
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --no-audit --no-fund; else npm install --omit=dev --no-audit --no-fund; fi
COPY --from=deps /srv/app/dist ./dist
# Include SQL migrations in runtime image
COPY --from=deps /srv/app/src/db/migrations ./dist/db/migrations
EXPOSE 80
CMD ["node","dist/index.js"]
