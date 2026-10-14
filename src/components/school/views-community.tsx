import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import {
  Ban, Eye, Lock, MessageSquare, MessagesSquare, MoreHorizontal, PencilLine, Plus, RotateCcw, ShieldQuestion, Sparkles, Trash2,
  User, Wand2, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { agoText } from '@/components/dashboard/shared';
import type { SchoolReport, SchoolReportKind, SchoolUpdate } from '@/content/school-data';
import { cn } from '@/lib/utils';
import {
  AdminTabs, Check, Confirm, Empty, ExportButton, Face, PageHead, Pill, SearchBox, Toolbar, UserCell, day, downloadCsv, summarize, usePager,
  useSelection, userPhoto,
} from '@/components/admin/ui';
import { uid, useSchool, type ReportAction } from './store';
import { SchoolLink } from './ui';
import { DateChip } from './views-home';

/** A student's name and photo that opens their full profile. */
function StudentCell({ id, meta }: { id: string; meta?: ReactNode }) {
  const { lookups } = useSchool();
  const student = lookups.students.get(id);
  const cell = <UserCell user={student} meta={meta ?? student?.major} />;
  return student ? <SchoolLink section="student" focus={student.id} className="adm-plain">{cell}</SchoolLink> : cell;
}

type ForumTab = 'active' | 'removed';

export function ForumsView() {
  const { forums, lookups, actions } = useSchool();
  const [tab, setTab] = useState<ForumTab>('active');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const rows = useMemo(() => forums
    .filter(f => (tab === 'removed') === f.removed)
    .filter(f => !q || `${f.title} ${lookups.students.get(f.ownerId)?.name ?? ''}`.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt - a.createdAt), [forums, tab, q, lookups]);
  const pager = usePager(rows, 10);

  return <section className="db-view">
    <PageHead title="Forums" subtitle="Discussion groups started by your students." />
    <AdminTabs label="Forum status" value={tab} onChange={value => { setTab(value); pager.reset(); }} items={[
      { value: 'active', label: `Active ${forums.filter(f => !f.removed).length}` }, { value: 'removed', label: `Removed ${forums.filter(f => f.removed).length}` },
    ]} />
    <article className="db-panel adm-table-panel">
      <Toolbar><SearchBox value={query} onChange={value => { setQuery(value); pager.reset(); }} placeholder="Search forum or student" /></Toolbar>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Forum</th><th>Started by</th><th className="adm-num">Members</th><th className="adm-num">Posts</th><th>Created on</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {pager.rows.map(f => <tr key={f.id}>
              <td data-label="Forum"><button type="button" className="adm-plain adm-forum-title" onClick={() => setOpenId(f.id)}>{f.isPrivate ? <Lock aria-label="Private" /> : <MessagesSquare />}{f.title}</button></td>
              <td data-label="Started by"><StudentCell id={f.ownerId} /></td>
              <td data-label="Members" className="adm-num">{f.members.toLocaleString('en-US')}</td>
              <td data-label="Posts" className="adm-num">{f.posts}</td>
              <td data-label="Created on" className="adm-dates">{day(f.createdAt)}</td>
              <td className="adm-col-actions">
                <span className="adm-row-actions">
                  <Button size="sm" variant="soft" onClick={() => setOpenId(f.id)}><Eye /> View</Button>
                  {f.removed
                    ? <Button size="sm" variant="ink" onClick={() => actions.setForumRemoved(f.id, false)}><RotateCcw /> Restore</Button>
                    : <Button size="sm" variant="destructive" className="rounded-full" onClick={() => actions.setForumRemoved(f.id, true)}><Trash2 /> Remove</Button>}
                </span>
              </td>
            </tr>)}
            {rows.length === 0 ? <Empty>{tab === 'removed' ? 'No removed forums.' : 'No forums match your search.'}</Empty> : null}
          </tbody>
        </table>
      </div>
      {pager.pager}
    </article>
    <ForumSheet forumId={openId} onClose={() => setOpenId(null)} />
  </section>;
}

function ForumSheet({ forumId, onClose }: { forumId: string | null; onClose: () => void }) {
  const { forums, reports, lookups, actions } = useSchool();
  const forum = forums.find(f => f.id === forumId);
  const open = forum ? reports.filter(r => r.status === 'open' && (r.targetId === forum.id || forum.recent.some(p => p.id === r.targetId))).length : 0;
  return <Sheet open={Boolean(forum)} onOpenChange={value => { if (!value) onClose(); }}>
    <SheetContent side="right" className="db-sheet adm-detail">
      {forum ? <>
        <div className="adm-detail-head sch-sheet-head">
          <span className="adm-stat-icon"><MessagesSquare /></span>
          <SheetTitle>{forum.title}</SheetTitle>
          <SheetDescription>{forum.description}</SheetDescription>
          <span className="sch-pills">{forum.isPrivate ? <Pill tone="muted"><Lock /> Private</Pill> : <Pill tone="mint">Public</Pill>}{forum.removed ? <Pill tone="rose">Removed</Pill> : null}{open ? <Pill tone="sun">{open} open report{open > 1 ? 's' : ''}</Pill> : null}</span>
        </div>
        <dl className="db-mini-stats">
          <div><dt>Members</dt><dd>{forum.members.toLocaleString('en-US')}</dd></div>
          <div><dt>Posts</dt><dd>{forum.posts}</dd></div>
          <div><dt>Created</dt><dd>{format(forum.createdAt, 'MMM d')}</dd></div>
        </dl>
        <h3 className="adm-detail-title">Started by</h3>
        <StudentCell id={forum.ownerId} meta={lookups.students.get(forum.ownerId)?.email} />
        <h3 className="adm-detail-title">Recent posts</h3>
        {forum.recent.length ? <ul className="db-row-list is-plain">{forum.recent.map(p => {
          const author = lookups.students.get(p.authorId);
          return <li key={p.id}><Face name={author?.name ?? '?'} photo={userPhoto(author)} size={36} /><div><strong>{author ? <SchoolLink section="student" focus={author.id} className="adm-plain">{author.name}</SchoolLink> : 'Former student'}</strong><small className="sch-post">{p.text}</small><small>{agoText(p.at)}</small></div></li>;
        })}</ul> : <p className="db-muted">{forum.isPrivate ? 'Posts in private forums are visible to members only.' : 'No posts yet.'}</p>}
        <div className="db-dialog-actions is-start">
          {forum.removed
            ? <Button variant="ink" onClick={() => actions.setForumRemoved(forum.id, false)}><RotateCcw /> Restore forum</Button>
            : <Button variant="destructive" className="rounded-full" onClick={() => actions.setForumRemoved(forum.id, true)}><Trash2 /> Remove forum</Button>}
        </div>
      </> : null}
    </SheetContent>
  </Sheet>;
}

type ReportTab = SchoolReportKind | 'resolved';
const kindIcon = { forum: MessagesSquare, comment: MessageSquare, user: User } as const;

export function ReportsView() {
  const { reports } = useSchool();
  const openOf = (kind: SchoolReportKind) => reports.filter(r => r.status === 'open' && r.kind === kind);
  const firstOpen = (['forum', 'comment', 'user'] as const).find(k => openOf(k).length) ?? 'forum';
  const [tab, setTab] = useState<ReportTab>(firstOpen);
  const rows = tab === 'resolved' ? reports.filter(r => r.status !== 'open') : openOf(tab);

  return <section className="db-view">
    <PageHead title="Reported forums, comments & users" subtitle="Forums, comments, and students your community flagged." />
    <AdminTabs label="Report type" value={tab} onChange={setTab} items={[
      { value: 'forum', label: 'Forums', count: openOf('forum').length }, { value: 'comment', label: 'Comments', count: openOf('comment').length },
      { value: 'user', label: 'Students', count: openOf('user').length }, { value: 'resolved', label: `Resolved ${reports.filter(r => r.status !== 'open').length}` },
    ]} />
    <div className="adm-cards">
      {[...rows].sort((a, b) => b.at - a.at).map(r => <ReportCard key={r.id} report={r} />)}
      {rows.length === 0 ? <article className="db-panel"><p className="db-muted">{tab === 'resolved' ? 'Nothing resolved yet.' : 'No open reports here. Nice.'}</p></article> : null}
    </div>
  </section>;
}

function ReportCard({ report }: { report: SchoolReport }) {
  const { reports, forums, lookups, actions } = useSchool();
  const author = lookups.students.get(report.authorId);
  const reporter = lookups.students.get(report.reporterId);
  const Icon = kindIcon[report.kind];
  const repeat = reports.filter(r => r.authorId === report.authorId).length;
  const forumOfComment = report.kind === 'comment' ? forums.find(f => f.recent.some(p => p.id === report.targetId)) : undefined;
  const target = report.kind === 'forum' ? lookups.forums.get(report.targetId)?.title : report.kind === 'comment' ? `Comment${forumOfComment ? ` in ${forumOfComment.title}` : ''}` : author?.name;
  const isOpen = report.status === 'open';
  const act = (action: ReportAction) => actions.resolveReport(report.id, action);

  return <article className="db-panel adm-report">
    <header>
      <Pill tone="sky"><Icon /> {report.kind === 'user' ? 'Student' : report.kind === 'forum' ? 'Forum' : 'Comment'}</Pill>
      <span className="adm-reason-tag">{report.reason}</span>
      <small>{agoText(report.at)}</small>
    </header>
    {target ? <p className="adm-report-target">{target}</p> : null}
    <blockquote>{report.excerpt}</blockquote>
    <div className="adm-report-people">
      <StudentCell id={report.authorId} meta={repeat > 1 ? <span className="adm-warn">{repeat} reports on this student</span> : author?.major} />
      <small>Reported by {reporter ? <SchoolLink section="student" focus={reporter.id} className="adm-plain"><strong>{reporter.name}</strong></SchoolLink> : <strong>a student</strong>}</small>
    </div>
    <footer>
      {isOpen ? <>
        {report.kind === 'user'
          ? <Button size="sm" variant="destructive" className="rounded-full" onClick={() => act('suspend')}><Ban /> Suspend student</Button>
          : <>
            <Button size="sm" variant="destructive" className="rounded-full" onClick={() => act('remove')}><Trash2 /> {report.kind === 'forum' ? 'Remove forum' : 'Delete comment'}</Button>
            <Button size="sm" variant="soft" onClick={() => act('suspend')}><Ban /> Suspend author</Button>
          </>}
        <Button size="sm" variant="soft" onClick={() => act('escalate')}><ShieldQuestion /> Send to ByeUni</Button>
        <Button size="sm" variant="soft" onClick={() => act('dismiss')}><X /> Dismiss</Button>
      </> : <Pill tone={report.status === 'dismissed' ? 'muted' : 'mint'}>{report.resolution ?? (report.status === 'dismissed' ? 'Dismissed' : 'Resolved')}</Pill>}
    </footer>
  </article>;
}

type UpdateTab = 'upcoming' | 'past';
const today = () => new Date().setHours(0, 0, 0, 0);

export function UpdatesView({ focus }: { focus?: string | undefined }) {
  const { updates, actions } = useSchool();
  const [tab, setTab] = useState<UpdateTab>('upcoming');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<SchoolUpdate | 'new' | null>(focus === 'new' ? 'new' : null);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  useEffect(() => { if (focus === 'new') setEditing('new'); }, [focus]);

  const q = query.trim().toLowerCase();
  const rows = useMemo(() => updates
    .filter(u => tab === 'upcoming' ? u.eventDate >= today() : u.eventDate < today())
    .filter(u => !q || `${u.title} ${u.description}`.toLowerCase().includes(q))
    .sort((a, b) => tab === 'upcoming' ? a.eventDate - b.eventDate : b.eventDate - a.eventDate), [updates, tab, q]);
  const pager = usePager(rows, 8);
  const selection = useSelection(pager.rows.map(u => u.id));
  const upcoming = updates.filter(u => u.eventDate >= today()).length;

  return <section className="db-view">
    <PageHead title="Updates" subtitle="News and events shown on your students’ ByeUni home page.">
      <Button variant="ink" onClick={() => setEditing('new')}><Plus /> New update</Button>
    </PageHead>
    <AdminTabs label="When" value={tab} onChange={value => { setTab(value); pager.reset(); }} items={[
      { value: 'upcoming', label: `Upcoming ${upcoming}` }, { value: 'past', label: `Past ${updates.length - upcoming}` },
    ]} />
    <article className="db-panel adm-table-panel">
      <Toolbar>
        <SearchBox value={query} onChange={value => { setQuery(value); pager.reset(); }} placeholder="Search title or description" />
        {selection.selected.length ? <Button variant="destructive" className="rounded-full ml-auto" onClick={() => setDeleteIds(selection.selected)}><Trash2 /> Delete {selection.selected.length}</Button> : null}
      </Toolbar>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr>
            <th className="adm-col-check"><Check checked={selection.all} onChange={selection.toggleAll} label="Select all on this page" /></th>
            <th>Update</th><th>Description</th><th>Event date</th><th>Posted</th><th><span className="sr-only">Actions</span></th>
          </tr></thead>
          <tbody>
            {pager.rows.map(u => <tr key={u.id} className={cn(selection.has(u.id) && 'is-selected')}>
              <td className="adm-col-check"><Check checked={selection.has(u.id)} onChange={on => selection.toggle(u.id, on)} label={`Select ${u.title}`} /></td>
              <td data-label="Update"><button type="button" className="adm-plain sch-update-cell" onClick={() => setEditing(u)}><DateChip at={u.eventDate} /><strong>{u.title}</strong></button></td>
              <td data-label="Description"><span className="sch-desc">{u.description}</span></td>
              <td data-label="Event date" className="adm-dates">{day(u.eventDate)}</td>
              <td data-label="Posted" className="adm-dates">{agoText(u.createdAt)}</td>
              <td className="adm-col-actions">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><button type="button" className="db-icon-btn" aria-label={`Actions for ${u.title}`}><MoreHorizontal /></button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="db-menu">
                    <DropdownMenuItem onSelect={() => setEditing(u)}><PencilLine />Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteIds([u.id])}><Trash2 />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>)}
            {rows.length === 0 ? <Empty>{tab === 'upcoming' ? 'No upcoming events. Post an update to reach your students.' : 'No past updates.'}</Empty> : null}
          </tbody>
        </table>
      </div>
      {pager.pager}
    </article>

    <UpdateEditor value={editing} onClose={() => setEditing(null)} />
    <Confirm
      open={deleteIds.length > 0}
      onOpenChange={open => { if (!open) setDeleteIds([]); }}
      title={deleteIds.length > 1 ? `Delete ${deleteIds.length} updates?` : 'Delete this update?'}
      body="Students stop seeing it on their home page right away."
      confirmLabel="Delete"
      onConfirm={() => { actions.deleteUpdates(deleteIds); selection.clear(); }}
    />
  </section>;
}

