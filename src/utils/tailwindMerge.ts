import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  console.log(`[TAILWINDMERGE] merging this classes: "${inputs}"`);
  return twMerge(clsx(inputs));
}
