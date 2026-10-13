import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowRight, CalendarDays, Flag, GraduationCap, HandHeart, ImagePlus, Lightbulb, LogOut, Megaphone, MessagesSquare, PiggyBank, RotateCcw,
  Sparkles, UserPlus, Users,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { PanelHead, agoText, usePhotoPicker } from '@/components/dashboard/shared';
import { coverSrc } from '@/content/admin-data';
import type { SchoolProfile } from '@/content/school-data';
import { signOutDemo } from '@/lib/demo-session';
import { cn } from '@/lib/utils';
import { campaignState } from '@/components/admin/store';
import { CampaignPill } from '@/components/admin/views-overview';
import { Confirm, PageHead, Pill, Stat, UserCell, day, dollars, pct, userPhoto, Face } from '@/components/admin/ui';
import { useSchool } from './store';
import { SchoolLink, schoolGradient, type Section } from './ui';
import { StudentStatus } from './views-students';

export function OverviewView() {
  const { profile, school, students, campaigns, updates, suggestions, forums, activity, counts } = useSchool();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const raised = campaigns.reduce((n, c) => n + c.raised, 0);
  const donors = campaigns.reduce((n, c) => n + c.donors, 0);
  const invited = students.filter(s => s.invited).length;
  const live = useMemo(() => campaigns.filter(c => campaignState(c) === 'active').sort((a, b) => b.raised - a.raised).slice(0, 4), [campaigns]);
  const newest = useMemo(() => [...students].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6), [students]);
  const recentUpdates = useMemo(() => [...updates].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4), [updates]);

  const queue: { section: Section; label: string; count: number; icon: typeof Users; tone: 'mint' | 'sky' | 'sun' | 'rose'; note: string }[] = [
    { section: 'reports', label: 'Reports to review', count: counts.reports, icon: Flag, tone: 'rose', note: 'Flagged by students' },
    { section: 'suggestions', label: 'New suggestions', count: counts.newSuggestions, icon: Lightbulb, tone: 'sky', note: 'This week' },
    { section: 'students', label: 'Inactive or invited', count: counts.inactive, icon: UserPlus, tone: 'sun', note: 'Can’t sign in yet' },
    { section: 'updates', label: 'Upcoming events', count: counts.upcoming, icon: CalendarDays, tone: 'mint', note: 'On student feeds' },
  ];

  return <section className="db-view">
    <header className="adm-hero sch-hero" style={{ background: `radial-gradient(circle at 88% 10%, rgb(255 255 255 / 18%), transparent 40%), ${schoolGradient(school.colors, 135)}` }}>
      <div>
        <small>{format(new Date(), 'EEEE, MMMM d')} · {school.name}</small>
        <h1>{greeting}, {profile.firstName}</h1>
        <p>{students.length} {school.short} students on ByeUni have raised {dollars(raised)} so far.</p>
      </div>
      <Button variant="ink" asChild className="adm-hero-cta"><SchoolLink section="updates" focus="new"><Megaphone /> Post an update</SchoolLink></Button>
    </header>

    <div className="adm-queue">
      {queue.map(item => <SchoolLink key={item.label} section={item.section} className={cn('db-panel adm-queue-item', `is-${item.tone}`, item.count === 0 && 'is-clear')}>
        <span className="adm-stat-icon"><item.icon /></span>
        <div><strong>{item.count}</strong><span>{item.label}</span><small>{item.count ? item.note : 'All clear'}</small></div>
        <ArrowRight className="adm-queue-arrow" />
      </SchoolLink>)}
    </div>

    <div className="adm-stats">
      <Stat icon={GraduationCap} label="Registered students" value={String(students.length - invited)} note={`${invited} invitation${invited === 1 ? '' : 's'} pending`} />
      <Stat icon={Megaphone} label="Recent updates" value={String(updates.length)} note={`${counts.upcoming} upcoming`} tone="sky" />
      <Stat icon={Lightbulb} label="Suggestions" value={String(suggestions.length)} note={`${counts.newSuggestions} this week`} tone="sun" />
      <Stat icon={PiggyBank} label="Raised by students" value={dollars(raised)} note={`${donors} donors`} tone="rose" />
    </div>

    <div className="adm-grid-2">
      <article className="db-panel">
        <PanelHead title="Our updates" action={<SchoolLink section="updates" className="db-link">View all</SchoolLink>} />
        {recentUpdates.length ? <ul className="sch-updates">
          {recentUpdates.map(u => <li key={u.id}>
            <DateChip at={u.eventDate} />
            <div><strong>{u.title}</strong><p>{u.description}</p><small>Posted {day(u.createdAt)}</small></div>
          </li>)}
        </ul> : <p className="db-muted">No updates yet. Post one to reach every {school.short} student on ByeUni.</p>}
      </article>

      <article className="db-panel">
        <PanelHead title="Live campaigns" action={<SchoolLink section="campaigns" className="db-link">All campaigns</SchoolLink>} />
        <ul className="db-row-list is-plain">
          {live.map(c => <li key={c.id}>
            <img className="adm-thumb" src={coverSrc(c.cover)} alt="" />
            <div className="sch-grow">
              <strong className="sch-clamp">{c.title}</strong>
              <span className="adm-progress"><span><b>{dollars(c.raised)}</b> of {dollars(c.goal)}</span><span className="db-bar"><span style={{ width: `${pct(c.raised, c.goal)}%` }} /></span></span>
            </div>
          </li>)}
        </ul>
      </article>
    </div>

    <div className="adm-grid-2 is-wide-first">
      <article className="db-panel">
        <PanelHead title="Newest students" action={<SchoolLink section="students" className="db-link">All students</SchoolLink>} />
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Major</th><th>Joined</th><th>Status</th></tr></thead>
            <tbody>
              {newest.map(s => <tr key={s.id}>
                <td data-label="Name"><SchoolLink section="students" focus={s.id} className="adm-plain"><UserCell user={s} /></SchoolLink></td>
                <td data-label="Major">{s.major ?? '—'}</td>
                <td data-label="Joined" className="adm-dates">{day(s.createdAt)}</td>
                <td data-label="Status"><StudentStatus student={s} /></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </article>
      <article className="db-panel">
        <PanelHead title="Your activity" />
        <ul className="adm-audit">
          {activity.slice(0, 6).map(entry => <li key={entry.id}>
            <i className={`is-${entry.tone}`} />
            <div><p>{entry.text}</p><small>{agoText(entry.at)}</small></div>
          </li>)}
        </ul>
      </article>
    </div>

    <div className="adm-stats is-mini">
      <Stat icon={MessagesSquare} label="Active forums" value={String(forums.filter(f => !f.removed).length)} tone="sky" />
      <Stat icon={HandHeart} label="Campaigns" value={String(campaigns.length)} note={`${campaigns.filter(c => campaignState(c) === 'complete').length} completed`} tone="mint" />
      <Stat icon={Sparkles} label="Vibeys earned" value={students.reduce((n, s) => n + s.vibeys, 0).toLocaleString('en-US')} tone="sun" />
    </div>
  </section>;
}

export function DateChip({ at }: { at: number }) {
  const past = at < new Date().setHours(0, 0, 0, 0);
  return <span className={cn('sch-date', past && 'is-past')}><small>{format(at, 'MMM')}</small><b>{format(at, 'd')}</b></span>;
}

export function SchoolDetailsView() {
  const { school, students, campaigns, actions } = useSchool();
  const [colors, setColors] = useState(school.colors);
  const [city, setCity] = useState(school.city);
  const [logo, setLogo] = useState(school.logo);
  const picker = usePhotoPicker(([image]) => { if (image) setLogo(image); });
  useEffect(() => { setColors(school.colors); setCity(school.city); setLogo(school.logo); }, [school]);
  const dirty = colors[0] !== school.colors[0] || colors[1] !== school.colors[1] || city !== school.city || logo !== school.logo;
  const sample = students.find(s => s.photo) ?? students[0];

  return <section className="db-view">
    <PageHead title="School details" subtitle="Your school’s branding on ByeUni profiles, campaigns, and the student home page." />
    <div className="adm-grid-2 is-wide-first">
      <article className="db-panel sch-details">
        <div className="adm-school-band sch-band" style={{ background: schoolGradient(colors) }}>
          {logo ? <img src={logo} alt="" /> : <span>{school.short.slice(0, 2).toUpperCase()}</span>}
        </div>
        <form className="db-form" onSubmit={event => { event.preventDefault(); actions.saveSchool({ colors, city: city.trim() || school.city, logo }); }}>
          <h2 className="adm-form-title">Managed by ByeUni</h2>
          <dl className="adm-defs">
            <div><dt>School name</dt><dd>{school.name}</dd></div>
            <div><dt>DUNS number</dt><dd>{school.duns}</dd></div>
            <div><dt>Membership</dt><dd><Pill tone={school.membership === 'Active' ? 'mint' : school.membership === 'Trial' ? 'sun' : 'rose'}>{school.membership}</Pill></dd></div>
            <div><dt>Partner since</dt><dd>{day(school.createdAt)}</dd></div>
          </dl>
          <h2 className="adm-form-title">Branding you can change</h2>
          <div className="adm-logo-row">
            <button type="button" className="adm-logo-pick" onClick={picker.open} aria-label="Upload school logo">{logo ? <img src={logo} alt="" /> : <ImagePlus />}</button>
            {picker.element}
            <label className="db-field">Color 1<input type="color" value={colors[0]} onChange={event => setColors([event.target.value, colors[1]])} /></label>
            <label className="db-field">Color 2<input type="color" value={colors[1]} onChange={event => setColors([colors[0], event.target.value])} /></label>
          </div>
          <label className="db-field">City, state<input value={city} onChange={event => setCity(event.target.value)} placeholder="Stanford, CA" /></label>
          <p className="adm-note">To change the name, DUNS number, or membership, email support@byeuni.com from your school address.</p>
          <div className="db-dialog-actions">
            {logo ? <Button type="button" variant="soft" className="rounded-full" onClick={() => setLogo(undefined)}>Remove logo</Button> : null}
            <Button type="button" variant="soft" className="rounded-full" disabled={!dirty} onClick={() => { setColors(school.colors); setCity(school.city); setLogo(school.logo); }}>Discard</Button>
            <Button type="submit" variant="ink" disabled={!dirty}>Save changes</Button>
          </div>
        </form>
      </article>

      <aside className="db-panel sch-preview">
        <h2 className="adm-form-title">How students see it</h2>
        <div className="sch-preview-card">
          <div className="sch-preview-cover" style={{ background: schoolGradient(colors, 135) }} />
          <Face name={sample?.name ?? 'Student'} photo={userPhoto(sample)} size={64} className="sch-preview-face" />
          <strong>{sample?.name}</strong>
          <small>{sample?.major} · {school.short}</small>
          <span className="sch-preview-badge" style={{ background: colors[0] }}>{logo ? <img src={logo} alt="" /> : <GraduationCap />} {school.name}</span>
        </div>
        <dl className="db-mini-stats">
          <div><dt>Students</dt><dd>{students.length}</dd></div>
          <div><dt>Campaigns</dt><dd>{campaigns.length}</dd></div>
          <div><dt>Raised</dt><dd>{dollars(campaigns.reduce((n, c) => n + c.raised, 0))}</dd></div>
        </dl>
      </aside>
    </div>
  </section>;
}

export function ProfileView() {
  const { profile, school, actions } = useSchool();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<SchoolProfile>(profile);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  useEffect(() => { setDraft(profile); }, [profile]);
  const set = <K extends keyof SchoolProfile>(key: K, value: SchoolProfile[K]) => { setDraft(d => ({ ...d, [key]: value })); setError(''); };

  function save() {
    const problem = actions.saveProfile(draft, password, confirm);
    setError(problem ?? '');
    if (!problem) { setPassword(''); setConfirm(''); }
  }

  function signOut() {
    signOutDemo();
    navigate({ to: '/login' });
  }

  return <section className="db-view">
    <PageHead title="My profile" subtitle={`${profile.title} · ${school.name}`} />
    <div className="adm-grid-2 is-wide-first">
      <article className="db-panel adm-config">
        <form className="db-form" onSubmit={event => { event.preventDefault(); save(); }}>
          <div className="adm-profile-top">
            <Face name={`${draft.firstName} ${draft.lastName}`} size={64} />
            <div><h2>{draft.firstName} {draft.lastName}</h2><p>{draft.title}</p><Pill tone="sky">School admin</Pill></div>
          </div>
          <div className="db-field-row">
            <label className="db-field">First name<input value={draft.firstName} onChange={event => set('firstName', event.target.value)} /></label>
            <label className="db-field">Last name<input value={draft.lastName} onChange={event => set('lastName', event.target.value)} /></label>
          </div>
          <div className="db-field-row">
            <label className="db-field">Email address<input type="email" value={draft.email} onChange={event => set('email', event.target.value)} /></label>
            <label className="db-field">Phone<input value={draft.phone} onChange={event => set('phone', event.target.value)} /></label>
          </div>
          <h3 className="adm-form-title">Change password</h3>
          <div className="db-field-row">
            <label className="db-field">New password<input type="password" autoComplete="new-password" value={password} onChange={event => { setPassword(event.target.value); setError(''); }} placeholder="Leave blank to keep it" /></label>
            <label className="db-field">Confirm password<input type="password" autoComplete="new-password" value={confirm} onChange={event => { setConfirm(event.target.value); setError(''); }} /></label>
          </div>
          {error ? <p className="gate-error" role="alert">{error}</p> : null}
          <div className="db-dialog-actions">
            <Button type="button" variant="soft" className="rounded-full" onClick={() => { setDraft(profile); setPassword(''); setConfirm(''); setError(''); }}>Discard</Button>
            <Button type="submit" variant="ink">Save profile</Button>
          </div>
        </form>
      </article>
      <aside className="db-panel adm-config sch-account">
        <h2 className="adm-form-title">Demo data</h2>
        <p className="db-muted">Changes you make in the school portal are saved in this browser only.</p>
        <Button variant="soft" className="rounded-full" onClick={() => setResetOpen(true)}><RotateCcw /> Reset demo data</Button>
        <h2 className="adm-form-title">Session</h2>
        <Button variant="destructive" className="rounded-full" onClick={signOut}><LogOut /> Sign out</Button>
      </aside>
    </div>
    <Confirm open={resetOpen} onOpenChange={setResetOpen} title="Reset school portal data?" body="Every change you made here is replaced with the original Stanford sample data." confirmLabel="Reset" onConfirm={() => actions.resetAll()} />
  </section>;
}
