import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';

const router = Router();

// Get settings (singleton id=1)
router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT * FROM settings WHERE id=1');
  if (rows.length === 0) {
    // initialize default row
    await query('INSERT INTO settings (id) VALUES (1)');
    const { rows: r2 } = await query('SELECT * FROM settings WHERE id=1');
    return res.json(r2[0]);
  }
  res.json(rows[0]);
});

const UpdateSchema = z.object({
  business_name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
  notify_new_order: z.boolean().optional(),
  notify_low_stock: z.boolean().optional(),
  daily_report: z.boolean().optional(),
  font_size: z.enum(['small','medium','large']).optional(),
});

router.put('/', async (req, res) => {
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const body = parsed.data as Record<string, any>;
  if (!Object.keys(body).length) return res.status(400).json({ error: 'No fields to update' });
  const sets: string[] = [];
  const values: any[] = [];
  let i = 1;
  for (const [k, v] of Object.entries(body)) {
    sets.push(`${k}=$${i++}`);
    values.push(v);
  }
  const sql = `UPDATE settings SET ${sets.join(', ')} WHERE id=1 RETURNING *`;
  const { rows } = await query(sql, values);
  res.json(rows[0]);
});

export { router };

