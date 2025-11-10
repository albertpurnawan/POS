import { Router } from 'express';
import { query } from '../db';

const router = Router();

// Aggregated analytics from orders table
router.get('/stats', async (_req, res) => {
  // Daily revenue (last 7 days)
  const salesAgg = await query<{
    day: string;
    revenue: number;
    tx: number;
  }>(
    `SELECT to_char(created_at::date, 'YYYY-MM-DD') as day,
            SUM(total)::bigint as revenue,
            COUNT(*)::int as tx
     FROM orders
     WHERE created_at >= NOW() - INTERVAL '7 days'
     GROUP BY 1
     ORDER BY 1`
  );

  const salesData = salesAgg.rows.map(r => ({ date: r.day, revenue: Number(r.revenue), transactions: Number(r.tx) }));

  // By payment method
  const pmAgg = await query<{ payment_method: string; total: number }>(
    `SELECT payment_method, SUM(total)::bigint as total
     FROM orders
     GROUP BY payment_method`
  );

  const paymentMethods = pmAgg.rows.map((r, i) => ({ id: String(i + 1), name: r.payment_method === 'card' ? 'Credit Card' : r.payment_method === 'ewallet' ? 'E-Wallet' : 'Cash', total: Number(r.total) }));

  res.json({ salesData, paymentMethods });
});

export { router };
