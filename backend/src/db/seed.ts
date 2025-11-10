import { query } from '../db';

function id() { return Date.now().toString() + Math.random().toString(36).slice(2, 8); }

async function seed() {
  // Clear existing data (optional): comment out if you want to keep
  await query('DELETE FROM order_items');
  await query('DELETE FROM orders');
  await query('DELETE FROM products');
  await query('DELETE FROM tables');
  await query('DELETE FROM outlets');
  await query('DELETE FROM users');

  // Outlets
  const outlets = [
    { id: '1', name: 'Main Store', status: 'open' },
    { id: '2', name: 'Mall Branch', status: 'closed' },
    { id: '3', name: 'Street Branch', status: 'open' },
  ];
  for (const o of outlets) {
    await query('INSERT INTO outlets (id,name,status) VALUES ($1,$2,$3)', [o.id, o.name, o.status]);
  }

  // Tables (10 meja)
  const tables = [
    { id: '1', number: 1, seats: 2, status: 'empty' },
    { id: '2', number: 2, seats: 4, status: 'active' },
    { id: '3', number: 3, seats: 2, status: 'booked' },
    { id: '4', number: 4, seats: 6, status: 'empty' },
    { id: '5', number: 5, seats: 4, status: 'active' },
    { id: '6', number: 6, seats: 2, status: 'empty' },
    { id: '7', number: 7, seats: 6, status: 'empty' },
    { id: '8', number: 8, seats: 4, status: 'booked' },
    { id: '9', number: 9, seats: 2, status: 'empty' },
    { id: '10', number: 10, seats: 8, status: 'active' },
  ];
  for (const t of tables) {
    await query('INSERT INTO tables (id,number,seats,status) VALUES ($1,$2,$3,$4)', [t.id, t.number, t.seats, t.status]);
  }

  // Products (lebih banyak variasi)
  const products = [
    { id: '1', name: 'Cappuccino', category: 'Coffee', price: 35000, stock: 50, image: '', status: 'active', description: '' },
    { id: '2', name: 'Americano', category: 'Coffee', price: 25000, stock: 30, image: '', status: 'active', description: '' },
    { id: '3', name: 'Latte', category: 'Coffee', price: 40000, stock: 25, image: '', status: 'active', description: '' },
    { id: '4', name: 'Croissant', category: 'Food', price: 20000, stock: 15, image: '', status: 'active', description: '' },
    { id: '5', name: 'Cheesecake', category: 'Dessert', price: 45000, stock: 8, image: '', status: 'active', description: '' },
    { id: '6', name: 'Orange Juice', category: 'Drink', price: 18000, stock: 20, image: '', status: 'active', description: '' },
    { id: '7', name: 'Matcha Latte', category: 'Drink', price: 30000, stock: 18, image: '', status: 'active', description: '' },
    { id: '8', name: 'Espresso', category: 'Coffee', price: 20000, stock: 40, image: '', status: 'active', description: '' },
    { id: '9', name: 'Iced Tea', category: 'Drink', price: 15000, stock: 35, image: '', status: 'active', description: '' },
    { id: '10', name: 'Brownies', category: 'Dessert', price: 28000, stock: 12, image: '', status: 'active', description: '' },
  ];
  for (const p of products) {
    await query('INSERT INTO products (id,name,category,price,stock,image,status,description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [p.id, p.name, p.category, p.price, p.stock, p.image, p.status, p.description]);
  }

  // Users (admin + cashier)
  const adminPass = '$2a$10$Rr0q5WRt0f4n07x2b9qO8ObT2U9cZ6n1f9vW.8m9x7YQFZ2b8R7fy'; // bcrypt hash for 'password123'
  const cashierPass = adminPass;
  await query('INSERT INTO users (id,name,email,password_hash,role,avatar) VALUES ($1,$2,$3,$4,$5,$6)', ['u1', 'Admin', 'admin@pos.com', adminPass, 'admin', '']);
  await query('INSERT INTO users (id,name,email,password_hash,role,avatar) VALUES ($1,$2,$3,$4,$5,$6)', ['u2', 'Kasir', 'cashier@pos.com', cashierPass, 'cashier', '']);

  // Some example orders (3 orders)
  const order1 = id();
  await query('INSERT INTO orders (id, subtotal, discount, total, table_id, status, payment_method) VALUES ($1,$2,$3,$4,$5,$6,$7)', [order1, 90000, 0, 90000, '2', 'pending', 'cash']);
  await query('INSERT INTO order_items (id, order_id, product_id, quantity, subtotal) VALUES ($1,$2,$3,$4,$5)', [id(), order1, '1', 2, 70000]);
  await query('INSERT INTO order_items (id, order_id, product_id, quantity, subtotal) VALUES ($1,$2,$3,$4,$5)', [id(), order1, '6', 1, 20000]);

  const order2 = id();
  await query('INSERT INTO orders (id, subtotal, discount, total, table_id, status, payment_method) VALUES ($1,$2,$3,$4,$5,$6,$7)', [order2, 60000, 5000, 55000, '3', 'completed', 'card']);
  await query('INSERT INTO order_items (id, order_id, product_id, quantity, subtotal) VALUES ($1,$2,$3,$4,$5)', [id(), order2, '3', 1, 40000]);
  await query('INSERT INTO order_items (id, order_id, product_id, quantity, subtotal) VALUES ($1,$2,$3,$4,$5)', [id(), order2, '5', 1, 20000]);

  const order3 = id();
  await query('INSERT INTO orders (id, subtotal, discount, total, table_id, status, payment_method) VALUES ($1,$2,$3,$4,$5,$6,$7)', [order3, 20000, 0, 20000, '10', 'pending', 'ewallet']);
  await query('INSERT INTO order_items (id, order_id, product_id, quantity, subtotal) VALUES ($1,$2,$3,$4,$5)', [id(), order3, '4', 1, 20000]);

  // eslint-disable-next-line no-console
  console.log('Seed data inserted');
}

seed().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
