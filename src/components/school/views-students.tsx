import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Ban, Download, Eye, Flag, GraduationCap, Heart, Mail, MapPin, MessagesSquare, MoreHorizontal, Phone, RotateCcw, Send, ShieldQuestion,
  UserCheck, UserMinus, UserPlus, UserX, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { agoText } from '@/components/dashboard/shared';
import { coverSrc, seedMajors, type AdminCampaign } from '@/content/admin-data';
import type { SchoolStudent } from '@/content/school-data';
import { cn } from '@/lib/utils';
import { campaignState, type CampaignState } from '@/components/admin/store';
import { CampaignPill } from '@/components/admin/views-overview';
import {
  AdminTabs, Check, Confirm, Empty, Face, PageHead, Pill, SearchBox, Toolbar, UserCell, day, dollars, downloadCsv, pct, usePager,
  useSelection, userPhoto,
} from '@/components/admin/ui';
import { StudentProfile } from '@/components/admin/StudentProfile';
import { schoolDomain, useSchool } from './store';
import { SchoolLink } from './ui';

export function StudentStatus({ student }: { student: SchoolStudent }) {
  if (student.suspended) return <Pill tone="rose">Suspended</Pill>;
  if (student.invited) return <Pill tone="sky">Invited</Pill>;
  return student.enabled ? <Pill tone="mint">Active</Pill> : <Pill tone="muted">Inactive</Pill>;
}

type StudentTab = 'active' | 'inactive' | 'suspended';
const tabOf = (s: SchoolStudent): StudentTab => s.suspended ? 'suspended' : s.enabled && !s.invited ? 'active' : 'inactive';

