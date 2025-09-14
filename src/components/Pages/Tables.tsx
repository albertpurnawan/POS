import React, { useState } from 'react';
import { Plus, Users, Clock, Check } from 'lucide-react';
import { Table } from '../../types';

interface TablesProps {
  tables: Table[];
}

export const Tables: React.FC<TablesProps> = ({ tables }) => {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const getTableStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'empty':
        return 'bg-gray-100 border-gray-300 text-gray-700';
      case 'booked':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      case 'active':
        return 'bg-green-100 border-green-300 text-green-700';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700';
    }
  };

  const getTableStatusText = (status: Table['status']) => {
    switch (status) {
      case 'empty':
        return 'Kosong';
      case 'booked':
        return 'Dipesan';
      case 'active':
        return 'Aktif';
      default:
        return 'Kosong';
    }
  };

  const getTableIcon = (status: Table['status']) => {
    switch (status) {
      case 'empty':
        return <Users className="h-8 w-8 text-gray-400" />;
      case 'booked':
        return <Clock className="h-8 w-8 text-yellow-500" />;
      case 'active':
        return <Check className="h-8 w-8 text-green-500" />;
      default:
        return <Users className="h-8 w-8 text-gray-400" />;
    }
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    if (table.status === 'empty') {
      setShowAssignModal(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Meja</h1>
          <p className="text-gray-600">Kelola status dan reservasi meja</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Tambah Meja</span>
        </button>
      </div>

      {/* Table Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Meja</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{tables.length}</p>
            </div>
            <div className="bg-indigo-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meja Kosong</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {tables.filter(t => t.status === 'empty').length}
              </p>
            </div>
            <div className="bg-gray-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meja Dipesan</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {tables.filter(t => t.status === 'booked').length}
              </p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meja Aktif</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {tables.filter(t => t.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Check className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Tables Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Layout Meja</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`
                relative p-6 rounded-xl border-2 border-dashed transition-all duration-200 hover:scale-105 hover:shadow-md
                ${getTableStatusColor(table.status)}
              `}
            >
              <div className="text-center space-y-3">
                {getTableIcon(table.status)}
                <div>
                  <p className="font-bold text-xl">Meja {table.number}</p>
                  <p className="text-sm">{table.seats} kursi</p>
                  <p className="text-xs font-medium mt-2">
                    {getTableStatusText(table.status)}
                  </p>
                </div>
              </div>
              
              {table.status === 'active' && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              )}
              {table.status === 'booked' && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-500 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table Details */}
      {selectedTable && !showAssignModal && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Detail Meja {selectedTable.number}
            </h3>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${selectedTable.status === 'empty' ? 'bg-gray-100 text-gray-700' :
                selectedTable.status === 'booked' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'}
            `}>
              {getTableStatusText(selectedTable.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Informasi Meja</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nomor Meja:</span>
                  <span className="font-medium">{selectedTable.number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kapasitas:</span>
                  <span className="font-medium">{selectedTable.seats} orang</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">{getTableStatusText(selectedTable.status)}</span>
                </div>
              </div>
            </div>
            
            {selectedTable.status === 'active' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Pesanan Aktif</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Order ID: #12345</p>
                  <p className="font-medium">2x Cappuccino, 1x Croissant</p>
                  <p className="text-sm text-gray-600 mt-2">Dimulai: 14:30</p>
                  <div className="flex space-x-2 mt-4">
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                      Selesai
                    </button>
                    <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assign Order Modal */}
      {showAssignModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Assign Pesanan - Meja {selectedTable.number}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Pesanan
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Pilih pesanan...</option>
                  <option value="1">Order #001 - Rp 85,000</option>
                  <option value="2">Order #002 - Rp 125,000</option>
                  <option value="3">Order #003 - Rp 65,000</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Tamu
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedTable.seats}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Masukkan jumlah tamu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (opsional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Catatan khusus..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedTable(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  // Handle assign order logic here
                  setShowAssignModal(false);
                  setSelectedTable(null);
                  alert('Pesanan berhasil di-assign ke meja!');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Assign Pesanan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};