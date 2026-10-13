import { createContext, useCallback, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { Moon, Palette, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LogoMark } from '@/components/Brand';
import {
  appAccents, appThemes, appearanceOwner, applyAppearance, defaultAppearance, loadAppearance, logoStyles, saveAppearance, themeById,
  type Appearance,
} from '@/lib/appearance';
import { SESSION_EVENT } from '@/lib/demo-session';
import { cn } from '@/lib/utils';

type AppearanceContextValue = {
  appearance: Appearance;
  owner: string;
  update: (patch: Partial<Appearance>) => void;
  reset: () => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

/** Loads the signed-in user's look after mount and reloads it whenever the session changes. */
export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [owner, setOwner] = useState('guest');
  const [appearance, setAppearance] = useState<Appearance | null>(null);

  useEffect(() => {
    const load = () => {
      const next = appearanceOwner();
      setOwner(next);
      setAppearance(loadAppearance(next));
    };
    const onStorage = (event: StorageEvent) => { if (!event.key || event.key.startsWith('byeuni-')) load(); };
    load();
    window.addEventListener(SESSION_EVENT, load);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SESSION_EVENT, load);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => { if (appearance) applyAppearance(appearance); }, [appearance]);

  const current = appearance ?? defaultAppearance;
  const update = useCallback((patch: Partial<Appearance>) => {
    const next = { ...current, ...patch };
    setAppearance(next);
    saveAppearance(owner, next);
  }, [current, owner]);
  const reset = useCallback(() => {
    setAppearance(defaultAppearance);
    saveAppearance(owner, defaultAppearance);
  }, [owner]);

  const value = useMemo(() => ({ appearance: current, owner, update, reset }), [current, owner, update, reset]);
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error('useAppearance must be used inside AppearanceProvider');
  return value;
}

/** Header button that opens the appearance panel. */
export function ThemePicker({ className }: { className?: string }) {
  return <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className={className} aria-label="Theme and appearance" title="Theme and appearance"><Palette /></Button>
    </PopoverTrigger>
    <PopoverContent align="end" className="ap-popover">
      <AppearancePanel />
    </PopoverContent>
  </Popover>;
}

export function AppearancePanel() {
  const { appearance, owner, update, reset } = useAppearance();
  const theme = themeById(appearance.theme);
  const accent = appearance.accent?.toLowerCase();

  return <div className="ap-panel">
    <section className="ap-group">
      <h3>Theme</h3>
      <div className="ap-themes" role="radiogroup" aria-label="Theme">
        {appThemes.map(item => <button
          key={item.id}
          type="button"
          role="radio"
          aria-checked={appearance.theme === item.id}
          className="ap-theme"
          onClick={() => update({ theme: item.id })}
          style={{ '--sw-bg': item.swatch[0], '--sw-ink': item.swatch[1], '--sw-accent': item.swatch[2] } as CSSProperties}
        >
          <span className="ap-theme-art"><i /><i /><i /></span>
          <span className="ap-theme-name">{item.label}{item.dark ? <Moon aria-hidden="true" /> : null}</span>
        </button>)}
      </div>
    </section>

    <section className="ap-group">
      <h3>Accent</h3>
      <div className="ap-accents">
        <button type="button" className="ap-accent-auto" aria-pressed={!accent} onClick={() => update({ accent: null })} style={{ '--sw-accent': theme.swatch[2] } as CSSProperties}>
          <i />Theme
        </button>
        {appAccents.map(color => <button
          key={color}
          type="button"
          className="ap-swatch"
          aria-label={`Accent ${color}`}
          aria-pressed={accent === color.toLowerCase()}
          style={{ background: color }}
          onClick={() => update({ accent: color })}
        />)}
        <span className={cn('ap-swatch ap-accent-custom', accent && !appAccents.some(c => c.toLowerCase() === accent) && 'is-on')} title="Custom color">
          <input type="color" value={appearance.accent ?? theme.swatch[2]} onChange={event => update({ accent: event.target.value })} aria-label="Custom accent color" />
        </span>
      </div>
    </section>

    <section className="ap-group">
      <h3>Logo</h3>
      <div className="ap-logos" role="radiogroup" aria-label="Logo colors">
        {logoStyles.map(style => <button
          key={style.id}
          type="button"
          role="radio"
          aria-checked={appearance.logo === style.id}
          className="ap-logo"
          data-logo={style.id}
          onClick={() => update({ logo: style.id })}
        >
          <LogoMark />
          <span><strong>{style.label}</strong><small>{style.note}</small></span>
        </button>)}
      </div>
    </section>

    <footer className="ap-foot">
      <small>{owner === 'guest' ? 'Saved in this browser' : `Saved for ${owner}`}</small>
      <Button variant="ghost" size="sm" onClick={reset}><RotateCcw /> Reset</Button>
    </footer>
  </div>;
}
