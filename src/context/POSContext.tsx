'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { 
  Product, 
  ProductVariant,
  CartItem, 
  Customer, 
  Order, 
  StockMovement, 
  Shipment, 
  DiscountPromo, 
  PaymentTransaction, 
  ActivityNotification, 
  StoreSettings,
  ActiveView,
  PaymentDetails,
  ShipmentStatus,
  StockMovementType,
  DeviceItem,
  DeviceStatus,
  DeviceTimelineEvent,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  Branch,
  StockTransfer,
  TransferItem,
  Employee,
  EmployeeRole,
  RolePermissions,
  WarrantyTicket,
  RepairJob,
  RepairPart,
  AuditLogEntry,
  SmartAlert,
  CartTab,
  PromotionRule,
  SplitPaymentEntry
} from '@/types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_ORDERS, 
  INITIAL_SHIPMENTS, 
  INITIAL_STOCK_MOVEMENTS, 
  INITIAL_PAYMENTS, 
  INITIAL_DISCOUNTS,
  INITIAL_NOTIFICATIONS, 
  INITIAL_DEVICES,
  INITIAL_BRANCHES,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_STOCK_TRANSFERS,
  INITIAL_EMPLOYEES,
  INITIAL_WARRANTY_TICKETS,
  INITIAL_REPAIR_JOBS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SMART_ALERTS,
  INITIAL_PROMOTION_RULES,
  DEFAULT_SETTINGS 
} from '@/data/mockData';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';

export const ROLE_PERMISSIONS_MAP: Record<EmployeeRole, RolePermissions> = {
  OWNER: {
    canAccessPOS: true,
    canEditProductCost: true,
    canDeleteProduct: true,
    canApproveRefund: true,
    canManagePurchases: true,
    canApproveTransfers: true,
    canViewReports: true,
    canManageEmployees: true,
    canModifyDiscounts: true,
    canManageSettings: true,
    canViewCostBasis: true,
  },
  ADMIN: {
    canAccessPOS: true,
    canEditProductCost: true,
    canDeleteProduct: true,
    canApproveRefund: true,
    canManagePurchases: true,
    canApproveTransfers: true,
    canViewReports: true,
    canManageEmployees: true,
    canModifyDiscounts: true,
    canManageSettings: true,
    canViewCostBasis: true,
  },
  MANAGER: {
    canAccessPOS: true,
    canEditProductCost: false,
    canDeleteProduct: false,
    canApproveRefund: true,
    canManagePurchases: true,
    canApproveTransfers: true,
    canViewReports: true,
    canManageEmployees: false,
    canModifyDiscounts: true,
    canManageSettings: false,
    canViewCostBasis: true,
  },
  CASHIER: {
    canAccessPOS: true,
    canEditProductCost: false,
    canDeleteProduct: false,
    canApproveRefund: false,
    canManagePurchases: false,
    canApproveTransfers: false,
    canViewReports: false,
    canManageEmployees: false,
    canModifyDiscounts: false,
    canManageSettings: false,
    canViewCostBasis: false,
  },
  SALESPERSON: {
    canAccessPOS: true,
    canEditProductCost: false,
    canDeleteProduct: false,
    canApproveRefund: false,
    canManagePurchases: false,
    canApproveTransfers: false,
    canViewReports: false,
    canManageEmployees: false,
    canModifyDiscounts: false,
    canManageSettings: false,
    canViewCostBasis: false,
  },
  INVENTORY_STAFF: {
    canAccessPOS: false,
    canEditProductCost: false,
    canDeleteProduct: false,
    canApproveRefund: false,
    canManagePurchases: true,
    canApproveTransfers: true,
    canViewReports: false,
    canManageEmployees: false,
    canModifyDiscounts: false,
    canManageSettings: false,
    canViewCostBasis: false,
  },
  ACCOUNTANT: {
    canAccessPOS: false,
    canEditProductCost: false,
    canDeleteProduct: false,
    canApproveRefund: false,
    canManagePurchases: true,
    canApproveTransfers: false,
    canViewReports: true,
    canManageEmployees: false,
    canModifyDiscounts: false,
    canManageSettings: false,
    canViewCostBasis: true,
  },
};

export interface CartSummary {
  subtotal: number;
  itemDiscountTotal: number;
  couponDiscountTotal: number;
  autoBundleDiscountTotal: number;
  totalDiscount: number;
  taxAmount: number;
  shippingFee: number;
  grandTotal: number;
  totalCost: number;
  netSales: number;
  grossProfit: number;
  grossMarginPercent: number;
  itemCount: number;
}

interface POSContextType {
  // Navigation View State
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;

  // Branch Context
  branches: Branch[];
  activeBranchId: string;
  activeBranch: Branch;
  setActiveBranchId: (branchId: string) => void;

  // Auth & RBAC State
  employees: Employee[];
  currentUser: Employee;
  currentRole: EmployeeRole;
  permissions: RolePermissions;
  switchCurrentUser: (employeeId: string) => void;

  // Core Data Collections
  products: Product[];
  devices: DeviceItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  stockTransfers: StockTransfer[];
  customers: Customer[];
  orders: Order[];
  shipments: Shipment[];
  stockMovements: StockMovement[];
  payments: PaymentTransaction[];
  discounts: DiscountPromo[];
  promotionRules: PromotionRule[];
  warrantyTickets: WarrantyTicket[];
  repairJobs: RepairJob[];
  auditLogs: AuditLogEntry[];
  smartAlerts: SmartAlert[];
  notifications: ActivityNotification[];
  settings: StoreSettings;

  // Multi-Cart State & Calculations
  cartTabs: CartTab[];
  activeCartId: string;
  activeCart: CartTab;
  cart: CartItem[];
  cartCustomer: Customer | null;
  appliedCoupon: DiscountPromo | null;
  cartSummary: CartSummary;
  fulfillmentType: 'in_store_pos' | 'pickup' | 'delivery';
  setFulfillmentType: (type: 'in_store_pos' | 'pickup' | 'delivery') => void;

  // Cart Tab Actions
  setActiveCartId: (tabId: string) => void;
  createCartTab: () => string;
  closeCartTab: (tabId: string) => void;
  parkCart: (tabId: string, note?: string) => void;
  resumeParkedCart: (tabId: string) => void;

  // Cart Item Actions
  addToCart: (product: Product, variant: ProductVariant, quantity?: number, selectedSerial?: string) => void;
  updateCartQty: (cartItemId: string, deltaOrExact: number, isExact?: boolean) => void;
  removeFromCart: (cartItemId: string) => void;
  applyCartItemDiscount: (cartItemId: string, discount: number, discountType: 'percentage' | 'fixed') => void;
  applyCouponCode: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  setCartCustomer: (customer: Customer | null) => void;
  clearCart: () => void;

  // Order & POS Checkout Operations
  checkoutOrder: (
    paymentMethod: Order['paymentMethod'], 
    paymentDetails: PaymentDetails, 
    notes?: string
  ) => Order | null;
  refundOrder: (
    orderId: string, 
    reason: string, 
    returnToStock: boolean, 
    refundMethod?: 'cash' | 'card' | 'store_credit'
  ) => boolean;
  processExchange: (
    originalOrderId: string, 
    returnedImei: string, 
    newItemVariantId: string, 
    reason: string
  ) => Order | null;
  cancelOrder: (orderId: string, reason: string) => boolean;

  // Phone / Device IMEI Tracking
  registerDevice: (deviceData: Omit<DeviceItem, 'id' | 'history'>) => DeviceItem;
  updateDeviceStatus: (deviceId: string, newStatus: DeviceStatus, note: string) => void;
  getAvailableDevicesForVariant: (variantId: string) => DeviceItem[];

  // Purchasing & Suppliers
  createPurchaseOrder: (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'orderedDate' | 'createdBy'>) => PurchaseOrder;
  receivePurchaseOrderItems: (
    poId: string, 
    receivedItems: { poItemId: string; quantityReceived: number; imeis?: string[] }[]
  ) => boolean;
  recordSupplierPayment: (supplierId: string, amount: number) => void;

  // Multi-Branch Transfers
  requestStockTransfer: (
    fromBranchId: string, 
    toBranchId: string, 
    items: TransferItem[], 
    notes?: string
  ) => StockTransfer;
  approveStockTransfer: (transferId: string) => boolean;
  receiveStockTransfer: (transferId: string) => boolean;

  // Warranty & Repairs
  createWarrantyTicket: (ticketData: Partial<WarrantyTicket> & { imei: string; customerName: string }) => WarrantyTicket;
  updateWarrantyTicket: (ticketId: string, updates: Partial<WarrantyTicket>) => void;
  deleteWarrantyTicket: (ticketId: string) => void;
  createRepairJob: (jobData: Partial<RepairJob> & { imei: string; customerName: string }) => RepairJob;
  updateRepairJob: (jobId: string, updates: Partial<RepairJob>) => void;
  deleteRepairJob: (jobId: string) => void;
  updateRepairStatus: (
    repairId: string, 
    status: RepairJob['status'], 
    diagnosis?: string, 
    partsUsed?: RepairPart[], 
    finalCost?: number,
    notes?: string
  ) => void;

  // Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'salesCount' | 'rating' | 'totalStock' | 'variants'> & { variants: Omit<ProductVariant, 'id'>[] }) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  // Stock Adjustment
  adjustStock: (productId: string, variantId: string, qtyDelta: number, reason: string, type: StockMovementType, performedBy?: string) => void;

