/**
 * Nexus Retail OS - LocalStorage Data Architecture & Persistence Service
 * Provides centralized, type-safe, fault-tolerant persistence with schema versioning.
 */

export const STORAGE_VERSION = 'v4';

export const STORAGE_KEYS = {
  PRODUCTS: `nexus_products_${STORAGE_VERSION}`,
  DEVICES: `nexus_devices_${STORAGE_VERSION}`,
  CUSTOMERS: `nexus_customers_${STORAGE_VERSION}`,
  ORDERS: `nexus_orders_${STORAGE_VERSION}`,
  SHIPMENTS: `nexus_shipments_${STORAGE_VERSION}`,
  STOCK_MOVEMENTS: `nexus_stock_movements_${STORAGE_VERSION}`,
  PAYMENTS: `nexus_payments_${STORAGE_VERSION}`,
  DISCOUNTS: `nexus_discounts_${STORAGE_VERSION}`,
  SUPPLIERS: `nexus_suppliers_${STORAGE_VERSION}`,
  PURCHASE_ORDERS: `nexus_purchase_orders_${STORAGE_VERSION}`,
  BRANCHES: `nexus_branches_${STORAGE_VERSION}`,
  STOCK_TRANSFERS: `nexus_stock_transfers_${STORAGE_VERSION}`,
  EMPLOYEES: `nexus_employees_${STORAGE_VERSION}`,
  CURRENT_USER: `nexus_current_user_${STORAGE_VERSION}`,
  WARRANTY_TICKETS: `nexus_warranty_tickets_${STORAGE_VERSION}`,
  REPAIR_JOBS: `nexus_repair_jobs_${STORAGE_VERSION}`,
  AUDIT_LOGS: `nexus_audit_logs_${STORAGE_VERSION}`,
  SMART_ALERTS: `nexus_smart_alerts_${STORAGE_VERSION}`,
  PROMOTION_RULES: `nexus_promotion_rules_${STORAGE_VERSION}`,
  NOTIFICATIONS: `nexus_notifications_${STORAGE_VERSION}`,
  SETTINGS: `nexus_settings_${STORAGE_VERSION}`,
  CART_TABS: `nexus_cart_tabs_${STORAGE_VERSION}`,
  ACTIVE_CART_ID: `nexus_active_cart_id_${STORAGE_VERSION}`,
  ACTIVE_VIEW: `nexus_active_view_${STORAGE_VERSION}`,
  ACTIVE_BRANCH_ID: `nexus_active_branch_id_${STORAGE_VERSION}`,
  WARRANTY_LAYOUT: `nexus_warranty_layout_${STORAGE_VERSION}`,
  REPAIR_LAYOUT: `nexus_repair_layout_${STORAGE_VERSION}`,
} as const;

export class StorageService {
  private static isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const testKey = '__nexus_test_storage__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Safely read a parsed entity or collection from LocalStorage
   */
  public static getItem<T>(key: string, fallback: T): T {
    if (!this.isAvailable()) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn(`[StorageService] Failed to read key "${key}", returning fallback.`, error);
      return fallback;
    }
  }

  /**
   * Safely write an entity or collection to LocalStorage
   */
  public static setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`[StorageService] Failed to write key "${key}".`, error);
      return false;
    }
  }

  /**
   * Remove a specific key from LocalStorage
   */
  public static removeItem(key: string): void {
    if (!this.isAvailable()) return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`[StorageService] Failed to remove key "${key}".`, error);
    }
  }

  /**
   * Reset all POS demo data back to default
   */
  public static resetAll(): void {
    if (!this.isAvailable()) return;
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        window.localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('[StorageService] Failed to reset demo data.', error);
    }
  }

  /**
   * Export all system data as a downloadable JSON backup string
   */
  public static exportAll(): string {
    if (!this.isAvailable()) return '{}';
    const backup: Record<string, unknown> = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        try {
          backup[name] = JSON.parse(raw);
        } catch {
          backup[name] = raw;
        }
      }
    });
    return JSON.stringify(backup, null, 2);
  }

  /**
   * Import data from JSON string backup
   */
  public static importAll(jsonStr: string): boolean {
    if (!this.isAvailable()) return false;
    try {
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
      Object.entries(parsed).forEach(([name, data]) => {
        const key = STORAGE_KEYS[name as keyof typeof STORAGE_KEYS];
        if (key && data !== undefined) {
          window.localStorage.setItem(key, JSON.stringify(data));
        }
      });
      return true;
    } catch (error) {
      console.error('[StorageService] Failed to import data backup.', error);
      return false;
    }
  }
}
