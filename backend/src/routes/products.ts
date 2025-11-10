import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db';

const router = Router();

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT * FROM products ORDER BY name ASC');
  res.json(rows);
});

const CreateSchema = z.object({
  name: z.string(),
  category: z.string(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  image: z.string().optional().default(''),
  status: z.enum(['active', 'inactive']).default('active')
});

router.post('/', async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const id = Date.now().toString();
  const p = { id, ...parsed.data };
  await query(
    'INSERT INTO products (id,name,category,price,stock,image,status,description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [p.id, p.name, p.category, p.price, p.stock, p.image ?? '', p.status, (p as any).description ?? null]
  );
  res.status(201).json(p);
});

router.get('/:id', async (req, res) => {
  const { rows } = await query('SELECT * FROM products WHERE id=$1', [req.params.id]);
  const item = rows[0];
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.put('/:id', async (req, res) => {
  const fields = ['name','category','price','stock','image','status','description'] as const;
  const updates: string[] = [];
  const values: any[] = [];
  let i = 1;
  for (const f of fields) {
    if (f in req.body) {
      updates.push(`${f}=$${i++}`);
      values.push((req.body as any)[f]);
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id);
  const sql = `UPDATE products SET ${updates.join(',')} WHERE id=$${i} RETURNING *`;
  const { rows } = await query(sql, values);
  const updated = rows[0];
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { rows } = await query('DELETE FROM products WHERE id=$1 RETURNING *', [req.params.id]);
  const removed = rows[0];
  if (!removed) return res.status(404).json({ error: 'Not found' });
  res.json(removed);
});

export { router };
