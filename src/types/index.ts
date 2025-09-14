export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'manager';
  avatar?: string;
}

export interface Outlet {
  id: string;
  name: string;
  status: 'open' | 'closed';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  status: 'active' | 'inactive';
  description?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  tableId?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: 'empty' | 'booked' | 'active';
  orderId?: string;
}

export interface SalesData {
  date: string;
  revenue: number;
  transactions: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  total: number;
}