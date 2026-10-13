import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  BadgeCheck, Camera, ChevronRight, CircleDollarSign, Download, Eye, EyeOff, ExternalLink, FileUp, HandCoins, HandHeart, KeyRound, Loader2,
  Lock, Mail, MoreHorizontal, PauseCircle, Pencil, Plus, Repeat, Send, ShieldCheck, Trash2, Upload, UserPlus, Users, Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Dropdown } from '@/components/ui/dropdown';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  AdminTabs, Check, Confirm, Empty, ExportButton, Face, Pill, SearchBox, Stat, Toolbar, day, dollars, downloadCsv, usePager, useSelection,
} from '@/components/admin/ui';
import {
  SITE_FEE, feesFor, googleContacts, majors, me, seedPaymentsReceived, type Account, type Contact,
} from '@/content/dashboard-data';
import { REAL_LOGIN_URL, signOutDemo } from '@/lib/demo-session';
import { cn } from '@/lib/utils';
import { Avatar, ViewLink, usePhotoPicker, type AccountTab } from './shared';
import { isEmail, useDashboard, type ContactInput, type PasswordChange } from './store';

const DAY = 86_400_000;

/** Accounts Center sections, shown inside the Settings panel. */
export function AccountPanel({ tab }: { tab: AccountTab }) {
  return <div className="ac-content">
    {tab === 'details' ? <DetailsTab /> : null}
    {tab === 'security' ? <SecurityTab /> : null}
    {tab === 'contacts' ? <ContactsTab /> : null}
    {tab === 'paypal' ? <PaypalTab /> : null}
    {tab === 'payments' ? <PaymentsTab /> : null}
  </div>;
}

function Card({ title, note, children, className }: { title: string; note?: string; children: ReactNode; className?: string }) {
  return <section className={cn('db-panel ac-card', className)}>
    <header><h2>{title}</h2>{note ? <p>{note}</p> : null}</header>
    {children}
  </section>;
}

/* ---------------- My Profile (fundraisers/profile/profile.php) ---------------- */

const blankPassword: PasswordChange = { current: '', next: '', confirm: '' };

function strength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-z0-9]/i.test(password)) score += 1;
  return Math.min(4, score);
}
const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

