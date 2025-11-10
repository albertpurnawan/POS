import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db';
import bcrypt from 'bcryptjs';

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

router.post('/login', async (req: { body: any; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; details?: any; }): any; new(): any; }; }; json: (arg0: { user: { readonly id: any; readonly name: any; readonly email: any; readonly role: any; readonly avatar: any; }; token: any; }) => void; }) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
  }
  const { email, password } = parsed.data;

  const { rows } = await query('SELECT * FROM users WHERE email=$1', [email]);
  const u = rows[0];
  if (!u) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const user = { id: u.id, name: u.name, email: u.email, role: u.role, avatar: u.avatar } as const;
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
  res.json({ user, token });
});

router.post('/logout', (_req: any, res: { json: (arg0: { success: boolean; }) => void; }) => {
  res.json({ success: true });
});

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin','cashier','manager']).optional().default('cashier'),
});

router.post('/register', async (req: { body: any; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error?: any; user?: { readonly id: string; readonly name: any; readonly email: any; readonly role: any; readonly avatar: ""; }; token?: any; }): void; new(): any; }; }; }) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, email, password, role } = parsed.data;
  // check existing
  const existing = await query('SELECT 1 FROM users WHERE email=$1', [email]);
  if (existing.rowCount && existing.rowCount > 0) return res.status(409).json({ error: 'Email already registered' });
  const id = Date.now().toString();
  const password_hash = await bcrypt.hash(password, 10);
  await query('INSERT INTO users (id,name,email,password_hash,role) VALUES ($1,$2,$3,$4,$5)', [id, name, email, password_hash, role]);
  const user = { id, name, email, role, avatar: '' } as const;
  const token = jwt.sign({ sub: id, role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
  res.status(201).json({ user, token });
});

export { router };
