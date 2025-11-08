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