function DetailsTab() {
  const { account, actions } = useDashboard();
  const [draft, setDraft] = useState<Account>(account);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState<{ code: string; value: string } | null>(null);
  const picker = usePhotoPicker(([image]) => { if (image) actions.setPhoto(image); });
  useEffect(() => { setDraft(account); }, [account]);

  const dirty = JSON.stringify({ ...draft, photo: '' }) !== JSON.stringify({ ...account, photo: '' });
  const emailChanged = draft.email.trim().toLowerCase() !== account.email.toLowerCase();
  const choose = (key: keyof Account) => (value: string) => { setDraft(d => ({ ...d, [key]: value })); setError(''); };
  const set = (key: keyof Account) => (event: { target: { value: string } }) => choose(key)(event.target.value);

  function save(event?: FormEvent) {
    event?.preventDefault();
    if (emailChanged && !otp) {
      if (!isEmail(draft.email)) { setError('Enter a valid email address.'); return; }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setOtp({ code, value: '' });
      toast('Verification code sent', { description: `Demo code: ${code}. On byeuni.com it arrives at ${draft.email.trim()}.`, duration: 12000 });
      return;
    }
    setError(actions.saveAccount(draft) ?? '');
  }

  function verify(value: string) {
    if (!otp) return;
    setOtp({ ...otp, value });
    if (value.length < 6) return;
    if (value !== otp.code) { toast.error('That code doesn’t match. Check the latest one.'); return; }
    setError(actions.saveAccount(draft) ?? '');
    setOtp(null);
  }

  return <form className="ac-stack" onSubmit={save} noValidate>
    <Card title="Profile photo" note="Shown on your posts, CVision, and messages.">
      <div className="ac-photo">
        <button type="button" className="ac-photo-btn" onClick={picker.open} aria-label="Change profile photo">
          <Avatar person={me} size={84} />
          <span><Camera /></span>
        </button>
        <div>
          <Button type="button" variant="soft" size="sm" onClick={picker.open}><Upload /> Upload new photo</Button>
          {account.photo ? <Button type="button" variant="ghost" size="sm" onClick={() => actions.setPhoto('')}>Use default</Button> : null}
          <small>JPG or PNG. We resize it for you.</small>
        </div>
        {picker.element}
      </div>
    </Card>

    <Card title="Personal details">
      <div className="ac-grid">
        <label className="db-field">First name<input value={draft.firstName} maxLength={50} onChange={set('firstName')} autoComplete="given-name" required /></label>
        <label className="db-field">Last name<input value={draft.lastName} maxLength={50} onChange={set('lastName')} autoComplete="family-name" required /></label>
        <label className="db-field ac-span">Username
          <span className="ac-prefixed"><em>byeuni.com/</em><input value={draft.username} maxLength={30} onChange={set('username')} autoComplete="username" /></span>
        </label>
        <label className="db-field">Email
          <span className="ac-suffixed">
            <input type="email" value={draft.email} onChange={set('email')} autoComplete="email" />
            {emailChanged ? <Pill tone="sun">Needs code</Pill> : <Pill tone="mint"><BadgeCheck /> Verified</Pill>}
          </span>
        </label>
        <label className="db-field">Phone<input type="tel" value={draft.phone} onChange={set('phone')} autoComplete="tel" placeholder="(650) 555-0101" /></label>
        <label className="db-field">ZIP code<input inputMode="numeric" value={draft.zip} maxLength={5} onChange={set('zip')} autoComplete="postal-code" /></label>
      </div>
    </Card>

    <Card title="School" note="Your school admin sees your name, major, and class year.">
      <div className="ac-grid">
        <label className="db-field ac-span">School
          <span className="ac-suffixed"><input value={draft.school} readOnly aria-readonly="true" /><Pill tone="muted"><Lock /> Locked</Pill></span>
          <small className="ac-help">Switching schools needs a new school email. <a className="db-link" href="https://byeuni.com/help.php">Contact support</a></small>
        </label>
        <label className="db-field">Major<Dropdown value={draft.major} onChange={choose('major')} options={majors} /></label>
        <label className="db-field">Graduation year<Dropdown value={draft.gradYear} onChange={choose('gradYear')} options={['2026', '2027', '2028', '2029', '2030']} /></label>
      </div>
    </Card>

    <Card title="Password & security">
      <div className="ac-row">
        <div><strong>Password, deactivate, or delete</strong><small>Change your password, take a break from ByeUni, or delete your account.</small></div>
        <Button type="button" variant="soft" size="sm" asChild><ViewLink view="settings" tab="security"><ShieldCheck /> Open security <ChevronRight /></ViewLink></Button>
      </div>
    </Card>

    {error ? <p className="ac-error" role="alert">{error}</p> : null}
    <div className={cn('ac-savebar', dirty && 'is-dirty')}>
      <span>{dirty ? 'You have unsaved changes' : 'All changes saved'}</span>
      <Button type="button" variant="soft" size="sm" disabled={!dirty} onClick={() => { setDraft(account); setError(''); }}>Discard</Button>
      <Button type="submit" variant="ink" size="sm" disabled={!dirty}>Save changes</Button>
    </div>

    <Dialog open={Boolean(otp)} onOpenChange={open => { if (!open) setOtp(null); }}>
      <DialogContent className="db-dialog ac-otp">
        <DialogTitle>Verify your new email</DialogTitle>
        <DialogDescription>Enter the 6-digit code we sent to {draft.email.trim()}.</DialogDescription>
        <InputOTP maxLength={6} value={otp?.value ?? ''} onChange={verify} autoFocus>
          <InputOTPGroup>{[0, 1, 2, 3, 4, 5].map(i => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
        </InputOTP>
        <div className="db-dialog-actions">
          <Button variant="soft" type="button" onClick={() => setOtp(null)}>Cancel</Button>
          <Button variant="ghost" type="button" onClick={() => { setOtp(null); window.setTimeout(() => save(), 0); }}>Resend code</Button>
        </div>
      </DialogContent>
    </Dialog>
  </form>;
}

/* ---------------- Password & security ---------------- */

const leaveReasons = ['Taking a break', 'I have another account', 'Too many notifications', 'Privacy concerns', 'Something else'];

function SecurityTab() {
  const { account, actions } = useDashboard();
  const navigate = useNavigate();
  const [changing, setChanging] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reason, setReason] = useState(leaveReasons[0] ?? '');
  const [typed, setTyped] = useState('');
  const [deleteError, setDeleteError] = useState('');

  function signOutTo() {
    signOutDemo();
    navigate({ to: '/login', replace: true });
  }

  return <div className="ac-stack">
    <Card title="Password" note="Use at least 8 characters with a letter and a number.">
      <div className="ac-row">
        <span className="ac-row-icon"><KeyRound /></span>
        <div><strong>Sign-in password</strong><small>For {account.email}</small></div>
        <Button type="button" variant="ink" size="sm" onClick={() => setChanging(true)}><KeyRound /> Change password</Button>
      </div>
    </Card>

    <Card title="Deactivate or delete account" note="Deactivating is temporary. Deleting is permanent." className="ac-danger">
      <div className="ac-row">
        <span className="ac-row-icon"><PauseCircle /></span>
        <div><strong>Deactivate account</strong><small>Hides your profile, posts, and campaigns until you sign in again. Nothing is deleted.</small></div>
        <Button type="button" variant="soft" size="sm" onClick={() => setDeactivating(true)}>Deactivate</Button>
      </div>
      <div className="ac-row">
        <span className="ac-row-icon is-danger"><Trash2 /></span>
        <div><strong>Delete account</strong><small>Permanently removes your profile, posts, campaigns, contacts, and CVision. This can’t be undone.</small></div>
        <Button type="button" variant="destructive" size="sm" className="rounded-full" onClick={() => setDeleting(true)}><Trash2 /> Delete account</Button>
      </div>
    </Card>

    <ChangePasswordDialog open={changing} onOpenChange={setChanging} />

    <Confirm
      open={deactivating}
      onOpenChange={setDeactivating}
      tone="ink"
      title="Deactivate your account?"
      body="Your profile, posts, and campaigns will be hidden and you’ll be signed out. Sign in again any time to reactivate."
      confirmLabel="Deactivate and sign out"
      onConfirm={() => { actions.deactivateAccount(); signOutTo(); }}
    >
      <label className="db-field">Why are you leaving? (optional)
        <Dropdown value={reason} onChange={setReason} options={leaveReasons} />
      </label>
    </Confirm>

    <Confirm
      open={deleting}
      onOpenChange={open => { setDeleting(open); if (!open) { setTyped(''); setDeleteError(''); } }}
      title="Delete your account permanently?"
      body={<>This deletes your profile, posts, campaigns, contacts, and CVision. Campaigns stop taking donations, and money already sent to PayPal stays there. In this demo, it clears your demo data and signs you out.</>}
      confirmLabel="Delete my account"
      onConfirm={() => {
        if (typed.trim() !== 'DELETE') { setDeleteError('Type DELETE in capital letters to confirm.'); return false; }
        actions.deleteAccount();
        signOutTo();
        return true;
      }}
    >
      <label className="db-field">Type DELETE to confirm
        <input value={typed} onChange={event => { setTyped(event.target.value); setDeleteError(''); }} autoComplete="off" autoCapitalize="characters" spellCheck={false} />
      </label>
      {deleteError ? <p className="ac-error" role="alert">{deleteError}</p> : null}
    </Confirm>
  </div>;
}

function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { actions } = useDashboard();
  const [password, setPassword] = useState<PasswordChange>(blankPassword);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (!open) { setPassword(blankPassword); setShow(false); setError(''); } }, [open]);

  const setPw = (key: keyof PasswordChange) => (event: { target: { value: string } }) => { setPassword(p => ({ ...p, [key]: event.target.value })); setError(''); };
  const score = strength(password.next);

  function submit(event: FormEvent) {
    event.preventDefault();
    const result = actions.changePassword(password);
    if (result) setError(result);
    else onOpenChange(false);
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="db-dialog">
      <DialogTitle>Change password</DialogTitle>
      <DialogDescription>Use at least 8 characters with a letter and a number.</DialogDescription>
      <form className="db-form" onSubmit={submit} noValidate>
        <label className="db-field">Current password<input type={show ? 'text' : 'password'} value={password.current} onChange={setPw('current')} autoComplete="current-password" autoFocus /></label>
        <label className="db-field">New password<input type={show ? 'text' : 'password'} value={password.next} onChange={setPw('next')} autoComplete="new-password" /></label>
        <label className="db-field">Confirm new password<input type={show ? 'text' : 'password'} value={password.confirm} onChange={setPw('confirm')} autoComplete="new-password" /></label>
        <div className="ac-pw-foot">
          {password.next ? <div className={cn('ac-strength', `is-${score}`)} aria-live="polite"><span><i /><i /><i /><i /></span>{strengthLabel[score]}</div> : <span />}
          <button type="button" className="db-link-muted" onClick={() => setShow(v => !v)}>{show ? <><EyeOff /> Hide</> : <><Eye /> Show</>} passwords</button>
        </div>
        {error ? <p className="ac-error" role="alert">{error}</p> : null}
        <a className="db-link" href={REAL_LOGIN_URL.student}>Forgot your password? Reset it on byeuni.com</a>
        <div className="db-dialog-actions">
          <Button variant="soft" type="button" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="ink" type="submit" disabled={!password.current || !password.next || !password.confirm}>Update password</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

/* ---------------- My Contacts (fundraisers/contacts/list-contacts.php) ---------------- */

type ContactFilter = 'all' | 'new' | 'invited' | 'joined';
const blankContact: ContactInput = { name: '', email: '', phone: '', note: '' };

function contactStatus(contact: Contact) {
  if (contact.joined) return <Pill tone="mint"><BadgeCheck /> On ByeUni</Pill>;
  if (contact.invitedAt) return <span className="adm-stack"><Pill tone="sky">{contact.invitedTo === 'campaign' ? 'Campaign invite' : 'Invited'}</Pill><small className="adm-sub">{day(contact.invitedAt)}</small></span>;
  return <Pill tone="muted">Not invited</Pill>;
}

function parseCsv(text: string): ContactInput[] {
  const rows = text.split(/\r?\n/).map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))).filter(row => row.some(Boolean));
  const head = (rows[0] ?? []).map(cell => cell.toLowerCase());
  const hasHeader = head.includes('email');
  const col = (name: string, fallback: number) => (hasHeader ? head.indexOf(name) : fallback);
  const [n, e, p, note] = [col('name', 0), col('email', 1), col('phone', 2), col('note', 3)];
  return rows.slice(hasHeader ? 1 : 0).map(row => ({ name: row[n] ?? '', email: row[e] ?? '', phone: p >= 0 ? row[p] ?? '' : '', note: note >= 0 ? row[note] ?? '' : '' }));
}

