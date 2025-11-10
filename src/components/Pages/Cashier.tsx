import React, { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard, QrCode } from 'lucide-react';
import { Product, OrderItem } from '../../types';

interface CashierProps {
  products: Product[];
  currentOrder: OrderItem[];
  onAddToOrder: (product: Product, quantity: number) => void;
  onUpdateOrderItem: (itemId: string, quantity: number) => void;
  onRemoveFromOrder: (itemId: string) => void;
  onClearOrder: () => void;
  getOrderTotal: () => number;
  checkout?: (method?: 'cash'|'card'|'ewallet') => Promise<any> | null;
  completeOrder?: (id: string) => Promise<any>;
}

export const Cashier: React.FC<CashierProps> = ({
  products,
  currentOrder,
  onAddToOrder,
  onUpdateOrderItem,
  onRemoveFromOrder,
  onClearOrder,
  getOrderTotal,
  checkout,
  completeOrder
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleCheckout = () => {
    if (currentOrder.length > 0) {
      setShowPaymentModal(true);
    }
  };

  const [paying, setPaying] = useState(false);
  const handlePayment = async (method: 'cash'|'card'|'ewallet' = 'cash') => {
    try {
      setPaying(true);
      let orderId: string | null = null;
      if (checkout) {
        const order = await checkout(method);
        orderId = order?.id || null;
      }
      if (orderId && method === 'ewallet') {
        setLastOrderId(orderId);
        // fetch QR code for e-wallet
        try {
          const res = await fetch(`/api/payments/qr/${orderId}`);
          if (res.ok) {
            const json = await res.json();
            setQrDataUrl(json.dataUrl);
          }
        } catch {}
      }
      if (method !== 'ewallet') alert('Pembayaran berhasil!');
    } catch (e) {
      alert('Gagal membuat pesanan');
    } finally {
      setPaying(false);
      onClearOrder();
      if (method !== 'ewallet') setShowPaymentModal(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Left Side - Categories and Products */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kasir</h1>
          <p className="text-gray-600">Pilih produk dan kelola pesanan</p>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                <p className="text-lg font-bold text-indigo-600 mb-3">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Stok: {product.stock}</span>
                  <button
                    onClick={() => onAddToOrder(product, 1)}
                    disabled={product.stock === 0}
                    className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Order Summary */}
      <div className="w-full lg:w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Pesanan</h2>
            <ShoppingCart className="h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {currentOrder.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada pesanan</p>
              <p className="text-sm text-gray-400">Pilih produk untuk mulai</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentOrder.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">
                        Rp {item.product.price.toLocaleString('id-ID')}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onUpdateOrderItem(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-medium">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateOrderItem(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveFromOrder(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-indigo-600 mt-1">
                        Subtotal: Rp {item.subtotal.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {currentOrder.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">Rp {getOrderTotal().toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pajak (10%):</span>
                <span className="font-medium">Rp {(getOrderTotal() * 0.1).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-3">
                <span>Total:</span>
                <span className="text-indigo-600">Rp {(getOrderTotal() * 1.1).toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleCheckout}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>Checkout</span>
              </button>
              <button
                onClick={onClearOrder}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Bersihkan Pesanan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Konfirmasi Pembayaran</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-bold">Rp {(getOrderTotal() * 1.1).toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePayment('cash')}
                className="bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
              >
                Cash
              </button>
              <button
                onClick={() => handlePayment('card')}
                className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Card
              </button>
              <button
                onClick={() => handlePayment('ewallet')}
                className="bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center space-x-2"
              >
                <QrCode className="h-5 w-5" />
                <span>E-Wallet</span>
              </button>
            </div>
            {qrDataUrl && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Scan untuk bayar:</p>
                <img src={qrDataUrl} alt="QR Code" className="mx-auto w-48 h-48" />
                <div className="mt-3 flex items-center justify-center space-x-2">
                  <button
                    onClick={async () => {
                      if (!lastOrderId || !completeOrder) return;
                      try {
                        await completeOrder(lastOrderId);
                        alert('Pembayaran berhasil dikonfirmasi');
                        setQrDataUrl('');
                        setLastOrderId(null);
                        setShowPaymentModal(false);
                      } catch {
                        alert('Gagal konfirmasi pembayaran');
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    Tandai Lunas
                  </button>
                  <button onClick={() => { setQrDataUrl(''); setLastOrderId(null); setShowPaymentModal(false); }} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300">Tutup</button>
                </div>
              </div>
            )}
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full mt-3 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
