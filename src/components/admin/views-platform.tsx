import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import {
  Banknote, CalendarRange, Crown, Dices, Flag, Flame, Gift, HeartPulse, ImagePlus, LogOut, Mail, PencilLine, Plus, RotateCcw, Save, School, Send,
  Sparkles, Ticket, Trash2, Trophy, Users,
} from 'lucide-react';
import { AppearancePanel } from '@/components/Appearance';
import { ActivityLog, ChoiceRow, SavedHint, SettingsGroup, SwitchRow, useStoredPrefs } from '@/components/settings-kit';
import { Button } from '@/components/ui/button';
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { usePhotoPicker } from '@/components/dashboard/shared';
import {
  adminProfile, coverKeys, coverSrc, type AdminReward, type Contest, type EarnRule, type ECard, type EmailTemplate, type LibraryItem, type Quote,
  type SystemConfig,
} from '@/content/admin-data';
import { signOutDemo } from '@/lib/demo-session';
import { cn } from '@/lib/utils';
import { uid, useAdmin, type LibraryKind } from './store';
import { AdminTabs, Confirm, Empty, Face, PageHead, Pill, UserCell, day, dollars, userPhoto } from './ui';

type VibeysTab = 'requests' | 'rewards' | 'rules' | 'contests';
type VibeysPane = 'rewards' | 'actions' | 'contest';
const vibeysTabs: Record<VibeysPane, VibeysTab[]> = {
  rewards: ['requests', 'rewards'],
  actions: ['rules'],
  contest: ['contests'],
};
const vibeysHead: Record<VibeysPane, [string, string]> = {
  rewards: ['Vibeys Rewards', 'Gift cards students redeem, and the coupon codes waiting to be emailed.'],
  actions: ['Vibeys Action', 'Points for registration, login, forums, campaigns, friends, comments, and donations. New actions are added in the database.'],
  contest: ['Grand Contest', 'Set the entry cost and prize, then pick one winner from the entrants.'],
};

