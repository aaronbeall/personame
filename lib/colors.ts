import { nonNull } from "./utils";

/**
 * Color palette for metric badges and UI elements with human-friendly names.
 * Uses Tailwind's default color palette for a vibrant, diverse spectrum.
 */
export const COLOR_THEME = [
  { name: 'blue', label: 'Blue', class: 'bg-gradient-to-br from-blue-500 to-blue-600' },
  { name: 'purple', label: 'Purple', class: 'bg-gradient-to-br from-purple-500 to-purple-600' },
  { name: 'pink', label: 'Pink', class: 'bg-gradient-to-br from-pink-500 to-pink-600' },
  { name: 'rose', label: 'Rose', class: 'bg-gradient-to-br from-rose-500 to-rose-600' },
  { name: 'orange', label: 'Orange', class: 'bg-gradient-to-br from-orange-500 to-orange-600' },
  { name: 'amber', label: 'Amber', class: 'bg-gradient-to-br from-amber-500 to-amber-600' },
  { name: 'green', label: 'Green', class: 'bg-gradient-to-br from-green-500 to-green-600' },
  { name: 'teal', label: 'Teal', class: 'bg-gradient-to-br from-teal-500 to-teal-600' },
  { name: 'cyan', label: 'Cyan', class: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
  { name: 'indigo', label: 'Indigo', class: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
  { name: 'violet', label: 'Violet', class: 'bg-gradient-to-br from-violet-500 to-violet-600' },
  { name: 'fuchsia', label: 'Fuchsia', class: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600' },
] as const

export type ColorThemeName = typeof COLOR_THEME[number]['name'];

/**
 * Get color theme by name or index. Defaults to first color if not found.
 */
export const getColorTheme = (name?: string | null, index?: number) =>
  COLOR_THEME.find(c => c.name === name) ?? COLOR_THEME[(index ?? 0) % COLOR_THEME.length];

export const getColorThemeByName = (name: ColorThemeName) =>
  nonNull(COLOR_THEME.find(c => c.name === name));

export const getColorThemeLabel = (name: ColorThemeName) =>
  nonNull(COLOR_THEME.find(c => c.name === name)).label;

export const getColorThemeClass = (name: ColorThemeName) =>
  nonNull(COLOR_THEME.find(c => c.name === name)).class;

export const getColorThemeClassByIndex = (index: number): string =>
  COLOR_THEME[index % COLOR_THEME.length].class;

export const getColorThemeByIndex = (index: number) =>
  COLOR_THEME[index % COLOR_THEME.length];
