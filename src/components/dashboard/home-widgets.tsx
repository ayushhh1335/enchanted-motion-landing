import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { format, formatDistanceToNowStrict } from 'date-fns';
import {
  Annoyed, BadgeCheck, CalendarDays, CalendarPlus, Check, ChevronDown, ChevronRight, Copy, Crown, Frown, Gift, HeartHandshake, Laugh, Link2,
  LifeBuoy, Mail, Megaphone, MessageCircle, Meh, MessageSquareText, Pencil, PartyPopper, Phone, Send, Share2, Smile, Sparkles, UserPlus, Users, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import {
  INVITES_PER_DAY, campusPulse, isMajorMate, isSchoolmate, majorOf, me, moods, people, personById, vibeReasons, vibeWords,
  type Mood, type VibeTone,
} from '@/content/dashboard-data';
import { seedSchool, seedUpdates, type SchoolUpdate } from '@/content/school-data';
import { cn } from '@/lib/utils';
import { Avatar, Bar, ProfileLink, ViewLink, downloadIcs } from './shared';
import { useDashboard } from './store';

const DAY = 86_400_000;
const dayKey = (time: number) => new Date(time).toISOString().slice(0, 10);
const moodIcon: Record<Mood, typeof Smile> = { 1: Frown, 2: Annoyed, 3: Meh, 4: Smile, 5: Laugh };
const toneOf = (mood: Mood): VibeTone => moods.find(m => m.value === mood)?.tone ?? 'neutral';

/* ---------------- Invite to join ByeUni (profile-section.php invite modal) ---------------- */

export function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { account, invites, actions } = useDashboard();
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { if (!open) { setEmails([]); setDraft(''); setError(''); } }, [open]);

  const link = `https://byeuni.com/register.php?ref=${account.username}`;
  const message = `I'm on ByeUni, where students share projects, find classmates, and fundraise for school. Join me: ${link}`;
  const today = dayKey(Date.now());
  const sentToday = invites.filter(i => dayKey(i.at) === today).length;
  const joined = invites.filter(i => i.joined).length;

  function addDraft() {
    const parts = draft.split(/[\s,;]+/).map(p => p.trim()).filter(Boolean);
    if (!parts.length) return;
    setEmails(list => [...new Set([...list, ...parts])]);
    setDraft('');
    setError('');
  }
  function onKey(event: KeyboardEvent<HTMLInputElement>) {
    if (['Enter', ',', ' ', ';'].includes(event.key)) { event.preventDefault(); addDraft(); }
    if (event.key === 'Backspace' && !draft) setEmails(list => list.slice(0, -1));
  }
  function send() {
    const all = [...emails, ...draft.split(/[\s,;]+/).filter(Boolean)];
    if (!all.length) { setError('Add at least one email.'); return; }
    const result = actions.sendInvites(all);
    if (result.error) { setError(result.error); return; }
    setEmails([]); setDraft('');
  }
  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text).then(() => toast.success(label), () => toast.error('Could not copy'));
  }
  function share() {
    if (navigator.share) navigator.share({ title: 'Join me on ByeUni', text: message, url: link }).catch(() => undefined);
    else copy(message, 'Invite message copied');
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="db-dialog iv-dialog">
      <div className="iv-banner">
        <span className="iv-gift"><Gift /></span>
        <div>
          <DialogTitle>Invite a friend to join ByeUni</DialogTitle>
          <DialogDescription>Earn <b>20 Vibeys</b> for each new invite and <b>50 more</b> when they sign up.</DialogDescription>
        </div>
      </div>

      <div className="iv-link">
        <Link2 aria-hidden="true" />
        <input readOnly value={link} aria-label="Your invite link" onFocus={event => event.target.select()} />
        <Button variant="ink" size="sm" onClick={() => copy(link, 'Invite link copied')}><Copy /> Copy</Button>
      </div>

      <div className="iv-share">
        <button type="button" onClick={share}><Share2 /><span>Share</span></button>
        <button type="button" onClick={() => copy(message, 'Invite message copied')}><Copy /><span>Copy invite</span></button>
        <a href={`sms:?&body=${encodeURIComponent(message)}`}><MessageSquareText /><span>Text</span></a>
        <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer"><Phone /><span>WhatsApp</span></a>
      </div>

      <div className="db-field">
        <span className="iv-label"><Mail /> Email invite</span>
        <div className={cn('iv-chips', error && 'has-error')} onClick={event => (event.currentTarget.querySelector('input') as HTMLInputElement | null)?.focus()}>
          {emails.map(email => <span key={email}>{email}<button type="button" aria-label={`Remove ${email}`} onClick={() => setEmails(list => list.filter(e => e !== email))}><X /></button></span>)}
          <input value={draft} onChange={event => { setDraft(event.target.value); setError(''); }} onKeyDown={onKey} onBlur={addDraft} placeholder={emails.length ? '' : 'friend@school.edu, another@gmail.com'} aria-label="Email addresses" />
        </div>
        {error ? <p className="ac-error" role="alert">{error}</p> : null}
      </div>

      <div className="iv-progress">
        <div><strong>{Math.min(sentToday, INVITES_PER_DAY)} of {INVITES_PER_DAY}</strong><small>rewarded invites today</small></div>
        <Bar value={Math.min(sentToday, INVITES_PER_DAY)} max={INVITES_PER_DAY} />
        <small>{invites.length} invited · {joined} joined · {invites.length * 20 + joined * 50} Vibeys earned so far</small>
      </div>

      {invites.length ? <ul className="iv-list">
        {invites.slice(0, 4).map(invite => <li key={invite.id}>
          <span className="iv-dot">{(invite.name ?? invite.email)[0]?.toUpperCase()}</span>
          <span><strong>{invite.name ?? invite.email}</strong><small>Invited {formatDistanceToNowStrict(invite.at, { addSuffix: true })}</small></span>
          {invite.joined ? <em className="is-joined"><BadgeCheck /> Joined</em> : <em>Pending</em>}
        </li>)}
      </ul> : null}

      <div className="db-dialog-actions">
        <Button variant="soft" type="button" onClick={() => onOpenChange(false)}>Done</Button>
        <Button variant="ink" type="button" onClick={send}><Send /> Send invites</Button>
      </div>
    </DialogContent>
  </Dialog>;
}