const toInput = (at: number) => format(at, 'yyyy-MM-dd');
const fromInput = (value: string) => value ? new Date(`${value}T12:00:00`).getTime() : 0;

function UpdateEditor({ value, onClose }: { value: SchoolUpdate | 'new' | null; onClose: () => void }) {
  const { actions } = useSchool();
  const blank = (): SchoolUpdate => ({ id: uid('up'), title: '', description: '', eventDate: Date.now() + 7 * 86_400_000, createdAt: Date.now() });
  const [draft, setDraft] = useState<SchoolUpdate>(blank);
  const [error, setError] = useState('');
  useEffect(() => { if (value) { setDraft(value === 'new' ? blank() : value); setError(''); } }, [value]);
  const isNew = value === 'new';
  const set = <K extends keyof SchoolUpdate>(key: K, v: SchoolUpdate[K]) => { setDraft(d => ({ ...d, [key]: v })); setError(''); };

  function save() {
    const problem = actions.saveUpdate(draft, isNew);
    if (problem) setError(problem);
    else onClose();
  }

  return <Dialog open={value !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>{isNew ? 'New update' : 'Edit update'}</DialogTitle>
      <DialogDescription className="db-muted">Every student at your school sees this on their ByeUni home page.</DialogDescription>
      <form className="db-form" onSubmit={event => { event.preventDefault(); save(); }}>
        <label className="db-field">Title<input value={draft.title} maxLength={150} onChange={event => set('title', event.target.value)} placeholder="Spring Career Fair" autoFocus /><small className="db-count">{draft.title.length}/150</small></label>
        <label className="db-field">Description<textarea rows={4} value={draft.description} maxLength={500} onChange={event => set('description', event.target.value)} placeholder="What’s happening, where, and who should come" /><small className="db-count">{draft.description.length}/500</small></label>
        <label className="db-field">Event date<input type="date" value={draft.eventDate ? toInput(draft.eventDate) : ''} min={isNew ? toInput(Date.now()) : undefined} onChange={event => set('eventDate', fromInput(event.target.value))} /></label>
        {error ? <p className="gate-error" role="alert">{error}</p> : null}
        <div className="db-dialog-actions">
          <Button type="button" variant="soft" className="rounded-full" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="ink">{isNew ? 'Post update' : 'Save'}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

export function SuggestionsView() {
  const { suggestions, lookups, school, actions } = useSchool();
  const [query, setQuery] = useState('');
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [summary, setSummary] = useState<{ text: string; basis: number } | null>(null);
  const [thinking, setThinking] = useState(false);
  const q = query.trim().toLowerCase();
  const rows = useMemo(() => suggestions
    .filter(s => !q || `${s.text} ${lookups.students.get(s.userId)?.name ?? ''}`.toLowerCase().includes(q))
    .sort((a, b) => b.at - a.at), [suggestions, q, lookups]);
  const pager = usePager(rows, 10);
  const selection = useSelection(pager.rows.map(s => s.id));

  function generate() {
    const basis = selection.selected.length ? suggestions.filter(s => selection.selected.includes(s.id)) : rows;
    if (!basis.length) return;
    setThinking(true);
    window.setTimeout(() => { setSummary({ text: summarize(basis.map(s => s.text)), basis: basis.length }); setThinking(false); }, 900);
  }

  function exportRows() {
    downloadCsv(`${school.short.toLowerCase().replace(/\W+/g, '-')}-suggestions.csv`, ['Student', 'Suggestion', 'Date'],
      rows.map(s => [lookups.students.get(s.userId)?.name ?? 'Former student', s.text, day(s.at)]));
  }

  return <section className="db-view">
    <PageHead title="Suggestions" subtitle="Ideas your students sent through ByeUni.">
      <ExportButton onClick={exportRows} />
      <Button variant="ink" onClick={generate} disabled={thinking || rows.length === 0}><Wand2 /> {thinking ? 'Summarizing…' : selection.selected.length ? `Summarize ${selection.selected.length} selected` : 'Generate summary'}</Button>
    </PageHead>
    {summary ? <article className="db-panel sch-summary">
      <header><span className="adm-stat-icon"><Sparkles /></span><div><strong>Summary of {summary.basis} suggestion{summary.basis === 1 ? '' : 's'}</strong><small>Generated just now</small></div>
        <button type="button" className="db-icon-btn" aria-label="Close summary" onClick={() => setSummary(null)}><X /></button></header>
      <p>{summary.text}</p>
    </article> : null}
    <article className="db-panel adm-table-panel">
      <Toolbar>
        <SearchBox value={query} onChange={value => { setQuery(value); pager.reset(); }} placeholder="Search suggestion or student" />
        {selection.selected.length ? <Button variant="destructive" className="rounded-full ml-auto" onClick={() => setDeleteIds(selection.selected)}><Trash2 /> Delete {selection.selected.length}</Button> : null}
      </Toolbar>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr>
            <th className="adm-col-check"><Check checked={selection.all} onChange={selection.toggleAll} label="Select all on this page" /></th>
            <th>Student</th><th>Suggestion</th><th>Date</th>
          </tr></thead>
          <tbody>
            {pager.rows.map(s => <tr key={s.id} className={cn(selection.has(s.id) && 'is-selected')}>
              <td className="adm-col-check"><Check checked={selection.has(s.id)} onChange={on => selection.toggle(s.id, on)} label="Select suggestion" /></td>
              <td data-label="Student"><StudentCell id={s.userId} /></td>
              <td data-label="Suggestion"><span className="sch-suggestion">“{s.text}”</span></td>
              <td data-label="Date" className="adm-dates">{day(s.at)}</td>
            </tr>)}
            {rows.length === 0 ? <Empty>No suggestions yet.</Empty> : null}
          </tbody>
        </table>
      </div>
      {pager.pager}
    </article>
    <Confirm
      open={deleteIds.length > 0}
      onOpenChange={open => { if (!open) setDeleteIds([]); }}
      title={deleteIds.length > 1 ? `Delete ${deleteIds.length} suggestions?` : 'Delete this suggestion?'}
      body="This can’t be undone."
      confirmLabel="Delete"
      onConfirm={() => { actions.deleteSuggestions(deleteIds); selection.clear(); setSummary(null); }}
    />
  </section>;
}