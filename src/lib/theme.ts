/**
 * Theme manager — reads/writes theme preference to user_settings in IndexedDB,
 * respects prefers-color-scheme, and manages the data-theme attribute on <html>.
 */

export type ThemeMode = 'dark' | 'light' | 'system';
export type Theme = ThemeMode;

const THEME_STORAGE_KEY = 'yogasense_theme';

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(resolved: 'dark' | 'light'): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolved);
}

/**
 * Resolves the effective theme from a preference.
 */
export function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') return getSystemTheme();
  return mode;
}

/**
 * Reads the saved preference from localStorage (fast, synchronous).
 */
export function getSavedThemeMode(): ThemeMode {
  if (typeof localStorage === 'undefined') return 'dark';
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  return 'dark';
}

export const getTheme = getSavedThemeMode;

/**
 * Saves theme preference and applies it.
 */
export function setThemeMode(mode: ThemeMode): void {
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  applyTheme(resolveTheme(mode));
}

export const setTheme = setThemeMode;

/**
 * Initialize theme on app startup. Call once in main.tsx.
 */
export function initTheme(): void {
  const mode = getSavedThemeMode();
  applyTheme(resolveTheme(mode));

  // Listen for system theme changes when in 'system' mode
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
      const currentMode = getSavedThemeMode();
      if (currentMode === 'system') {
        applyTheme(getSystemTheme());
      }
    });
  }
}
