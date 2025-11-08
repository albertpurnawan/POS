import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = Router();

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4)
});

router.post('/login', (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
  }
  const { email } = parsed.data;

  const user = {
    id: '1',
    name: 'John Doe',
    email,
    role: 'cashier' as const,
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
  };

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' });
  res.json({ user, token });
});

router.post('/logout', (_req, res) => {
  res.json({ success: true });
});

export { router };

