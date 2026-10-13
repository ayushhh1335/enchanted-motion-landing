import { useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Banknote, Bell, HandHeart, Home, LayoutDashboard, LogOut, Menu, Search, Settings, ShieldAlert, ShieldCheck } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { ThemePicker } from '@/components/Appearance';
import { LogoMark, Wordmark } from '@/components/site-chrome';
import { adminProfile, coverSrc } from '@/content/admin-data';
import { signOutDemo } from '@/lib/demo-session';
import { cn } from '@/lib/utils';
import { useAdmin } from './store';
import { Face, SectionLink, navGroups, userPhoto, type Section } from './ui';
import { OverviewView } from './views-overview';
import { CampaignsView, PaymentsView, WithdrawalsView } from './views-fundraising';
import { SchoolsView, UsersView } from './views-people';
import { ModerationView, SafetyView } from './views-trust';
import { LibraryView, SettingsView, VibeysView } from './views-platform';

export function AdminShell({ section, focus }: { section: Section; focus?: string | undefined }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="db-page adm-page">
    <div className="db-aurora" aria-hidden="true"><span /><span /><span /><span /></div>
    <TopBar onMenu={() => setMenuOpen(true)} />
    <div className="db-layout is-wide">
      <aside className="db-left" aria-label="Admin navigation">
        <AdminCard />
        <AdminNav active={section} />
      </aside>
      <main className="db-main" id="main">
        <ActiveSection section={section} focus={focus} />
      </main>
    </div>
    <BottomNav section={section} onMenu={() => setMenuOpen(true)} />
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent side="left" className="db-sheet">
        <SheetTitle className="sr-only">Admin menu</SheetTitle>
        <SheetDescription className="sr-only">Admin console sections</SheetDescription>
        <AdminCard />
        <AdminNav active={section} onNavigate={() => setMenuOpen(false)} />
      </SheetContent>
    </Sheet>
  </div>;
}

function ActiveSection({ section, focus }: { section: Section; focus?: string | undefined }) {
  switch (section) {
    case 'campaigns': return <CampaignsView focus={focus} />;
    case 'withdrawals': return <WithdrawalsView />;
    case 'payments': return <PaymentsView />;
    case 'users': return <UsersView focus={focus} />;
    case 'schools': return <SchoolsView focus={focus} />;
    case 'moderation': return <ModerationView />;
    case 'safety': return <SafetyView />;
    case 'vibeys': return <VibeysView />;
    case 'library': return <LibraryView />;
    case 'settings': return <SettingsView />;
    default: return <OverviewView />;
  }
}

function AdminCard() {
  const { counts } = useAdmin();
  const open = counts.withdrawals + counts.reports + counts.flags + counts.redemptions + counts.contests;
  return <section className="db-panel adm-me">
    <div className="db-profile-id">
      <Face name={adminProfile.name} photo={adminProfile.photo} size={52} />
      <div><strong>{adminProfile.name}</strong><small>{adminProfile.email}</small></div>
    </div>
    <p className="adm-role"><ShieldCheck /> Platform admin · full access</p>
    <div className="adm-me-queue"><b>{open}</b><span>open item{open === 1 ? '' : 's'} in your queue</span></div>
  </section>;
}

function AdminNav({ active, onNavigate }: { active: Section; onNavigate?: () => void }) {
  const { counts } = useAdmin();
  return <nav className="db-panel db-nav-panel adm-nav" aria-label="Admin sections">
    {navGroups.map(group => <div key={group.label} className="adm-nav-group">
      <small>{group.label}</small>
      <div className="db-nav">
        {group.items.map(item => {
          const count = item.count ? counts[item.count] + (item.count === 'redemptions' ? counts.contests : 0) : 0;
          return <SectionLink key={item.section} section={item.section} className={cn('db-nav-item', active === item.section && 'is-active')} aria-current={active === item.section ? 'page' : undefined} onClick={onNavigate}>
            <item.icon /><span>{item.label}</span>{count ? <em>{count}</em> : null}
          </SectionLink>;
        })}
      </div>
    </div>)}
  </nav>;
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { counts, flags, withdrawals, reports, redemptions, lookups } = useAdmin();
  const navigate = useNavigate();
  const total = counts.withdrawals + counts.reports + counts.flags + counts.redemptions + counts.contests;
  const items = [
    ...flags.filter(f => f.status === 'open').map(f => ({ id: f.id, at: f.at, section: 'safety' as const, urgent: f.category === 'suicidal', user: f.userId, text: f.category === 'suicidal' ? 'Wellbeing flag needs a check-in' : `Language flag on a ${f.where.toLowerCase()}` })),
    ...withdrawals.filter(w => w.status === 'pending').map(w => ({ id: w.id, at: w.requestedAt, section: 'withdrawals' as const, urgent: false, user: w.requesterId, text: `Withdrawal request · $${w.amount.toFixed(2)}` })),
    ...reports.filter(r => r.status === 'open').map(r => ({ id: r.id, at: r.at, section: 'moderation' as const, urgent: false, user: r.authorId, text: `${r.kind[0]?.toUpperCase()}${r.kind.slice(1)} reported: ${r.reason}` })),
    ...redemptions.filter(r => r.status === 'requested').map(r => ({ id: r.id, at: r.at, section: 'vibeys' as const, urgent: false, user: r.userId, text: `Redeemed ${lookups.rewards.get(r.rewardId)?.name ?? 'a reward'}` })),
  ].sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.at - a.at).slice(0, 7);

  function signOut() {
    signOutDemo();
    navigate({ to: '/login' });
  }

  return <header className="db-top">
    <button type="button" className="db-icon-btn db-menu-btn" aria-label="Open menu" onClick={onMenu}><Menu /></button>
    <SectionLink section="overview" className="bj-logo db-logo adm-logo" aria-label="Admin dashboard"><LogoMark /><Wordmark /><span className="adm-badge">Admin</span></SectionLink>
    <AdminSearch />
    <div className="db-top-actions">
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="db-icon-btn db-badged" aria-label={`Needs attention, ${total} items`}><Bell />{total ? <em>{total}</em> : null}</button>
        </PopoverTrigger>
        <PopoverContent align="end" className="db-popover">
          <header className="db-panel-head"><h2>Needs attention</h2><SectionLink section="overview" className="db-link">Dashboard</SectionLink></header>
          {items.length ? <ul className="db-notices is-compact">
            {items.map(item => {
              const user = lookups.users.get(item.user);
              return <li key={item.id} className={cn(item.urgent && 'is-unread')}>
                <Face name={user?.name ?? '?'} photo={userPhoto(user)} size={40} />
                <p><SectionLink section={item.section} className="adm-plain"><strong>{user?.name ?? 'Someone'}</strong> {item.text}</SectionLink></p>
              </li>;
            })}
          </ul> : <p className="db-muted">You’re all caught up.</p>}
        </PopoverContent>
      </Popover>
      <span className="db-theme"><ThemePicker /></span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="db-me-btn" aria-label="Account menu"><Face name={adminProfile.name} photo={adminProfile.photo} size={38} /></button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="db-menu">
          <DropdownMenuLabel><strong>{adminProfile.name}</strong><small>{adminProfile.title}</small></DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><SectionLink section="settings"><Settings />Settings</SectionLink></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/"><Home />ByeUni home page</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={signOut}><LogOut />Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>;
}

