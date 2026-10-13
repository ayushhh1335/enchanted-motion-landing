import { useRef, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  Bell, Bookmark, CalendarDays, FileUser, HandHeart, Home, MessageCircle, Settings, Sparkles, UserRound, Users, UsersRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { imageFileToDataUrl } from '@/lib/image-file';
import type { Person } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';

export const views = ['home', 'network', 'messages', 'communities', 'campaigns', 'events', 'vibeys', 'cvision', 'saved', 'notifications', 'profile', 'settings'] as const;
export type View = (typeof views)[number];
export const isView = (value: unknown): value is View => typeof value === 'string' && (views as readonly string[]).includes(value);

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

export function ViewLink({ view, className, children, onClick, ...rest }: { view: View; className?: string | undefined; children: ReactNode; onClick?: (() => void) | undefined; 'aria-label'?: string | undefined; 'aria-current'?: 'page' | undefined }) {
  return <Link to="/dashboard" search={view === 'home' ? {} : { view }} className={className} onClick={onClick} {...rest}>{children}</Link>;
}

export function Avatar({ person, size = 40, ring, online, className }: { person: Pick<Person, 'photo' | 'name'> & { online?: boolean | undefined }; size?: number; ring?: 'story' | 'seen' | undefined; online?: boolean | undefined; className?: string | undefined }) {
  return <span className={cn('db-avatar', ring && `is-${ring}`, className)} style={{ width: size, height: size }}>
    <img src={person.photo} alt="" loading="lazy" />
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
