'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePOS } from '@/context/POSContext';
import { Shipment, ShipmentStatus } from '@/types';
import { formatDate } from '@/lib/utils';
import { gsapAnimations } from '@/lib/gsapAnimations';
import { 
  Truck, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Package, 
  MapPin, 
  Phone, 
  ExternalLink,
  ChevronRight,
  Filter,
  Copy,
  X,
  Send,
  Navigation,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS: Array<{ value: ShipmentStatus; label: string; bg: string; text: string; dot: string }> = [
  { value: 'pending', label: 'Pending Dispatch', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  { value: 'in_transit', label: 'In Transit', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  { value: 'out_for_delivery', label: 'Out for Delivery', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
  { value: 'delivered', label: 'Delivered', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  { value: 'failed', label: 'Delivery Failed', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' }
];

const PRESET_NOTES = [
  'Signature required upon delivery.',
  'Package out for delivery with local courier driver.',
  'Scanned and sorted at central logistics hub.',
  'Left at front desk / reception with concierge.',
  'Customer requested evening drop-off window.'
];

export const ShipmentsView: React.FC = () => {
  const { shipments, updateShipmentStatus, globalSearch, setGlobalSearch } = usePOS();
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | 'all'>('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>('in_transit');
  const [statusNote, setStatusNote] = useState('');
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (containerRef.current) {
      gsapAnimations.pageEntrance(containerRef.current);
    }
  }, []);

  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (globalSearch.trim()) {
        const q = globalSearch.toLowerCase().trim();
        const matchTrack = s.trackingNumber.toLowerCase().includes(q);
        const matchCust = s.customerName.toLowerCase().includes(q);
        const matchDest = s.destination.toLowerCase().includes(q);
        const matchId = s.id.toLowerCase().includes(q);
        const matchOrder = s.receiptNumber.toLowerCase().includes(q);
        const matchCourier = s.courier.toLowerCase().includes(q);
        return matchTrack || matchCust || matchDest || matchId || matchOrder || matchCourier;
      }
      return true;
    });
  }, [shipments, statusFilter, globalSearch]);

  const handleOpenModal = (shp: Shipment) => {
    setSelectedShipment(shp);
    setNewStatus(shp.status);
    setStatusNote(shp.notes || '');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    updateShipmentStatus(selectedShipment.id, newStatus, statusNote);
    toast.success(`Shipment #${selectedShipment.id} updated!`, {
      description: `Status changed to ${newStatus.replace('_', ' ')}.`
    });
    setSelectedShipment(null);
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Delivered</span>;
      case 'out_for_delivery':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Out for Delivery</span>;
      case 'in_transit':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">In Transit</span>;
      case 'failed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Delivery Failed</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending Dispatch</span>;
    }
  };

  const handleCopyTracking = (trackNum: string) => {
    navigator.clipboard.writeText(trackNum);
    toast.success(`Tracking number ${trackNum} copied to clipboard!`);
  };

  return (
    <div ref={containerRef} className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-50/70">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Shipments & Courier Logistics</span>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-0.5 rounded-full border border-indigo-100">
              {filteredShipments.length} Shipments
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Real-time tracking integration with FedEx, DHL, UPS, and Local Couriers.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active In-Transit</span>
            <div className="text-2xl font-black text-indigo-600 font-mono">
              {shipments.filter(s => s.status === 'in_transit' || s.status === 'out_for_delivery').length} <span className="text-xs font-bold text-slate-400">pkgs</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/60">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Delivered Orders</span>
            <div className="text-2xl font-black text-emerald-600 font-mono">
              {shipments.filter(s => s.status === 'delivered').length} <span className="text-xs font-bold text-slate-400">orders</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Courier Pickup</span>
            <div className="text-2xl font-black text-amber-600 font-mono">
              {shipments.filter(s => s.status === 'pending').length} <span className="text-xs font-bold text-slate-400">in hub</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100/60">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">On-Time Success</span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              98.5%
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tracking #, customer name, destination city, courier..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-9.5 pr-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 font-medium transition-all cursor-text"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="all">All Delivery Statuses</option>
              <option value="pending">Pending Dispatch</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredShipments.map((shp) => (
          <div key={shp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{shp.courier}</span>
                    {getStatusBadge(shp.status)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/80">
                      {shp.trackingNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyTracking(shp.trackingNumber)}
                      title="Copy tracking number"
                      className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5 rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400 font-bold">Order: {shp.receiptNumber}</span>
              </div>

              {/* Destination & Recipient */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-800 font-semibold">
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{shp.customerName}</span>
                    <span className="text-slate-400 font-normal font-mono text-[11px]">({shp.customerPhone})</span>
                  </div>
                  {shp.driverName && (
                    <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                      {shp.driverName}
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-2 text-slate-600 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{shp.destination}</span>
                </div>
              </div>

              {/* Items summary */}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Package Contents</span>
                <p className="text-xs text-slate-700 font-medium line-clamp-2">{shp.itemsSummary}</p>
              </div>

              {/* Notes if available */}
              {shp.notes && (
                <div className="text-[11px] text-slate-500 bg-amber-50/60 p-2 rounded-lg border border-amber-100/60 flex items-start gap-1.5">
                  <span className="font-bold text-amber-700 shrink-0">Note:</span>
                  <span className="line-clamp-1">{shp.notes}</span>
                </div>
              )}

              {/* Stepper Progress */}
              <div className="pt-2">
                <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <span className="text-blue-600">Created</span>
                  <span className={shp.status !== 'pending' ? 'text-blue-600' : ''}>In Transit</span>
                  <span className={shp.status === 'out_for_delivery' || shp.status === 'delivered' ? 'text-blue-600' : ''}>Out</span>
                  <span className={shp.status === 'delivered' ? 'text-emerald-600' : ''}>Delivered</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                  <div className={`h-full transition-all duration-300 ${
                    shp.status === 'pending' ? 'w-1/4 bg-amber-500' :
                    shp.status === 'in_transit' ? 'w-2/4 bg-blue-600' :
                    shp.status === 'out_for_delivery' ? 'w-3/4 bg-indigo-600' :
                    shp.status === 'delivered' ? 'w-full bg-emerald-500' : 'w-1/4 bg-rose-500'
                  }`} />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                ETA: {formatDate(shp.estimatedDelivery, true)}
              </span>

              <button
                type="button"
                onClick={() => handleOpenModal(shp)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer active:scale-95 shadow-2xs"
              >
                Update Status
              </button>
            </div>
          </div>
        ))}

        {filteredShipments.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
            <Truck className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800">No shipments found</h3>
            <p className="text-xs text-slate-500">No shipments match your current search or status filters.</p>
          </div>
        )}
      </div>

      {/* Update Shipment Dialog mounted via React Portal */}
      {mounted && selectedShipment && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedShipment(null)}
        >
          <div 
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm tracking-tight">
                    Update Shipment #{selectedShipment.id}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span>Order: <strong>{selectedShipment.receiptNumber}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-blue-600 font-bold">{selectedShipment.courier}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedShipment(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              {/* Delivery Info Snippet */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{selectedShipment.customerName}</span>
                  <span className="font-mono text-slate-500">{selectedShipment.customerPhone}</span>
                </div>
                <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedShipment.destination}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Delivery Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {STATUS_OPTIONS.map(opt => {
                    const isSelected = newStatus === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNewStatus(opt.value)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? `${opt.bg} ${opt.text} ring-2 ring-blue-500/20 shadow-2xs`
                            : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${opt.dot} shrink-0`} />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Courier Checkpoint Notes */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Courier Checkpoint Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Signature required upon delivery."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all cursor-text"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  {PRESET_NOTES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStatusNote(preset)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      {preset.length > 28 ? preset.slice(0, 28) + '...' : preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedShipment(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
