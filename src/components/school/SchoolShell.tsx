import { useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Bell, Flag, GraduationCap, HandHeart, History, Home, LayoutDashboard, LogOut, Menu, Quote, School, Search, UserCog } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { ThemePicker } from '@/components/Appearance';
import { ConsoleDock, type DockEntry } from '@/components/console-dock';
import { QuoteOfTheDay, openQuoteOfTheDay } from '@/components/quote-of-the-day';
import { LogoMark, Wordmark } from '@/components/site-chrome';
import { coverSrc } from '@/content/admin-data';
import { signOutDemo } from '@/lib/demo-session';
import { cn } from '@/lib/utils';
import { Face, userPhoto } from '@/components/admin/ui';
import { useSchool } from './store';
import { SchoolLink, navGroups, navSection, schoolGradient, type Section } from './ui';
import { ProfileView, OverviewView, SchoolDetailsView } from './views-home';
import { CampaignsView, StudentProfileView, StudentsView } from './views-students';
import { ForumsView, ReportsView, SuggestionsView, UpdatesView } from './views-community';

export function SchoolShell({ section, focus }: { section: Section; focus?: string | undefined }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="db-page adm-page sch-page has-dock">
    <div className="db-aurora" aria-hidden="true"><span /><span /><span /><span /></div>
    <TopBar onMenu={() => setMenuOpen(true)} />
    <SchoolDock active={navSection(section)} />
    <div className="db-layout is-wide">
      <main className="db-main" id="main">
        <ActiveSection section={section} focus={focus} />
      </main>
    </div>
    <BottomNav section={navSection(section)} onMenu={() => setMenuOpen(true)} />
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetContent side="left" className="db-sheet">
        <SheetTitle className="sr-only">School portal menu</SheetTitle>
        <SheetDescription className="sr-only">School portal sections</SheetDescription>
        <SchoolCard />
        <SchoolNav active={navSection(section)} onNavigate={() => setMenuOpen(false)} />
      </SheetContent>
    </Sheet>
    <QuoteOfTheDay role="school" />
  </div>;
}

function ActiveSection({ section, focus }: { section: Section; focus?: string | undefined }) {
  switch (section) {
    case 'school': return <SchoolDetailsView />;
    case 'students': return <StudentsView focus={focus} />;
    case 'student': return <StudentProfileView key={focus} studentId={focus} />;
    case 'campaigns': return <CampaignsView focus={focus} />;
    case 'forums': return <ForumsView />;
    case 'reports': return <ReportsView />;
    case 'updates': return <UpdatesView focus={focus} />;
    case 'suggestions': return <SuggestionsView />;
    case 'profile': return <ProfileView tab={focus} />;
    default: return <OverviewView />;
  }
}

function SchoolCard() {
  const { profile, school, students } = useSchool();
  return <section className="db-panel adm-me sch-me">
    <div className="sch-me-band" style={{ background: schoolGradient(school.colors) }}>
      {school.logo ? <img src={school.logo} alt="" /> : <span>{school.short.slice(0, 2).toUpperCase()}</span>}
    </div>
    <div className="db-profile-id">
      <Face name={`${profile.firstName} ${profile.lastName}`} size={48} />
      <div><strong>{profile.firstName} {profile.lastName}</strong><small>{profile.title}</small></div>
    </div>
    <p className="adm-role"><School /> {school.name} · {students.length} students</p>
  </section>;
}

