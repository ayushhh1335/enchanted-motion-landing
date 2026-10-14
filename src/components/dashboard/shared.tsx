import { useRef, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { formatDistanceToNowStrict } from 'date-fns';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';
import { AnimatePresence, motion } from 'motion/react';
import {
  BadgeCheck, Bell, BookUser, Bookmark, CalendarDays, Check, Crown, FileUser, GraduationCap, HandHeart, Home, Lightbulb, MapPin, MessageCircle, ReceiptText,
  Settings, ShieldCheck, Sparkles, UserPlus, UserRound, Users, UsersRound, Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AnimatedTooltip } from '@/components/ui/animated-tooltip';
import { imageFileToDataUrl } from '@/lib/image-file';
import { ME_ID, majorOf, people, personById, type Person } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';
import { useDashboard } from './store';

export const views = ['home', 'network', 'messages', 'communities', 'campaigns', 'events', 'vibeys', 'cvision', 'saved', 'suggestions', 'notifications', 'profile', 'account', 'settings'] as const;
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

export const settingsTabs = ['activity', 'appearance', 'notifications', 'privacy'] as const;
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
  { view: 'suggestions', label: 'Suggestions', icon: Lightbulb },
  { view: 'notifications', label: 'Notifications', icon: Bell },
  { view: 'profile', label: 'Profile', icon: UserRound },
  { view: 'settings', label: 'Settings', icon: Settings },
];

export function ViewLink({ view, tab, className, children, onClick, ...rest }: { view: View; tab?: string | undefined; className?: string | undefined; children: ReactNode; onClick?: (() => void) | undefined; 'aria-label'?: string | undefined; 'aria-current'?: 'page' | undefined }) {
  return <Link to="/dashboard" search={view === 'home' ? {} : tab ? { view, tab } : { view }} className={className} onClick={onClick} {...rest}>{children}</Link>;
}

/** Opens a student's profile; your own id goes to your profile. Other students get an animated hover card unless `card` is false. */
export function ProfileLink({ personId, className, children, onClick, card = true, 'aria-label': label }: { personId: string; className?: string | undefined; children: ReactNode; onClick?: (() => void) | undefined; card?: boolean; 'aria-label'?: string | undefined }) {
  const link = <Link
    to="/dashboard"
    search={personId === ME_ID ? { view: 'profile' } : { view: 'profile', person: personId }}
    className={cn('db-profile-link', className)}
    onClick={onClick}
    aria-label={label}
  >{children}</Link>;
  return card && personId !== ME_ID ? <ProfileHoverCard personId={personId} onNavigate={onClick}>{link}</ProfileHoverCard> : link;
}

function ProfileHoverCard({ personId, onNavigate, children }: { personId: string; onNavigate?: (() => void) | undefined; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <HoverCardPrimitive.Root open={open} onOpenChange={setOpen} openDelay={400} closeDelay={150}>
    <HoverCardPrimitive.Trigger asChild>{children}</HoverCardPrimitive.Trigger>
    <AnimatePresence>
      {open ? <HoverCardPrimitive.Portal forceMount>
        <HoverCardPrimitive.Content forceMount asChild side="bottom" align="start" sideOffset={8} collisionPadding={12}>
          <motion.div
            className="db-hcard"
            initial={{ opacity: 0, y: 10, scale: 0.92, rotateX: -14 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 6, scale: 0.96, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 24 }}
          >
            <ProfileHoverBody personId={personId} onNavigate={() => { setOpen(false); onNavigate?.(); }} />
          </motion.div>
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Portal> : null}
    </AnimatePresence>
  </HoverCardPrimitive.Root>;
}

function ProfileHoverBody({ personId, onNavigate }: { personId: string; onNavigate: () => void }) {
  const { connections, posts, chats, spotlight, actions } = useDashboard();
  const person = personById(personId);
  const state = connections[personId] ?? 'none';
  const first = person.name.replace(/^(Dr|Prof|Coach)\.?\s+/, '').split(' ')[0];
  const chat = chats.find(c => c.personId === personId);
  const mutuals = people.filter(p => p.id !== ME_ID && p.id !== personId && connections[p.id] === 'connected').slice(0, 4);
  const stagger = (i: number) => ({ initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.06 + i * 0.04 } });

  return <>
    <div className="db-hcard-cover" aria-hidden="true"><i /><i /></div>
    <motion.div className="db-hcard-face" initial={{ scale: 0.6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.05 }}>
      <Avatar person={person} size={64} />
      {spotlight.personId === personId ? <span className="db-hcard-crown" title="Student of the Day"><Crown /></span> : null}
    </motion.div>
    <motion.div className="db-hcard-id" {...stagger(0)}>
      <strong>{person.name} {person.verified ? <BadgeCheck className="db-verified" aria-label="Verified" /> : null}</strong>
      <small>@{person.handle}{person.online ? <em> · Active now</em> : null}</small>
    </motion.div>
    <motion.p className="db-hcard-meta" {...stagger(1)}><GraduationCap /> {majorOf(person)} · {person.school}</motion.p>
    <motion.p className="db-hcard-meta" {...stagger(2)}><MapPin /> {person.city} · {person.year}</motion.p>
    <motion.dl className="db-hcard-stats" {...stagger(3)}>
      <div><dt>Mutual</dt><dd>{person.mutual}</dd></div>
      <div><dt>Posts</dt><dd>{posts.filter(post => post.authorId === personId).length}</dd></div>
      <div><dt>Status</dt><dd>{state === 'connected' ? 'Friends' : state === 'pending' ? 'Requested' : state === 'incoming' ? 'Wants in' : 'New'}</dd></div>
    </motion.dl>
    {mutuals.length ? <motion.div className="db-hcard-mutual" {...stagger(4)}>
      <AnimatedTooltip items={mutuals.map(m => ({ id: m.id, name: m.name, designation: `${majorOf(m)} · ${m.school}`, avatar: <Avatar person={m} size={26} /> }))} />
      <small>Friends with {mutuals[0]?.name.split(' ')[0]}{mutuals.length > 1 ? ` and ${person.mutual > 1 ? person.mutual - 1 : mutuals.length - 1} more` : ''}</small>
    </motion.div> : null}
    <motion.div className="db-hcard-actions" {...stagger(5)}>
      {state === 'connected'
        ? <Button variant="ink" size="sm" asChild><Link to="/dashboard" search={chat ? { view: 'messages', chat: chat.id } : { view: 'messages' }} onClick={onNavigate}><MessageCircle /> Message</Link></Button>
        : state === 'incoming'
          ? <Button variant="ink" size="sm" onClick={() => { actions.setConnection(personId, 'connected'); toast.success(`You and ${first} are now friends`); }}><Check /> Accept</Button>
          : <Button variant={state === 'pending' ? 'soft' : 'ink'} size="sm" onClick={() => actions.setConnection(personId, state === 'pending' ? 'none' : 'pending')}>
            {state === 'pending' ? <><Check /> Requested</> : <><UserPlus /> Connect</>}
          </Button>}
      <Button variant="soft" size="sm" asChild><Link to="/dashboard" search={{ view: 'profile', person: personId }} onClick={onNavigate}>View profile</Link></Button>
    </motion.div>
  </>;
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
