'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { usePOS } from '@/context/POSContext';
import { DeviceItem, DeviceStatus, DeviceCondition, BrandName } from '@/types';
import { 
  Smartphone, 
  Search, 
  Filter, 
  QrCode, 
  ShieldCheck, 
  History, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  XCircle, 
  Plus, 
  ExternalLink, 
  Building2, 
  User, 
  DollarSign, 
  Calendar, 
  Clock, 
  FileText,
  Copy,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import gsap from 'gsap';

const STATUS_CONFIG: Record<DeviceStatus, { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  IN_STOCK: { label: 'In Stock', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
  RESERVED: { label: 'Reserved', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  SOLD: { label: 'Sold', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: ExternalLink },
  RETURNED: { label: 'Returned', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: History },
  WARRANTY: { label: 'In Warranty', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: ShieldCheck },
  REPAIR: { label: 'In Repair', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: Wrench },
  DAMAGED: { label: 'Damaged / Defect', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', icon: AlertTriangle },
  LOST: { label: 'Lost / Stolen', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300', icon: XCircle },
};

export const DevicesView: React.FC = () => {
  const { 
    devices, 
    products, 
    branches, 
    suppliers, 
    activeBranchId, 
    updateDeviceStatus, 
    registerDevice, 
    permissions,
    setActiveView 
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isTimelineDrawerOpen, setIsTimelineDrawerOpen] = useState(false);

  // New Registration Form State
  const [newProductId, setNewProductId] = useState('');
  const [newVariantId, setNewVariantId] = useState('');
  const [newImei1, setNewImei1] = useState('');
  const [newImei2, setNewImei2] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newCondition, setNewCondition] = useState<DeviceCondition>('Brand New');
  const [newPurchaseCost, setNewPurchaseCost] = useState('');
  const [newSellingPrice, setNewSellingPrice] = useState('');
  const [newSupplierId, setNewSupplierId] = useState('');
  const [newBranchId, setNewBranchId] = useState(activeBranchId);
  const [newWarrantyMonths, setNewWarrantyMonths] = useState('12');

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync selected branch with active branch context from top Navbar
  useEffect(() => {
    if (activeBranchId) {
      setSelectedBranch(activeBranchId);
      setNewBranchId(activeBranchId);
    }
  }, [activeBranchId]);

  useEffect(() => {
    if (containerRef.current) {
      const targets = containerRef.current.querySelectorAll('.device-card-anim');
      if (targets && targets.length > 0) {
        gsap.fromTo(
          targets,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
        );
      }
    }
  }, [searchQuery, selectedBrand, selectedStatus, selectedBranch]);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = 
        device.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.imei1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (device.imei2 && device.imei2.toLowerCase().includes(searchQuery.toLowerCase())) ||
        device.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (device.customerName && device.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesBrand = selectedBrand === 'all' || device.brand === selectedBrand;
      const matchesStatus = selectedStatus === 'all' || device.status === selectedStatus;
      const matchesBranch = selectedBranch === 'all' || device.branchId === selectedBranch;

      return matchesSearch && matchesBrand && matchesStatus && matchesBranch;
    });
  }, [devices, searchQuery, selectedBrand, selectedStatus, selectedBranch]);

  // Key KPI metrics
  const totalUnits = devices.length;
  const inStockUnits = devices.filter(d => d.status === 'IN_STOCK').length;
  const soldUnits = devices.filter(d => d.status === 'SOLD').length;
  const repairWarrantyUnits = devices.filter(d => d.status === 'REPAIR' || d.status === 'WARRANTY').length;
  const totalInventoryValuation = devices
    .filter(d => d.status === 'IN_STOCK')
    .reduce((sum, d) => sum + d.purchaseCost, 0);

  const handleCopyImei = (imei: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(imei);
      toast.success(`Copied IMEI: ${imei}`);
    }
  };

  const handleOpenTimeline = (device: DeviceItem) => {
    setSelectedDevice(device);
    setIsTimelineDrawerOpen(true);
  };

  const handleStatusChange = (deviceId: string, newStatus: DeviceStatus) => {
    const reason = prompt(`Reason for changing device status to ${newStatus}:`, 'Manual inventory status update');
    if (reason !== null) {
      updateDeviceStatus(deviceId, newStatus, reason);
      if (selectedDevice && selectedDevice.id === deviceId) {
        setSelectedDevice(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  const handleRegisterDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductId || !newImei1) {
      toast.error('Product and IMEI 1 are required');
      return;
    }

    const prod = products.find(p => p.id === newProductId);
    const variant = prod?.variants.find(v => v.id === newVariantId) || prod?.variants[0];
    const sup = suppliers.find(s => s.id === newSupplierId);
    const br = branches.find(b => b.id === newBranchId);

    if (!prod || !variant) {
      toast.error('Please select a valid product and variant');
      return;
    }

    registerDevice({
      productId: prod.id,
      variantId: variant.id,
      productName: `${prod.name} ${variant.storage || ''}`.trim(),
      brand: prod.brand,
      sku: variant.sku,
      imei1: newImei1.trim(),
      imei2: newImei2.trim() || undefined,
      serialNumber: newSerial.trim() || `SN-${newImei1.slice(-6)}`,
      storage: variant.storage,
      ram: variant.ram,
      color: variant.color,
      condition: newCondition,
      purchaseCost: parseFloat(newPurchaseCost) || variant.costPrice,
      sellingPrice: parseFloat(newSellingPrice) || variant.price,
      supplierId: sup?.id || 'sup-1',
      supplierName: sup?.name || 'Apex Global Distributors',
      branchId: br?.id || activeBranchId,
      branchName: br?.name || 'Main HQ Store',
      status: 'IN_STOCK',
      warrantyMonths: parseInt(newWarrantyMonths) || 12
    });

    setIsRegisterModalOpen(false);
    // Reset form
    setNewProductId('');
    setNewVariantId('');
    setNewImei1('');
    setNewImei2('');
    setNewSerial('');
    setNewPurchaseCost('');
    setNewSellingPrice('');
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/10">
              <Smartphone className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Phone & Device Lifecycle (IMEI Traceability)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Individual device traceability from PO receiving, IMEI assignment, sale, warranty claim to repair history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register Device IMEI
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">In-Stock Phones</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{inStockUnits} <span className="text-xs font-normal text-slate-500">units</span></div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Ready for checkout</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Inventory Valuation</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            ${totalInventoryValuation.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">COGS basis in stock</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Sold Devices</span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <ExternalLink className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{soldUnits} <span className="text-xs font-normal text-slate-500">sold</span></div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Tracked with warranty</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Repair & Claims</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{repairWarrantyUnits} <span className="text-xs font-normal text-slate-500">in triage</span></div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Active workshop tickets</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by IMEI 1, IMEI 2, Serial Number, Product Name, or Customer..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={e => setSelectedBrand(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Brands</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Google">Google</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="OnePlus">OnePlus</option>
              <option value="Huawei">Huawei</option>
              <option value="Sony">Sony</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="SOLD">Sold</option>
              <option value="RESERVED">Reserved</option>
              <option value="RETURNED">Returned</option>
              <option value="WARRANTY">In Warranty</option>
              <option value="REPAIR">In Repair</option>
              <option value="DAMAGED">Damaged</option>
              <option value="LOST">Lost</option>
            </select>

            {/* Branch Filter */}
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
          <div>Showing <span className="font-bold text-slate-800">{filteredDevices.length}</span> of {totalUnits} registered phone devices</div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time individual serial database
          </div>
        </div>
      </div>

      {/* Devices List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase text-slate-600 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Device & Specifications</th>
                <th className="px-5 py-3.5">IMEI 1 & Serial</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Cost / Price</th>
                <th className="px-5 py-3.5">Stock Location</th>
                <th className="px-5 py-3.5">Customer / Order</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap min-w-[230px]">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <Smartphone className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No serialized phone devices match your filters.
                  </td>
                </tr>
              ) : (
                filteredDevices.map(device => {
                  const statusInfo = STATUS_CONFIG[device.status] || STATUS_CONFIG.IN_STOCK;
                  const StatusIcon = statusInfo.icon;
                  const prodImg = products.find(p => p.id === device.productId)?.image || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80';

                  return (
                    <tr key={device.id} className="device-card-anim hover:bg-slate-50/70 transition-colors">
                      {/* Product Name & Thumbnail */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-900/5 shadow-2xs shrink-0 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={prodImg}
                              alt={device.productName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm tracking-tight truncate">{device.productName}</div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 flex-wrap font-medium">
                              <span className="font-semibold text-slate-700">{device.brand}</span>
                              <span>•</span>
                              <span>{device.color}</span>
                              {device.storage && (
                                <>
                                  <span>•</span>
                                  <span>{device.storage}</span>
                                </>
                              )}
                              <span>•</span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">{device.condition}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* IMEI & Serial */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 tracking-wide">
                          <QrCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="select-all">{device.imei1}</span>
                          <button 
                            onClick={() => handleCopyImei(device.imei1)}
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                            title="Copy IMEI 1"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 font-medium">
                          SN: <span className="text-slate-700 font-semibold">{device.serialNumber}</span>
                          {device.imei2 && <span className="ml-1.5 text-slate-400">• SIM2: {device.imei2}</span>}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Cost / Price */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 tabular-nums">${device.sellingPrice.toFixed(2)}</div>
                        {permissions.canViewCostBasis && (
                          <div className="text-xs text-slate-400 tabular-nums font-medium mt-0.5">
                            Cost: ${device.purchaseCost.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Branch */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{device.branchName}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[140px] font-medium">
                          Sup: {device.supplierName}
                        </div>
                      </td>

                      {/* Customer / Order */}
                      <td className="px-5 py-3.5">
                        {device.customerName ? (
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{device.customerName}</span>
                            </div>
                            {device.orderId && (
                              <div className="text-xs text-indigo-600 font-semibold mt-0.5">
                                #{device.orderId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic font-medium">Unassigned (In Vault)</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap min-w-[230px]">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenTimeline(device)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200/60 transition-all cursor-pointer shadow-xs active:scale-95"
                            title="View Lifecycle Timeline"
                          >
                            <History className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Timeline</span>
                            <span className="px-1.5 py-0.5 bg-indigo-200/70 text-indigo-900 rounded-md text-[10px] font-extrabold leading-none">
                              {device.history.length}
                            </span>
                          </button>

                          {/* Quick Status transition dropdown */}
                          <select
                            value={device.status}
                            onChange={e => handleStatusChange(device.id, e.target.value as DeviceStatus)}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all shadow-xs"
                          >
                            <option value="IN_STOCK">In Stock</option>
                            <option value="RESERVED">Reserved</option>
                            <option value="SOLD">Sold</option>
                            <option value="RETURNED">Returned</option>
                            <option value="WARRANTY">Warranty</option>
                            <option value="REPAIR">In Repair</option>
                            <option value="DAMAGED">Damaged</option>
                            <option value="LOST">Lost</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Lifecycle History Timeline Drawer */}
      {isTimelineDrawerOpen && selectedDevice && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                  Device Provenance & Timeline
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1.5">{selectedDevice.productName}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
                  <span>IMEI: <span className="text-slate-800 font-bold">{selectedDevice.imei1}</span></span>
                  <span>•</span>
                  <span>SN: <span className="text-slate-800 font-bold">{selectedDevice.serialNumber}</span></span>
                </div>
              </div>
              <button
                onClick={() => setIsTimelineDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Device Quick Overview */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Current Status:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{STATUS_CONFIG[selectedDevice.status]?.label}</div>
                </div>
                <div>
                  <span className="text-slate-500">Condition Grade:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedDevice.condition}</div>
                </div>
                <div>
                  <span className="text-slate-500">Supplier:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedDevice.supplierName}</div>
                </div>
                <div>
                  <span className="text-slate-500">Stock Location:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedDevice.branchName}</div>
                </div>
                <div>
                  <span className="text-slate-500">Selling Price:</span>
                  <div className="font-bold text-emerald-700 mt-0.5">${selectedDevice.sellingPrice.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-slate-500">Purchase Cost:</span>
                  <div className="font-bold text-slate-700 mt-0.5">${selectedDevice.purchaseCost.toFixed(2)}</div>
                </div>
                {selectedDevice.customerName && (
                  <div className="col-span-2 pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Owner / Customer:</span>
                    <div className="font-bold text-slate-900 mt-0.5">{selectedDevice.customerName} (Order #{selectedDevice.orderId})</div>
                  </div>
                )}
              </div>

              {/* Chronological Timeline Events */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Audit Trail & Movement Events</h4>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedDevice.history.map((event, idx) => (
                    <div key={event.id || idx} className="relative group">
                      <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-xs"></div>
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900">{event.type.replace('_', ' ')}</span>
                          <span className="text-slate-400 font-medium">{new Date(event.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{event.note}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-1.5 border-t border-slate-100">
                          <span className="font-medium">By: {event.performedBy}</span>
                          {event.referenceId && <span className="text-indigo-600 font-semibold">Ref: {event.referenceId}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsTimelineDrawerOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Device IMEI Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/10">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Register New Phone IMEI</h3>
                  <p className="text-xs text-slate-500 font-medium">Track an individual unit with discrete serial numbers</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDeviceSubmit} className="p-5 space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catalog Phone Model *</label>
                <select
                  value={newProductId}
                  onChange={e => {
                    setNewProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod && prod.variants[0]) {
                      setNewVariantId(prod.variants[0].id);
                      setNewPurchaseCost(prod.variants[0].costPrice.toString());
                      setNewSellingPrice(prod.variants[0].price.toString());
                    }
                  }}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select Phone Model...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
                  ))}
                </select>
              </div>

              {/* IMEI 1 & 2 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary IMEI (IMEI 1) *</label>
                  <input
                    type="text"
                    required
                    value={newImei1}
                    onChange={e => setNewImei1(e.target.value)}
                    placeholder="e.g. 359482109845120"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Secondary IMEI 2 (eSIM / SIM2)</label>
                  <input
                    type="text"
                    value={newImei2}
                    onChange={e => setNewImei2(e.target.value)}
                    placeholder="e.g. 359482109845129"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Serial & Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={newSerial}
                    onChange={e => setNewSerial(e.target.value)}
                    placeholder="e.g. APL-FX8912401"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Condition</label>
                  <select
                    value={newCondition}
                    onChange={e => setNewCondition(e.target.value as DeviceCondition)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Open Box">Open Box</option>
                    <option value="Certified Refurbished">Certified Refurbished</option>
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                  </select>
                </div>
              </div>

              {/* Cost & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newPurchaseCost}
                    onChange={e => setNewPurchaseCost(e.target.value)}
                    placeholder="890.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newSellingPrice}
                    onChange={e => setNewSellingPrice(e.target.value)}
                    placeholder="1199.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Supplier & Branch */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supplier</label>
                  <select
                    value={newSupplierId}
                    onChange={e => setNewSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Branch</label>
                  <select
                    value={newBranchId}
                    onChange={e => setNewBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save & Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