function SchoolDock({ active }: { active: Section }) {
  const { profile, school, counts } = useSchool();
  const navigate = useNavigate();
  const toEntry = (item: (typeof navGroups)[number]['items'][number]): DockEntry => ({
    id: item.section, label: item.label, icon: item.icon, count: item.count ? counts[item.count] : 0, soft: item.count !== 'reports',
  });
  const name = `${profile.firstName} ${profile.lastName}`;

  function signOut() {
    signOutDemo();
    navigate({ to: '/login' });
  }

  return <ConsoleDock
    label="School navigation"
    active={active}
    dock={navGroups.flatMap(group => group.items).filter(item => item.section !== 'profile').map(toEntry)}
    groups={navGroups.map(group => ({ label: group.label, items: group.items.map(toEntry) }))}
    renderLink={(entry, props) => <SchoolLink section={entry.id as Section} {...props} />}
    me={<SchoolLink section="profile" className={cn('db-dock-item db-dock-me', active === 'profile' && 'is-active')} aria-current={active === 'profile' ? 'page' : undefined}>
      <Face name={name} size={28} />
      <span><strong>{name}</strong><small>{profile.title} · {school.short}</small></span>
    </SchoolLink>}
    extras={close => <>
      <SchoolLink section="profile" className="db-more-item" onClick={close}><UserCog /><span>Profile</span></SchoolLink>
      <SchoolLink section="profile" focus="activity" className="db-more-item" onClick={close}><History /><span>My activity</span></SchoolLink>
      <button type="button" className="db-more-item" onClick={() => { close(); openQuoteOfTheDay(); }}><Quote /><span>Quote of the day</span></button>
      <Link to="/" className="db-more-item" onClick={close}><Home /><span>ByeUni home page</span></Link>
      <button type="button" className="db-more-item" onClick={signOut}><LogOut /><span>Sign out</span></button>
    </>}
  />;
}

function SchoolNav({ active, onNavigate }: { active: Section; onNavigate?: () => void }) {
  const { counts } = useSchool();
  return <nav className="db-panel db-nav-panel adm-nav" aria-label="School portal sections">
    {navGroups.map(group => <div key={group.label} className="adm-nav-group">
      <small>{group.label}</small>
      <div className="db-nav">
        {group.items.map(item => {
          const count = item.count ? counts[item.count] : 0;
          return <SchoolLink key={item.section} section={item.section} className={cn('db-nav-item', active === item.section && 'is-active')} aria-current={active === item.section ? 'page' : undefined} onClick={onNavigate}>
            <item.icon /><span>{item.label}</span>{count ? <em className={cn(item.count !== 'reports' && 'is-soft')}>{count}</em> : null}
          </SchoolLink>;
        })}
      </div>
    </div>)}
  </nav>;
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { profile, school, reports, suggestions, students, counts, lookups } = useSchool();
  const navigate = useNavigate();
  const weekAgo = Date.now() - 7 * 86_400_000;
  const items = [
    ...reports.filter(r => r.status === 'open').map(r => ({ id: r.id, at: r.at, section: 'reports' as const, urgent: true, user: r.authorId, text: `was reported: ${r.reason.toLowerCase()}` })),
    ...suggestions.filter(s => s.at >= weekAgo).map(s => ({ id: s.id, at: s.at, section: 'suggestions' as const, urgent: false, user: s.userId, text: 'sent a suggestion' })),
    ...students.filter(s => s.invited).map(s => ({ id: s.id, at: s.createdAt, section: 'students' as const, urgent: false, user: s.id, text: 'hasn’t accepted the invitation yet' })),
  ].sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.at - a.at).slice(0, 7);
  const total = counts.reports + counts.newSuggestions;

  function signOut() {
    signOutDemo();
    navigate({ to: '/login' });
  }

  return <header className="db-top">
    <button type="button" className="db-icon-btn db-menu-btn" aria-label="Open menu" onClick={onMenu}><Menu /></button>
    <SchoolLink section="overview" className="bj-logo db-logo adm-logo" aria-label="School dashboard"><LogoMark /><Wordmark /><span className="adm-badge sch-badge" style={{ background: school.colors[0] }}>{school.short}</span></SchoolLink>
    <SchoolSearch />
    <div className="db-top-actions">
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="db-icon-btn db-badged" aria-label={`Notifications, ${total} new`}><Bell />{total ? <em>{total}</em> : null}</button>
        </PopoverTrigger>
        <PopoverContent align="end" className="db-popover">
          <header className="db-panel-head"><h2>Needs attention</h2><SchoolLink section="overview" className="db-link">Dashboard</SchoolLink></header>
          {items.length ? <ul className="db-notices is-compact">
            {items.map(item => {
              const student = lookups.students.get(item.user);
              return <li key={item.id} className={cn(item.urgent && 'is-unread')}>
                <Face name={student?.name ?? '?'} photo={userPhoto(student)} size={40} />
                <p><SchoolLink section={item.section} className="adm-plain"><strong>{student?.name ?? 'A student'}</strong> {item.text}</SchoolLink></p>
              </li>;
            })}
          </ul> : <p className="db-muted">You’re all caught up.</p>}
        </PopoverContent>
      </Popover>
      <span className="db-theme"><ThemePicker /></span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="db-me-btn" aria-label="Account menu"><Face name={`${profile.firstName} ${profile.lastName}`} size={38} /></button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="db-menu">
          <DropdownMenuLabel><strong>{profile.firstName} {profile.lastName}</strong><small>School admin · {school.short}</small></DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><SchoolLink section="profile"><UserCog />Profile</SchoolLink></DropdownMenuItem>
          <DropdownMenuItem asChild><SchoolLink section="profile" focus="activity"><History />My activity</SchoolLink></DropdownMenuItem>
          <DropdownMenuItem asChild><SchoolLink section="school"><School />School details</SchoolLink></DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/"><Home />ByeUni home page</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={signOut}><LogOut />Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>;
}

