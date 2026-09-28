export type BrandName = 
  | 'Apple' 
  | 'Samsung' 
  | 'Google' 
  | 'Xiaomi' 
  | 'OnePlus' 
  | 'Sony' 
  | 'Anker' 
  | 'Spigen' 
  | 'Belkin' 
  | 'JBL' 
  | 'Huawei' 
  | 'OPPO' 
  | 'Vivo' 
  | 'Realme' 
  | 'Pitaka' 
  | 'Bose';

export type CategoryName = 
  | 'smartphones' 
  | 'accessories' 
  | 'chargers' 
  | 'powerbanks' 
  | 'cases' 
  | 'screen-protectors' 
  | 'smartwatches' 
  | 'earbuds' 
  | 'cables' 
  | 'gadgets';

export type DeviceCondition = 'Brand New' | 'Open Box' | 'Certified Refurbished' | 'Grade A' | 'Grade B';

export type DeviceStatus = 
  | 'IN_STOCK' 
  | 'RESERVED' 
  | 'SOLD' 
  | 'RETURNED' 
  | 'WARRANTY' 
  | 'REPAIR' 
  | 'DAMAGED' 
  | 'LOST';

export interface DeviceTimelineEvent {
  id: string;
  timestamp: string;
  type: 'PURCHASED' | 'RECEIVED' | 'TRANSFERRED' | 'SOLD' | 'RETURNED' | 'WARRANTY_CLAIMED' | 'REPAIRED' | 'STATUS_CHANGE' | 'PRICE_ADJUSTED';
  fromStatus?: DeviceStatus;
  toStatus: DeviceStatus;
  note: string;
  performedBy: string;
  referenceId?: string; // Order ID, PO ID, Transfer ID, Repair ID
}

export interface DeviceItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  brand: BrandName;
  sku: string;
  imei1: string;
  imei2?: string;
  serialNumber: string;
  storage?: string;
  ram?: string;
  color: string;
  condition: DeviceCondition;
  purchaseCost: number;
  sellingPrice: number;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  status: DeviceStatus;
  warrantyMonths: number;
  warrantyStart?: string;
  warrantyExpiry?: string;
  soldDate?: string;
  customerId?: string;
  customerName?: string;
  orderId?: string;
  repairCount?: number;
  history: DeviceTimelineEvent[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  barcode: string;
  color: string;
  colorHex?: string;
  storage?: string; // e.g. "128GB", "256GB", "512GB", "1TB"
  ram?: string;     // e.g. "8GB", "12GB", "16GB"
  condition: DeviceCondition;
  price: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  serialNumbers?: string[]; // IMEI or Serial Numbers
  image?: string;
  branchStocks?: Record<string, number>; // branchId -> stock count
}

export interface Product {
  id: string;
  name: string;
  brand: BrandName;
  category: CategoryName;
  basePrice: number;
  costPrice: number;
  image: string;
  sku: string;
  barcode: string;
  description: string;
  featured?: boolean;
  variants: ProductVariant[];
  totalStock: number;
  rating: number;
  salesCount: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  brand: string;
  variantSummary: string;
  sku: string;
  image: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  selectedSerial?: string; // assigned IMEI
  deviceId?: string;
  notes?: string;
}

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  address: CustomerAddress;
  totalSpent: number;
  totalOrders: number;
  loyaltyPoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  segment: 'New' | 'Regular' | 'VIP' | 'Inactive';
  favoriteBrand?: string;
  notes?: string;
  createdAt: string;
  lastPurchaseDate?: string;
}

export type OrderStatus = 'completed' | 'processing' | 'cancelled' | 'refunded' | 'exchanged';
export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'partially_refunded' | 'partial';
export type PaymentMethod = 'cash' | 'card' | 'mobile_digital' | 'split';

export interface SplitPaymentEntry {
  method: 'cash' | 'card' | 'mobile_digital';
  amount: number;
  reference?: string;
}

export interface PaymentDetails {
  amountReceived?: number;
  changeGiven?: number;
  cardLast4?: string;
  cardType?: 'Visa' | 'Mastercard' | 'Amex' | 'Discover' | 'Debit';
  cardHolder?: string;
  authCode?: string;
  provider?: 'Apple Pay' | 'Google Pay' | 'Venmo' | 'Zelle' | 'Cash' | 'Card Terminal';
  splitBreakdown?: SplitPaymentEntry[];
  transactionRef?: string;
}

export interface Order {
  id: string;
  receiptNumber: string;
  customer: Customer | null;
  cashierName: string;
  salespersonId?: string;
  salespersonName?: string;
  branchId: string;
  branchName: string;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  appliedCoupon?: string;
  couponDiscountValue?: number;
  shippingFee: number;
  taxRate: number;
  taxTotal: number;
  grandTotal: number;
  profitTotal: number;
  costTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentDetails;
  orderStatus: OrderStatus;
  fulfillmentType: 'in_store_pos' | 'pickup' | 'delivery';
  shipmentId?: string;
  notes?: string;
  createdAt: string;
  refundedAt?: string;
  refundReason?: string;
  refundAmount?: number;
  exchangedOrderId?: string;
}

