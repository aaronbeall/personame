import { nonNull } from "./utils";

/**
 * Color palette for metric badges and UI elements with human-friendly names.
 * Uses Tailwind's default color palette for a vibrant, diverse spectrum.
 */
export const COLOR_THEME = [
  { name: 'blue', label: 'Blue', bgClass: 'bg-gradient-to-br from-blue-500 to-blue-600', textClass: 'text-blue-700', hex: '#3b82f6' },
  { name: 'purple', label: 'Purple', bgClass: 'bg-gradient-to-br from-purple-500 to-purple-600', textClass: 'text-purple-700', hex: '#8b5cf6' },
  { name: 'pink', label: 'Pink', bgClass: 'bg-gradient-to-br from-pink-500 to-pink-600', textClass: 'text-pink-700', hex: '#ec4899' },
  { name: 'rose', label: 'Rose', bgClass: 'bg-gradient-to-br from-rose-500 to-rose-600', textClass: 'text-rose-700', hex: '#f43f5e' },
  { name: 'orange', label: 'Orange', bgClass: 'bg-gradient-to-br from-orange-500 to-orange-600', textClass: 'text-orange-700', hex: '#f97316' },
  { name: 'amber', label: 'Amber', bgClass: 'bg-gradient-to-br from-amber-500 to-amber-600', textClass: 'text-amber-700', hex: '#f59e42' },
  { name: 'green', label: 'Green', bgClass: 'bg-gradient-to-br from-green-500 to-green-600', textClass: 'text-green-700', hex: '#22c55e' },
  { name: 'teal', label: 'Teal', bgClass: 'bg-gradient-to-br from-teal-500 to-teal-600', textClass: 'text-teal-700', hex: '#14b8a6' },
  { name: 'cyan', label: 'Cyan', bgClass: 'bg-gradient-to-br from-cyan-500 to-cyan-600', textClass: 'text-cyan-700', hex: '#06b6d4' },
  { name: 'indigo', label: 'Indigo', bgClass: 'bg-gradient-to-br from-indigo-500 to-indigo-600', textClass: 'text-indigo-700', hex: '#6366f1' },
  { name: 'violet', label: 'Violet', bgClass: 'bg-gradient-to-br from-violet-500 to-violet-600', textClass: 'text-violet-700', hex: '#a21caf' },
  { name: 'fuchsia', label: 'Fuchsia', bgClass: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600', textClass: 'text-fuchsia-700', hex: '#d946ef' },
] as const

export type ColorThemeName = typeof COLOR_THEME[number]['name'];

/**
 * Get color theme by name or index. Defaults to first color if not found.
 * TODO: Expand this to support custom colors in the future.
 */
export const getColorTheme = (color?: string | null, index?: number) =>
  COLOR_THEME.find(c => c.name === color) ?? COLOR_THEME[(index ?? 0) % COLOR_THEME.length];

export const getColorThemeByName = (name: ColorThemeName) =>
  nonNull(COLOR_THEME.find(c => c.name === name));

export const getColorThemeLabel = (name: ColorThemeName) =>
  nonNull(COLOR_THEME.find(c => c.name === name)).label;

export const getColorThemeBgClass = (name: ColorThemeName) =>
  nonNull(COLOR_THEME.find(c => c.name === name)).bgClass;

export const getColorThemeTextClass = (name: ColorThemeName) =>
  nonNull(COLOR_THEME.find(c => c.name === name)).textClass;

export const getColorThemeHex = (name: ColorThemeName) =>
  nonNull(COLOR_THEME.find(c => c.name === name)).hex;

export const getColorThemeByIndex = (index: number) =>
  COLOR_THEME[index % COLOR_THEME.length];
