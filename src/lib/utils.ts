import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sha1Convert(data: string): string {
  return crypto.createHash('sha1').update(data).digest('hex');
}