import { Router } from 'express';
import { outlets } from '../data/mock.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(outlets);
});

export { router };