export function StudentsView({ focus }: { focus?: string | undefined }) {
  const { school, students, actions } = useSchool();
  const [tab, setTab] = useState<StudentTab>('active');
  const [query, setQuery] = useState('');
  const [major, setMajor] = useState('all');
  const [openId, setOpenId] = useState<string | null>(focus ?? null);
  const [inviting, setInviting] = useState(false);
  const [suspendFor, setSuspendFor] = useState<SchoolStudent | null>(null);
  const [reason, setReason] = useState('');
  const [removeIds, setRemoveIds] = useState<string[]>([]);

  useEffect(() => { if (focus) setOpenId(focus); }, [focus]);

  const q = query.trim().toLowerCase();
  const majors = useMemo(() => [...new Set(students.map(s => s.major).filter((m): m is string => Boolean(m)))].sort(), [students]);
  const rows = useMemo(() => students
    .filter(s => tabOf(s) === tab)
    .filter(s => major === 'all' || s.major === major)
    .filter(s => !q || `${s.name} ${s.email} ${s.phone}`.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt - a.createdAt), [students, tab, major, q]);
  const pager = usePager(rows, 10);
  const selection = useSelection(pager.rows.map(s => s.id));
  const count = (t: StudentTab) => students.filter(s => tabOf(s) === t).length;

  function exportStudents() {
    downloadCsv(`${school.short.toLowerCase().replace(/\W+/g, '-')}-students.csv`, ['Student ID', 'Name', 'Email', 'Phone', 'Major', 'Created on', 'Status'],
      students.map(s => [s.id, s.name, s.email, s.phone, s.major ?? '', day(s.createdAt), s.suspended ? 'Suspended' : s.invited ? 'Invited' : s.enabled ? 'Active' : 'Inactive']));
  }

  const suspend = (s: SchoolStudent) => { setSuspendFor(s); setReason(''); };

  return <section className="db-view">
    <PageHead title="Students" subtitle={`${school.name} students registered on ByeUni.`}>
      <Button variant="soft" className="rounded-full" onClick={exportStudents}><Download /> Download students</Button>
      <Button variant="ink" onClick={() => setInviting(true)}><UserPlus /> Invite student</Button>
    </PageHead>
    <AdminTabs label="Student status" value={tab} onChange={value => { setTab(value); pager.reset(); }} items={[
      { value: 'active', label: `Active ${count('active')}` }, { value: 'inactive', label: `Inactive ${count('inactive')}` },
      { value: 'suspended', label: 'Suspended', count: count('suspended') },
    ]} />
    <article className="db-panel adm-table-panel">
      <Toolbar>
        <SearchBox value={query} onChange={value => { setQuery(value); pager.reset(); }} placeholder="Search name, email, or phone" />
        <Dropdown variant="pill" label="Major" value={major} onChange={value => { setMajor(value); pager.reset(); }} options={[{ value: 'all', label: 'All majors' }, ...majors]} />
        {selection.selected.length ? <Button variant="destructive" className="rounded-full ml-auto" onClick={() => setRemoveIds(selection.selected)}><UserMinus /> Remove {selection.selected.length}</Button> : null}
      </Toolbar>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr>
            <th className="adm-col-check"><Check checked={selection.all} onChange={selection.toggleAll} label="Select all on this page" /></th>
            <th>Name</th><th>Major</th><th>Phone</th><th className="adm-num">Vibeys</th><th>Joined</th><th>Status</th><th><span className="sr-only">Actions</span></th>
          </tr></thead>
          <tbody>
            {pager.rows.map(s => <tr key={s.id} className={cn(selection.has(s.id) && 'is-selected')}>
              <td className="adm-col-check"><Check checked={selection.has(s.id)} onChange={on => selection.toggle(s.id, on)} label={`Select ${s.name}`} /></td>
              <td data-label="Name"><button type="button" className="adm-plain" onClick={() => setOpenId(s.id)}><UserCell user={s} /></button></td>
              <td data-label="Major">{s.major ?? '—'}</td>
              <td data-label="Phone">{s.phone || '—'}</td>
              <td data-label="Vibeys" className="adm-num">{s.vibeys.toLocaleString('en-US')}</td>
              <td data-label="Joined" className="adm-dates">{day(s.createdAt)}</td>
              <td data-label="Status">{tab === 'suspended' ? <span className="adm-stack"><StudentStatus student={s} /><small className="adm-reason">{s.suspendReason}</small></span> : <StudentStatus student={s} />}</td>
              <td className="adm-col-actions">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><button type="button" className="db-icon-btn" aria-label={`Actions for ${s.name}`}><MoreHorizontal /></button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="db-menu">
                    <DropdownMenuItem asChild><SchoolLink section="student" focus={s.id}><Eye />View profile</SchoolLink></DropdownMenuItem>
                    {s.invited
                      ? <DropdownMenuItem onSelect={() => actions.resendInvite(s.id)}><Send />Resend invitation</DropdownMenuItem>
                      : <DropdownMenuItem onSelect={() => actions.setStudentEnabled(s.id, !s.enabled)}>{s.enabled ? <><UserX />Deactivate</> : <><UserCheck />Activate</>}</DropdownMenuItem>}
                    {s.suspended
                      ? <DropdownMenuItem onSelect={() => actions.restoreStudent(s.id)}><RotateCcw />Restore</DropdownMenuItem>
                      : <DropdownMenuItem onSelect={() => suspend(s)}><Ban />Suspend</DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onSelect={() => setRemoveIds([s.id])}><UserMinus />Remove from school</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>)}
            {rows.length === 0 ? <Empty>{tab === 'suspended' ? 'No suspended students.' : 'No students match these filters.'}</Empty> : null}
          </tbody>
        </table>
      </div>
      {pager.pager}
    </article>

    <StudentSheet studentId={openId} onClose={() => setOpenId(null)} onSuspend={suspend} />
    <InviteDialog open={inviting} onOpenChange={setInviting} />
    <Confirm
      open={suspendFor !== null}
      onOpenChange={open => { if (!open) setSuspendFor(null); }}
      title={`Suspend ${suspendFor?.name ?? ''}?`}
      confirmLabel="Suspend"
      body="They can’t sign in, post, or receive donations until you restore the account. ByeUni is notified."
      onConfirm={() => suspendFor ? actions.suspendStudent(suspendFor.id, reason) : undefined}
    >
      <label className="db-field">Reason<input value={reason} onChange={event => setReason(event.target.value)} placeholder="Violated the student code of conduct" /></label>
    </Confirm>
    <Confirm
      open={removeIds.length > 0}
      onOpenChange={open => { if (!open) setRemoveIds([]); }}
      title={removeIds.length > 1 ? `Remove ${removeIds.length} students from ${school.short}?` : `Remove this student from ${school.short}?`}
      body="They leave your school’s roster and stop seeing your updates. Their ByeUni account and campaigns stay open."
      confirmLabel="Remove"
      onConfirm={() => { actions.removeStudents(removeIds); selection.clear(); setOpenId(null); }}
    />
  </section>;
}

function StudentSheet({ studentId, onClose, onSuspend }: { studentId: string | null; onClose: () => void; onSuspend: (s: SchoolStudent) => void }) {
  const { students, campaigns, forums, school, actions } = useSchool();
  const student = students.find(s => s.id === studentId);
  const owned = student ? campaigns.filter(c => c.ownerId === student.id) : [];
  const groups = student ? forums.filter(f => f.ownerId === student.id) : [];
  return <Sheet open={Boolean(student)} onOpenChange={open => { if (!open) onClose(); }}>
    <SheetContent side="right" className="db-sheet adm-detail">
      {student ? <>
        <div className="adm-profile-top">
          <Face name={student.name} photo={userPhoto(student)} size={76} />
          <div>
            <SheetTitle>{student.name}</SheetTitle>
            <SheetDescription>{student.major ?? 'Major not set'} · {school.short}</SheetDescription>
            <StudentStatus student={student} />
          </div>
        </div>
        <ul className="adm-contact">
          <li><Mail /> <a href={`mailto:${student.email}`}>{student.email}</a></li>
          {student.phone ? <li><Phone /> {student.phone}</li> : null}
          {student.city ? <li><MapPin /> {student.city}</li> : null}
          <li><GraduationCap /> {school.name}</li>
        </ul>
        <dl className="db-mini-stats">
          <div><dt>Joined</dt><dd>{day(student.createdAt)}</dd></div>
          <div><dt>Last active</dt><dd>{student.invited ? '—' : agoText(student.lastActive)}</dd></div>
          <div><dt>Vibeys</dt><dd>{student.vibeys}</dd></div>
        </dl>
        {student.invited ? <p className="adm-callout is-sky"><Send /> Invitation sent. They appear as active once they finish signing up.</p> : null}
        {student.suspendReason ? <p className="adm-callout is-rose"><Ban /> Suspended: {student.suspendReason}</p> : null}
        <h3 className="adm-detail-title">Campaigns</h3>
        {owned.length ? <ul className="db-row-list is-plain">{owned.map(c => <li key={c.id}>
          <img className="adm-thumb" src={coverSrc(c.cover)} alt="" />
          <div><strong>{c.title}</strong><small>{dollars(c.raised)} of {dollars(c.goal)}</small></div>
          <CampaignPill state={campaignState(c)} />
        </li>)}</ul> : <p className="db-muted">No campaigns yet.</p>}
        {groups.length ? <>
          <h3 className="adm-detail-title">Forums they run</h3>
          <ul className="db-row-list is-plain">{groups.map(f => <li key={f.id}><span className="adm-stat-icon"><MessagesSquare /></span><div><strong>{f.title}</strong><small>{f.members.toLocaleString('en-US')} members</small></div>{f.removed ? <Pill tone="rose">Removed</Pill> : null}</li>)}</ul>
        </> : null}
        <div className="db-dialog-actions is-start">
          <Button variant="ink" asChild><SchoolLink section="student" focus={student.id}><Eye /> View full profile</SchoolLink></Button>
          {student.invited
            ? <Button variant="soft" className="rounded-full" onClick={() => actions.resendInvite(student.id)}><Send /> Resend invitation</Button>
            : <Button variant="soft" className="rounded-full" onClick={() => actions.setStudentEnabled(student.id, !student.enabled)}>{student.enabled ? <><UserX /> Deactivate</> : <><UserCheck /> Activate</>}</Button>}
          {student.suspended
            ? <Button variant="ink" onClick={() => actions.restoreStudent(student.id)}><RotateCcw /> Restore</Button>
            : <Button variant="destructive" className="rounded-full" onClick={() => onSuspend(student)}><Ban /> Suspend</Button>}
        </div>
      </> : null}
    </SheetContent>
  </Sheet>;
}

export function StudentProfileView({ studentId }: { studentId?: string | undefined }) {
  const { students, campaigns, forums, suggestions, school, actions } = useSchool();
  const [suspending, setSuspending] = useState(false);
  const [reason, setReason] = useState('');
  const student = students.find(s => s.id === studentId);
  const back = <SchoolLink section="students" className="adm-back"><ArrowLeft /> Students</SchoolLink>;
  if (!student) return <section className="db-view">
    {back}
    <PageHead title="Student not found" subtitle={`This student isn’t on the ${school.short} roster anymore.`} />
  </section>;

  return <>
    <StudentProfile
      student={student}
      schoolName={school.name}
      status={<StudentStatus student={student} />}
      back={back}
      campaigns={campaigns.filter(c => c.ownerId === student.id)}
      forums={forums.filter(f => f.ownerId === student.id)}
      suggestions={suggestions.filter(s => s.userId === student.id)}
      actions={<>
        <Button variant="soft" className="rounded-full" asChild><a href={`mailto:${student.email}`}><Mail /> Email</a></Button>
        {student.invited
          ? <Button variant="soft" className="rounded-full" onClick={() => actions.resendInvite(student.id)}><Send /> Resend invitation</Button>
          : <Button variant="soft" className="rounded-full" onClick={() => actions.setStudentEnabled(student.id, !student.enabled)}>{student.enabled ? <><UserX /> Deactivate</> : <><UserCheck /> Activate</>}</Button>}
        {student.suspended
          ? <Button variant="ink" onClick={() => actions.restoreStudent(student.id)}><RotateCcw /> Restore</Button>
          : <Button variant="destructive" className="rounded-full" onClick={() => { setReason(''); setSuspending(true); }}><Ban /> Suspend</Button>}
      </>}
    />
    <Confirm
      open={suspending}
      onOpenChange={setSuspending}
      title={`Suspend ${student.name}?`}
      confirmLabel="Suspend"
      body="They can’t sign in, post, or receive donations until you restore the account. ByeUni is notified."
      onConfirm={() => actions.suspendStudent(student.id, reason)}
    >
      <label className="db-field">Reason<input value={reason} onChange={event => setReason(event.target.value)} placeholder="Violated the student code of conduct" /></label>
    </Confirm>
  </>;
}

function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { profile, actions } = useSchool();
  const majors = seedMajors.filter(m => m.active).map(m => m.name);
  const [form, setForm] = useState({ name: '', email: '', major: majors[0] ?? '' });
  const [error, setError] = useState('');
  useEffect(() => { if (open) { setForm({ name: '', email: '', major: majors[0] ?? '' }); setError(''); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const domain = schoolDomain(profile);

  function save() {
    const problem = actions.inviteStudent(form);
    if (problem) setError(problem);
    else onOpenChange(false);
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="db-dialog">
      <DialogTitle>Invite a student</DialogTitle>
      <DialogDescription className="db-muted">They get an email to finish signing up. Their account joins your school automatically.</DialogDescription>
      <form className="db-form" onSubmit={event => { event.preventDefault(); save(); }}>
        <label className="db-field">Full name<input value={form.name} onChange={event => { setForm(f => ({ ...f, name: event.target.value })); setError(''); }} placeholder="Avery Johnson" autoFocus /></label>
        <label className="db-field">School email<input type="email" value={form.email} onChange={event => { setForm(f => ({ ...f, email: event.target.value })); setError(''); }} placeholder={`avery@${domain}`} /></label>
        <label className="db-field">Major<Dropdown value={form.major} onChange={value => setForm(f => ({ ...f, major: value }))} options={majors} /></label>
        {error ? <p className="gate-error" role="alert">{error}</p> : null}
        <div className="db-dialog-actions">
          <Button type="button" variant="soft" className="rounded-full" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" variant="ink"><Send /> Send invitation</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

type CampaignTab = 'all' | CampaignState;
const reviewReasons = ['Asks for money outside ByeUni', 'Misleading goal or story', 'Not a current student', 'Duplicate campaign'];

export function CampaignsView({ focus }: { focus?: string | undefined }) {
  const { campaigns, escalations, lookups, actions } = useSchool();
  const [tab, setTab] = useState<CampaignTab>('all');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [openId, setOpenId] = useState<string | null>(focus ?? null);
  const [reviewFor, setReviewFor] = useState<AdminCampaign | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => { if (focus) setOpenId(focus); }, [focus]);

  const flagged = new Map(escalations.map(e => [e.campaignId, e]));
  const q = query.trim().toLowerCase();
  const categories = [...new Set(campaigns.map(c => c.category))].sort();
  const rows = useMemo(() => campaigns
    .filter(c => tab === 'all' || campaignState(c) === tab)
    .filter(c => category === 'all' || c.category === category)
    .filter(c => !q || `${c.title} ${lookups.students.get(c.ownerId)?.name ?? ''}`.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt - a.createdAt), [campaigns, tab, category, q, lookups]);
  const pager = usePager(rows, 8);
  const count = (t: CampaignTab) => campaigns.filter(c => t === 'all' || campaignState(c) === t).length;
  const review = (c: AdminCampaign) => { setReviewFor(c); setReason(''); };

  return <section className="db-view">
    <PageHead title="Campaigns" subtitle="Every campaign started by your students. ByeUni handles publishing and payouts." />
    <AdminTabs label="Campaign status" value={tab} onChange={value => { setTab(value); pager.reset(); }} items={[
      { value: 'all', label: `All ${count('all')}` }, { value: 'active', label: `Active ${count('active')}` },
      { value: 'complete', label: `Completed ${count('complete')}` }, { value: 'expired', label: `Expired ${count('expired')}` },
      { value: 'draft', label: `Drafts ${count('draft')}` },
    ]} />
    <article className="db-panel adm-table-panel">
      <Toolbar>
        <SearchBox value={query} onChange={value => { setQuery(value); pager.reset(); }} placeholder="Search campaign or student" />
        <Dropdown variant="pill" label="Category" value={category} onChange={value => { setCategory(value); pager.reset(); }} options={[{ value: 'all', label: 'All categories' }, ...categories]} />
      </Toolbar>
      <p className="adm-note">Something look wrong? Ask ByeUni to review it. Only ByeUni can unpublish a campaign or hold its payouts.</p>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Campaign</th><th>Created by</th><th>Dates</th><th>Raised / goal</th><th>Likes</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {pager.rows.map(c => {
              const owner = lookups.students.get(c.ownerId);
              return <tr key={c.id}>
                <td data-label="Campaign"><button type="button" className="adm-campaign-cell" onClick={() => setOpenId(c.id)}>
                  <img src={coverSrc(c.cover)} alt="" /><span><strong>{c.title}</strong><small>{c.category} · {c.visibility}</small></span>
                </button></td>
                <td data-label="Created by">{owner ? <SchoolLink section="student" focus={owner.id} className="adm-plain"><UserCell user={owner} meta={owner.major} /></SchoolLink> : <UserCell user={owner} />}</td>
                <td data-label="Dates" className="adm-dates">{day(c.start).replace(/, \d{4}$/, '')} – {day(c.end)}</td>
                <td data-label="Raised / goal"><span className="adm-progress"><span><b>{dollars(c.raised)}</b> / {dollars(c.goal)}</span><span className="db-bar"><span style={{ width: `${pct(c.raised, c.goal)}%` }} /></span></span></td>
                <td data-label="Likes"><span className="adm-likes"><Heart /> {c.likes}</span></td>
                <td data-label="Status"><span className="adm-stack"><CampaignPill state={campaignState(c)} />{flagged.has(c.id) ? <small className="adm-warn"><ShieldQuestion /> With ByeUni</small> : null}</span></td>
                <td className="adm-col-actions">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><button type="button" className="db-icon-btn" aria-label={`Actions for ${c.title}`}><MoreHorizontal /></button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="db-menu">
                      <DropdownMenuItem onSelect={() => setOpenId(c.id)}><Eye />View campaign</DropdownMenuItem>
                      {flagged.has(c.id)
                        ? <DropdownMenuItem onSelect={() => actions.withdrawEscalation(c.id)}><RotateCcw />Withdraw review request</DropdownMenuItem>
                        : <DropdownMenuItem onSelect={() => review(c)}><Flag />Ask ByeUni to review</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>;
            })}
            {rows.length === 0 ? <Empty>No campaigns match these filters.</Empty> : null}
          </tbody>
        </table>
      </div>
      {pager.pager}
    </article>

    <CampaignSheet campaignId={openId} onClose={() => setOpenId(null)} onReview={review} />
    <Confirm
      open={reviewFor !== null}
      onOpenChange={open => { if (!open) setReviewFor(null); }}
      title="Ask ByeUni to review this campaign?"
      tone="ink"
      confirmLabel="Send to ByeUni"
      body={<>ByeUni trust &amp; safety checks “{reviewFor?.title}” and can pause donations. The student isn’t told who asked.</>}
      onConfirm={() => reviewFor ? actions.escalateCampaign(reviewFor.id, reason) : undefined}
    >
      <label className="db-field">What looks wrong?<textarea rows={3} value={reason} onChange={event => setReason(event.target.value)} placeholder="Describe the problem" /></label>
      <div className="db-filter-row">{reviewReasons.map(r => <button key={r} type="button" className="db-chip" aria-pressed={reason === r} onClick={() => setReason(r)}>{r}</button>)}</div>
    </Confirm>
  </section>;
}

function CampaignSheet({ campaignId, onClose, onReview }: { campaignId: string | null; onClose: () => void; onReview: (c: AdminCampaign) => void }) {
  const { campaigns, escalations, lookups, actions } = useSchool();
  const campaign = campaigns.find(c => c.id === campaignId);
  const escalation = escalations.find(e => e.campaignId === campaignId);
  const owner = campaign ? lookups.students.get(campaign.ownerId) : undefined;
  return <Sheet open={Boolean(campaign)} onOpenChange={open => { if (!open) onClose(); }}>
    <SheetContent side="right" className="db-sheet adm-detail">
      {campaign ? <>
        <img className="adm-detail-cover" src={coverSrc(campaign.cover)} alt="" />
        <div className="adm-detail-head">
          <CampaignPill state={campaignState(campaign)} />
          <SheetTitle>{campaign.title}</SheetTitle>
          <SheetDescription>{campaign.category} · {campaign.visibility} · {day(campaign.start)} – {day(campaign.end)}</SheetDescription>
        </div>
        <div className="adm-detail-money">
          <span className="adm-progress"><span><b>{dollars(campaign.raised)}</b> raised of {dollars(campaign.goal)}</span><span className="db-bar"><span style={{ width: `${pct(campaign.raised, campaign.goal)}%` }} /></span></span>
        </div>
        <dl className="db-mini-stats">
          <div><dt>Donors</dt><dd>{campaign.donors}</dd></div>
          <div><dt>Likes</dt><dd>{campaign.likes}</dd></div>
          <div><dt>Funded</dt><dd>{pct(campaign.raised, campaign.goal)}%</dd></div>
        </dl>
        <h3 className="adm-detail-title">Journey</h3>
        <p className="sch-story">{campaign.story}</p>
        <h3 className="adm-detail-title">Student</h3>
        {owner ? <SchoolLink section="student" focus={owner.id} className="adm-plain"><UserCell user={owner} meta={`${owner.major ?? ''} · ${owner.email}`} /></SchoolLink> : <UserCell user={owner} />}
        {escalation ? <p className="adm-callout is-sky"><ShieldQuestion /> Sent to ByeUni {agoText(escalation.at)}: “{escalation.reason}”</p> : null}
        <div className="db-dialog-actions is-start">
          {escalation
            ? <Button variant="soft" className="rounded-full" onClick={() => actions.withdrawEscalation(campaign.id)}><RotateCcw /> Withdraw review request</Button>
            : <Button variant="soft" className="rounded-full" onClick={() => onReview(campaign)}><Flag /> Ask ByeUni to review</Button>}
          <Button variant="soft" className="rounded-full" asChild><a href={`mailto:${owner?.email ?? ''}`}><Users /> Email student</a></Button>
        </div>
      </> : null}
    </SheetContent>
  </Sheet>;
}
