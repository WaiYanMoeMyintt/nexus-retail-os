'use client';

import React from 'react';
import { usePOS } from '@/context/POSContext';
import { ActiveView } from '@/types';
import { 
  ShoppingBag, 
  LayoutGrid, 
  Smartphone, 
  Boxes, 
  ClipboardList, 
  Users,
  BarChart3
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeView, setActiveView, cartSummary } = usePOS();

  const primaryTabs: { id: ActiveView; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'pos', label: 'POS', icon: ShoppingBag, badge: cartSummary.itemCount },
    { id: 'dashboard', label: 'Overview', icon: LayoutGrid },
    { id: 'products', label: 'Catalog', icon: Smartphone },
    { id: 'inventory', label: 'Stock', icon: Boxes },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'customers', label: 'CRM', icon: Users },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 flex items-center justify-around shadow-xl safe-area-bottom">
      {primaryTabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeView === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
              isActive ? 'text-indigo-600 bg-indigo-50/70 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 scale-105' : 'text-slate-400'}`} />
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-2xs">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
