import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  seedAudit, seedCampaigns, seedCategories, seedConfig, seedContests, seedEcards, seedFlags, seedForums, seedMajors, seedPayments,
  seedQuotes, seedRedemptions, seedReports, seedRewards, seedRules, seedSchoolAdmins, seedSchools, seedSuggestions, seedTemplates,
  seedUsers, seedWithdrawals, seedWords,
  type AdminCampaign, type AdminReward, type AdminUser, type AuditEntry, type CampaignStatus, type Contest, type ECard, type EarnRule,
  type EmailTemplate, type Flag, type FlagStatus, type Forum, type LibraryItem, type Payment, type Quote, type Redemption, type Report,
  type School, type SchoolAdmin, type Suggestion, type SystemConfig, type WatchWord, type Withdrawal, type WordCategory,
} from '@/content/admin-data';

export type AdminState = {
  schools: School[]; users: AdminUser[]; schoolAdmins: SchoolAdmin[]; campaigns: AdminCampaign[]; payments: Payment[];
  withdrawals: Withdrawal[]; categories: LibraryItem[]; majors: LibraryItem[]; quotes: Quote[]; ecards: ECard[];
  forums: Forum[]; reports: Report[]; words: WatchWord[]; flags: Flag[]; rules: EarnRule[]; rewards: AdminReward[];
  redemptions: Redemption[]; contests: Contest[]; config: SystemConfig; templates: EmailTemplate[]; suggestions: Suggestion[];
  audit: AuditEntry[];
};

export type LibraryKind = 'categories' | 'majors' | 'quotes' | 'ecards';
export type CampaignState = CampaignStatus | 'expired';
type Tone = AuditEntry['tone'];

const STORAGE_KEY = 'byeuni-admin-v1';

const seedState = (): AdminState => ({
  schools: seedSchools, users: seedUsers, schoolAdmins: seedSchoolAdmins, campaigns: seedCampaigns, payments: seedPayments,
  withdrawals: seedWithdrawals, categories: seedCategories, majors: seedMajors, quotes: seedQuotes, ecards: seedEcards,
  forums: seedForums, reports: seedReports, words: seedWords, flags: seedFlags, rules: seedRules, rewards: seedRewards,
  redemptions: seedRedemptions, contests: seedContests, config: seedConfig, templates: seedTemplates, suggestions: seedSuggestions,
  audit: seedAudit,
});

function readState(): AdminState {
  const seed = seedState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...seed, ...(JSON.parse(raw) as Partial<AdminState>) } : seed;
  } catch {
    return seed;
  }
}

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const upsert = <T extends { id: string | number }>(list: T[], item: T) =>
  list.some(entry => entry.id === item.id) ? list.map(entry => entry.id === item.id ? item : entry) : [item, ...list];
const patch = <T extends { id: string | number }>(list: T[], id: T['id'], change: Partial<T>) =>
  list.map(entry => entry.id === id ? { ...entry, ...change } : entry);
const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

/** Expired is computed from the end date and never stored, as in the original admin list. */
export const campaignState = (campaign: AdminCampaign): CampaignState =>
  campaign.status !== 'complete' && campaign.end < Date.now() ? 'expired' : campaign.status;

