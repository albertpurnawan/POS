import { Router } from 'express';
import { query } from '../db';
import QRCode from 'qrcode';

const router = Router();

router.get('/qr/:orderId', async (req, res) => {
  const { rows } = await query('SELECT id, total FROM orders WHERE id=$1', [req.params.orderId]);
  const order = rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const payload = `POS-BOLT|order:${order.id}|amount:${order.total}`;
  const dataUrl = await QRCode.toDataURL(payload, { width: 256 });
  res.json({ dataUrl });
});

export { router };