export function VibeysView({ pane }: { pane?: VibeysPane | undefined }) {
  const { redemptions, rewards, rules, contests, counts, lookups, actions } = useAdmin();
  const allowed = pane ? vibeysTabs[pane] : (['requests', 'rewards', 'rules', 'contests'] as VibeysTab[]);
  const [tab, setTab] = useState<VibeysTab>(allowed[0] ?? 'requests');
  useEffect(() => { if (pane) setTab(vibeysTabs[pane][0] ?? 'requests'); }, [pane]);
  const [fulfil, setFulfil] = useState<string | null>(null);
  const [coupon, setCoupon] = useState('');
  const [rewardEdit, setRewardEdit] = useState<AdminReward | 'new' | null>(null);
  const [ruleEdit, setRuleEdit] = useState<EarnRule | null>(null);
  const [contestEdit, setContestEdit] = useState<Contest | 'new' | null>(null);
  const [entrants, setEntrants] = useState<string | null>(null);
  const redeemedCount = (id: string) => redemptions.filter(r => r.rewardId === id).length;
  const sorted = [...redemptions].sort((a, b) => Number(b.status === 'requested') - Number(a.status === 'requested') || b.at - a.at);
  const fulfilling = redemptions.find(r => r.id === fulfil);

  const head = pane ? vibeysHead[pane] : ['Vibeys', 'Rewards, earn rules, and the grand contest that keep students coming back.'] as const;
  const tabItems = [
    { value: 'requests' as const, label: 'Reward requests', count: counts.redemptions }, { value: 'rewards' as const, label: `Rewards ${rewards.length}` },
    { value: 'rules' as const, label: 'Earn rules' }, { value: 'contests' as const, label: 'Grand contest', count: counts.contests },
  ].filter(item => allowed.includes(item.value));

  return <section className="db-view">
    <PageHead title={head[0]} subtitle={head[1]} />
    {tabItems.length > 1 ? <AdminTabs label="Vibeys" value={tab} onChange={setTab} items={tabItems} /> : null}

    {tab === 'requests' ? <article className="db-panel adm-table-panel">
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Student</th><th>Reward</th><th className="adm-num">Cost</th><th>Requested</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {sorted.map(r => {
              const reward = lookups.rewards.get(r.rewardId);
              return <tr key={r.id}>
                <td data-label="Student"><UserCell user={lookups.users.get(r.userId)} /></td>
                <td data-label="Reward"><span className="adm-campaign-cell">{reward ? <img src={coverSrc(reward.cover)} alt="" /> : null}<strong>{reward?.name ?? 'Deleted reward'}</strong></span></td>
                <td data-label="Cost" className="adm-num"><span className="adm-vibeys"><Sparkles /> {reward?.required ?? '—'}</span></td>
                <td data-label="Requested">{day(r.at)}</td>
                <td data-label="Status"><span className="adm-stack">{r.status === 'requested' ? <Pill tone="sun">Requested</Pill> : <Pill tone="mint">Redeemed</Pill>}{r.coupon ? <code className="adm-code adm-sub">{r.coupon}</code> : null}</span></td>
                <td className="adm-col-actions">{r.status === 'requested'
                  ? <Button size="sm" variant="ink" onClick={() => { setFulfil(r.id); setCoupon(''); }}><Send /> Send coupon</Button>
                  : <small className="db-muted">{r.redeemedAt ? day(r.redeemedAt) : ''}</small>}</td>
              </tr>;
            })}
            {sorted.length === 0 ? <Empty>No reward requests yet.</Empty> : null}
          </tbody>
        </table>
      </div>
    </article> : null}

    {tab === 'rewards' ? <>
      <div className="adm-toolbar"><Button variant="ink" className="ml-auto" onClick={() => setRewardEdit('new')}><Plus /> Add reward</Button></div>
      <div className="db-card-grid">
        {rewards.map(r => <article key={r.id} className={cn('db-panel adm-reward', !r.active && 'is-off')}>
          <img src={coverSrc(r.cover)} alt="" />
          <div>
            <h3>{r.name}</h3>
            <small>{r.detail}</small>
            <div className="db-reward-foot"><b><Sparkles /> {r.required.toLocaleString('en-US')}</b><small>{redeemedCount(r.id)} redeemed</small></div>
            <div className="adm-school-foot">
              <label className="adm-switch"><Switch checked={r.active} onCheckedChange={() => actions.toggleReward(r.id)} aria-label={`${r.name} active`} /> {r.active ? 'Live' : 'Hidden'}</label>
              <span className="adm-row-actions">
                <button type="button" className="db-icon-btn" aria-label={`Edit ${r.name}`} onClick={() => setRewardEdit(r)}><PencilLine /></button>
                <button type="button" className="db-icon-btn" aria-label={`Delete ${r.name}`} onClick={() => actions.deleteReward(r.id)}><Trash2 /></button>
              </span>
            </div>
          </div>
        </article>)}
      </div>
    </> : null}

    {tab === 'rules' ? <article className="db-panel adm-table-panel">
      <p className="adm-note">Each rule is wired to an action in the app. Adjust amounts here; new actions are added by engineering.</p>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>ID</th><th>Action</th><th className="adm-num">Vibeys</th><th className="adm-num">Max count</th><th>Type</th><th>Active</th><th><span className="sr-only">Edit</span></th></tr></thead>
          <tbody>
            {rules.map(rule => <tr key={rule.id} className={cn(!rule.active && 'is-muted')}>
              <td data-label="ID"><code className="adm-code">#{rule.id}</code></td>
              <td data-label="Action"><span className="adm-stack"><strong>{rule.action}</strong><small className="adm-sub">{rule.description}</small></span></td>
              <td data-label="Vibeys" className="adm-num"><span className="adm-vibeys"><Sparkles /> {rule.vibeys}</span></td>
              <td data-label="Max count" className="adm-num">{rule.maxCount || '—'}</td>
              <td data-label="Type">{rule.streak ? <Pill tone="sun"><Flame /> Streak</Pill> : rule.once ? <Pill tone="sky">Once</Pill> : <Pill tone="muted">Repeatable</Pill>}</td>
              <td data-label="Active"><Switch checked={rule.active} onCheckedChange={on => actions.saveRule({ ...rule, active: on })} aria-label={`${rule.action} active`} /></td>
              <td className="adm-col-actions"><button type="button" className="db-icon-btn" aria-label={`Edit ${rule.action}`} onClick={() => setRuleEdit(rule)}><PencilLine /></button></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </article> : null}

    {tab === 'contests' ? <>
      <div className="adm-toolbar"><Button variant="ink" className="ml-auto" onClick={() => setContestEdit('new')}><Plus /> New contest</Button></div>
      <div className="adm-cards is-grid">
        {[...contests].sort((a, b) => b.from - a.from).map(c => {
          const status = contestStatus(c);
          const winner = lookups.users.get(c.winnerId ?? '');
          return <article key={c.id} className={cn('db-panel adm-contest', status.key === 'pick' && 'is-urgent')}>
            <header><Pill tone={status.tone}>{status.label}</Pill><small><CalendarRange /> {format(c.from, 'MMM d')} – {day(c.to)}</small></header>
            <h3><Trophy /> {c.name}</h3>
            <p className="adm-prize">{c.prize} <span>· {dollars(c.prizeValue)} value</span></p>
            <dl className="db-mini-stats">
              <div><dt>Entry</dt><dd>{c.entry} Vibeys</dd></div>
              <div><dt>Entrants</dt><dd>{c.participants.length}</dd></div>
              <div><dt>Pool</dt><dd>{(c.entry * c.participants.length).toLocaleString('en-US')}</dd></div>
            </dl>
            {winner ? <p className="adm-winner"><Crown /> <Face name={winner.name} photo={userPhoto(winner)} size={28} /> <b>{winner.name}</b> won{c.pickedAt ? ` on ${day(c.pickedAt)}` : ''}</p> : null}
            <footer>
              <Button size="sm" variant={status.key === 'pick' ? 'ink' : 'soft'} onClick={() => setEntrants(c.id)}><Users /> {c.winnerId ? 'Entrants' : 'Entrants & winner'}</Button>
              <Button size="sm" variant="soft" onClick={() => setContestEdit(c)}><PencilLine /> Edit</Button>
            </footer>
          </article>;
        })}
      </div>
    </> : null}

    <Confirm
      open={fulfilling !== undefined}
      onOpenChange={open => { if (!open) setFulfil(null); }}
      title="Send reward coupon"
      tone="ink"
      confirmLabel="Email coupon"
      body={fulfilling ? <>{lookups.users.get(fulfilling.userId)?.name} redeemed <b>{lookups.rewards.get(fulfilling.rewardId)?.name}</b>. Paste the code from the vendor; we’ll email it with the “Your Reward Coupon is Here!” template.</> : null}
      onConfirm={() => fulfil ? actions.fulfillRedemption(fulfil, coupon) : false}
    >
      <div className="db-inline-add">
        <input value={coupon} onChange={event => setCoupon(event.target.value.toUpperCase())} placeholder="Coupon code" aria-label="Coupon code" autoFocus />
        <Button type="button" variant="soft" onClick={() => setCoupon(`BYU-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`)}><Ticket /> Generate</Button>
      </div>
    </Confirm>
    <RewardEditor value={rewardEdit} onClose={() => setRewardEdit(null)} />
    <RuleEditor rule={ruleEdit} onClose={() => setRuleEdit(null)} />
    <ContestEditor value={contestEdit} onClose={() => setContestEdit(null)} />
    <EntrantsDialog contestId={entrants} onClose={() => setEntrants(null)} />
  </section>;
}

function contestStatus(c: Contest): { key: string; label: string; tone: 'mint' | 'sky' | 'sun' | 'rose' | 'muted' } {
  const now = Date.now();
  if (c.winnerId) return { key: 'done', label: 'Winner picked', tone: 'sky' };
  if (!c.active) return { key: 'off', label: 'Inactive', tone: 'muted' };
  if (c.to < now) return { key: 'pick', label: 'Ended · pick a winner', tone: 'rose' };
  if (c.from > now) return { key: 'soon', label: 'Upcoming', tone: 'sun' };
  return { key: 'live', label: 'Running', tone: 'mint' };
}

function EntrantsDialog({ contestId, onClose }: { contestId: string | null; onClose: () => void }) {
  const { contests, lookups, actions } = useAdmin();
  const contest = contests.find(c => c.id === contestId);
  const ended = contest ? contest.to < Date.now() : false;
  return <Dialog open={Boolean(contest)} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>{contest?.name}</DialogTitle>
      <DialogDescription className="db-muted">{contest?.participants.length ?? 0} students entered for {contest?.prize}.{!ended && contest && !contest.winnerId ? ' The contest is still running; picking now closes it early.' : ''}</DialogDescription>
      {contest ? <>
        <ul className="db-row-list is-plain adm-entrants">
          {contest.participants.map(id => {
            const user = lookups.users.get(id);
            return <li key={id}>
              <UserCell user={user} meta={lookups.schools.get(user?.schoolId ?? '')?.short} />
              {contest.winnerId === id ? <Pill tone="sun"><Crown /> Winner</Pill> : !contest.winnerId ? <Button size="sm" variant="soft" onClick={() => actions.pickWinner(contest.id, id)}>Pick</Button> : null}
            </li>;
          })}
        </ul>
        {!contest.winnerId ? <div className="db-dialog-actions"><Button variant="ink" onClick={() => actions.pickWinner(contest.id)}><Dices /> Pick a random winner</Button></div> : null}
      </> : null}
    </DialogContent>
  </Dialog>;
}

const toInput = (at: number) => format(at, 'yyyy-MM-dd');
const fromInput = (value: string, end = false) => new Date(`${value}T${end ? '23:59:00' : '00:00:00'}`).getTime();

function ContestEditor({ value, onClose }: { value: Contest | 'new' | null; onClose: () => void }) {
  const { actions } = useAdmin();
  const blank = (): Contest => ({ id: uid('gc'), name: '', from: Date.now(), to: Date.now() + 21 * 86_400_000, entry: 100, prize: '', prizeValue: 250, active: true, participants: [] });
  const [draft, setDraft] = useState<Contest>(blank);
  const [error, setError] = useState('');
  useEffect(() => { if (value) { setDraft(value === 'new' ? blank() : value); setError(''); } }, [value]);
  const set = <K extends keyof Contest>(key: K, v: Contest[K]) => setDraft(d => ({ ...d, [key]: v }));
  return <Dialog open={value !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>{value === 'new' ? 'New grand contest' : 'Edit contest'}</DialogTitle>
      <DialogDescription className="db-muted">Students spend Vibeys to enter. Only one contest can run at a time.</DialogDescription>
      <form className="db-form" onSubmit={event => { event.preventDefault(); const problem = actions.saveContest(draft); if (problem) setError(problem); else onClose(); }}>
        <label className="db-field">Contest name<input value={draft.name} onChange={event => set('name', event.target.value)} placeholder="Winter Break Grand Prize" autoFocus /></label>
        <div className="db-field-row">
          <label className="db-field">Prize<input value={draft.prize} onChange={event => set('prize', event.target.value)} placeholder="Apple iPad Air" /></label>
          <label className="db-field">Prize value (USD)<input type="number" min={1} value={draft.prizeValue} onChange={event => set('prizeValue', Number(event.target.value))} /></label>
        </div>
        <div className="db-field-row">
          <label className="db-field">Starts<input type="date" value={toInput(draft.from)} onChange={event => event.target.value && set('from', fromInput(event.target.value))} /></label>
          <label className="db-field">Ends<input type="date" value={toInput(draft.to)} onChange={event => event.target.value && set('to', fromInput(event.target.value, true))} /></label>
        </div>
        <label className="db-field">Entry cost (Vibeys)<input type="number" min={1} value={draft.entry} onChange={event => set('entry', Number(event.target.value))} /></label>
        <label className="adm-switch"><Switch checked={draft.active} onCheckedChange={on => set('active', on)} /> Contest is active</label>
        {error ? <p className="gate-error" role="alert">{error}</p> : null}
        <div className="db-dialog-actions">
          <Button type="button" variant="soft" className="rounded-full" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="ink"><Save /> Save contest</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

function RewardEditor({ value, onClose }: { value: AdminReward | 'new' | null; onClose: () => void }) {
  const { actions } = useAdmin();
  const blank = (): AdminReward => ({ id: uid('rw'), name: '', detail: '', required: 300, active: true, cover: 'campus', createdAt: Date.now() });
  const [draft, setDraft] = useState<AdminReward>(blank);
  const picker = usePhotoPicker(([image]) => { if (image) setDraft(d => ({ ...d, cover: image })); });
  useEffect(() => { if (value) setDraft(value === 'new' ? blank() : value); }, [value]);
  return <Dialog open={value !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>{value === 'new' ? 'Add reward' : 'Edit reward'}</DialogTitle>
      <DialogDescription className="db-muted">Rewards show in every student’s Vibeys page while they’re live.</DialogDescription>
      <form className="db-form" onSubmit={event => { event.preventDefault(); if (actions.saveReward(draft)) onClose(); }}>
        <button type="button" className="db-cover-pick" onClick={picker.open} style={{ backgroundImage: `url(${coverSrc(draft.cover)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}><span><ImagePlus /> Upload image</span></button>
        {picker.element}
        <label className="db-field">Reward name<input value={draft.name} onChange={event => setDraft(d => ({ ...d, name: event.target.value }))} placeholder="Target $20 gift card" autoFocus /></label>
        <label className="db-field">Short description<input value={draft.detail} onChange={event => setDraft(d => ({ ...d, detail: event.target.value }))} placeholder="Dorm supplies and snacks" /></label>
        <label className="db-field">Required Vibeys<input type="number" min={1} value={draft.required} onChange={event => setDraft(d => ({ ...d, required: Number(event.target.value) }))} /></label>
        <div className="db-dialog-actions">
          <Button type="button" variant="soft" className="rounded-full" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="ink"><Gift /> Save reward</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

function RuleEditor({ rule, onClose }: { rule: EarnRule | null; onClose: () => void }) {
  const { actions } = useAdmin();
  const [draft, setDraft] = useState<EarnRule | null>(rule);
  useEffect(() => { setDraft(rule); }, [rule]);
  return <Dialog open={rule !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>Edit “{rule?.action}”</DialogTitle>
      <DialogDescription className="db-muted">Changes apply to the next time a student does this.</DialogDescription>
      {draft ? <form className="db-form" onSubmit={event => { event.preventDefault(); if (actions.saveRule(draft)) onClose(); }}>
        <label className="db-field">Description<input value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} /></label>
        <div className="db-field-row">
          <label className="db-field">Vibeys awarded<input type="number" min={1} step={1} value={draft.vibeys} onChange={event => setDraft({ ...draft, vibeys: Number(event.target.value) })} /></label>
          <label className="db-field">Max count<input type="number" min={0} step={1} value={draft.maxCount} onChange={event => setDraft({ ...draft, maxCount: Number(event.target.value) })} /><small className="db-count">0 means no limit. For streaks, the bonus day.</small></label>
        </div>
        <label className="adm-switch"><Switch checked={draft.active} onCheckedChange={on => setDraft({ ...draft, active: on })} /> Rule is active</label>
        <div className="db-dialog-actions">
          <Button type="button" variant="soft" className="rounded-full" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="ink"><Save /> Save rule</Button>
        </div>
      </form> : null}
    </DialogContent>
  </Dialog>;
}

type LibraryTab = LibraryKind;
const libraryHead: Record<LibraryTab, [string, string]> = {
  categories: ['Categories', 'Campaign categories students choose when they publish a fundraiser.'],
  majors: ['Majors', 'Majors offered on registration and stored on each student profile.'],
  quotes: ['Quotes', 'One active quote is chosen at random for students.'],
  ecards: ['eCards', 'Cards a donor can send with a gift. Prices are set in System Configuration.'],
};

export function LibraryView({ pane }: { pane?: LibraryTab | undefined }) {
  const { categories, majors, quotes, ecards, campaigns, users, config, actions } = useAdmin();
  const [tab, setTab] = useState<LibraryTab>(pane ?? 'categories');
  const [newName, setNewName] = useState('');
  useEffect(() => { if (pane) { setTab(pane); setNewName(''); } }, [pane]);
  const [rename, setRename] = useState<{ kind: 'categories' | 'majors'; item: LibraryItem } | null>(null);
  const [quoteEdit, setQuoteEdit] = useState<Quote | 'new' | null>(null);
  const [ecardEdit, setEcardEdit] = useState<ECard | 'new' | null>(null);
  const [tier, setTier] = useState<'all' | ECard['tier']>('all');

  function addNamed(kind: 'categories' | 'majors') {
    const name = newName.trim();
    if (!name) return;
    const list = kind === 'categories' ? categories : majors;
    if (list.some(item => item.name.toLowerCase() === name.toLowerCase())) return;
    actions.saveLibrary(kind, { id: uid(kind === 'categories' ? 'cat' : 'maj'), name, createdAt: Date.now(), active: true });
    setNewName('');
  }

  const named = (kind: 'categories' | 'majors') => {
    const list = kind === 'categories' ? categories : majors;
    return <article className="db-panel adm-table-panel">
      <form className="db-inline-add adm-word-add" onSubmit={event => { event.preventDefault(); addNamed(kind); }}>
        <input value={newName} onChange={event => setNewName(event.target.value)} placeholder={kind === 'categories' ? 'New category name' : 'New major name'} aria-label="Name" />
        <Button type="submit" variant="ink"><Plus /> Add</Button>
      </form>
      {kind === 'categories' ? <p className="adm-note">You can delete only categories that have no active campaigns.</p> : null}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Name</th><th className="adm-num">{kind === 'categories' ? 'Active campaigns' : 'Students'}</th><th>Created</th><th>Active</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {list.map(item => <tr key={item.id} className={cn(!item.active && 'is-muted')}>
              <td data-label="Name"><strong>{item.name}</strong></td>
              <td data-label={kind === 'categories' ? 'Active campaigns' : 'Students'} className="adm-num">{kind === 'categories' ? campaigns.filter(c => c.category === item.name && c.status === 'active').length : users.filter(u => u.major === item.name).length}</td>
              <td data-label="Created">{day(item.createdAt)}</td>
              <td data-label="Active"><Switch checked={item.active} onCheckedChange={() => actions.toggleLibrary(kind, item.id)} aria-label={`${item.name} active`} /></td>
              <td className="adm-col-actions"><span className="adm-row-actions">
                <button type="button" className="db-icon-btn" aria-label={`Rename ${item.name}`} onClick={() => setRename({ kind, item })}><PencilLine /></button>
                <button type="button" className="db-icon-btn" aria-label={`Delete ${item.name}`} onClick={() => actions.deleteLibrary(kind, item.id)}><Trash2 /></button>
              </span></td>
            </tr>)}
            {list.length === 0 ? <Empty>Nothing here yet.</Empty> : null}
          </tbody>
        </table>
      </div>
    </article>;
  };

  const head = pane ? libraryHead[pane] : ['Content library', 'Lists and content students see across the app.'] as const;
  return <section className="db-view">
    <PageHead title={head[0]} subtitle={head[1]} />
    {pane ? null : <AdminTabs label="Library" value={tab} onChange={value => { setTab(value); setNewName(''); }} items={[
      { value: 'categories', label: `Categories ${categories.length}` }, { value: 'majors', label: `Majors ${majors.length}` },
      { value: 'quotes', label: `Quotes ${quotes.length}` }, { value: 'ecards', label: `eCards ${ecards.length}` },
    ]} />}
    {tab === 'categories' ? named('categories') : null}
    {tab === 'majors' ? named('majors') : null}
    {tab === 'quotes' ? <>
      <div className="adm-toolbar"><Button variant="ink" className="ml-auto" onClick={() => setQuoteEdit('new')}><Plus /> Add quote</Button></div>
      <div className="adm-cards is-grid">
        {quotes.map(q => <article key={q.id} className={cn('db-panel adm-quote', !q.active && 'is-off')}>
          <blockquote>“{q.text}”</blockquote>
          <cite>— {q.author}</cite>
          <div className="adm-school-foot">
            <label className="adm-switch"><Switch checked={q.active} onCheckedChange={() => actions.toggleLibrary('quotes', q.id)} aria-label="Quote active" /> {q.active ? 'Showing' : 'Hidden'}</label>
            <span className="adm-row-actions">
              <button type="button" className="db-icon-btn" aria-label="Edit quote" onClick={() => setQuoteEdit(q)}><PencilLine /></button>
              <button type="button" className="db-icon-btn" aria-label="Delete quote" onClick={() => actions.deleteLibrary('quotes', q.id)}><Trash2 /></button>
            </span>
          </div>
        </article>)}
      </div>
    </> : null}
    {tab === 'ecards' ? <>
      <div className="adm-toolbar">
        <div className="db-filter-row adm-chips">
          {(['all', 'Basic', 'Premium'] as const).map(t => <button key={t} type="button" className="db-chip" aria-pressed={tier === t} onClick={() => setTier(t)}>{t === 'all' ? 'All cards' : `${t} · ${dollars(t === 'Basic' ? config.basicEcard : config.premiumEcard, true)}`}</button>)}
        </div>
        <Button variant="ink" className="ml-auto" onClick={() => setEcardEdit('new')}><Plus /> Add eCard</Button>
      </div>
      <div className="db-card-grid">
        {ecards.filter(e => tier === 'all' || e.tier === tier).map(e => <article key={e.id} className={cn('db-panel adm-reward', !e.active && 'is-off')}>
          <img src={coverSrc(e.cover)} alt="" />
          <div>
            <Pill tone={e.tier === 'Premium' ? 'sun' : 'sky'}>{e.tier}</Pill>
            <h3>{e.name}</h3>
            <small>{e.sent.toLocaleString('en-US')} sent · {dollars(e.tier === 'Basic' ? config.basicEcard : config.premiumEcard, true)}</small>
            <div className="adm-school-foot">
              <label className="adm-switch"><Switch checked={e.active} onCheckedChange={() => actions.toggleLibrary('ecards', e.id)} aria-label={`${e.name} active`} /> {e.active ? 'Live' : 'Hidden'}</label>
              <span className="adm-row-actions">
                <button type="button" className="db-icon-btn" aria-label={`Edit ${e.name}`} onClick={() => setEcardEdit(e)}><PencilLine /></button>
                <button type="button" className="db-icon-btn" aria-label={`Delete ${e.name}`} onClick={() => actions.deleteLibrary('ecards', e.id)}><Trash2 /></button>
              </span>
            </div>
          </div>
        </article>)}
      </div>
    </> : null}

    <RenameDialog value={rename} onClose={() => setRename(null)} />
    <QuoteEditor value={quoteEdit} onClose={() => setQuoteEdit(null)} />
    <EcardEditor value={ecardEdit} onClose={() => setEcardEdit(null)} />
  </section>;
}

function RenameDialog({ value, onClose }: { value: { kind: 'categories' | 'majors'; item: LibraryItem } | null; onClose: () => void }) {
  const { actions } = useAdmin();
  const [name, setName] = useState('');
  useEffect(() => { if (value) setName(value.item.name); }, [value]);
  return <Dialog open={value !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>Rename</DialogTitle>
      <DialogDescription className="db-muted">Existing campaigns and profiles keep their current label.</DialogDescription>
      <form className="db-form" onSubmit={event => { event.preventDefault(); if (value && name.trim()) { actions.saveLibrary(value.kind, { ...value.item, name: name.trim() }); onClose(); } }}>
        <label className="db-field">Name<input value={name} onChange={event => setName(event.target.value)} autoFocus /></label>
        <div className="db-dialog-actions"><Button type="button" variant="soft" className="rounded-full" onClick={onClose}>Cancel</Button><Button type="submit" variant="ink">Save</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}

function QuoteEditor({ value, onClose }: { value: Quote | 'new' | null; onClose: () => void }) {
  const { actions } = useAdmin();
  const [draft, setDraft] = useState<Quote>({ id: '', text: '', author: '', createdAt: 0, active: true });
  useEffect(() => { if (value) setDraft(value === 'new' ? { id: uid('q'), text: '', author: '', createdAt: Date.now(), active: true } : value); }, [value]);
  return <Dialog open={value !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>{value === 'new' ? 'Add quote' : 'Edit quote'}</DialogTitle>
      <DialogDescription className="db-muted">Quotes rotate on the student home screen.</DialogDescription>
      <form className="db-form" onSubmit={event => { event.preventDefault(); if (draft.text.trim()) { actions.saveLibrary('quotes', { ...draft, text: draft.text.trim(), author: draft.author.trim() || 'Unknown' }); onClose(); } }}>
        <label className="db-field">Quote text<textarea rows={3} value={draft.text} onChange={event => setDraft(d => ({ ...d, text: event.target.value }))} autoFocus /></label>
        <label className="db-field">Author<input value={draft.author} onChange={event => setDraft(d => ({ ...d, author: event.target.value }))} placeholder="Maya Angelou" /></label>
        <div className="db-dialog-actions"><Button type="button" variant="soft" className="rounded-full" onClick={onClose}>Cancel</Button><Button type="submit" variant="ink">Save</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}

function EcardEditor({ value, onClose }: { value: ECard | 'new' | null; onClose: () => void }) {
  const { actions } = useAdmin();
  const [draft, setDraft] = useState<ECard>({ id: '', name: '', tier: 'Basic', cover: 'campus', sent: 0, active: true, createdAt: 0 });
  const picker = usePhotoPicker(([image]) => { if (image) setDraft(d => ({ ...d, cover: image })); });
  useEffect(() => { if (value) setDraft(value === 'new' ? { id: uid('ec'), name: '', tier: 'Basic', cover: 'campus', sent: 0, active: true, createdAt: Date.now() } : value); }, [value]);
  return <Dialog open={value !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>{value === 'new' ? 'Add eCard' : 'Edit eCard'}</DialogTitle>
      <DialogDescription className="db-muted">Donors pick a card to send with their gift.</DialogDescription>
      <form className="db-form" onSubmit={event => { event.preventDefault(); if (draft.name.trim()) { actions.saveLibrary('ecards', { ...draft, name: draft.name.trim() }); onClose(); } }}>
        <button type="button" className="db-cover-pick" onClick={picker.open} style={{ backgroundImage: `url(${coverSrc(draft.cover)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}><span><ImagePlus /> Upload card art</span></button>
        {picker.element}
        <div className="adm-cover-row" role="radiogroup" aria-label="Or choose art">
          {coverKeys.map(key => <button key={key} type="button" role="radio" aria-checked={draft.cover === key} onClick={() => setDraft(d => ({ ...d, cover: key }))}><img src={coverSrc(key)} alt={key} /></button>)}
        </div>
        <div className="db-field-row">
          <label className="db-field">Card name<input value={draft.name} onChange={event => setDraft(d => ({ ...d, name: event.target.value }))} placeholder="You did it!" autoFocus /></label>
          <label className="db-field">Tier<Dropdown<ECard['tier']> value={draft.tier} onChange={tier => setDraft(d => ({ ...d, tier }))} options={['Basic', 'Premium']} /></label>
        </div>
        <div className="db-dialog-actions"><Button type="button" variant="soft" className="rounded-full" onClick={onClose}>Cancel</Button><Button type="submit" variant="ink">Save</Button></div>
      </form>
    </DialogContent>
  </Dialog>;
}

const settingsTabs = ['system', 'emails', 'notifications', 'appearance', 'activity', 'account'] as const;
type SettingsTab = typeof settingsTabs[number];
const isSettingsTab = (value?: string): value is SettingsTab => settingsTabs.includes(value as SettingsTab);

const adminPrefDefaults = { withdrawals: true, reports: true, redemptions: true, schools: false, digest: 'daily' as 'daily' | 'weekly' | 'off' };
const digestOptions: DropdownOption<typeof adminPrefDefaults.digest>[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'off', label: 'Off' },
];

const auditKinds = [
  { value: 'money', label: 'Money' },
  { value: 'campaigns', label: 'Campaigns' },
  { value: 'people', label: 'People & schools' },
  { value: 'trust', label: 'Trust & safety' },
  { value: 'platform', label: 'Platform' },
];
const auditKind = (text: string) => {
  const t = text.toLowerCase();
  if (/withdrawal|payment|refund|payout/.test(t)) return 'money';
  if (/campaign/.test(t)) return 'campaigns';
  if (/report|vibe-check|flag|forum|post|comment|wellbeing|removed “/.test(t)) return 'trust';
  if (/account|suspend|restor|activat|school|user|student/.test(t)) return 'people';
  return 'platform';
};

export function SettingsView({ tab: initialTab, pane }: { tab?: string | undefined; pane?: 'system' | 'emails' | undefined }) {
  const { config, templates, audit, actions } = useAdmin();
  const navigate = useNavigate();
  const locked: SettingsTab | null = pane === 'emails' ? 'emails' : pane === 'system' ? 'system' : null;
  const [tab, setTab] = useState<SettingsTab>(locked ?? (isSettingsTab(initialTab) ? initialTab : 'system'));
  useEffect(() => { if (locked) setTab(locked); else if (isSettingsTab(initialTab)) setTab(initialTab); }, [locked, initialTab]);
  const { prefs, set, savedAt } = useStoredPrefs('byeuni-admin-settings-v1', adminPrefDefaults);
  const auditItems = useMemo(() => audit.map(entry => ({ ...entry, kind: auditKind(entry.text) })), [audit]);
  const [draft, setDraft] = useState<SystemConfig>(config);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const picker = usePhotoPicker(([image]) => { if (image) setDraft(d => ({ ...d, logo: image })); });
  useEffect(() => { setDraft(config); }, [config]);
  const num = (key: keyof SystemConfig) => (event: ChangeEvent<HTMLInputElement>) => setDraft(d => ({ ...d, [key]: Number(event.target.value) }));
  const sample = 50;
  const fee = useMemo(() => Math.round((sample * (draft.transactionalPct + draft.merchantPct) / 100 + draft.merchantFee) * 100) / 100, [draft]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(config);

  const settingsHead = locked === 'emails'
    ? ['Email Templates', 'Welcome, withdrawal, and reward emails ByeUni sends.'] as const
    : locked === 'system'
      ? ['System Configuration', 'Project name, admin contact, fees, and eCard prices.'] as const
      : ['Settings', 'Platform fees, system emails, your alerts, and everything you changed in the console.'] as const;

  return <section className="db-view">
    <PageHead title={settingsHead[0]} subtitle={settingsHead[1]}>
      {tab === 'notifications' ? <SavedHint at={savedAt} /> : null}
    </PageHead>
    {locked ? null : <AdminTabs label="Settings" value={tab} onChange={setTab} items={[
      { value: 'system', label: 'System configuration' }, { value: 'emails', label: 'Email templates' }, { value: 'notifications', label: 'Notifications' },
      { value: 'appearance', label: 'Appearance' }, { value: 'activity', label: 'My activity' }, { value: 'account', label: 'My account' },
    ]} />}

    {tab === 'system' ? <div className="adm-grid-2 is-wide-first">
      <form className="db-panel db-form adm-config" onSubmit={event => { event.preventDefault(); actions.saveConfig(draft); }}>
        <h2 className="adm-form-title">Project</h2>
        <div className="adm-logo-row">
          <button type="button" className="adm-logo-pick" onClick={picker.open}>{draft.logo ? <img src={draft.logo} alt="" /> : <ImagePlus />}</button>
          {picker.element}
          <label className="db-field">Project name<input value={draft.projectName} onChange={event => setDraft(d => ({ ...d, projectName: event.target.value }))} /></label>
        </div>
        <div className="db-field-row">
          <label className="db-field">Admin contact email<input type="email" value={draft.adminEmail} onChange={event => setDraft(d => ({ ...d, adminEmail: event.target.value }))} /></label>
          <label className="db-field">Admin phone<input value={draft.adminPhone} onChange={event => setDraft(d => ({ ...d, adminPhone: event.target.value }))} /></label>
        </div>
        <h2 className="adm-form-title">Fees</h2>
        <div className="adm-field-3">
          <label className="db-field">Transactional %<input type="number" step="0.1" min={0} value={draft.transactionalPct} onChange={num('transactionalPct')} /></label>
          <label className="db-field">Merchant %<input type="number" step="0.1" min={0} value={draft.merchantPct} onChange={num('merchantPct')} /></label>
          <label className="db-field">Merchant fee ($)<input type="number" step="0.01" min={0} value={draft.merchantFee} onChange={num('merchantFee')} /></label>
        </div>
        <h2 className="adm-form-title">eCards and campaigns</h2>
        <div className="adm-field-3">
          <label className="db-field">Basic eCard ($)<input type="number" step="0.01" min={0} value={draft.basicEcard} onChange={num('basicEcard')} /></label>
          <label className="db-field">Premium eCard ($)<input type="number" step="0.01" min={0} value={draft.premiumEcard} onChange={num('premiumEcard')} /></label>
          <label className="db-field">Max journey photos<input type="number" min={1} max={30} value={draft.maxJourneyMedia} onChange={num('maxJourneyMedia')} /></label>
        </div>
        <p className="adm-note">If you change eCard prices, update the matching in-app purchase prices in App Store Connect too.</p>
        <div className="db-dialog-actions">
          <Button type="button" variant="soft" className="rounded-full" disabled={!dirty} onClick={() => setDraft(config)}>Discard</Button>
          <Button type="submit" variant="ink" disabled={!dirty}><Save /> Save changes</Button>
        </div>
      </form>
      <aside className="db-panel adm-fee-preview">
        <h2 className="adm-form-title">Fee preview</h2>
        <p className="db-muted">On a {dollars(sample)} gift with fees not covered by the donor:</p>
        <dl className="adm-defs">
          <div><dt>Donor gives</dt><dd>{dollars(sample, true)}</dd></div>
          <div><dt>Fees deducted</dt><dd>−{dollars(fee, true)}</dd></div>
          <div className="is-total"><dt>Student receives</dt><dd>{dollars(sample - fee, true)}</dd></div>
        </dl>
        <p className="db-muted">{((fee / sample) * 100).toFixed(1)}% effective rate</p>
      </aside>
    </div> : null}

    {tab === 'emails' ? <article className="db-panel adm-table-panel">
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Template</th><th>Sent to</th><th>Subject</th><th>Last edited</th><th><span className="sr-only">Edit</span></th></tr></thead>
          <tbody>
            {templates.map(t => <tr key={t.id}>
              <td data-label="Template"><strong className="adm-forum-title"><Mail /> {t.name}</strong></td>
              <td data-label="Sent to"><Pill tone="sky">{t.audience}</Pill></td>
              <td data-label="Subject"><span className="adm-clip">{t.subject}</span></td>
              <td data-label="Last edited">{day(t.updatedAt)}</td>
              <td className="adm-col-actions"><Button size="sm" variant="soft" onClick={() => setTemplate(t)}><PencilLine /> Edit</Button></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </article> : null}

    {tab === 'notifications' ? <div className="st-groups st-narrow">
      <SettingsGroup title="Needs your decision" note="Alerts for queues that wait on an admin.">
        <SwitchRow icon={Banknote} title="Withdrawal requests" note="When a student asks to cash out campaign funds" checked={prefs.withdrawals} onChange={v => set('withdrawals', v)} />
        <SwitchRow icon={Flag} title="Reports and vibe-check flags" note="Reported posts, comments, and forums" checked={prefs.reports} onChange={v => set('reports', v)} />
        <SwitchRow icon={HeartPulse} title="Wellbeing alerts" note="Always on, so a student at risk is never missed" checked onChange={() => undefined} disabled />
        <SwitchRow icon={Gift} title="Reward redemptions" note="When a student redeems Vibeys for a reward" checked={prefs.redemptions} onChange={v => set('redemptions', v)} />
      </SettingsGroup>
      <SettingsGroup title="Platform">
        <SwitchRow icon={School} title="New schools and school admins" checked={prefs.schools} onChange={v => set('schools', v)} />
        <ChoiceRow icon={Mail} title="Summary email" note={`Sent to ${config.adminEmail}`} value={prefs.digest} onChange={v => set('digest', v)} options={digestOptions} />
      </SettingsGroup>
    </div> : null}

    {tab === 'appearance' ? <article className="db-panel db-settings">
      <h2>Appearance</h2>
      <AppearancePanel />
    </article> : null}

    {tab === 'activity' ? <ActivityLog items={auditItems} kinds={auditKinds} filename="admin-activity.csv" empty="Changes you make in the console show up here." /> : null}

    {tab === 'account' ? <article className="db-panel db-settings">
      <div className="adm-profile-top">
        <Face name={adminProfile.name} photo={adminProfile.photo} size={72} />
        <div><h2 className="adm-form-title">{adminProfile.name}</h2><p className="db-muted">{adminProfile.title} · {adminProfile.email}</p><Pill tone="mint">Full access</Pill></div>
      </div>
      <h2>Demo</h2>
      <p className="db-muted">Admin changes are saved in this browser only. Manage the live platform on <a className="db-link" href="https://byeuni.com/admin/index.php">byeuni.com/admin</a>.</p>
      <div className="db-dialog-actions is-start">
        <Button variant="soft" className="rounded-full" onClick={() => setResetOpen(true)}><RotateCcw /> Reset admin demo data</Button>
        <Button variant="destructive" className="rounded-full" onClick={() => { signOutDemo(); navigate({ to: '/login' }); }}><LogOut /> Sign out</Button>
      </div>
    </article> : null}

    <TemplateEditor template={template} onClose={() => setTemplate(null)} />
    <Confirm open={resetOpen} onOpenChange={setResetOpen} title="Reset admin demo data?" body="Every change you made in the admin console is replaced with the original sample data." confirmLabel="Reset" onConfirm={() => actions.resetAll()} />
  </section>;
}

const sampleVars: Record<string, string> = {
  first_name: 'Ethan', campaign_title: 'Fund my trip to HackMIT 2026', amount: '$485.20', requester_name: 'Ethan Carter',
  decline_reason: 'Account holder name does not match the fundraiser.', reward_name: 'Starbucks $10 gift card', coupon_code: 'SBX-7H2K-91QZ',
};
const fill = (text: string) => text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => sampleVars[key] ?? `{{${key}}}`);

function TemplateEditor({ template, onClose }: { template: EmailTemplate | null; onClose: () => void }) {
  const { actions } = useAdmin();
  const [draft, setDraft] = useState<EmailTemplate | null>(template);
  useEffect(() => { setDraft(template); }, [template]);
  return <Dialog open={template !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog adm-dialog-wide">
      <DialogTitle>{template?.name} · {template?.audience}</DialogTitle>
      <DialogDescription className="db-muted">Use {'{{first_name}}'}, {'{{campaign_title}}'}, {'{{amount}}'} and similar placeholders.</DialogDescription>
      {draft ? <form className="adm-template" onSubmit={event => { event.preventDefault(); actions.saveTemplate(draft); onClose(); }}>
        <div className="db-form">
          <label className="db-field">Subject<input value={draft.subject} onChange={event => setDraft({ ...draft, subject: event.target.value })} /></label>
          <label className="db-field">Body<textarea rows={9} value={draft.body} onChange={event => setDraft({ ...draft, body: event.target.value })} /></label>
        </div>
        <div className="adm-email-preview" aria-label="Preview">
          <small>Preview</small>
          <strong>{fill(draft.subject)}</strong>
          <p>{fill(draft.body)}</p>
        </div>
        <div className="db-dialog-actions">
          <Button type="button" variant="soft" className="rounded-full" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="ink"><Save /> Save template</Button>
        </div>
      </form> : null}
    </DialogContent>
  </Dialog>;
}
