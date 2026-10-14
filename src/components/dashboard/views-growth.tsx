import { useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Activity, ArrowLeft, AtSign, Bell, BellOff, CalendarDays, CalendarPlus, Check, ChevronRight, Clock, Compass, ExternalLink, Eye, EyeOff, FileUser,
  Flame, Gift, HandHeart, Heart, History, Home, Info, LifeBuoy, Lightbulb, Lock, LogOut, Mail, MapPin, Megaphone, MessageCircle, MessageSquare, Palette,
  Plus, ReceiptText, RotateCcw, Search, Share2, ShieldCheck, Sparkles, Star, Trophy, UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppearancePanel } from '@/components/Appearance';
import { Button } from '@/components/ui/button';
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown';
import { SpotlightLayer } from '@/components/ui/spotlight';
import { ChoiceRow, SavedHint, SettingsGroup, SwitchRow, useStoredPrefs } from '@/components/settings-kit';
import { DEMO_CREDENTIALS, REAL_LOGIN_URL, signOutDemo } from '@/lib/demo-session';
import { ME_ID, majorOf, me, personById, rewards, vibeyRules } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';
import { EventDate } from './Rails';
import { CampaignDetailDialog, CampaignDialog, DonateDialog } from './dialogs';
import { InviteDialog } from './home-widgets';
import {
  Avatar, Bar, EmptyState, ProfileLink, ViewLink, accountItems, agoText, downloadIcs, isAccountTab, usd, type SettingsSection, type SettingsTab,
} from './shared';
import { AccountPanel } from './views-account';
import { MyActivity } from './views-activity';
import { useDashboard, type LiveCampaign } from './store';
import { Tabs, ViewHeader } from './views-social';

/* ---------------- Campaigns ---------------- */

type FundTab = 'discover' | 'mine' | 'supported';
type FundSort = 'ending' | 'funded' | 'close' | 'supporters';
const fundSorts: DropdownOption<FundSort>[] = [
  { value: 'ending', label: 'Ending soon' },
  { value: 'close', label: 'Closest to goal' },
  { value: 'funded', label: 'Most funded' },
  { value: 'supporters', label: 'Most supporters' },
];
const percentOf = (c: LiveCampaign) => Math.min(100, Math.round((c.raised / Math.max(1, c.goal)) * 100));
const sorters: Record<FundSort, (a: LiveCampaign, b: LiveCampaign) => number> = {
  ending: (a, b) => a.daysLeft - b.daysLeft,
  close: (a, b) => percentOf(b) - percentOf(a),
  funded: (a, b) => b.raised - a.raised,
  supporters: (a, b) => b.donors - a.donors,
};
const shareCampaign = (c: LiveCampaign) => navigator.clipboard?.writeText(`https://byeuni.com/campaign-detail.php?c=${c.id}`)
  .then(() => toast.success('Campaign link copied'), () => toast.error('Could not copy the link'));