export type StockMovementType = 
  | 'sale' 
  | 'restock' 
  | 'adjustment' 
  | 'refund_return' 
  | 'damaged_writeoff' 
  | 'audit_count'
  | 'transfer_out'
  | 'transfer_in'
  | 'purchase_receive';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantSku: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  performedBy: string;
  branchId?: string;
  branchName?: string;
  referenceId?: string;
  createdAt: string;
}

export type ShipmentStatus = 
  | 'pending' 
  | 'packing' 
  | 'ready' 
  | 'shipped' 
  | 'in_transit' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'failed' 
  | 'returned';

export interface Shipment {
  id: string;
  orderId: string;
  receiptNumber: string;
  customerName: string;
  customerPhone: string;
  destination: string;
  courier: 'FedEx Express' | 'DHL Global' | 'UPS Next Day' | 'In-House Courier' | 'SpeedyLocal';
  driverName?: string;
  driverPhone?: string;
  trackingNumber: string;
  status: ShipmentStatus;
  estimatedDelivery: string;
  actualDelivery?: string;
  itemsSummary: string;
  shippingFee: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  paymentTerms: 'Net 15' | 'Net 30' | 'Net 60' | 'COD' | 'Prepaid';
  balanceDebt: number; // Accounts Payable balance
  totalPurchased: number;
  rating: number;
  activeOrdersCount: number;
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantSummary: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  receivedImeis?: string[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  items: PurchaseOrderItem[];
  status: 'DRAFT' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  totalCost: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  paidAmount: number;
  orderedDate: string;
  expectedDate: string;
  receivedDate?: string;
  notes?: string;
  createdBy: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  type: 'STORE' | 'WAREHOUSE' | 'OUTLET';
  address: string;
  phone: string;
  managerName: string;
  isHQ: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  totalInventoryUnits?: number;
  todaySales?: number;
}

export interface TransferItem {
  productId: string;
  variantId: string;
  productName: string;
  variantSummary: string;
  quantity: number;
  imeis?: string[];
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';
  items: TransferItem[];
  requestedBy: string;
  approvedBy?: string;
  receivedBy?: string;
  requestDate: string;
  shipDate?: string;
  receiveDate?: string;
  trackingNumber?: string;
  notes?: string;
}

export type EmployeeRole = 
  | 'OWNER' 
  | 'ADMIN' 
  | 'MANAGER' 
  | 'CASHIER' 
  | 'SALESPERSON' 
  | 'INVENTORY_STAFF' 
  | 'ACCOUNTANT';

export interface RolePermissions {
  canAccessPOS: boolean;
  canEditProductCost: boolean;
  canDeleteProduct: boolean;
  canApproveRefund: boolean;
  canManagePurchases: boolean;
  canApproveTransfers: boolean;
  canViewReports: boolean;
  canManageEmployees: boolean;
  canModifyDiscounts: boolean;
  canManageSettings: boolean;
  canViewCostBasis: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  branchId: string;
  branchName: string;
  avatar?: string;
  isActive: boolean;
  salesTarget: number;
  salesAchieved: number;
  commissionRate: number; // e.g. 2%
  pinCode: string;
  createdAt: string;
}

export type WarrantyClaimStatus = 
  | 'Pending' 
  | 'Approved' 
  | 'Rejected' 
  | 'In Repair' 
  | 'Ready for Pickup' 
  | 'Completed' 
  | 'Cancelled' 
  | 'ACTIVE' 
  | 'EXPIRED' 
  | 'CLAIMED' 
  | 'VOID';

export interface WarrantyTicket {
  id: string;
  ticketNumber: string; // e.g. "WAR-8910"
  claimNumber?: string;
  deviceId?: string;
  imei: string;
  serialNumber?: string;
  productId?: string;
  productName: string;
  brand: string;
  model?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  orderId: string;
  orderReceipt?: string;
  purchaseDate?: string;
  startDate: string;
  expiryDate: string;
  warrantyMonths: number;
  claimReason?: string;
  customerReportedIssue?: string;
  issueDescription?: string;
  productCondition?: DeviceCondition;
  status: WarrantyClaimStatus;
  claimStatus?: WarrantyClaimStatus;
  branchId?: string;
  branchName?: string;
  staffId?: string;
  staffName?: string;
  claimDate?: string;
  resolution?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RepairPart {
  id?: string;
  partName: string;
  partSku?: string;
  quantity?: number;
  cost: number;
}

export type RepairJobStatus = 
  | 'Open' 
  | 'Diagnosing' 
  | 'Waiting for Parts' 
  | 'In Repair' 
  | 'Ready for Pickup' 
  | 'Completed' 
  | 'Cancelled' 
  | 'RECEIVED' 
  | 'DIAGNOSING' 
  | 'PARTS_PENDING' 
  | 'IN_REPAIR'
  | 'REPAIRED' 
  | 'READY_FOR_PICKUP' 
  | 'DELIVERED' 
  | 'UNREPAIRABLE';

export type RepairPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface RepairJob {
  id: string;
  repairNumber: string; // e.g. "RP-1241"
  warrantyTicketId?: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deviceId?: string;
  imei: string;
  serialNumber?: string;
  productId?: string;
  productName: string;
  brand?: string;
  model?: string;
  branchId?: string;
  branchName?: string;
  technicianId: string;
  technicianName: string;
  technicianPhone?: string;
  status: RepairJobStatus;
  repairStatus?: RepairJobStatus;
  priority?: RepairPriority;
  issue: string;
  problemDescription?: string;
  diagnosis?: string;
  repairNotes?: string;
  notes?: string;
  partsUsed: RepairPart[];
  laborCost?: number;
  partsCost?: number;
  estimatedCost: number;
  finalCost: number;
  totalCost?: number;
  receivedDate: string;
  estimatedCompletionDate?: string;
  completedDate?: string;
  actualCompletionDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: EmployeeRole;
  action: 
    | 'PRODUCT_CREATE' 
    | 'PRODUCT_UPDATE' 
    | 'PRODUCT_DELETE' 
    | 'PRICE_CHANGE' 
    | 'STOCK_ADJUST' 
    | 'ORDER_CREATE' 
    | 'PAYMENT_RECEIVED' 
    | 'REFUND_PROCESSED' 
    | 'EXCHANGE_PROCESSED' 
    | 'DISCOUNT_MODIFY' 
    | 'PO_CREATED' 
    | 'PO_RECEIVED' 
    | 'TRANSFER_REQUEST' 
    | 'TRANSFER_APPROVED' 
    | 'TRANSFER_RECEIVED' 
    | 'IMEI_STATUS_CHANGE' 
    | 'WARRANTY_CLAIMED' 
    | 'REPAIR_UPDATED' 
    | 'USER_LOGIN' 
    | 'ROLE_CHANGED';
  entityType: 'PRODUCT' | 'VARIANT' | 'DEVICE' | 'ORDER' | 'PAYMENT' | 'SUPPLIER' | 'PURCHASE_ORDER' | 'TRANSFER' | 'WARRANTY' | 'REPAIR' | 'EMPLOYEE' | 'DISCOUNT';
  entityId: string;
  entityName: string;
  previousValue?: string;
  newValue?: string;
  description: string;
}

export interface SmartAlert {
  id: string;
  type: 'LOW_STOCK' | 'DEAD_STOCK' | 'LOW_MARGIN' | 'STOCK_VELOCITY' | 'WARRANTY_CLAIM' | 'PENDING_TRANSFER' | 'SUPPLIER_DEBT';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  targetView: ActiveView;
  actionLabel: string;
  targetId?: string;
  createdAt: string;
  isDismissed: boolean;
}

export interface CartTab {
  id: string;
  name: string;
  items: CartItem[];
  customer: Customer | null;
  fulfillmentType: 'in_store_pos' | 'pickup' | 'delivery';
  appliedCoupon: DiscountPromo | null;
  shippingFee: number;
  isParked: boolean;
  parkedAt?: string;
  parkNote?: string;
}

export interface PromotionRule {
  id: string;
  name: string;
  type: 'BUNDLE' | 'BOGO' | 'CATEGORY_TIER' | 'ACCESSORY_DISCOUNT';
  description: string;
  requiredProductIds?: string[];
  requiredCategory?: CategoryName;
  requiredBrand?: BrandName;
  minCartTotal?: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  targetCategory?: CategoryName;
  targetProductIds?: string[];
  isActive: boolean;
}

export interface DiscountPromo {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  appliesTo: 'all' | 'category' | 'brand';
  targetValue?: string;
  startDate: string;
  endDate: string;
  usageCount: number;
  usageLimit?: number;
  isActive: boolean;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  receiptNumber: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  type: 'payment' | 'refund';
  status: 'completed' | 'failed' | 'pending' | 'refunded';
  reference: string;
  cashierName: string;
  notes?: string;
  createdAt: string;
}

export interface ActivityNotification {
  id: string;
  type: 'sale' | 'low_stock' | 'refund' | 'shipment' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeCity: string;
  taxId: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  enableSoundEffects: boolean;
  receiptHeader: string;
  receiptFooter: string;
  returnPolicyDays: number;
  barcodeScannerPrefix: string;
  lowStockThresholdDefault: number;
  thermalPrinterWidth: '80mm' | '58mm';
  activeBranchId: string;
}

export type ActiveView = 
  | 'pos' 
  | 'dashboard' 
  | 'products' 
  | 'inventory' 
  | 'devices' 
  | 'purchases' 
  | 'transfers' 
  | 'orders' 
  | 'returns' 
  | 'warranty' 
  | 'shipments' 
  | 'customers' 
  | 'discounts' 
  | 'employees' 
  | 'reports' 
  | 'payments' 
  | 'audit' 
  | 'settings';
