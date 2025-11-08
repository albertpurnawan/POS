import { Router } from 'express';
import { tables } from '../data/mock.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(tables);
});

export { router };

