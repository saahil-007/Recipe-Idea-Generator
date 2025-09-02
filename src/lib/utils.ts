import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse ingredients from user input (comma or newline separated)
 */
export function parseIngredients(input: string): string[] {
  return input
    .split(/[,\n]+/)
    .map(ingredient => ingredient.trim().toLowerCase())
    .filter(ingredient => ingredient.length > 0);
}

/**
 * Format time duration to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate a shareable URL for a recipe
 */
export function generateRecipeUrl(mealId: string, baseUrl: string = window.location.origin): string {
  return `${baseUrl}?recipe=${mealId}`;
}

/**
 * Sanitize string to prevent XSS attacks
 */
export function sanitizeString(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Get a fallback image URL for failed recipe images
 */
export function getFallbackImageUrl(): string {
  return 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="none" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#f3f4f6"/>
      <circle cx="200" cy="150" r="40" fill="#d1d5db"/>
      <path d="M180 140h40v20h-40z" fill="#9ca3af"/>
      <path d="M190 130h20v10h-20z" fill="#9ca3af"/>
    </svg>
  `);
}