function ContactsTab() {
  const { contacts, actions } = useDashboard();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ContactFilter>('all');
  const [editing, setEditing] = useState<Contact | 'new' | null>(null);
  const [inviting, setInviting] = useState<string[] | null>(null);
  const [removing, setRemoving] = useState<string[] | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const shown = contacts.filter(c => {
    if (filter === 'new' && (c.invitedAt || c.joined)) return false;
    if (filter === 'invited' && (!c.invitedAt || c.joined)) return false;
    if (filter === 'joined' && !c.joined) return false;
    return !q || `${c.name} ${c.email} ${c.phone} ${c.note ?? ''}`.toLowerCase().includes(q);
  });
  const selection = useSelection(shown.map(c => c.id));
  const { rows, pager } = usePager(shown, 8);
  const invited = contacts.filter(c => c.invitedAt && !c.joined).length;
  const joined = contacts.filter(c => c.joined).length;

  function importGoogle() {
    setImporting(true);
    window.setTimeout(() => {
      actions.importContacts(googleContacts.map(c => ({ ...c, note: c.note ?? '' })), 'Google');
      setImporting(false);
    }, 900);
  }

  async function uploadCsv(file: File | undefined) {
    if (!file) return;
    if (file.size > 512_000) { toast.error('CSV files need to be under 500 KB.'); return; }
    const list = parseCsv(await file.text());
    if (!list.length) { toast.error('We couldn’t find any rows in that file.'); return; }
    actions.importContacts(list, 'CSV');
  }

  return <div className="ac-stack">
    <div className="ac-tiles">
      <Stat icon={Users} label="Contacts" value={String(contacts.length)} />
      <Stat icon={Send} label="Invited" value={String(invited)} tone="sky" />
      <Stat icon={BadgeCheck} label="Joined ByeUni" value={String(joined)} tone="sun" />
    </div>

    <section className="db-panel adm-table-panel">
      <Toolbar>
        <SearchBox value={query} onChange={setQuery} placeholder="Search contacts" />
        <div className="db-filter-row">
          {([['all', 'All'], ['new', 'Not invited'], ['invited', 'Invited'], ['joined', 'On ByeUni']] as const).map(([value, label]) => <button key={value} type="button" className="db-chip" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
        </div>
        <span className="ac-grow" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="soft" className="rounded-full" disabled={importing}>{importing ? <Loader2 className="animate-spin" /> : <FileUp />} Import</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="db-menu">
            <DropdownMenuItem onSelect={() => fileInput.current?.click()}><Upload />Upload a CSV file</DropdownMenuItem>
            <DropdownMenuItem onSelect={importGoogle}><Mail />Import Google contacts</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => downloadCsv('byeuni-contacts-template.csv', ['name', 'email', 'phone', 'note'], [['Jordan Lee', 'jordan.lee@berkeley.edu', '(510) 555-0144', 'Lab partner']])}><Download />Download CSV template</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={event => { void uploadCsv(event.target.files?.[0]); event.target.value = ''; }} />
        <Button variant="ink" className="rounded-full" onClick={() => setEditing('new')}><Plus /> Add contact</Button>
      </Toolbar>
      {selection.selected.length ? <div className="ac-bulk">
        <strong>{selection.selected.length} selected</strong>
        <Button variant="ink" size="sm" onClick={() => setInviting(selection.selected)}><Send /> Send invite</Button>
        <Button variant="soft" size="sm" onClick={() => setRemoving(selection.selected)}><Trash2 /> Remove</Button>
        <button type="button" className="db-link-muted" onClick={selection.clear}>Clear</button>
      </div> : null}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr>
            <th className="adm-col-check"><Check checked={selection.all} onChange={selection.toggleAll} label="Select all contacts" /></th>
            <th>Name</th><th>Email</th><th>Phone</th><th>Source</th><th>Status</th><th className="adm-col-actions"><span className="sr-only">Actions</span></th>
          </tr></thead>
          <tbody>
            {rows.map(c => <tr key={c.id} className={cn(selection.has(c.id) && 'is-selected')}>
              <td className="adm-col-check"><Check checked={selection.has(c.id)} onChange={on => selection.toggle(c.id, on)} label={`Select ${c.name}`} /></td>
              <td data-label="Name"><span className="adm-user"><Face name={c.name} /><span><strong>{c.name}</strong><small>{c.note || `Added ${day(c.addedAt)}`}</small></span></span></td>
              <td data-label="Email"><span className="adm-clip">{c.email}</span></td>
              <td data-label="Phone">{c.phone || '—'}</td>
              <td data-label="Source"><Pill tone={c.source === 'Google' ? 'sky' : c.source === 'CSV' ? 'sun' : 'muted'}>{c.source}</Pill></td>
              <td data-label="Status">{contactStatus(c)}</td>
              <td className="adm-col-actions">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><button type="button" className="db-icon-btn" aria-label={`Actions for ${c.name}`}><MoreHorizontal /></button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="db-menu">
                    <DropdownMenuItem onSelect={() => setEditing(c)}><Pencil />Edit contact</DropdownMenuItem>
                    {!c.joined ? <DropdownMenuItem onSelect={() => setInviting([c.id])}><Send />{c.invitedAt ? 'Resend invite' : 'Send invite'}</DropdownMenuItem> : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onSelect={() => setRemoving([c.id])}><Trash2 />Remove</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>)}
            {rows.length === 0 ? <Empty>{contacts.length ? 'No contacts match.' : 'No contacts yet. Add one or import a CSV.'}</Empty> : null}
          </tbody>
        </table>
      </div>
      {pager}
    </section>

    <ContactDialog contact={editing} onClose={() => setEditing(null)} />
    <InviteChoice ids={inviting} onClose={() => { setInviting(null); selection.clear(); }} />
    <Confirm
      open={Boolean(removing)}
      onOpenChange={open => { if (!open) setRemoving(null); }}
      title={removing && removing.length > 1 ? `Remove ${removing.length} contacts?` : 'Remove this contact?'}
      body="They stay on ByeUni if they’ve joined. You just won’t see them in your contacts or invite lists."
      confirmLabel="Remove"
      onConfirm={() => { if (removing) actions.removeContacts(removing); selection.clear(); }}
    />
  </div>;
}

function ContactDialog({ contact, onClose }: { contact: Contact | 'new' | null; onClose: () => void }) {
  const { actions } = useDashboard();
  const [form, setForm] = useState<ContactInput>(blankContact);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!contact) return;
    setForm(contact === 'new' ? blankContact : { name: contact.name, email: contact.email, phone: contact.phone, note: contact.note ?? '' });
    setError('');
  }, [contact]);
  const set = (key: keyof ContactInput) => (event: { target: { value: string } }) => { setForm(f => ({ ...f, [key]: event.target.value })); setError(''); };

  return <Dialog open={Boolean(contact)} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>{contact === 'new' ? 'Add a contact' : 'Edit contact'}</DialogTitle>
      <DialogDescription>Family, mentors, and friends you might invite to ByeUni or your campaigns.</DialogDescription>
      <form className="db-form" noValidate onSubmit={event => {
        event.preventDefault();
        const result = contact === 'new' ? actions.addContact(form) : contact ? actions.editContact(contact.id, form) : null;
        if (result) setError(result); else onClose();
      }}>
        <label className="db-field">Full name<input value={form.name} maxLength={80} onChange={set('name')} autoFocus /></label>
        <div className="db-field-row">
          <label className="db-field">Email<input type="email" value={form.email} onChange={set('email')} /></label>
          <label className="db-field">Phone <small>optional</small><input type="tel" value={form.phone} onChange={set('phone')} /></label>
        </div>
        <label className="db-field">Note <small>optional</small><input value={form.note} maxLength={60} onChange={set('note')} placeholder="e.g. Aunt, research mentor" /></label>
        {error ? <p className="ac-error" role="alert">{error}</p> : null}
        <div className="db-dialog-actions">
          <Button variant="soft" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="ink" type="submit">{contact === 'new' ? 'Add contact' : 'Save'}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

