import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { router as authRouter } from './routes/auth';
import { router as productsRouter } from './routes/products';
import { router as ordersRouter } from './routes/orders';
import { router as tablesRouter } from './routes/tables';
import { router as analyticsRouter } from './routes/analytics';
import { router as paymentsRouter } from './routes/payments';
import { router as settingsRouter } from './routes/settings';
import { router as outletsRouter } from './routes/outlets';
import { runMigrations } from './db/migrate';

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
app.use('/api/analytics', analyticsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/settings', settingsRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
(async () => {
  try {
    await runMigrations();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();
