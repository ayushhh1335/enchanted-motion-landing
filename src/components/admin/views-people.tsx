import { useEffect, useMemo, useState } from 'react';
import {
  Ban, Download, Eye, GraduationCap, ImagePlus, KeyRound, Mail, MapPin, MoreHorizontal, PencilLine, Phone, Plus, RotateCcw, Sparkles,
  Trash2, UserCheck, UserX, Users, Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { agoText, usePhotoPicker } from '@/components/dashboard/shared';
import { coverSrc, type AdminUser, type Membership, type School, type SchoolAdmin, type UserType } from '@/content/admin-data';
import { cn } from '@/lib/utils';
import { campaignState, uid, useAdmin } from './store';
import { CampaignPill } from './views-overview';
import {
  AdminTabs, Check, Confirm, Empty, ExportButton, Face, PageHead, Pill, SearchBox, Toolbar, UserCell, day, dollars, downloadCsv,
  summarize, usePager, useSelection, userPhoto,
} from './ui';

type UserTab = 'fundraiser' | 'team' | 'guest' | 'suspended';

export function UserStatus({ user }: { user: AdminUser }) {
  if (user.suspended) return <Pill tone="rose">Suspended</Pill>;
  return user.enabled ? <Pill tone="mint">Active</Pill> : <Pill tone="muted">Inactive</Pill>;
}

export function UsersView({ focus }: { focus?: string | undefined }) {
  const { users, schools, campaigns, lookups, actions } = useAdmin();
  const [tab, setTab] = useState<UserTab>('fundraiser');
  const [query, setQuery] = useState('');
  const [school, setSchool] = useState('all');
  const [status, setStatus] = useState('all');
  const [openId, setOpenId] = useState<string | null>(focus ?? null);
  const [adding, setAdding] = useState<UserType | null>(null);
  const [suspendFor, setSuspendFor] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState('');
  const [confirmIds, setConfirmIds] = useState<string[]>([]);

  useEffect(() => { if (focus) setOpenId(focus); }, [focus]);

  const q = query.trim().toLowerCase();
  const rows = useMemo(() => users
    .filter(u => tab === 'suspended' ? u.suspended : u.type === tab)
    .filter(u => school === 'all' || u.schoolId === school)
    .filter(u => status === 'all' || (status === 'active' ? u.enabled && !u.suspended : !u.enabled))
    .filter(u => !q || `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt - a.createdAt), [users, tab, school, status, q]);
  const pager = usePager(rows, 10);
  const selection = useSelection(pager.rows.map(u => u.id));
  const count = (t: UserTab) => users.filter(u => t === 'suspended' ? u.suspended : u.type === t).length;
  const ownsCampaign = new Set(campaigns.map(c => c.ownerId));

  function exportRows() {
    downloadCsv(`byeuni-${tab}.csv`, ['Name', 'Email', 'Phone', 'School', 'City', 'Joined', 'Status'],
      rows.map(u => [u.name, u.email, u.phone, lookups.schools.get(u.schoolId ?? '')?.name ?? '', u.city, day(u.createdAt), u.suspended ? 'Suspended' : u.enabled ? 'Active' : 'Inactive']));
  }

  return <section className="db-view">
    <PageHead title="Students & guests" subtitle="Fundraisers, their team members, and guest donors.">
      <ExportButton onClick={exportRows} />
      <Button variant="ink" onClick={() => setAdding(tab === 'guest' ? 'guest' : 'fundraiser')}><Plus /> Add {tab === 'guest' ? 'guest' : 'student'}</Button>
    </PageHead>
    <AdminTabs label="Account type" value={tab} onChange={value => { setTab(value); pager.reset(); }} items={[
      { value: 'fundraiser', label: `Students ${count('fundraiser')}` }, { value: 'team', label: `Team members ${count('team')}` },
      { value: 'guest', label: `Guests ${count('guest')}` }, { value: 'suspended', label: 'Suspended', count: count('suspended') },
    ]} />
    <article className="db-panel adm-table-panel">
      <Toolbar>
        <SearchBox value={query} onChange={value => { setQuery(value); pager.reset(); }} placeholder="Search name, email, or phone" />
        {tab !== 'guest' ? <label className="adm-select"><span className="sr-only">School</span>
          <select value={school} onChange={event => { setSchool(event.target.value); pager.reset(); }}>
            <option value="all">All schools</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.short}</option>)}
          </select>
        </label> : null}
        {tab !== 'suspended' ? <label className="adm-select"><span className="sr-only">Status</span>
          <select value={status} onChange={event => { setStatus(event.target.value); pager.reset(); }}>
            <option value="all">Any status</option><option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </label> : null}
        {selection.selected.length ? <Button variant="destructive" className="rounded-full ml-auto" onClick={() => setConfirmIds(selection.selected)}><Trash2 /> Delete {selection.selected.length}</Button> : null}
      </Toolbar>
      {tab === 'fundraiser' ? <p className="adm-note">You can only delete students who have no campaigns.</p> : null}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr>
            <th className="adm-col-check"><Check checked={selection.all} onChange={selection.toggleAll} label="Select all on this page" /></th>
            <th>Name</th>
            {tab === 'guest' ? <><th>City</th><th className="adm-num">Donated</th></> : tab === 'team' ? <><th>Team of</th><th>Can withdraw</th></> : tab === 'suspended' ? <th>Reason</th> : <><th>School</th><th>Phone</th><th className="adm-num">Vibeys</th></>}
            <th>Joined</th><th>Status</th><th><span className="sr-only">Actions</span></th>
          </tr></thead>
          <tbody>
            {pager.rows.map(u => <tr key={u.id} className={cn(selection.has(u.id) && 'is-selected')}>
              <td className="adm-col-check"><Check checked={selection.has(u.id)} onChange={on => selection.toggle(u.id, on)} label={`Select ${u.name}`} /></td>
              <td data-label="Name"><button type="button" className="adm-plain" onClick={() => setOpenId(u.id)}><UserCell user={u} /></button></td>
              {tab === 'guest' ? <>
                <td data-label="City">{u.city}</td>
                <td data-label="Donated" className="adm-num">{dollars(u.donated ?? 0)}</td>
              </> : tab === 'team' ? <>
                <td data-label="Team of">{lookups.users.get(u.parentId ?? '')?.name ?? '—'}</td>
                <td data-label="Can withdraw"><Switch checked={Boolean(u.withdrawCash)} onCheckedChange={on => actions.setWithdrawCash(u.id, on)} aria-label={`Allow ${u.name} to withdraw`} /></td>
              </> : tab === 'suspended' ? <td data-label="Reason"><span className="adm-clip">{u.suspendReason}</span></td> : <>
                <td data-label="School"><span className="adm-stack">{lookups.schools.get(u.schoolId ?? '')?.short ?? '—'}<small className="adm-sub">{u.major}</small></span></td>
                <td data-label="Phone">{u.phone}</td>
                <td data-label="Vibeys" className="adm-num">{u.vibeys.toLocaleString('en-US')}</td>
              </>}
              <td data-label="Joined">{day(u.createdAt)}</td>
              <td data-label="Status"><UserStatus user={u} /></td>
              <td className="adm-col-actions">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><button type="button" className="db-icon-btn" aria-label={`Actions for ${u.name}`}><MoreHorizontal /></button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="db-menu">
                    <DropdownMenuItem onSelect={() => setOpenId(u.id)}><Eye />View profile</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => actions.setUserEnabled(u.id, !u.enabled)}>{u.enabled ? <><UserX />Deactivate</> : <><UserCheck />Activate</>}</DropdownMenuItem>
                    {u.suspended
                      ? <DropdownMenuItem onSelect={() => actions.restoreUser(u.id)}><RotateCcw />Restore</DropdownMenuItem>
                      : <DropdownMenuItem onSelect={() => { setSuspendFor(u); setReason(''); }}><Ban />Suspend</DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" disabled={ownsCampaign.has(u.id)} onSelect={() => setConfirmIds([u.id])}><Trash2 />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>)}
            {rows.length === 0 ? <Empty>No accounts match these filters.</Empty> : null}
          </tbody>
        </table>
      </div>
      {pager.pager}
    </article>

    <UserSheet userId={openId} onClose={() => setOpenId(null)} onSuspend={u => { setSuspendFor(u); setReason(''); }} />
    <UserEditor type={adding} onClose={() => setAdding(null)} />
    <Confirm
      open={suspendFor !== null}
      onOpenChange={open => { if (!open) setSuspendFor(null); }}
      title={`Suspend ${suspendFor?.name ?? ''}?`}
      confirmLabel="Suspend"
      body="They can’t sign in, post, or receive donations until you restore the account."
      onConfirm={() => { if (suspendFor) actions.suspendUser(suspendFor.id, reason); }}
    >
      <label className="db-field">Reason<input value={reason} onChange={event => setReason(event.target.value)} placeholder="Community guidelines violation" /></label>
    </Confirm>
    <Confirm
      open={confirmIds.length > 0}
      onOpenChange={open => { if (!open) setConfirmIds([]); }}
      title={confirmIds.length > 1 ? `Delete ${confirmIds.length} accounts?` : 'Delete this account?'}
      body="Accounts that own campaigns are kept. Deactivate those instead."
      confirmLabel="Delete"
      onConfirm={() => { actions.deleteUsers(confirmIds); selection.clear(); }}
    />
  </section>;
}

function UserSheet({ userId, onClose, onSuspend }: { userId: string | null; onClose: () => void; onSuspend: (u: AdminUser) => void }) {
  const { users, campaigns, lookups, actions } = useAdmin();
  const user = users.find(u => u.id === userId);
  const owned = user ? campaigns.filter(c => c.ownerId === user.id) : [];
  const team = user ? users.filter(u => u.parentId === user.id) : [];
  return <Sheet open={Boolean(user)} onOpenChange={open => { if (!open) onClose(); }}>
    <SheetContent side="right" className="db-sheet adm-detail">
      {user ? <>
        <div className="adm-profile-top">
          <Face name={user.name} photo={userPhoto(user)} size={76} />
          <div>
            <SheetTitle>{user.name}</SheetTitle>
            <SheetDescription>{user.type === 'fundraiser' ? 'Student fundraiser' : user.type === 'team' ? 'Team member' : 'Guest donor'}{user.major ? ` · ${user.major}` : ''}</SheetDescription>
            <UserStatus user={user} />
          </div>
        </div>
        <ul className="adm-contact">
          <li><Mail /> <a href={`mailto:${user.email}`}>{user.email}</a></li>
          <li><Phone /> {user.phone}</li>
          <li><MapPin /> {user.city}</li>
          {user.schoolId ? <li><GraduationCap /> {lookups.schools.get(user.schoolId)?.name}</li> : null}
        </ul>
        <dl className="db-mini-stats">
          <div><dt>Joined</dt><dd>{day(user.createdAt)}</dd></div>
          <div><dt>Last active</dt><dd>{agoText(user.lastActive)}</dd></div>
          <div><dt>{user.type === 'guest' ? 'Donated' : 'Vibeys'}</dt><dd>{user.type === 'guest' ? dollars(user.donated ?? 0) : user.vibeys}</dd></div>
        </dl>
        {user.suspendReason ? <p className="adm-callout is-rose"><Ban /> Suspended: {user.suspendReason}</p> : null}
        {user.type === 'fundraiser' ? <>
          <h3 className="adm-detail-title">Campaigns</h3>
          {owned.length ? <ul className="db-row-list is-plain">{owned.map(c => <li key={c.id}>
            <img className="adm-thumb" src={coverSrc(c.cover)} alt="" />
            <div><strong>{c.title}</strong><small>{dollars(c.raised)} of {dollars(c.goal)}</small></div>
            <CampaignPill state={campaignState(c)} />
          </li>)}</ul> : <p className="db-muted">No campaigns yet.</p>}
          {team.length ? <>
            <h3 className="adm-detail-title">Team members</h3>
            <ul className="db-row-list is-plain">{team.map(t => <li key={t.id}><UserCell user={t} meta={t.withdrawCash ? 'Can withdraw funds' : 'Cannot withdraw'} /></li>)}</ul>
          </> : null}
        </> : null}
        {user.type === 'team' ? <p className="db-muted">Member of {lookups.users.get(user.parentId ?? '')?.name}’s team.</p> : null}
        <div className="db-dialog-actions is-start">
          <Button variant="soft" className="rounded-full" onClick={() => actions.setUserEnabled(user.id, !user.enabled)}>{user.enabled ? <><UserX /> Deactivate</> : <><UserCheck /> Activate</>}</Button>
          {user.suspended
            ? <Button variant="ink" onClick={() => actions.restoreUser(user.id)}><RotateCcw /> Restore</Button>
            : <Button variant="destructive" className="rounded-full" onClick={() => onSuspend(user)}><Ban /> Suspend</Button>}
          <Button variant="soft" className="rounded-full" onClick={() => { void navigator.clipboard?.writeText(user.email); }}><Mail /> Copy email</Button>
        </div>
      </> : null}
    </SheetContent>
  </Sheet>;
}

function UserEditor({ type, onClose }: { type: UserType | null; onClose: () => void }) {
  const { schools, majors, actions } = useAdmin();
  const blank = () => ({ name: '', email: '', phone: '', city: '', schoolId: schools.find(s => s.active)?.id ?? '', major: majors[0]?.name ?? '' });
  const [form, setForm] = useState(blank);
  const [error, setError] = useState('');
  useEffect(() => { if (type) { setForm(blank()); setError(''); } }, [type]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (key: keyof ReturnType<typeof blank>, value: string) => setForm(f => ({ ...f, [key]: value }));

  function save() {
    if (!type) return;
    if (form.name.trim().split(/\s+/).length < 2) return setError('Enter a first and last name.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Enter a valid email address.');
    const user: AdminUser = {
      id: uid('u'), type, name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone || '—', city: form.city || '—',
      createdAt: Date.now(), lastActive: Date.now(), enabled: true, suspended: false, vibeys: type === 'fundraiser' ? 50 : 0,
      ...(type === 'fundraiser' ? { schoolId: form.schoolId, major: form.major } : { donated: 0 }),
    };
    if (actions.saveUser(user)) onClose();
  }

  return <Dialog open={type !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>Add {type === 'guest' ? 'guest' : 'student'}</DialogTitle>
      <DialogDescription className="db-muted">They’ll get the welcome email with a link to set their password.</DialogDescription>
      <form className="db-form" onSubmit={event => { event.preventDefault(); save(); }}>
        <label className="db-field">Full name<input value={form.name} onChange={event => set('name', event.target.value)} placeholder="Avery Johnson" autoFocus /></label>
        <div className="db-field-row">
          <label className="db-field">Email<input type="email" value={form.email} onChange={event => set('email', event.target.value)} placeholder="avery@school.edu" /></label>
          <label className="db-field">Phone<input value={form.phone} onChange={event => set('phone', event.target.value)} placeholder="(555) 555-0100" /></label>
        </div>
        <label className="db-field">City<input value={form.city} onChange={event => set('city', event.target.value)} placeholder="Chicago, IL" /></label>
        {type === 'fundraiser' ? <div className="db-field-row">
          <label className="db-field">School<select value={form.schoolId} onChange={event => set('schoolId', event.target.value)}>{schools.filter(s => s.active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label className="db-field">Major<select value={form.major} onChange={event => set('major', event.target.value)}>{majors.filter(m => m.active).map(m => <option key={m.id}>{m.name}</option>)}</select></label>
        </div> : null}
        {error ? <p className="gate-error" role="alert">{error}</p> : null}
        <div className="db-dialog-actions">
          <Button type="button" variant="soft" className="rounded-full" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="ink">Add {type === 'guest' ? 'guest' : 'student'}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

type SchoolTab = 'schools' | 'admins';

export function SchoolsView({ focus }: { focus?: string | undefined }) {
  const { schools, schoolAdmins, users, lookups, actions } = useAdmin();
  const [tab, setTab] = useState<SchoolTab>('schools');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(focus ?? null);
  const [editing, setEditing] = useState<School | 'new' | null>(null);
  const [adminEdit, setAdminEdit] = useState<SchoolAdmin | 'new' | null>(null);
  const [removeAdmin, setRemoveAdmin] = useState<SchoolAdmin | null>(null);
  useEffect(() => { if (focus) setOpenId(focus); }, [focus]);
  const q = query.trim().toLowerCase();
  const studentsAt = (id: string) => users.filter(u => u.schoolId === id && u.type === 'fundraiser');

  return <section className="db-view">
    <PageHead title="Schools" subtitle="Partner universities, their students, and the admins who run each campus.">
      {tab === 'schools'
        ? <Button variant="ink" onClick={() => setEditing('new')}><Plus /> Add school</Button>
        : <Button variant="ink" onClick={() => setAdminEdit('new')}><Plus /> Invite school admin</Button>}
    </PageHead>
    <AdminTabs label="Schools" value={tab} onChange={setTab} items={[{ value: 'schools', label: `Schools ${schools.length}` }, { value: 'admins', label: `School admins ${schoolAdmins.length}` }]} />
    {tab === 'schools' ? <>
      <Toolbar><SearchBox value={query} onChange={setQuery} placeholder="Search schools" /></Toolbar>
      <div className="adm-school-grid">
        {schools.filter(s => !q || `${s.name} ${s.short} ${s.city}`.toLowerCase().includes(q)).map(s => <article key={s.id} className={cn('db-panel adm-school', !s.active && 'is-off')}>
          <div className="adm-school-band" style={{ background: `linear-gradient(120deg, ${s.colors[0]}, ${s.colors[1]})` }}>
            {s.logo ? <img src={s.logo} alt="" /> : <span>{s.short.slice(0, 2).toUpperCase()}</span>}
          </div>
          <div className="adm-school-body">
            <button type="button" className="adm-plain" onClick={() => setOpenId(s.id)}><h3>{s.name}</h3></button>
            <small><MapPin /> {s.city}</small>
            <dl className="db-mini-stats">
              <div><dt>Students</dt><dd>{(s.baseStudents + studentsAt(s.id).length).toLocaleString('en-US')}</dd></div>
              <div><dt>Admins</dt><dd>{schoolAdmins.filter(a => a.schoolId === s.id).length}</dd></div>
              <div><dt>Plan</dt><dd>{s.membership}</dd></div>
            </dl>
            <div className="adm-school-foot">
              <label className="adm-switch"><Switch checked={s.active} onCheckedChange={on => actions.setSchoolActive(s.id, on)} aria-label={`${s.name} active`} /> {s.active ? 'Active' : 'Inactive'}</label>
              <Button size="sm" variant="soft" onClick={() => setOpenId(s.id)}>Manage</Button>
            </div>
          </div>
        </article>)}
      </div>
    </> : <article className="db-panel adm-table-panel">
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Name</th><th>School</th><th>Email</th><th>Added</th><th>Active</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {schoolAdmins.map(a => <tr key={a.id}>
              <td data-label="Name"><span className="adm-user"><Face name={a.name} /><span><strong>{a.name}</strong><small>{a.title}</small></span></span></td>
              <td data-label="School">{lookups.schools.get(a.schoolId)?.short ?? '—'}</td>
              <td data-label="Email"><a className="db-link" href={`mailto:${a.email}`}>{a.email}</a></td>
              <td data-label="Added">{day(a.createdAt)}</td>
              <td data-label="Active"><Switch checked={a.active} onCheckedChange={on => actions.setSchoolAdminActive(a.id, on)} aria-label={`${a.name} active`} /></td>
              <td className="adm-col-actions"><span className="adm-row-actions">
                <button type="button" className="db-icon-btn" aria-label={`Edit ${a.name}`} onClick={() => setAdminEdit(a)}><PencilLine /></button>
                <button type="button" className="db-icon-btn" aria-label={`Remove ${a.name}`} onClick={() => setRemoveAdmin(a)}><Trash2 /></button>
              </span></td>
            </tr>)}
            {schoolAdmins.length === 0 ? <Empty>No school admins yet.</Empty> : null}
          </tbody>
        </table>
      </div>
    </article>}

    <SchoolSheet schoolId={openId} onClose={() => setOpenId(null)} onEdit={s => { setOpenId(null); setEditing(s); }} />
    <SchoolEditor value={editing} onClose={() => setEditing(null)} />
    <SchoolAdminEditor value={adminEdit} onClose={() => setAdminEdit(null)} />
    <Confirm open={removeAdmin !== null} onOpenChange={open => { if (!open) setRemoveAdmin(null); }} title={`Remove ${removeAdmin?.name ?? ''}?`} body="They lose access to the school dashboard right away." confirmLabel="Remove" onConfirm={() => { if (removeAdmin) actions.deleteSchoolAdmin(removeAdmin.id); }} />
  </section>;
}

function SchoolSheet({ schoolId, onClose, onEdit }: { schoolId: string | null; onClose: () => void; onEdit: (s: School) => void }) {
  const { schools, users, suggestions, schoolAdmins, lookups } = useAdmin();
  const school = schools.find(s => s.id === schoolId);
  const [summary, setSummary] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  useEffect(() => { setSummary(null); }, [schoolId]);
  if (!school) return <Sheet open={false}><SheetContent side="right" className="db-sheet"><SheetTitle className="sr-only">School</SheetTitle><SheetDescription className="sr-only">Closed</SheetDescription></SheetContent></Sheet>;
  const students = users.filter(u => u.schoolId === school.id && u.type === 'fundraiser');
  const ideas = suggestions.filter(s => s.schoolId === school.id);

  function exportStudents() {
    downloadCsv(`${school!.short.toLowerCase().replace(/\W+/g, '-')}-students.csv`, ['Name', 'Email', 'Phone', 'Major', 'Joined', 'Status'],
      students.map(u => [u.name, u.email, u.phone, u.major ?? '', day(u.createdAt), u.suspended ? 'Suspended' : u.enabled ? 'Active' : 'Inactive']));
  }

  function generate() {
    setThinking(true);
    window.setTimeout(() => { setSummary(summarize(ideas.map(i => i.text))); setThinking(false); }, 900);
  }

  return <Sheet open onOpenChange={open => { if (!open) onClose(); }}>
    <SheetContent side="right" className="db-sheet adm-detail">
      <div className="adm-school-band is-sheet" style={{ background: `linear-gradient(120deg, ${school.colors[0]}, ${school.colors[1]})` }}>
        {school.logo ? <img src={school.logo} alt="" /> : <span>{school.short.slice(0, 2).toUpperCase()}</span>}
      </div>
      <div className="adm-detail-head">
        <Pill tone={school.membership === 'Active' ? 'mint' : school.membership === 'Trial' ? 'sun' : 'rose'}>{school.membership} membership</Pill>
        <SheetTitle>{school.name}</SheetTitle>
        <SheetDescription>{school.city} · DUNS {school.duns}</SheetDescription>
      </div>
      <div className="db-dialog-actions is-start">
        <Button variant="soft" className="rounded-full" onClick={() => onEdit(school)}><PencilLine /> Edit details</Button>
        <Button variant="soft" className="rounded-full" onClick={exportStudents}><Download /> Download students</Button>
      </div>
      <h3 className="adm-detail-title">School admins</h3>
      {schoolAdmins.filter(a => a.schoolId === school.id).map(a => <p key={a.id} className="adm-user"><Face name={a.name} /><span><strong>{a.name}</strong><small>{a.title} · {a.active ? 'Active' : 'Inactive'}</small></span></p>)}
      {schoolAdmins.every(a => a.schoolId !== school.id) ? <p className="db-muted">No admin assigned yet.</p> : null}
      <h3 className="adm-detail-title">Registered students on ByeUni ({students.length})</h3>
      {students.length ? <ul className="db-row-list is-plain">{students.map(u => <li key={u.id}><UserCell user={u} meta={u.major} /><UserStatus user={u} /></li>)}</ul> : <p className="db-muted">No students registered yet.</p>}
      <h3 className="adm-detail-title">Student suggestions ({ideas.length})</h3>
      {ideas.length ? <>
        <ul className="adm-suggestions">{ideas.map(i => <li key={i.id}><p>“{i.text}”</p><small>{lookups.users.get(i.userId)?.name} · {agoText(i.at)}</small></li>)}</ul>
        <Button variant="ink" onClick={generate} disabled={thinking}><Wand2 /> {thinking ? 'Summarizing…' : 'Generate summary'}</Button>
        {summary ? <p className="adm-callout is-sky"><Sparkles /> {summary}</p> : null}
      </> : <p className="db-muted">No suggestions yet.</p>}
    </SheetContent>
  </Sheet>;
}

function SchoolEditor({ value, onClose }: { value: School | 'new' | null; onClose: () => void }) {
  const { actions } = useAdmin();
  const blank = (): School => ({ id: uid('sch'), name: '', short: '', city: '', colors: ['#0F7A56', '#22D497'], duns: '', membership: 'Trial', active: true, baseStudents: 0, createdAt: Date.now() });
  const [draft, setDraft] = useState<School>(blank);
  const [error, setError] = useState('');
  const picker = usePhotoPicker(([image]) => { if (image) setDraft(d => ({ ...d, logo: image })); });
  useEffect(() => { if (value) { setDraft(value === 'new' ? blank() : value); setError(''); } }, [value]);
  const set = <K extends keyof School>(key: K, v: School[K]) => setDraft(d => ({ ...d, [key]: v }));

  function save() {
    if (!draft.name.trim()) return setError('Enter the school name.');
    actions.saveSchool({ ...draft, name: draft.name.trim(), short: draft.short.trim() || draft.name.trim().split(' ').map(w => w[0]).join('') });
    onClose();
  }

  return <Dialog open={value !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>{value === 'new' ? 'Add school' : 'University details'}</DialogTitle>
      <DialogDescription className="db-muted">Colors and logo appear on the school’s page and student profiles.</DialogDescription>
      <form className="db-form" onSubmit={event => { event.preventDefault(); save(); }}>
        <div className="adm-logo-row">
          <button type="button" className="adm-school-band is-pick" style={{ background: `linear-gradient(120deg, ${draft.colors[0]}, ${draft.colors[1]})` }} onClick={picker.open}>
            {draft.logo ? <img src={draft.logo} alt="" /> : <span><ImagePlus /></span>}
          </button>
          {picker.element}
          <label className="db-field">Color 1<input type="color" value={draft.colors[0]} onChange={event => set('colors', [event.target.value, draft.colors[1]])} /></label>
          <label className="db-field">Color 2<input type="color" value={draft.colors[1]} onChange={event => set('colors', [draft.colors[0], event.target.value])} /></label>
        </div>
        <label className="db-field">School name<input value={draft.name} onChange={event => set('name', event.target.value)} placeholder="University of Chicago" autoFocus /></label>
        <div className="db-field-row">
          <label className="db-field">Short name<input value={draft.short} onChange={event => set('short', event.target.value)} placeholder="UChicago" /></label>
          <label className="db-field">City, state<input value={draft.city} onChange={event => set('city', event.target.value)} placeholder="Chicago, IL" /></label>
        </div>
        <div className="db-field-row">
          <label className="db-field">DUNS number<input value={draft.duns} onChange={event => set('duns', event.target.value)} placeholder="00-000-0000" /></label>
          <label className="db-field">Membership<select value={draft.membership} onChange={event => set('membership', event.target.value as Membership)}><option>Active</option><option>Trial</option><option>Expired</option></select></label>
        </div>
        <label className="adm-switch"><Switch checked={draft.active} onCheckedChange={on => set('active', on)} /> School is active</label>
        {error ? <p className="gate-error" role="alert">{error}</p> : null}
        <div className="db-dialog-actions">
          <Button type="button" variant="soft" className="rounded-full" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="ink">Save</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

function SchoolAdminEditor({ value, onClose }: { value: SchoolAdmin | 'new' | null; onClose: () => void }) {
  const { schools, actions } = useAdmin();
  const blank = (): SchoolAdmin => ({ id: uid('sa'), name: '', title: '', email: '', schoolId: schools[0]?.id ?? '', createdAt: Date.now(), active: true });
  const [draft, setDraft] = useState<SchoolAdmin>(blank);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (value) { setDraft(value === 'new' ? blank() : value); setPassword(value === 'new' ? `Byu-${Math.random().toString(36).slice(2, 8)}!` : ''); setError(''); }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = <K extends keyof SchoolAdmin>(key: K, v: SchoolAdmin[K]) => setDraft(d => ({ ...d, [key]: v }));

  function save() {
    if (!draft.name.trim()) return setError('Enter their name.');
    if (!/^\S+@\S+\.\S+$/.test(draft.email)) return setError('Enter a valid email address.');
    if (value === 'new' && password.length < 6) return setError('The temporary password needs at least 6 characters.');
    actions.saveSchoolAdmin({ ...draft, name: draft.name.trim(), email: draft.email.trim().toLowerCase() });
    onClose();
  }

  return <Dialog open={value !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>{value === 'new' ? 'Invite school admin' : 'Edit school admin'}</DialogTitle>
      <DialogDescription className="db-muted">School admins see their own campus: students, suggestions, forums, and campaigns.</DialogDescription>
      <form className="db-form" onSubmit={event => { event.preventDefault(); save(); }}>
        <div className="db-field-row">
          <label className="db-field">Full name<input value={draft.name} onChange={event => set('name', event.target.value)} placeholder="Laura Chen" autoFocus /></label>
          <label className="db-field">Title<input value={draft.title} onChange={event => set('title', event.target.value)} placeholder="Director of Student Affairs" /></label>
        </div>
        <label className="db-field">Work email<input type="email" value={draft.email} onChange={event => set('email', event.target.value)} placeholder="name@school.edu" /></label>
        <label className="db-field">School<select value={draft.schoolId} onChange={event => set('schoolId', event.target.value)}>{schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        {value === 'new' ? <label className="db-field"><span className="adm-inline-label"><KeyRound /> Temporary password</span><input value={password} onChange={event => setPassword(event.target.value)} /><small className="db-count">Sent in the invitation. They’ll be asked to change it.</small></label> : null}
        {error ? <p className="gate-error" role="alert">{error}</p> : null}
        <div className="db-dialog-actions">
          <Button type="button" variant="soft" className="rounded-full" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="ink"><Users /> {value === 'new' ? 'Send invite' : 'Save'}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}
