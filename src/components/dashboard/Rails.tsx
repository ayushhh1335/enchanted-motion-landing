import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, BadgeCheck, Check, ChevronRight, FileUser, Sparkles, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ME_ID, isMajorMate, isSchoolmate, majorOf, me, people, personById } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';
import { CompleteProfileDialog, DonateDialog, EditProfileDialog } from './dialogs';
import { InviteDialog, InvitePromo, StudentOfTheDay } from './home-widgets';
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
  const { connections, dismissed, actions } = useDashboard();
  const [scope, setScope] = useState<'school' | 'major'>('school');
  const list = people.filter(person => (scope === 'school' ? isSchoolmate(person) : isMajorMate(person))
    && !dismissed.includes(person.id) && ['none', 'pending'].includes(connections[person.id] ?? 'none')).slice(0, limit);
  return <section className="db-panel">
    <PanelHead title="People you may know" action={<ViewLink view="network" tab={scope} className="db-link">See all</ViewLink>} />
    <div className="db-seg" role="tablist" aria-label="Suggestion group">
      <button type="button" role="tab" aria-selected={scope === 'school'} onClick={() => setScope('school')}>School friends</button>
      <button type="button" role="tab" aria-selected={scope === 'major'} onClick={() => setScope('major')}>Major friends</button>
    </div>
    {list.length === 0 ? <p className="db-muted">You're connected with everyone we'd suggest. Nice.</p> : null}
    <ul className="db-people-list">
      {list.map(person => {
        const pending = connections[person.id] === 'pending';
        return <li key={person.id}>
          <ProfileLink personId={person.id} aria-label={`${person.name}'s profile`}><Avatar person={person} size={44} /></ProfileLink>
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
  return <section className="db-panel">
    <PanelHead title="Fundraisers to support" action={<ViewLink view="campaigns" className="db-link">See all</ViewLink>} />
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
    <StudentOfTheDay />
    <VibeysMini />
    <InvitePromo />
    <SuggestedConnections />
    <FundraisersToSupport />
    <UpcomingEvents />
    <footer className="db-legal">
      <Link to="/about">About</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/faqs">Help</Link><Link to="/">Home</Link>
      <span>© 2026 ByeUni · Demo data</span>
    </footer>
  </aside>;
}
