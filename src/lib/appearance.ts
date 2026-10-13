import { readSession } from '@/lib/demo-session';

export type AppThemeId = 'minimal' | 'dark' | 'campus' | 'ocean' | 'blossom' | 'lavender' | 'midnight' | 'evergreen';
export type LogoStyle = 'theme' | 'classic' | 'mono';

export type AppTheme = {
  id: AppThemeId;
  label: string;
  dark: boolean;
  /** Background, ink, and accent, for previews; the real tokens live in styles.css. */
  swatch: [string, string, string];
};

export const appThemes: AppTheme[] = [
  { id: 'minimal', label: 'Minimal', dark: false, swatch: ['#F7F7F5', '#111111', '#111111'] },
  { id: 'dark', label: 'Dark', dark: true, swatch: ['#0E0E0F', '#F2F2F0', '#EDEDEB'] },
  { id: 'campus', label: 'Campus', dark: false, swatch: ['#E7F6EC', '#111111', '#0F7A56'] },
  { id: 'ocean', label: 'Ocean', dark: false, swatch: ['#EEF4FD', '#0B1426', '#2563EB'] },
  { id: 'blossom', label: 'Blossom', dark: false, swatch: ['#FDF1F4', '#1F1116', '#D6336C'] },
  { id: 'lavender', label: 'Lavender', dark: false, swatch: ['#F3F0FE', '#16112A', '#7C3AED'] },
  { id: 'midnight', label: 'Midnight', dark: true, swatch: ['#0A0F1E', '#E6EBF5', '#60A5FA'] },
  { id: 'evergreen', label: 'Evergreen', dark: true, swatch: ['#111111', '#F4F2EE', '#22D497'] },
];

export const logoStyles: { id: LogoStyle; label: string; note: string }[] = [
  { id: 'theme', label: 'Match theme', note: 'Logo takes the theme accent' },
  { id: 'classic', label: 'ByeUni green', note: 'Original brand colors' },
  { id: 'mono', label: 'Monochrome', note: 'Logo in the text color' },
];

export const appAccents = ['#111111', '#0F7A56', '#2563EB', '#0E7490', '#7C3AED', '#D6336C', '#E11D48', '#EA580C', '#F59E0B'];

export type Appearance = {
  theme: AppThemeId;
  /** Overrides the theme accent when set. */
  accent: string | null;
  logo: LogoStyle;
};

export const defaultAppearance: Appearance = { theme: 'minimal', accent: null, logo: 'theme' };

const KEY_PREFIX = 'byeuni-appearance:';
const LEGACY_KEY = 'byeuni-theme';
const HEX = /^#[0-9a-f]{6}$/i;

export const themeById = (id: AppThemeId) => appThemes.find(theme => theme.id === id) ?? appThemes[0]!;

/** Each signed-in demo account keeps its own look; signed-out visitors share the guest look. */
export function appearanceOwner(): string {
  return readSession()?.email ?? 'guest';
}

function sanitize(value: Partial<Appearance> | null | undefined): Appearance {
  const theme = appThemes.some(t => t.id === value?.theme) ? value!.theme! : defaultAppearance.theme;
  const accent = typeof value?.accent === 'string' && HEX.test(value.accent) ? value.accent : null;
  const logo = logoStyles.some(l => l.id === value?.logo) ? value!.logo! : defaultAppearance.logo;
  return { theme, accent, logo };
}

export function loadAppearance(owner: string): Appearance {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + owner);
    if (raw) return sanitize(JSON.parse(raw) as Partial<Appearance>);
    if (localStorage.getItem(LEGACY_KEY) === 'dark') return { ...defaultAppearance, theme: 'dark' };
  } catch { /* Fall back to the default look. */ }
  return defaultAppearance;
}

export function saveAppearance(owner: string, appearance: Appearance) {
  try { localStorage.setItem(KEY_PREFIX + owner, JSON.stringify(appearance)); } catch { /* Preference is optional. */ }
}

function channels(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string) {
  const [r, g, b] = channels(hex).map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
};

function mix(hex: string, toward: string, amount: number) {
  const from = channels(hex);
  const to = channels(toward);
  return `#${from.map((c, i) => Math.round(c + (to[i]! - c) * amount).toString(16).padStart(2, '0')).join('')}`;
}

/** Nudges a custom accent until links and buttons stay readable on the theme background. */
export function readableAccent(accent: string, theme: AppTheme) {
  const background = theme.swatch[0];
  const toward = theme.dark ? '#ffffff' : '#000000';
  let color = accent;
  for (let step = 1; step <= 10 && contrast(color, background) < 3; step++) color = mix(accent, toward, step / 10);
  return color;
}

export const inkOn = (color: string) => (contrast(color, '#ffffff') >= contrast(color, '#111111') ? '#ffffff' : '#111111');

export function applyAppearance(appearance: Appearance) {
  const root = document.documentElement;
  const theme = themeById(appearance.theme);
  root.dataset['appTheme'] = theme.id;
  root.dataset['logo'] = appearance.logo;
  root.classList.toggle('dark', theme.dark);
  if (appearance.accent) {
    const primary = readableAccent(appearance.accent, theme);
    root.dataset['accent'] = 'custom';
    root.style.setProperty('--primary', primary);
    root.style.setProperty('--primary-foreground', inkOn(primary));
  } else {
    delete root.dataset['accent'];
    root.style.removeProperty('--primary');
    root.style.removeProperty('--primary-foreground');
  }
}
