import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  BadgeCheck, Briefcase, CalendarPlus, Check, Copy, Flame, Gift, GraduationCap, HandHeart, LogOut, MapPin, Moon, Pencil, Plus,
  RotateCcw, Share2, Sparkles, Star, Target, Trophy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DEMO_CREDENTIALS, signOutDemo } from '@/lib/demo-session';
import { ME_ID, me, personById, rewards, vibeyRules } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';
import { EventDate } from './Rails';
import { CampaignDialog, DonateDialog, ProfileDialog } from './dialogs';
import { Bar, EmptyState, agoText, usd } from './shared';
import { profileCompletion, useDashboard, type LiveCampaign } from './store';
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
            <small>{owner.name} · {owner.school}</small>
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

function downloadIcs(title: string, date: string, place: string) {
  const day = date.replaceAll('-', '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ByeUni//Demo//EN', 'BEGIN:VEVENT', `UID:${day}-${title.length}@byeuni`, `DTSTART;VALUE=DATE:${day}`, `SUMMARY:${title}`, `LOCATION:${place}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${title.replace(/\W+/g, '-').toLowerCase()}.ics` });
  a.click();
  URL.revokeObjectURL(url);
}

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
  </div>;
}

/* ---------------- CVision ---------------- */

export function CVisionView() {
  const { profile, posts, stories } = useDashboard();
  const [editing, setEditing] = useState(false);
  const completion = profileCompletion(profile, stories.some(s => s.personId === ME_ID));
  const projects = posts.filter(p => p.authorId === ME_ID && p.images.length).slice(0, 4);
  const link = `https://byeuni.com/cVision.php?username=${me.handle}`;

  return <div className="db-view db-cvision">
    <section className="db-panel db-cv-hero">
      <div className="db-cv-cover" />
      <div className="db-cv-id">
        <img src={me.photo} alt="" />
        <div>
          <h1>{me.name} <BadgeCheck className="db-verified" /></h1>
          <p>{profile.headline}</p>
          <small><GraduationCap /> {me.major} · {me.school} · {me.year}</small>
          <small><MapPin /> {me.city}</small>
        </div>
        <div className="db-view-actions">
          <Button variant="soft" size="sm" onClick={() => navigator.clipboard?.writeText(link).then(() => toast.success('CVision link copied'))}><Copy /> Copy link</Button>
          <Button variant="ink" size="sm" onClick={() => setEditing(true)}><Pencil /> Edit</Button>
        </div>
      </div>
      <div className="db-completion"><span>CVision strength</span><b>{completion}%</b></div>
      <Bar value={completion} max={100} />
    </section>

    <div className="db-two-col">
      <section className="db-panel">
        <header className="db-panel-head"><h2>About</h2></header>
        <p className="db-prose">{profile.about}</p>
        <header className="db-panel-head"><h2>Skills</h2></header>
        <div className="db-skills">{profile.skills.map(skill => <span key={skill}>{skill}</span>)}</div>
        <header className="db-panel-head"><h2>Goals</h2></header>
        <ul className="db-goals">{profile.goals.map(goal => <li key={goal}><Target /> {goal}</li>)}</ul>
      </section>
      <section className="db-panel">
        <header className="db-panel-head"><h2>Experience</h2></header>
        <ol className="db-timeline">
          {profile.experience.map(item => <li key={item.id}>
            <span className="db-promo-icon"><Briefcase /></span>
            <div><strong>{item.role}</strong><small>{item.org} · {item.period}</small><p>{item.detail}</p></div>
          </li>)}
          <li>
            <span className="db-promo-icon"><GraduationCap /></span>
            <div><strong>{me.school}</strong><small>{me.major} · 2023 – 2027</small><p>Dean's List, CS 106B section leader.</p></div>
          </li>
        </ol>
      </section>
    </div>

    <h2 className="db-section-title">Portfolio</h2>
    <section className="db-grid">
      {projects.map(post => <article key={post.id} className="db-tile"><img src={post.images[0]} alt="" /><span className="db-tile-hover">{post.kind}</span></article>)}
    </section>
    <ProfileDialog open={editing} onOpenChange={setEditing} />
  </div>;
}

/* ---------------- Settings ---------------- */

export function SettingsView() {
  const { actions } = useDashboard();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [prefs, setPrefs] = useState({ likes: true, comments: true, requests: true, campaigns: true, privateProfile: false });
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);

  function setTheme(next: boolean) {
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('byeuni-theme', next ? 'dark' : 'light'); } catch { /* Preference is optional. */ }
  }
  const toggle = (key: keyof typeof prefs) => (value: boolean) => setPrefs(p => ({ ...p, [key]: value }));

  return <div className="db-view">
    <ViewHeader title="Settings" subtitle="Appearance, notifications, and your demo account." />
    <section className="db-panel db-settings">
      <h2>Appearance</h2>
      <label><span><Moon /> Dark mode</span><Switch checked={dark} onCheckedChange={setTheme} /></label>
      <h2>Notifications</h2>
      <label><span>Likes on my posts</span><Switch checked={prefs.likes} onCheckedChange={toggle('likes')} /></label>
      <label><span>Comments and replies</span><Switch checked={prefs.comments} onCheckedChange={toggle('comments')} /></label>
      <label><span>Connection requests</span><Switch checked={prefs.requests} onCheckedChange={toggle('requests')} /></label>
      <label><span>Campaign donations</span><Switch checked={prefs.campaigns} onCheckedChange={toggle('campaigns')} /></label>
      <h2>Privacy</h2>
      <label><span>Private profile <small>Only connections can see your posts and CVision.</small></span><Switch checked={prefs.privateProfile} onCheckedChange={toggle('privateProfile')} /></label>
      <h2>Account</h2>
      <p className="db-muted">Signed in as {DEMO_CREDENTIALS.email} (demo account). Manage a real account on <a className="db-link" href="https://byeuni.com/login.php">byeuni.com</a>.</p>
      <div className="db-dialog-actions is-start">
        <Button variant="soft" onClick={actions.resetDemo}><RotateCcw /> Reset demo data</Button>
        <Button variant="destructive" className="rounded-full" onClick={() => { signOutDemo(); navigate({ to: '/login' }); }}><LogOut /> Sign out</Button>
      </div>
    </section>
  </div>;
}
