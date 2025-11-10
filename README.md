POS

Backend setup
- Node.js Express backend in `backend/`
- Endpoints: `/api/auth`, `/api/products`, `/api/orders`, `/api/tables`, `/api/outlets`
- Local dev: `cd backend && npm install && npm run dev`
- Env: copy `backend/.env.example` to `backend/.env`

Docker
- Frontend already builds via root `Dockerfile` (nginx)
- Backend dockerfile at `backend/Dockerfile`
- Example compose:

```
services:
  frontend:
    build: .
    ports:
      - "8080:80"
  backend:
    build: ./backend
    environment:
      - PORT=4000
      - JWT_SECRET=change-me
    ports:
      - "4000:4000"
    restart: unless-stopped
```

Frontend integration
- Hook frontend to backend APIs
- Auth: POST `/api/auth/login` returns `{ user, token }`
- Products: CRUD at `/api/products`
- Orders: create at `/api/orders`

# POS

Production with Caddy
- A `Caddyfile` and `docker-compose.prod.caddy.yml` are included for TLS + domain routing.
- Requirements:
  - DNS A record for your `DOMAIN` pointing to the server IP
  - Open ports 80/443 to the server
- Steps:
  - Set `DOMAIN` and `ACME_EMAIL` in `.env.compose` (see `.env.compose.example`). Ensure `VITE_API_URL` is unset so frontend calls `/api` relatively.
  - Bring up prod with Caddy:
    - `docker compose -f docker-compose.prod.yml -f docker-compose.prod.caddy.yml --env-file .env.compose up -d --build`
  - Caddy will proxy:
    - `/api*` to `backend:4000`
    - everything else to `frontend:80`
  - Frontend should use relative `/api` calls.
