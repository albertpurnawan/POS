FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 4000
CMD ["npm", "start"]

