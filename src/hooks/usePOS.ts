import { useState } from 'react';
import { Product, OrderItem, Order, Table, Outlet, SalesData, PaymentMethod } from '../types';

export const usePOS = () => {
  const [currentOutlet, setCurrentOutlet] = useState<Outlet>({
    id: '1',
    name: 'Main Store',
    status: 'open'
  });

  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Cappuccino',
      category: 'Coffee',
      price: 35000,
      stock: 50,
      image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300',
      status: 'active'
    },
    {
      id: '2',
      name: 'Americano',
      category: 'Coffee',
      price: 25000,
      stock: 30,
      image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=300',
      status: 'active'
    },
    {
      id: '3',
      name: 'Latte',
      category: 'Coffee',
      price: 40000,
      stock: 25,
      image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=300',
      status: 'active'
    },
    {
      id: '4',
      name: 'Croissant',
      category: 'Food',
      price: 20000,
      stock: 15,
      image: 'https://images.pexels.com/photos/2135677/pexels-photo-2135677.jpeg?auto=compress&cs=tinysrgb&w=300',
      status: 'active'
    },
    {
      id: '5',
      name: 'Cheesecake',
      category: 'Dessert',
      price: 45000,
      stock: 8,
      image: 'https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg?auto=compress&cs=tinysrgb&w=300',
      status: 'active'
    },
    {
      id: '6',
      name: 'Orange Juice',
      category: 'Drink',
      price: 18000,
      stock: 20,
      image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=300',
      status: 'active'
    }
  ]);

  const [tables] = useState<Table[]>([
    { id: '1', number: 1, seats: 2, status: 'empty' },
    { id: '2', number: 2, seats: 4, status: 'active' },
    { id: '3', number: 3, seats: 2, status: 'booked' },
    { id: '4', number: 4, seats: 6, status: 'empty' },
    { id: '5', number: 5, seats: 4, status: 'active' },
    { id: '6', number: 6, seats: 2, status: 'empty' }
  ]);

  const [salesData] = useState<SalesData[]>([
    { date: '2024-01-01', revenue: 2500000, transactions: 45 },
    { date: '2024-01-02', revenue: 2800000, transactions: 52 },
    { date: '2024-01-03', revenue: 3200000, transactions: 61 },
    { date: '2024-01-04', revenue: 2900000, transactions: 48 },
    { date: '2024-01-05', revenue: 3500000, transactions: 68 },
    { date: '2024-01-06', revenue: 4100000, transactions: 75 },
    { date: '2024-01-07', revenue: 3800000, transactions: 72 }
  ]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: '1', name: 'Cash', total: 15500000 },
    { id: '2', name: 'Credit Card', total: 8200000 },
    { id: '3', name: 'E-Wallet', total: 12300000 }
  ]);

  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);

  const addToOrder = (product: Product, quantity: number = 1) => {
    const existingItem = currentOrder.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCurrentOrder(currentOrder.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * product.price }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productId: product.id,
        product,
        quantity,
        subtotal: product.price * quantity
      };
      setCurrentOrder([...currentOrder, newItem]);
    }
  };

  const removeFromOrder = (itemId: string) => {
    setCurrentOrder(currentOrder.filter(item => item.id !== itemId));
  };

  const updateOrderItem = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromOrder(itemId);
      return;
    }
    
    setCurrentOrder(currentOrder.map(item => 
      item.id === itemId 
        ? { ...item, quantity, subtotal: item.product.price * quantity }
        : item
    ));
  };

  const clearOrder = () => {
    setCurrentOrder([]);
  };

  const getOrderTotal = () => {
    return currentOrder.reduce((total, item) => total + item.subtotal, 0);
  };

  const outlets: Outlet[] = [
    { id: '1', name: 'Main Store', status: 'open' },
    { id: '2', name: 'Mall Branch', status: 'closed' },
    { id: '3', name: 'Street Branch', status: 'open' }
  ];

  return {
    currentOutlet,
    setCurrentOutlet,
    outlets,
    products,
    tables,
    salesData,
    paymentMethods,
    currentOrder,
    addToOrder,
    removeFromOrder,
    updateOrderItem,
    clearOrder,
    getOrderTotal
  };
};