function InviteChoice({ ids, onClose }: { ids: string[] | null; onClose: () => void }) {
  const { contacts, campaigns, actions } = useDashboard();
  const mine = campaigns.find(c => c.ownerId === 'me');
  const chosen = contacts.filter(c => ids?.includes(c.id) && !c.joined);
  return <Dialog open={Boolean(ids)} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog">
      <DialogTitle>Invite {chosen.length === 1 ? chosen[0]?.name.split(' ')[0] : `${chosen.length} contacts`}</DialogTitle>
      <DialogDescription>{chosen.length ? 'What should they get from you?' : 'Everyone you picked is already on ByeUni.'}</DialogDescription>
      {chosen.length ? <div className="ac-choices">
        <button type="button" onClick={() => { actions.inviteContacts(chosen.map(c => c.id), 'byeuni'); onClose(); }}>
          <span className="db-promo-icon is-sun"><UserPlus /></span>
          <span><strong>Join ByeUni</strong><small>A personal invite link. You earn 20 Vibeys per new invite, 50 more when they join.</small></span>
          <ChevronRight />
        </button>
        {mine ? <button type="button" onClick={() => { actions.inviteContacts(chosen.map(c => c.id), 'campaign'); onClose(); }}>
          <span className="db-promo-icon"><HandHeart /></span>
          <span><strong>Support my campaign</strong><small>{mine.title}</small></span>
          <ChevronRight />
        </button> : null}
      </div> : null}
    </DialogContent>
  </Dialog>;
}

