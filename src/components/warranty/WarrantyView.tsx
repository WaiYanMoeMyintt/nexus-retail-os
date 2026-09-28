'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePOS } from '@/context/POSContext';
import { 
  WarrantyTicket, 
  RepairJob, 
  RepairPart, 
  WarrantyClaimStatus, 
  RepairJobStatus, 
  RepairPriority,
  DeviceCondition 
} from '@/types';
import { 
  ShieldCheck, 
  Wrench, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Building2, 
  QrCode, 
  FileText, 
  XCircle, 
  DollarSign, 
  Sparkles, 
  ChevronRight, 
  ShieldAlert, 
  Calendar, 
  LayoutGrid, 
  List, 
  Filter, 
  ArrowRight, 
  Phone, 
  Mail, 
  Smartphone, 
  Copy, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Send, 
  Eye, 
  Tag, 
  Zap,
  BatteryCharging,
  Cpu,
  Camera,
  Volume2,
  HardDrive,
  Shield,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';
import { StorageService, STORAGE_KEYS } from '@/services/storageService';
import { generateId } from '@/lib/utils';

const CLAIM_REASONS = [
  'Display / Touch Digitizer Fault',
  'Battery Swelling / Severe Degradation',
  'Logic Board / Power PMIC Bootloop',
  'Camera Sensor / Variable Aperture Jam',
  'USB-C Port / Charging Pin Contact',
  'Audio Receiver / Speaker Crackle',
  'Biometric Sensor / Face ID Fault',
  'Accidental Physical Damage (Out of Warranty)',
  'Other Manufacturing Defect'
];

const PRESET_PARTS: { name: string; sku: string; cost: number }[] = [
  { name: 'OEM Actua / Super Retina OLED Display Assembly', sku: 'OEM-DISP-01', cost: 185.00 },
  { name: 'Original High-Density Battery Cell Module', sku: 'OEM-BATT-02', cost: 45.00 },
  { name: 'Main Camera OIS Optical Sensor Module', sku: 'OEM-CAM-03', cost: 160.00 },
  { name: 'USB-C Fast Charging Daughterboard & Mic Flex', sku: 'OEM-CHG-04', cost: 28.00 },
  { name: 'Top Acoustic Ear Speaker & Proximity Sensor', sku: 'OEM-SPK-05', cost: 35.00 },
  { name: 'Back Ceramic Shield Glass Housing Assembly', sku: 'OEM-GLS-06', cost: 75.00 },
  { name: 'S-Pen Bluetooth Docking Coil & Antenna Flex', sku: 'OEM-SPEN-07', cost: 38.00 }
];

export const WarrantyView: React.FC = () => {
  const { 
    products,
    warrantyTickets, 
    repairJobs, 
    devices, 
    customers,
    orders,
    branches,
    activeBranchId,
    activeBranch,
    employees, 
    currentUser,
    createWarrantyTicket, 
    updateWarrantyTicket,
    deleteWarrantyTicket,
    createRepairJob, 
    updateRepairJob,
    deleteRepairJob,
    updateRepairStatus 
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'warranties' | 'repairs'>('warranties');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [layoutView, setLayoutView] = useState<'table' | 'grid'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Mount check for createPortal
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Modals & Drawers
  const [isNewClaimModalOpen, setIsNewClaimModalOpen] = useState(false);
  const [isNewRepairModalOpen, setIsNewRepairModalOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairJob | null>(null);
  const [isUpdateRepairModalOpen, setIsUpdateRepairModalOpen] = useState(false);
  const [selectedClaimDetail, setSelectedClaimDetail] = useState<WarrantyTicket | null>(null);

  // -------------------------------------------------------------
  // New Warranty Claim Form State
  // -------------------------------------------------------------
  const [claimCustomerId, setClaimCustomerId] = useState('');
  const [claimCustomerName, setClaimCustomerName] = useState('');
  const [claimCustomerPhone, setClaimCustomerPhone] = useState('');
  const [claimCustomerEmail, setClaimCustomerEmail] = useState('');
  const [claimDeviceId, setClaimDeviceId] = useState('');
  const [claimImei, setClaimImei] = useState('');
  const [claimSerial, setClaimSerial] = useState('');
  const [claimProductName, setClaimProductName] = useState('');
  const [claimBrand, setClaimBrand] = useState('Apple');
  const [claimOrderId, setClaimOrderId] = useState('');
  const [claimPurchaseDate, setClaimPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [claimReason, setClaimReason] = useState(CLAIM_REASONS[0]);
  const [claimIssue, setClaimIssue] = useState('');
  const [claimCondition, setClaimCondition] = useState<DeviceCondition>('Brand New');
  const [claimStatus, setClaimStatus] = useState<WarrantyClaimStatus>('Pending');
  const [claimBranchId, setClaimBranchId] = useState(activeBranchId);
  const [claimNotes, setClaimNotes] = useState('');

  // -------------------------------------------------------------
  // New Repair Job Form State
  // -------------------------------------------------------------
  const [repairLinkedWarrantyId, setRepairLinkedWarrantyId] = useState('');
  const [repairCustomerName, setRepairCustomerName] = useState('');
  const [repairCustomerPhone, setRepairCustomerPhone] = useState('');
  const [repairCustomerEmail, setRepairCustomerEmail] = useState('');
  const [repairImei, setRepairImei] = useState('');
  const [repairSerial, setRepairSerial] = useState('');
  const [repairProductName, setRepairProductName] = useState('');
  const [repairBrand, setRepairBrand] = useState('Apple');
  const [repairBranchId, setRepairBranchId] = useState(activeBranchId);
  const [repairTechId, setRepairTechId] = useState(employees[3]?.id || employees[0]?.id || '');
  const [repairPriority, setRepairPriority] = useState<RepairPriority>('Normal');
  const [repairIssue, setRepairIssue] = useState('');
  const [repairDiagnosis, setRepairDiagnosis] = useState('');
  const [repairParts, setRepairParts] = useState<RepairPart[]>([]);
  const [repairLaborCost, setRepairLaborCost] = useState('40.00');
  const [repairEstCompletionDays, setRepairEstCompletionDays] = useState('2');
  const [repairStatus, setRepairStatus] = useState<RepairJobStatus>('RECEIVED');

  // Load preferred layout from LocalStorage
  useEffect(() => {
    const savedLayout = StorageService.getItem<'table' | 'grid'>(STORAGE_KEYS.WARRANTY_LAYOUT, 'table');
    if (savedLayout) setLayoutView(savedLayout);
  }, []);

  // Sync selected branch filter and default branch for new claims/repairs with top Navbar
  useEffect(() => {
    if (activeBranchId) {
      setSelectedBranchFilter(activeBranchId);
      setClaimBranchId(activeBranchId);
      setRepairBranchId(activeBranchId);
    }
  }, [activeBranchId]);

  const handleLayoutChange = (newLayout: 'table' | 'grid') => {
    setLayoutView(newLayout);
    StorageService.setItem(STORAGE_KEYS.WARRANTY_LAYOUT, newLayout);
  };

  // -------------------------------------------------------------
  // Update Repair Job Form State
  // -------------------------------------------------------------
  const [updateStatus, setUpdateStatus] = useState<RepairJobStatus>('DIAGNOSING');
  const [updateDiagnosis, setUpdateDiagnosis] = useState('');
  const [updateParts, setUpdateParts] = useState<RepairPart[]>([]);
  const [updateLaborCost, setUpdateLaborCost] = useState('40.00');
  const [updateNotes, setUpdateNotes] = useState('');
  const [customPartName, setCustomPartName] = useState('');
  const [customPartCost, setCustomPartCost] = useState('');

  // Helper to dynamically get real product image
  const getProductImage = (ticket: WarrantyTicket) => {
    if (ticket.productId) {
      const prod = products.find(p => p.id === ticket.productId);
      if (prod?.image) return prod.image;
    }
    const byName = products.find(p => 
      p.name.toLowerCase().includes(ticket.productName.toLowerCase()) || 
      ticket.productName.toLowerCase().includes(p.name.toLowerCase())
    );
    if (byName?.image) return byName.image;
    const byBrand = products.find(p => p.brand.toLowerCase() === ticket.brand.toLowerCase());
    if (byBrand?.image) return byBrand.image;
    return null;
  };

  const getRepairProductImage = (job: RepairJob) => {
    if (job.productId) {
      const prod = products.find(p => p.id === job.productId);
      if (prod?.image) return prod.image;
    }
    const byName = products.find(p => 
      p.name.toLowerCase().includes(job.productName.toLowerCase()) || 
      job.productName.toLowerCase().includes(p.name.toLowerCase())
    );
    if (byName?.image) return byName.image;
    const byBrand = products.find(p => p.brand && job.brand && p.brand.toLowerCase() === job.brand.toLowerCase());
    if (byBrand?.image) return byBrand.image;
    return null;
  };

  // Synchronize customer selection in New Claim Modal
  const handleSelectCustomerForClaim = (custId: string) => {
    setClaimCustomerId(custId);
    if (!custId) return;
    const cust = customers.find(c => c.id === custId);
    if (cust) {
      setClaimCustomerName(cust.name);
      setClaimCustomerPhone(cust.phone);
      setClaimCustomerEmail(cust.email);

      const custDevice = devices.find(d => d.customerId === cust.id || d.customerName === cust.name);
      if (custDevice) {
        setClaimDeviceId(custDevice.id);
        setClaimImei(custDevice.imei1);
        setClaimSerial(custDevice.serialNumber);
        setClaimProductName(custDevice.productName);
        setClaimBrand(custDevice.brand);
        if (custDevice.orderId) setClaimOrderId(custDevice.orderId);
      } else {
        const custOrder = orders.find(o => o.customer?.id === cust.id);
        if (custOrder) {
          setClaimOrderId(custOrder.id);
          if (custOrder.items[0]) {
            setClaimProductName(custOrder.items[0].productName);
            setClaimBrand(custOrder.items[0].brand);
            if (custOrder.items[0].selectedSerial) {
              setClaimImei(custOrder.items[0].selectedSerial);
            }
          }
        }
      }
    }
  };

  const handleSelectDeviceForClaim = (deviceId: string) => {
    setClaimDeviceId(deviceId);
    if (!deviceId) return;
    const dev = devices.find(d => d.id === deviceId);
    if (dev) {
      setClaimImei(dev.imei1);
      setClaimSerial(dev.serialNumber);
      setClaimProductName(dev.productName);
      setClaimBrand(dev.brand);
      if (dev.orderId) setClaimOrderId(dev.orderId);
      if (dev.customerName && !claimCustomerName) {
        setClaimCustomerName(dev.customerName);
      }
    }
  };

  const handleSelectWarrantyForRepair = (warrantyId: string) => {
    setRepairLinkedWarrantyId(warrantyId);
    if (!warrantyId) return;
    const war = warrantyTickets.find(w => w.id === warrantyId);
    if (war) {
      setRepairCustomerName(war.customerName);
      setRepairCustomerPhone(war.customerPhone);
      setRepairCustomerEmail(war.customerEmail || '');
      setRepairImei(war.imei);
      setRepairSerial(war.serialNumber || '');
      setRepairProductName(war.productName);
      setRepairBrand(war.brand);
      setRepairIssue(war.customerReportedIssue || war.issueDescription || '');
      if (war.branchId) setRepairBranchId(war.branchId);
    }
  };

  const handleSendToRepairBench = (ticket: WarrantyTicket) => {
    handleSelectWarrantyForRepair(ticket.id);
    setIsNewRepairModalOpen(true);
  };

  // Filtered Lists
  const filteredWarranties = useMemo(() => {
    return warrantyTickets.filter(w => {
      const matchesSearch = 
        w.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.imei.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.claimReason && w.claimReason.toLowerCase().includes(searchQuery.toLowerCase())) ||
        w.orderId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch = selectedBranchFilter === 'all' || w.branchId === selectedBranchFilter;
      const matchesStatus = selectedStatusFilter === 'all' || w.status === selectedStatusFilter || w.claimStatus === selectedStatusFilter;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [warrantyTickets, searchQuery, selectedBranchFilter, selectedStatusFilter]);

  const filteredRepairs = useMemo(() => {
    return repairJobs.filter(r => {
      const matchesSearch = 
        r.repairNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.imei.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.technicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.issue.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBranch = selectedBranchFilter === 'all' || r.branchId === selectedBranchFilter;
      const matchesStatus = selectedStatusFilter === 'all' || r.status === selectedStatusFilter || r.repairStatus === selectedStatusFilter;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [repairJobs, searchQuery, selectedBranchFilter, selectedStatusFilter]);

  // KPI Metrics
  const activeWarrantyCount = warrantyTickets.filter(w => w.status === 'ACTIVE' || w.status === 'Approved' || w.claimStatus === 'Approved').length;
  const pendingClaimsCount = warrantyTickets.filter(w => w.status === 'Pending' || w.status === 'CLAIMED' || w.claimStatus === 'Pending').length;
  const activeRepairJobsCount = repairJobs.filter(r => r.status !== 'DELIVERED' && r.status !== 'REPAIRED' && r.repairStatus !== 'Completed').length;
  const totalCompletedRepairs = repairJobs.filter(r => r.status === 'DELIVERED' || r.status === 'REPAIRED' || r.repairStatus === 'Completed').length;
  const totalRepairBilled = repairJobs.reduce((sum, r) => sum + (r.finalCost || r.totalCost || r.estimatedCost || 0), 0);

  // Form Submit Handlers
  const handleCreateClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimImei.trim() || !claimCustomerName.trim()) {
      toast.error('Device IMEI and Customer Name are required.');
      return;
    }

    createWarrantyTicket({
      customerId: claimCustomerId || undefined,
      customerName: claimCustomerName.trim(),
      customerPhone: claimCustomerPhone.trim(),
      customerEmail: claimCustomerEmail.trim() || undefined,
      deviceId: claimDeviceId || undefined,
      imei: claimImei.trim(),
      serialNumber: claimSerial.trim() || `SN-${claimImei.slice(-6)}`,
      productId: undefined,
      productName: claimProductName.trim() || 'Flagship Smartphone',
      brand: claimBrand,
      orderId: claimOrderId.trim() || 'ORD-WALKIN',
      purchaseDate: claimPurchaseDate,
      startDate: claimPurchaseDate,
      expiryDate: new Date(new Date(claimPurchaseDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      warrantyMonths: 12,
      claimReason: claimReason,
      customerReportedIssue: claimIssue.trim() || 'Standard warranty claim inspection requested.',
      productCondition: claimCondition,
      status: claimStatus,
      claimStatus: claimStatus,
      branchId: claimBranchId,
      branchName: branches.find(b => b.id === claimBranchId)?.name || activeBranch.name,
      notes: claimNotes.trim() || undefined
    });

    setIsNewClaimModalOpen(false);
    toast.success('Warranty claim registered successfully!');
    setClaimCustomerId('');
    setClaimCustomerName('');
    setClaimCustomerPhone('');
    setClaimCustomerEmail('');
    setClaimDeviceId('');
    setClaimImei('');
    setClaimSerial('');
    setClaimProductName('');
    setClaimIssue('');
    setClaimNotes('');
  };

  const handleCreateRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairImei.trim() || !repairCustomerName.trim()) {
      toast.error('Device IMEI and Customer Name are required.');
      return;
    }

    const tech = employees.find(emp => emp.id === repairTechId) || employees[0];
    const labor = parseFloat(repairLaborCost) || 40.00;
    const partsTotal = repairParts.reduce((sum, p) => sum + (p.cost * (p.quantity || 1)), 0);
    const estDays = parseInt(repairEstCompletionDays) || 2;
    const estDate = new Date(Date.now() + estDays * 24 * 60 * 60 * 1000).toISOString();

    createRepairJob({
      warrantyTicketId: repairLinkedWarrantyId || undefined,
      customerName: repairCustomerName.trim(),
      customerPhone: repairCustomerPhone.trim(),
      customerEmail: repairCustomerEmail.trim() || undefined,
      imei: repairImei.trim(),
      serialNumber: repairSerial.trim() || `SN-${repairImei.slice(-6)}`,
      productName: repairProductName.trim() || 'Flagship Smartphone',
      brand: repairBrand,
      branchId: repairBranchId,
      branchName: branches.find(b => b.id === repairBranchId)?.name || activeBranch.name,
      technicianId: tech.id,
      technicianName: tech.name,
      technicianPhone: tech.phone,
      status: repairStatus,
      repairStatus: repairStatus === 'RECEIVED' ? 'Open' : (repairStatus as RepairJobStatus),
      priority: repairPriority,
      issue: repairIssue.trim() || 'Inspection & Hardware Repair',
      problemDescription: repairIssue.trim(),
      diagnosis: repairDiagnosis.trim() || undefined,
      partsUsed: repairParts,
      laborCost: labor,
      partsCost: partsTotal,
      estimatedCost: labor + partsTotal,
      finalCost: labor + partsTotal,
      totalCost: labor + partsTotal,
      estimatedCompletionDate: estDate
    });

    setIsNewRepairModalOpen(false);
    toast.success('Workbench repair job created!');
    setRepairLinkedWarrantyId('');
    setRepairCustomerName('');
    setRepairCustomerPhone('');
    setRepairCustomerEmail('');
    setRepairImei('');
    setRepairSerial('');
    setRepairProductName('');
    setRepairIssue('');
    setRepairDiagnosis('');
    setRepairParts([]);
    setRepairLaborCost('40.00');
  };

  const handleOpenUpdateRepair = (job: RepairJob) => {
    setSelectedRepair(job);
    setUpdateStatus(job.status);
    setUpdateDiagnosis(job.diagnosis || '');
    setUpdateParts(job.partsUsed ? [...job.partsUsed] : []);
    setUpdateLaborCost((job.laborCost !== undefined ? job.laborCost : 40.00).toString());
    setUpdateNotes(job.notes || job.repairNotes || '');
    setIsUpdateRepairModalOpen(true);
  };

  const handleExecuteUpdateRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepair) return;

    const labor = parseFloat(updateLaborCost) || 0;
    const partsTotal = updateParts.reduce((sum, p) => sum + (p.cost * (p.quantity || 1)), 0);
    const finalTotal = labor + partsTotal;

    updateRepairJob(selectedRepair.id, {
      status: updateStatus,
      repairStatus: updateStatus === 'DELIVERED' || updateStatus === 'REPAIRED' ? 'Completed' : (updateStatus as RepairJobStatus),
      diagnosis: updateDiagnosis.trim() || undefined,
      partsUsed: updateParts,
      laborCost: labor,
      partsCost: partsTotal,
      finalCost: finalTotal,
      totalCost: finalTotal,
      notes: updateNotes.trim() || undefined
    });

    setIsUpdateRepairModalOpen(false);
    toast.success('Workbench updated successfully!');
  };

  const handleAddPresetPart = (preset: { name: string; sku: string; cost: number }, isUpdate: boolean) => {
    const newPart: RepairPart = {
      id: generateId('part'),
      partName: preset.name,
      partSku: preset.sku,
      quantity: 1,
      cost: preset.cost
    };
    if (isUpdate) {
      setUpdateParts(prev => [...prev, newPart]);
    } else {
      setRepairParts(prev => [...prev, newPart]);
    }
    toast.info(`Added part: ${preset.name}`);
  };

  const handleCopyText = (text: string, id: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success(`${label} copied: ${text}`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Clean brand badge styling (pure text, NO emoji)
  const getBrandBadge = (brand: string) => {
    switch (brand) {
      case 'Apple':
        return { bg: 'bg-slate-900 text-white', label: 'Apple' };
      case 'Samsung':
        return { bg: 'bg-blue-600 text-white', label: 'Samsung' };
      case 'Google':
        return { bg: 'bg-emerald-600 text-white', label: 'Google' };
      case 'Xiaomi':
        return { bg: 'bg-amber-600 text-white', label: 'Xiaomi' };
      case 'OnePlus':
        return { bg: 'bg-rose-600 text-white', label: 'OnePlus' };
      case 'Sony':
        return { bg: 'bg-indigo-600 text-white', label: 'Sony' };
      default:
        return { bg: 'bg-slate-700 text-white', label: brand };
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'ACTIVE':
      case 'REPAIRED':
      case 'Completed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: status === 'ACTIVE' ? 'Approved' : status
        };
      case 'In Repair':
      case 'IN_REPAIR':
      case 'DIAGNOSING':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
          label: status === 'IN_REPAIR' ? 'In Repair' : status === 'DIAGNOSING' ? 'Diagnosing' : status
        };
      case 'Pending':
      case 'PARTS_PENDING':
      case 'CLAIMED':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: status === 'PARTS_PENDING' ? 'Parts Pending' : 'Pending Review'
        };
      case 'Ready for Pickup':
      case 'READY_FOR_PICKUP':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200',
          dot: 'bg-sky-500',
          label: 'Ready for Pickup'
        };
      case 'Rejected':
      case 'VOID':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Rejected'
        };
      case 'DELIVERED':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          label: 'Delivered'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status
        };
    }
  };

  // Defect reason tag & clean icon
  const getDefectIcon = (reason?: string) => {
    const r = (reason || '').toLowerCase();
    if (r.includes('display') || r.includes('touch') || r.includes('screen')) return { icon: Smartphone, color: 'text-sky-700 bg-sky-50 border-sky-200' };
    if (r.includes('battery') || r.includes('swelling')) return { icon: BatteryCharging, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (r.includes('logic') || r.includes('board') || r.includes('pmic')) return { icon: Cpu, color: 'text-purple-700 bg-purple-50 border-purple-200' };
    if (r.includes('camera') || r.includes('sensor')) return { icon: Camera, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (r.includes('usb') || r.includes('charging') || r.includes('port')) return { icon: Zap, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (r.includes('audio') || r.includes('speaker')) return { icon: Volume2, color: 'text-pink-700 bg-pink-50 border-pink-200' };
    return { icon: Wrench, color: 'text-slate-700 bg-slate-100 border-slate-200' };
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Warranty & Repair Management</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Official device coverage verification, defect triage, RMA tracking, and technician workbench.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsNewClaimModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Warranty Claim</span>
          </button>
          <button
            onClick={() => setIsNewRepairModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-blue-100" />
            <span>Open Repair Job</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Active Warranties</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {activeWarrantyCount} <span className="text-xs font-semibold text-emerald-600">Active</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Protected customer units
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Pending Claims</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {pendingClaimsCount} <span className="text-xs font-semibold text-amber-700">In Triage</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Awaiting diagnosis & inspection
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Workshop Repairs</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-2">
            {activeRepairJobsCount} <span className="text-xs font-semibold text-indigo-700">Jobs</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Active bench pipeline
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Workshop Billed</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ${totalRepairBilled.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            {totalCompletedRepairs} jobs delivered to date
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Main Tab Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full lg:w-auto shrink-0">
          <button
            onClick={() => { setActiveTab('warranties'); setSelectedStatusFilter('all'); }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'warranties'
                ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Warranty Claims</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-black ${
              activeTab === 'warranties' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
            }`}>
              {warrantyTickets.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('repairs'); setSelectedStatusFilter('all'); }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'repairs'
                ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Repair Workshop Bench</span>
            <span className={`text-[10px] px-2 py-0.2 rounded-full font-black ${
              activeTab === 'repairs' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
            }`}>
              {repairJobs.length}
            </span>
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap sm:flex-nowrap">
          {/* Branch Filter */}
          <div className="relative shrink-0">
            <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedBranchFilter}
              onChange={e => setSelectedBranchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-colors shadow-2xs"
            >
              <option value="all">All Store Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative shrink-0">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedStatusFilter}
              onChange={e => setSelectedStatusFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-colors shadow-2xs"
            >
              <option value="all">All Statuses</option>
              {activeTab === 'warranties' ? (
                <>
                  <option value="ACTIVE">Approved / Active</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Approved">Approved</option>
                  <option value="In Repair">In Repair</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </>
              ) : (
                <>
                  <option value="RECEIVED">Received / Open</option>
                  <option value="DIAGNOSING">Diagnosing</option>
                  <option value="PARTS_PENDING">Parts Pending</option>
                  <option value="IN_REPAIR">In Repair</option>
                  <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                  <option value="DELIVERED">Delivered / Completed</option>
                </>
              )}
            </select>
          </div>

          {/* Search Input with Clear Button */}
          <div className="relative flex-1 sm:w-64 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search IMEI, ticket #, tech, client..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Layout Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl shrink-0 border border-slate-200/60">
            <button
              onClick={() => handleLayoutChange('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                layoutView === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleLayoutChange('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                layoutView === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* WARRANTY CLAIMS TAB                                       */}
      {/* ========================================================= */}
      {activeTab === 'warranties' && (
        <>
          {layoutView === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5 w-[30%] min-w-[280px]">Claim # & Device Specs</th>
                      <th className="px-4 py-3.5 w-[18%] min-w-[170px]">IMEI / Order</th>
                      <th className="px-4 py-3.5 w-[18%] min-w-[170px]">Customer & Contact</th>
                      <th className="px-4 py-3.5 w-[14%] min-w-[140px]">Store Branch</th>
                      <th className="px-4 py-3.5 w-[12%] min-w-[120px]">Status</th>
                      <th className="px-4 py-3.5 pr-6 text-right w-[8%] min-w-[80px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredWarranties.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                          <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <span className="font-bold text-slate-700 block">No warranty claims found</span>
                          <span className="text-[11px] text-slate-400">Adjust search filters or create a new claim above.</span>
                        </td>
                      </tr>
                    ) : (
                      filteredWarranties.map(ticket => {
                        const brandInfo = getBrandBadge(ticket.brand);
                        const statusInfo = getStatusBadge(ticket.claimStatus || ticket.status);
                        const defectInfo = getDefectIcon(ticket.claimReason);
                        const DefectIcon = defectInfo.icon;
                        const realImage = getProductImage(ticket);
                        const initials = ticket.customerName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CU';

                        return (
                          <tr key={ticket.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Claim & Device Specs with Real Photo */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-900/5 shadow-2xs shrink-0 flex items-center justify-center">
                                  {realImage ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={realImage}
                                      alt={ticket.productName}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <Smartphone className="w-5 h-5 text-slate-400" />
                                  )}
                                </div>

                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono font-bold text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 rounded-md">
                                      {ticket.ticketNumber}
                                    </span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${brandInfo.bg}`}>
                                      {brandInfo.label}
                                    </span>
                                    {ticket.productCondition && (
                                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200 whitespace-nowrap">
                                        {ticket.productCondition}
                                      </span>
                                    )}
                                  </div>

                                  <div className="font-bold text-slate-900 text-xs truncate leading-tight">
                                    {ticket.productName}
                                  </div>

                                  <div className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold border ${defectInfo.color}`}>
                                    <DefectIcon className="w-3 h-3" />
                                    <span className="truncate max-w-[160px]">{ticket.claimReason || 'Hardware Defect'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* IMEI / Order */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200 px-1.5 py-0.5 rounded-lg w-fit">
                                  <QrCode className="w-3 h-3 text-indigo-600 shrink-0" />
                                  <span className="font-mono font-bold text-[11px] text-slate-800 tracking-tight">
                                    {ticket.imei}
                                  </span>
                                  <button 
                                    type="button"
                                    onClick={() => handleCopyText(ticket.imei, ticket.id, 'IMEI')}
                                    className="p-0.5 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                                    title="Copy IMEI"
                                  >
                                    {copiedId === ticket.id ? (
                                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>

                                <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-slate-400" />
                                  <span>Order #{ticket.orderId}</span>
                                </div>
                              </div>
                            </td>

                            {/* Customer & Contact */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-xs text-slate-900 truncate leading-tight">
                                    {ticket.customerName}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span className="truncate">{ticket.customerPhone}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Branch & Expiry */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1 text-xs text-slate-800 font-bold">
                                  <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span className="truncate max-w-[120px]">{ticket.branchName || activeBranch.name}</span>
                                </div>
                                <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                                  <Shield className="w-3 h-3 text-emerald-600" />
                                  <span>Exp: {new Date(ticket.expiryDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                                <span>{statusInfo.label}</span>
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 pr-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={() => setSelectedClaimDetail(ticket)}
                                  className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg border border-slate-200/80 hover:border-indigo-200 transition-colors cursor-pointer shrink-0"
                                  title="View Claim Dossier"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
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
          ) : (
            /* Card Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWarranties.map(ticket => {
                const brandInfo = getBrandBadge(ticket.brand);
                const statusInfo = getStatusBadge(ticket.claimStatus || ticket.status);
                const defectInfo = getDefectIcon(ticket.claimReason);
                const DefectIcon = defectInfo.icon;
                const realImage = getProductImage(ticket);

                return (
                  <div key={ticket.id} className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-2xs hover:shadow-md transition-all space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-900/5 shadow-2xs shrink-0 flex items-center justify-center">
                          {realImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={realImage}
                              alt={ticket.productName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Smartphone className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-xs text-indigo-700">{ticket.ticketNumber}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${brandInfo.bg}`}>{brandInfo.label}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">{ticket.productName}</h4>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs space-y-1.5 font-medium">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-400">Customer:</span>
                        <span className="font-bold text-slate-900">{ticket.customerName}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-400">IMEI:</span>
                        <span className="font-mono font-bold text-slate-800">{ticket.imei}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-400">Defect:</span>
                        <span className="font-semibold text-indigo-700 truncate max-w-[140px]">{ticket.claimReason}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 font-medium">Order #{ticket.orderId}</span>
                      <button
                        onClick={() => setSelectedClaimDetail(ticket)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* REPAIR WORKSHOP BENCH TAB                                 */}
      {/* ========================================================= */}
      {activeTab === 'repairs' && (
        <>
          {layoutView === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5 w-[26%] min-w-[260px]">Job # & Device Specs</th>
                      <th className="px-4 py-3.5 w-[16%] min-w-[160px]">Assigned Technician</th>
                      <th className="px-4 py-3.5 w-[20%] min-w-[200px]">Issue & Diagnosis</th>
                      <th className="px-4 py-3.5 w-[12%] min-w-[120px]">Parts & Cost</th>
                      <th className="px-4 py-3.5 w-[8%] min-w-[90px]">Priority</th>
                      <th className="px-4 py-3.5 w-[10%] min-w-[130px]">Pipeline Status</th>
                      <th className="px-4 py-3.5 pr-6 text-right w-[8%] min-w-[140px]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRepairs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                          <Wrench className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <span className="font-bold text-slate-700 block">No workshop jobs found</span>
                        </td>
                      </tr>
                    ) : (
                      filteredRepairs.map(job => {
                        const statusInfo = getStatusBadge(job.status || job.repairStatus || 'RECEIVED');
                        const realImage = getRepairProductImage(job);

                        return (
                          <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Job # & Device Specs */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-900/5 shadow-2xs shrink-0 flex items-center justify-center">
                                  {realImage ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={realImage}
                                      alt={job.productName}
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <Wrench className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>

                                <div>
                                  <span className="font-mono font-bold text-xs text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                    {job.repairNumber}
                                  </span>
                                  <div className="font-bold text-slate-900 text-xs mt-0.5">{job.productName}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">IMEI: {job.imei}</div>
                                </div>
                              </div>
                            </td>

                            {/* Technician */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  <span>{job.technicianName}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium">{job.branchName || 'Workshop HQ'}</div>
                              </div>
                            </td>

                            {/* Issue & Diagnosis */}
                            <td className="px-4 py-3.5 max-w-[200px]">
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-slate-800 truncate">{job.issue}</div>
                                <div className="text-[11px] text-slate-500 truncate font-medium">
                                  {job.diagnosis || 'Diagnosis in progress...'}
                                </div>
                              </div>
                            </td>

                            {/* Parts & Cost */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <div className="font-bold text-slate-900 text-xs tabular-nums">
                                ${(job.totalCost || job.finalCost || job.estimatedCost).toFixed(2)}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                Parts: {job.partsUsed?.length || 0}
                              </div>
                            </td>

                            {/* Priority */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                job.priority === 'Urgent'
                                  ? 'bg-rose-100 text-rose-800'
                                  : job.priority === 'High'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {job.priority || 'Normal'}
                              </span>
                            </td>

                            {/* Pipeline Status */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusInfo.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                                <span>{statusInfo.label}</span>
                              </span>
                            </td>

                            {/* Action */}
                            <td className="px-4 py-3.5 pr-6 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleOpenUpdateRepair(job)}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200/80 transition-all cursor-pointer shadow-2xs"
                              >
                                Update Bench
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Card Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRepairs.map(job => {
                const statusInfo = getStatusBadge(job.status || job.repairStatus || 'RECEIVED');
                const realImage = getRepairProductImage(job);

                return (
                  <div key={job.id} className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-2xs hover:shadow-md transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-900/5 shadow-2xs shrink-0 flex items-center justify-center">
                          {realImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={realImage}
                              alt={job.productName}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Wrench className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <span className="font-mono font-bold text-xs text-amber-800">{job.repairNumber}</span>
                          <h4 className="text-xs font-bold text-slate-900 mt-0.5">{job.productName}</h4>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 font-medium">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-400">Technician:</span>
                        <span className="font-bold text-slate-900">{job.technicianName}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-400">Total Billed:</span>
                        <span className="font-bold text-emerald-600">${(job.totalCost || job.finalCost || job.estimatedCost).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">Priority: {job.priority || 'Normal'}</span>
                      <button
                        onClick={() => handleOpenUpdateRepair(job)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Update Bench</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: NEW WARRANTY CLAIM MODAL                         */}
      {/* ========================================================= */}
      {mounted && isNewClaimModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Register Warranty Claim</h3>
                  <p className="text-xs text-slate-500 font-medium">Verify coverage, record defects & trigger triage</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewClaimModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClaimSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Registered Customer</label>
                <select
                  value={claimCustomerId}
                  onChange={e => handleSelectCustomerForClaim(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Quick Select Existing Customer (Optional) --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={claimCustomerName}
                    onChange={e => setClaimCustomerName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Customer Phone *</label>
                  <input
                    type="tel"
                    required
                    value={claimCustomerPhone}
                    onChange={e => setClaimCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Sold Device</label>
                <select
                  value={claimDeviceId}
                  onChange={e => handleSelectDeviceForClaim(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Match Sold Device (Optional) --</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.productName} (IMEI: {d.imei1}) - {d.customerName || 'In Stock'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Device IMEI *</label>
                  <input
                    type="text"
                    required
                    value={claimImei}
                    onChange={e => setClaimImei(e.target.value)}
                    placeholder="359482109845110"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Product Model Name</label>
                  <input
                    type="text"
                    value={claimProductName}
                    onChange={e => setClaimProductName(e.target.value)}
                    placeholder="e.g. iPhone 16 Pro Max"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Primary Defect Category</label>
                <select
                  value={claimReason}
                  onChange={e => setClaimReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  {CLAIM_REASONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Detailed Defect Symptoms</label>
                <textarea
                  rows={2}
                  value={claimIssue}
                  onChange={e => setClaimIssue(e.target.value)}
                  placeholder="Customer reports touch stutter, display flicker, or charging failure..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewClaimModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Register Claim</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================= */}
      {/* MODAL 2: NEW REPAIR JOB MODAL                             */}
      {/* ========================================================= */}
      {mounted && isNewRepairModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Open Workbench Repair Job</h3>
                  <p className="text-xs text-slate-500 font-medium">Assign technician, parts costing & bench pipeline</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewRepairModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRepairSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Link to Approved Warranty Ticket</label>
                <select
                  value={repairLinkedWarrantyId}
                  onChange={e => handleSelectWarrantyForRepair(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">-- Standalone Paid Repair Job --</option>
                  {warrantyTickets.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.ticketNumber} - {w.customerName} ({w.productName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={repairCustomerName}
                    onChange={e => setRepairCustomerName(e.target.value)}
                    placeholder="e.g. Liam Henderson"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Customer Phone *</label>
                  <input
                    type="tel"
                    required
                    value={repairCustomerPhone}
                    onChange={e => setRepairCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 999-1234"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Device IMEI *</label>
                  <input
                    type="text"
                    required
                    value={repairImei}
                    onChange={e => setRepairImei(e.target.value)}
                    placeholder="356291048291001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Device Model Name</label>
                  <input
                    type="text"
                    value={repairProductName}
                    onChange={e => setRepairProductName(e.target.value)}
                    placeholder="e.g. Google Pixel 9 Pro XL"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Lead Technician</label>
                  <select
                    value={repairTechId}
                    onChange={e => setRepairTechId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bench Priority</label>
                  <select
                    value={repairPriority}
                    onChange={e => setRepairPriority(e.target.value as RepairPriority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Normal">Normal Turnaround</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Rush</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Installed Parts</span>
                  <span className="text-indigo-700 font-bold">
                    Parts Total: ${(repairParts.reduce((sum, p) => sum + p.cost, 0)).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold">Presets:</span>
                  {PRESET_PARTS.slice(0, 4).map(preset => (
                    <button
                      key={preset.sku}
                      type="button"
                      onClick={() => handleAddPresetPart(preset, false)}
                      className="px-2 py-0.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      + {preset.name.split(' ')[0]} (${preset.cost})
                    </button>
                  ))}
                </div>

                {repairParts.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {repairParts.map((part, idx) => (
                      <div key={part.id || idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
                        <span className="font-bold text-slate-800">{part.partName}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">${part.cost.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => setRepairParts(prev => prev.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Primary styled Labor Rate and Estimated Total box (NO dark black theme) */}
              <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-slate-50 p-4 rounded-xl border border-indigo-100/90 shadow-2xs">
                <div>
                  <label className="block text-indigo-950 font-bold text-[11px] mb-1">Labor Rate ($)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      step="0.01"
                      value={repairLaborCost}
                      onChange={e => setRepairLaborCost(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs shadow-2xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-indigo-950 font-bold text-[11px] mb-1">Estimated Total ($)</label>
                  <div className="text-xl font-black text-indigo-600 pt-0.5 tracking-tight tabular-nums">
                    ${((parseFloat(repairLaborCost) || 0) + repairParts.reduce((s, p) => s + p.cost, 0)).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Labor + {repairParts.length} parts included</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewRepairModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Wrench className="w-4 h-4 text-white" />
                  <span>Open Workshop Job</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================= */}
      {/* MODAL 3: UPDATE WORKSHOP REPAIR BENCH MODAL               */}
      {/* ========================================================= */}
      {mounted && isUpdateRepairModalOpen && selectedRepair && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Workshop Triage: {selectedRepair.repairNumber}</h3>
                  <p className="text-xs text-slate-500 font-medium">{selectedRepair.productName} • IMEI {selectedRepair.imei}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsUpdateRepairModalOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteUpdateRepair} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Workshop Pipeline Stage</label>
                <select
                  value={updateStatus}
                  onChange={e => setUpdateStatus(e.target.value as RepairJobStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="RECEIVED">Received / Queued in Triage</option>
                  <option value="DIAGNOSING">Diagnosing on Oscilloscope & Bench</option>
                  <option value="PARTS_PENDING">Parts Pending / Awaiting Shipment</option>
                  <option value="IN_REPAIR">In Repair / Soldering & Assembly</option>
                  <option value="REPAIRED">Repaired & Calibration Passed</option>
                  <option value="READY_FOR_PICKUP">Ready for Customer Pickup</option>
                  <option value="DELIVERED">Delivered to Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Technician Diagnostic Findings</label>
                <textarea
                  rows={2}
                  value={updateDiagnosis}
                  onChange={e => setUpdateDiagnosis(e.target.value)}
                  placeholder="Record oscilloscope readings, micro-soldering notes, or calibration data..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Installed Parts</span>
                  <span className="text-indigo-700 font-bold">
                    Parts Total: ${(updateParts.reduce((sum, p) => sum + p.cost, 0)).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold">Add Part:</span>
                  {PRESET_PARTS.slice(0, 4).map(preset => (
                    <button
                      key={preset.sku}
                      type="button"
                      onClick={() => handleAddPresetPart(preset, true)}
                      className="px-2 py-0.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      + {preset.name.split(' ')[0]} (${preset.cost})
                    </button>
                  ))}
                </div>

                {updateParts.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {updateParts.map((part, idx) => (
                      <div key={part.id || idx} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
                        <span className="font-bold text-slate-800">{part.partName}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">${part.cost.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => setUpdateParts(prev => prev.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No hardware parts added yet.</p>
                )}
              </div>

              {/* Primary styled Labor Cost and Total box */}
              <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-slate-50 p-4 rounded-xl border border-indigo-100/90 shadow-2xs">
                <div>
                  <label className="block text-indigo-950 font-bold text-[11px] mb-1">Labor Cost ($)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      step="0.01"
                      value={updateLaborCost}
                      onChange={e => setUpdateLaborCost(e.target.value)}
                      className="w-full pl-7 pr-2.5 py-1.5 bg-white border border-indigo-200 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs shadow-2xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-indigo-950 font-bold text-[11px] mb-1">Final Total Bill ($)</label>
                  <div className="text-xl font-black text-indigo-600 pt-0.5 tracking-tight tabular-nums">
                    ${((parseFloat(updateLaborCost) || 0) + updateParts.reduce((s, p) => s + p.cost, 0)).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Labor + {updateParts.length} parts sum</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateRepairModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Save Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================= */}
      {/* DRAWER: WARRANTY CLAIM DETAIL DOSSIER                     */}
      {/* ========================================================= */}
      {mounted && selectedClaimDetail && createPortal(
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  Warranty Claim Dossier
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1.5">{selectedClaimDetail.ticketNumber}</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedClaimDetail.productName}</p>
              </div>
              <button
                onClick={() => setSelectedClaimDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3.5">
                <div>
                  <span className="text-slate-400 font-bold text-[11px]">Customer Name:</span>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">{selectedClaimDetail.customerName}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[11px]">Contact Phone:</span>
                  <div className="font-bold text-slate-900 text-xs mt-0.5">{selectedClaimDetail.customerPhone}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[11px]">Device IMEI:</span>
                  <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">{selectedClaimDetail.imei}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[11px]">Store Branch:</span>
                  <div className="font-bold text-slate-800 text-xs mt-0.5">{selectedClaimDetail.branchName}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[11px]">Coverage Expiry:</span>
                  <div className="font-bold text-emerald-700 text-xs mt-0.5">{new Date(selectedClaimDetail.expiryDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-bold text-[11px]">Claim Status:</span>
                  <select
                    value={selectedClaimDetail.claimStatus || selectedClaimDetail.status}
                    onChange={e => {
                      const newStatus = e.target.value as WarrantyClaimStatus;
                      updateWarrantyTicket(selectedClaimDetail.id, { claimStatus: newStatus, status: newStatus });
                      setSelectedClaimDetail({ ...selectedClaimDetail, claimStatus: newStatus, status: newStatus });
                    }}
                    className="mt-1 w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-indigo-700 text-xs focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="In Repair">In Repair</option>
                    <option value="Ready for Pickup">Ready for Pickup</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1.5">Defect Reason & Symptoms</h5>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                  <div className="font-bold text-indigo-700 text-xs">{selectedClaimDetail.claimReason}</div>
                  <p className="text-slate-600 leading-relaxed font-medium">{selectedClaimDetail.customerReportedIssue || selectedClaimDetail.issueDescription}</p>
                </div>
              </div>

              {selectedClaimDetail.resolution && (
                <div>
                  <h5 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider mb-1.5">Triage Resolution</h5>
                  <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 text-emerald-900 font-medium leading-relaxed">
                    {selectedClaimDetail.resolution}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedClaimDetail(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
