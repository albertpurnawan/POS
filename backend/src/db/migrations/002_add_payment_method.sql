ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cash' 
  CHECK (payment_method IN ('cash','card','ewallet'));

