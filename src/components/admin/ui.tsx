import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { format } from 'date-fns';
import {
  Banknote, ChevronLeft, ChevronRight, Download, GraduationCap, HandHeart, LayoutDashboard, Library, Receipt, Search, Settings,
  ShieldAlert, Sparkles, Users, HeartPulse,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { photos, type AdminUser } from '@/content/admin-data';
import { cn } from '@/lib/utils';

export const sections = ['overview', 'campaigns', 'withdrawals', 'payments', 'users', 'schools', 'moderation', 'safety', 'vibeys', 'library', 'settings'] as const;
export type Section = (typeof sections)[number];
export const isSection = (value: unknown): value is Section => typeof value === 'string' && (sections as readonly string[]).includes(value);

export type CountKey = 'withdrawals' | 'reports' | 'flags' | 'redemptions';
export const navGroups: { label: string; items: { section: Section; label: string; icon: typeof Users; count?: CountKey }[] }[] = [
  { label: 'Overview', items: [{ section: 'overview', label: 'Dashboard', icon: LayoutDashboard }] },
  { label: 'Fundraising', items: [
    { section: 'campaigns', label: 'Campaigns', icon: HandHeart },
    { section: 'withdrawals', label: 'Withdrawals', icon: Banknote, count: 'withdrawals' },
    { section: 'payments', label: 'Transactions', icon: Receipt },
  ] },
  { label: 'Community', items: [
    { section: 'users', label: 'Students & guests', icon: Users },
    { section: 'schools', label: 'Schools', icon: GraduationCap },
    { section: 'moderation', label: 'Reports', icon: ShieldAlert, count: 'reports' },
    { section: 'safety', label: 'Vibe-check', icon: HeartPulse, count: 'flags' },
  ] },
  { label: 'Platform', items: [
    { section: 'vibeys', label: 'Vibeys', icon: Sparkles, count: 'redemptions' },
    { section: 'library', label: 'Content library', icon: Library },
    { section: 'settings', label: 'Settings', icon: Settings },
  ] },
];

export function SectionLink({ section, className, children, onClick, ...rest }: { section: Section; className?: string | undefined; children: ReactNode; onClick?: (() => void) | undefined; 'aria-label'?: string | undefined; 'aria-current'?: 'page' | undefined }) {
  return <Link to="/admin" search={section === 'overview' ? {} : { section }} className={className} onClick={onClick} {...rest}>{children}</Link>;
}

export const dollars = (n: number, cents = false) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
export const day = (at: number) => format(at, 'MMM d, yyyy');
export const dayTime = (at: number) => format(at, 'MMM d, h:mm a');
export const pct = (value: number, max: number) => Math.min(100, Math.round((value / Math.max(1, max)) * 100));

const faceTones = ['#0F7A56', '#2563EB', '#B45309', '#BE123C', '#7C3AED', '#0E7490'];
export function Face({ name, photo, size = 36, className }: { name: string; photo?: string | undefined; size?: number; className?: string | undefined }) {
  const initials = name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  const tone = faceTones[name.length % faceTones.length];
  return <span className={cn('adm-face', className)} style={{ width: size, height: size, fontSize: size * 0.38, background: photo ? undefined : tone }}>
    {photo ? <img src={photo} alt="" loading="lazy" /> : initials}
  </span>;
}

export const userPhoto = (user?: Pick<AdminUser, 'photo'> | undefined) => user?.photo ? photos[user.photo] : undefined;

export function UserCell({ user, meta }: { user?: AdminUser | undefined; meta?: ReactNode }) {
  if (!user) return <span className="adm-user"><Face name="?" /><span><strong>Deleted user</strong></span></span>;
  return <span className="adm-user">
    <Face name={user.name} photo={userPhoto(user)} />
    <span><strong>{user.name}</strong><small>{meta ?? user.email}</small></span>
  </span>;
}

export type PillTone = 'mint' | 'sky' | 'sun' | 'rose' | 'muted';
export function Pill({ tone, children }: { tone: PillTone; children: ReactNode }) {
  return <span className={cn('adm-pill', `is-${tone}`)}>{children}</span>;
}

export function AdminTabs<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { value: T; label: string; count?: number | undefined }[]; label: string }) {
  return <div className="db-tabs" role="tablist" aria-label={label}>
    {items.map(item => <button key={item.value} type="button" role="tab" aria-selected={value === item.value} onClick={() => onChange(item.value)}>
      {item.label}{item.count ? <em>{item.count}</em> : null}
    </button>)}
  </div>;
}

