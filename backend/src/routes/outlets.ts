import { Router } from 'express';
import { query } from '../db';
import { z } from 'zod';

const router = Router();

router.get('/', async (_req, res) => {
  const { rows } = await query('SELECT * FROM outlets ORDER BY name ASC');
  res.json(rows);
});

const CreateSchema = z.object({
  name: z.string(),
  status: z.enum(['open', 'closed']).default('open'),
});

router.post('/', async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const id = Date.now().toString();
  const o = { id, ...parsed.data };
  await query('INSERT INTO outlets (id,name,status) VALUES ($1,$2,$3)', [o.id, o.name, o.status]);
  res.status(201).json(o);
});

router.put('/:id', async (req, res) => {
  const fields = ['name', 'status'] as const;
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
  const sql = `UPDATE outlets SET ${updates.join(',')} WHERE id=$${i} RETURNING *`;
  const { rows } = await query(sql, values);
  const updated = rows[0];
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { rows } = await query('DELETE FROM outlets WHERE id=$1 RETURNING *', [req.params.id]);
  const removed = rows[0];
  if (!removed) return res.status(404).json({ error: 'Not found' });
  res.json(removed);
});

export { router };
