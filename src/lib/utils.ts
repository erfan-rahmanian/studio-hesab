import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    // Using Intl.DateTimeFormat with 'fa-IR' locale and 'persian' calendar
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      calendar: 'persian',
    }).format(date);
  } catch (error) {
    console.error("Error formatting date to Persian calendar:", error);
    // Fallback to default locale formatting if an error occurs
    return new Date(dateString).toLocaleDateString('fa-IR');
  }
}

export function toWesternNumerals(str: string): string {
  if (!str) return '';
  return str.replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728))
             .replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1584));
}
