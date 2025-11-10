import { useEffect, useState } from 'react';
import { Product, OrderItem, Order, Table, Outlet, SalesData, PaymentMethod, OrderSummary } from '../types';
import { apiGet, apiPost } from '../lib/api';
import { apiPut, apiDelete } from '../lib/api';

export const usePOS = () => {
  const [currentOutlet, setCurrentOutlet] = useState<Outlet>({
    id: '1',
    name: 'Main Store',
    status: 'open'
  });

  const [products, setProducts] = useState<Product[]>([]);

  const [tables, setTables] = useState<Table[]>([]);

  const [salesData, setSalesData] = useState<SalesData[]>([]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);

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

  const checkout = async (paymentMethod: 'cash'|'card'|'ewallet' = 'cash') => {
    if (currentOrder.length === 0) return null;
    const payload = {
      items: currentOrder.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        subtotal: i.subtotal,
      })),
      discount: 0,
      paymentMethod,
    };
    const order = await apiPost<Order>('/orders', payload);
    // refresh list
    try {
      const list = await apiGet<OrderSummary[]>('/orders');
      setOrders(list);
    } catch {}
    clearOrder();
    return order;
  };

  const loadOrders = async () => {
    const list = await apiGet<OrderSummary[]>('/orders');
    setOrders(list);
    return list;
  };

  const completeOrder = async (id: string) => {
    const updated = await apiPut<OrderSummary>(`/orders/${id}/complete`);
    setOrders(prev => prev.map(o => (o.id === id ? updated : o)));
    return updated;
  };

  const deleteOrder = async (id: string) => {
    await apiDelete(`/orders/${id}`);
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  const createProduct = async (payload: {
    name: string;
    category: string;
    price: number;
    stock: number;
    image?: string;
    status?: 'active' | 'inactive';
  }) => {
    const created = await apiPost<Product>('/products', payload);
    setProducts(prev => [...prev, created]);
    return created;
  };

  const updateProduct = async (
    id: string,
    patch: Partial<Pick<Product, 'name' | 'category' | 'price' | 'stock' | 'image' | 'status' | 'description'>>
  ) => {
    const updated = await apiPut<Product>(`/products/${id}`, patch);
    setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProduct = async (id: string) => {
    await apiDelete(`/products/${id}`);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Outlets CRUD
  const createOutlet = async (payload: { name: string; status: 'open'|'closed' }) => {
    const created = await apiPost<Outlet>('/outlets', payload);
    setOutlets(prev => [...prev, created]);
    return created;
  };

  const updateOutlet = async (id: string, patch: Partial<Outlet>) => {
    const updated = await apiPut<Outlet>(`/outlets/${id}`, patch);
    setOutlets(prev => prev.map(o => (o.id === id ? updated : o)));
    if (currentOutlet.id === id) setCurrentOutlet(updated);
    return updated;
  };

  const deleteOutlet = async (id: string) => {
    await apiDelete(`/outlets/${id}`);
    setOutlets(prev => prev.filter(o => o.id !== id));
    if (currentOutlet.id === id && outlets[0]) setCurrentOutlet(outlets[0]);
  };

  // Tables CRUD
  const createTable = async (payload: { number: number; seats: number; status: 'empty'|'booked'|'active' }) => {
    const created = await apiPost<Table>('/tables', payload);
    setTables(prev => [...prev, created]);
    return created;
  };

  const updateTable = async (id: string, patch: Partial<Table>) => {
    const updated = await apiPut<Table>(`/tables/${id}`, patch);
    setTables(prev => prev.map(t => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTable = async (id: string) => {
    await apiDelete(`/tables/${id}`);
    setTables(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    // Load initial data from backend
    (async () => {
      try {
        const [prods, tbls, analytics, outs] = await Promise.all([
          apiGet<Product[]>('/products'),
          apiGet<Table[]>('/tables'),
          apiGet<{ salesData: SalesData[]; paymentMethods: PaymentMethod[] }>(
            '/analytics/stats'
          ),
          apiGet<Outlet[]>('/outlets'),
        ]);
        setProducts(prods);
        setTables(tbls);
        setSalesData(analytics.salesData);
        setPaymentMethods(analytics.paymentMethods);
        // prefer backend outlet 1 if available
        setOutlets(outs);
        const first = outs && outs[0];
        if (first) setCurrentOutlet(first);
      } catch (e) {
        // In case backend unavailable, keep empty state (UI still renders)
        // eslint-disable-next-line no-console
        console.warn('Failed to load initial data', e);
      }
    })();
  }, []);

  // outlets are loaded from backend

  return {
    currentOutlet,
    setCurrentOutlet,
    outlets,
    products,
    tables,
    orders,
    salesData,
    paymentMethods,
    currentOrder,
    addToOrder,
    removeFromOrder,
    updateOrderItem,
    clearOrder,
    getOrderTotal,
    checkout,
    createProduct,
    updateProduct,
    deleteProduct,
    createOutlet,
    updateOutlet,
    deleteOutlet,
    createTable,
    updateTable,
    deleteTable,
    loadOrders,
    completeOrder,
    deleteOrder
  };
};
