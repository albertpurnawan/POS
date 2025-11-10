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

router.post('/login', async (req, res) => {
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

router.post('/logout', (_req, res) => {
  res.json({ success: true });
});

export { router };
