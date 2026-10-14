import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowRight, BadgeCheck, Bell, Bookmark, Check, ChevronRight, CircleHelp, FileUser, History, Lightbulb, ListChecks, LogOut, Menu, Palette, Quote, ReceiptText, Settings,
  Sparkles, SquarePlus, UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { openQuoteOfTheDay } from '@/components/quote-of-the-day';
import { LogoMark } from '@/components/site-chrome';
import { ME_ID, isMajorMate, isSchoolmate, majorOf, me, people, personById } from '@/content/dashboard-data';
import { signOutDemo } from '@/lib/demo-session';
import { cn } from '@/lib/utils';
import { CreateMenu } from './CreateMenu';
import { CompleteProfileDialog, DonateDialog, EditProfileDialog } from './dialogs';
import { InviteDialog, SchoolUpdates } from './home-widgets';
import { Avatar, Bar, PanelHead, ProfileLink, ViewLink, compact, navItems, usd, type View } from './shared';
import { completionOf, useDashboard, useProfileSteps, type LiveCampaign } from './store';

export function ProfileCard() {
  const { posts, connections, vibeys } = useDashboard();
  const [editing, setEditing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [inviting, setInviting] = useState(false);
  const completion = completionOf(useProfileSteps());
  const connected = Object.values(connections).filter(state => state === 'connected').length + 248;
  return <section className="db-panel db-profile-card">
    <ViewLink view="profile" className="db-profile-id">
      <Avatar person={me} size={60} />
      <div>
        <strong>{me.name} <BadgeCheck className="db-verified" aria-label="Verified" /></strong>
        <small>{me.major}</small>
        <small>{me.school}</small>
      </div>
    </ViewLink>
    <dl className="db-stats">
      <div><dt>Connections</dt><dd>{connected}</dd></div>
      <div><dt>Posts</dt><dd>{posts.filter(post => post.authorId === ME_ID).length}</dd></div>
      <div><dt>Vibeys</dt><dd>{compact(vibeys.balance)}</dd></div>
    </dl>
    <div className="db-completion">
      <span>Profile completion</span><b>{completion}%</b>
    </div>
    <Bar value={completion} max={100} />
    {completion < 100
      ? <button type="button" className="db-soft-btn" onClick={() => setCompleting(true)}>Complete your profile <ArrowRight /></button>
      : <button type="button" className="db-soft-btn" onClick={() => setEditing(true)}>Edit profile <ArrowRight /></button>}
    <button type="button" className="db-invite-btn" onClick={() => setInviting(true)}><UserPlus /> Invite to join ByeUni <em>+20</em></button>
    <EditProfileDialog open={editing} onOpenChange={setEditing} />
    <CompleteProfileDialog open={completing} onOpenChange={setCompleting} />
    <InviteDialog open={inviting} onOpenChange={setInviting} />
  </section>;
}

export function SideNav({ active, onNavigate, onNotifications, compactMode }: { active: View; onNavigate?: () => void; onNotifications?: () => void; compactMode?: boolean }) {
  const { notices } = useDashboard();
  const unreadNotices = notices.filter(n => n.unread).length;
  const badges: Partial<Record<View, number>> = { notifications: unreadNotices };
  return <nav className={cn('db-nav', compactMode && 'is-compact')} aria-label="Dashboard">
    {navItems.filter(item => item.view !== 'profile' && item.view !== 'messages').map(item => item.view === 'notifications' && onNotifications
      ? <button key={item.view} type="button" className="db-nav-item" onClick={onNotifications}>
        <item.icon />
        <span>{item.label}</span>
        {unreadNotices ? <em>{unreadNotices}</em> : null}
      </button>
      : <ViewLink
      key={item.view}
      view={item.view}
      className={cn('db-nav-item', active === item.view && 'is-active')}
      aria-current={active === item.view ? 'page' : undefined}
      onClick={onNavigate}
    >
      <item.icon />
      <span>{item.label}</span>
      {badges[item.view] ? <em>{badges[item.view]}</em> : null}
    </ViewLink>)}
  </nav>;
}

export function CVisionPromo() {
  return <ViewLink view="cvision" className="db-panel db-promo">
    <span className="db-promo-icon"><FileUser /></span>
    <div><strong>Build your CVision</strong><small>Showcase your skills, projects, and achievements to the world.</small></div>
    <ChevronRight />
  </ViewLink>;
}

const dockViews: View[] = ['home', 'network', 'communities', 'campaigns', 'events', 'cvision'];
const moreViews: View[] = ['saved', 'vibeys', 'suggestions', 'settings', 'account'];

/** Instagram-style rail: icons only, labels slide out on hover or keyboard focus. Stays slim while the notifications drawer is open. */
export function LeftRail({ active, onCompose, noticesOpen, onNotices }: { active: View; onCompose: () => void; noticesOpen: boolean; onNotices: (open: boolean) => void }) {
  const { notices } = useDashboard();
  const [moreOpen, setMoreOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const completion = completionOf(useProfileSteps());
  const unreadNotices = notices.filter(n => n.unread).length;
  const current = noticesOpen ? null : active;
  return <aside className={cn('db-dock', (moreOpen || createOpen) && 'is-open', noticesOpen && 'is-slim')} aria-label="Dashboard navigation">
    <ViewLink view="profile" className={cn('db-dock-item db-dock-me', current === 'profile' && 'is-active')} aria-current={current === 'profile' ? 'page' : undefined}>
      <Avatar person={me} size={28} />
      <span><strong>{me.name}</strong><small>Profile {completion}% complete</small></span>
    </ViewLink>
    <i className="db-dock-sep" aria-hidden="true" />
    <nav className="db-dock-nav" aria-label="Dashboard">
      {navItems.filter(item => dockViews.includes(item.view)).map(item => <ViewLink
        key={item.view}
        view={item.view}
        className={cn('db-dock-item', current === item.view && 'is-active')}
        aria-current={current === item.view ? 'page' : undefined}
      >
        <item.icon />
        <span>{item.label}</span>
      </ViewLink>)}
      <button
        type="button"
        className={cn('db-dock-item db-dock-bell', noticesOpen && 'is-active')}
        aria-expanded={noticesOpen}
        aria-label={unreadNotices ? `Notifications, ${unreadNotices} unread` : 'Notifications'}
        onClick={() => onNotices(!noticesOpen)}
      >
        <Bell />
        <span>Notifications</span>
        {unreadNotices ? <em>{unreadNotices}</em> : null}
      </button>
      <CreateMenu onCompose={onCompose} side="right" align="start" onOpenChange={setCreateOpen}>
        <button type="button" className={cn('db-dock-item', createOpen && 'is-active')} aria-label="Create">
          <SquarePlus /><span>Create</span>
        </button>
      </CreateMenu>
    </nav>
    <MoreMenu open={moreOpen} onOpenChange={setMoreOpen} active={current ? moreViews.includes(current) : false} completion={completion} />
  </aside>;
}

function MoreMenu({ open, onOpenChange, active, completion }: { open: boolean; onOpenChange: (open: boolean) => void; active: boolean; completion: number }) {
  const { posts, vibeys } = useDashboard();
  const navigate = useNavigate();
  const [inviting, setInviting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const close = () => onOpenChange(false);
  const savedCount = posts.filter(post => post.saved).length;

  function signOut() {
    signOutDemo();
    navigate({ to: '/login' });
  }

  return <>
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button type="button" className={cn('db-dock-item db-dock-more', active && 'is-active')} aria-label="More">
          <Menu /><span>More</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" sideOffset={10} className="db-more">
        <ViewLink view="saved" className="db-more-item" onClick={close}>
          <Bookmark /><span>Saved<small>{savedCount ? `${savedCount} saved post${savedCount === 1 ? '' : 's'}` : 'Posts you bookmark'}</small></span>
        </ViewLink>
        <ViewLink view="vibeys" className="db-more-item" onClick={close}>
          <Sparkles /><span>My Vibeys<small>{vibeys.balance.toLocaleString('en-US')} points · {vibeys.streak}-day streak</small></span>
        </ViewLink>
        <ViewLink view="suggestions" className="db-more-item" onClick={close}>
          <Lightbulb /><span>Suggestions<small>Send ideas to {me.school.split(' ')[0]}’s admins</small></span>
        </ViewLink>
        <ViewLink view="settings" tab="activity" className="db-more-item" onClick={close}>
          <History /><span>My activity<small>Likes, comments, posts, and donations</small></span>
        </ViewLink>
        <button type="button" className="db-more-item" onClick={() => { close(); openQuoteOfTheDay(); }}>
          <Quote /><span>Quote of the day<small>A thought for today, picked by ByeUni</small></span>
        </button>
        {completion < 100 ? <button type="button" className="db-more-item" onClick={() => { close(); setCompleting(true); }}>
          <ListChecks /><span>Complete your profile<small>{completion}% done</small></span>
        </button> : null}
        <button type="button" className="db-more-item" onClick={() => { close(); setInviting(true); }}>
          <UserPlus /><span>Invite friends<small>Earn 20 Vibeys per signup</small></span>
        </button>
        <i className="db-more-sep" aria-hidden="true" />
        <ViewLink view="settings" className="db-more-item" onClick={close}><Settings /><span>Settings</span></ViewLink>
        <ViewLink view="settings" tab="payments" className="db-more-item" onClick={close}><ReceiptText /><span>Payments & donations</span></ViewLink>
        <ViewLink view="settings" tab="appearance" className="db-more-item" onClick={close}><Palette /><span>Switch appearance</span></ViewLink>
        <Link to="/faqs" className="db-more-item" onClick={close}><CircleHelp /><span>Help & FAQs</span></Link>
        <i className="db-more-sep" aria-hidden="true" />
        <button type="button" className="db-more-item" onClick={signOut}><LogOut /><span>Sign out</span></button>
      </PopoverContent>
    </Popover>
    <InviteDialog open={inviting} onOpenChange={setInviting} />
    <CompleteProfileDialog open={completing} onOpenChange={setCompleting} />
  </>;
}

export function SuggestedConnections({ limit = 3 }: { limit?: number }) {
  const { connections, dismissed, actions } = useDashboard();
  const [scope, setScope] = useState<'school' | 'major'>('school');
  const list = people.filter(person => (scope === 'school' ? isSchoolmate(person) : isMajorMate(person))
    && !dismissed.includes(person.id) && ['none', 'pending'].includes(connections[person.id] ?? 'none')).slice(0, limit);
  return <section className="db-rr-sec db-rr-people">
    <PanelHead title="People you may know" action={<ViewLink view="network" tab={scope} className="db-link">See all</ViewLink>} />
    <div className="db-seg" role="tablist" aria-label="Suggestion group">
      <button type="button" role="tab" aria-selected={scope === 'school'} onClick={() => setScope('school')}>School</button>
      <button type="button" role="tab" aria-selected={scope === 'major'} onClick={() => setScope('major')}>Major</button>
    </div>
    {list.length === 0 ? <p className="db-muted">You're connected with everyone we'd suggest. Nice.</p> : null}
    <ul className="db-people-list">
      {list.map(person => {
        const pending = connections[person.id] === 'pending';
        return <li key={person.id}>
          <ProfileLink personId={person.id} aria-label={`${person.name}'s profile`}><Avatar person={person} size={40} /></ProfileLink>
          <div><strong><ProfileLink personId={person.id} className="db-name-link">{person.name}</ProfileLink></strong><small>{scope === 'school' ? majorOf(person) : person.school} · {person.mutual} mutual</small></div>
          <Button variant="soft" size="sm" className={cn('db-connect', pending && 'is-pending')} onClick={() => actions.setConnection(person.id, pending ? 'none' : 'pending')}>
            {pending ? <><Check /> Pending</> : <><UserPlus /> Connect</>}
          </Button>
        </li>;
      })}
    </ul>
  </section>;
}

export function FundraisersToSupport({ limit = 2 }: { limit?: number }) {
  const { campaigns } = useDashboard();
  const [donating, setDonating] = useState<LiveCampaign | null>(null);
  const list = campaigns.filter(c => c.ownerId !== ME_ID).slice(0, limit);
  return <section className="db-rr-sec db-rr-tall">
    <PanelHead title="Fundraiser to support" action={<ViewLink view="campaigns" className="db-link">See all</ViewLink>} />
    <ul className="db-fund-list">
      {list.map(c => {
        const owner = personById(c.ownerId);
        return <li key={c.id}>
          <img src={c.image} alt="" />
          <div>
            <strong>{c.title}</strong>
            <small><ProfileLink personId={owner.id} className="db-name-link">{owner.name}</ProfileLink> · {owner.school}</small>
          </div>
          <Button variant="soft" size="sm" className="db-connect" onClick={() => setDonating(c)}>Support</Button>
          <div className="db-fund-meta">
            <Bar value={c.raised} max={c.goal} />
            <span><b>{usd(c.raised)}</b> of {usd(c.goal)}</span><span>{c.daysLeft} days left</span>
          </div>
        </li>;
      })}
    </ul>
    <DonateDialog campaign={donating} onClose={() => setDonating(null)} />
  </section>;
}

export function EventDate({ date }: { date: string }) {
  const d = new Date(`${date}T12:00:00`);
  return <span className="db-date"><small>{d.toLocaleString('en-US', { month: 'short' })}</small><b>{d.getDate()}</b></span>;
}

export function VibeysMini() {
  const { vibeys } = useDashboard();
  return <ViewLink view="vibeys" className="db-panel db-vibeys-mini">
    <span className="db-promo-icon is-sun"><Sparkles /></span>
    <div><strong>{vibeys.balance.toLocaleString('en-US')} Vibeys</strong><small>{vibeys.streak}-day login streak · redeem rewards</small></div>
    <ChevronRight />
  </ViewLink>;
}

/** One compact card, sized to fit the screen; lower-priority sections drop out on short viewports. */
export function RightRail() {
  return <aside className="db-right" aria-label="Suggestions">
    <div className="db-panel db-rr">
      <SchoolUpdates compact />
      <SuggestedConnections />
      <FundraisersToSupport limit={1} />
      <DashFooter />
    </div>
  </aside>;
}

export function DashFooter({ className }: { className?: string }) {
  return <footer className={cn('db-foot', className)}>
    <nav aria-label="About ByeUni">
      <Link to="/about">About</Link>
      <Link to="/faqs">Help</Link>
      <Link to="/blog">Blog</Link>
      <Link to="/contact">Contact</Link>
      <Link to="/privacy">Privacy</Link>
      <Link to="/terms">Terms</Link>
    </nav>
    <div className="db-foot-brand">
      <Link to="/" className="db-foot-logo" aria-label="ByeUni home"><LogoMark /></Link>
      <span>© {new Date().getFullYear()} ByeUni</span>
      <em>Demo data</em>
    </div>
  </footer>;
}
