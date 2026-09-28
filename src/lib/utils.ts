import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatDate(dateString: string | Date, includeTime: boolean = false): string {
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return "Invalid date";
    
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
      ...(includeTime ? { hour: "2-digit", minute: "2-digit", hour12: true } : {}),
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch {
    return String(dateString);
  }
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
}

export function generateId(prefix: string = "ID"): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${randomNum}${timestamp}`;
}

export function generateSKU(brand: string, name: string, variant?: string): string {
  const b = brand.substring(0, 3).toUpperCase();
  const n = name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase();
  const v = variant ? `-${variant.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase()}` : "";
  const random = Math.floor(100 + Math.random() * 900);
  return `${b}-${n}${v}-${random}`;
}

export function generateBarcode(): string {
  let result = "8";
  for (let i = 0; i < 11; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}
