import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export function generateUniqueSlug(title: string): string {
  const base = slugify(title)
  const random = Math.random().toString(36).substring(2, 8)
  return `${base}-${random}`
}

export function getTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

export function nonNull<T>(value: T): NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error('Value is null or undefined')
  }
  return value;
}

export function required<T, K extends keyof T>(value: T | null | undefined, ...keys: K[]): T & Required<Pick<T, K>> {
  keys.forEach(key => {
    if (value == null || value[key] == null) {
      throw new Error(`Missing required property: ${String(key)}`)
    }
  })
  return value as T & Required<Pick<T, K>>;
}

export function isNonNull<T, K extends keyof T>(value: T | null | undefined, ...keys: K[]): value is T & Required<Pick<T, K>> {
  keys.forEach(key => {
    if (value == null || value[key] == null) {
      return false;
    }
  });
  return true;
}

export function assertNonNull<T, K extends keyof T>(value: T | null | undefined, ...keys: K[]): asserts value is T & Required<Pick<T, K>> {
  keys.forEach(key => {
    if (value == null || value[key] == null) {
      throw new Error(`Missing required property: ${String(key)}`)
    }
  });
}

export function getInitials(name?: string, maxLength: number = 2): string {
  if (!name) return ''
  const words = name.trim().split(' ')
  // Strip common prefixes/suffixes
  const filteredWords = words.filter(word => !['the', 'a', 'an', 'of', 'and', 'jr', 'sr', 'ii', 'iii', 'iv'].includes(word.toLowerCase()))
  const initials = filteredWords.map(word => word.charAt(0).toUpperCase()).slice(0, maxLength).join('')
  return initials;
}