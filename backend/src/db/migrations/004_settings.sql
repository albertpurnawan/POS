CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  business_name TEXT NOT NULL DEFAULT 'POS Pro Cafe',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
  currency TEXT NOT NULL DEFAULT 'IDR',
  notify_new_order BOOLEAN NOT NULL DEFAULT true,
  notify_low_stock BOOLEAN NOT NULL DEFAULT true,
  daily_report BOOLEAN NOT NULL DEFAULT false,
  font_size TEXT NOT NULL DEFAULT 'medium'
);
