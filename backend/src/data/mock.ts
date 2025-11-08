export const products = [
  { id: '1', name: 'Cappuccino', category: 'Coffee', price: 35000, stock: 50, image: '', status: 'active' },
  { id: '2', name: 'Americano', category: 'Coffee', price: 25000, stock: 30, image: '', status: 'active' },
  { id: '3', name: 'Latte', category: 'Coffee', price: 40000, stock: 25, image: '', status: 'active' },
];

export const tables = [
  { id: '1', number: 1, seats: 2, status: 'empty' },
  { id: '2', number: 2, seats: 4, status: 'active' },
  { id: '3', number: 3, seats: 2, status: 'booked' },
];

export const outlets = [
  { id: '1', name: 'Main Store', status: 'open' },
  { id: '2', name: 'Mall Branch', status: 'closed' },
  { id: '3', name: 'Street Branch', status: 'open' },
];

export type OrderItem = { id: string; productId: string; quantity: number; subtotal: number };
export type Order = { id: string; items: OrderItem[]; subtotal: number; discount: number; total: number; tableId?: string; status: 'pending'|'completed'|'cancelled'; createdAt: string };

export const orders: Order[] = [];

