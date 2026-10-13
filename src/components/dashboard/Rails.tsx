import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, BadgeCheck, Check, ChevronRight, FileUser, Sparkles, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ME_ID, me, people, personById } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';
import { DonateDialog, ProfileDialog } from './dialogs';
import { Avatar, Bar, PanelHead, ViewLink, compact, navItems, usd, type View } from './shared';
import { profileCompletion, useDashboard, type LiveCampaign } from './store';

export function ProfileCard() {
  const { profile, stories, posts, connections, vibeys } = useDashboard();
  const [editing, setEditing] = useState(false);
  const completion = profileCompletion(profile, stories.some(story => story.personId === ME_ID));
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
    <button type="button" className="db-soft-btn" onClick={() => setEditing(true)}>Complete your profile <ArrowRight /></button>
    <ProfileDialog open={editing} onOpenChange={setEditing} />
  </section>;
}

export function SideNav({ active, onNavigate, compactMode }: { active: View; onNavigate?: () => void; compactMode?: boolean }) {
  const { chats, notices } = useDashboard();
  const unreadChats = chats.reduce((sum, chat) => sum + chat.unread, 0);
  const unreadNotices = notices.filter(n => n.unread).length;
  const badges: Partial<Record<View, number>> = { messages: unreadChats, notifications: unreadNotices };
  return <nav className={cn('db-nav', compactMode && 'is-compact')} aria-label="Dashboard">
    {navItems.filter(item => item.view !== 'profile').map(item => <ViewLink
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

export function LeftRail({ active }: { active: View }) {
  return <aside className="db-left" aria-label="Your profile and navigation">
    <ProfileCard />
    <section className="db-panel db-nav-panel"><SideNav active={active} /></section>
    <CVisionPromo />
  </aside>;
}

export function SuggestedConnections({ limit = 3 }: { limit?: number }) {
  const { connections, actions } = useDashboard();
  const list = people.filter(person => person.id !== ME_ID && ['none', 'pending'].includes(connections[person.id] ?? 'none')).slice(0, limit);
  return <section className="db-panel">
    <PanelHead title="Suggested connections" action={<ViewLink view="network" className="db-link">See all</ViewLink>} />
    {list.length === 0 ? <p className="db-muted">You're connected with everyone we'd suggest. Nice.</p> : null}
    <ul className="db-people-list">
      {list.map(person => {
        const pending = connections[person.id] === 'pending';
        return <li key={person.id}>
          <Avatar person={person} size={44} />
          <div><strong>{person.name}</strong><small>{person.major} · {person.school}</small></div>
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
  return <section className="db-panel">
    <PanelHead title="Fundraisers to support" action={<ViewLink view="campaigns" className="db-link">See all</ViewLink>} />
    <ul className="db-fund-list">
      {list.map(c => {
        const owner = personById(c.ownerId);
        return <li key={c.id}>
          <img src={c.image} alt="" />
          <div>
            <strong>{c.title}</strong>
            <small>{owner.name} · {owner.school}</small>
          </div>
          <Button variant="soft" size="sm" className="db-connect" onClick={() => setDonating(c)}>Support</Button>
          <div className="db-fund-meta">
            <Bar value={c.raised} max={c.goal} />
            <span><b>{usd(c.raised)}</b> raised</span><span>{usd(c.goal)} goal</span>
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

export function UpcomingEvents({ limit = 2 }: { limit?: number }) {
  const { events, actions } = useDashboard();
  return <section className="db-panel">
    <PanelHead title="Upcoming on campus" action={<ViewLink view="events" className="db-link">See all</ViewLink>} />
    <ul className="db-event-list">
      {events.slice(0, limit).map(event => <li key={event.id}>
        <EventDate date={event.date} />
        <div><strong>{event.title}</strong><small>{event.place}</small><small>{event.going} students going</small></div>
        <Button variant="soft" size="sm" className={cn('db-connect', event.rsvp === 'going' && 'is-pending')} onClick={() => actions.setRsvp(event.id, 'going')}>
          {event.rsvp === 'going' ? <><Check /> Going</> : 'Going?'}
        </Button>
      </li>)}
    </ul>
  </section>;
}

export function VibeysMini() {
  const { vibeys } = useDashboard();
  return <ViewLink view="vibeys" className="db-panel db-vibeys-mini">
    <span className="db-promo-icon is-sun"><Sparkles /></span>
    <div><strong>{vibeys.balance.toLocaleString('en-US')} Vibeys</strong><small>{vibeys.streak}-day login streak · redeem rewards</small></div>
    <ChevronRight />
  </ViewLink>;
}

export function RightRail() {
  return <aside className="db-right" aria-label="Suggestions">
    <VibeysMini />
    <SuggestedConnections />
    <FundraisersToSupport />
    <UpcomingEvents />
    <footer className="db-legal">
      <Link to="/about">About</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/faqs">Help</Link><Link to="/">Home</Link>
      <span>© 2026 ByeUni · Demo data</span>
    </footer>
  </aside>;
}
