import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';

const router = Router();

const ItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  subtotal: z.number().nonnegative()
});

const CreateOrderSchema = z.object({
  items: z.array(ItemSchema),
  discount: z.number().nonnegative().default(0),
  tableId: z.string().optional(),
  paymentMethod: z.enum(['cash','card','ewallet']).default('cash'),
});

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT * FROM orders ORDER BY created_at DESC');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const subtotal = parsed.data.items.reduce((sum, i) => sum + i.subtotal, 0);
  const total = Math.max(0, subtotal - parsed.data.discount);
  const id = Date.now().toString();
  await query(
    'INSERT INTO orders (id, subtotal, discount, total, table_id, status, payment_method) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [id, subtotal, parsed.data.discount, total, parsed.data.tableId ?? null, 'pending', parsed.data.paymentMethod]
  );
  for (const it of parsed.data.items) {
    await query(
      'INSERT INTO order_items (id, order_id, product_id, quantity, subtotal) VALUES ($1,$2,$3,$4,$5)',
      [Date.now().toString() + Math.random().toString(36).slice(2), id, it.productId, it.quantity, it.subtotal]
    );
  }
  const { rows } = await query('SELECT * FROM orders WHERE id=$1', [id]);
  const order = rows[0];
  res.status(201).json(order);
});

router.put('/:id/complete', async (req, res) => {
  const { rows } = await query('UPDATE orders SET status=\'completed\' WHERE id=$1 RETURNING *', [req.params.id]);
  const order = rows[0];
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

router.delete('/:id', async (req, res) => {
  const { rows } = await query('DELETE FROM orders WHERE id=$1 RETURNING *', [req.params.id]);
  const removed = rows[0];
  if (!removed) return res.status(404).json({ error: 'Not found' });
  res.json(removed);
});

export { router };
