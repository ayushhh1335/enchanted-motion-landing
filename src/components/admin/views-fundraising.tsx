import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle, Ban, Banknote, Building2, CheckCircle2, Eye, EyeOff, Heart, ImagePlus, Landmark, MoreHorizontal, PencilLine, Plus,
  Receipt, Trash2, Users, XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dropdown } from '@/components/ui/dropdown';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { usePhotoPicker } from '@/components/dashboard/shared';
import { coverKeys, coverSrc, type AdminCampaign, type CampaignStatus, type PaymentMethod, type Withdrawal } from '@/content/admin-data';
import { cn } from '@/lib/utils';
import { campaignState, uid, useAdmin, type CampaignState } from './store';
import { CampaignPill } from './views-overview';
import {
  AdminTabs, Check, Confirm, Empty, ExportButton, PageHead, Pill, SearchBox, Stat, Toolbar, UserCell, day, dayTime, dollars,
  downloadCsv, pct, usePager, useSelection,
} from './ui';

type CampaignTab = 'all' | CampaignState;

export function CampaignsView({ focus }: { focus?: string | undefined }) {
  const { campaigns, categories, lookups, actions } = useAdmin();
  const [tab, setTab] = useState<CampaignTab>('all');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [openId, setOpenId] = useState<string | null>(focus ?? null);
  const [editing, setEditing] = useState<AdminCampaign | 'new' | null>(null);
  const [confirmIds, setConfirmIds] = useState<string[]>([]);

  useEffect(() => { if (focus) setOpenId(focus); }, [focus]);

  const counts = useMemo(() => {
    const tally: Record<CampaignTab, number> = { all: campaigns.length, active: 0, complete: 0, expired: 0, draft: 0 };
    campaigns.forEach(c => { tally[campaignState(c)] += 1; });
    return tally;
  }, [campaigns]);

  const q = query.trim().toLowerCase();
  const rows = useMemo(() => campaigns
    .filter(c => tab === 'all' || campaignState(c) === tab)
    .filter(c => category === 'all' || c.category === category)
    .filter(c => !q || `${c.title} ${lookups.users.get(c.ownerId)?.name ?? ''}`.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt - a.createdAt), [campaigns, tab, category, q, lookups]);
  const pager = usePager(rows, 8);
  const selection = useSelection(pager.rows.map(c => c.id));
  const open = campaigns.find(c => c.id === openId);

  function exportRows() {
    downloadCsv('byeuni-campaigns.csv', ['Campaign', 'Created by', 'Category', 'Start', 'End', 'Raised', 'Goal', 'Donors', 'Status'],
      rows.map(c => [c.title, lookups.users.get(c.ownerId)?.name ?? '', c.category, day(c.start), day(c.end), c.raised, c.goal, c.donors, campaignState(c)]));
  }

  return <section className="db-view">
    <PageHead title="Campaigns" subtitle="Review, publish, and moderate every fundraiser on ByeUni.">
      <ExportButton onClick={exportRows} />
      <Button variant="ink" onClick={() => setEditing('new')}><Plus /> New campaign</Button>
    </PageHead>
    <AdminTabs label="Campaign status" value={tab} onChange={value => { setTab(value); pager.reset(); }} items={[
      { value: 'all', label: `All ${counts.all}` }, { value: 'active', label: `Active ${counts.active}` }, { value: 'complete', label: `Completed ${counts.complete}` },
      { value: 'expired', label: `Expired ${counts.expired}` }, { value: 'draft', label: `Drafts ${counts.draft}` },
    ]} />
    <article className="db-panel adm-table-panel">
      <Toolbar>
        <SearchBox value={query} onChange={value => { setQuery(value); pager.reset(); }} placeholder="Search campaign or student" />
        <Dropdown variant="pill" label="Category" value={category} onChange={value => { setCategory(value); pager.reset(); }} options={[{ value: 'all', label: 'All categories' }, ...categories.map(c => c.name)]} />
        {selection.selected.length ? <Button variant="destructive" className="rounded-full ml-auto" onClick={() => setConfirmIds(selection.selected)}><Trash2 /> Delete {selection.selected.length}</Button> : null}
      </Toolbar>
      <p className="adm-note">You can only delete campaigns with no donations.</p>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr>
            <th className="adm-col-check"><Check checked={selection.all} onChange={selection.toggleAll} label="Select all campaigns on this page" /></th>
            <th>Campaign</th><th>Created by</th><th>Dates</th><th>Raised / goal</th><th>Likes</th><th>Status</th><th><span className="sr-only">Actions</span></th>
          </tr></thead>
          <tbody>
            {pager.rows.map(c => {
              const state = campaignState(c);
              const owner = lookups.users.get(c.ownerId);
              return <tr key={c.id} className={cn(selection.has(c.id) && 'is-selected')}>
                <td className="adm-col-check"><Check checked={selection.has(c.id)} onChange={on => selection.toggle(c.id, on)} label={`Select ${c.title}`} /></td>
                <td data-label="Campaign"><button type="button" className="adm-campaign-cell" onClick={() => setOpenId(c.id)}><img src={coverSrc(c.cover)} alt="" /><span><strong>{c.title}</strong><small>{c.category} · {c.visibility}</small></span></button></td>
                <td data-label="Created by"><UserCell user={owner} meta={lookups.schools.get(owner?.schoolId ?? '')?.short} /></td>
                <td data-label="Dates"><span className="adm-dates">{format(c.start, 'MMM d')} – {day(c.end)}</span></td>
                <td data-label="Raised / goal"><span className="adm-progress"><b>{dollars(c.raised)}</b> / {dollars(c.goal)}<span className="db-bar"><span style={{ width: `${pct(c.raised, c.goal)}%` }} /></span></span></td>
                <td data-label="Likes"><span className="adm-likes"><Heart /> {c.likes}</span></td>
                <td data-label="Status"><CampaignPill state={state} /></td>
                <td className="adm-col-actions"><CampaignMenu campaign={c} onView={() => setOpenId(c.id)} onEdit={() => setEditing(c)} onDelete={() => setConfirmIds([c.id])} /></td>
              </tr>;
            })}
            {rows.length === 0 ? <Empty>No campaigns match these filters.</Empty> : null}
          </tbody>
        </table>
      </div>
      {pager.pager}
    </article>

    <CampaignSheet campaign={open} onClose={() => setOpenId(null)} onEdit={c => { setOpenId(null); setEditing(c); }} />
    <CampaignEditor value={editing} onClose={() => setEditing(null)} />
    <Confirm
      open={confirmIds.length > 0}
      onOpenChange={value => { if (!value) setConfirmIds([]); }}
      title={confirmIds.length > 1 ? `Delete ${confirmIds.length} campaigns?` : 'Delete this campaign?'}
      body="Campaigns that already received donations are kept. Unpublish those instead."
      confirmLabel="Delete"
      onConfirm={() => { actions.deleteCampaigns(confirmIds); selection.clear(); }}
    />
  </section>;
}

