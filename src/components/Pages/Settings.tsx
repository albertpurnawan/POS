import React, { useState, useEffect } from 'react';
import { Save, Bell, Shield, Palette, Database, User, Edit2, Trash2, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import { Outlet } from '../../types';
import { apiGet, apiPut } from '../../lib/api';

interface SettingsProps {
  outlets?: Outlet[];
  onCreateOutlet?: (p: { name: string; status: 'open'|'closed' }) => Promise<Outlet>;
  onUpdateOutlet?: (id: string, patch: Partial<Outlet>) => Promise<Outlet>;
  onDeleteOutlet?: (id: string) => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({ outlets = [], onCreateOutlet, onUpdateOutlet, onDeleteOutlet }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [savingOutlet, setSavingOutlet] = useState(false);
  const [newOutletName, setNewOutletName] = useState('');
  const [newOutletStatus, setNewOutletStatus] = useState<'open'|'closed'>('open');
  const [sys, setSys] = useState<any | null>(null);
  const [systemSaving, setSystemSaving] = useState(false);

  const tabs = [
    { id: 'general', label: 'Umum', icon: User },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'security', label: 'Keamanan', icon: Shield },
    { id: 'appearance', label: 'Tampilan', icon: Palette },
    { id: 'system', label: 'Sistem', icon: Database }
  ];

  useEffect(() => {
    (async () => {
      try {
        const s = await apiGet<any>('/settings');
        setSys(s);
      } catch {}
    })();
  }, []);

  const saveSystem = async () => {
    if (!sys) return;
    try {
      setSystemSaving(true);
      const updated = await apiPut<any>('/settings', sys);
      setSys(updated);
      alert('Pengaturan sistem tersimpan');
    } catch {
      alert('Gagal menyimpan pengaturan');
    } finally {
      setSystemSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600">Kelola konfigurasi aplikasi dan preferensi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                    ${activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200">
          {activeTab === 'general' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pengaturan Umum</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Bisnis
                  </label>
                  <input
                    type="text"
                    value={sys?.business_name || ''}
                    onChange={(e) => setSys({ ...(sys||{}), business_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <input
                    type="text"
                    value={sys?.address || ''}
                    onChange={(e) => setSys({ ...(sys||{}), address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telepon
                  </label>
                  <input
                    type="tel"
                    value={sys?.phone || ''}
                    onChange={(e) => setSys({ ...(sys||{}), phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={sys?.email || ''}
                    onChange={(e) => setSys({ ...(sys||{}), email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona Waktu
                </label>
                <select value={sys?.timezone || 'Asia/Jakarta'} onChange={(e) => setSys({ ...(sys||{}), timezone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="Asia/Jakarta">Asia/Jakarta (UTC+7)</option>
                  <option value="Asia/Makassar">Asia/Makassar (UTC+8)</option>
                  <option value="Asia/Jayapura">Asia/Jayapura (UTC+9)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mata Uang
                </label>
                <select value={sys?.currency || 'IDR'} onChange={(e) => setSys({ ...(sys||{}), currency: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="IDR">Rupiah (IDR)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pengaturan Notifikasi</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notifikasi Pesanan Baru</p>
                    <p className="text-sm text-gray-600">Terima notifikasi saat ada pesanan baru</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={!!sys?.notify_new_order} onChange={(e) => setSys({ ...(sys||{}), notify_new_order: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notifikasi Stok Rendah</p>
                    <p className="text-sm text-gray-600">Peringatan saat stok produk hampir habis</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={!!sys?.notify_low_stock} onChange={(e) => setSys({ ...(sys||{}), notify_low_stock: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Laporan Harian</p>
                    <p className="text-sm text-gray-600">Kirim laporan penjualan harian via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={!!sys?.daily_report} onChange={(e) => setSys({ ...(sys||{}), daily_report: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Keamanan</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Ubah Password</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Lama
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Baru
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konfirmasi Password Baru
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Tingkatkan keamanan akun dengan 2FA</p>
                    </div>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                      Aktifkan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Tampilan</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Tema
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border-2 border-indigo-500 rounded-lg p-4 cursor-pointer">
                      <div className="w-full h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Default</p>
                    </div>
                    <div className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400">
                      <div className="w-full h-12 bg-gradient-to-r from-gray-700 to-gray-900 rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Dark</p>
                    </div>
                    <div className="border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400">
                      <div className="w-full h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded mb-2"></div>
                      <p className="text-sm font-medium text-center">Green</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ukuran Font
                  </label>
                <select value={sys?.font_size || 'medium'} onChange={(e) => setSys({ ...(sys||{}), font_size: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="small">Kecil</option>
                  <option value="medium">Sedang</option>
                  <option value="large">Besar</option>
                </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Pengaturan Sistem</h3>
              
              <div className="space-y-6">
                {/* Outlets Management */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Manajemen Outlet</h4>
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Tambah outlet</span>
                    </div>
                  </div>

                  {/* Add outlet form */}
                  <form className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4" onSubmit={async (e) => {
                    e.preventDefault();
                    if (!onCreateOutlet) return;
                    try {
                      setSavingOutlet(true);
                      await onCreateOutlet({ name: newOutletName || 'Outlet Baru', status: newOutletStatus });
                      setNewOutletName('');
                      setNewOutletStatus('open');
                    } finally {
                      setSavingOutlet(false);
                    }
                  }}>
                    <input
                      type="text"
                      placeholder="Nama outlet"
                      value={newOutletName}
                      onChange={(e) => setNewOutletName(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <select
                      value={newOutletStatus}
                      onChange={(e) => setNewOutletStatus(e.target.value as 'open'|'closed')}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button type="submit" disabled={savingOutlet} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300">
                      {savingOutlet ? 'Menyimpan...' : 'Tambah Outlet'}
                    </button>
                  </form>

                  {/* Outlet list */}
                  <div className="divide-y">
                    {outlets.map((o) => (
                      <div key={o.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{o.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${o.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{o.status}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            className="text-gray-600 hover:text-gray-800"
                            onClick={async () => {
                              if (!onUpdateOutlet) return;
                              setSavingOutlet(true);
                              try {
                                await onUpdateOutlet(o.id, { status: o.status === 'open' ? 'closed' : 'open' });
                              } finally {
                                setSavingOutlet(false);
                              }
                            }}
                            title="Toggle status"
                          >
                            {o.status === 'open' ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                          </button>
                          <button
                            className="text-indigo-600 hover:text-indigo-700"
                            onClick={async () => {
                              if (!onUpdateOutlet) return;
                              const name = prompt('Nama outlet', o.name) || o.name;
                              setSavingOutlet(true);
                              try {
                                await onUpdateOutlet(o.id, { name });
                              } finally {
                                setSavingOutlet(false);
                              }
                            }}
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-700"
                            onClick={async () => {
                              if (!onDeleteOutlet) return;
                              if (!confirm(`Hapus outlet ${o.name}?`)) return;
                              setSavingOutlet(true);
                              try {
                                await onDeleteOutlet(o.id);
                              } finally {
                                setSavingOutlet(false);
                              }
                            }}
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {outlets.length === 0 && (
                      <p className="text-sm text-gray-500 py-3">Belum ada outlet.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto Backup
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="daily">Harian</option>
                      <option value="weekly">Mingguan</option>
                      <option value="monthly">Bulanan</option>
                      <option value="disabled">Nonaktif</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (menit)
                    </label>
                    <input
                      type="number"
                      defaultValue="30"
                      min="5"
                      max="480"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Database</h4>
                  <div className="flex space-x-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      Export Data
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                      Backup Now
                    </button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                      Reset Database
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <div className="flex justify-end">
              <button onClick={saveSystem} disabled={systemSaving} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2 disabled:bg-gray-300">
                <Save className="h-4 w-4" />
                <span>{systemSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