function AdminSearch() {
  const { users, campaigns, schools } = useAdmin();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    const found: { id: string; label: string; meta: string; image?: string | undefined; name: string; section: Section }[] = [];
    users.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(q))
      .forEach(u => found.push({ id: u.id, label: u.name, meta: `${u.type === 'guest' ? 'Guest' : u.type === 'team' ? 'Team member' : 'Student'} · ${u.email}`, image: userPhoto(u), name: u.name, section: 'users' }));
    campaigns.filter(c => c.title.toLowerCase().includes(q))
      .forEach(c => found.push({ id: c.id, label: c.title, meta: `Campaign · ${c.category}`, image: coverSrc(c.cover), name: c.title, section: 'campaigns' }));
    schools.filter(s => `${s.name} ${s.short}`.toLowerCase().includes(q))
      .forEach(s => found.push({ id: s.id, label: s.name, meta: `School · ${s.city}`, image: s.logo, name: s.short, section: 'schools' }));
    return found.slice(0, 8);
  }, [q, users, campaigns, schools]);

  function go(result: (typeof results)[number]) {
    setQuery('');
    setFocused(false);
    navigate({ to: '/admin', search: { section: result.section, focus: result.id } });
  }

  return <div className="db-search">
    <Search aria-hidden="true" />
    <input
      value={query}
      onChange={event => setQuery(event.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => window.setTimeout(() => setFocused(false), 150)}
      onKeyDown={event => { if (event.key === 'Enter' && results[0]) go(results[0]); if (event.key === 'Escape') setQuery(''); }}
      placeholder="Search students, campaigns, schools…"
      aria-label="Search the admin console"
      role="combobox"
      aria-expanded={focused && Boolean(q)}
      aria-controls="adm-search-results"
    />
    {focused && q ? <ul id="adm-search-results" className="db-search-results" role="listbox">
      {results.map(result => <li key={`${result.section}-${result.id}`} role="option" aria-selected="false">
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => go(result)}>
          <Face name={result.name} photo={result.image} size={38} className="is-square" />
          <span><strong>{result.label}</strong><small>{result.meta}</small></span>
        </button>
      </li>)}
      {results.length === 0 ? <li className="db-muted">No results for “{query}”</li> : null}
    </ul> : null}
  </div>;
}

function BottomNav({ section, onMenu }: { section: Section; onMenu: () => void }) {
  const { counts } = useAdmin();
  const items: { section: Section; label: string; icon: typeof Home; count?: number }[] = [
    { section: 'overview', label: 'Home', icon: LayoutDashboard },
    { section: 'campaigns', label: 'Campaigns', icon: HandHeart },
    { section: 'withdrawals', label: 'Payouts', icon: Banknote, count: counts.withdrawals },
    { section: 'moderation', label: 'Reports', icon: ShieldAlert, count: counts.reports + counts.flags },
  ];
  return <nav className="db-bottom" aria-label="Admin primary">
    {items.map(item => <SectionLink key={item.section} section={item.section} className={cn('db-tab adm-tab', section === item.section && 'is-active')} aria-current={section === item.section ? 'page' : undefined}>
      <item.icon /><span>{item.label}</span>{item.count ? <em>{item.count}</em> : null}
    </SectionLink>)}
    <button type="button" className="db-tab" onClick={onMenu}><Menu /><span>More</span></button>
  </nav>;
}
