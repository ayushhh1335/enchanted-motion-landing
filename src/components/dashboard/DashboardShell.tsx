import { useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Bell, FileUser, HandHeart, Home, ImagePlus, LogOut, Menu, MessageCircle, PenSquare, Plus, PlusCircle, Search, Settings,
  UserRound, Users, UsersRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LogoMark, Wordmark } from '@/components/site-chrome';
import { signOutDemo } from '@/lib/demo-session';
import { ME_ID, me, people } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';
import { Composer, Feed } from './Feed';
import { CVisionPromo, LeftRail, ProfileCard, RightRail, SideNav, SuggestedConnections, VibeysMini } from './Rails';
import { StoriesRail } from './Stories';
import { CampaignDialog, ForumDialog } from './dialogs';
import { Avatar, ViewLink, usePhotoPicker, type View } from './shared';
import { useDashboard } from './store';
import { CommunitiesView, MessagesView, NetworkView, NoticeList, NotificationsView, ProfileView, SavedView } from './views-social';
import { CVisionView, CampaignsView, EventsView, SettingsView, VibeysView } from './views-growth';

/** Views that keep the suggestions rail; the rest use its width for content. */
const withRail: View[] = ['home', 'saved', 'notifications', 'events'];

export function DashboardShell({ view, chat }: { view: View; chat?: string | undefined }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

  return <div className="db-page">
    <div className="db-aurora" aria-hidden="true"><span /><span /><span /><span /></div>
    <TopBar onMenu={() => setMenuOpen(true)} onCompose={() => setComposeOpen(true)} />
    <div className={cn('db-layout', !withRail.includes(view) && 'is-wide', view === 'messages' && 'is-messages')}>
      <LeftRail active={view} />
      <main className="db-main" id="main">
        <ActiveView view={view} chat={chat} />
      </main>
      {withRail.includes(view) ? <RightRail /> : null}
    </div>
    <BottomNav view={view} onCompose={() => setComposeOpen(true)} />

    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent side="left" className="db-sheet">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Your profile and dashboard sections</SheetDescription>
        <ProfileCard />
        <SideNav active={view} onNavigate={() => setMenuOpen(false)} />
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

function ActiveView({ view, chat }: { view: View; chat?: string | undefined }) {
  switch (view) {
    case 'network': return <NetworkView />;
    case 'messages': return <MessagesView chatId={chat} />;
    case 'communities': return <CommunitiesView />;
    case 'campaigns': return <CampaignsView />;
    case 'events': return <EventsView />;
    case 'vibeys': return <VibeysView />;
    case 'cvision': return <CVisionView />;
    case 'saved': return <SavedView />;
    case 'notifications': return <NotificationsView />;
    case 'profile': return <ProfileView />;
    case 'settings': return <SettingsView />;
    default: return <>
      <StoriesRail />
      <div className="db-mobile-only"><VibeysMini /></div>
      <Feed />
      <div className="db-mobile-only"><SuggestedConnections limit={3} /></div>
    </>;
  }
}

function TopBar({ onMenu, onCompose }: { onMenu: () => void; onCompose: () => void }) {
  const { chats, notices, connections, actions } = useDashboard();
  const navigate = useNavigate();
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [forumOpen, setForumOpen] = useState(false);
  const storyPicker = usePhotoPicker(([image]) => { if (image) actions.addStory(image, ''); });
  const unreadChats = chats.reduce((n, c) => n + c.unread, 0);
  const unreadNotices = notices.filter(n => n.unread).length;

  function signOut() {
    signOutDemo();
    navigate({ to: '/login' });
  }

  return <header className="db-top">
    <button type="button" className="db-icon-btn db-menu-btn" aria-label="Open menu" onClick={onMenu}><Menu /></button>
    <ViewLink view="home" className="bj-logo db-logo" aria-label="ByeUni home feed"><LogoMark /><Wordmark /></ViewLink>
    <GlobalSearch />
    <div className="db-top-actions">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ink" className="db-create"><PlusCircle /><span>Create</span></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="db-menu">
          <DropdownMenuItem onSelect={onCompose}><PenSquare />Post</DropdownMenuItem>
          <DropdownMenuItem onSelect={storyPicker.open}><ImagePlus />Story</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCampaignOpen(true)}><HandHeart />Campaign</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setForumOpen(true)}><UsersRound />Forum</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {storyPicker.element}
      <ViewLink view="messages" className="db-icon-btn db-badged" aria-label={`Messages, ${unreadChats} unread`}>
        <MessageCircle />{unreadChats ? <em>{unreadChats}</em> : null}
      </ViewLink>
      <Popover onOpenChange={open => { if (!open && unreadNotices) actions.markNoticesRead(); }}>
        <PopoverTrigger asChild>
          <button type="button" className="db-icon-btn db-badged" aria-label={`Notifications, ${unreadNotices} unread`}>
            <Bell />{unreadNotices ? <em>{unreadNotices}</em> : null}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="db-popover">
          <header className="db-panel-head"><h2>Notifications</h2><ViewLink view="notifications" className="db-link">See all</ViewLink></header>
          <NoticeList compactMode notices={notices.slice(0, 5)} connections={connections} onAccept={id => actions.setConnection(id, 'connected')} />
        </PopoverContent>
      </Popover>
      <span className="db-theme"><ThemeToggle /></span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="db-me-btn" aria-label="Account menu"><Avatar person={me} size={38} /></button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="db-menu">
          <DropdownMenuLabel><strong>{me.name}</strong><small>{me.school}</small></DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><ViewLink view="profile"><UserRound />Profile</ViewLink></DropdownMenuItem>
          <DropdownMenuItem asChild><ViewLink view="cvision"><FileUser />CVision</ViewLink></DropdownMenuItem>
          <DropdownMenuItem asChild><ViewLink view="settings"><Settings />Settings</ViewLink></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/"><Home />ByeUni home page</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={signOut}><LogOut />Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <CampaignDialog open={campaignOpen} onOpenChange={setCampaignOpen} />
    <ForumDialog open={forumOpen} onOpenChange={setForumOpen} />
  </header>;
}

