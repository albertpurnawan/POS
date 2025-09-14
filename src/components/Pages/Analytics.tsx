import React, { useState } from 'react';
import { TrendingUp, DollarSign, CreditCard, Calendar, Download } from 'lucide-react';
import { SalesData, PaymentMethod } from '../../types';

interface AnalyticsProps {
  salesData: SalesData[];
  paymentMethods: PaymentMethod[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ salesData, paymentMethods }) => {
  const [dateFilter, setDateFilter] = useState('7days');

  const totalRevenue = paymentMethods.reduce((sum, pm) => sum + pm.total, 0);
  const totalTransactions = salesData.reduce((sum, data) => sum + data.transactions, 0);

  const filterOptions = [
    { value: '7days', label: '7 Hari Terakhir' },
    { value: '30days', label: '30 Hari Terakhir' },
    { value: '3months', label: '3 Bulan Terakhir' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan & Analytics</h1>
          <p className="text-gray-600">Analisis performa dan laporan penjualan</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-green-600 mt-1">+12.5% dari bulan lalu</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalTransactions}</p>
              <p className="text-sm text-green-600 mt-1">+8.2% dari bulan lalu</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata per Transaksi</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                Rp {Math.round(totalRevenue / totalTransactions).toLocaleString('id-ID')}
              </p>
              <p className="text-sm text-green-600 mt-1">+5.1% dari bulan lalu</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">15.3%</p>
              <p className="text-sm text-green-600 mt-1">Bulan ini</p>
            </div>
            <div className="bg-indigo-500 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tren Revenue</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-4">
            {salesData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">
                    {new Date(data.date).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    Rp {data.revenue.toLocaleString('id-ID')}
                  </p>
                  <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ 
                        width: `${(data.revenue / Math.max(...salesData.map(d => d.revenue))) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Metode Pembayaran</h3>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-6">
            {paymentMethods.map((method) => {
              const percentage = (method.total / totalRevenue) * 100;
              return (
                <div key={method.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{method.name}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Rp {method.total.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full ${
                        method.id === '1' ? 'bg-green-500' :
                        method.id === '2' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Penjualan Harian</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-200">
                  <th className="pb-3">Tanggal</th>
                  <th className="pb-3">Transaksi</th>
                  <th className="pb-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {salesData.slice(-7).map((data, index) => (
                  <tr key={index} className="text-sm">
                    <td className="py-3 text-gray-900">
                      {new Date(data.date).toLocaleDateString('id-ID', { 
                        weekday: 'short',
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </td>
                    <td className="py-3 text-gray-600">{data.transactions}</td>
                    <td className="py-3 font-medium text-gray-900">
                      Rp {data.revenue.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performa Terbaik</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Hari Terbaik</p>
                <p className="text-sm text-gray-600">
                  {new Date(salesData[salesData.length - 1].date).toLocaleDateString('id-ID', { 
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </div>
              <p className="text-lg font-bold text-green-600">
                Rp {Math.max(...salesData.map(d => d.revenue)).toLocaleString('id-ID')}
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Metode Pembayaran Favorit</p>
                <p className="text-sm text-gray-600">
                  {paymentMethods.reduce((prev, current) => 
                    prev.total > current.total ? prev : current
                  ).name}
                </p>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {((paymentMethods.reduce((prev, current) => 
                  prev.total > current.total ? prev : current
                ).total / totalRevenue) * 100).toFixed(1)}%
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Rata-rata Transaksi/Hari</p>
                <p className="text-sm text-gray-600">7 hari terakhir</p>
              </div>
              <p className="text-lg font-bold text-purple-600">
                {Math.round(totalTransactions / salesData.length)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};