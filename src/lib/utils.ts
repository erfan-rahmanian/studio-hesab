import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function toWesternNumerals(str: string): string {
  if (!str) return '';
  return str.replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728))
             .replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1584));
}
