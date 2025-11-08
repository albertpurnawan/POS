import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { router as authRouter } from './routes/auth.js';
import { router as productsRouter } from './routes/products.js';
import { router as ordersRouter } from './routes/orders.js';
import { router as tablesRouter } from './routes/tables.js';
import { router as outletsRouter } from './routes/outlets.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/outlets', outletsRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`);
});

