import { nonNull } from "./utils";

/**
 * Color palette for metric badges and UI elements with human-friendly names.
 * Uses Tailwind's default color palette for a vibrant, diverse spectrum.
 */
export const COLOR_THEME = [
  { name: 'blue', label: 'Blue', bgClass: 'bg-gradient-to-br from-blue-500 to-blue-600', textClass: 'text-cyan-300', hex: '#3b82f6' },
  { name: 'purple', label: 'Purple', bgClass: 'bg-gradient-to-br from-purple-500 to-purple-600', textClass: 'text-fuchsia-200', hex: '#8b5cf6' },
  { name: 'pink', label: 'Pink', bgClass: 'bg-gradient-to-br from-pink-500 to-pink-600', textClass: 'text-yellow-100', hex: '#ec4899' },
  { name: 'rose', label: 'Rose', bgClass: 'bg-gradient-to-br from-rose-500 to-rose-600', textClass: 'text-yellow-100', hex: '#f43f5e' },
  { name: 'orange', label: 'Orange', bgClass: 'bg-gradient-to-br from-orange-500 to-orange-600', textClass: 'text-yellow-100', hex: '#f97316' },
  { name: 'amber', label: 'Amber', bgClass: 'bg-gradient-to-br from-amber-500 to-amber-600', textClass: 'text-yellow-900', hex: '#f59e42' },
  { name: 'green', label: 'Green', bgClass: 'bg-gradient-to-br from-green-500 to-green-600', textClass: 'text-lime-200', hex: '#22c55e' },
  { name: 'teal', label: 'Teal', bgClass: 'bg-gradient-to-br from-teal-500 to-teal-600', textClass: 'text-cyan-100', hex: '#14b8a6' },
  { name: 'cyan', label: 'Cyan', bgClass: 'bg-gradient-to-br from-cyan-500 to-cyan-600', textClass: 'text-white', hex: '#06b6d4' },
  { name: 'indigo', label: 'Indigo', bgClass: 'bg-gradient-to-br from-indigo-500 to-indigo-600', textClass: 'text-cyan-200', hex: '#6366f1' },
  { name: 'violet', label: 'Violet', bgClass: 'bg-gradient-to-br from-violet-500 to-violet-600', textClass: 'text-pink-100', hex: '#a21caf' },
  { name: 'fuchsia', label: 'Fuchsia', bgClass: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600', textClass: 'text-yellow-100', hex: '#d946ef' },
] as const

export type ColorThemeName = typeof COLOR_THEME[number]['name'];

/**
 * Safe getter for color theme, by name or index, or defaults to first color if not found.
 * TODO: Expand this to support custom colors in the future.
 */
export const getColorTheme = (color?: string | null, index?: number) =>
  findColorThemeByName(color) ?? COLOR_THEME[(index ?? 0) % COLOR_THEME.length];

/**
 * Strict type-safe color theme lookup
 */
export const getColorThemeByName = (name: ColorThemeName) =>
  nonNull(findColorThemeByName(name));

/**
 * Find color theme by name if possible
 */
export const findColorThemeByName = (name?: string | null) =>
  COLOR_THEME.find(c => c.name === name);

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

export const getUnusedColorTheme = (usedColors: (string | null | undefined)[]) => {
  const usedSet = new Set(usedColors);
  const unused = COLOR_THEME.find(c => !usedSet.has(c.name));
  return unused ?? COLOR_THEME[0];
}