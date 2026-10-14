import { useMemo } from 'react';
import { format, startOfMonth, subMonths } from 'date-fns';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowRight, Banknote, CheckCircle2, Crown, GraduationCap, HandHeart, HeartPulse, PiggyBank, ShieldAlert, Sparkles, Users, Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PanelHead, agoText } from '@/components/dashboard/shared';
import { adminProfile, coverSrc } from '@/content/admin-data';
import { cn } from '@/lib/utils';
import { campaignState, useAdmin } from './store';
import { Pill, SectionLink, Stat, UserCell, day, dollars, pct, type Section } from './ui';

export function OverviewView() {
  const { campaigns, users, payments, withdrawals, schools, audit, counts, lookups } = useAdmin();

  const stats = useMemo(() => {
    const states = campaigns.map(campaignState);
    return {
      active: states.filter(s => s === 'active').length,
      completed: states.filter(s => s === 'complete').length,
      fundraisers: users.filter(u => u.type === 'fundraiser').length,
      raised: campaigns.reduce((n, c) => n + c.raised, 0),
      fees: payments.filter(p => p.status === 'paid').reduce((n, p) => n + p.fee, 0) + withdrawals.filter(w => w.status === 'paid').reduce((n, w) => n + w.siteFee, 0),
      paidOut: withdrawals.filter(w => w.status === 'paid').reduce((n, w) => n + w.amount, 0),
    };
  }, [campaigns, users, payments, withdrawals]);

  const chart = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const start = startOfMonth(subMonths(new Date(), 5 - i)).getTime();
    const end = startOfMonth(subMonths(new Date(), 4 - i)).getTime();
    const inMonth = payments.filter(p => p.status === 'paid' && p.at >= start && p.at < end);
    return { month: format(start, 'MMM'), amount: inMonth.reduce((n, p) => n + p.amount, 0), gifts: inMonth.length };
  }), [payments]);

  const byMethod = useMemo(() => {
    const totals = new Map<string, number>();
    payments.filter(p => p.status === 'paid').forEach(p => totals.set(p.method, (totals.get(p.method) ?? 0) + p.amount));
    const sum = [...totals.values()].reduce((a, b) => a + b, 0);
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([method, amount]) => ({ method, amount, share: pct(amount, sum) }));
  }, [payments]);

  const topSchools = useMemo(() => schools.filter(s => s.active).map(school => {
    const members = users.filter(u => u.schoolId === school.id && u.type === 'fundraiser').map(u => u.id);
    const raised = campaigns.filter(c => members.includes(c.ownerId)).reduce((n, c) => n + c.raised, 0);
    return { school, raised, students: school.baseStudents + members.length };
  }).sort((a, b) => b.raised - a.raised).slice(0, 5), [schools, users, campaigns]);

  const newest = useMemo(() => [...campaigns].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5), [campaigns]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const queue: { section: Section; label: string; count: number; icon: typeof Users; tone: 'mint' | 'sky' | 'sun' | 'rose'; note: string }[] = [
    { section: 'vibe', label: 'Wellbeing flags', count: counts.urgentFlags, icon: HeartPulse, tone: 'rose', note: 'Reach out first' },
    { section: 'withdrawals', label: 'Withdrawals to review', count: counts.withdrawals, icon: Banknote, tone: 'mint', note: dollars(withdrawals.filter(w => w.status === 'pending').reduce((n, w) => n + w.amount, 0)) + ' requested' },
    { section: 'reported', label: 'Open reports', count: counts.reports, icon: ShieldAlert, tone: 'sun', note: 'Forums, comments, users' },
    { section: 'rewards', label: 'Reward requests', count: counts.redemptions + counts.contests, icon: Sparkles, tone: 'sky', note: counts.contests ? `${counts.contests} contest needs a winner` : 'Coupons to send' },
  ];

  return <section className="db-view">
    <header className="adm-hero">
      <div>
        <small>{format(new Date(), 'EEEE, MMMM d')}</small>
        <h1>{greeting}, {adminProfile.name.split(' ')[0]}</h1>
        <p>{queue.reduce((n, q) => n + q.count, 0)} items need your attention across ByeUni today.</p>
      </div>
      <Button variant="ink" asChild className="adm-hero-cta"><SectionLink section="withdrawals">Review payouts <ArrowRight /></SectionLink></Button>
    </header>

    <div className="adm-queue">
      {queue.map(item => <SectionLink key={item.label} section={item.section} className={cn('db-panel adm-queue-item', `is-${item.tone}`, item.count === 0 && 'is-clear')}>
        <span className="adm-stat-icon"><item.icon /></span>
        <div><strong>{item.count}</strong><span>{item.label}</span><small>{item.count ? item.note : 'All clear'}</small></div>
        <ArrowRight className="adm-queue-arrow" />
      </SectionLink>)}
    </div>

    <div className="adm-stats">
      <Stat icon={HandHeart} label="Active campaigns" value={String(stats.active)} note={`${counts.drafts} draft${counts.drafts === 1 ? '' : 's'} waiting to publish`} />
      <Stat icon={Users} label="Total fundraisers" value={String(stats.fundraisers)} note={`${users.filter(u => u.type === 'guest').length} guest donors`} tone="sky" />
      <Stat icon={PiggyBank} label="Money raised" value={dollars(stats.raised)} note={`${dollars(stats.paidOut)} paid out`} tone="sun" />
      <Stat icon={CheckCircle2} label="Completed campaigns" value={String(stats.completed)} note={`${dollars(stats.fees, true)} in platform fees`} tone="rose" />
    </div>

    <div className="adm-grid-2">
      <article className="db-panel adm-chart">
        <PanelHead title="Donations, last 6 months" action={<SectionLink section="reports" className="db-link">Reports</SectionLink>} />
        <div className="adm-chart-total">
          <strong>{dollars(chart.reduce((n, m) => n + m.amount, 0))}</strong>
          <span>{chart.reduce((n, m) => n + m.gifts, 0)} gifts</span>
        </div>
        <div className="adm-chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="adm-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-bright)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--primary-bright)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--glass-line)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} tickFormatter={v => `$${v}`} width={56} />
              <Tooltip
                cursor={{ stroke: 'var(--primary)', strokeDasharray: 4 }}
                contentStyle={{ background: 'var(--glass-strong)', border: '1px solid var(--glass-border)', borderRadius: 14, backdropFilter: 'blur(16px)', fontSize: 13 }}
                formatter={(value: number, key) => key === 'amount' ? [dollars(value), 'Donated'] : [value, 'Gifts']}
              />
              <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={2.5} fill="url(#adm-fill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <ul className="adm-methods">
          {byMethod.map(m => <li key={m.method}><span>{m.method}</span><div className="db-bar"><span style={{ width: `${m.share}%` }} /></div><b>{m.share}%</b></li>)}
        </ul>
      </article>

      <article className="db-panel">
        <PanelHead title="Top schools" action={<SectionLink section="schools" className="db-link">All schools</SectionLink>} />
        <ol className="adm-rank">
          {topSchools.map(({ school, raised, students }, i) => <li key={school.id}>
            <span className="adm-rank-n">{i === 0 ? <Crown /> : i + 1}</span>
            <span className="adm-school-mark" style={{ background: `linear-gradient(135deg, ${school.colors[0]}, ${school.colors[1]})` }}>{school.short.slice(0, 2).toUpperCase()}</span>
            <div><strong>{school.short}</strong><small>{students.toLocaleString('en-US')} students</small></div>
            <b>{dollars(raised)}</b>
          </li>)}
        </ol>
      </article>
    </div>

    <div className="adm-grid-2 is-wide-first">
      <article className="db-panel">
        <PanelHead title="New campaigns" action={<SectionLink section="campaigns" className="db-link">View all campaigns</SectionLink>} />
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Campaign</th><th>Created by</th><th>Ends</th><th>Raised / goal</th><th>Status</th></tr></thead>
            <tbody>
              {newest.map(c => {
                const state = campaignState(c);
                return <tr key={c.id}>
                  <td data-label="Campaign"><span className="adm-campaign-cell"><img src={coverSrc(c.cover)} alt="" /><strong>{c.title}</strong></span></td>
                  <td data-label="Created by"><UserCell user={lookups.users.get(c.ownerId)} meta={lookups.schools.get(lookups.users.get(c.ownerId)?.schoolId ?? '')?.short} /></td>
                  <td data-label="Ends" className="adm-dates">{day(c.end)}</td>
                  <td data-label="Raised / goal"><span className="adm-progress"><b>{dollars(c.raised)}</b> / {dollars(c.goal)}<span className="db-bar"><span style={{ width: `${pct(c.raised, c.goal)}%` }} /></span></span></td>
                  <td data-label="Status"><CampaignPill state={state} /></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </article>

      <article className="db-panel">
        <PanelHead title="Admin activity" action={<SectionLink section="settings" focus="activity" className="db-link">See all</SectionLink>} />
        <ul className="adm-audit">
          {audit.slice(0, 7).map(entry => <li key={entry.id}>
            <i className={`is-${entry.tone}`} />
            <div><p>{entry.text}</p><small>{agoText(entry.at)}</small></div>
          </li>)}
        </ul>
      </article>
    </div>

    <div className="adm-stats is-mini">
      <Stat icon={GraduationCap} label="Partner schools" value={String(schools.filter(s => s.active).length)} tone="sky" />
      <Stat icon={Wallet} label="Avg. gift" value={dollars(payments.reduce((n, p) => n + p.amount, 0) / Math.max(1, payments.length), true)} tone="mint" />
      <Stat icon={Sparkles} label="Vibeys in circulation" value={users.reduce((n, u) => n + u.vibeys, 0).toLocaleString('en-US')} tone="sun" />
    </div>
  </section>;
}

export function CampaignPill({ state }: { state: ReturnType<typeof campaignState> }) {
  const map = { active: ['mint', 'Active'], complete: ['sky', 'Completed'], draft: ['muted', 'Draft'], expired: ['rose', 'Expired'] } as const;
  const [tone, label] = map[state];
  return <Pill tone={tone}>{label}</Pill>;
}
