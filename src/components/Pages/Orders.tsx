import React, { useEffect, useState } from 'react';
import { CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { OrderSummary } from '../../types';

interface OrdersProps {
  orders: OrderSummary[];
  onRefresh?: () => Promise<any>;
  onComplete?: (id: string) => Promise<any>;
  onDelete?: (id: string) => Promise<any>;
}

export const Orders: React.FC<OrdersProps> = ({ orders, onRefresh, onComplete, onDelete }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (onRefresh) {
        setLoading(true);
        try { await onRefresh(); } finally { setLoading(false); }
      }
    })();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-gray-600">Kelola pesanan yang masuk</p>
        </div>
        <button onClick={async () => { if (!onRefresh) return; setLoading(true); try { await onRefresh(); } finally { setLoading(false); } }} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center space-x-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Meja</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Total</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Waktu</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{o.id}</td>
                  <td className="px-6 py-4">{o.tableId || '-'}</td>
                  <td className="px-6 py-4">Rp {o.total.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${o.status === 'completed' ? 'bg-green-100 text-green-700' : o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{o.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(o.created_at).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <button disabled={o.status !== 'pending'} onClick={async () => { if (!onComplete) return; await onComplete(o.id); }} className="text-green-600 hover:text-green-700 disabled:opacity-50">
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button onClick={async () => { if (!onDelete) return; if (!confirm('Hapus pesanan ini?')) return; await onDelete(o.id); }} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-500" colSpan={6}>Belum ada pesanan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

