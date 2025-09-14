import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Clock, LogOut, Menu, Settings, User } from 'lucide-react';
import { User as UserType, Outlet } from '../../types';

interface TopbarProps {
  user: UserType;
  currentOutlet: Outlet;
  outlets: Outlet[];
  onOutletChange: (outlet: Outlet) => void;
  onLogout: () => void;
  onSidebarToggle: () => void;
  currentTime: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  user,
  currentOutlet,
  outlets,
  onOutletChange,
  onLogout,
  onSidebarToggle,
  currentTime
}) => {
  const [showOutletDropdown, setShowOutletDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const outletRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (outletRef.current && !outletRef.current.contains(event.target as Node)) {
        setShowOutletDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onSidebarToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Outlet Selector */}
        <div className="relative" ref={outletRef}>
          <button
            onClick={() => setShowOutletDropdown(!showOutletDropdown)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200"
          >
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                currentOutlet.status === 'open' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="font-medium text-gray-900">{currentOutlet.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {showOutletDropdown && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              {outlets.map((outlet) => (
                <button
                  key={outlet.id}
                  onClick={() => {
                    onOutletChange(outlet);
                    setShowOutletDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    outlet.status === 'open' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-gray-900">{outlet.name}</span>
                  {outlet.id === currentOutlet.id && (
                    <div className="ml-auto w-2 h-2 bg-indigo-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Current Time */}
        <div className="hidden sm:flex items-center space-x-2 text-gray-600">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">{currentTime}</span>
        </div>

        {/* User Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50"
          >
            <img
              src={user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </button>

          {showUserDropdown && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Profil</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700">Pengaturan</span>
              </button>
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 text-red-600 rounded-b-lg"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};