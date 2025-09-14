import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { usePOS } from './hooks/usePOS';
import { LoginPage } from './components/Auth/LoginPage';
import { Sidebar } from './components/Layout/Sidebar';
import { Topbar } from './components/Layout/Topbar';
import { Dashboard } from './components/Pages/Dashboard';
import { Cashier } from './components/Pages/Cashier';
import { Products } from './components/Pages/Products';
import { Analytics } from './components/Pages/Analytics';
import { Tables } from './components/Pages/Tables';
import { Settings } from './components/Pages/Settings';

function App() {
  const { user, isLoading, login, logout, isAuthenticated } = useAuth();
  const posData = usePOS();
  
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Update current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            salesData={posData.salesData}
            products={posData.products}
            paymentMethods={posData.paymentMethods}
          />
        );
      case 'cashier':
        return (
          <Cashier 
            products={posData.products}
            currentOrder={posData.currentOrder}
            onAddToOrder={posData.addToOrder}
            onUpdateOrderItem={posData.updateOrderItem}
            onRemoveFromOrder={posData.removeFromOrder}
            onClearOrder={posData.clearOrder}
            getOrderTotal={posData.getOrderTotal}
          />
        );
      case 'products':
        return <Products products={posData.products} />;
      case 'analytics':
        return (
          <Analytics 
            salesData={posData.salesData}
            paymentMethods={posData.paymentMethods}
          />
        );
      case 'tables':
        return <Tables tables={posData.tables} />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <Dashboard 
            salesData={posData.salesData}
            products={posData.products}
            paymentMethods={posData.paymentMethods}
          />
        );
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} isLoading={isLoading} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          user={user!}
          currentOutlet={posData.currentOutlet}
          outlets={posData.outlets}
          onOutletChange={posData.setCurrentOutlet}
          onLogout={logout}
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          currentTime={currentTime}
        />
        
        <main className="flex-1 overflow-y-auto">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export default App;