/* ---------------- PayPal (fundraisers/paypal_connect.php) ---------------- */

function PaypalMark() {
  return <span className="ac-pp-mark" aria-label="PayPal"><b>Pay</b><i>Pal</i></span>;
}

function PaypalTab() {
  const { paypal, account, actions, campaigns } = useDashboard();
  const [email, setEmail] = useState(account.email);
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [unlinking, setUnlinking] = useState(false);
  const live = campaigns.filter(c => c.ownerId === 'me');
  const month = seedPaymentsReceived.filter(p => p.at > Date.now() - 30 * DAY);
  const gross = month.reduce((n, p) => n + p.amount, 0);
  const net = month.reduce((n, p) => n + feesFor(p.amount).net, 0);

  function link(event: FormEvent) {
    event.preventDefault();
    if (email.trim().toLowerCase() !== confirm.trim().toLowerCase()) { setError('The two emails don’t match.'); return; }
    setBusy(true);
    window.setTimeout(() => {
      const result = actions.linkPaypal(email);
      setBusy(false);
      setError(result ?? '');
    }, 1100);
  }

  if (!paypal) return <div className="ac-stack">
    <section className="db-panel ac-pp-connect">
      <div className="ac-pp-head"><PaypalMark /><Pill tone="sun">Not linked</Pill></div>
      <h2>Get donations straight to PayPal</h2>
      <p>Link your PayPal account and every donation to your campaigns lands there instantly. ByeUni never sees your bank or card details.</p>
      {live.length ? <p className="ac-warn"><HandHeart /> {live.length === 1 ? 'Your campaign can’t' : `Your ${live.length} campaigns can’t`} take donations until PayPal is linked.</p> : null}
      <form className="db-form" onSubmit={link} noValidate>
        <div className="db-field-row">
          <label className="db-field">PayPal email<input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} autoComplete="email" /></label>
          <label className="db-field">Confirm email<input type="email" value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} onPaste={e => e.preventDefault()} /></label>
        </div>
        <ul className="ac-notes">
          <li>Double-check the address. Funds sent to a wrong email can’t be pulled back.</li>
          <li>New PayPal account? Verify your email in PayPal and add a card first.</li>
        </ul>
        <label className="ac-agree"><input type="checkbox" className="adm-check" checked={agreed} onChange={e => setAgreed(e.target.checked)} /> I accept the <a className="db-link" href="https://byeuni.com/byeuni-llc-terms-of-service/">Terms of Service</a> and <a className="db-link" href="https://byeuni.com/privacy-policy-2/">Privacy Policy</a></label>
        {error ? <p className="ac-error" role="alert">{error}</p> : null}
        <Button variant="ink" type="submit" className="ac-pp-btn" disabled={!agreed || busy}>{busy ? <><Loader2 className="animate-spin" /> Connecting to PayPal…</> : 'Link with PayPal'}</Button>
      </form>
    </section>
    <PayoutSteps />
  </div>;

  return <div className="ac-stack">
    <div className="ac-pp-grid">
      <section className="ac-wallet" aria-label="Linked PayPal account">
        <div className="ac-wallet-top"><PaypalMark /><span className="ac-live"><i /> Receiving donations</span></div>
        <div className="ac-wallet-email"><small>Linked account</small><strong>{paypal.email}</strong></div>
        <div className="ac-wallet-foot"><span>Linked {day(paypal.linkedAt)}</span><span>{account.firstName} {account.lastName}</span></div>
      </section>
      <div className="ac-pp-stats">
        <Stat icon={HandCoins} label="Received, last 30 days" value={dollars(gross)} note={`${month.length} donations`} />
        <Stat icon={Wallet} label="Landed in PayPal" value={dollars(net, true)} note="After site fee and PayPal charges" tone="sky" />
      </div>
    </div>
    <section className="db-panel ac-row ac-pp-manage">
      <span className="db-promo-icon"><ShieldCheck /></span>
      <div><strong>Your money is protected</strong><small>Every payment runs over SSL through PayPal. Unlink any time if this account is closing or you want to use a different one.</small></div>
      <Button variant="soft" size="sm" onClick={() => setUnlinking(true)}>Unlink PayPal</Button>
    </section>
    <PayoutSteps />
    <Confirm
      open={unlinking}
      onOpenChange={setUnlinking}
      title="Unlink PayPal?"
      body={<>Donations to {live.length === 1 ? 'your campaign' : `your ${live.length} campaigns`} will pause until you link an account again. Money already sent to <b>{paypal.email}</b> stays there.</>}
      confirmLabel="Unlink"
      onConfirm={actions.unlinkPaypal}
    />
  </div>;
}

