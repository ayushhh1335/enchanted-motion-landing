import { useState, type FormEvent, type ReactNode } from 'react';
import { Ban, CheckCircle2, Flag as FlagIcon, HeartHandshake, HeartPulse, Lock, MessageSquare, Plus, RotateCcw, ShieldCheck, Trash2, UserRound, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { agoText } from '@/components/dashboard/shared';
import type { Flag, Report, ReportKind, WordCategory } from '@/content/admin-data';
import { cn } from '@/lib/utils';
import { useAdmin } from './store';
import { AdminTabs, Empty, PageHead, Pill, UserCell, day } from './ui';

const kindMeta: Record<ReportKind, { label: string; icon: typeof Users; remove: string }> = {
  forum: { label: 'Forum', icon: Users, remove: 'Remove forum' },
  comment: { label: 'Comment', icon: MessageSquare, remove: 'Delete comment' },
  user: { label: 'User', icon: UserRound, remove: 'Suspend user' },
  campaign: { label: 'Campaign', icon: FlagIcon, remove: 'Unpublish campaign' },
};

type ModerationTab = 'open' | 'forums' | 'closed';

export function ModerationView() {
  const { reports, forums, lookups, actions } = useAdmin();
  const [tab, setTab] = useState<ModerationTab>('open');
  const open = reports.filter(r => r.status === 'open').sort((a, b) => b.at - a.at);
  const closed = reports.filter(r => r.status !== 'open').sort((a, b) => b.at - a.at);
  const repeat = (authorId: string) => reports.filter(r => r.authorId === authorId).length;

  return <section className="db-view">
    <PageHead title="Reports" subtitle="Forums, comments, campaigns, and people reported by the community." />
    <AdminTabs label="Reports" value={tab} onChange={setTab} items={[
      { value: 'open', label: 'Needs review', count: open.length }, { value: 'forums', label: `Forums ${forums.length}` }, { value: 'closed', label: `Resolved ${closed.length}` },
    ]} />

    {tab === 'open' ? <div className="adm-cards">
      {open.map(report => <ReportCard key={report.id} report={report} repeatCount={repeat(report.authorId)}>
        <Button size="sm" variant="destructive" className="rounded-full" onClick={() => actions.resolveReport(report.id, 'remove')}>{kindMeta[report.kind].remove}</Button>
        {report.kind !== 'user' && !lookups.users.get(report.authorId)?.suspended ? <Button size="sm" variant="soft" onClick={() => actions.resolveReport(report.id, 'suspend')}><Ban /> Suspend author</Button> : null}
        <Button size="sm" variant="soft" onClick={() => actions.resolveReport(report.id, 'dismiss')}><X /> Dismiss</Button>
      </ReportCard>)}
      {open.length === 0 ? <div className="db-empty"><span><ShieldCheck /></span><strong>Nothing to review</strong><p>New reports from students show up here.</p></div> : null}
    </div> : null}

    {tab === 'closed' ? <div className="adm-cards">
      {closed.map(report => <ReportCard key={report.id} report={report} repeatCount={0}>
        <Pill tone={report.status === 'dismissed' ? 'muted' : 'mint'}><CheckCircle2 /> {report.resolution ?? (report.status === 'dismissed' ? 'Dismissed' : 'Resolved')}</Pill>
      </ReportCard>)}
      {closed.length === 0 ? <p className="db-muted">No resolved reports yet.</p> : null}
    </div> : null}

    {tab === 'forums' ? <article className="db-panel adm-table-panel">
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Forum</th><th>Created by</th><th className="adm-num">Members</th><th className="adm-num">Posts</th><th>Created</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {forums.map(f => {
              const flagged = reports.some(r => r.targetId === f.id && r.status === 'open');
              return <tr key={f.id}>
                <td data-label="Forum"><strong className="adm-forum-title">{f.isPrivate ? <Lock /> : null}{f.title}</strong></td>
                <td data-label="Created by"><UserCell user={lookups.users.get(f.ownerId)} /></td>
                <td data-label="Members" className="adm-num">{f.members.toLocaleString('en-US')}</td>
                <td data-label="Posts" className="adm-num">{f.posts}</td>
                <td data-label="Created">{day(f.createdAt)}</td>
                <td data-label="Status">{f.removed ? <Pill tone="rose">Removed</Pill> : flagged ? <Pill tone="sun">Reported</Pill> : <Pill tone="mint">Live</Pill>}</td>
                <td className="adm-col-actions">{f.removed
                  ? <Button size="sm" variant="soft" onClick={() => actions.setForumRemoved(f.id, false)}><RotateCcw /> Restore</Button>
                  : <Button size="sm" variant="soft" onClick={() => actions.setForumRemoved(f.id, true)}><Trash2 /> Remove</Button>}</td>
              </tr>;
            })}
            {forums.length === 0 ? <Empty>No forums yet.</Empty> : null}
          </tbody>
        </table>
      </div>
    </article> : null}
  </section>;
}

function ReportCard({ report, repeatCount, children }: { report: Report; repeatCount: number; children: ReactNode }) {
  const { lookups, forums } = useAdmin();
  const meta = kindMeta[report.kind];
  const target = report.kind === 'forum' ? forums.find(f => f.id === report.targetId)?.title : report.kind === 'campaign' ? lookups.campaigns.get(report.targetId)?.title : null;
  return <article className="db-panel adm-report">
    <header>
      <Pill tone="sky"><meta.icon /> {meta.label}</Pill>
      <span className="adm-reason-tag">{report.reason}</span>
      <small>{agoText(report.at)}</small>
    </header>
    {target ? <strong className="adm-report-target">{target}</strong> : null}
    <blockquote>{report.excerpt}</blockquote>
    <div className="adm-report-people">
      <UserCell user={lookups.users.get(report.authorId)} meta={repeatCount > 1 ? <span className="adm-warn">{repeatCount} reports on this person</span> : 'Author'} />
      <small>Reported by <b>{lookups.users.get(report.reporterId)?.name ?? 'a student'}</b></small>
    </div>
    <footer>{children}</footer>
  </article>;
}

function Highlight({ text, word }: { text: string; word: string }) {
  const at = text.toLowerCase().indexOf(word.toLowerCase());
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<mark>{text.slice(at, at + word.length)}</mark>{text.slice(at + word.length)}</>;
}

type SafetyTab = 'open' | 'words' | 'reviewed';

export function SafetyView() {
  const { flags, words, actions } = useAdmin();
  const [tab, setTab] = useState<SafetyTab>('open');
  const open = flags.filter(f => f.status === 'open').sort((a, b) => Number(b.category === 'suicidal') - Number(a.category === 'suicidal') || b.at - a.at);
  const reviewed = flags.filter(f => f.status !== 'open').sort((a, b) => b.at - a.at);
  const urgent = open.filter(f => f.category === 'suicidal').length;

  return <section className="db-view">
    <PageHead title="Vibe-check" subtitle="Posts, comments, forums, and chats that matched a watch word." />
    {urgent ? <p className="adm-callout is-rose"><HeartPulse /> {urgent} wellbeing flag{urgent > 1 ? 's need' : ' needs'} a human check-in. Send support resources (988 Suicide &amp; Crisis Lifeline) before anything else.</p> : null}
    <AdminTabs label="Vibe-check" value={tab} onChange={setTab} items={[
      { value: 'open', label: 'Flagged', count: open.length }, { value: 'words', label: `Watch words ${words.length}` }, { value: 'reviewed', label: `Reviewed ${reviewed.length}` },
    ]} />

    {tab === 'open' || tab === 'reviewed' ? <div className="adm-cards">
      {(tab === 'open' ? open : reviewed).map(flag => <FlagCard key={flag.id} flag={flag}>
        {flag.status === 'open' ? (flag.category === 'suicidal' ? <>
          <Button size="sm" variant="ink" onClick={() => actions.resolveFlag(flag.id, 'supported')}><HeartHandshake /> Send support resources</Button>
          <Button size="sm" variant="soft" onClick={() => actions.resolveFlag(flag.id, 'dismissed')}><X /> Not a concern</Button>
        </> : <>
          <Button size="sm" variant="destructive" className="rounded-full" onClick={() => actions.resolveFlag(flag.id, 'removed')}><Trash2 /> Remove {flag.where.toLowerCase()}</Button>
          <Button size="sm" variant="soft" onClick={() => actions.resolveFlag(flag.id, 'dismissed')}><X /> Dismiss</Button>
        </>) : <>
          <Pill tone={flag.status === 'removed' ? 'rose' : flag.status === 'supported' ? 'mint' : 'muted'}>{flag.status === 'supported' ? 'Support sent' : flag.status === 'removed' ? 'Removed' : 'Dismissed'}</Pill>
          <button type="button" className="db-link-muted" onClick={() => actions.resolveFlag(flag.id, 'open')}>Reopen</button>
        </>}
      </FlagCard>)}
      {tab === 'open' && open.length === 0 ? <div className="db-empty"><span><ShieldCheck /></span><strong>All clear</strong><p>Nothing matched the watch list since your last review.</p></div> : null}
      {tab === 'reviewed' && reviewed.length === 0 ? <p className="db-muted">Nothing reviewed yet.</p> : null}
    </div> : null}

    {tab === 'words' ? <div className="adm-grid-2">
      <WordList category="suicidal" title="Wellbeing phrases" note="Matches are routed to a human check-in, never auto-removed." />
      <WordList category="bad" title="Bad words" note="Matches are flagged for review and can be removed." />
    </div> : null}
  </section>;
}

function FlagCard({ flag, children }: { flag: Flag; children: ReactNode }) {
  const { lookups } = useAdmin();
  return <article className={cn('db-panel adm-report', flag.category === 'suicidal' && flag.status === 'open' && 'is-urgent')}>
    <header>
      {flag.category === 'suicidal' ? <Pill tone="rose"><HeartPulse /> Wellbeing</Pill> : <Pill tone="sun">Language</Pill>}
      <span className="adm-reason-tag">{flag.where}</span>
      <small>{agoText(flag.at)}</small>
    </header>
    <blockquote><Highlight text={flag.text} word={flag.word} /></blockquote>
    <div className="adm-report-people"><UserCell user={lookups.users.get(flag.userId)} meta={`Matched “${flag.word}”`} /></div>
    <footer>{children}</footer>
  </article>;
}

function WordList({ category, title, note }: { category: WordCategory; title: string; note: string }) {
  const { words, actions } = useAdmin();
  const [value, setValue] = useState('');
  const list = words.filter(w => w.category === category).sort((a, b) => b.hits - a.hits);
  function add(event: FormEvent) {
    event.preventDefault();
    if (actions.addWord(value, category)) setValue('');
  }
  return <article className="db-panel">
    <header className="db-panel-head"><h2>{category === 'suicidal' ? <HeartPulse /> : <FlagIcon />}{title}</h2><small className="db-muted">{list.length} words</small></header>
    <p className="db-muted">{note}</p>
    <form className="db-inline-add adm-word-add" onSubmit={add}>
      <input value={value} onChange={event => setValue(event.target.value)} placeholder="Add a word or phrase" aria-label={`Add to ${title}`} />
      <Button type="submit" variant="ink" size="icon" className="h-[42px] w-[42px] flex-none" aria-label="Add"><Plus /></Button>
    </form>
    <ul className="adm-words">
      {list.map(w => <li key={w.id}>
        <span>{w.word}</span><small>{w.hits} hit{w.hits === 1 ? '' : 's'}</small>
        <button type="button" aria-label={`Remove ${w.word}`} onClick={() => actions.deleteWord(w.id)}><X /></button>
      </li>)}
    </ul>
  </article>;
}
