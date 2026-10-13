import { useRef, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  Bell, BookUser, Bookmark, CalendarDays, FileUser, HandHeart, Home, MessageCircle, ReceiptText, Settings, ShieldCheck, Sparkles, UserRound,
  Users, UsersRound, Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { imageFileToDataUrl } from '@/lib/image-file';
import { ME_ID, type Person } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';

export const views = ['home', 'network', 'messages', 'communities', 'campaigns', 'events', 'vibeys', 'cvision', 'saved', 'notifications', 'profile', 'account', 'settings'] as const;
export type View = (typeof views)[number];
export const isView = (value: unknown): value is View => typeof value === 'string' && (views as readonly string[]).includes(value);

export const accountTabs = ['details', 'security', 'contacts', 'paypal', 'payments'] as const;
export type AccountTab = (typeof accountTabs)[number];
export const isAccountTab = (value: unknown): value is AccountTab => typeof value === 'string' && (accountTabs as readonly string[]).includes(value);
export const accountItems: { tab: AccountTab; label: string; note: string; icon: typeof Home }[] = [
  { tab: 'details', label: 'Personal details', note: 'Name, email, phone, school', icon: UserRound },
  { tab: 'security', label: 'Password & security', note: 'Change password, deactivate, delete', icon: ShieldCheck },
  { tab: 'contacts', label: 'My Contacts', note: 'People you invite and fundraise with', icon: BookUser },
  { tab: 'paypal', label: 'PayPal', note: 'Where your donations land', icon: Wallet },
  { tab: 'payments', label: 'Payments', note: 'Donations made, received, autopays', icon: ReceiptText },
];

export const settingsTabs = ['appearance', 'notifications', 'privacy'] as const;
export type SettingsTab = (typeof settingsTabs)[number];
export const isSettingsTab = (value: unknown): value is SettingsTab => typeof value === 'string' && (settingsTabs as readonly string[]).includes(value);
/** Every panel the Settings page can open, including the Accounts Center sections. */
export type SettingsSection = SettingsTab | AccountTab;
export const isSettingsSection = (value: unknown): value is SettingsSection => isSettingsTab(value) || isAccountTab(value);

export const navItems: { view: View; label: string; icon: typeof Home }[] = [
  { view: 'home', label: 'Home', icon: Home },
  { view: 'network', label: 'My Network', icon: Users },
  { view: 'messages', label: 'Messages', icon: MessageCircle },
  { view: 'communities', label: 'Forums', icon: UsersRound },
  { view: 'campaigns', label: 'Fundraising', icon: HandHeart },
  { view: 'events', label: 'Events', icon: CalendarDays },
  { view: 'vibeys', label: 'My Vibeys', icon: Sparkles },
  { view: 'cvision', label: 'CVision', icon: FileUser },
  { view: 'saved', label: 'Saved', icon: Bookmark },
  { view: 'notifications', label: 'Notifications', icon: Bell },
  { view: 'profile', label: 'Profile', icon: UserRound },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export function ViewLink({ view, tab, className, children, onClick, ...rest }: { view: View; tab?: string | undefined; className?: string | undefined; children: ReactNode; onClick?: (() => void) | undefined; 'aria-label'?: string | undefined; 'aria-current'?: 'page' | undefined }) {
  return <Link to="/dashboard" search={view === 'home' ? {} : tab ? { view, tab } : { view }} className={className} onClick={onClick} {...rest}>{children}</Link>;
}

/** Opens a student's profile; your own id goes to your profile. */
export function ProfileLink({ personId, className, children, onClick, 'aria-label': label }: { personId: string; className?: string | undefined; children: ReactNode; onClick?: (() => void) | undefined; 'aria-label'?: string | undefined }) {
  return <Link
    to="/dashboard"
    search={personId === ME_ID ? { view: 'profile' } : { view: 'profile', person: personId }}
    className={cn('db-profile-link', className)}
    onClick={onClick}
    aria-label={label}
  >{children}</Link>;
}

const faceTones = ['#0F7A56', '#2563EB', '#B45309', '#BE123C', '#7C3AED', '#0E7490'];
export const initials = (name: string) => name.replace(/^(Dr|Prof|Coach)\.?\s+/, '').split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
export const faceTone = (name: string) => faceTones[[...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % faceTones.length];

export function Avatar({ person, size = 40, ring, online, className }: { person: Pick<Person, 'photo' | 'name'> & { online?: boolean | undefined }; size?: number; ring?: 'story' | 'seen' | undefined; online?: boolean | undefined; className?: string | undefined }) {
  return <span className={cn('db-avatar', ring && `is-${ring}`, className)} style={{ width: size, height: size }}>
    {person.photo
      ? <img src={person.photo} alt="" loading="lazy" />
      : <b className="db-initials" style={{ background: faceTone(person.name), fontSize: size * 0.36 }}>{initials(person.name)}</b>}
    {(online ?? person.online) ? <i className="db-online" aria-label="Online" /> : null}
  </span>;
}

export const timeAgo = (at: number) => {
  const diff = Date.now() - at;
  if (diff < 45_000) return 'Just now';
  return formatDistanceToNowStrict(at, { addSuffix: false })
    .replace(/ seconds?/, 's').replace(/ minutes?/, 'm').replace(/ hours?/, 'h').replace(/ days?/, 'd').replace(/ months?/, 'mo').replace(/ years?/, 'y');
};

export const agoText = (at: number) => {
  const short = timeAgo(at);
  return short === 'Just now' ? short : `${short} ago`;
};

export function downloadIcs(title: string, date: string, place: string) {
  const day = date.replaceAll('-', '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ByeUni//Demo//EN', 'BEGIN:VEVENT', `UID:${day}-${title.length}@byeuni`, `DTSTART;VALUE=DATE:${day}`, `SUMMARY:${title}`, `LOCATION:${place}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${title.replace(/\W+/g, '-').toLowerCase()}.ics` });
  a.click();
  URL.revokeObjectURL(url);
}

export const usd = (amount: number) => amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const compact = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : String(n);

export function Bar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return <div className="db-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>;
}

export function PanelHead({ title, action }: { title: string; action?: ReactNode }) {
  return <header className="db-panel-head"><h2>{title}</h2>{action}</header>;
}

/** Hidden file input that resizes picked photos before handing them over. */
export function usePhotoPicker(onPick: (images: string[]) => void, { multiple = false } = {}) {
  const input = useRef<HTMLInputElement>(null);
  const element = <input
    ref={input}
    type="file"
    accept="image/*"
    multiple={multiple}
    hidden
    onChange={async event => {
      const files = Array.from(event.target.files ?? []);
      event.target.value = '';
      if (!files.length) return;
      try {
        onPick(await Promise.all(files.slice(0, multiple ? 4 : 1).map(file => imageFileToDataUrl(file))));
        if (multiple && files.length > 4) toast('Only the first 4 photos were added');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Could not add that photo');
      }
    }}
  />;
  return { open: () => input.current?.click(), element };
}

export function EmptyState({ icon: Icon, title, body, children }: { icon: typeof Home; title: string; body: string; children?: ReactNode }) {
  return <div className="db-empty">
    <span><Icon /></span>
    <strong>{title}</strong>
    <p>{body}</p>
    {children}
  </div>;
}