function useAdminStore() {
  const [state, setState] = useState<AdminState>(readState);
  const latest = useRef(state);
  latest.current = state;
  const warnedQuota = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      if (!warnedQuota.current) toast.error('Browser storage is full. Recent changes last until you reload.');
      warnedQuota.current = true;
    }
  }, [state]);

  const commit = useCallback((change: (s: AdminState) => AdminState, log?: { text: string; tone?: Tone }) => {
    setState(prev => {
      const next = change(prev);
      if (!log) return next;
      return { ...next, audit: [{ id: uid('au'), at: Date.now(), text: log.text, tone: log.tone ?? 'mint' }, ...next.audit].slice(0, 80) };
    });
  }, []);

  const lookups = useMemo(() => {
    const users = new Map(state.users.map(u => [u.id, u]));
    const schools = new Map(state.schools.map(s => [s.id, s]));
    const campaigns = new Map(state.campaigns.map(c => [c.id, c]));
    const rewards = new Map(state.rewards.map(r => [r.id, r]));
    return { users, schools, campaigns, rewards };
  }, [state.users, state.schools, state.campaigns, state.rewards]);

  const counts = useMemo(() => {
    const ended = (c: Contest) => c.active && !c.winnerId && c.to < Date.now();
    return {
      withdrawals: state.withdrawals.filter(w => w.status === 'pending').length,
      reports: state.reports.filter(r => r.status === 'open').length,
      flags: state.flags.filter(f => f.status === 'open').length,
      urgentFlags: state.flags.filter(f => f.status === 'open' && f.category === 'suicidal').length,
      redemptions: state.redemptions.filter(r => r.status === 'requested').length,
      contests: state.contests.filter(ended).length,
      drafts: state.campaigns.filter(c => c.status === 'draft').length,
    };
  }, [state.withdrawals, state.reports, state.flags, state.redemptions, state.contests, state.campaigns]);

  const name = (id: string) => lookups.users.get(id)?.name ?? 'Unknown user';

  const actions = useMemo(() => ({
    // Campaigns
    setCampaignStatus(id: string, status: CampaignStatus) {
      const campaign = latest.current.campaigns.find(c => c.id === id);
      if (!campaign) return;
      const verb = status === 'active' ? 'Published' : status === 'complete' ? 'Marked complete' : 'Unpublished';
      commit(s => ({ ...s, campaigns: patch(s.campaigns, id, { status }) }), { text: `${verb} “${campaign.title}”`, tone: status === 'draft' ? 'sun' : 'mint' });
      toast.success(`${verb} “${campaign.title}”`);
    },
    saveCampaign(campaign: AdminCampaign) {
      const isNew = !latest.current.campaigns.some(c => c.id === campaign.id);
      commit(s => ({ ...s, campaigns: upsert(s.campaigns, campaign) }), { text: `${isNew ? 'Created' : 'Edited'} campaign “${campaign.title}”` });
      toast.success(isNew ? 'Campaign created' : 'Campaign saved');
    },
    deleteCampaigns(ids: string[]) {
      const targets = latest.current.campaigns.filter(c => ids.includes(c.id));
      const blocked = targets.filter(c => c.raised > 0);
      const removable = targets.filter(c => c.raised === 0).map(c => c.id);
      if (removable.length) {
        commit(s => ({ ...s, campaigns: s.campaigns.filter(c => !removable.includes(c.id)) }), { text: `Deleted ${removable.length} campaign${removable.length > 1 ? 's' : ''}`, tone: 'rose' });
        toast.success(`Deleted ${removable.length} campaign${removable.length > 1 ? 's' : ''}`);
      }
      if (blocked.length) toast.error(`${blocked.length} campaign${blocked.length > 1 ? 's have' : ' has'} donations and can’t be deleted. Unpublish instead.`);
      return removable.length;
    },

    // Withdrawals
    acceptWithdrawal(id: string) {
      const w = latest.current.withdrawals.find(x => x.id === id);
      if (!w || w.status !== 'pending') { toast.error('This request was already decided.'); return; }
      commit(s => ({ ...s, withdrawals: patch(s.withdrawals, id, { status: 'paid', decidedAt: Date.now() }) }), { text: `Marked ${name(w.requesterId)}’s withdrawal as paid (${money(w.amount)})` });
      toast.success(`Marked as paid · ${money(w.amount)} to ${w.bank.name} ••${w.bank.last4}`, { description: 'The “Withdrawal accepted” email was sent.' });
    },
    declineWithdrawal(id: string, reason: string) {
      const w = latest.current.withdrawals.find(x => x.id === id);
      if (!w || w.status !== 'pending') { toast.error('This request was already decided.'); return false; }
      if (!reason.trim()) { toast.error('Add a reason so the student knows what to fix.'); return false; }
      commit(s => ({ ...s, withdrawals: patch(s.withdrawals, id, { status: 'declined', declineReason: reason.trim(), decidedAt: Date.now() }) }), { text: `Declined ${name(w.requesterId)}’s withdrawal: ${reason.trim()}`, tone: 'rose' });
      toast.success('Withdrawal declined', { description: 'The student was emailed the reason.' });
      return true;
    },

    // People
    setUserEnabled(id: string, enabled: boolean) {
      commit(s => ({ ...s, users: patch(s.users, id, { enabled }) }), { text: `${enabled ? 'Activated' : 'Deactivated'} ${name(id)}`, tone: enabled ? 'mint' : 'sun' });
      toast.success(`${name(id)} is now ${enabled ? 'active' : 'inactive'}`);
    },
    suspendUser(id: string, reason: string) {
      commit(s => ({ ...s, users: patch(s.users, id, { suspended: true, suspendReason: reason || 'Community guidelines violation' }) }), { text: `Suspended ${name(id)}`, tone: 'rose' });
      toast.success(`${name(id)} was suspended`);
    },
    restoreUser(id: string) {
      commit(s => ({ ...s, users: patch(s.users, id, { suspended: false, suspendReason: undefined }) }), { text: `Restored ${name(id)}` });
      toast.success(`${name(id)} was restored`);
    },
    saveUser(user: AdminUser) {
      const isNew = !latest.current.users.some(u => u.id === user.id);
      if (isNew && latest.current.users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) { toast.error('That email is already registered.'); return false; }
      commit(s => ({ ...s, users: upsert(s.users, user) }), { text: `${isNew ? 'Added' : 'Edited'} ${user.type === 'guest' ? 'guest' : 'student'} ${user.name}` });
      toast.success(isNew ? `${user.name} was added` : 'Profile saved');
      return true;
    },
    deleteUsers(ids: string[]) {
      const owners = new Set(latest.current.campaigns.map(c => c.ownerId));
      const removable = ids.filter(id => !owners.has(id));
      const blocked = ids.length - removable.length;
      if (removable.length) {
        commit(s => ({ ...s, users: s.users.filter(u => !removable.includes(u.id)) }), { text: `Deleted ${removable.length} account${removable.length > 1 ? 's' : ''}`, tone: 'rose' });
        toast.success(`Deleted ${removable.length} account${removable.length > 1 ? 's' : ''}`);
      }
      if (blocked) toast.error(`${blocked} account${blocked > 1 ? 's have' : ' has'} campaigns and can’t be deleted. Deactivate instead.`);
      return removable.length;
    },
    setWithdrawCash(id: string, withdrawCash: boolean) {
      commit(s => ({ ...s, users: patch(s.users, id, { withdrawCash }) }), { text: `${withdrawCash ? 'Allowed' : 'Removed'} withdrawals for team member ${name(id)}`, tone: 'sky' });
    },

    // Schools
    saveSchool(school: School) {
      const isNew = !latest.current.schools.some(s => s.id === school.id);
      commit(s => ({ ...s, schools: upsert(s.schools, school) }), { text: `${isNew ? 'Added' : 'Updated'} ${school.name}`, tone: 'sky' });
      toast.success(isNew ? `${school.short} was added` : 'School saved');
    },
    setSchoolActive(id: string, active: boolean) {
      const school = latest.current.schools.find(s => s.id === id);
      commit(s => ({ ...s, schools: patch(s.schools, id, { active }) }), { text: `${active ? 'Activated' : 'Deactivated'} ${school?.name ?? 'school'}`, tone: active ? 'mint' : 'sun' });
    },
    saveSchoolAdmin(admin: SchoolAdmin) {
      const isNew = !latest.current.schoolAdmins.some(a => a.id === admin.id);
      commit(s => ({ ...s, schoolAdmins: upsert(s.schoolAdmins, admin) }), { text: `${isNew ? 'Invited' : 'Updated'} school admin ${admin.name}`, tone: 'sky' });
      toast.success(isNew ? `Invitation sent to ${admin.email}` : 'School admin saved');
    },
    setSchoolAdminActive(id: string, active: boolean) {
      commit(s => ({ ...s, schoolAdmins: patch(s.schoolAdmins, id, { active }) }));
    },
    deleteSchoolAdmin(id: string) {
      const admin = latest.current.schoolAdmins.find(a => a.id === id);
      commit(s => ({ ...s, schoolAdmins: s.schoolAdmins.filter(a => a.id !== id) }), { text: `Removed school admin ${admin?.name ?? ''}`, tone: 'rose' });
      toast.success('School admin removed');
    },

    // Content library
    saveLibrary<K extends LibraryKind>(kind: K, item: AdminState[K][number]) {
      commit(s => ({ ...s, [kind]: upsert(s[kind] as { id: string }[], item as { id: string }) }));
      toast.success('Saved');
    },
    toggleLibrary(kind: LibraryKind, id: string) {
      commit(s => ({ ...s, [kind]: (s[kind] as { id: string; active: boolean }[]).map(x => x.id === id ? { ...x, active: !x.active } : x) }));
    },
    deleteLibrary(kind: LibraryKind, id: string) {
      if (kind === 'categories') {
        const category = latest.current.categories.find(c => c.id === id);
        const inUse = latest.current.campaigns.some(c => c.category === category?.name && campaignState(c) === 'active');
        if (inUse) { toast.error('This category has active campaigns. Deactivate it instead.'); return; }
      }
      commit(s => ({ ...s, [kind]: (s[kind] as { id: string }[]).filter(x => x.id !== id) }), { text: `Deleted an item from ${kind}`, tone: 'rose' });
      toast.success('Deleted');
    },

    // Moderation
    resolveReport(id: string, outcome: 'remove' | 'suspend' | 'dismiss') {
      const report = latest.current.reports.find(r => r.id === id);
      if (!report) return;
      const label = { remove: report.kind === 'campaign' ? 'Campaign unpublished' : `${report.kind[0]?.toUpperCase()}${report.kind.slice(1)} removed`, suspend: 'Author suspended', dismiss: 'No violation found' }[outcome];
      commit(s => {
        let next: AdminState = { ...s, reports: patch(s.reports, id, { status: outcome === 'dismiss' ? 'dismissed' : 'resolved', resolution: label }) };
        if (outcome === 'remove' && report.kind === 'forum') next = { ...next, forums: patch(next.forums, report.targetId, { removed: true }) };
        if (outcome === 'remove' && report.kind === 'campaign') next = { ...next, campaigns: patch(next.campaigns, report.targetId, { status: 'draft' as const }) };
        if (outcome === 'suspend' || (outcome === 'remove' && report.kind === 'user')) next = { ...next, users: patch(next.users, report.authorId, { suspended: true, suspendReason: report.reason }) };
        return next;
      }, { text: `${label} · report on ${name(report.authorId)}`, tone: outcome === 'dismiss' ? 'sky' : 'rose' });
      toast.success(label);
    },
    setForumRemoved(id: string, removed: boolean) {
      const forum = latest.current.forums.find(f => f.id === id);
      commit(s => ({ ...s, forums: patch(s.forums, id, { removed }) }), { text: `${removed ? 'Removed' : 'Restored'} forum “${forum?.title ?? ''}”`, tone: removed ? 'rose' : 'mint' });
      toast.success(removed ? 'Forum removed' : 'Forum restored');
    },
    resolveFlag(id: string, status: FlagStatus) {
      const flag = latest.current.flags.find(f => f.id === id);
      if (!flag) return;
      const text = { supported: `Sent support resources to ${name(flag.userId)}`, removed: `Removed ${flag.where.toLowerCase()} by ${name(flag.userId)}`, dismissed: `Dismissed vibe-check flag on ${name(flag.userId)}`, open: 'Reopened flag' }[status];
      commit(s => ({ ...s, flags: patch(s.flags, id, { status }) }), { text, tone: status === 'removed' ? 'rose' : 'sky' });
      toast.success(text);
    },
    addWord(word: string, category: WordCategory) {
      const value = word.trim().toLowerCase();
      if (!value) return false;
      if (latest.current.words.some(w => w.word === value)) { toast.error('That word is already on the list.'); return false; }
      commit(s => ({ ...s, words: [{ id: uid('w'), word: value, category, createdAt: Date.now(), hits: 0 }, ...s.words] }), { text: `Added “${value}” to vibe-check`, tone: 'sky' });
      return true;
    },
    deleteWord(id: string) {
      commit(s => ({ ...s, words: s.words.filter(w => w.id !== id) }));
    },

    // Vibeys
    saveRule(rule: EarnRule) {
      if (rule.vibeys < 1 || !Number.isInteger(rule.vibeys)) { toast.error('Vibeys must be a whole number of at least 1.'); return false; }
      commit(s => ({ ...s, rules: s.rules.map(r => r.id === rule.id ? rule : r) }), { text: `Updated earn rule “${rule.action}” to ${rule.vibeys} Vibeys`, tone: 'sun' });
      toast.success('Earn rule saved');
      return true;
    },
    saveReward(reward: AdminReward) {
      if (!reward.name.trim() || reward.required < 1) { toast.error('A reward needs a name and a Vibeys cost of at least 1.'); return false; }
      const isNew = !latest.current.rewards.some(r => r.id === reward.id);
      commit(s => ({ ...s, rewards: upsert(s.rewards, reward) }), { text: `${isNew ? 'Added' : 'Edited'} reward “${reward.name}”`, tone: 'sun' });
      toast.success(isNew ? 'Reward added' : 'Reward saved');
      return true;
    },
    toggleReward(id: string) {
      commit(s => ({ ...s, rewards: s.rewards.map(r => r.id === id ? { ...r, active: !r.active } : r) }));
    },
    deleteReward(id: string) {
      if (latest.current.redemptions.some(r => r.rewardId === id && r.status === 'requested')) { toast.error('Fulfil the open requests for this reward first.'); return; }
      commit(s => ({ ...s, rewards: s.rewards.filter(r => r.id !== id) }), { text: 'Deleted a reward', tone: 'rose' });
    },
    fulfillRedemption(id: string, coupon: string) {
      const redemption = latest.current.redemptions.find(r => r.id === id);
      if (!redemption || redemption.status !== 'requested') return false;
      if (!coupon.trim()) { toast.error('Enter the coupon code to email.'); return false; }
      const reward = lookups.rewards.get(redemption.rewardId);
      commit(s => ({ ...s, redemptions: patch(s.redemptions, id, { status: 'redeemed', coupon: coupon.trim(), redeemedAt: Date.now() }) }), { text: `Sent ${reward?.name ?? 'reward'} coupon to ${name(redemption.userId)}`, tone: 'sun' });
      toast.success('Coupon sent', { description: `“Your Reward Coupon is Here!” was emailed to ${name(redemption.userId)}.` });
      return true;
    },
    saveContest(contest: Contest): string | null {
      if (!contest.name.trim() || !contest.prize.trim()) return 'Add a contest name and prize.';
      if (contest.from > contest.to) return 'The start date must be on or before the end date.';
      if (contest.prizeValue <= 0) return 'The prize value must be greater than zero.';
      if (contest.entry < 1) return 'Entry cost must be at least 1 Vibey.';
      const overlap = latest.current.contests.find(c => c.id !== contest.id && c.active && contest.active && !c.winnerId && c.from <= contest.to && contest.from <= c.to);
      if (overlap) return `Dates overlap with “${overlap.name}”. Only one contest can run at a time.`;
      const isNew = !latest.current.contests.some(c => c.id === contest.id);
      commit(s => ({ ...s, contests: upsert(s.contests, contest) }), { text: `${isNew ? 'Created' : 'Edited'} grand contest “${contest.name}”`, tone: 'sun' });
      toast.success(isNew ? 'Contest created' : 'Contest saved');
      return null;
    },
    pickWinner(id: string, userId?: string) {
      const contest = latest.current.contests.find(c => c.id === id);
      if (!contest || contest.winnerId) { toast.error('A winner was already picked.'); return; }
      if (!contest.participants.length) { toast.error('Nobody has entered this contest yet.'); return; }
      const winner = userId ?? contest.participants[Math.floor(Math.random() * contest.participants.length)]!;
      commit(s => ({ ...s, contests: patch(s.contests, id, { winnerId: winner, pickedAt: Date.now() }) }), { text: `Picked ${name(winner)} as winner of “${contest.name}”`, tone: 'sun' });
      toast.success(`${name(winner)} wins ${contest.prize}!`, { description: 'The winner email was sent.' });
    },

    // Platform
    saveConfig(config: SystemConfig) {
      commit(s => ({ ...s, config }), { text: 'Updated system configuration', tone: 'sky' });
      toast.success('System configuration saved');
    },
    saveTemplate(template: EmailTemplate) {
      commit(s => ({ ...s, templates: upsert(s.templates, { ...template, updatedAt: Date.now() }) }), { text: `Edited email template “${template.name}”`, tone: 'sky' });
      toast.success('Template saved');
    },
    resetAll() {
      setState(seedState());
      toast.success('Admin demo data was reset');
    },
  }), [commit, lookups]);

  return { ...state, lookups, counts, actions };
}

type AdminStore = ReturnType<typeof useAdminStore>;
const AdminContext = createContext<AdminStore | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const store = useAdminStore();
  return <AdminContext.Provider value={store}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const store = useContext(AdminContext);
  if (!store) throw new Error('useAdmin must be used inside AdminProvider');
  return store;
}

export { uid };
