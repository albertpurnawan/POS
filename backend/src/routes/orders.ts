import { Router } from 'express';
import { z } from 'zod';
import { orders } from '../data/mock.js';

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
});

router.get('/', (_req, res) => {
  res.json(orders);
});

router.post('/', (req, res) => {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const subtotal = parsed.data.items.reduce((sum, i) => sum + i.subtotal, 0);
  const total = Math.max(0, subtotal - parsed.data.discount);
  const order = {
    id: Date.now().toString(),
    items: parsed.data.items,
    subtotal,
    discount: parsed.data.discount,
    total,
    tableId: parsed.data.tableId,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  res.status(201).json(order);
});

router.put('/:id/complete', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  order.status = 'completed';
  res.json(order);
});

router.delete('/:id', (req, res) => {
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = orders.splice(idx, 1);
  res.json(removed);
});

export { router };

