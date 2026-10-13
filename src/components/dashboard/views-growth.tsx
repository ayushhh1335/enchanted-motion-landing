import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft, Bell, CalendarPlus, Check, ChevronRight, ExternalLink, Flame, Gift, HandHeart, Home, Info, LifeBuoy, Lock, LogOut, MapPin,
  Palette, Pencil, Plus, RotateCcw, Share2, Sparkles, Star, Trophy, UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppearancePanel } from '@/components/Appearance';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DEMO_CREDENTIALS, REAL_LOGIN_URL, signOutDemo } from '@/lib/demo-session';
import { ME_ID, me, personById, rewards, vibeyRules } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';
import { EventDate } from './Rails';
import { CampaignDialog, DonateDialog, EditProfileDialog } from './dialogs';
import { InviteDialog } from './home-widgets';
import {
  Bar, EmptyState, ProfileLink, ViewLink, accountItems, agoText, downloadIcs, isAccountTab, usd, type SettingsSection, type SettingsTab,
} from './shared';
import { AccountPanel } from './views-account';
import { useDashboard, type LiveCampaign } from './store';
import { ViewHeader } from './views-social';

/* ---------------- Campaigns ---------------- */

export function CampaignsView() {
  const { campaigns } = useDashboard();
  const [creating, setCreating] = useState(false);
  const [donating, setDonating] = useState<LiveCampaign | null>(null);
  const [category, setCategory] = useState('All');
  const mine = campaigns.filter(c => c.ownerId === ME_ID);
  const others = campaigns.filter(c => c.ownerId !== ME_ID);
  const cats = ['All', ...new Set(others.map(c => c.category))];
  const shown = others.filter(c => category === 'All' || c.category === category);

  return <div className="db-view">
    <ViewHeader title="Fundraising" subtitle="Back classmates' goals and raise support for your own.">
      <Button variant="ink" onClick={() => setCreating(true)}><Plus /> Start a campaign</Button>
    </ViewHeader>

    <h2 className="db-section-title">My campaigns</h2>
    <section className="db-card-grid is-wide">
      {mine.map(c => <article key={c.id} className="db-panel db-campaign is-mine">
        <img src={c.image} alt="" />
        <div>
          <span className="db-tag">{c.category}</span>
          <h3>{c.title}</h3>
          <div className="db-money"><b>{usd(c.raised)}</b><span>of {usd(c.goal)}</span></div>
          <Bar value={c.raised} max={c.goal} />
          <dl className="db-mini-stats"><div><dt>Donors</dt><dd>{c.donors}</dd></div><div><dt>Days left</dt><dd>{c.daysLeft}</dd></div><div><dt>Funded</dt><dd>{Math.round((c.raised / c.goal) * 100)}%</dd></div></dl>
          <Button variant="soft" size="sm" onClick={() => navigator.clipboard?.writeText(`https://byeuni.com/campaign-detail.php?c=${c.id}`).then(() => toast.success('Campaign link copied'))}><Share2 /> Share campaign</Button>
        </div>
      </article>)}
      {mine.length === 0 ? <EmptyState icon={HandHeart} title="No campaigns yet" body="Start one for books, travel, equipment, or exams." /> : null}
    </section>

    <h2 className="db-section-title">Fundraisers to support</h2>
    <div className="db-filter-row">
      {cats.map(item => <button key={item} type="button" className="db-chip" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
    </div>
    <section className="db-card-grid">
      {shown.map(c => {
        const owner = personById(c.ownerId);
        return <article key={c.id} className="db-panel db-campaign">
          <img src={c.image} alt="" />
          <div>
            <span className="db-tag">{c.category}</span>
            {c.myDonation ? <span className="db-tag is-mint"><Check /> You gave {usd(c.myDonation)}</span> : null}
            <h3>{c.title}</h3>
            <small><ProfileLink personId={owner.id} className="db-name-link">{owner.name}</ProfileLink> · {owner.school}</small>
            <p>{c.story}</p>
            <div className="db-money"><b>{usd(c.raised)}</b><span>raised of {usd(c.goal)}</span></div>
            <Bar value={c.raised} max={c.goal} />
            <small>{c.donors} donors · {c.daysLeft} days left</small>
            <Button variant="ink" size="sm" className="db-wide" onClick={() => setDonating(c)}><HandHeart /> Support</Button>
          </div>
        </article>;
      })}
    </section>
    <CampaignDialog open={creating} onOpenChange={setCreating} />
    <DonateDialog campaign={donating} onClose={() => setDonating(null)} />
  </div>;
}

/* ---------------- Events ---------------- */

export function EventsView() {
  const { events, actions } = useDashboard();
  return <div className="db-view">
    <ViewHeader title="Events" subtitle={`What's happening at ${me.school} and online.`} />
    <ul className="db-event-cards">
      {events.map(event => <li key={event.id} className="db-panel">
        <EventDate date={event.date} />
        <div>
          <h3>{event.title}</h3>
          <small><MapPin /> {event.place}</small>
          <small>{event.time} · {event.going} going</small>
        </div>
        <div className="db-event-actions">
          <Button variant={event.rsvp === 'going' ? 'ink' : 'soft'} size="sm" onClick={() => actions.setRsvp(event.id, 'going')}>{event.rsvp === 'going' ? <><Check /> Going</> : 'Going'}</Button>
          <Button variant={event.rsvp === 'interested' ? 'ink' : 'soft'} size="sm" onClick={() => actions.setRsvp(event.id, 'interested')}><Star /> Interested</Button>
          <Button variant="ghost" size="sm" onClick={() => downloadIcs(event.title, event.date, event.place)}><CalendarPlus /> Add to calendar</Button>
        </div>
      </li>)}
    </ul>
  </div>;
}

/* ---------------- Vibeys ---------------- */

export function VibeysView() {
  const { vibeys, redeemed, actions } = useDashboard();
  const [inviting, setInviting] = useState(false);
  const week = Array.from({ length: 7 }, (_, i) => i < Math.min(vibeys.streak, 7));
  return <div className="db-view">
    <ViewHeader title="My Vibeys" subtitle="Points for showing up. Redeem them for real rewards." />
    <section className="db-vibey-hero">
      <div>
        <small>Your balance</small>
        <strong>{vibeys.balance.toLocaleString('en-US')}</strong>
        <span><Flame /> {vibeys.streak}-day login streak</span>
      </div>
      <ol className="db-streak" aria-label="This week's logins">
        {week.map((done, i) => <li key={i} className={done ? 'is-done' : ''}><span>{done ? <Check /> : i + 1}</span><small>Day {i + 1}</small></li>)}
      </ol>
    </section>

    <div className="db-two-col">
      <section className="db-panel">
        <header className="db-panel-head"><h2>Ways to earn</h2></header>
        <ul className="db-row-list is-plain">
          {vibeyRules.map(rule => <li key={rule.id}>
            <span className="db-promo-icon is-sun"><Trophy /></span>
            <div><strong>{rule.label}</strong><small>{rule.detail}</small></div>
            {rule.id === 'r-invite' ? <Button variant="soft" size="sm" onClick={() => setInviting(true)}>Invite</Button> : null}
            <b className="db-points">+{rule.points}</b>
          </li>)}
        </ul>
      </section>
      <section className="db-panel">
        <header className="db-panel-head"><h2>Recent activity</h2></header>
        <ul className="db-row-list is-plain">
          {vibeys.log.slice(0, 8).map(entry => <li key={entry.id}>
            <div><strong>{entry.label}</strong><small>{agoText(entry.at)}</small></div>
            <b className={cn('db-points', entry.points < 0 && 'is-spent')}>{entry.points > 0 ? '+' : ''}{entry.points}</b>
          </li>)}
        </ul>
      </section>
    </div>

    <h2 className="db-section-title">Rewards</h2>
    <section className="db-card-grid">
      {rewards.map(reward => {
        const done = redeemed.includes(reward.id);
        const short = vibeys.balance < reward.cost;
        return <article key={reward.id} className="db-panel db-reward">
          <span className="db-promo-icon is-sun"><Gift /></span>
          <h3>{reward.name}</h3>
          <small>{reward.detail}</small>
          <Bar value={Math.min(vibeys.balance, reward.cost)} max={reward.cost} />
          <div className="db-reward-foot">
            <b><Sparkles /> {reward.cost.toLocaleString('en-US')}</b>
            <Button variant={done ? 'soft' : 'ink'} size="sm" disabled={done || short} onClick={() => actions.redeem(reward.id)}>
              {done ? <><Check /> Requested</> : short ? `${(reward.cost - vibeys.balance).toLocaleString('en-US')} to go` : 'Redeem'}
            </Button>
          </div>
        </article>;
      })}
    </section>
    <InviteDialog open={inviting} onOpenChange={setInviting} />
  </div>;
}

/* ---------------- Settings ---------------- */

const settingsPanels: { tab: SettingsTab; label: string; note: string; icon: typeof Bell }[] = [
  { tab: 'appearance', label: 'Appearance', note: 'Theme, accent, and logo colors', icon: Palette },
  { tab: 'notifications', label: 'Notifications', note: 'Likes, comments, requests, donations', icon: Bell },
  { tab: 'privacy', label: 'Account privacy', note: 'Who can see your posts and CVision', icon: Lock },
];

const itemBody = (Icon: typeof Bell, label: string, note?: string, chevron = true) => <>
  <Icon /><span><strong>{label}</strong>{note ? <small>{note}</small> : null}</span>{chevron ? <ChevronRight /> : null}
</>;

/** Instagram-style settings: everything account-related lives here instead of the profile menu. */
export function SettingsView({ tab }: { tab?: SettingsSection | undefined }) {
  const { actions } = useDashboard();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({ likes: true, comments: true, requests: true, campaigns: true, privateProfile: false });
  const [editing, setEditing] = useState(false);
  const [inviting, setInviting] = useState(false);
  const toggle = (key: keyof typeof prefs) => (value: boolean) => setPrefs(p => ({ ...p, [key]: value }));
  const active: SettingsSection = tab ?? 'appearance';
  const panel = [...accountItems, ...settingsPanels].find(item => item.tab === active);
  const sectionLink = (item: { tab: SettingsSection; label: string; note: string; icon: typeof Bell }) => <ViewLink
    key={item.tab}
    view="settings"
    tab={item.tab}
    className={cn('st-item', active === item.tab && 'is-active')}
    aria-current={tab === item.tab ? 'page' : undefined}
  >{itemBody(item.icon, item.label, item.note)}</ViewLink>;

  return <div className={cn('db-view st-view', tab && 'has-panel')}>
    <ViewHeader title="Settings and privacy" subtitle="Your account, who sees your content, and how you use ByeUni." />
    <div className="st-layout">
      <nav className="db-panel st-nav" aria-label="Settings">
        <p className="ac-nav-label">Accounts Center</p>
        {accountItems.map(sectionLink)}

        <p className="ac-nav-label">How you use ByeUni</p>
        <button type="button" className="st-item" onClick={() => setEditing(true)}>{itemBody(Pencil, 'Edit profile', 'Photo, name, headline, skills')}</button>
        {settingsPanels.map(sectionLink)}

        <p className="ac-nav-label">More info and support</p>
        <button type="button" className="st-item" onClick={() => setInviting(true)}>{itemBody(UserPlus, 'Invite friends', 'Earn Vibeys for every friend who joins')}</button>
        <Link to="/faqs" className="st-item">{itemBody(LifeBuoy, 'Help center')}</Link>
        <Link to="/about" className="st-item">{itemBody(Info, 'About ByeUni')}</Link>
        <Link to="/" className="st-item">{itemBody(Home, 'ByeUni home page')}</Link>

        <p className="ac-nav-label">Login</p>
        <a href={REAL_LOGIN_URL.student} className="st-item">{itemBody(ExternalLink, 'Manage a real account', 'Opens byeuni.com')}</a>
        <button type="button" className="st-item" onClick={actions.resetDemo}>{itemBody(RotateCcw, 'Reset demo data', 'Restore the sample posts, people, and campaigns', false)}</button>
        <button type="button" className="st-item is-danger" onClick={() => { signOutDemo(); navigate({ to: '/login' }); }}>{itemBody(LogOut, 'Sign out', `Signed in as ${DEMO_CREDENTIALS.email}`, false)}</button>
      </nav>

      <section className="st-panel" aria-labelledby="st-panel-title">
        <ViewLink view="settings" className="st-back"><ArrowLeft /> Settings</ViewLink>
        <header className="st-panel-head"><h2 id="st-panel-title">{panel?.label}</h2>{panel ? <p>{panel.note}</p> : null}</header>
        {isAccountTab(active) ? <AccountPanel tab={active} /> : <div className="db-panel db-settings">
          {active === 'appearance' ? <AppearancePanel /> : null}
          {active === 'notifications' ? <>
            <label><span>Likes on my posts</span><Switch checked={prefs.likes} onCheckedChange={toggle('likes')} /></label>
            <label><span>Comments and replies</span><Switch checked={prefs.comments} onCheckedChange={toggle('comments')} /></label>
            <label><span>Connection requests</span><Switch checked={prefs.requests} onCheckedChange={toggle('requests')} /></label>
            <label><span>Campaign donations</span><Switch checked={prefs.campaigns} onCheckedChange={toggle('campaigns')} /></label>
          </> : null}
          {active === 'privacy' ? <>
            <label><span>Private profile <small>Only connections can see your posts and CVision.</small></span><Switch checked={prefs.privateProfile} onCheckedChange={toggle('privateProfile')} /></label>
            <p className="db-muted st-note">Password changes, deactivation, and account deletion are in <ViewLink view="settings" tab="security" className="db-link">Password & security</ViewLink>.</p>
          </> : null}
        </div>}
      </section>
    </div>
    <EditProfileDialog open={editing} onOpenChange={setEditing} />
    <InviteDialog open={inviting} onOpenChange={setInviting} />
  </div>;
}
