'use client';

import React, { useState, useEffect } from 'react';
import { POSProvider, usePOS } from '@/context/POSContext';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { POSView } from '../pos/POSView';
import { OverviewView } from '../dashboard/OverviewView';
import { ProductsView } from '../products/ProductsView';
import { InventoryView } from '../inventory/InventoryView';
import { DevicesView } from '../devices/DevicesView';
import { PurchasesView } from '../purchases/PurchasesView';
import { TransfersView } from '../transfers/TransfersView';
import { OrdersView } from '../orders/OrdersView';
import { ReturnsView } from '../returns/ReturnsView';
import { WarrantyView } from '../warranty/WarrantyView';
import { ShipmentsView } from '../shipments/ShipmentsView';
import { CustomersView } from '../customers/CustomersView';
import { DiscountsView } from '../discounts/DiscountsView';
import { EmployeesView } from '../employees/EmployeesView';
import { ReportsView } from '../reports/ReportsView';
import { PaymentsView } from '../payments/PaymentsView';
import { AuditView } from '../audit/AuditView';
import { SettingsView } from '../settings/SettingsView';
import { Toaster } from 'sonner';

const MainViewContent: React.FC = () => {
  const { activeView, setActiveView } = usePOS();
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global hotkeys (F1 - F4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveView('pos');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveView('dashboard');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveView('products');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setActiveView('inventory');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-900 select-none">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex flex-col shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 flex bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div 
            className="w-72 max-w-[85vw] h-full bg-white animate-in slide-in-from-left duration-300 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 min-h-0">
        <Navbar 
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenMobileCart={() => setIsMobileCartOpen(true)} 
        />

        <main className={`flex-1 flex flex-col min-h-0 ${activeView === 'pos' ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 md:p-6'} relative pb-16 lg:pb-0`}>
          {activeView === 'pos' && (
            <POSView
              isMobileCartOpen={isMobileCartOpen}
              onCloseMobileCart={() => setIsMobileCartOpen(false)}
            />
          )}
          {activeView === 'dashboard' && <OverviewView />}
          {activeView === 'devices' && <DevicesView />}
          {activeView === 'products' && <ProductsView />}
          {activeView === 'inventory' && <InventoryView />}
          {activeView === 'purchases' && <PurchasesView />}
          {activeView === 'transfers' && <TransfersView />}
          {activeView === 'orders' && <OrdersView />}
          {activeView === 'returns' && <ReturnsView />}
          {activeView === 'warranty' && <WarrantyView />}
          {activeView === 'shipments' && <ShipmentsView />}
          {activeView === 'customers' && <CustomersView />}
          {activeView === 'discounts' && <DiscountsView />}
          {activeView === 'employees' && <EmployeesView />}
          {activeView === 'reports' && <ReportsView />}
          {activeView === 'payments' && <PaymentsView />}
          {activeView === 'audit' && <AuditView />}
          {activeView === 'settings' && <SettingsView />}
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export const AppLayout: React.FC = () => {
  return (
    <POSProvider>
      <MainViewContent />
    </POSProvider>
  );
};
