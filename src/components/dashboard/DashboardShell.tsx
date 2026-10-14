import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowUpRight, Bell, CalendarDays, HandHeart, Home, LogOut, Menu, MessageCircle, Plus, PlusCircle, Search, Settings, Sparkles, Users, UsersRound, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { ThemePicker } from '@/components/Appearance';
import { LogoMark, Wordmark } from '@/components/site-chrome';
import { signOutDemo } from '@/lib/demo-session';
import { ME_ID, isSchoolmate, majorOf, me, people } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';
import { CreateMenu } from './CreateMenu';
import { Composer, Feed } from './Feed';
import { CVisionPromo, DashFooter, LeftRail, ProfileCard, RightRail, SideNav } from './Rails';
import { MessagesDock } from './MessagesDock';
import { NotificationsPanel } from './NotificationsPanel';
import { StoriesRail } from './Stories';
import { SchoolUpdates, VibeCheck } from './home-widgets';
import { Avatar, ViewLink, accountItems, compact, faceTone, initials, isAccountTab, isSettingsSection, type View } from './shared';
import { useDashboard } from './store';
import {
  CommunitiesView, MessagesView, NetworkView, NotificationsView, PersonProfileView, ProfileView, SavedView,
} from './views-social';
import { CampaignsView, EventsView, SettingsView, VibeysView } from './views-growth';
import { CVisionView, PersonCVisionView } from './cvision/CVisionView';
import { SuggestionsView } from './views-suggestions';

/** Views that keep the suggestions rail; the rest use its width for content. */
const withRail: View[] = ['home', 'saved', 'notifications', 'events'];