function PayoutSteps() {
  return <section className="db-panel ac-steps">
    <h2>How payouts work</h2>
    <ol>
      <li><span>1</span><div><strong>A supporter donates</strong><small>By card, Apple Pay, or PayPal on your campaign page.</small></div></li>
      <li><span>2</span><div><strong>Fees come off</strong><small>ByeUni keeps {SITE_FEE * 100}%; PayPal charges 2.9% + $0.30.</small></div></li>
      <li><span>3</span><div><strong>It lands in PayPal</strong><small>Instantly. Move it to your bank whenever you like.</small></div></li>
    </ol>
  </section>;
}

/* ---------------- Payments (fundraisers/paypal_payment_list.php) ---------------- */

type PayTab = 'made' | 'received' | 'autopay';

function PaymentsTab() {
  const { paymentsMade, autopays, actions } = useDashboard();
  const [tab, setTab] = useState<PayTab>('made');
  const [query, setQuery] = useState('');
  const [cancelling, setCancelling] = useState<string | null>(null);
  const q = query.trim().toLowerCase();

  const given = paymentsMade.filter(p => p.status === 'Completed').reduce((n, p) => n + p.amount, 0);
  const received = seedPaymentsReceived.reduce((n, p) => n + p.amount, 0);
  const fees = seedPaymentsReceived.reduce((n, p) => { const f = feesFor(p.amount); return n + f.site + f.merchant; }, 0);
  const monthly = autopays.filter(a => a.active).reduce((n, a) => n + (a.interval === 'Weekly' ? a.amount * 52 / 12 : a.amount), 0);

  const made = useMemo(() => paymentsMade.filter(p => !q || p.campaign.toLowerCase().includes(q)), [paymentsMade, q]);
  const got = useMemo(() => seedPaymentsReceived.filter(p => !q || `${p.campaign} ${p.donor} ${p.txn}`.toLowerCase().includes(q)), [q]);
  const auto = useMemo(() => autopays.filter(a => !q || a.campaign.toLowerCase().includes(q)), [autopays, q]);
  const madePager = usePager(made, 8);
  const gotPager = usePager(got, 8);

  function exportCsv() {
    if (tab === 'made') downloadCsv('byeuni-donations-made.csv', ['Campaign', 'Payment amount', 'Site fee', 'Merchant charges', 'Donation amount', 'Status', 'Created on'],
      made.map(p => { const f = feesFor(p.amount); return [p.campaign, p.amount, f.site, f.merchant, f.net, p.status, day(p.at)]; }));
    else if (tab === 'received') downloadCsv('byeuni-donations-received.csv', ['Campaign', 'Transaction ID', 'Amount received', 'Donor', 'Date'], got.map(p => [p.campaign, p.txn, p.amount, p.donor, day(p.at)]));
    else downloadCsv('byeuni-autopays.csv', ['Campaign', 'Interval', 'Status', 'Amount', 'Next payment', 'Created'], auto.map(a => [a.campaign, a.interval, a.active ? 'Active' : 'Cancelled', a.amount, a.active ? day(a.next) : '', day(a.createdAt)]));
  }

  const cancelTarget = autopays.find(a => a.id === cancelling);

  return <div className="ac-stack">
    <div className="ac-tiles is-4">
      <Stat icon={HandHeart} label="You’ve given" value={dollars(given)} note={`${paymentsMade.filter(p => p.status === 'Completed').length} donations`} />
      <Stat icon={HandCoins} label="You’ve received" value={dollars(received)} note={`${seedPaymentsReceived.length} supporters`} tone="sky" />
      <Stat icon={CircleDollarSign} label="Fees on received" value={dollars(fees, true)} note="Site fee + PayPal" tone="sun" />
      <Stat icon={Repeat} label="Autopays" value={`${dollars(monthly)}/mo`} note={`${autopays.filter(a => a.active).length} active`} tone="rose" />
    </div>
    <AdminTabs label="Payment type" value={tab} onChange={value => { setTab(value); setQuery(''); }} items={[
      { value: 'made', label: 'Donations made', count: undefined },
      { value: 'received', label: 'Donations received' },
      { value: 'autopay', label: 'Autopays' },
    ]} />
    <section className="db-panel adm-table-panel">
      <Toolbar>
        <SearchBox value={query} onChange={setQuery} placeholder={tab === 'received' ? 'Search campaign, donor, or ID' : 'Search by campaign'} />
        <span className="ac-grow" />
        <ExportButton onClick={exportCsv} />
      </Toolbar>
      <div className="adm-table-wrap">
        {tab === 'made' ? <table className="adm-table">
          <thead><tr><th>Campaign</th><th className="adm-num">Payment</th><th className="adm-num">Site fee</th><th className="adm-num">Merchant</th><th className="adm-num">To student</th><th>Status</th><th>Created on</th></tr></thead>
          <tbody>
            {madePager.rows.map(p => {
              const f = feesFor(p.amount);
              return <tr key={p.id}>
                <td data-label="Campaign"><span className="ac-campaign">{p.campaign}</span></td>
                <td data-label="Payment" className="adm-num"><b>{dollars(p.amount, true)}</b></td>
                <td data-label="Site fee" className="adm-num">{dollars(f.site, true)}</td>
                <td data-label="Merchant" className="adm-num">{dollars(f.merchant, true)}</td>
                <td data-label="To student" className="adm-num">{dollars(f.net, true)}</td>
                <td data-label="Status"><Pill tone={p.status === 'Completed' ? 'mint' : p.status === 'Refunded' ? 'rose' : 'sun'}>{p.status}</Pill></td>
                <td data-label="Created on">{day(p.at)}</td>
              </tr>;
            })}
            {made.length === 0 ? <Empty>No donations match.</Empty> : null}
          </tbody>
        </table> : null}
        {tab === 'received' ? <table className="adm-table">
          <thead><tr><th>Donor</th><th>Campaign</th><th>Transaction ID</th><th className="adm-num">Amount</th><th>Date</th></tr></thead>
          <tbody>
            {gotPager.rows.map(p => <tr key={p.id}>
              <td data-label="Donor"><span className="adm-user"><Face name={p.donor} /><span><strong>{p.donor}</strong></span></span></td>
              <td data-label="Campaign"><span className="ac-campaign">{p.campaign}</span></td>
              <td data-label="Transaction ID"><code className="ac-code">{p.txn}</code></td>
              <td data-label="Amount" className="adm-num"><b>{dollars(p.amount, true)}</b></td>
              <td data-label="Date">{day(p.at)}</td>
            </tr>)}
            {got.length === 0 ? <Empty>No donations match.</Empty> : null}
          </tbody>
        </table> : null}
        {tab === 'autopay' ? <table className="adm-table">
          <thead><tr><th>Campaign</th><th>Interval</th><th>Status</th><th className="adm-num">Amount</th><th>Next payment</th><th>Created</th><th className="adm-col-actions"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {auto.map(a => <tr key={a.id} className={cn(!a.active && 'is-muted')}>
              <td data-label="Campaign"><span className="ac-campaign">{a.campaign}</span></td>
              <td data-label="Interval">{a.interval}</td>
              <td data-label="Status"><Pill tone={a.active ? 'mint' : 'muted'}>{a.active ? 'Active' : 'Cancelled'}</Pill></td>
              <td data-label="Amount" className="adm-num"><b>{dollars(a.amount)}</b></td>
              <td data-label="Next payment">{a.active ? day(a.next) : '—'}</td>
              <td data-label="Created">{day(a.createdAt)}</td>
              <td className="adm-col-actions">{a.active
                ? <Button variant="soft" size="sm" onClick={() => setCancelling(a.id)}>Cancel</Button>
                : <Button variant="soft" size="sm" onClick={() => actions.setAutopay(a.id, true)}>Resume</Button>}</td>
            </tr>)}
            {auto.length === 0 ? <Empty>No autopays match.</Empty> : null}
          </tbody>
        </table> : null}
      </div>
      {tab === 'made' ? madePager.pager : tab === 'received' ? gotPager.pager : null}
    </section>
    <Confirm
      open={Boolean(cancelTarget)}
      onOpenChange={open => { if (!open) setCancelling(null); }}
      title="Cancel this autopay?"
      body={cancelTarget ? <>Your {cancelTarget.interval.toLowerCase()} {dollars(cancelTarget.amount)} to “{cancelTarget.campaign}” stops before the next charge on {day(cancelTarget.next)}.</> : null}
      confirmLabel="Cancel autopay"
      onConfirm={() => { if (cancelTarget) actions.setAutopay(cancelTarget.id, false); }}
    />
  </div>;
}
