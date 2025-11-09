import { Router } from 'express';
import { z } from 'zod';
import { products as mockProducts } from '../data/mock';

const router = Router();

router.get('/', (_req, res) => {
  res.json(mockProducts);
});

const CreateSchema = z.object({
  name: z.string(),
  category: z.string(),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  image: z.string().optional().default(''),
  status: z.enum(['active', 'inactive']).default('active')
});

router.post('/', (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const newProduct = { id: Date.now().toString(), ...parsed.data };
  mockProducts.push(newProduct as any);
  res.status(201).json(newProduct);
});

router.get('/:id', (req, res) => {
  const item = mockProducts.find(p => p.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.put('/:id', (req, res) => {
  const idx = mockProducts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  mockProducts[idx] = { ...mockProducts[idx], ...req.body } as any;
  res.json(mockProducts[idx]);
});

router.delete('/:id', (req, res) => {
  const idx = mockProducts.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = mockProducts.splice(idx, 1);
  res.json(removed);
});

export { router };