export function PageHead({ title, subtitle, children }: { title: string; subtitle?: string | undefined; children?: ReactNode }) {
  return <header className="db-view-head">
    <div><h1>{title}</h1>{subtitle ? <p>{subtitle}</p> : null}</div>
    {children ? <div className="db-view-actions">{children}</div> : null}
  </header>;
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <label className="db-search-inline adm-search">
    <Search aria-hidden="true" />
    <span className="sr-only">{placeholder}</span>
    <input value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} type="search" />
  </label>;
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="adm-toolbar">{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <tr className="adm-empty-row"><td colSpan={99}>{children}</td></tr>;
}

export function usePager<T>(rows: T[], size = 10) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, pages - 1);
  const slice = rows.slice(current * size, current * size + size);
  const pager = rows.length > size ? <nav className="adm-pager" aria-label="Pagination">
    <span>{current * size + 1}–{Math.min(rows.length, current * size + size)} of {rows.length}</span>
    <Button variant="soft" size="icon" className="h-9 w-9" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page"><ChevronLeft /></Button>
    <Button variant="soft" size="icon" className="h-9 w-9" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="Next page"><ChevronRight /></Button>
  </nav> : null;
  return { rows: slice, pager, reset: () => setPage(0) };
}

export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const escape = (value: string | number) => {
    const text = String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = [header, ...rows].map(row => row.map(escape).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: filename });
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ onClick }: { onClick: () => void }) {
  return <Button variant="soft" className="rounded-full" onClick={onClick}><Download /> Export CSV</Button>;
}

export function Check({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return <input type="checkbox" className="adm-check" checked={checked} onChange={event => onChange(event.target.checked)} aria-label={label} />;
}

export function useSelection(ids: string[]) {
  const [selected, setSelected] = useState<string[]>([]);
  const visible = selected.filter(id => ids.includes(id));
  return {
    selected: visible,
    has: (id: string) => visible.includes(id),
    toggle: (id: string, on: boolean) => setSelected(list => on ? [...list, id] : list.filter(x => x !== id)),
    all: visible.length > 0 && visible.length === ids.length,
    toggleAll: (on: boolean) => setSelected(on ? ids : []),
    clear: () => setSelected([]),
  };
}

export function Confirm({ open, onOpenChange, title, body, confirmLabel, tone = 'destructive', onConfirm, children }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; body: ReactNode; confirmLabel: string;
  tone?: 'destructive' | 'ink'; onConfirm: () => boolean | void; children?: ReactNode;
}) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="db-dialog">
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription asChild><div className="db-muted">{body}</div></DialogDescription>
      {children}
      <div className="db-dialog-actions">
        <Button variant="soft" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button variant={tone} className="rounded-full" onClick={() => { if (onConfirm() !== false) onOpenChange(false); }}>{confirmLabel}</Button>
      </div>
    </DialogContent>
  </Dialog>;
}

const themes: [string, string[]][] = [
  ['late-night study space', ['study', 'library', 'rooms', 'midnight']],
  ['mental health support', ['mental', 'counsel', 'wellbeing']],
  ['travel and hackathon grants', ['grant', 'travel', 'hackathon']],
  ['sustainability', ['compost', 'recycl', 'sustainab', 'garden']],
  ['transportation', ['shuttle', 'bus', 'parking']],
  ['test prep and first-gen help', ['mcat', 'prep', 'first-gen']],
];

/** Stands in for the original OpenAI summary call: groups suggestions by keyword theme. */
export function summarize(texts: string[]) {
  const found = themes.map(([label, words]) => [label, texts.filter(t => words.some(w => t.toLowerCase().includes(w))).length] as const).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  const other = texts.length - found.reduce((n, [, c]) => n + c, 0);
  if (!found.length) return `Students shared ${texts.length} suggestion${texts.length === 1 ? '' : 's'} with no clear common theme.`;
  const list = found.map(([label, n]) => `${label} (${n})`).join(', ');
  return `Across ${texts.length} suggestions, students most often asked for ${list}.${other > 0 ? ` ${other} other idea${other === 1 ? '' : 's'} didn’t fit a theme.` : ''} Top priority: ${found[0]?.[0]}.`;
}

export function Stat({ icon: Icon, label, value, note, tone = 'mint' }: { icon: typeof Users; label: string; value: string; note?: ReactNode; tone?: 'mint' | 'sky' | 'sun' | 'rose' }) {
  return <article className={cn('db-panel adm-stat', `is-${tone}`)}>
    <span className="adm-stat-icon"><Icon /></span>
    <div><small>{label}</small><strong>{value}</strong>{note ? <p>{note}</p> : null}</div>
  </article>;
}