function SchoolSearch() {
  const { students, campaigns } = useSchool();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    const found: { id: string; label: string; meta: string; image?: string | undefined; section: Section }[] = [];
    students.filter(s => `${s.name} ${s.email} ${s.major ?? ''}`.toLowerCase().includes(q))
      .forEach(s => found.push({ id: s.id, label: s.name, meta: `Student · ${s.major ?? s.email}`, image: userPhoto(s), section: 'student' }));
    campaigns.filter(c => c.title.toLowerCase().includes(q))
      .forEach(c => found.push({ id: c.id, label: c.title, meta: `Campaign · ${c.category}`, image: coverSrc(c.cover), section: 'campaigns' }));
    return found.slice(0, 8);
  }, [q, students, campaigns]);

  function go(result: (typeof results)[number]) {
    setQuery('');
    setFocused(false);
    navigate({ to: '/school-admin', search: { section: result.section, focus: result.id } });
  }

  return <div className="db-search">
    <Search aria-hidden="true" />
    <input
      value={query}
      onChange={event => setQuery(event.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => window.setTimeout(() => setFocused(false), 150)}
      onKeyDown={event => { if (event.key === 'Enter' && results[0]) go(results[0]); if (event.key === 'Escape') setQuery(''); }}
      placeholder="Search your students and campaigns…"
      aria-label="Search the school portal"
      role="combobox"
      aria-expanded={focused && Boolean(q)}
      aria-controls="sch-search-results"
    />
    {focused && q ? <ul id="sch-search-results" className="db-search-results" role="listbox">
      {results.map(result => <li key={`${result.section}-${result.id}`} role="option" aria-selected="false">
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => go(result)}>
          <Face name={result.label} photo={result.image} size={38} className={result.section === 'campaigns' ? 'is-square' : undefined} />
          <span><strong>{result.label}</strong><small>{result.meta}</small></span>
        </button>
      </li>)}
      {results.length === 0 ? <li className="db-muted">No results for “{query}”</li> : null}
    </ul> : null}
  </div>;
}

function BottomNav({ section, onMenu }: { section: Section; onMenu: () => void }) {
  const { counts } = useSchool();
  const items: { section: Section; label: string; icon: typeof Home; count?: number }[] = [
    { section: 'overview', label: 'Home', icon: LayoutDashboard },
    { section: 'students', label: 'Students', icon: GraduationCap },
    { section: 'campaigns', label: 'Campaigns', icon: HandHeart },
    { section: 'reports', label: 'Reported', icon: Flag, count: counts.reports },
  ];
  return <nav className="db-bottom" aria-label="School portal primary">
    {items.map(item => <SchoolLink key={item.section} section={item.section} className={cn('db-tab adm-tab', section === item.section && 'is-active')} aria-current={section === item.section ? 'page' : undefined}>
      <item.icon /><span>{item.label}</span>{item.count ? <em>{item.count}</em> : null}
    </SchoolLink>)}
    <button type="button" className="db-tab" onClick={onMenu}><Menu /><span>More</span></button>
  </nav>;
}