  // Customer Management
  addCustomer: (customerData: Omit<Customer, 'id' | 'totalSpent' | 'totalOrders' | 'loyaltyPoints' | 'tier' | 'createdAt'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;

  // Discounts & Promotions
  addDiscount: (discountData: Omit<DiscountPromo, 'id' | 'usageCount'>) => DiscountPromo;
  toggleDiscountStatus: (discountId: string) => void;
  deleteDiscount: (discountId: string) => void;

  // Shipments
  updateShipmentStatus: (shipmentId: string, status: ShipmentStatus, notes?: string) => void;
  createShipment: (order: Order, courier: Shipment['courier'], destination: string, shippingFee: number) => Shipment;

  // Audit Logs & Smart Alerts
  logAudit: (
    action: AuditLogEntry['action'],
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    entityName: string,
    description: string,
    previousValue?: string,
    newValue?: string
  ) => void;
  dismissSmartAlert: (alertId: string) => void;

  // Settings & System Data Management
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  resetDemoData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;

  // Last Completed Order (for Receipt modal)
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;

  // Global search query
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'nexustech_products_v3',
  DEVICES: 'nexustech_devices_v3',
  CUSTOMERS: 'nexustech_customers_v3',
  ORDERS: 'nexustech_orders_v3',
  SHIPMENTS: 'nexustech_shipments_v3',
  STOCK_MOVEMENTS: 'nexustech_stock_movements_v3',
  PAYMENTS: 'nexustech_payments_v3',
  DISCOUNTS: 'nexustech_discounts_v3',
  SUPPLIERS: 'nexustech_suppliers_v3',
  PURCHASE_ORDERS: 'nexustech_purchase_orders_v3',
  BRANCHES: 'nexustech_branches_v3',
  STOCK_TRANSFERS: 'nexustech_stock_transfers_v3',
  EMPLOYEES: 'nexustech_employees_v3',
  CURRENT_USER: 'nexustech_current_user_v3',
  WARRANTY_TICKETS: 'nexustech_warranty_tickets_v3',
  REPAIR_JOBS: 'nexustech_repair_jobs_v3',
  AUDIT_LOGS: 'nexustech_audit_logs_v3',
  SMART_ALERTS: 'nexustech_smart_alerts_v3',
  PROMOTION_RULES: 'nexustech_promotion_rules_v3',
  NOTIFICATIONS: 'nexustech_notifications_v3',
  SETTINGS: 'nexustech_settings_v3',
  CART_TABS: 'nexustech_cart_tabs_v3',
  ACTIVE_CART_ID: 'nexustech_active_cart_id_v3',
  ACTIVE_VIEW: 'nexustech_active_view_v3',
  ACTIVE_BRANCH_ID: 'nexustech_active_branch_id_v3',
};

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isClient, setIsClient] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('pos');
  const [globalSearch, setGlobalSearch] = useState('');

  // Primary State Collections
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [devices, setDevices] = useState<DeviceItem[]>(INITIAL_DEVICES);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeBranchId, setActiveBranchId] = useState<string>(INITIAL_BRANCHES[0].id);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(INITIAL_STOCK_TRANSFERS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [currentUser, setCurrentUser] = useState<Employee>(INITIAL_EMPLOYEES[0]);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [discounts, setDiscounts] = useState<DiscountPromo[]>(INITIAL_DISCOUNTS);
  const [promotionRules] = useState<PromotionRule[]>(INITIAL_PROMOTION_RULES);
  const [warrantyTickets, setWarrantyTickets] = useState<WarrantyTicket[]>(INITIAL_WARRANTY_TICKETS);
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>(INITIAL_REPAIR_JOBS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>(INITIAL_SMART_ALERTS);
  const [notifications, setNotifications] = useState<ActivityNotification[]>(INITIAL_NOTIFICATIONS);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  // Multi-Cart State
  const [cartTabs, setCartTabs] = useState<CartTab[]>([
    {
      id: 'cart-1',
      name: 'Cart #1',
      items: [],
      customer: null,
      fulfillmentType: 'in_store_pos',
      appliedCoupon: null,
      shippingFee: 0,
      isParked: false
    }
  ]);
  const [activeCartId, setActiveCartId] = useState<string>('cart-1');
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);

  // Active Branch Computed
  const activeBranch = useMemo(() => {
    return branches.find(b => b.id === activeBranchId) || branches[0];
  }, [branches, activeBranchId]);

  // Current Permissions Computed
  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS_MAP[currentUser.role] || ROLE_PERMISSIONS_MAP.CASHIER;
  }, [currentUser.role]);

  // Active Cart Tab Computed
  const activeCart = useMemo(() => {
    const found = cartTabs.find(t => t.id === activeCartId && !t.isParked);
    if (found) return found;
    const firstActive = cartTabs.find(t => !t.isParked);
    return firstActive || cartTabs[0];
  }, [cartTabs, activeCartId]);

  const cart = activeCart.items;
  const cartCustomer = activeCart.customer;
  const appliedCoupon = activeCart.appliedCoupon;
  const fulfillmentType = activeCart.fulfillmentType;

  // Sound generator
  const playSound = (type: 'beep' | 'success' | 'alert') => {
    if (!settings.enableSoundEffects || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.frequency.setValueAtTime(850, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.07);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.07);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.32);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {
      // AudioContext fallback
    }
  };

  // Generic Audit Logger
  const logAudit = (
    action: AuditLogEntry['action'],
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    entityName: string,
    description: string,
    previousValue?: string,
    newValue?: string
  ) => {
    const entry: AuditLogEntry = {
      id: generateId('aud'),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      entityName,
      description,
      previousValue,
      newValue
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  // Initial Load from LocalStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed) && parsed.length >= 10) setProducts(parsed);
        else setProducts(INITIAL_PRODUCTS);
      }

      const savedDevices = localStorage.getItem(STORAGE_KEYS.DEVICES);
      if (savedDevices) {
        const parsed = JSON.parse(savedDevices);
        if (Array.isArray(parsed) && parsed.length >= 10) setDevices(parsed);
        else setDevices(INITIAL_DEVICES);
      }

      const savedSuppliers = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      if (savedSuppliers) {
        const parsed = JSON.parse(savedSuppliers);
        if (Array.isArray(parsed) && parsed.length >= 5) setSuppliers(parsed);
        else setSuppliers(INITIAL_SUPPLIERS);
      }

      const savedPOs = localStorage.getItem(STORAGE_KEYS.PURCHASE_ORDERS);
      if (savedPOs) {
        const parsed = JSON.parse(savedPOs);
        if (Array.isArray(parsed) && parsed.length >= 5) setPurchaseOrders(parsed);
        else setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
      }

      const savedBranches = localStorage.getItem(STORAGE_KEYS.BRANCHES);
      if (savedBranches) {
        const parsed = JSON.parse(savedBranches);
        if (Array.isArray(parsed) && parsed.length >= 4) setBranches(parsed);
        else setBranches(INITIAL_BRANCHES);
      }

      const savedBranchId = localStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH_ID);
      if (savedBranchId) setActiveBranchId(savedBranchId);

      const savedTransfers = localStorage.getItem(STORAGE_KEYS.STOCK_TRANSFERS);
      if (savedTransfers) {
        const parsed = JSON.parse(savedTransfers);
        if (Array.isArray(parsed) && parsed.length >= 5) setStockTransfers(parsed);
        else setStockTransfers(INITIAL_STOCK_TRANSFERS);
      }

      const savedEmployees = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
      if (savedEmployees) {
        const parsed = JSON.parse(savedEmployees);
        if (Array.isArray(parsed) && parsed.length >= 5) setEmployees(parsed);
        else setEmployees(INITIAL_EMPLOYEES);
      }

      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUser) setCurrentUser(JSON.parse(savedUser));

      const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (savedCustomers) {
        const parsedCusts = JSON.parse(savedCustomers);
        if (Array.isArray(parsedCusts) && parsedCusts.length >= 8) {
          setCustomers(parsedCusts);
        } else {
          setCustomers(INITIAL_CUSTOMERS);
        }
      }

      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        if (Array.isArray(parsedOrders) && parsedOrders.length >= 10) {
          setOrders(parsedOrders);
        } else {
          setOrders(INITIAL_ORDERS);
        }
      }

      const savedShipments = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
      if (savedShipments) {
        const parsedShipments = JSON.parse(savedShipments);
        if (Array.isArray(parsedShipments) && parsedShipments.length >= 6) {
          setShipments(parsedShipments);
        } else {
          setShipments(INITIAL_SHIPMENTS);
        }
      }

      const savedMovements = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS);
      if (savedMovements) {
        const parsedMovements = JSON.parse(savedMovements);
        if (Array.isArray(parsedMovements) && parsedMovements.length >= 10) {
          setStockMovements(parsedMovements);
        } else {
          setStockMovements(INITIAL_STOCK_MOVEMENTS);
        }
      }

      const savedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (savedPayments) {
        const parsedPayments = JSON.parse(savedPayments);
        if (Array.isArray(parsedPayments) && parsedPayments.length >= 10) {
          setPayments(parsedPayments);
        } else {
          setPayments(INITIAL_PAYMENTS);
        }
      }

      const savedDiscounts = localStorage.getItem(STORAGE_KEYS.DISCOUNTS);
      if (savedDiscounts) {
        const parsedDiscounts = JSON.parse(savedDiscounts);
        if (Array.isArray(parsedDiscounts) && parsedDiscounts.length >= 5) {
          setDiscounts(parsedDiscounts);
        } else {
          setDiscounts(INITIAL_DISCOUNTS);
        }
      }

      const savedWarranties = localStorage.getItem(STORAGE_KEYS.WARRANTY_TICKETS);
      if (savedWarranties) {
        const parsedWarranties = JSON.parse(savedWarranties);
        if (Array.isArray(parsedWarranties) && parsedWarranties.length >= 10) {
          setWarrantyTickets(parsedWarranties);
        } else {
          setWarrantyTickets(INITIAL_WARRANTY_TICKETS);
        }
      }

      const savedRepairs = localStorage.getItem(STORAGE_KEYS.REPAIR_JOBS);
      if (savedRepairs) {
        const parsedRepairs = JSON.parse(savedRepairs);
        if (Array.isArray(parsedRepairs) && parsedRepairs.length >= 10) {
          setRepairJobs(parsedRepairs);
        } else {
          setRepairJobs(INITIAL_REPAIR_JOBS);
        }
      }

      const savedAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (savedAuditLogs) {
        const parsedAudit = JSON.parse(savedAuditLogs);
        if (Array.isArray(parsedAudit) && parsedAudit.length >= 10) {
          setAuditLogs(parsedAudit);
        } else {
          setAuditLogs(INITIAL_AUDIT_LOGS);
        }
      }

      const savedSmartAlerts = localStorage.getItem(STORAGE_KEYS.SMART_ALERTS);
      if (savedSmartAlerts) {
        const parsedAlerts = JSON.parse(savedSmartAlerts);
        if (Array.isArray(parsedAlerts) && parsedAlerts.length >= 3) {
          setSmartAlerts(parsedAlerts);
        } else {
          setSmartAlerts(INITIAL_SMART_ALERTS);
        }
      }

      const savedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (savedNotifs) {
        const parsedNotifs = JSON.parse(savedNotifs);
        if (Array.isArray(parsedNotifs) && parsedNotifs.length >= 3) {
          setNotifications(parsedNotifs);
        } else {
          setNotifications(INITIAL_NOTIFICATIONS);
        }
      }

      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedCartTabs = localStorage.getItem(STORAGE_KEYS.CART_TABS);
      if (savedCartTabs) setCartTabs(JSON.parse(savedCartTabs));

      const savedActiveCartId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CART_ID);
      if (savedActiveCartId) setActiveCartId(savedActiveCartId);

      const savedView = localStorage.getItem(STORAGE_KEYS.ACTIVE_VIEW);
      if (savedView) setActiveView(savedView as ActiveView);
    } catch (err) {
      console.error('Error loading data from localStorage', err);
    }
  }, []);

  // Persist to LocalStorage
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  }, [devices, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));
  }, [shipments, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(stockMovements));
  }, [stockMovements, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.DISCOUNTS, JSON.stringify(discounts));
  }, [discounts, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(purchaseOrders));
  }, [purchaseOrders, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
  }, [branches, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.STOCK_TRANSFERS, JSON.stringify(stockTransfers));
  }, [stockTransfers, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }, [employees, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.WARRANTY_TICKETS, JSON.stringify(warrantyTickets));
  }, [warrantyTickets, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.REPAIR_JOBS, JSON.stringify(repairJobs));
  }, [repairJobs, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.SMART_ALERTS, JSON.stringify(smartAlerts));
  }, [smartAlerts, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.CART_TABS, JSON.stringify(cartTabs));
  }, [cartTabs, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CART_ID, activeCartId);
  }, [activeCartId, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_VIEW, activeView);
  }, [activeView, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BRANCH_ID, activeBranchId);
  }, [activeBranchId, isClient]);

  // Compute Cart Summary live with Bundle Discount Evaluator
  const cartSummary: CartSummary = useMemo(() => {
    let subtotal = 0;
    let itemDiscountTotal = 0;
    let totalCost = 0;
    let itemCount = 0;

    cart.forEach(item => {
      const lineTotal = item.unitPrice * item.quantity;
      const lineCost = item.costPrice * item.quantity;
      subtotal += lineTotal;
      totalCost += lineCost;
      itemCount += item.quantity;

      if (item.discount > 0) {
        if (item.discountType === 'percentage') {
          itemDiscountTotal += (lineTotal * item.discount) / 100;
        } else {
          itemDiscountTotal += Math.min(lineTotal, item.discount * item.quantity);
        }
      }
    });

    const amountAfterItemDiscounts = Math.max(0, subtotal - itemDiscountTotal);

    // Auto-evaluate bundle discounts
    let autoBundleDiscountTotal = 0;
    const hasPhoneInCart = cart.some(i => {
      const p = products.find(prod => prod.id === i.productId);
      return p?.category === 'smartphones';
    });
    const hasCaseInCart = cart.some(i => {
      const p = products.find(prod => prod.id === i.productId);
      return p?.category === 'cases';
    });

    // Bundle rule: Phone + Case = 20% off case
    if (hasPhoneInCart && hasCaseInCart) {
      cart.forEach(i => {
        const p = products.find(prod => prod.id === i.productId);
        if (p?.category === 'cases') {
          autoBundleDiscountTotal += (i.unitPrice * i.quantity * 0.20);
        }
      });
    }

    let couponDiscountTotal = 0;
    if (appliedCoupon && appliedCoupon.isActive) {
      const eligibleSpend = amountAfterItemDiscounts - autoBundleDiscountTotal;
      if (eligibleSpend >= appliedCoupon.minOrderAmount) {
        if (appliedCoupon.type === 'percentage') {
          couponDiscountTotal = (eligibleSpend * appliedCoupon.value) / 100;
        } else {
          couponDiscountTotal = Math.min(eligibleSpend, appliedCoupon.value);
        }
      }
    }

    const totalDiscount = itemDiscountTotal + autoBundleDiscountTotal + couponDiscountTotal;
    const shippingFee = activeCart.fulfillmentType === 'delivery' ? 15.00 : 0;
    const taxableAmount = Math.max(0, subtotal - totalDiscount);
    const taxAmount = (taxableAmount * settings.taxRate) / 100;
    const grandTotal = taxableAmount + taxAmount + shippingFee;
    
    // Profit and COGS metrics
    const netSales = Math.max(0, grandTotal - taxAmount - shippingFee);
    const grossProfit = netSales - totalCost;
    const grossMarginPercent = netSales > 0 ? (grossProfit / netSales) * 100 : 0;

    return {
      subtotal,
      itemDiscountTotal,
      couponDiscountTotal,
      autoBundleDiscountTotal,
      totalDiscount,
      taxAmount,
      shippingFee,
      grandTotal,
      totalCost,
      netSales,
      grossProfit,
      grossMarginPercent,
      itemCount
    };
  }, [cart, appliedCoupon, settings.taxRate, activeCart.fulfillmentType, products]);

  // Cart Tab Switcher & Management
  const createCartTab = (): string => {
    const newId = `cart-${Date.now()}`;
    const nextTabNumber = cartTabs.length + 1;
    const newTab: CartTab = {
      id: newId,
      name: `Cart #${nextTabNumber}`,
      items: [],
      customer: null,
      fulfillmentType: 'in_store_pos',
      appliedCoupon: null,
      shippingFee: 0,
      isParked: false
    };
    setCartTabs(prev => [...prev, newTab]);
    setActiveCartId(newId);
    toast.info(`Opened new register cart #${nextTabNumber}`);
    playSound('beep');
    return newId;
  };

  const closeCartTab = (tabId: string) => {
    if (cartTabs.length <= 1) {
      // Clear instead of remove if only 1 tab
      clearCart();
      return;
    }
    const remaining = cartTabs.filter(t => t.id !== tabId);
    setCartTabs(remaining);
    if (activeCartId === tabId) {
      setActiveCartId(remaining[0].id);
    }
    toast.info('Cart closed');
  };

  const parkCart = (tabId: string, note?: string) => {
    const target = cartTabs.find(t => t.id === tabId);
    if (!target || target.items.length === 0) {
      toast.warning('Cannot park an empty cart');
      return;
    }

    setCartTabs(prev => prev.map(t => {
      if (t.id === tabId) {
        return {
          ...t,
          isParked: true,
          parkedAt: new Date().toISOString(),
          parkNote: note || `Parked for ${t.customer?.name || 'Walk-in customer'}`
        };
      }
      return t;
    }));

    // Find next unparked tab or create new
    const nextActive = cartTabs.find(t => t.id !== tabId && !t.isParked);
    if (nextActive) {
      setActiveCartId(nextActive.id);
    } else {
      createCartTab();
    }
    toast.success(`Cart parked on hold (${target.items.length} items)`);
    playSound('beep');
  };

  const resumeParkedCart = (tabId: string) => {
    setCartTabs(prev => prev.map(t => {
      if (t.id === tabId) {
        return { ...t, isParked: false };
      }
      return t;
    }));
    setActiveCartId(tabId);
    toast.success('Resumed parked cart');
    playSound('beep');
  };

  // Mutate current active cart tab items
  const updateCurrentTab = (updater: (tab: CartTab) => CartTab) => {
    setCartTabs(prev => prev.map(t => {
      if (t.id === activeCart.id) {
        return updater(t);
      }
      return t;
    }));
  };

  // Cart Operations
  const addToCart = (
    product: Product, 
    variant: ProductVariant, 
    quantity: number = 1,
    selectedSerial?: string
  ) => {
    if (variant.stock <= 0) {
      toast.error('Item is out of stock!');
      playSound('alert');
      return;
    }

    updateCurrentTab(tab => {
      const existingIndex = tab.items.findIndex(item => item.variantId === variant.id);

      if (existingIndex > -1) {
        const existingItem = tab.items[existingIndex];
        const newQty = existingItem.quantity + quantity;

        if (newQty > variant.stock) {
          toast.warning(`Only ${variant.stock} units available in stock!`);
          return tab;
        }

        const updated = [...tab.items];
        updated[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          selectedSerial: selectedSerial || existingItem.selectedSerial
        };
        playSound('beep');
        toast.success(`Added ${product.name} (${variant.color})`);
        return { ...tab, items: updated };
      } else {
        const variantSummary = [
          variant.color,
          variant.storage,
          variant.condition !== 'Brand New' ? variant.condition : null
        ].filter(Boolean).join(' • ');

        // Auto-assign available in-stock device IMEI if applicable
        const availableDevice = devices.find(d => d.variantId === variant.id && d.status === 'IN_STOCK' && d.branchId === activeBranchId);

        const newItem: CartItem = {
          id: `${variant.id}-${Date.now()}`,
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          brand: product.brand,
          variantSummary: variantSummary || 'Standard Edition',
          sku: variant.sku,
          image: variant.image || product.image,
          unitPrice: variant.price,
          costPrice: variant.costPrice,
          quantity: quantity,
          discount: 0,
          discountType: 'percentage',
          selectedSerial: selectedSerial || availableDevice?.imei1 || (variant.serialNumbers && variant.serialNumbers[0]),
          deviceId: availableDevice?.id
        };
        playSound('beep');
        toast.success(`Added ${product.name} to cart`);
        return { ...tab, items: [...tab.items, newItem] };
      }
    });
  };

  const updateCartQty = (cartItemId: string, deltaOrExact: number, isExact: boolean = false) => {
    updateCurrentTab(tab => {
      const updated = tab.items.map(item => {
        if (item.id !== cartItemId) return item;

        const product = products.find(p => p.id === item.productId);
        const variant = product?.variants.find(v => v.id === item.variantId);
        const maxStock = variant ? variant.stock : 99;

        let newQty = isExact ? deltaOrExact : item.quantity + deltaOrExact;
        if (newQty <= 0) return null;
        if (newQty > maxStock) {
          toast.warning(`Maximum available stock is ${maxStock}`);
          newQty = maxStock;
        }
        return { ...item, quantity: newQty };
      }).filter(Boolean) as CartItem[];

      return { ...tab, items: updated };
    });
    playSound('beep');
  };

  const removeFromCart = (cartItemId: string) => {
    updateCurrentTab(tab => ({
      ...tab,
      items: tab.items.filter(item => item.id !== cartItemId)
    }));
    toast.info('Item removed from cart');
    playSound('beep');
  };

  const applyCartItemDiscount = (cartItemId: string, discount: number, discountType: 'percentage' | 'fixed') => {
    updateCurrentTab(tab => ({
      ...tab,
      items: tab.items.map(item => {
        if (item.id === cartItemId) {
          return { ...item, discount: Math.max(0, discount), discountType };
        }
        return item;
      })
    }));
    toast.success('Item discount updated');
  };

  const applyCouponCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = discounts.find(d => d.code.toUpperCase() === cleanCode && d.isActive);

    if (!found) {
      toast.error('Invalid or expired coupon code');
      playSound('alert');
      return { success: false, message: 'Invalid or inactive promo code' };
    }

    if (cartSummary.subtotal < found.minOrderAmount) {
      toast.error(`Minimum order amount of $${found.minOrderAmount} required for ${found.code}`);
      playSound('alert');
      return { success: false, message: `Min spend $${found.minOrderAmount} required` };
    }

    updateCurrentTab(tab => ({ ...tab, appliedCoupon: found }));
    toast.success(`Coupon ${found.code} applied: ${found.type === 'percentage' ? `${found.value}% off` : `$${found.value} off`}!`);
    playSound('success');
    return { success: true, message: 'Coupon applied successfully' };
  };

  const removeCoupon = () => {
    updateCurrentTab(tab => ({ ...tab, appliedCoupon: null }));
    toast.info('Coupon removed');
  };

  const setCartCustomer = (customer: Customer | null) => {
    updateCurrentTab(tab => ({ ...tab, customer }));
    if (customer) {
      toast.success(`Attached customer: ${customer.name}`);
    }
  };

  const setFulfillmentType = (type: 'in_store_pos' | 'pickup' | 'delivery') => {
    updateCurrentTab(tab => ({ ...tab, fulfillmentType: type }));
  };

  const clearCart = () => {
    updateCurrentTab(tab => ({
      ...tab,
      items: [],
      customer: null,
      appliedCoupon: null,
      shippingFee: 0
    }));
  };

  // Atomic POS Checkout with Complete Multi-Role & Audit Pipeline
  const checkoutOrder = (
    paymentMethod: Order['paymentMethod'], 
    paymentDetails: PaymentDetails, 
    notes?: string
  ): Order | null => {
    if (cart.length === 0) {
      toast.error('Cart is empty!');
      return null;
    }

    const orderId = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptNum = `RCP-${orderId.split('-')[2]}`;
    const timestamp = new Date().toISOString();

    // 1. Create order entity
    const newOrder: Order = {
      id: orderId,
      receiptNumber: receiptNum,
      customer: cartCustomer,
      cashierName: currentUser.name,
      salespersonId: currentUser.id,
      salespersonName: currentUser.name,
      branchId: activeBranch.id,
      branchName: activeBranch.name,
      items: [...cart],
      subtotal: cartSummary.subtotal,
      discountTotal: cartSummary.totalDiscount,
      appliedCoupon: appliedCoupon?.code,
      couponDiscountValue: cartSummary.couponDiscountTotal,
      shippingFee: cartSummary.shippingFee,
      taxRate: settings.taxRate,
      taxTotal: cartSummary.taxAmount,
      grandTotal: cartSummary.grandTotal,
      costTotal: cartSummary.totalCost,
      profitTotal: cartSummary.grossProfit,
      paymentStatus: 'paid',
      paymentMethod: paymentMethod,
      paymentDetails: {
        ...paymentDetails,
        transactionRef: paymentDetails.transactionRef || generateId('TXN-REF')
      },
      orderStatus: 'completed',
      fulfillmentType: fulfillmentType,
      notes: notes,
      createdAt: timestamp
    };

    // 2. Atomically update inventory & mark individual Device IMEIs as SOLD
    const newMovements: StockMovement[] = [];
    const lowStockAlerts: string[] = [];

    const updatedProducts = products.map(product => {
      let productModified = false;
      const updatedVariants = product.variants.map(variant => {
        const cartMatch = cart.find(c => c.variantId === variant.id);
        if (cartMatch) {
          productModified = true;
          const newStock = Math.max(0, variant.stock - cartMatch.quantity);

          newMovements.push({
            id: generateId('MOV'),
            productId: product.id,
            productName: product.name,
            variantId: variant.id,
            variantSku: variant.sku,
            type: 'sale',
            quantity: -cartMatch.quantity,
            previousStock: variant.stock,
            newStock: newStock,
            reason: `POS Sale (Receipt #${receiptNum})`,
            performedBy: currentUser.name,
            branchId: activeBranch.id,
            branchName: activeBranch.name,
            referenceId: orderId,
            createdAt: timestamp
          });

          if (newStock <= variant.lowStockThreshold) {
            lowStockAlerts.push(`${product.name} (${variant.color}) only ${newStock} units left at ${activeBranch.name}!`);
          }

          return {
            ...variant,
            stock: newStock,
            serialNumbers: variant.serialNumbers?.filter(s => s !== cartMatch.selectedSerial)
          };
        }
        return variant;
      });

      if (productModified) {
        const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
        return {
          ...product,
          variants: updatedVariants,
          totalStock: totalStock,
          salesCount: product.salesCount + cart.filter(c => c.productId === product.id).reduce((s, i) => s + i.quantity, 0)
        };
      }
      return product;
    });

    // 3. Mark Device records with IMEIs as SOLD and link order & customer
    const updatedDevices = devices.map(device => {
      const matchedCartItem = cart.find(i => 
        (i.selectedSerial && (i.selectedSerial === device.imei1 || i.selectedSerial === device.serialNumber)) ||
        (i.deviceId === device.id)
      );

      if (matchedCartItem && device.status === 'IN_STOCK') {
        const newTimelineEvent: DeviceTimelineEvent = {
          id: generateId('tl'),
          timestamp,
          type: 'SOLD',
          fromStatus: 'IN_STOCK',
          toStatus: 'SOLD',
          note: `Sold via POS Receipt #${receiptNum} to ${cartCustomer?.name || 'Walk-in Guest'}`,
          performedBy: currentUser.name,
          referenceId: orderId
        };

        return {
          ...device,
          status: 'SOLD' as DeviceStatus,
          soldDate: timestamp,
          orderId: orderId,
          customerId: cartCustomer?.id,
          customerName: cartCustomer?.name || 'Walk-in Guest',
          warrantyStart: timestamp,
          warrantyExpiry: new Date(Date.now() + (device.warrantyMonths || 12) * 30 * 24 * 60 * 60 * 1000).toISOString(),
          history: [newTimelineEvent, ...device.history]
        };
      }
      return device;
    });

    // 4. Record Payment Transactions (supports split payments)
    const newPaymentTxns: PaymentTransaction[] = [];
    if (paymentMethod === 'split' && paymentDetails.splitBreakdown && paymentDetails.splitBreakdown.length > 0) {
      paymentDetails.splitBreakdown.forEach((split, idx) => {
        newPaymentTxns.push({
          id: generateId(`TXN-SPLIT-${idx}`),
          orderId: orderId,
          receiptNumber: receiptNum,
          customerName: cartCustomer ? cartCustomer.name : 'Walk-in Guest',
          amount: split.amount,
          method: split.method,
          type: 'payment',
          status: 'completed',
          reference: split.reference || `SPLIT-${split.method.toUpperCase()}`,
          cashierName: currentUser.name,
          createdAt: timestamp
        });
      });
    } else {
      newPaymentTxns.push({
        id: generateId('TXN'),
        orderId: orderId,
        receiptNumber: receiptNum,
        customerName: cartCustomer ? cartCustomer.name : 'Walk-in Guest',
        amount: cartSummary.grandTotal,
        method: paymentMethod,
        type: 'payment',
        status: 'completed',
        reference: paymentDetails.authCode || paymentDetails.transactionRef || generateId('REF'),
        cashierName: currentUser.name,
        createdAt: timestamp
      });
    }

    // 5. Update Customer Metrics & CRM
    let updatedCustomers = [...customers];
    if (cartCustomer) {
      const earnedPoints = Math.floor(cartSummary.grandTotal / 10);
      updatedCustomers = customers.map(c => {
        if (c.id === cartCustomer.id) {
          const newTotalSpent = c.totalSpent + cartSummary.grandTotal;
          const newTotalOrders = c.totalOrders + 1;
          const newLoyaltyPoints = c.loyaltyPoints + earnedPoints;
          let tier: Customer['tier'] = 'Bronze';
          if (newTotalSpent >= 5000) tier = 'VIP';
          else if (newTotalSpent >= 2000) tier = 'Gold';
          else if (newTotalSpent >= 1000) tier = 'Silver';

          return {
            ...c,
            totalSpent: newTotalSpent,
            totalOrders: newTotalOrders,
            loyaltyPoints: newLoyaltyPoints,
            tier: tier,
            lastPurchaseDate: timestamp
          };
        }
        return c;
      });
    }

    // 6. Update Employee Sales achieved
    const updatedEmployees = employees.map(emp => {
      if (emp.id === currentUser.id) {
        return {
          ...emp,
          salesAchieved: emp.salesAchieved + cartSummary.grandTotal
        };
      }
      return emp;
    });

    // 7. Auto-create Warranty Tickets for serialized phone items
    const newWarrantyTickets: WarrantyTicket[] = [];
    cart.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      if (prod?.category === 'smartphones' && item.selectedSerial) {
        newWarrantyTickets.push({
          id: generateId('WR'),
          ticketNumber: `WAR-${Math.floor(1000 + Math.random() * 9000)}`,
          deviceId: item.deviceId,
          imei: item.selectedSerial,
          productName: item.productName,
          brand: item.brand,
          customerId: cartCustomer?.id,
          customerName: cartCustomer?.name || 'Walk-in Customer',
          customerPhone: cartCustomer?.phone || '+1 (555) 000-0000',
          orderId: orderId,
          status: 'ACTIVE',
          startDate: timestamp,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          warrantyMonths: 12
        });
      }
    });

    // 8. If Delivery fulfillment, create shipment automatically
    if (fulfillmentType === 'delivery') {
      const newShipment: Shipment = {
        id: generateId('SHP'),
        orderId: orderId,
        receiptNumber: receiptNum,
        customerName: cartCustomer ? cartCustomer.name : 'Valued Customer',
        customerPhone: cartCustomer ? cartCustomer.phone : '+1 (555) 000-0000',
        destination: cartCustomer 
          ? `${cartCustomer.address.street}, ${cartCustomer.address.city}, ${cartCustomer.address.state} ${cartCustomer.address.zip}`
          : 'Customer Shipping Address',
        courier: 'FedEx Express',
        trackingNumber: `FDX-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        status: 'pending',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        itemsSummary: cart.map(i => `${i.quantity}x ${i.productName}`).join(', '),
        shippingFee: cartSummary.shippingFee,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      setShipments(prev => [newShipment, ...prev]);
      newOrder.shipmentId = newShipment.id;
    }

    // 9. Update Discount Promo Usage if coupon was applied
    if (appliedCoupon) {
      setDiscounts(prev => prev.map(d => {
        if (d.id === appliedCoupon.id) {
          return { ...d, usageCount: d.usageCount + 1 };
        }
        return d;
      }));
    }

    // 10. Audit Log & Notifications
    logAudit(
      'ORDER_CREATE',
      'ORDER',
      orderId,
      `Receipt #${receiptNum}`,
      `Completed POS transaction for $${cartSummary.grandTotal.toFixed(2)} (${cart.length} items)`,
      undefined,
      `$${cartSummary.grandTotal.toFixed(2)}`
    );

    const newNotifications: ActivityNotification[] = [
      {
        id: generateId('NOTIF'),
        type: 'sale',
        title: 'New POS Sale Completed',
        message: `Order #${orderId} (${receiptNum}) placed for $${cartSummary.grandTotal.toFixed(2)} at ${activeBranch.name}`,
        read: false,
        createdAt: timestamp
      }
    ];

    lowStockAlerts.forEach(alertMsg => {
      newNotifications.push({
        id: generateId('NOTIF'),
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: alertMsg,
        read: false,
        createdAt: timestamp
      });
    });

    // Commit all states atomically
    setProducts(updatedProducts);
    setDevices(updatedDevices);
    setStockMovements(prev => [...newMovements, ...prev]);
    setPayments(prev => [...newPaymentTxns, ...prev]);
    setCustomers(updatedCustomers);
    setEmployees(updatedEmployees);
    if (newWarrantyTickets.length > 0) {
      setWarrantyTickets(prev => [...newWarrantyTickets, ...prev]);
    }
    setOrders(prev => [newOrder, ...prev]);
    setNotifications(prev => [...newNotifications, ...prev]);
    setLastCompletedOrder(newOrder);

    // Clear active cart tab
    clearCart();
    playSound('success');
    toast.success(`Order #${orderId} successfully completed!`);

    return newOrder;
  };

  // Process Return & Refund
  const refundOrder = (
    orderId: string, 
    reason: string, 
    returnToStock: boolean,
    refundMethod: 'cash' | 'card' | 'store_credit' = 'card'
  ): boolean => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) {
      toast.error('Order not found');
      return false;
    }
    if (targetOrder.paymentStatus === 'refunded') {
      toast.error('Order has already been refunded');
      return false;
    }

    const timestamp = new Date().toISOString();

    // Restock items if Grade A
    let updatedProducts = [...products];
    const newMovements: StockMovement[] = [];

    if (returnToStock) {
      updatedProducts = products.map(product => {
        let productModified = false;
        const updatedVariants = product.variants.map(variant => {
          const matchedItem = targetOrder.items.find(i => i.variantId === variant.id);
          if (matchedItem) {
            productModified = true;
            const newStock = variant.stock + matchedItem.quantity;

            newMovements.push({
              id: generateId('MOV'),
              productId: product.id,
              productName: product.name,
              variantId: variant.id,
              variantSku: variant.sku,
              type: 'refund_return',
              quantity: matchedItem.quantity,
              previousStock: variant.stock,
              newStock: newStock,
              reason: `Refund return (Order #${targetOrder.id}): ${reason}`,
              performedBy: currentUser.name,
              branchId: activeBranch.id,
              branchName: activeBranch.name,
              referenceId: targetOrder.id,
              createdAt: timestamp
            });

            return { ...variant, stock: newStock };
          }
          return variant;
        });

        if (productModified) {
          const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
          return { ...product, variants: updatedVariants, totalStock };
        }
        return product;
      });
      setProducts(updatedProducts);
      setStockMovements(prev => [...newMovements, ...prev]);
    }

    // Update Device status for any phone IMEIs involved
    const updatedDevices = devices.map(device => {
      if (device.orderId === targetOrder.id) {
        const newStatus: DeviceStatus = returnToStock ? 'IN_STOCK' : 'DAMAGED';
        const timelineEvent: DeviceTimelineEvent = {
          id: generateId('tl'),
          timestamp,
          type: 'RETURNED',
          fromStatus: 'SOLD',
          toStatus: newStatus,
          note: `Device returned on refund #${targetOrder.receiptNumber}. Reason: ${reason}`,
          performedBy: currentUser.name,
          referenceId: targetOrder.id
        };
        return {
          ...device,
          status: newStatus,
          history: [timelineEvent, ...device.history]
        };
      }
      return device;
    });
    setDevices(updatedDevices);

    // Record Refund Payment Transaction
    const refundTxn: PaymentTransaction = {
      id: generateId('TXN-REF'),
      orderId: targetOrder.id,
      receiptNumber: targetOrder.receiptNumber,
      customerName: targetOrder.customer ? targetOrder.customer.name : 'Walk-in Guest',
      amount: targetOrder.grandTotal,
      method: refundMethod === 'cash' ? 'cash' : refundMethod === 'card' ? 'card' : 'mobile_digital',
      type: 'refund',
      status: 'refunded',
      reference: `REFUND-FOR-${targetOrder.id}`,
      cashierName: currentUser.name,
      notes: reason,
      createdAt: timestamp
    };
    setPayments(prev => [refundTxn, ...prev]);

    // Update Order entity
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentStatus: 'refunded',
          orderStatus: 'refunded',
          refundedAt: timestamp,
          refundReason: reason,
          refundAmount: targetOrder.grandTotal
        };
      }
      return o;
    }));

    // Revert Customer Metrics
    if (targetOrder.customer) {
      setCustomers(prev => prev.map(c => {
        if (c.id === targetOrder.customer?.id) {
          return {
            ...c,
            totalSpent: Math.max(0, c.totalSpent - targetOrder.grandTotal),
            loyaltyPoints: Math.max(0, c.loyaltyPoints - Math.floor(targetOrder.grandTotal / 10))
          };
        }
        return c;
      }));
    }

    logAudit(
      'REFUND_PROCESSED',
      'ORDER',
      targetOrder.id,
      targetOrder.receiptNumber,
      `Refunded $${targetOrder.grandTotal.toFixed(2)}. Reason: ${reason}`,
      'Status: Paid',
      'Status: Refunded'
    );

    toast.success(`Order #${orderId} refunded successfully ($${targetOrder.grandTotal.toFixed(2)}).`);
    return true;
  };

  // Process Device Exchange Workflow
  const processExchange = (
    originalOrderId: string, 
    returnedImei: string, 
    newItemVariantId: string, 
    reason: string
  ): Order | null => {
    const originalOrder = orders.find(o => o.id === originalOrderId);
    if (!originalOrder) {
      toast.error('Original order not found');
      return null;
    }

    const replacementProduct = products.find(p => p.variants.some(v => v.id === newItemVariantId));
    const replacementVariant = replacementProduct?.variants.find(v => v.id === newItemVariantId);
    if (!replacementProduct || !replacementVariant || replacementVariant.stock <= 0) {
      toast.error('Replacement variant is out of stock!');
      return null;
    }

    const timestamp = new Date().toISOString();
    const exchangeOrderId = `EXC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Mark returned IMEI as RETURNED or REPAIR
    const updatedDevices = devices.map(d => {
      if (d.imei1 === returnedImei || d.serialNumber === returnedImei) {
        const ev: DeviceTimelineEvent = {
          id: generateId('tl'),
          timestamp,
          type: 'RETURNED',
          fromStatus: 'SOLD',
          toStatus: 'RETURNED',
          note: `Defective unit exchanged. Reason: ${reason}`,
          performedBy: currentUser.name,
          referenceId: exchangeOrderId
        };
        return { ...d, status: 'RETURNED' as DeviceStatus, history: [ev, ...d.history] };
      }
      return d;
    });
    setDevices(updatedDevices);

    // 2. Create exchange order
    const exchangeItem: CartItem = {
      id: `exc-item-${Date.now()}`,
      productId: replacementProduct.id,
      variantId: replacementVariant.id,
      productName: replacementProduct.name,
      brand: replacementProduct.brand,
      variantSummary: `${replacementVariant.color} • ${replacementVariant.storage || ''}`,
      sku: replacementVariant.sku,
      image: replacementVariant.image || replacementProduct.image,
      unitPrice: 0, // Direct 1-to-1 warranty exchange
      costPrice: replacementVariant.costPrice,
      quantity: 1,
      discount: 0,
      discountType: 'fixed'
    };

    const newExchangeOrder: Order = {
      id: exchangeOrderId,
      receiptNumber: `RCP-EXC-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: originalOrder.customer,
      cashierName: currentUser.name,
      salespersonId: currentUser.id,
      salespersonName: currentUser.name,
      branchId: activeBranch.id,
      branchName: activeBranch.name,
      items: [exchangeItem],
      subtotal: 0,
      discountTotal: 0,
      shippingFee: 0,
      taxRate: settings.taxRate,
      taxTotal: 0,
      grandTotal: 0,
      costTotal: replacementVariant.costPrice,
      profitTotal: -replacementVariant.costPrice,
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      paymentDetails: { provider: 'Cash' },
      orderStatus: 'exchanged',
      fulfillmentType: 'in_store_pos',
      notes: `Warranty Exchange for Order #${originalOrderId}. Defective IMEI: ${returnedImei}`,
      createdAt: timestamp,
      exchangedOrderId: originalOrderId
    };

    // Deduct stock for replacement unit
    setProducts(prev => prev.map(p => {
      if (p.id === replacementProduct.id) {
        const vUpdated = p.variants.map(v => v.id === replacementVariant.id ? { ...v, stock: Math.max(0, v.stock - 1) } : v);
        return { ...p, variants: vUpdated, totalStock: vUpdated.reduce((sum, v) => sum + v.stock, 0) };
      }
      return p;
    }));

    setOrders(prev => [newExchangeOrder, ...prev]);

    logAudit(
      'EXCHANGE_PROCESSED',
      'ORDER',
      exchangeOrderId,
      newExchangeOrder.receiptNumber,
      `Exchanged defective IMEI ${returnedImei} for ${replacementProduct.name} (${replacementVariant.color})`
    );

    toast.success(`Exchange completed. Replacement ${replacementProduct.name} issued.`);
    return newExchangeOrder;
  };

  // Cancel Order
  const cancelOrder = (orderId: string, reason: string): boolean => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return false;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, orderStatus: 'cancelled', notes: `Cancelled: ${reason}` };
      }
      return o;
    }));

    logAudit('ORDER_CREATE', 'ORDER', orderId, targetOrder.receiptNumber, `Order cancelled: ${reason}`);
    toast.info(`Order #${orderId} marked as cancelled`);
    return true;
  };

  // Phone / Device IMEI Tracking Methods
  const registerDevice = (deviceData: Omit<DeviceItem, 'id' | 'history'>): DeviceItem => {
    const newDevice: DeviceItem = {
      ...deviceData,
      id: generateId('dev'),
      history: [
        {
          id: generateId('tl'),
          timestamp: new Date().toISOString(),
          type: 'PURCHASED',
          toStatus: 'IN_STOCK',
          note: `Device registered into branch ${deviceData.branchName} storage inventory.`,
          performedBy: currentUser.name
        }
      ]
    };

    setDevices(prev => [newDevice, ...prev]);
    logAudit('PRODUCT_CREATE', 'DEVICE', newDevice.id, `${newDevice.productName} (${newDevice.imei1})`, `Registered new serialized phone IMEI`);
    toast.success(`Device ${newDevice.imei1} registered to stock!`);
    return newDevice;
  };

  const updateDeviceStatus = (deviceId: string, newStatus: DeviceStatus, note: string) => {
    const timestamp = new Date().toISOString();
    setDevices(prev => prev.map(d => {
      if (d.id === deviceId) {
        const ev: DeviceTimelineEvent = {
          id: generateId('tl'),
          timestamp,
          type: 'STATUS_CHANGE',
          fromStatus: d.status,
          toStatus: newStatus,
          note: note || `Status transitioned to ${newStatus}`,
          performedBy: currentUser.name
        };
        return {
          ...d,
          status: newStatus,
          history: [ev, ...d.history]
        };
      }
      return d;
    }));

    logAudit('IMEI_STATUS_CHANGE', 'DEVICE', deviceId, `Device #${deviceId}`, `Status changed to ${newStatus}: ${note}`);
    toast.info(`Device status updated to ${newStatus}`);
  };

  const getAvailableDevicesForVariant = (variantId: string): DeviceItem[] => {
    return devices.filter(d => d.variantId === variantId && d.status === 'IN_STOCK' && d.branchId === activeBranchId);
  };

  // Purchasing & Suppliers
  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'orderedDate' | 'createdBy'>): PurchaseOrder => {
    const poNumber = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      poNumber,
      orderedDate: new Date().toISOString(),
      createdBy: currentUser.name
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    // Update supplier debt if unpaid
    if (poData.paymentStatus !== 'PAID') {
      setSuppliers(prev => prev.map(s => {
        if (s.id === poData.supplierId) {
          const debtAddition = poData.totalCost - (poData.paidAmount || 0);
          return { ...s, balanceDebt: s.balanceDebt + debtAddition, totalPurchased: s.totalPurchased + poData.totalCost };
        }
        return s;
      }));
    }

    logAudit('PO_CREATED', 'PURCHASE_ORDER', newPO.id, newPO.poNumber, `Created PO for $${newPO.totalCost.toFixed(2)} to ${newPO.supplierName}`);
    toast.success(`Purchase Order ${newPO.poNumber} created successfully!`);
    return newPO;
  };

  const receivePurchaseOrderItems = (
    poId: string, 
    receivedItems: { poItemId: string; quantityReceived: number; imeis?: string[] }[]
  ): boolean => {
    const targetPO = purchaseOrders.find(p => p.id === poId);
    if (!targetPO) {
      toast.error('PO not found');
      return false;
    }

    const timestamp = new Date().toISOString();
    const newDevices: DeviceItem[] = [];
    const newMovements: StockMovement[] = [];

    // Update PO items
    const updatedItems = targetPO.items.map(item => {
      const match = receivedItems.find(r => r.poItemId === item.id);
      if (match) {
        const newQtyReceived = Math.min(item.quantityOrdered, item.quantityReceived + match.quantityReceived);
        
        // If IMEIs provided, generate device records
        if (match.imeis && match.imeis.length > 0) {
          match.imeis.forEach((imei, idx) => {
            const prod = products.find(p => p.id === item.productId);
            const variant = prod?.variants.find(v => v.id === item.variantId);
            newDevices.push({
              id: generateId('dev'),
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              brand: prod?.brand || 'Apple',
              sku: variant?.sku || 'SKU-TEMP',
              imei1: imei,
              serialNumber: `SN-${imei.slice(-6)}`,
              storage: variant?.storage,
              ram: variant?.ram,
              color: variant?.color || 'Standard',
              condition: variant?.condition || 'Brand New',
              purchaseCost: item.unitCost,
              sellingPrice: variant?.price || (item.unitCost * 1.3),
              supplierId: targetPO.supplierId,
              supplierName: targetPO.supplierName,
              branchId: targetPO.branchId,
              branchName: targetPO.branchName,
              status: 'IN_STOCK',
              warrantyMonths: 12,
              history: [
                {
                  id: generateId('tl'),
                  timestamp,
                  type: 'PURCHASED',
                  toStatus: 'IN_STOCK',
                  note: `Received from PO #${targetPO.poNumber} (${targetPO.supplierName})`,
                  performedBy: currentUser.name,
                  referenceId: targetPO.id
                }
              ]
            });
          });
        }

        // Add stock movement
        newMovements.push({
          id: generateId('MOV'),
          productId: item.productId,
          productName: item.productName,
          variantId: item.variantId,
          variantSku: 'SKU-RCV',
          type: 'purchase_receive',
          quantity: match.quantityReceived,
          previousStock: 0,
          newStock: match.quantityReceived,
          reason: `Goods Received PO #${targetPO.poNumber}`,
          performedBy: currentUser.name,
          branchId: targetPO.branchId,
          branchName: targetPO.branchName,
          referenceId: targetPO.id,
          createdAt: timestamp
        });

        return {
          ...item,
          quantityReceived: newQtyReceived,
          receivedImeis: [...(item.receivedImeis || []), ...(match.imeis || [])]
        };
      }
      return item;
    });

    // Check if fully received
    const isFullyReceived = updatedItems.every(i => i.quantityReceived >= i.quantityOrdered);

    setPurchaseOrders(prev => prev.map(p => {
      if (p.id === poId) {
        return {
          ...p,
          items: updatedItems,
          status: isFullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
          receivedDate: timestamp
        };
      }
      return p;
    }));

    if (newDevices.length > 0) {
      setDevices(prev => [...newDevices, ...prev]);
    }

    // Update product stock counts
    setProducts(prev => prev.map(product => {
      let productModified = false;
      const updatedVariants = product.variants.map(variant => {
        const receivedItem = receivedItems.find(r => {
          const poItem = targetPO.items.find(pi => pi.id === r.poItemId);
          return poItem?.variantId === variant.id;
        });

        if (receivedItem) {
          productModified = true;
          return {
            ...variant,
            stock: variant.stock + receivedItem.quantityReceived
          };
        }
        return variant;
      });

      if (productModified) {
        return {
          ...product,
          variants: updatedVariants,
          totalStock: updatedVariants.reduce((s, v) => s + v.stock, 0)
        };
      }
      return product;
    }));

    setStockMovements(prev => [...newMovements, ...prev]);

    logAudit('PO_RECEIVED', 'PURCHASE_ORDER', targetPO.id, targetPO.poNumber, `Received goods for PO #${targetPO.poNumber} into inventory`);
    toast.success(`Received items from PO #${targetPO.poNumber} successfully!`);
    return true;
  };

  const recordSupplierPayment = (supplierId: string, amount: number) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return { ...s, balanceDebt: Math.max(0, s.balanceDebt - amount) };
      }
      return s;
    }));
    toast.success(`Recorded payment of $${amount.toFixed(2)} to supplier.`);
  };

  // Multi-Branch Transfers
  const requestStockTransfer = (
    fromBranchId: string, 
    toBranchId: string, 
    items: TransferItem[], 
    notes?: string
  ): StockTransfer => {
    const fromBranch = branches.find(b => b.id === fromBranchId) || branches[0];
    const toBranch = branches.find(b => b.id === toBranchId) || branches[1];

    const newTransfer: StockTransfer = {
      id: generateId('TRF'),
      transferNumber: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      fromBranchId,
      fromBranchName: fromBranch.name,
      toBranchId,
      toBranchName: toBranch.name,
      status: 'PENDING_APPROVAL',
      items,
      requestedBy: currentUser.name,
      requestDate: new Date().toISOString(),
      notes
    };

    setStockTransfers(prev => [newTransfer, ...prev]);
    logAudit('TRANSFER_REQUEST', 'TRANSFER', newTransfer.id, newTransfer.transferNumber, `Requested transfer from ${fromBranch.name} to ${toBranch.name}`);
    toast.success(`Stock Transfer ${newTransfer.transferNumber} submitted for approval.`);
    return newTransfer;
  };

  const approveStockTransfer = (transferId: string): boolean => {
    const timestamp = new Date().toISOString();
    setStockTransfers(prev => prev.map(t => {
      if (t.id === transferId) {
        return {
          ...t,
          status: 'IN_TRANSIT',
          approvedBy: currentUser.name,
          shipDate: timestamp,
          trackingNumber: `INT-TRF-${Math.floor(1000 + Math.random() * 9000)}`
        };
      }
      return t;
    }));

    logAudit('TRANSFER_APPROVED', 'TRANSFER', transferId, `Transfer #${transferId}`, `Approved cross-branch transfer; dispatched in-transit`);
    toast.success(`Transfer approved and marked IN_TRANSIT.`);
    return true;
  };

  const receiveStockTransfer = (transferId: string): boolean => {
    const target = stockTransfers.find(t => t.id === transferId);
    if (!target) return false;

    const timestamp = new Date().toISOString();

    // Move device branch ownership for serialized items
    setDevices(prev => prev.map(d => {
      const isTransferred = target.items.some(ti => ti.imeis?.includes(d.imei1) || ti.variantId === d.variantId);
      if (isTransferred && d.branchId === target.fromBranchId) {
        const ev: DeviceTimelineEvent = {
          id: generateId('tl'),
          timestamp,
          type: 'TRANSFERRED',
          toStatus: d.status,
          note: `Transferred from ${target.fromBranchName} to ${target.toBranchName} via Transfer #${target.transferNumber}`,
          performedBy: currentUser.name,
          referenceId: target.id
        };
        return {
          ...d,
          branchId: target.toBranchId,
          branchName: target.toBranchName,
          history: [ev, ...d.history]
        };
      }
      return d;
    }));

    setStockTransfers(prev => prev.map(t => {
      if (t.id === transferId) {
        return {
          ...t,
          status: 'RECEIVED',
          receivedBy: currentUser.name,
          receiveDate: timestamp
        };
      }
      return t;
    }));

    logAudit('TRANSFER_RECEIVED', 'TRANSFER', transferId, target.transferNumber, `Received stock transfer into ${target.toBranchName}`);
    toast.success(`Stock Transfer #${target.transferNumber} received and inventory updated!`);
    return true;
  };

  // Warranty & Repairs
  const createWarrantyTicket = (ticketData: Partial<WarrantyTicket> & { imei: string; customerName: string }): WarrantyTicket => {
    const timestamp = new Date().toISOString();
    const branch = branches.find(b => b.id === (ticketData.branchId || activeBranchId)) || activeBranch;
    const ticketNum = `WAR-${Math.floor(1000 + Math.random() * 9000)}`;
    const claimNum = `CLM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newTicket: WarrantyTicket = {
      id: generateId('WR'),
      ticketNumber: ticketData.ticketNumber || ticketNum,
      claimNumber: ticketData.claimNumber || claimNum,
      deviceId: ticketData.deviceId,
      imei: ticketData.imei.trim(),
      serialNumber: ticketData.serialNumber || `SN-${ticketData.imei.slice(-6)}`,
      productId: ticketData.productId,
      productName: ticketData.productName || 'Flagship Smartphone',
      brand: ticketData.brand || 'Apple',
      model: ticketData.model,
      customerId: ticketData.customerId,
      customerName: ticketData.customerName,
      customerPhone: ticketData.customerPhone || '+1 (555) 000-0000',
      customerEmail: ticketData.customerEmail,
      orderId: ticketData.orderId || 'ORD-DIRECT',
      orderReceipt: ticketData.orderReceipt,
      purchaseDate: ticketData.purchaseDate || timestamp,
      startDate: ticketData.startDate || timestamp,
      expiryDate: ticketData.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      warrantyMonths: ticketData.warrantyMonths || 12,
      claimReason: ticketData.claimReason || 'Hardware Defect Coverage',
      customerReportedIssue: ticketData.customerReportedIssue || ticketData.issueDescription || 'Hardware issue reported by customer',
      issueDescription: ticketData.issueDescription || ticketData.customerReportedIssue,
      productCondition: ticketData.productCondition || 'Brand New',
      status: ticketData.status || ticketData.claimStatus || 'Pending',
      claimStatus: ticketData.claimStatus || ticketData.status || 'Pending',
      branchId: branch.id,
      branchName: branch.name,
      staffId: currentUser.id,
      staffName: currentUser.name,
      claimDate: timestamp,
      resolution: ticketData.resolution,
      notes: ticketData.notes,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setWarrantyTickets(prev => [newTicket, ...prev]);

    // Update Device status if device was found
    if (newTicket.deviceId || newTicket.imei) {
      setDevices(prev => prev.map(d => {
        if (d.id === newTicket.deviceId || d.imei1 === newTicket.imei) {
          const ev: DeviceTimelineEvent = {
            id: generateId('tl'),
            timestamp,
            type: 'WARRANTY_CLAIMED',
            fromStatus: d.status,
            toStatus: 'WARRANTY',
            note: `Warranty claim #${newTicket.ticketNumber} filed (${newTicket.claimReason})`,
            performedBy: currentUser.name,
            referenceId: newTicket.ticketNumber
          };
          return { ...d, status: 'WARRANTY', history: [ev, ...d.history] };
        }
        return d;
      }));
    }

    logAudit('WARRANTY_CLAIMED', 'WARRANTY', newTicket.id, newTicket.ticketNumber, `Filed warranty claim for IMEI ${newTicket.imei} (${newTicket.claimReason}) at ${branch.name}`);
    playSound('success');
    toast.success(`Warranty claim #${newTicket.ticketNumber} registered successfully!`);
    return newTicket;
  };

  const updateWarrantyTicket = (ticketId: string, updates: Partial<WarrantyTicket>) => {
    const timestamp = new Date().toISOString();
    setWarrantyTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const updated = {
          ...t,
          ...updates,
          status: updates.status || updates.claimStatus || t.status,
          claimStatus: updates.claimStatus || updates.status || t.claimStatus,
          updatedAt: timestamp
        };
        return updated;
      }
      return t;
    }));
    logAudit('WARRANTY_CLAIMED', 'WARRANTY', ticketId, `Warranty #${ticketId}`, `Updated warranty claim status to ${updates.status || updates.claimStatus}`);
    toast.success('Warranty claim updated successfully');
  };

  const deleteWarrantyTicket = (ticketId: string) => {
    setWarrantyTickets(prev => prev.filter(t => t.id !== ticketId));
    toast.info('Warranty record removed');
  };

  const createRepairJob = (jobData: Partial<RepairJob> & { imei: string; customerName: string }): RepairJob => {
    const timestamp = new Date().toISOString();
    const branch = branches.find(b => b.id === (jobData.branchId || activeBranchId)) || activeBranch;
    const repairNum = `RP-${Math.floor(1000 + Math.random() * 9000)}`;

    const tech = employees.find(e => e.id === jobData.technicianId) || employees[3] || employees[0];
    const labor = jobData.laborCost !== undefined ? jobData.laborCost : 40.00;
    const parts = jobData.partsUsed || [];
    const partsCost = parts.reduce((sum, p) => sum + (p.cost * (p.quantity || 1)), 0);
    const total = labor + partsCost;

    const newJob: RepairJob = {
      id: generateId('REP'),
      repairNumber: jobData.repairNumber || repairNum,
      warrantyTicketId: jobData.warrantyTicketId,
      customerId: jobData.customerId,
      customerName: jobData.customerName,
      customerPhone: jobData.customerPhone || '+1 (555) 000-0000',
      customerEmail: jobData.customerEmail,
      deviceId: jobData.deviceId,
      imei: jobData.imei.trim(),
      serialNumber: jobData.serialNumber || `SN-${jobData.imei.slice(-6)}`,
      productId: jobData.productId,
      productName: jobData.productName || 'Flagship Smartphone',
      brand: jobData.brand || 'Apple',
      model: jobData.model,
      branchId: branch.id,
      branchName: branch.name,
      technicianId: tech.id,
      technicianName: tech.name,
      technicianPhone: tech.phone,
      status: jobData.status || jobData.repairStatus || 'RECEIVED',
      repairStatus: jobData.repairStatus || 'Open',
      priority: jobData.priority || 'Normal',
      issue: jobData.issue || jobData.problemDescription || 'Hardware repair required',
      problemDescription: jobData.problemDescription || jobData.issue,
      diagnosis: jobData.diagnosis,
      repairNotes: jobData.repairNotes || jobData.notes,
      notes: jobData.notes || jobData.repairNotes,
      partsUsed: parts,
      laborCost: labor,
      partsCost: partsCost,
      estimatedCost: jobData.estimatedCost !== undefined ? jobData.estimatedCost : total,
      finalCost: jobData.finalCost !== undefined ? jobData.finalCost : total,
      totalCost: total,
      receivedDate: jobData.receivedDate || timestamp,
      estimatedCompletionDate: jobData.estimatedCompletionDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setRepairJobs(prev => [newJob, ...prev]);

    // Update Device status if matching device exists
    if (newJob.deviceId || newJob.imei) {
      setDevices(prev => prev.map(d => {
        if (d.id === newJob.deviceId || d.imei1 === newJob.imei) {
          const ev: DeviceTimelineEvent = {
            id: generateId('tl'),
            timestamp,
            type: 'REPAIRED',
            fromStatus: d.status,
            toStatus: 'REPAIR',
            note: `Repair Job #${newJob.repairNumber} assigned to tech ${tech.name}`,
            performedBy: currentUser.name,
            referenceId: newJob.repairNumber
          };
          return { ...d, status: 'REPAIR', history: [ev, ...d.history] };
        }
        return d;
      }));
    }

    logAudit('REPAIR_UPDATED', 'REPAIR', newJob.id, newJob.repairNumber, `Assigned repair job for ${newJob.productName} to ${tech.name} at ${branch.name}`);
    playSound('success');
    toast.success(`Repair job #${newJob.repairNumber} created in workshop triage!`);
    return newJob;
  };

  const updateRepairJob = (jobId: string, updates: Partial<RepairJob>) => {
    const timestamp = new Date().toISOString();
    setRepairJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const parts = updates.partsUsed !== undefined ? updates.partsUsed : j.partsUsed;
        const labor = updates.laborCost !== undefined ? updates.laborCost : (j.laborCost || 0);
        const partsCost = parts.reduce((sum, p) => sum + (p.cost * (p.quantity || 1)), 0);
        const total = labor + partsCost;

        const isComplete = updates.status === 'REPAIRED' || updates.status === 'DELIVERED' || updates.repairStatus === 'Completed' || updates.status === 'Completed';

        const updated: RepairJob = {
          ...j,
          ...updates,
          partsUsed: parts,
          laborCost: labor,
          partsCost: partsCost,
          totalCost: total,
          finalCost: updates.finalCost !== undefined ? updates.finalCost : total,
          completedDate: isComplete ? (j.completedDate || timestamp) : j.completedDate,
          actualCompletionDate: isComplete ? (j.actualCompletionDate || timestamp) : j.actualCompletionDate,
          updatedAt: timestamp
        };
        return updated;
      }
      return j;
    }));
    logAudit('REPAIR_UPDATED', 'REPAIR', jobId, `Repair #${jobId}`, `Updated repair job details and parts/labor costing`);
    toast.success('Repair workshop job updated successfully!');
  };

  const deleteRepairJob = (jobId: string) => {
    setRepairJobs(prev => prev.filter(j => j.id !== jobId));
    toast.info('Repair job deleted');
  };

  const updateRepairStatus = (
    repairId: string, 
    status: RepairJob['status'], 
    diagnosis?: string, 
    partsUsed?: RepairPart[], 
    finalCost?: number,
    notes?: string
  ) => {
    const timestamp = new Date().toISOString();
    setRepairJobs(prev => prev.map(r => {
      if (r.id === repairId) {
        const parts = partsUsed !== undefined ? partsUsed : r.partsUsed;
        const partsCost = parts.reduce((sum, p) => sum + (p.cost * (p.quantity || 1)), 0);
        const labor = r.laborCost || 40.00;
        const total = labor + partsCost;

        const isComplete = status === 'REPAIRED' || status === 'DELIVERED' || status === 'READY_FOR_PICKUP';

        return {
          ...r,
          status,
          repairStatus: (status === 'RECEIVED' ? 'Open' : status === 'DIAGNOSING' ? 'Diagnosing' : status === 'PARTS_PENDING' ? 'Waiting for Parts' : status === 'REPAIRED' ? 'Completed' : status === 'READY_FOR_PICKUP' ? 'Ready for Pickup' : status === 'DELIVERED' ? 'Completed' : 'Cancelled'),
          diagnosis: diagnosis !== undefined ? diagnosis : r.diagnosis,
          notes: notes !== undefined ? notes : r.notes,
          partsUsed: parts,
          partsCost,
          totalCost: finalCost !== undefined ? finalCost : total,
          finalCost: finalCost !== undefined ? finalCost : total,
          completedDate: isComplete ? (r.completedDate || timestamp) : r.completedDate,
          actualCompletionDate: isComplete ? (r.actualCompletionDate || timestamp) : r.actualCompletionDate,
          updatedAt: timestamp
        };
      }
      return r;
    }));

    logAudit('REPAIR_UPDATED', 'REPAIR', repairId, `Repair #${repairId}`, `Updated repair triage status to ${status}`);
    toast.info(`Repair job status updated to ${status.replace(/_/g, ' ')}`);
  };

  // Switch Active User / RBAC
  const switchCurrentUser = (employeeId: string) => {
    const found = employees.find(e => e.id === employeeId);
    if (found) {
      setCurrentUser(found);
      logAudit('ROLE_CHANGED', 'EMPLOYEE', found.id, found.name, `Active session switched to ${found.name} (${found.role})`);
      toast.success(`Active user switched to ${found.name} (${found.role})`);
    }
  };

  // Dismiss Smart Alert
  const dismissSmartAlert = (alertId: string) => {
    setSmartAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isDismissed: true } : a));
    toast.info('Alert dismissed');
  };

  // Inventory Stock Adjustment
  const adjustStock = (
    productId: string, 
    variantId: string, 
    qtyDelta: number, 
    reason: string, 
    type: StockMovementType,
    performedBy: string = currentUser.name
  ) => {
    const timestamp = new Date().toISOString();
    let prevStockVal = 0;
    let newStockVal = 0;
    let prodName = '';
    let varSku = '';

    setProducts(prevProducts => {
      return prevProducts.map(p => {
        if (p.id !== productId) return p;
        prodName = p.name;
        const updatedVariants = p.variants.map(v => {
          if (v.id !== variantId) return v;
          prevStockVal = v.stock;
          newStockVal = Math.max(0, v.stock + qtyDelta);
          varSku = v.sku;
          return { ...v, stock: newStockVal };
        });

        const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);
        return { ...p, variants: updatedVariants, totalStock };
      });
    });

    const newMovement: StockMovement = {
      id: generateId('MOV'),
      productId,
      productName: prodName,
      variantId,
      variantSku: varSku,
      type,
      quantity: qtyDelta,
      previousStock: prevStockVal,
      newStock: newStockVal,
      reason,
      performedBy,
      branchId: activeBranch.id,
      branchName: activeBranch.name,
      createdAt: timestamp
    };

    setStockMovements(prev => [newMovement, ...prev]);

    logAudit(
      'STOCK_ADJUST',
      'VARIANT',
      variantId,
      varSku,
      `Adjusted stock by ${qtyDelta > 0 ? `+${qtyDelta}` : qtyDelta} units. Reason: ${reason}`,
      `${prevStockVal}`,
      `${newStockVal}`
    );

    if (qtyDelta > 0) {
      toast.success(`Restocked ${qtyDelta} units for ${varSku}`);
    } else {
      toast.info(`Adjusted ${qtyDelta} units for ${varSku}`);
    }
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'salesCount' | 'rating' | 'totalStock' | 'variants'> & { variants: Omit<ProductVariant, 'id'>[] }): Product => {
    const productId = `prod-${Date.now()}`;
    const variantsWithIds: ProductVariant[] = productData.variants.map((v, idx) => ({
      ...v,
      id: `var-${Date.now()}-${idx}`
    }));

    const totalStock = variantsWithIds.reduce((sum, v) => sum + v.stock, 0);

    const newProduct: Product = {
      ...productData,
      id: productId,
      variants: variantsWithIds,
      totalStock: totalStock,
      rating: 5.0,
      salesCount: 0,
      createdAt: new Date().toISOString()
    };

    setProducts(prev => [newProduct, ...prev]);
    logAudit('PRODUCT_CREATE', 'PRODUCT', newProduct.id, newProduct.name, `Created new catalog product`);
    toast.success(`Product "${newProduct.name}" created!`);
    return newProduct;
  };

  const updateProduct = (updatedProduct: Product) => {
    const totalStock = updatedProduct.variants.reduce((sum, v) => sum + v.stock, 0);
    const finalized = { ...updatedProduct, totalStock };

    const oldProduct = products.find(p => p.id === finalized.id);

    setProducts(prev => prev.map(p => p.id === finalized.id ? finalized : p));
    logAudit(
      'PRODUCT_UPDATE', 
      'PRODUCT', 
      finalized.id, 
      finalized.name, 
      `Updated product specifications`,
      oldProduct ? `$${oldProduct.basePrice}` : undefined,
      `$${finalized.basePrice}`
    );
    toast.success(`Product "${finalized.name}" updated!`);
  };

  const deleteProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (prod) {
      logAudit('PRODUCT_DELETE', 'PRODUCT', productId, prod.name, `Deleted product from catalog`);
    }
    toast.info('Product removed from catalog');
  };

  // Customer CRUD
  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalSpent' | 'totalOrders' | 'loyaltyPoints' | 'tier' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      totalSpent: 0,
      totalOrders: 0,
      loyaltyPoints: 0,
      tier: 'Bronze',
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [newCustomer, ...prev]);
    toast.success(`Customer "${newCustomer.name}" added!`);
    return newCustomer;
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    toast.success(`Customer "${updatedCustomer.name}" updated!`);
  };

  const deleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    toast.info('Customer profile deleted');
  };

  // Discounts CRUD
  const addDiscount = (discountData: Omit<DiscountPromo, 'id' | 'usageCount'>): DiscountPromo => {
    const newDiscount: DiscountPromo = {
      ...discountData,
      id: `disc-${Date.now()}`,
      usageCount: 0
    };
    setDiscounts(prev => [newDiscount, ...prev]);
    logAudit('DISCOUNT_MODIFY', 'DISCOUNT', newDiscount.id, newDiscount.code, `Created new promotional coupon`);
    toast.success(`Coupon "${newDiscount.code}" created!`);
    return newDiscount;
  };

  const toggleDiscountStatus = (discountId: string) => {
    setDiscounts(prev => prev.map(d => {
      if (d.id === discountId) {
        const nextState = !d.isActive;
        toast.info(`Coupon ${d.code} is now ${nextState ? 'Active' : 'Inactive'}`);
        return { ...d, isActive: nextState };
      }
      return d;
    }));
  };

  const deleteDiscount = (discountId: string) => {
    setDiscounts(prev => prev.filter(d => d.id !== discountId));
    toast.info('Coupon promo removed');
  };

  // Shipments
  const updateShipmentStatus = (shipmentId: string, status: ShipmentStatus, notes?: string) => {
    const timestamp = new Date().toISOString();
    setShipments(prev => prev.map(s => {
      if (s.id === shipmentId) {
        return {
          ...s,
          status,
          notes: notes || s.notes,
          actualDelivery: status === 'delivered' ? timestamp : s.actualDelivery,
          updatedAt: timestamp
        };
      }
      return s;
    }));
    toast.success(`Shipment #${shipmentId} updated to ${status.replace('_', ' ').toUpperCase()}`);
  };

  const createShipment = (order: Order, courier: Shipment['courier'], destination: string, shippingFee: number): Shipment => {
    const timestamp = new Date().toISOString();
    const newShipment: Shipment = {
      id: generateId('SHP'),
      orderId: order.id,
      receiptNumber: order.receiptNumber,
      customerName: order.customer ? order.customer.name : 'Valued Customer',
      customerPhone: order.customer ? order.customer.phone : '+1 (555) 000-0000',
      destination,
      courier,
      trackingNumber: `TRK-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      status: 'pending',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      itemsSummary: order.items.map(i => `${i.quantity}x ${i.productName}`).join(', '),
      shippingFee,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setShipments(prev => [newShipment, ...prev]);
    toast.success(`Shipment created for Order #${order.id}`);
    return newShipment;
  };

  // Settings & Notifications
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    toast.success('Store settings saved successfully!');
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.info('All notifications marked as read');
  };

  const clearNotifications = () => {
    setNotifications([]);
    toast.info('Notification feed cleared');
  };

  // Demo Data Reset
  const resetDemoData = () => {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    }
    setProducts(INITIAL_PRODUCTS);
    setDevices(INITIAL_DEVICES);
    setSuppliers(INITIAL_SUPPLIERS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setBranches(INITIAL_BRANCHES);
    setActiveBranchId(INITIAL_BRANCHES[0].id);
    setStockTransfers(INITIAL_STOCK_TRANSFERS);
    setEmployees(INITIAL_EMPLOYEES);
    setCurrentUser(INITIAL_EMPLOYEES[0]);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(INITIAL_ORDERS);
    setShipments(INITIAL_SHIPMENTS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setPayments(INITIAL_PAYMENTS);
    setDiscounts(INITIAL_DISCOUNTS);
    setWarrantyTickets(INITIAL_WARRANTY_TICKETS);
    setRepairJobs(INITIAL_REPAIR_JOBS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSmartAlerts(INITIAL_SMART_ALERTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSettings(DEFAULT_SETTINGS);
    setCartTabs([
      {
        id: 'cart-1',
        name: 'Cart #1',
        items: [],
        customer: null,
        fulfillmentType: 'in_store_pos',
        appliedCoupon: null,
        shippingFee: 0,
        isParked: false
      }
    ]);
    setActiveCartId('cart-1');
    toast.success('All demo retail data reset to original defaults!');
  };

  const exportDataJSON = (): string => {
    const fullBackup = {
      products,
      devices,
      suppliers,
      purchaseOrders,
      branches,
      stockTransfers,
      employees,
      customers,
      orders,
      shipments,
      stockMovements,
      payments,
      discounts,
      warrantyTickets,
      repairJobs,
      auditLogs,
      smartAlerts,
      settings,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.devices) setDevices(parsed.devices);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.purchaseOrders) setPurchaseOrders(parsed.purchaseOrders);
      if (parsed.branches) setBranches(parsed.branches);
      if (parsed.stockTransfers) setStockTransfers(parsed.stockTransfers);
      if (parsed.employees) setEmployees(parsed.employees);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.orders) setOrders(parsed.orders);
      if (parsed.shipments) setShipments(parsed.shipments);
      if (parsed.stockMovements) setStockMovements(parsed.stockMovements);
      if (parsed.payments) setPayments(parsed.payments);
      if (parsed.discounts) setDiscounts(parsed.discounts);
      if (parsed.warrantyTickets) setWarrantyTickets(parsed.warrantyTickets);
      if (parsed.repairJobs) setRepairJobs(parsed.repairJobs);
      if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      if (parsed.smartAlerts) setSmartAlerts(parsed.smartAlerts);
      if (parsed.settings) setSettings(parsed.settings);
      toast.success('System retail database imported successfully!');
      return true;
    } catch {
      toast.error('Failed to parse JSON file');
      return false;
    }
  };

  return (
    <POSContext.Provider
      value={{
        activeView,
        setActiveView,
        branches,
        activeBranchId,
        activeBranch,
        setActiveBranchId,
        employees,
        currentUser,
        currentRole: currentUser.role,
        permissions,
        switchCurrentUser,
        products,
        devices,
        suppliers,
        purchaseOrders,
        stockTransfers,
        customers,
        orders,
        shipments,
        stockMovements,
        payments,
        discounts,
        promotionRules,
        warrantyTickets,
        repairJobs,
        auditLogs,
        smartAlerts,
        notifications,
        settings,
        cartTabs,
        activeCartId,
        activeCart,
        cart,
        cartCustomer,
        appliedCoupon,
        cartSummary,
        fulfillmentType,
        setFulfillmentType,
        setActiveCartId,
        createCartTab,
        closeCartTab,
        parkCart,
        resumeParkedCart,
        addToCart,
        updateCartQty,
        removeFromCart,
        applyCartItemDiscount,
        applyCouponCode,
        removeCoupon,
        setCartCustomer,
        clearCart,
        checkoutOrder,
        refundOrder,
        processExchange,
        cancelOrder,
        registerDevice,
        updateDeviceStatus,
        getAvailableDevicesForVariant,
        createPurchaseOrder,
        receivePurchaseOrderItems,
        recordSupplierPayment,
        requestStockTransfer,
        approveStockTransfer,
        receiveStockTransfer,
        createWarrantyTicket,
        updateWarrantyTicket,
        deleteWarrantyTicket,
        createRepairJob,
        updateRepairJob,
        deleteRepairJob,
        updateRepairStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addDiscount,
        toggleDiscountStatus,
        deleteDiscount,
        updateShipmentStatus,
        createShipment,
        logAudit,
        dismissSmartAlert,
        updateSettings,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        resetDemoData,
        exportDataJSON,
        importDataJSON,
        lastCompletedOrder,
        setLastCompletedOrder,
        globalSearch,
        setGlobalSearch
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
