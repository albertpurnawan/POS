import React from 'react';
import { TrendingUp, ShoppingCart, AlertTriangle, DollarSign, Users, Package } from 'lucide-react';
import { SalesData, Product, PaymentMethod } from '../../types';

interface DashboardProps {
  salesData: SalesData[];
  products: Product[];
  paymentMethods: PaymentMethod[];
}

export const Dashboard: React.FC<DashboardProps> = ({ salesData, products, paymentMethods }) => {
  const todaySales = salesData[salesData.length - 1];
  const lowStockProducts = products.filter(p => p.stock < 10);
  const totalRevenue = paymentMethods.reduce((sum, pm) => sum + pm.total, 0);

  const stats = [
    {
      title: 'Total Transaksi Hari Ini',
      value: todaySales?.transactions || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Revenue Hari Ini',
      value: `Rp ${(todaySales?.revenue || 0).toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Produk',
      value: products.length,
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Stok Rendah',
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview penjualan dan performa toko Anda</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Terakhir diupdate</p>
          <p className="font-medium">{new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Penjualan 7 Hari Terakhir</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {salesData.slice(-7).map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {new Date(data.date).toLocaleDateString('id-ID', { 
                      weekday: 'short', 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Rp {data.revenue.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">{data.transactions} transaksi</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Metode Pembayaran</h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{method.name}</span>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Rp {method.total.toLocaleString('id-ID')}
                  </p>
                  <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ 
                        width: `${(method.total / totalRevenue) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Produk Terlaris</h3>
          <div className="space-y-4">
            {products.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">Stok: {product.stock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Stok Rendah</h3>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Semua produk memiliki stok yang cukup</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-orange-600">Stok: {product.stock}</p>
                    <p className="text-xs text-gray-500">Perlu restok</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};