export function CampaignsView() {
  const { campaigns, paymentsMade } = useDashboard();
  const [tab, setTab] = useState<FundTab>('discover');
  const [creating, setCreating] = useState(false);
  const [donating, setDonating] = useState<LiveCampaign | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<FundSort>('ending');
  const [query, setQuery] = useState('');

  const mine = campaigns.filter(c => c.ownerId === ME_ID);
  const others = campaigns.filter(c => c.ownerId !== ME_ID);
  const gifts = useMemo(() => paymentsMade.filter(p => p.status === 'Completed').reduce<Record<string, number>>((acc, p) => {
    acc[p.campaignId] = (acc[p.campaignId] ?? 0) + p.amount;
    return acc;
  }, {}), [paymentsMade]);
  const given = Object.values(gifts).reduce((n, v) => n + v, 0);
  const supported = others.filter(c => gifts[c.id]);
  const cats = ['All', ...new Set(others.map(c => c.category))];

  const q = query.trim().toLowerCase();
  const matches = others
    .filter(c => category === 'All' || c.category === category)
    .filter(c => !q || `${c.title} ${c.story} ${c.category} ${personById(c.ownerId).name}`.toLowerCase().includes(q))
    .sort(sorters[sort]);
  const featured = category === 'All' && !q
    ? [...others].filter(c => percentOf(c) < 100).sort(sorters.ending)[0]
    : undefined;
  const grid = matches.filter(c => c.id !== featured?.id);

  const card = (c: LiveCampaign) => <CampaignCard key={c.id} campaign={c} gave={gifts[c.id] ?? 0}
    onOpen={() => setViewing(c.id)} onSupport={() => setDonating(c)} />;

  return <div className="db-view fd">
    <section className="fd-hero has-spotlight">
      <SpotlightLayer className="db-spot" fill="white" strength={0.16} />
      <div className="fd-hero-copy">
        <span className="fd-eyebrow"><HandHeart /> Fundraising</span>
        <h1>Back a classmate. Fund your next step.</h1>
        <p>Students raise money for books, travel, exams, and gear. Support someone's goal or start your own in a couple of minutes.</p>
        <div className="fd-hero-actions">
          <Button variant="ink" className="fd-cta" onClick={() => setCreating(true)}><Plus /> Start a campaign</Button>
          <Button variant="soft" className="fd-ghost" asChild><ViewLink view="settings" tab="payments"><ReceiptText /> Payment history</ViewLink></Button>
        </div>
      </div>
      <dl className="fd-hero-stats">
        <div><dt>You've raised</dt><dd>{usd(mine.reduce((n, c) => n + c.raised, 0))}</dd><small>{mine.length} {mine.length === 1 ? 'campaign' : 'campaigns'}</small></div>
        <div><dt>Your supporters</dt><dd>{mine.reduce((n, c) => n + c.donors, 0)}</dd><small>people backed you</small></div>
        <div><dt>You've given</dt><dd>{usd(given)}</dd><small>to {supported.length} {supported.length === 1 ? 'student' : 'students'}</small></div>
      </dl>
    </section>

    <Tabs label="Fundraising sections" value={tab} onChange={setTab} items={[
      { value: 'discover', label: 'Discover' },
      { value: 'mine', label: 'My campaigns', count: mine.length },
      { value: 'supported', label: 'Supported', count: supported.length },
    ]} />

    {tab === 'discover' ? <>
      <div className="fd-filters">
        <label className="db-search-inline"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search campaigns or students" aria-label="Search campaigns" /></label>
        <Dropdown variant="pill" label="Sort campaigns" value={sort} onChange={setSort} options={fundSorts} align="end" />
      </div>
      <div className="db-filter-row">
        {cats.map(item => <button key={item} type="button" className="db-chip" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
      </div>

      {featured ? <FeaturedCampaign campaign={featured} gave={gifts[featured.id] ?? 0} onOpen={() => setViewing(featured.id)} onSupport={() => setDonating(featured)} /> : null}

      {grid.length
        ? <section className="fd-grid" aria-label="Campaigns">{grid.map(card)}</section>
        : matches.length === 0
          ? <EmptyState icon={Search} title="No campaigns match" body="Try another category or a different search.">
            <Button variant="soft" size="sm" onClick={() => { setQuery(''); setCategory('All'); }}><RotateCcw /> Clear filters</Button>
          </EmptyState>
          : null}
    </> : null}

    {tab === 'mine' ? mine.length
      ? <div className="fd-mine">
        {mine.map(c => <ManageCampaign key={c.id} campaign={c} onOpen={() => setViewing(c.id)} />)}
        <aside className="db-panel fd-tips">
          <h3><Lightbulb /> Tips to reach your goal</h3>
          <ul>
            <li>Share your link in forums and with your school network.</li>
            <li>Post an update when you pass 25%, 50%, and 75%.</li>
            <li>Thank supporters by name in a post.</li>
          </ul>
          <ViewLink view="settings" tab="payments" className="db-link">See donations you've received <ChevronRight /></ViewLink>
        </aside>
      </div>
      : <EmptyState icon={HandHeart} title="No campaigns yet" body="Start one for books, travel, equipment, or exams. It only takes a couple of minutes.">
        <Button variant="ink" size="sm" onClick={() => setCreating(true)}><Plus /> Start a campaign</Button>
      </EmptyState> : null}

    {tab === 'supported' ? supported.length
      ? <>
        <div className="db-panel fd-giving">
          <span className="fd-giving-icon"><HandHeart /></span>
          <div><strong>{usd(given)} given to {supported.length} {supported.length === 1 ? 'student' : 'students'}</strong><small>Thank you for backing your classmates.</small></div>
          <Button variant="soft" size="sm" asChild><ViewLink view="settings" tab="payments">Receipts <ChevronRight /></ViewLink></Button>
        </div>
        <section className="fd-grid" aria-label="Campaigns you supported">{supported.map(card)}</section>
      </>
      : <EmptyState icon={HandHeart} title="You haven't supported anyone yet" body="Your gifts show up here so you can follow each campaign's progress.">
        <Button variant="soft" size="sm" onClick={() => setTab('discover')}><Compass /> Discover campaigns</Button>
      </EmptyState> : null}

    <CampaignDialog open={creating} onOpenChange={setCreating} />
    <DonateDialog campaign={donating} onClose={() => setDonating(null)} />
    <CampaignDetailDialog campaignId={viewing} onClose={() => setViewing(null)} />
  </div>;
}

type CardProps = { campaign: LiveCampaign; gave: number; onOpen: () => void; onSupport: () => void };

function CampaignCard({ campaign: c, gave, onOpen, onSupport }: CardProps) {
  const owner = personById(c.ownerId);
  const pct = percentOf(c);
  return <article className="fd-card">
    <button type="button" className="fd-card-media" onClick={onOpen} tabIndex={-1} aria-hidden="true">
      <img src={c.image} alt="" loading="lazy" />
      <span className="fd-chip">{c.category}</span>
      <span className={cn('fd-chip is-days', c.daysLeft <= 7 && 'is-urgent')}><Clock /> {c.daysLeft}d left</span>
    </button>
    <div className="fd-card-body">
      <div className="fd-owner">
        <ProfileLink personId={owner.id} aria-label={`${owner.name}'s profile`}><Avatar person={owner} size={24} /></ProfileLink>
        <span><ProfileLink personId={owner.id} className="db-name-link">{owner.name}</ProfileLink> · {owner.school}</span>
      </div>
      <h3><button type="button" onClick={onOpen}>{c.title}</button></h3>
      <p>{c.story}</p>
      <div className="fd-progress">
        <div><b>{usd(c.raised)}</b><span>{pct}%</span></div>
        <Bar value={c.raised} max={c.goal} />
        <small>{usd(c.goal)} goal · {c.donors} supporters</small>
      </div>
      <div className="fd-card-actions">
        {gave ? <span className="db-tag is-mint"><Check /> You gave {usd(gave)}</span> : null}
        <Button variant={gave ? 'soft' : 'ink'} size="sm" className="fd-support" onClick={onSupport}><HandHeart /> {gave ? 'Give again' : 'Support'}</Button>
        <Button variant="soft" size="icon" className="fd-share" aria-label={`Share ${c.title}`} title="Copy link" onClick={() => shareCampaign(c)}><Share2 /></Button>
      </div>
    </div>
  </article>;
}

function FeaturedCampaign({ campaign: c, gave, onOpen, onSupport }: CardProps) {
  const owner = personById(c.ownerId);
  const pct = percentOf(c);
  return <article className="fd-featured has-spotlight" aria-label="Featured campaign">
    <SpotlightLayer className="db-spot is-right" />
    <button type="button" className="fd-featured-media" onClick={onOpen} tabIndex={-1} aria-hidden="true"><img src={c.image} alt="" /></button>
    <div className="fd-featured-body">
      <span className="fd-flag"><Flame /> Ending soon · {c.daysLeft} days left</span>
      <h2><button type="button" onClick={onOpen}>{c.title}</button></h2>
      <div className="fd-owner">
        <ProfileLink personId={owner.id} aria-label={`${owner.name}'s profile`}><Avatar person={owner} size={28} /></ProfileLink>
        <span><ProfileLink personId={owner.id} className="db-name-link">{owner.name}</ProfileLink> · {majorOf(owner)} at {owner.school}</span>
      </div>
      <p>{c.story}</p>
      <div className="fd-progress is-large">
        <div><b>{usd(c.raised)}</b><span>raised of {usd(c.goal)} · {pct}%</span></div>
        <Bar value={c.raised} max={c.goal} />
        <small>{c.donors} supporters · {usd(Math.max(0, c.goal - c.raised))} to go</small>
      </div>
      <div className="fd-card-actions">
        <Button variant="ink" onClick={onSupport}><HandHeart /> {gave ? 'Give again' : `Support ${owner.name.split(' ')[0]}`}</Button>
        <Button variant="soft" onClick={onOpen}>Read story</Button>
        <Button variant="soft" size="icon" aria-label={`Share ${c.title}`} title="Copy link" onClick={() => shareCampaign(c)}><Share2 /></Button>
      </div>
    </div>
  </article>;
}

function ManageCampaign({ campaign: c, onOpen }: { campaign: LiveCampaign; onOpen: () => void }) {
  const pct = percentOf(c);
  const done = pct >= 100;
  return <article className="db-panel fd-manage">
    <img src={c.image} alt="" />
    <div className="fd-manage-body">
      <div className="fd-manage-head">
        <span className="db-tag">{c.category}</span>
        <span className={cn('fd-status', done && 'is-done')}><i aria-hidden="true" />{done ? 'Goal reached' : 'Live'} · {c.daysLeft} days left</span>
      </div>
      <h3>{c.title}</h3>
      <div className="fd-progress is-large">
        <div><b>{usd(c.raised)}</b><span>of {usd(c.goal)} · {pct}%</span></div>
        <Bar value={c.raised} max={c.goal} />
      </div>
      <dl className="fd-manage-stats">
        <div><dt>Supporters</dt><dd>{c.donors}</dd></div>
        <div><dt>Average gift</dt><dd>{usd(c.donors ? c.raised / c.donors : 0)}</dd></div>
        <div><dt>Still needed</dt><dd>{usd(Math.max(0, c.goal - c.raised))}</dd></div>
      </dl>
      <div className="fd-card-actions">
        <Button variant="ink" size="sm" onClick={() => shareCampaign(c)}><Share2 /> Copy link</Button>
        <Button variant="soft" size="sm" onClick={onOpen}><Eye /> Preview</Button>
      </div>
    </div>
  </article>;
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
    <section className="db-vibey-hero has-spotlight">
      <SpotlightLayer className="db-spot" fill="white" strength={0.16} />
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
  { tab: 'activity', label: 'My activity', note: 'Posts, comments, likes, and donations', icon: History },
  { tab: 'appearance', label: 'Appearance', note: 'Theme, accent, and logo colors', icon: Palette },
  { tab: 'notifications', label: 'Notifications', note: 'Likes, comments, requests, donations', icon: Bell },
  { tab: 'privacy', label: 'Account privacy', note: 'Who can see your posts and CVision', icon: Lock },
];

/** Extra words people search for that are not in a section's label or note. */
const sectionKeywords: Record<SettingsSection, string> = {
  details: 'name email phone school major zip photo username',
  security: 'password deactivate delete close account two factor login',
  contacts: 'invite address book google import',
  paypal: 'payout withdraw bank money',
  payments: 'receipts history donations autopay refund',
  activity: 'history timeline likes comments posts donations vibeys invites download export data',
  appearance: 'theme dark light mode accent color logo',
  notifications: 'push email digest pause mute likes comments mentions messages events school updates',
  privacy: 'private activity status online message mention cvision like counts hide',
};

type Prefs = {
  paused: boolean; likes: boolean; comments: boolean; mentions: boolean; requests: boolean; messages: boolean;
  donations: boolean; goals: boolean; school: boolean; events: boolean; digest: 'daily' | 'weekly' | 'off';
  privateProfile: boolean; activity: boolean; hideLikes: boolean;
  messagesFrom: 'everyone' | 'school' | 'connections'; mentionsFrom: 'everyone' | 'connections' | 'nobody'; cvision: 'everyone' | 'connections' | 'me';
};
const defaultPrefs: Prefs = {
  paused: false, likes: true, comments: true, mentions: true, requests: true, messages: true,
  donations: true, goals: true, school: true, events: true, digest: 'weekly',
  privateProfile: false, activity: true, hideLikes: false,
  messagesFrom: 'everyone', mentionsFrom: 'everyone', cvision: 'everyone',
};
const usePrefs = () => useStoredPrefs('byeuni-settings-v1', defaultPrefs);
const Group = SettingsGroup;

type SwitchKey = { [K in keyof Prefs]: Prefs[K] extends boolean ? K : never }[keyof Prefs];

function NotificationPrefs({ prefs, set }: ReturnType<typeof usePrefs>) {
  const toggle = (key: SwitchKey) => (value: boolean) => set(key, value);
  const muted = prefs.paused;
  return <div className="st-groups">
    <Group title="Push notifications">
      <SwitchRow icon={BellOff} title="Pause all" note="Mute push alerts for now. Everything still collects in your notifications." checked={prefs.paused} onChange={toggle('paused')} />
    </Group>
    <Group title="Activity" note={muted ? 'Paused. Turn off “Pause all” to change these.' : 'When people interact with your posts.'}>
      <SwitchRow icon={Heart} title="Likes on my posts" checked={prefs.likes} onChange={toggle('likes')} disabled={muted} />
      <SwitchRow icon={MessageSquare} title="Comments and replies" checked={prefs.comments} onChange={toggle('comments')} disabled={muted} />
      <SwitchRow icon={AtSign} title="Mentions and tags" checked={prefs.mentions} onChange={toggle('mentions')} disabled={muted} />
    </Group>
    <Group title="People">
      <SwitchRow icon={UserPlus} title="Friend requests" checked={prefs.requests} onChange={toggle('requests')} disabled={muted} />
      <SwitchRow icon={MessageCircle} title="Messages" checked={prefs.messages} onChange={toggle('messages')} disabled={muted} />
    </Group>
    <Group title="Fundraising and school">
      <SwitchRow icon={HandHeart} title="Donations to my campaigns" checked={prefs.donations} onChange={toggle('donations')} disabled={muted} />
      <SwitchRow icon={Trophy} title="Campaigns I back reach their goal" checked={prefs.goals} onChange={toggle('goals')} disabled={muted} />
      <SwitchRow icon={Megaphone} title="Updates from my school" checked={prefs.school} onChange={toggle('school')} disabled={muted} />
      <SwitchRow icon={CalendarDays} title="Event reminders" note="A day before events you RSVP to." checked={prefs.events} onChange={toggle('events')} disabled={muted} />
    </Group>
    <Group title="Email">
      <ChoiceRow icon={Mail} title="Email digest" note="A roundup of what you missed." value={prefs.digest} onChange={value => set('digest', value)} options={[
        { value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'off', label: 'Off' },
      ]} />
    </Group>
  </div>;
}

function PrivacyPrefs({ prefs, set }: ReturnType<typeof usePrefs>) {
  return <div className="st-groups">
    <Group title="Account privacy">
      <SwitchRow icon={Lock} title="Private profile" note="Only friends can see your posts and CVision." checked={prefs.privateProfile} onChange={value => set('privateProfile', value)} />
      <SwitchRow icon={Activity} title="Show activity status" note="Friends see when you were last active." checked={prefs.activity} onChange={value => set('activity', value)} />
    </Group>
    <Group title="Interactions">
      <ChoiceRow icon={MessageCircle} title="Who can message you" value={prefs.messagesFrom} onChange={value => set('messagesFrom', value)} options={[
        { value: 'everyone', label: 'Everyone' }, { value: 'school', label: 'My school' }, { value: 'connections', label: 'Friends only' },
      ]} />
      <ChoiceRow icon={AtSign} title="Who can mention you" value={prefs.mentionsFrom} onChange={value => set('mentionsFrom', value)} options={[
        { value: 'everyone', label: 'Everyone' }, { value: 'connections', label: 'Friends only' }, { value: 'nobody', label: 'No one' },
      ]} />
      <ChoiceRow icon={FileUser} title="Who can see your CVision" value={prefs.privateProfile && prefs.cvision === 'everyone' ? 'connections' : prefs.cvision} onChange={value => set('cvision', value)} options={[
        { value: 'everyone', label: 'Everyone', disabled: prefs.privateProfile }, { value: 'connections', label: 'Friends only' }, { value: 'me', label: 'Only me' },
      ]} />
    </Group>
    <Group title="Content">
      <SwitchRow icon={EyeOff} title="Hide like counts" note="Others won't see how many likes your posts get." checked={prefs.hideLikes} onChange={value => set('hideLikes', value)} />
    </Group>
    <ViewLink view="settings" tab="security" className="db-panel st-link-card">
      <span className="st-ico"><ShieldCheck /></span>
      <span className="st-row-text"><strong>Password & security</strong><small>Change your password, deactivate, or delete your account.</small></span>
      <ChevronRight />
    </ViewLink>
  </div>;
}

const itemBody = (Icon: typeof Bell, label: string, note?: string, chevron = true) => <>
  <span className="st-ico"><Icon /></span><span className="st-item-text"><strong>{label}</strong>{note ? <small>{note}</small> : null}</span>{chevron ? <ChevronRight /> : null}
</>;

/** Instagram-style settings: everything account-related lives here instead of the profile menu. */
export function SettingsView({ tab }: { tab?: SettingsSection | undefined }) {
  const { account, actions } = useDashboard();
  const navigate = useNavigate();
  const prefs = usePrefs();
  const [inviting, setInviting] = useState(false);
  const [query, setQuery] = useState('');
  const active: SettingsSection = tab ?? 'appearance';
  const sections = [...accountItems, ...settingsPanels];
  const panel = sections.find(item => item.tab === active);
  const q = query.trim().toLowerCase();
  const results = q ? sections.filter(item => `${item.label} ${item.note} ${sectionKeywords[item.tab]}`.toLowerCase().includes(q)) : [];
  const sectionLink = (item: { tab: SettingsSection; label: string; note: string; icon: typeof Bell }) => <ViewLink
    key={item.tab}
    view="settings"
    tab={item.tab}
    className={cn('st-item', active === item.tab && 'is-active')}
    aria-current={tab === item.tab ? 'page' : undefined}
    onClick={() => setQuery('')}
  >{itemBody(item.icon, item.label, item.note)}</ViewLink>;

  return <div className={cn('db-view st-view', tab && 'has-panel')}>
    <ViewHeader title="Settings and privacy" subtitle="Your account, who sees your content, and how you use ByeUni." />
    <div className="st-layout">
      <nav className="st-nav" aria-label="Settings">
        <label className="db-search-inline st-search">
          <Search />
          <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search settings" aria-label="Search settings" />
        </label>

        {q ? <div className="db-panel st-card">
          <p className="ac-nav-label">{results.length ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : 'No results'}</p>
          {results.map(sectionLink)}
          {results.length ? null : <p className="db-muted st-none">Nothing matches “{query.trim()}”. Try “password”, “theme”, or “email”.</p>}
        </div> : <>
          <div className="db-panel st-card st-ac">
            <div className="st-ac-id">
              <Avatar person={me} size={44} />
              <span><strong>{account.firstName} {account.lastName}</strong><small>{account.email}</small></span>
              <em>Accounts Center</em>
            </div>
            {accountItems.map(sectionLink)}
          </div>

          <div className="db-panel st-card">
            <p className="ac-nav-label">How you use ByeUni</p>
            {settingsPanels.map(sectionLink)}
          </div>

          <div className="db-panel st-card">
            <p className="ac-nav-label">More info and support</p>
            <button type="button" className="st-item" onClick={() => setInviting(true)}>{itemBody(UserPlus, 'Invite friends', 'Earn Vibeys for every friend who joins')}</button>
            <Link to="/faqs" className="st-item">{itemBody(LifeBuoy, 'Help center')}</Link>
            <Link to="/about" className="st-item">{itemBody(Info, 'About ByeUni')}</Link>
            <Link to="/" className="st-item">{itemBody(Home, 'ByeUni home page')}</Link>
          </div>

          <div className="db-panel st-card">
            <p className="ac-nav-label">Login</p>
            <a href={REAL_LOGIN_URL.student} className="st-item">{itemBody(ExternalLink, 'Manage a real account', 'Opens byeuni.com')}</a>
            <button type="button" className="st-item" onClick={actions.resetDemo}>{itemBody(RotateCcw, 'Reset demo data', 'Restore the sample posts, people, and campaigns', false)}</button>
            <button type="button" className="st-item is-danger" onClick={() => { signOutDemo(); navigate({ to: '/login' }); }}>{itemBody(LogOut, 'Sign out', `Signed in as ${DEMO_CREDENTIALS.email}`, false)}</button>
          </div>
        </>}
      </nav>

      <section className="st-panel" aria-labelledby="st-panel-title">
        <header className="st-panel-head">
          <ViewLink view="settings" className="st-back" aria-label="Back to settings"><ArrowLeft /></ViewLink>
          <span className="st-ico is-lg">{panel ? <panel.icon /> : null}</span>
          <div><h2 id="st-panel-title">{panel?.label}</h2>{panel ? <p>{panel.note}</p> : null}</div>
          {active === 'notifications' || active === 'privacy' ? <SavedHint at={prefs.savedAt} /> : null}
        </header>
        {isAccountTab(active) ? <AccountPanel tab={active} /> : null}
        {active === 'activity' ? <MyActivity /> : null}
        {active === 'appearance' ? <div className="db-panel db-settings"><AppearancePanel /></div> : null}
        {active === 'notifications' ? <NotificationPrefs {...prefs} /> : null}
        {active === 'privacy' ? <PrivacyPrefs {...prefs} /> : null}
      </section>
    </div>
    <InviteDialog open={inviting} onOpenChange={setInviting} />
  </div>;
}