export function InvitePromo() {
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="db-panel iv-promo" onClick={() => setOpen(true)}>
      <span className="iv-gift"><UserPlus /></span>
      <span><strong>Invite friends to ByeUni</strong><small>+20 Vibeys per invite, +50 when they join</small></span>
      <ChevronRight />
    </button>
    <InviteDialog open={open} onOpenChange={setOpen} />
  </>;
}

/* ---------------- Vibe Check (homepage.php vibe-check, improved) ---------------- */

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 5 ? 'Up late' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
};

const support: Record<VibeTone, { title: string; body: string }> = {
  negative: { title: 'Rough days are allowed', body: 'You don’t have to carry it alone. Reaching out is a strong move, not a weak one.' },
  neutral: { title: 'A small reset goes a long way', body: 'A walk, a snack, or an hour with friends can shift the whole day.' },
  positive: { title: 'Pass the good vibe on', body: 'Days like this are a great time to cheer someone else on.' },
};

function MoodFace({ mood, size = 22 }: { mood: Mood; size?: number }) {
  const Icon = moodIcon[mood];
  return <span className={cn('vc-face', `is-${mood}`)} style={{ width: size + 18, height: size + 18 }}><Icon style={{ width: size, height: size }} /></span>;
}

function Trail() {
  const { vibes } = useDashboard();
  const days = Array.from({ length: 7 }, (_, i) => {
    const time = Date.now() - (6 - i) * DAY;
    return { key: dayKey(time), label: format(time, 'EEEEE'), entry: vibes.find(v => v.date === dayKey(time)) };
  });
  return <ol className="vc-trail" aria-label="Your last 7 days">
    {days.map(d => <li key={d.key} title={d.entry ? `${format(new Date(`${d.key}T12:00:00`), 'EEE')}: ${moods.find(m => m.value === d.entry?.mood)?.label}` : 'No check-in'}>
      {d.entry ? <MoodFace mood={d.entry.mood} size={14} /> : <span className="vc-face is-empty" />}
      <small>{d.label}</small>
    </li>)}
  </ol>;
}