function GlobalSearch() {
  const { communities, campaigns } = useDashboard();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    const found: { id: string; label: string; meta: string; image: string; view: View }[] = [];
    people.filter(p => p.id !== ME_ID && `${p.name} ${p.school} ${p.major}`.toLowerCase().includes(q))
      .forEach(p => found.push({ id: p.id, label: p.name, meta: `${p.major} · ${p.school}`, image: p.photo, view: 'network' }));
    communities.filter(c => c.name.toLowerCase().includes(q))
      .forEach(c => found.push({ id: c.id, label: c.name, meta: `Forum · ${c.members.toLocaleString('en-US')} members`, image: c.image, view: 'communities' }));
    campaigns.filter(c => c.title.toLowerCase().includes(q))
      .forEach(c => found.push({ id: c.id, label: c.title, meta: `Campaign · ${c.category}`, image: c.image, view: 'campaigns' }));
    return found.slice(0, 7);
  }, [q, communities, campaigns]);

  function go(view: View) {
    setQuery('');
    setFocused(false);
    navigate({ to: '/dashboard', search: { view } });
  }

  return <div className="db-search">
    <Search aria-hidden="true" />
    <input
      value={query}
      onChange={event => setQuery(event.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => window.setTimeout(() => setFocused(false), 150)}
      onKeyDown={event => { if (event.key === 'Enter' && results[0]) go(results[0].view); if (event.key === 'Escape') setQuery(''); }}
      placeholder="Search for students, universities, forums, campaigns…"
      aria-label="Search ByeUni"
      role="combobox"
      aria-expanded={focused && Boolean(q)}
      aria-controls="db-search-results"
    />
    {focused && q ? <ul id="db-search-results" className="db-search-results" role="listbox">
      {results.map(result => <li key={`${result.view}-${result.id}`} role="option" aria-selected="false">
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => go(result.view)}>
          <img src={result.image} alt="" /><span><strong>{result.label}</strong><small>{result.meta}</small></span>
        </button>
      </li>)}
      {results.length === 0 ? <li className="db-muted">No results for “{query}”</li> : null}
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
