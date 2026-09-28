'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePOS } from '@/context/POSContext';
import { ActiveView, Product, Order, DeviceItem, Customer, Shipment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  Sparkles, 
  ArrowRight, 
  Package, 
  Barcode, 
  Receipt, 
  Smartphone, 
  ShieldCheck, 
  Truck, 
  Users, 
  Search, 
  X,
  CreditCard,
  CheckCircle2,
  Clock,
  Zap,
  Headphones,
  Watch,
  BatteryMedium,
  Shield,
  Plus,
  ShoppingBag,
  FolderTree
} from 'lucide-react';
import { toast } from 'sonner';

interface GlobalSearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

type TabType = 'all' | 'products' | 'categories' | 'orders' | 'shipments' | 'devices' | 'customers';

export const GlobalSearchDropdown: React.FC<GlobalSearchDropdownProps> = ({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  inputRef
}) => {
  const { 
    products, 
    orders, 
    devices, 
    customers, 
    shipments, 
    setActiveView, 
    addToCart 
  } = usePOS();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset selected index when search query or tab changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, activeTab]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, inputRef]);

  // POS Store Categories with real live counts & icons
  const posCategories = useMemo(() => {
    const categoriesData = [
      {
        id: 'cat-smartphones',
        key: 'smartphones',
        title: 'Smartphones & Flagships',
        badge: 'Mobile Dept',
        description: 'Apple iPhones, Samsung Galaxy, Xiaomi & OnePlus flagships',
        count: products.filter(p => p.category === 'smartphones').length,
        icon: Smartphone,
        iconBg: 'bg-blue-50 border-blue-200/80 text-blue-600',
        targetSearch: 'phone'
      },
      {
        id: 'cat-audio',
        key: 'earbuds',
        title: 'Audio & ANC Buds',
        badge: 'Sound Gear',
        description: 'Sony WH-1000XM5, AirPods Pro, Galaxy Buds ANC headphones',
        count: products.filter(p => p.category === 'earbuds').length,
        icon: Headphones,
        iconBg: 'bg-indigo-50 border-indigo-200/80 text-indigo-600',
        targetSearch: 'audio'
      },
      {
        id: 'cat-wearables',
        key: 'smartwatches',
        title: 'Smartwatches & Wearables',
        badge: 'Wearables',
        description: 'Apple Watch Ultra 2, Galaxy Watch 6, fitness wristbands',
        count: products.filter(p => p.category === 'smartwatches').length,
        icon: Watch,
        iconBg: 'bg-emerald-50 border-emerald-200/80 text-emerald-600',
        targetSearch: 'watch'
      },
      {
        id: 'cat-chargers',
        key: 'chargers',
        title: 'GaN Fast Chargers',
        badge: 'Power Dept',
        description: 'Anker 100W GaN II, Belkin MagSafe 3-in-1, fast wall adapters',
        count: products.filter(p => p.category === 'chargers').length,
        icon: Zap,
        iconBg: 'bg-amber-50 border-amber-200/80 text-amber-600',
        targetSearch: 'charger'
      },
      {
        id: 'cat-powerbanks',
        key: 'powerbanks',
        title: 'Power Banks & Batteries',
        badge: 'Battery Pack',
        description: 'Anker 737 140W PowerCore, wireless magnetic batteries',
        count: products.filter(p => p.category === 'powerbanks').length,
        icon: BatteryMedium,
        iconBg: 'bg-purple-50 border-purple-200/80 text-purple-600',
        targetSearch: 'power'
      },
      {
        id: 'cat-protection',
        key: 'cases',
        title: 'Cases & Armor Shields',
        badge: 'Protection',
        description: 'Spigen Tough Armor, Pitaka Carbon Fiber, MagSafe cases',
        count: products.filter(p => p.category === 'cases' || p.category === 'screen-protectors').length,
        icon: Shield,
        iconBg: 'bg-rose-50 border-rose-200/80 text-rose-600',
        targetSearch: 'case'
      }
    ];

    if (!searchQuery.trim()) return categoriesData;
    const q = searchQuery.toLowerCase();
    return categoriesData.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) ||
      c.badge.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Matched live products
  const matchedProducts = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'products') return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return products.slice(0, 4);
    }
    return products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.variants.some(v => v.sku.toLowerCase().includes(q) || v.color.toLowerCase().includes(q) || (v.storage && v.storage.toLowerCase().includes(q)))
    ).slice(0, 6);
  }, [products, searchQuery, activeTab]);

  // Matched live orders
  const matchedOrders = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'orders') return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return orders.slice(0, 3);
    }
    return orders.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.receiptNumber.toLowerCase().includes(q) ||
      (o.customer && o.customer.name.toLowerCase().includes(q)) ||
      o.items.some(i => i.productName.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.variantSummary.toLowerCase().includes(q))
    ).slice(0, 4);
  }, [orders, searchQuery, activeTab]);

  // Matched live shipments
  const matchedShipments = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'shipments') return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return shipments.slice(0, 3);
    }
    return shipments.filter(s =>
      s.id.toLowerCase().includes(q) ||
      s.trackingNumber.toLowerCase().includes(q) ||
      s.customerName.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q) ||
      s.courier.toLowerCase().includes(q) ||
      s.itemsSummary.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [shipments, searchQuery, activeTab]);

  // Matched live serialized devices
  const matchedDevices = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'devices') return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return devices.slice(0, 3);
    }
    return devices.filter(d =>
      d.productName.toLowerCase().includes(q) ||
      d.imei1.includes(q) ||
      (d.imei2 && d.imei2.includes(q)) ||
      d.serialNumber.toLowerCase().includes(q) ||
      d.sku.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [devices, searchQuery, activeTab]);

  // Matched live customers
  const matchedCustomers = useMemo(() => {
    if (activeTab !== 'all' && activeTab !== 'customers') return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return customers.slice(0, 3);
    }
    return customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.tier.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [customers, searchQuery, activeTab]);

  // Filter tabs with live entity counts
  const filterTabs = useMemo(() => [
    { id: 'all' as TabType, label: 'All POS Data' },
    { id: 'products' as TabType, label: `Products (${products.length})` },
    { id: 'categories' as TabType, label: `Categories (${posCategories.length})` },
    { id: 'orders' as TabType, label: `Orders (${orders.length})` },
    { id: 'shipments' as TabType, label: `Shipments (${shipments.length})` },
    { id: 'devices' as TabType, label: `IMEIs (${devices.length})` },
    { id: 'customers' as TabType, label: `Clients (${customers.length})` }
  ], [products.length, posCategories.length, orders.length, shipments.length, devices.length, customers.length]);

  // Suggested Quick Tags
  const quickTags = [
    { label: '#Smartphones', tab: 'products' as TabType, search: 'iPhone' },
    { label: '#AudioBuds', tab: 'products' as TabType, search: 'Sony' },
    { label: '#Smartwatches', tab: 'products' as TabType, search: 'Watch' },
    { label: '#Chargers', tab: 'products' as TabType, search: 'Anker' },
    { label: '#InStock', tab: 'products' as TabType, search: '' },
    { label: '#Orders', tab: 'orders' as TabType, search: '' },
    { label: '#Shipments', tab: 'shipments' as TabType, search: '' },
    { label: '#IMEITrace', tab: 'devices' as TabType, search: '' },
    { label: '#VIPClients', tab: 'customers' as TabType, search: '' }
  ];

  // Quick Action Shortcuts with clean, responsive labels
  const quickActions = [
    {
      id: 'qa-pos',
      label: 'New POS Sale',
      icon: ShoppingBag,
      color: 'text-blue-700 bg-blue-50 border-blue-200/80',
      action: () => {
        setActiveView('pos');
        onClose();
        toast.info('POS Register active: Ready to ring up items.');
      }
    },
    {
      id: 'qa-stock',
      label: 'Inventory',
      icon: Package,
      color: 'text-teal-700 bg-teal-50 border-teal-200/80',
      action: () => {
        setActiveView('inventory');
        onClose();
      }
    },
    {
      id: 'qa-ship',
      label: 'Shipments',
      icon: Truck,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200/80',
      action: () => {
        setActiveView('shipments');
        onClose();
      }
    },
    {
      id: 'qa-warranty',
      label: 'Warranty Intake',
      icon: ShieldCheck,
      color: 'text-amber-700 bg-amber-50 border-amber-200/80',
      action: () => {
        setActiveView('warranty');
        onClose();
      }
    },
    {
      id: 'qa-devices',
      label: 'IMEI Tracker',
      icon: Smartphone,
      color: 'text-purple-700 bg-purple-50 border-purple-200/80',
      action: () => {
        setActiveView('devices');
        onClose();
      }
    }
  ];

  // Combined flat list of all clickable items for keyboard navigation
  const allActionItems = useMemo(() => {
    const items: Array<{ id: string; action: () => void }> = [];

    // Products
    matchedProducts.forEach(p => {
      items.push({
        id: `prod-${p.id}`,
        action: () => {
          setActiveView('products');
          onClose();
        }
      });
    });

    // Categories
    if (activeTab === 'all' || activeTab === 'categories') {
      posCategories.forEach(c => {
        items.push({
          id: `cat-${c.id}`,
          action: () => {
            setActiveView('pos');
            onSearchChange(c.targetSearch);
            onClose();
          }
        });
      });
    }

    // Orders
    matchedOrders.forEach(o => {
      items.push({
        id: `ord-${o.id}`,
        action: () => {
          setActiveView('orders');
          onClose();
        }
      });
    });

    // Shipments
    matchedShipments.forEach(s => {
      items.push({
        id: `shp-${s.id}`,
        action: () => {
          setActiveView('shipments');
          onClose();
        }
      });
    });

    // Devices
    matchedDevices.forEach(d => {
      items.push({
        id: `dev-${d.id}`,
        action: () => {
          setActiveView('devices');
          onClose();
        }
      });
    });

    // Customers
    matchedCustomers.forEach(c => {
      items.push({
        id: `cust-${c.id}`,
        action: () => {
          setActiveView('customers');
          onClose();
        }
      });
    });

    return items;
  }, [matchedProducts, posCategories, matchedOrders, matchedShipments, matchedDevices, matchedCustomers, activeTab, setActiveView, onSearchChange, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, allActionItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allActionItems.length) % Math.max(1, allActionItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allActionItems[selectedIndex]) {
          allActionItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allActionItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  const totalResultsCount = 
    matchedProducts.length + 
    ((activeTab === 'all' || activeTab === 'categories') ? posCategories.length : 0) + 
    matchedOrders.length + 
    matchedShipments.length + 
    matchedDevices.length + 
    matchedCustomers.length;

  return (
    <div 
      ref={containerRef}
      className="absolute left-0 sm:left-0 top-full mt-2 w-[min(680px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-98 slide-in-from-top-2 duration-200 select-none"
      style={{ filter: 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.15))' }}
    >
      {/* 1. Header Filter Tabs */}
      <div className="flex items-center gap-1.5 p-2.5 sm:p-3 sm:px-4 border-b border-slate-100 overflow-x-auto no-scrollbar bg-slate-50/80">
        {filterTabs.map(tab => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 2. Suggested Quick Links / Tag Chips */}
      <div className="px-3.5 sm:px-4 py-2.5 bg-white border-b border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Suggested Quick Links & Tags</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">Live POS Filter</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {quickTags.map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveTab(tag.tab);
                if (tag.search) {
                  onSearchChange(tag.search);
                }
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-200 border border-slate-200 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Quick Action Shortcuts Strip - fully responsive */}
      <div className="px-3.5 sm:px-4 py-2 bg-slate-50/60 border-b border-slate-100 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
        {quickActions.map(qa => {
          const Icon = qa.icon;
          return (
            <button
              key={qa.id}
              type="button"
              onClick={qa.action}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 active:scale-95 shadow-2xs ${qa.color} hover:brightness-95`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{qa.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Main Results List (Scrollable Area) */}
      <div className="max-h-[min(420px,60vh)] overflow-y-auto p-2.5 sm:p-3 space-y-3.5 divide-y divide-slate-100">
        
        {/* SECTION: Live Products Matches */}
        {matchedProducts.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Package className="w-3 h-3 text-blue-500 shrink-0" />
                Live POS Products & Catalog
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveView('products');
                  onClose();
                }}
                className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                View Catalog →
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {matchedProducts.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveView('products');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-200/80 gap-2"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-900/5 shadow-2xs shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                          {p.brand}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-500 font-medium flex-wrap">
                        <span className="font-mono text-slate-400 hidden xs:inline">{p.sku}</span>
                        <span className="hidden xs:inline">•</span>
                        <span className="font-bold text-slate-900">{formatCurrency(p.basePrice)}</span>
                        <span>•</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded-md text-[10px] shrink-0 ${
                          p.totalStock > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {p.totalStock} in stock
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p, p.variants[0]);
                        toast.success(`Added ${p.name} to Cart!`);
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 hidden xs:inline" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: Live POS Categories */}
        {(activeTab === 'all' || activeTab === 'categories') && posCategories.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <FolderTree className="w-3 h-3 text-amber-500 shrink-0" />
                POS Categories & Departments
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {posCategories.length} Departments
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
              {posCategories.map(c => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveView('pos');
                      onSearchChange(c.targetSearch);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-slate-100 hover:border-slate-200 shadow-2xs gap-2 min-w-0"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl ${c.iconBg} border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {c.title}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium truncate">
                          <strong className="text-slate-700">{c.count} items</strong> • {c.badge}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION: Live Shipments & Couriers */}
        {matchedShipments.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Truck className="w-3 h-3 text-indigo-500 shrink-0" />
                Live Shipments & Couriers
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveView('shipments');
                  onClose();
                }}
                className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Track All ({shipments.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {matchedShipments.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    setActiveView('shipments');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-200 gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {s.courier}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100 shrink-0">
                          {s.trackingNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {s.customerName} • <strong className="text-slate-700 capitalize">{s.status.replace('_', ' ')}</strong> • {s.itemsSummary}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: Live Orders & Invoices */}
        {matchedOrders.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3 h-3 text-rose-500 shrink-0" />
                Recent Orders & Receipts
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveView('orders');
                  onClose();
                }}
                className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
              >
                Orders Ledger →
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {matchedOrders.map(o => (
                <div
                  key={o.id}
                  onClick={() => {
                    setActiveView('orders');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-200 gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-rose-600 transition-colors">
                          {o.receiptNumber}
                        </span>
                        <span className="font-bold text-xs text-slate-900">
                          {formatCurrency(o.grandTotal)}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 capitalize shrink-0">
                          {o.paymentStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {o.customer?.name || 'Walk-in Guest'} • {o.items.length} items • {formatDate(o.createdAt, true)}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: Live Serialized IMEI Devices */}
        {matchedDevices.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Barcode className="w-3 h-3 text-teal-500 shrink-0" />
                Serialized Devices & IMEIs
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveView('devices');
                  onClose();
                }}
                className="text-[10px] font-bold text-teal-600 hover:underline cursor-pointer"
              >
                IMEI Tracker →
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {matchedDevices.map(d => (
                <div
                  key={d.id}
                  onClick={() => {
                    setActiveView('devices');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-200 gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-teal-600 transition-colors truncate">
                          {d.productName}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                          {d.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        IMEI: <strong className="text-slate-800">{d.imei1}</strong> • SN: {d.serialNumber}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: Live Customers */}
        {matchedCustomers.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Users className="w-3 h-3 text-violet-500 shrink-0" />
                Customers & VIP Accounts
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveView('customers');
                  onClose();
                }}
                className="text-[10px] font-bold text-violet-600 hover:underline cursor-pointer"
              >
                Directory ({customers.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {matchedCustomers.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveView('customers');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group border border-transparent hover:border-slate-200 gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 font-black text-xs border border-violet-200">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-violet-600 transition-colors truncate">
                          {c.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                          {c.tier}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate">
                        {c.phone} • {c.loyaltyPoints} pts • {formatCurrency(c.totalSpent)}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </div>
              ))}
            </div>
          </div>
        )}

        {totalResultsCount === 0 && (
          <div className="p-8 text-center text-slate-400 space-y-1.5">
            <Search className="w-7 h-7 mx-auto mb-1 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No matching POS records found for &ldquo;{searchQuery}&rdquo;</p>
            <p className="text-[11px] text-slate-400">Search for phone models, SKUs, customer names, IMEIs, or tracking numbers.</p>
          </div>
        )}
      </div>

      {/* 5. Bottom Footer Navigation Hints */}
      <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs font-bold">↑↓</kbd>
            <span className="hidden sm:inline">Navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs font-bold">↵</kbd>
            <span className="hidden sm:inline">Select</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono shadow-2xs font-bold">ESC</kbd>
            <span className="hidden sm:inline">Close</span>
          </span>
        </div>

        <div className="font-black text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 text-[10px] shrink-0">
          {totalResultsCount} Live POS Results
        </div>
      </div>
    </div>
  );
};