export function DashboardShell({ view, chat, tab, person }: { view: View; chat?: string | undefined; tab?: string | undefined; person?: string | undefined }) {
  const { actions } = useDashboard();
  const [menuOpen, setMenuOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [noticesOpen, setNoticesOpen] = useState(false);
  const wasOpen = useRef(false);

  useEffect(() => { setNoticesOpen(false); }, [view, chat, tab, person]);
  // Notices stay highlighted while the drawer is open and count as read once it closes.
  useEffect(() => {
    if (wasOpen.current && !noticesOpen) actions.markNoticesRead();
    wasOpen.current = noticesOpen;
  }, [noticesOpen, actions]);

  const openCompose = () => setComposeOpen(true);

  return <div className="db-page has-dock">
    <div className="db-aurora" aria-hidden="true"><span /><span /><span /><span /></div>
    <TopBar onMenu={() => setMenuOpen(true)} onCompose={openCompose} noticesOpen={noticesOpen} onNotices={setNoticesOpen} />
    <LeftRail active={view} onCompose={openCompose} noticesOpen={noticesOpen} onNotices={setNoticesOpen} />
    <NotificationsPanel open={noticesOpen} onClose={() => setNoticesOpen(false)} />
    <div className={cn('db-layout', !withRail.includes(view) && 'is-wide', view === 'messages' && 'is-messages')}>
      <main className="db-main" id="main">
        <ActiveView view={view} chat={chat} tab={tab} person={person} />
        {view !== 'messages' ? <DashFooter className="db-main-foot" /> : null}
      </main>
      {withRail.includes(view) ? <RightRail /> : null}
    </div>
    {view !== 'messages' ? <MessagesDock /> : null}
    <BottomNav view={view} onCompose={openCompose} />

    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent side="left" className="db-sheet">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Your profile and dashboard sections</SheetDescription>
        <ProfileCard />
        <SideNav active={view} onNavigate={() => setMenuOpen(false)} onNotifications={() => { setMenuOpen(false); setNoticesOpen(true); }} />
        <CVisionPromo />
      </SheetContent>
    </Sheet>

    <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
      <DialogContent className="db-dialog db-compose-dialog">
        <DialogTitle>Create a post</DialogTitle>
        <DialogDescription className="sr-only">Share an update, photos, a project, or an achievement.</DialogDescription>
        <Composer autoFocus onDone={() => setComposeOpen(false)} />
      </DialogContent>
    </Dialog>
  </div>;
}

function ActiveView({ view, chat, tab, person }: { view: View; chat?: string | undefined; tab?: string | undefined; person?: string | undefined }) {
  switch (view) {
    case 'network': return <NetworkView key={tab ?? 'all'} scope={tab === 'school' || tab === 'major' ? tab : undefined} />;
    case 'account': return <SettingsView tab={isAccountTab(tab) ? tab : 'details'} />;
    case 'messages': return <MessagesView chatId={chat} />;
    case 'communities': return <CommunitiesView />;
    case 'campaigns': return <CampaignsView />;
    case 'events': return <EventsView />;
    case 'vibeys': return <VibeysView />;
    case 'cvision': return person && person !== ME_ID ? <PersonCVisionView key={person} personId={person} /> : <CVisionView />;
    case 'saved': return <SavedView />;
    case 'suggestions': return <SuggestionsView />;
    case 'notifications': return <NotificationsView />;
    case 'profile': return person && person !== ME_ID ? <PersonProfileView key={person} personId={person} /> : <ProfileView />;
    case 'settings': return <SettingsView tab={isSettingsSection(tab) ? tab : undefined} />;
    default: return <>
      <StoriesRail />
      <VibeCheck />
      <div className="db-mobile-only"><SchoolUpdates /></div>
      <Feed />
    </>;
  }
}

function TopBar({ onMenu, onCompose, noticesOpen, onNotices }: { onMenu: () => void; onCompose: () => void; noticesOpen: boolean; onNotices: (open: boolean) => void }) {
  const { chats, notices, vibeys } = useDashboard();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const unreadChats = chats.reduce((n, c) => n + c.unread, 0);
  const unreadNotices = notices.filter(n => n.unread).length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function signOut() {
    signOutDemo();
    navigate({ to: '/login' });
  }

  return <header className={cn('db-top', scrolled && 'is-scrolled')}>
    <button type="button" className="db-icon-btn db-menu-btn" aria-label="Open menu" onClick={onMenu}><Menu /></button>
    <ViewLink view="home" className="bj-logo db-logo" aria-label="ByeUni home feed"><LogoMark /><Wordmark /></ViewLink>
    <GlobalSearch />
    <div className="db-top-actions">
      <CreateMenu onCompose={onCompose}>
        <Button variant="ink" className="db-create"><PlusCircle /><span>Create</span></Button>
      </CreateMenu>
      <ViewLink view="vibeys" className="db-top-vibeys" aria-label={`${vibeys.balance} Vibeys`}>
        <Sparkles /><b>{compact(vibeys.balance)}</b>
      </ViewLink>
      <ViewLink view="messages" className="db-icon-btn db-badged db-top-msgs" aria-label={`Messages, ${unreadChats} unread`}>
        <MessageCircle />{unreadChats ? <em>{unreadChats}</em> : null}
      </ViewLink>
      <button
        type="button"
        className={cn('db-icon-btn db-badged db-top-bell', noticesOpen && 'is-on')}
        aria-label={`Notifications, ${unreadNotices} unread`}
        aria-expanded={noticesOpen}
        onClick={() => onNotices(!noticesOpen)}
      >
        <Bell />{unreadNotices ? <em>{unreadNotices}</em> : null}
      </button>
      <span className="db-theme"><ThemePicker /></span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="db-me-btn" aria-label="Account menu"><Avatar person={me} size={36} /></button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="db-menu db-me-menu">
          <DropdownMenuItem asChild>
            <ViewLink view="profile" className="db-me-card">
              <Avatar person={me} size={40} />
              <span><strong>{me.name}</strong><small>See your profile</small></span>
            </ViewLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><ViewLink view="settings"><Settings />Settings and privacy</ViewLink></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={signOut}><LogOut />Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>;
}

type SearchHit = { id: string; label: string; meta: string; image: string; view: View; icon?: typeof Home };

function GlobalSearch() {
  const { communities, campaigns } = useDashboard();
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    const found: SearchHit[] = [];
    people.filter(p => p.id !== ME_ID && `${p.name} ${p.school} ${p.major}`.toLowerCase().includes(q))
      .forEach(p => found.push({ id: p.id, label: p.name, meta: `${p.major} · ${p.school}`, image: p.photo, view: 'profile' }));
    accountItems.filter(item => `${item.label} ${item.note}`.toLowerCase().includes(q))
      .forEach(item => found.push({ id: item.tab, label: item.label, meta: `Settings · ${item.note}`, image: '', view: 'settings', icon: item.icon }));
    communities.filter(c => c.name.toLowerCase().includes(q))
      .forEach(c => found.push({ id: c.id, label: c.name, meta: `Forum · ${c.members.toLocaleString('en-US')} members`, image: c.image, view: 'communities' }));
    campaigns.filter(c => c.title.toLowerCase().includes(q))
      .forEach(c => found.push({ id: c.id, label: c.title, meta: `Campaign · ${c.category}`, image: c.image, view: 'campaigns' }));
    return found.slice(0, 7);
  }, [q, communities, campaigns]);

  const suggestions = useMemo<SearchHit[]>(() => [
    ...people.filter(p => p.id !== ME_ID && isSchoolmate(p)).slice(0, 3)
      .map(p => ({ id: p.id, label: p.name, meta: `${majorOf(p)} · ${p.school}`, image: p.photo, view: 'profile' as const })),
    { id: 'communities', label: 'Forums', meta: 'Browse campus groups', image: '', view: 'communities', icon: UsersRound },
    { id: 'campaigns', label: 'Fundraising', meta: 'Campaigns you can support', image: '', view: 'campaigns', icon: HandHeart },
    { id: 'events', label: 'Events', meta: 'What’s on this week', image: '', view: 'events', icon: CalendarDays },
  ], []);

  const hits = q ? results : suggestions;
  useEffect(() => { setActive(0); }, [q]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = (event.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable="true"]');
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
        event.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function go(hit: SearchHit) {
    setQuery('');
    setFocused(false);
    input.current?.blur();
    const { view, id } = hit;
    navigate({ to: '/dashboard', search: view === 'settings' ? { view, tab: id } : view === 'profile' ? { view, person: id } : { view } });
  }

  return <div className={cn('db-search', focused && 'is-focused')}>
    <Search aria-hidden="true" />
    <input
      ref={input}
      value={query}
      onChange={event => setQuery(event.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => window.setTimeout(() => setFocused(false), 150)}
      onKeyDown={event => {
        if (event.key === 'ArrowDown') { event.preventDefault(); setActive(i => Math.min(i + 1, hits.length - 1)); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
        else if (event.key === 'Enter' && hits[active]) go(hits[active]);
        else if (event.key === 'Escape') { setQuery(''); input.current?.blur(); }
      }}
      placeholder="Search students, forums, campaigns…"
      aria-label="Search ByeUni"
      role="combobox"
      aria-expanded={focused}
      aria-controls="db-search-results"
      aria-activedescendant={focused && hits[active] ? `db-search-hit-${active}` : undefined}
    />
    {query
      ? <button type="button" className="db-search-clear" aria-label="Clear search" onMouseDown={event => event.preventDefault()} onClick={() => setQuery('')}><X /></button>
      : <kbd className="db-search-kbd" aria-hidden="true">/</kbd>}
    {focused ? <ul id="db-search-results" className="db-search-results" role="listbox">
      <li role="presentation" className="db-search-label">{q ? 'Results' : 'Suggested for you'}</li>
      {hits.map((hit, i) => <li key={`${hit.view}-${hit.id}`} id={`db-search-hit-${i}`} role="option" aria-selected={i === active}>
        <button type="button" className={cn(i === active && 'is-active')} onMouseEnter={() => setActive(i)} onMouseDown={event => event.preventDefault()} onClick={() => go(hit)}>
          {hit.icon
            ? <b className="db-search-icon"><hit.icon /></b>
            : hit.image ? <img src={hit.image} alt="" /> : <b className="db-initials is-square" style={{ background: faceTone(hit.label) }}>{initials(hit.label)}</b>}
          <span><strong>{hit.label}</strong><small>{hit.meta}</small></span>
          <ArrowUpRight className="db-search-go" aria-hidden="true" />
        </button>
      </li>)}
      {q && hits.length === 0 ? <li className="db-muted">No results for “{query}”</li> : null}
    </ul> : null}
  </div>;
}

function BottomNav({ view, onCompose }: { view: View; onCompose: () => void }) {
  const items: { view: View; label: string; icon: typeof Home }[] = [
    { view: 'home', label: 'Home', icon: Home },
    { view: 'network', label: 'Network', icon: Users },
  ];
  const after: { view: View; label: string; icon: typeof Home }[] = [
    { view: 'campaigns', label: 'Fund', icon: HandHeart },
  ];
  const link = (item: (typeof items)[number]) => <ViewLink key={item.view} view={item.view} className={cn('db-tab', view === item.view && 'is-active')} aria-current={view === item.view ? 'page' : undefined}>
    <item.icon /><span>{item.label}</span>
  </ViewLink>;
  return <nav className="db-bottom" aria-label="Primary">
    {items.map(link)}
    <button type="button" className="db-tab db-tab-create" onClick={onCompose} aria-label="Create a post"><Plus /></button>
    {after.map(link)}
    <ViewLink view="profile" className={cn('db-tab', view === 'profile' && 'is-active')} aria-current={view === 'profile' ? 'page' : undefined}>
      <Avatar person={me} size={26} /><span>Profile</span>
    </ViewLink>
  </nav>;
}
