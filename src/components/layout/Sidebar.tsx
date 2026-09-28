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
  Truck, 
  Users, 
  Tag, 
  BarChart3, 
  CreditCard, 
  Settings,
  Store,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Headphones,
  ShieldCheck,
  Building2,
  ArrowLeftRight,
  Wrench,
  History,
  QrCode
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  hotkey?: string;
}

interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed = false, 
  onToggleCollapse,
  onCloseMobile 
}) => {
  const { 
    activeView, 
    setActiveView, 
    orders, 
    products, 
    devices,
    shipments, 
    cartSummary,
    purchaseOrders,
    stockTransfers,
    warrantyTickets,
    repairJobs,
    settings,
    currentUser,
    activeBranch
  } = usePOS();

  // Dynamic badge counts
  const lowStockCount = products.reduce((total, p) => {
    const low = p.variants.filter(v => v.stock <= v.lowStockThreshold).length;
    return total + low;
  }, 0);

  const pendingShipments = shipments.filter(s => s.status === 'pending' || s.status === 'in_transit').length;
  const inStockDeviceUnits = devices.filter(d => d.status === 'IN_STOCK').length;
  const pendingTransfers = stockTransfers.filter(t => t.status === 'PENDING_APPROVAL' || t.status === 'IN_TRANSIT').length;
  const activeRepairs = repairJobs.filter(r => r.status !== 'DELIVERED').length;

  const navGroups: NavGroup[] = [
    {
      groupLabel: 'POS & SALES',
      items: [
        {
          id: 'pos',
          label: 'Register / POS',
          icon: ShoppingBag,
          badge: cartSummary.itemCount > 0 ? `${cartSummary.itemCount}` : undefined,
          badgeColor: 'bg-indigo-600 text-white font-bold'
        },
        {
          id: 'dashboard',
          label: 'Decision Dashboard',
          icon: LayoutGrid
        },
        {
          id: 'orders',
          label: 'Orders & Receipts',
          icon: ClipboardList,
          badge: `${orders.length}`,
          badgeColor: 'bg-slate-100 text-slate-700 font-bold'
        }
      ]
    },
    {
      groupLabel: 'DEVICES & INVENTORY',
      items: [
        {
          id: 'devices',
          label: 'Phone IMEI Lifecycle',
          icon: Smartphone,
          badge: inStockDeviceUnits > 0 ? `${inStockDeviceUnits} Units` : undefined,
          badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold'
        },
        {
          id: 'products',
          label: 'Catalog & Variants',
          icon: Boxes,
          badge: `${products.length}`,
          badgeColor: 'bg-slate-100 text-slate-700 font-bold'
        },
        {
          id: 'inventory',
          label: 'Stock Adjustments',
          icon: Boxes,
          badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
          badgeColor: 'bg-amber-100 text-amber-800 border border-amber-300 font-bold'
        },
        {
          id: 'purchases',
          label: 'Suppliers & PO Receiving',
          icon: Truck,
          badge: `${purchaseOrders.length}`,
          badgeColor: 'bg-indigo-100 text-indigo-700 font-bold'
        },
        {
          id: 'transfers',
          label: 'Multi-Branch Transfers',
          icon: ArrowLeftRight,
          badge: pendingTransfers > 0 ? `${pendingTransfers}` : undefined,
          badgeColor: 'bg-purple-100 text-purple-700 font-bold'
        }
      ]
    },
    {
      groupLabel: 'AFTER-SALES & SERVICE',
      items: [
        {
          id: 'returns',
          label: 'Returns & Exchanges',
          icon: RotateCcw
        },
        {
          id: 'warranty',
          label: 'Warranty & Repairs',
          icon: ShieldCheck,
          badge: activeRepairs > 0 ? `${activeRepairs} Active` : undefined,
          badgeColor: 'bg-amber-100 text-amber-800 font-bold'
        },
        {
          id: 'shipments',
          label: 'Delivery Logistics',
          icon: Truck,
          badge: pendingShipments > 0 ? `${pendingShipments}` : undefined,
          badgeColor: 'bg-indigo-100 text-indigo-700 font-bold'
        },
        {
          id: 'customers',
          label: 'Customer CRM',
          icon: Users
        }
      ]
    },
    {
      groupLabel: 'ADMIN & FINANCE',
      items: [
        {
          id: 'employees',
          label: 'Employees & RBAC',
          icon: Users
        },
        {
          id: 'reports',
          label: 'Profit & COGS Reports',
          icon: BarChart3
        },
        {
          id: 'payments',
          label: 'Payment Ledger',
          icon: CreditCard
        },
        {
          id: 'discounts',
          label: 'Promotions & Deals',
          icon: Tag
        },
        {
          id: 'audit',
          label: 'Activity & Audit Trail',
          icon: History
        },
        {
          id: 'settings',
          label: 'Store Configuration',
          icon: Settings
        }
      ]
    }
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200/90 flex flex-col justify-between select-none shrink-0">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt="Nexus Retail OS"
              className="w-10 h-10 rounded-2xl object-cover shadow-md shadow-indigo-500/20 border border-slate-200/80"
            />
            <div>
              <h2 className="font-extrabold text-sm text-slate-900 leading-tight tracking-tight">Nexus Retail OS</h2>
              <span className="text-[11px] text-slate-400 font-bold">{activeBranch.code} • {activeBranch.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.groupLabel}
              </span>

              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-100/80'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] shrink-0 ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
            {currentUser.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900 leading-tight">{currentUser.name}</div>
            <span className="text-[10px] font-bold text-blue-600">{currentUser.role}</span>
          </div>
        </div>

        <button
          onClick={() => setActiveView('employees')}
          className="text-xs text-slate-400 hover:text-slate-700 font-semibold p-1"
          title="Switch active user or permissions"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