function streakOf(dates: string[]) {
  const set = new Set(dates);
  let streak = 0;
  for (let i = set.has(dayKey(Date.now())) ? 0 : 1; set.has(dayKey(Date.now() - i * DAY)); i += 1) streak += 1;
  return streak;
}

export function VibeCheck() {
  const { todayVibe, vibes, account, actions, kudosSent, spotlight } = useDashboard();
  const [mood, setMood] = useState<Mood | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const streak = streakOf(vibes.map(v => v.date));

  function start(value: Mood) {
    setMood(value);
    const tone = toneOf(value);
    setWords(list => list.filter(w => vibeWords[tone].includes(w)));
  }
  function edit() {
    if (!todayVibe) return;
    setMood(todayVibe.mood); setWords(todayVibe.words); setReasons(todayVibe.reasons); setNote(todayVibe.note);
    setEditing(true);
  }
  function submit() {
    if (!mood || !words.length) return;
    actions.checkVibe({ mood, words, reasons, note: note.trim() });
    setEditing(false); setMood(null); setExpanded(true);
  }
  const toggle = (list: string[], value: string, max = 99) => list.includes(value) ? list.filter(v => v !== value) : list.length >= max ? list : [...list, value];

  if (todayVibe && !editing) {
    const tone = toneOf(todayVibe.mood);
    const total = campusPulse.responses + 1;
    const tones = { ...campusPulse.tones, [tone]: campusPulse.tones[tone] + 1 };
    const share = (t: VibeTone) => Math.round((tones[t] / total) * 100);
    const counts = { ...campusPulse.words };
    todayVibe.words.forEach(w => { counts[w] = (counts[w] ?? 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = top[0]?.[1] ?? 1;
    const label = moods.find(m => m.value === todayVibe.mood)?.label ?? '';
    const spotlightName = personById(spotlight.personId).name.split(' ')[0];

    return <section className={cn('db-panel vc-card is-done', `tone-${tone}`)} aria-label="Today’s Vibe Check">
      <button type="button" className="vc-summary" aria-expanded={expanded} onClick={() => setExpanded(v => !v)}>
        <MoodFace mood={todayVibe.mood} size={20} />
        <span><strong>Today you’re feeling {label.toLowerCase()}</strong><small>{todayVibe.words.join(' · ')}{streak > 1 ? ` · ${streak}-day check-in streak` : ''}</small></span>
        <span className="vc-pill">{share(tone)}% of Stanford feels {tone === 'neutral' ? 'so-so' : tone}</span>
        <ChevronDown className="vc-chevron" />
      </button>
      {expanded ? <div className="vc-result">
        <div className="vc-pulse">
          <h3>Campus pulse <small>{total.toLocaleString('en-US')} Stanford check-ins today · anonymous</small></h3>
          <div className="vc-stack" role="img" aria-label={`Positive ${share('positive')}%, neutral ${share('neutral')}%, negative ${share('negative')}%`}>
            <span className="is-positive" style={{ width: `${share('positive')}%` }} />
            <span className="is-neutral" style={{ width: `${share('neutral')}%` }} />
            <span className="is-negative" style={{ width: `${share('negative')}%` }} />
          </div>
          <div className="vc-legend"><span className="is-positive">Positive {share('positive')}%</span><span className="is-neutral">Neutral {share('neutral')}%</span><span className="is-negative">Negative {share('negative')}%</span></div>
          <ul className="vc-words">
            {top.map(([word, n]) => <li key={word} className={cn(todayVibe.words.includes(word) && 'is-mine')}>
              <span>{word}</span><i style={{ width: `${Math.max(8, (n / max) * 100)}%` }} /><b>{n}</b>
            </li>)}
          </ul>
        </div>
        <div className="vc-side">
          <div className="vc-week"><h3>Your week</h3><Trail /></div>
          <div className={cn('vc-support', `tone-${tone}`)}>
            <strong>{support[tone].title}</strong>
            <p>{support[tone].body}</p>
            {tone === 'negative' ? <div className="vc-links">
              <a href="tel:6507233785"><LifeBuoy /> Stanford CAPS · (650) 723-3785</a>
              <a href="tel:988"><Phone /> Call or text 988, any time</a>
              <ViewLink view="communities"><Users /> Talk it out in a forum</ViewLink>
            </div> : tone === 'neutral' ? <div className="vc-links">
              <ViewLink view="events"><CalendarDays /> See what’s on this week</ViewLink>
              <ViewLink view="messages"><MessageCircle /> Message a friend</ViewLink>
            </div> : <div className="vc-links">
              <button type="button" disabled={kudosSent} onClick={actions.sendKudos}><PartyPopper /> {kudosSent ? `You cheered ${spotlightName}` : `Cheer ${spotlightName}, today’s Student of the Day`}</button>
            </div>}
          </div>
          <div className="vc-actions">
            <Button variant="soft" size="sm" onClick={edit}><Pencil /> Edit check-in</Button>
            <small>Notes stay private. Your school only sees anonymous totals.</small>
          </div>
        </div>
      </div> : null}
    </section>;
  }

  const tone = mood ? toneOf(mood) : null;
  return <section className={cn('db-panel vc-card', tone && `tone-${tone}`)} aria-label="Vibe Check">
    <div className="vc-head">
      <div>
        <small className="vc-eyebrow"><Sparkles /> Vibe Check · +5 Vibeys</small>
        <h2>{greeting()}, {account.firstName}. How’s your vibe today?</h2>
      </div>
      <Trail />
    </div>
    <div className="vc-moods" role="radiogroup" aria-label="Your mood right now">
      {moods.map(m => <button key={m.value} type="button" role="radio" aria-checked={mood === m.value} className={cn('vc-mood', `is-${m.value}`)} onClick={() => start(m.value)}>
        <MoodFace mood={m.value} size={22} /><span>{m.label}</span>
      </button>)}
    </div>
    {mood && tone ? <div className="vc-step">
      <fieldset>
        <legend>Which words fit? <small>Pick up to 3</small></legend>
        <div className="vc-chips">{vibeWords[tone].map(word => <button key={word} type="button" aria-pressed={words.includes(word)} onClick={() => setWords(list => toggle(list, word, 3))}>{words.includes(word) ? <Check /> : null}{word}</button>)}</div>
      </fieldset>
      <fieldset>
        <legend>What’s shaping it? <small>Optional</small></legend>
        <div className="vc-chips is-soft">{vibeReasons.map(reason => <button key={reason} type="button" aria-pressed={reasons.includes(reason)} onClick={() => setReasons(list => toggle(list, reason))}>{reason}</button>)}</div>
      </fieldset>
      <label className="db-field vc-note">Anything else? <small>Only you can see this</small>
        <textarea rows={2} maxLength={200} value={note} onChange={event => setNote(event.target.value)} placeholder="e.g. Midterm went better than I thought" />
      </label>
      <div className="vc-foot">
        <button type="button" className="db-link-muted" onClick={() => { setMood(null); setEditing(false); }}>{editing ? 'Cancel' : 'Back'}</button>
        <Button variant="ink" disabled={!words.length} onClick={submit}>{editing ? 'Update check-in' : 'Check in'} <Send /></Button>
      </div>
    </div> : <p className="vc-privacy"><HeartHandshake /> Takes 20 seconds. Your school only sees anonymous campus totals.</p>}
  </section>;
}

/* ---------------- Recent updates from your school ---------------- */

type SchoolFeed = { updates: SchoolUpdate[]; colors: [string, string]; name: string };

function readSchoolFeed(): SchoolFeed {
  const fallback: SchoolFeed = { updates: seedUpdates, colors: seedSchool.colors, name: seedSchool.name };
  try {
    const raw = localStorage.getItem('byeuni-school-v1');
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as { updates?: SchoolUpdate[]; school?: { colors?: [string, string]; name?: string } };
    return {
      updates: Array.isArray(saved.updates) ? saved.updates : fallback.updates,
      colors: saved.school?.colors ?? fallback.colors,
      name: saved.school?.name ?? fallback.name,
    };
  } catch { return fallback; }
}

/** Updates the school admin posts on /school-admin show up here, including from another tab. */
function useSchoolFeed() {
  const [feed, setFeed] = useState(readSchoolFeed);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => { if (event.key === 'byeuni-school-v1') setFeed(readSchoolFeed()); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  const sorted = useMemo(() => {
    const start = new Date().setHours(0, 0, 0, 0);
    const upcoming = feed.updates.filter(u => u.eventDate >= start).sort((a, b) => a.eventDate - b.eventDate);
    const past = feed.updates.filter(u => u.eventDate < start).sort((a, b) => b.eventDate - a.eventDate);
    return [...upcoming, ...past];
  }, [feed.updates]);
  return { ...feed, updates: sorted };
}

function UpdateDate({ at }: { at: number }) {
  const past = at < new Date().setHours(0, 0, 0, 0);
  return <span className={cn('su-date', past && 'is-past')}><small>{format(at, 'MMM')}</small><b>{format(at, 'd')}</b></span>;
}

function whenText(at: number) {
  const start = new Date().setHours(0, 0, 0, 0);
  const days = Math.round((new Date(at).setHours(0, 0, 0, 0) - start) / DAY);
  if (days < 0) return 'Past event';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export function SchoolUpdates() {
  const { updates, colors, name } = useSchoolFeed();
  const [open, setOpen] = useState<SchoolUpdate | null>(null);
  const [all, setAll] = useState(false);
  const style = { '--su-a': colors[0], '--su-b': colors[1] } as CSSProperties;

  const card = (update: SchoolUpdate) => <button key={update.id} type="button" className="su-card" onClick={() => setOpen(update)}>
    <UpdateDate at={update.eventDate} />
    <span className="su-body">
      <strong>{update.title}</strong>
      <small>{update.description}</small>
      <em className={cn(update.eventDate < new Date().setHours(0, 0, 0, 0) && 'is-past')}>{whenText(update.eventDate)}</em>
    </span>
  </button>;

  return <section className="db-panel su-panel" style={style} aria-label={`Recent updates from your school, ${name}`}>
    <header className="su-head">
      <span className="su-crest" aria-hidden="true">{name.replace(/University|College|of|The/g, '').trim()[0]}</span>
      <div><h2>Recent updates from your school</h2><small>{name}</small></div>
      {updates.length > 3 ? <button type="button" className="db-link" onClick={() => setAll(true)}>Show more</button> : null}
    </header>
    {updates.length ? <div className="su-track">{updates.slice(0, 6).map(card)}</div> : <p className="db-muted su-empty"><Megaphone /> No recent updates from {name} yet.</p>}

    <Dialog open={all} onOpenChange={setAll}>
      <DialogContent className="db-dialog su-all">
        <DialogTitle>Updates from {name}</DialogTitle>
        <DialogDescription>Posted by your school’s ByeUni admin.</DialogDescription>
        <div className="su-list">{updates.map(card)}</div>
      </DialogContent>
    </Dialog>

    <Dialog open={Boolean(open)} onOpenChange={value => { if (!value) setOpen(null); }}>
      {open ? <DialogContent className="db-dialog su-detail" style={style}>
        <div className="su-detail-band"><UpdateDate at={open.eventDate} /><span>{name}</span></div>
        <DialogTitle>{open.title}</DialogTitle>
        <DialogDescription asChild><p>{open.description}</p></DialogDescription>
        <dl className="su-meta">
          <div><dt>Event date</dt><dd>{format(open.eventDate, 'EEEE, MMMM d, yyyy')} · {whenText(open.eventDate)}</dd></div>
          <div><dt>Posted</dt><dd>{format(open.createdAt, 'MMM d, yyyy')}</dd></div>
        </dl>
        <div className="db-dialog-actions">
          <Button variant="soft" onClick={() => setOpen(null)}>Close</Button>
          {open.eventDate >= new Date().setHours(0, 0, 0, 0)
            ? <Button variant="ink" onClick={() => downloadIcs(open.title, format(open.eventDate, 'yyyy-MM-dd'), name)}><CalendarPlus /> Add to calendar</Button>
            : null}
        </div>
      </DialogContent> : null}
    </Dialog>
  </section>;
}

/* ---------------- Student of the Day (select_student_cron.php) ---------------- */

export function StudentOfTheDay() {
  const { spotlight, connections, actions, kudosSent, chats } = useDashboard();
  const person = personById(spotlight.personId);
  const state = connections[person.id] ?? 'none';
  const chat = chats.find(c => c.personId === person.id);
  const first = person.name.split(' ')[0];

  return <section className="db-panel sotd" aria-label="Student of the Day">
    <header>
      <span><Crown /> Student of the Day</span>
      <small>{format(new Date(), 'EEE, MMM d')}</small>
    </header>
    <div className="sotd-id">
      <ProfileLink personId={person.id} className="sotd-ring" aria-label={`${person.name}'s profile`}><Avatar person={person} size={76} /></ProfileLink>
      <div>
        <strong><ProfileLink personId={person.id} className="db-name-link">{person.name}</ProfileLink> {person.verified ? <BadgeCheck className="db-verified" /> : null}</strong>
        <small>{majorOf(person)} · {person.year}</small>
      </div>
    </div>
    <p className="sotd-reason">{spotlight.reason}</p>
    <span className="sotd-highlight"><Sparkles /> {spotlight.highlight}</span>
    <div className="sotd-actions">
      <Button variant={kudosSent ? 'soft' : 'ink'} size="sm" disabled={kudosSent} onClick={actions.sendKudos}>
        <PartyPopper /> {kudosSent ? 'Cheered' : 'Cheer'}
      </Button>
      {state === 'connected'
        ? chat
          ? <Button variant="soft" size="sm" asChild><Link to="/dashboard" search={{ view: 'messages', chat: chat.id }}><MessageCircle /> Message</Link></Button>
          : <Button variant="soft" size="sm" disabled><Check /> Friends</Button>
        : state === 'incoming'
          ? <Button variant="soft" size="sm" onClick={() => { actions.setConnection(person.id, 'connected'); toast.success(`You and ${first} are now friends`); }}><Check /> Accept</Button>
          : <Button variant="soft" size="sm" onClick={() => actions.setConnection(person.id, state === 'pending' ? 'none' : 'pending')}>
            {state === 'pending' ? <><X /> Cancel request</> : <><UserPlus /> Add friend</>}
          </Button>}
    </div>
  </section>;
}

/* ---------------- School Friends / Major Friends (homepage.php network suggestions) ---------------- */

export function FriendsCarousel({ kind }: { kind: 'school' | 'major' }) {
  const { connections, dismissed, actions } = useDashboard();
  const list = people.filter(p => (kind === 'school' ? isSchoolmate(p) : isMajorMate(p))
    && !dismissed.includes(p.id) && !['connected', 'incoming', 'declined'].includes(connections[p.id] ?? 'none'));
  if (!list.length) return null;
  const title = kind === 'school' ? 'School Friends' : 'Major Friends';
  const scope = kind === 'school' ? me.school : majorOf(me);

  return <section className="db-panel fr-panel" aria-label={`${title}: ${scope}`}>
    <header className="db-panel-head">
      <h2>{kind === 'school' ? <Users /> : <Sparkles />} {title} <small>· {scope}</small></h2>
      <ViewLink view="network" tab={kind} className="db-link">See all</ViewLink>
    </header>
    <div className="fr-track">
      {list.map(person => {
        const pending = connections[person.id] === 'pending';
        return <article key={person.id} className="fr-card">
          <button type="button" className="fr-dismiss" aria-label={`Hide ${person.name}`} onClick={() => actions.dismissSuggestion(person.id)}><X /></button>
          <ProfileLink personId={person.id} aria-label={`${person.name}'s profile`}><Avatar person={person} size={72} /></ProfileLink>
          <strong><ProfileLink personId={person.id} className="db-name-link">{person.name}</ProfileLink></strong>
          <small>{kind === 'school' ? majorOf(person) : person.school}</small>
          <small className="fr-mutual"><Users /> {person.mutual} mutual</small>
          <Button variant={pending ? 'soft' : 'ink'} size="sm" className="db-wide" onClick={() => actions.setConnection(person.id, pending ? 'none' : 'pending')}>
            {pending ? <><Check /> Requested</> : <><UserPlus /> Add friend</>}
          </Button>
        </article>;
      })}
    </div>
  </section>;
}