function CampaignMenu({ campaign, onView, onEdit, onDelete }: { campaign: AdminCampaign; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const { actions } = useAdmin();
  return <DropdownMenu>
    <DropdownMenuTrigger asChild><button type="button" className="db-icon-btn" aria-label={`Actions for ${campaign.title}`}><MoreHorizontal /></button></DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="db-menu">
      <DropdownMenuItem onSelect={onView}><Eye />View details</DropdownMenuItem>
      <DropdownMenuItem onSelect={onEdit}><PencilLine />Edit</DropdownMenuItem>
      {campaign.status === 'active'
        ? <DropdownMenuItem onSelect={() => actions.setCampaignStatus(campaign.id, 'draft')}><EyeOff />Unpublish</DropdownMenuItem>
        : <DropdownMenuItem onSelect={() => actions.setCampaignStatus(campaign.id, 'active')}><CheckCircle2 />Publish</DropdownMenuItem>}
      {campaign.status !== 'complete' ? <DropdownMenuItem onSelect={() => actions.setCampaignStatus(campaign.id, 'complete')}><CheckCircle2 />Mark complete</DropdownMenuItem> : null}
      <DropdownMenuSeparator />
      <DropdownMenuItem onSelect={onDelete} className="text-destructive"><Trash2 />Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>;
}

function CampaignSheet({ campaign, onClose, onEdit }: { campaign?: AdminCampaign | undefined; onClose: () => void; onEdit: (c: AdminCampaign) => void }) {
  const { lookups, payments, withdrawals, actions } = useAdmin();
  const owner = campaign ? lookups.users.get(campaign.ownerId) : undefined;
  const gifts = campaign ? payments.filter(p => p.campaignId === campaign.id).slice(0, 5) : [];
  const payouts = campaign ? withdrawals.filter(w => w.campaignId === campaign.id) : [];
  return <Sheet open={Boolean(campaign)} onOpenChange={value => { if (!value) onClose(); }}>
    <SheetContent side="right" className="db-sheet adm-detail">
      {campaign ? <>
        <img className="adm-detail-cover" src={coverSrc(campaign.cover)} alt="" />
        <div className="adm-detail-head">
          <CampaignPill state={campaignState(campaign)} />
          <SheetTitle>{campaign.title}</SheetTitle>
          <SheetDescription>{campaign.category} · {campaign.visibility} · {format(campaign.start, 'MMM d')} – {day(campaign.end)}</SheetDescription>
        </div>
        <UserCell user={owner} meta={lookups.schools.get(owner?.schoolId ?? '')?.name} />
        <div className="adm-detail-money">
          <div className="db-money"><b>{dollars(campaign.raised)}</b> raised of {dollars(campaign.goal)}</div>
          <div className="db-bar"><span style={{ width: `${pct(campaign.raised, campaign.goal)}%` }} /></div>
          <dl className="db-mini-stats">
            <div><dt>Donors</dt><dd>{campaign.donors}</dd></div>
            <div><dt>Likes</dt><dd>{campaign.likes}</dd></div>
            <div><dt>Funded</dt><dd>{pct(campaign.raised, campaign.goal)}%</dd></div>
          </dl>
        </div>
        <p className="db-prose">{campaign.story}</p>
        <h3 className="adm-detail-title">Recent gifts</h3>
        {gifts.length ? <ul className="db-row-list is-plain">{gifts.map(g => <li key={g.id}><div><strong>{g.donor}</strong><small>{g.method} · {dayTime(g.at)}</small></div><b>{dollars(g.amount)}</b></li>)}</ul> : <p className="db-muted">No gifts yet.</p>}
        <h3 className="adm-detail-title">Withdrawals</h3>
        {payouts.length ? <ul className="db-row-list is-plain">{payouts.map(w => <li key={w.id}><div><strong>{dollars(w.amount, true)}</strong><small>{day(w.requestedAt)} · {w.requestedBy}</small></div><WithdrawalPill status={w.status} /></li>)}</ul> : <p className="db-muted">No withdrawals requested.</p>}
        <div className="db-dialog-actions is-start">
          <Button variant="soft" className="rounded-full" onClick={() => onEdit(campaign)}><PencilLine /> Edit</Button>
          {campaign.status === 'active'
            ? <Button variant="soft" className="rounded-full" onClick={() => actions.setCampaignStatus(campaign.id, 'draft')}><EyeOff /> Unpublish</Button>
            : <Button variant="ink" onClick={() => actions.setCampaignStatus(campaign.id, 'active')}><CheckCircle2 /> Publish</Button>}
        </div>
      </> : null}
    </SheetContent>
  </Sheet>;
}

const toInput = (at: number) => format(at, 'yyyy-MM-dd');
const fromInput = (value: string) => new Date(`${value}T12:00:00`).getTime();

function CampaignEditor({ value, onClose }: { value: AdminCampaign | 'new' | null; onClose: () => void }) {
  const { users, categories, actions } = useAdmin();
  const fundraisers = users.filter(u => u.type === 'fundraiser' && u.enabled && !u.suspended);
  const blank = (): AdminCampaign => ({
    id: uid('camp'), title: '', ownerId: fundraisers[0]?.id ?? '', category: categories.find(c => c.active)?.name ?? 'Other', visibility: 'Public', cover: 'campus',
    start: Date.now(), end: Date.now() + 30 * 86_400_000, goal: 1000, raised: 0, donors: 0, likes: 0, status: 'draft', createdAt: Date.now(), story: '',
  });
  const [draft, setDraft] = useState<AdminCampaign>(blank);
  const [error, setError] = useState('');
  const picker = usePhotoPicker(([image]) => { if (image) setDraft(d => ({ ...d, cover: image })); });

  useEffect(() => {
    if (value) { setDraft(value === 'new' ? blank() : value); setError(''); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const locked = value !== 'new' && value !== null && value.raised > 0;
  const set = <K extends keyof AdminCampaign>(key: K, v: AdminCampaign[K]) => setDraft(d => ({ ...d, [key]: v }));

  function save(status: CampaignStatus) {
    if (!draft.title.trim()) return setError('Add a campaign title.');
    if (!draft.ownerId) return setError('Choose the fundraiser who owns this campaign.');
    if (draft.goal < 1) return setError('The goal must be at least $1.');
    if (draft.end <= draft.start) return setError('The end date must be after the start date.');
    if (status === 'active' && draft.story.trim().length < 50) return setError('Write at least 50 characters about the journey before activating.');
    actions.saveCampaign({ ...draft, title: draft.title.trim(), status });
    onClose();
  }

  return <Dialog open={value !== null} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="db-dialog adm-dialog-wide">
      <DialogTitle>{value === 'new' ? 'New campaign' : 'Edit campaign'}</DialogTitle>
      <DialogDescription className="db-muted">{locked ? 'This campaign has donations, so the goal and start date are locked.' : 'Create a campaign on behalf of a student.'}</DialogDescription>
      <form className="db-form" onSubmit={(event: FormEvent) => { event.preventDefault(); save(draft.status === 'draft' ? 'active' : draft.status); }}>
        <button type="button" className="db-cover-pick" onClick={picker.open} style={{ backgroundImage: `url(${coverSrc(draft.cover)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <span><ImagePlus /> Upload cover photo</span>
        </button>
        {picker.element}
        <div className="adm-cover-row" role="radiogroup" aria-label="Or choose a cover">
          {coverKeys.map(key => <button key={key} type="button" role="radio" aria-checked={draft.cover === key} onClick={() => set('cover', key)}><img src={coverSrc(key)} alt={key} /></button>)}
        </div>
        <div className="db-field-row">
          <label className="db-field">Fundraiser
            <Dropdown value={draft.ownerId} onChange={value => set('ownerId', value)} options={fundraisers.map(u => ({ value: u.id, label: u.name }))} />
          </label>
          <label className="db-field">Category
            <Dropdown value={draft.category} onChange={value => set('category', value)} options={categories.filter(c => c.active || c.name === draft.category).map(c => c.name)} />
          </label>
        </div>
        <label className="db-field">Campaign title<input value={draft.title} onChange={event => set('title', event.target.value)} maxLength={90} placeholder="Fund my trip to HackMIT 2026" /></label>
        <div className="db-field-row">
          <label className="db-field">Goal (USD)<input type="number" min={1} value={draft.goal} disabled={locked} onChange={event => set('goal', Number(event.target.value))} /></label>
          <label className="db-field">Visibility
            <Dropdown<AdminCampaign['visibility']> value={draft.visibility} onChange={value => set('visibility', value)} options={['Public', 'Private']} />
          </label>
        </div>
        <div className="db-field-row">
          <label className="db-field">Start date<input type="date" value={toInput(draft.start)} disabled={locked} onChange={event => event.target.value && set('start', fromInput(event.target.value))} /></label>
          <label className="db-field">End date<input type="date" value={toInput(draft.end)} onChange={event => event.target.value && set('end', fromInput(event.target.value))} /></label>
        </div>
        <label className="db-field">Journey<textarea rows={4} value={draft.story} onChange={event => set('story', event.target.value)} placeholder="Tell donors what this campaign is for and why it matters." /><small className="db-count">{draft.story.length} characters · 50 minimum to activate</small></label>
        {error ? <p className="gate-error" role="alert">{error}</p> : null}
        <div className="db-dialog-actions">
          <Button type="button" variant="soft" className="rounded-full" onClick={() => save('draft')}>Save for later</Button>
          <Button type="button" variant="ink" onClick={() => save('active')}>Activate</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}

export function WithdrawalPill({ status }: { status: Withdrawal['status'] }) {
  return status === 'paid' ? <Pill tone="mint">Paid</Pill> : status === 'declined' ? <Pill tone="rose">Declined</Pill> : <Pill tone="sun">Pending</Pill>;
}

type WithdrawalTab = 'pending' | 'paid' | 'declined' | 'all';

export function WithdrawalsView() {
  const { withdrawals, lookups, actions } = useAdmin();
  const [tab, setTab] = useState<WithdrawalTab>('pending');
  const [query, setQuery] = useState('');
  const [bankFor, setBankFor] = useState<Withdrawal | null>(null);
  const [payFor, setPayFor] = useState<Withdrawal | null>(null);
  const [declineFor, setDeclineFor] = useState<Withdrawal | null>(null);
  const [reason, setReason] = useState('');

  const q = query.trim().toLowerCase();
  const rows = withdrawals
    .filter(w => tab === 'all' || w.status === tab)
    .filter(w => !q || `${lookups.campaigns.get(w.campaignId)?.title ?? ''} ${lookups.users.get(w.requesterId)?.name ?? ''}`.toLowerCase().includes(q))
    .sort((a, b) => b.requestedAt - a.requestedAt);
  const pending = withdrawals.filter(w => w.status === 'pending');
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

  return <section className="db-view">
    <PageHead title="Withdrawals" subtitle="Approve bank transfers after checking the account matches the fundraiser." />
    <div className="adm-stats is-mini">
      <Stat icon={Banknote} label="Waiting for review" value={dollars(pending.reduce((n, w) => n + w.amount, 0), true)} note={`${pending.length} request${pending.length === 1 ? '' : 's'}`} tone="sun" />
      <Stat icon={CheckCircle2} label="Paid this month" value={dollars(withdrawals.filter(w => w.status === 'paid' && (w.decidedAt ?? 0) >= monthStart).reduce((n, w) => n + w.amount, 0), true)} />
      <Stat icon={Receipt} label="Site fees retained" value={dollars(withdrawals.filter(w => w.status !== 'pending').reduce((n, w) => n + w.siteFee, 0), true)} tone="sky" />
    </div>
    <AdminTabs label="Withdrawal status" value={tab} onChange={setTab} items={[
      { value: 'pending', label: 'Pending', count: pending.length }, { value: 'paid', label: 'Paid' }, { value: 'declined', label: 'Declined' }, { value: 'all', label: 'All' },
    ]} />
    <article className="db-panel adm-table-panel">
      <Toolbar><SearchBox value={query} onChange={setQuery} placeholder="Search campaign or student" /></Toolbar>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Campaign</th><th>Requested by</th><th>Amount</th><th>Site fee</th><th>Requested</th><th>Status</th><th>Bank</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {rows.map(w => {
              const requester = lookups.users.get(w.requesterId);
              const campaign = lookups.campaigns.get(w.campaignId);
              const notAllowed = w.requestedBy === 'Team member' && requester?.withdrawCash === false;
              const nameMismatch = requester && w.requestedBy === 'Fundraiser' && w.bank.holder !== requester.name;
              return <tr key={w.id}>
                <td data-label="Campaign"><span className="adm-campaign-cell">{campaign ? <img src={coverSrc(campaign.cover)} alt="" /> : null}<strong>{campaign?.title ?? 'Deleted campaign'}</strong></span></td>
                <td data-label="Requested by"><UserCell user={requester} meta={<>{w.requestedBy}{notAllowed ? <span className="adm-warn"> · not allowed to withdraw</span> : null}</>} /></td>
                <td data-label="Amount"><b>{dollars(w.amount, true)}</b></td>
                <td data-label="Site fee">{dollars(w.siteFee, true)}</td>
                <td data-label="Requested">{dayTime(w.requestedAt)}</td>
                <td data-label="Status"><span className="adm-stack"><WithdrawalPill status={w.status} />{w.declineReason ? <small className="adm-reason">{w.declineReason}</small> : null}</span></td>
                <td data-label="Bank"><button type="button" className="db-link adm-bank-link" onClick={() => setBankFor(w)}><Landmark /> {w.bank.name} ••{w.bank.last4}</button>{nameMismatch ? <small className="adm-warn"><AlertTriangle /> Holder name differs</small> : null}</td>
                <td className="adm-col-actions">{w.status === 'pending' ? <span className="adm-row-actions">
                  <Button size="sm" variant="ink" onClick={() => setPayFor(w)}>Mark as paid</Button>
                  <Button size="sm" variant="soft" onClick={() => { setDeclineFor(w); setReason(''); }}>Decline</Button>
                </span> : <small className="db-muted">{w.decidedAt ? day(w.decidedAt) : ''}</small>}</td>
              </tr>;
            })}
            {rows.length === 0 ? <Empty>{tab === 'pending' ? 'No withdrawals waiting. Nice work.' : 'No withdrawals here.'}</Empty> : null}
          </tbody>
        </table>
      </div>
    </article>

    <Dialog open={bankFor !== null} onOpenChange={open => { if (!open) setBankFor(null); }}>
      <DialogContent className="db-dialog">
        <DialogTitle>Bank details</DialogTitle>
        <DialogDescription className="db-muted">Saved by the fundraiser for this payout.</DialogDescription>
        {bankFor ? <dl className="adm-defs">
          <div><dt><Building2 /> Bank</dt><dd>{bankFor.bank.name}</dd></div>
          <div><dt><Users /> Account holder</dt><dd>{bankFor.bank.holder}</dd></div>
          <div><dt><Landmark /> Account number</dt><dd>•••• •••• {bankFor.bank.last4}</dd></div>
          <div><dt><Receipt /> ABA routing</dt><dd>{bankFor.bank.routing}</dd></div>
        </dl> : null}
      </DialogContent>
    </Dialog>

    <Confirm
      open={payFor !== null}
      onOpenChange={open => { if (!open) setPayFor(null); }}
      title="Mark this withdrawal as paid?"
      tone="ink"
      confirmLabel="Mark as paid"
      body={payFor ? <>Send <b>{dollars(payFor.amount, true)}</b> to {payFor.bank.name} ••{payFor.bank.last4} ({payFor.bank.holder}) first, then confirm. The student gets the “Withdrawal accepted” email.</> : null}
      onConfirm={() => { if (payFor) actions.acceptWithdrawal(payFor.id); }}
    />
    <Confirm
      open={declineFor !== null}
      onOpenChange={open => { if (!open) setDeclineFor(null); }}
      title="Decline withdrawal"
      confirmLabel="Decline"
      body="The amount goes back to the campaign balance and the student is emailed your reason."
      onConfirm={() => declineFor ? actions.declineWithdrawal(declineFor.id, reason) : false}
    >
      <label className="db-field">Reason<textarea rows={3} value={reason} onChange={event => setReason(event.target.value)} placeholder="e.g. Account holder name does not match the fundraiser." autoFocus /></label>
      <div className="db-filter-row">
        {['Account holder name does not match the fundraiser.', 'Routing number is invalid.', 'Campaign is under review.'].map(text => <button key={text} type="button" className="db-chip" onClick={() => setReason(text)}>{text}</button>)}
      </div>
    </Confirm>
  </section>;
}

const methods: ('all' | PaymentMethod)[] = ['all', 'PayPal', 'Stripe', 'Apple Pay', 'Coinbase'];

export function PaymentsView() {
  const { payments, lookups } = useAdmin();
  const [method, setMethod] = useState<'all' | PaymentMethod>('all');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const rows = useMemo(() => payments
    .filter(p => method === 'all' || p.method === method)
    .filter(p => status === 'all' || p.status === status)
    .filter(p => !q || `${p.donor} ${p.txn} ${lookups.campaigns.get(p.campaignId)?.title ?? ''}`.toLowerCase().includes(q)), [payments, method, status, q, lookups]);
  const pager = usePager(rows, 12);
  const paid = rows.filter(p => p.status === 'paid');
  const gross = paid.reduce((n, p) => n + p.amount, 0);
  const fees = paid.reduce((n, p) => n + p.fee, 0);

  function exportRows() {
    downloadCsv('byeuni-transactions.csv', ['Date', 'Campaign', 'Fundraiser', 'Donor', 'Transaction ID', 'Payment type', 'Method', 'Total', 'Fee deducted', 'Amount paid', 'Status'],
      rows.map(p => {
        const campaign = lookups.campaigns.get(p.campaignId);
        return [format(p.at, 'yyyy-MM-dd HH:mm'), campaign?.title ?? '', lookups.users.get(campaign?.ownerId ?? '')?.name ?? '', p.donor, p.txn, p.type, p.method, p.amount.toFixed(2), p.fee.toFixed(2), (p.amount - p.fee).toFixed(2), p.status];
      }));
  }

  return <section className="db-view">
    <PageHead title="Reports" subtitle="Donation totals, fees, payment method, and the fundraiser on each gift.">
      <ExportButton onClick={exportRows} />
    </PageHead>
    <div className="adm-stats is-mini">
      <Stat icon={Receipt} label="Gross donations" value={dollars(gross, true)} note={`${paid.length} paid gifts`} />
      <Stat icon={Ban} label="Fees deducted" value={dollars(fees, true)} tone="rose" />
      <Stat icon={Banknote} label="Paid to students" value={dollars(gross - fees, true)} tone="sky" />
    </div>
    <article className="db-panel adm-table-panel">
      <Toolbar>
        <SearchBox value={query} onChange={value => { setQuery(value); pager.reset(); }} placeholder="Search donor, campaign, or transaction" />
        <div className="db-filter-row adm-chips">
          {methods.map(m => <button key={m} type="button" className="db-chip" aria-pressed={method === m} onClick={() => { setMethod(m); pager.reset(); }}>{m === 'all' ? 'All methods' : m}</button>)}
        </div>
        <Dropdown variant="pill" label="Status" value={status} onChange={value => { setStatus(value); pager.reset(); }} options={[
          { value: 'all', label: 'Any status' }, { value: 'paid', label: 'Paid' }, { value: 'processing', label: 'Processing' }, { value: 'refunded', label: 'Refunded' },
        ]} />
      </Toolbar>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Date</th><th>Donor</th><th>Campaign</th><th>Transaction ID</th><th>Type</th><th>Method</th><th className="adm-num">Total</th><th className="adm-num">Fee</th><th className="adm-num">Paid</th><th>Status</th></tr></thead>
          <tbody>
            {pager.rows.map(p => {
              const campaign = lookups.campaigns.get(p.campaignId);
              return <tr key={p.id}>
                <td data-label="Date">{dayTime(p.at)}</td>
                <td data-label="Donor"><span className="adm-stack"><strong>{p.donor}</strong>{p.recurring ? <small className="adm-sub">{p.recurring} gift</small> : null}</span></td>
                <td data-label="Campaign"><span className="adm-stack"><span className="adm-clip">{campaign?.title ?? 'Deleted campaign'}</span><small className="adm-sub">{lookups.users.get(campaign?.ownerId ?? '')?.name}</small></span></td>
                <td data-label="Transaction ID"><code className="adm-code">{p.txn}</code></td>
                <td data-label="Type">{p.type}</td>
                <td data-label="Method">{p.method}</td>
                <td data-label="Total" className="adm-num">{dollars(p.amount, true)}</td>
                <td data-label="Fee" className="adm-num">{dollars(p.fee, true)}</td>
                <td data-label="Paid" className="adm-num"><b>{dollars(p.status === 'paid' ? p.amount - p.fee : 0, true)}</b></td>
                <td data-label="Status">{p.status === 'paid' ? <Pill tone="mint">Paid</Pill> : p.status === 'processing' ? <Pill tone="sun">Processing</Pill> : <Pill tone="rose"><XCircle /> Refunded</Pill>}</td>
              </tr>;
            })}
            {rows.length === 0 ? <Empty>No transactions match these filters.</Empty> : null}
          </tbody>
        </table>
      </div>
      {pager.pager}
    </article>
  </section>;
}
