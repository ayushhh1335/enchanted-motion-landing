import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { AdminCampaign, School, Suggestion } from '@/content/admin-data';
import {
  seedActivity, seedProfile, seedSchool, seedSchoolCampaigns, seedSchoolForums, seedSchoolReports, seedSchoolSuggestions, seedStudents,
  seedUpdates,
  type ActivityEntry, type SchoolForum, type SchoolProfile, type SchoolReport, type SchoolStudent, type SchoolUpdate,
} from '@/content/school-data';

export type Escalation = { campaignId: string; reason: string; at: number };

export type SchoolState = {
  profile: SchoolProfile; school: School; students: SchoolStudent[]; campaigns: AdminCampaign[]; forums: SchoolForum[];
  reports: SchoolReport[]; updates: SchoolUpdate[]; suggestions: Suggestion[]; escalations: Escalation[]; activity: ActivityEntry[];
};

export type ReportAction = 'remove' | 'suspend' | 'dismiss' | 'escalate';
type Tone = ActivityEntry['tone'];

const STORAGE_KEY = 'byeuni-school-v1';
const WEEK = 7 * 24 * 3_600_000;

const seedState = (): SchoolState => ({
  profile: seedProfile, school: seedSchool, students: seedStudents, campaigns: seedSchoolCampaigns, forums: seedSchoolForums,
  reports: seedSchoolReports, updates: seedUpdates, suggestions: seedSchoolSuggestions, escalations: [], activity: seedActivity,
});

function readState(): SchoolState {
  const seed = seedState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...seed, ...(JSON.parse(raw) as Partial<SchoolState>) } : seed;
  } catch {
    return seed;
  }
}

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const patch = <T extends { id: string }>(list: T[], id: string, change: Partial<T>) =>
  list.map(entry => entry.id === id ? { ...entry, ...change } : entry);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const startOfToday = () => new Date(new Date().setHours(0, 0, 0, 0)).getTime();

/** The school's email domain, taken from the admin's own address. */
export const schoolDomain = (profile: SchoolProfile) => profile.email.split('@')[1] ?? '';

function useSchoolStore() {
  const [state, setState] = useState<SchoolState>(readState);
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

  const commit = useCallback((change: (s: SchoolState) => SchoolState, log?: { text: string; tone?: Tone }) => {
    setState(prev => {
      const next = change(prev);
      if (!log) return next;
      return { ...next, activity: [{ id: uid('ac'), at: Date.now(), text: log.text, tone: log.tone ?? 'mint' }, ...next.activity].slice(0, 60) };
    });
  }, []);

  const lookups = useMemo(() => ({
    students: new Map(state.students.map(s => [s.id, s])),
    forums: new Map(state.forums.map(f => [f.id, f])),
    campaigns: new Map(state.campaigns.map(c => [c.id, c])),
  }), [state.students, state.forums, state.campaigns]);

  const counts = useMemo(() => {
    const weekAgo = Date.now() - WEEK;
    return {
      reports: state.reports.filter(r => r.status === 'open').length,
      newSuggestions: state.suggestions.filter(s => s.at >= weekAgo).length,
      upcoming: state.updates.filter(u => u.eventDate >= startOfToday()).length,
      inactive: state.students.filter(s => !s.enabled || s.invited).length,
      escalations: state.escalations.length,
    };
  }, [state.reports, state.suggestions, state.updates, state.students, state.escalations]);

  const name = (id: string) => latest.current.students.find(s => s.id === id)?.name ?? 'This student';

  const actions = useMemo(() => ({
    // Students
    setStudentEnabled(id: string, enabled: boolean) {
      commit(s => ({ ...s, students: patch(s.students, id, { enabled }) }), { text: `${enabled ? 'Activated' : 'Deactivated'} ${name(id)}`, tone: enabled ? 'mint' : 'sun' });
      toast.success(`${name(id)} is now ${enabled ? 'active' : 'inactive'}`);
    },
    inviteStudent(input: { name: string; email: string; major: string }): string | null {
      const { profile, students } = latest.current;
      const email = input.email.trim().toLowerCase();
      const domain = schoolDomain(profile);
      if (!input.name.trim()) return 'Enter the student’s full name.';
      if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
      if (domain && !email.endsWith(`@${domain}`)) return `Use the student’s @${domain} address.`;
      if (students.some(s => s.email.toLowerCase() === email)) return 'That student is already on your roster.';
      const student: SchoolStudent = {
        id: uid('st'), type: 'fundraiser', name: input.name.trim(), email, phone: '', city: '', schoolId: latest.current.school.id,
        major: input.major || undefined, vibeys: 0, createdAt: Date.now(), lastActive: Date.now(), enabled: true, suspended: false, invited: true,
      };
      commit(s => ({ ...s, students: [student, ...s.students] }), { text: `Invited ${student.name} to ByeUni` });
      toast.success(`Invitation sent to ${email}`);
      return null;
    },
    resendInvite(id: string) {
      const student = latest.current.students.find(s => s.id === id);
      if (student) toast.success(`Invitation sent again to ${student.email}`);
    },
    /** Unlinks students from the school; their ByeUni accounts stay. */
    removeStudents(ids: string[]) {
      if (!ids.length) return;
      commit(s => ({ ...s, students: s.students.filter(x => !ids.includes(x.id)) }), { text: `Removed ${plural(ids.length, 'student')} from the roster`, tone: 'rose' });
      toast.success(`Removed ${plural(ids.length, 'student')} from your school. Their ByeUni accounts stay open.`);
    },
    suspendStudent(id: string, reason: string): boolean {
      if (!reason.trim()) { toast.error('Add a reason. The student sees it when they sign in.'); return false; }
      commit(s => ({ ...s, students: patch(s.students, id, { suspended: true, suspendReason: reason.trim() }) }), { text: `Suspended ${name(id)}: ${reason.trim()}`, tone: 'rose' });
      toast.success(`${name(id)} is suspended`);
      return true;
    },
    restoreStudent(id: string) {
      commit(s => ({ ...s, students: patch(s.students, id, { suspended: false, suspendReason: undefined }) }), { text: `Restored ${name(id)}`, tone: 'mint' });
      toast.success(`${name(id)} can sign in again`);
    },

    // Campaigns are run by ByeUni; schools can only raise a concern.
    escalateCampaign(id: string, reason: string): boolean {
      const campaign = latest.current.campaigns.find(c => c.id === id);
      if (!campaign) return false;
      if (!reason.trim()) { toast.error('Tell ByeUni what looks wrong.'); return false; }
      if (latest.current.escalations.some(e => e.campaignId === id)) { toast.error('This campaign is already with ByeUni.'); return false; }
      commit(s => ({ ...s, escalations: [{ campaignId: id, reason: reason.trim(), at: Date.now() }, ...s.escalations] }), { text: `Asked ByeUni to review “${campaign.title}”`, tone: 'sun' });
      toast.success('Sent to ByeUni trust & safety', { description: 'They usually reply within one business day.' });
      return true;
    },
    withdrawEscalation(id: string) {
      commit(s => ({ ...s, escalations: s.escalations.filter(e => e.campaignId !== id) }), { text: 'Withdrew a campaign review request', tone: 'sky' });
      toast.success('Review request withdrawn');
    },

    // Forums and reports
    setForumRemoved(id: string, removed: boolean) {
      const forum = latest.current.forums.find(f => f.id === id);
      if (!forum) return;
      commit(s => ({ ...s, forums: patch(s.forums, id, { removed }) }), { text: `${removed ? 'Removed' : 'Restored'} forum “${forum.title}”`, tone: removed ? 'rose' : 'mint' });
      toast.success(`${removed ? 'Removed' : 'Restored'} “${forum.title}”`);
    },
    resolveReport(id: string, action: ReportAction) {
      const report = latest.current.reports.find(r => r.id === id);
      if (!report || report.status !== 'open') { toast.error('This report was already handled.'); return; }
      const author = name(report.authorId);
      const resolution = {
        remove: report.kind === 'forum' ? 'Forum removed' : 'Comment removed',
        suspend: `${author} suspended`,
        dismiss: 'No violation found',
        escalate: 'Sent to ByeUni trust & safety',
      }[action];
      commit(s => {
        let next: SchoolState = { ...s, reports: patch(s.reports, id, { status: action === 'dismiss' ? 'dismissed' : 'resolved', resolution }) };
        if (action === 'remove' && report.kind === 'forum') next = { ...next, forums: patch(next.forums, report.targetId, { removed: true }) };
        if (action === 'remove' && report.kind === 'comment') next = { ...next, forums: next.forums.map(f => ({ ...f, recent: f.recent.filter(p => p.id !== report.targetId) })) };
        if (action === 'suspend') next = { ...next, students: patch(next.students, report.authorId, { suspended: true, suspendReason: report.reason }) };
        return next;
      }, { text: `${resolution} (${report.reason.toLowerCase()} report)`, tone: action === 'dismiss' ? 'sky' : action === 'escalate' ? 'sun' : 'rose' });
      toast.success(resolution);
    },

    // Updates
    saveUpdate(update: SchoolUpdate, isNew: boolean): string | null {
      const title = update.title.trim();
      const description = update.description.trim();
      if (!title) return 'Add a title.';
      if (title.length > 150) return 'Keep the title under 150 characters.';
      if (!description) return 'Add a description.';
      if (description.length > 500) return 'Keep the description under 500 characters.';
      if (!update.eventDate) return 'Pick the event date.';
      if (isNew && update.eventDate < startOfToday()) return 'New updates can’t be dated in the past.';
      commit(s => ({ ...s, updates: isNew ? [{ ...update, title, description }, ...s.updates] : patch(s.updates, update.id, { title, description, eventDate: update.eventDate }) }), { text: `${isNew ? 'Posted' : 'Edited'} “${title}”` });
      toast.success(isNew ? 'Update posted to your students' : 'Update saved');
      return null;
    },
    deleteUpdates(ids: string[]) {
      commit(s => ({ ...s, updates: s.updates.filter(u => !ids.includes(u.id)) }), { text: `Deleted ${plural(ids.length, 'update')}`, tone: 'rose' });
      toast.success(`Deleted ${plural(ids.length, 'update')}`);
    },

    // Suggestions
    deleteSuggestions(ids: string[]) {
      commit(s => ({ ...s, suggestions: s.suggestions.filter(x => !ids.includes(x.id)) }), { text: `Deleted ${plural(ids.length, 'suggestion')}`, tone: 'rose' });
      toast.success(`Deleted ${plural(ids.length, 'suggestion')}`);
    },

    // School and profile
    saveSchool(change: Pick<School, 'colors' | 'city' | 'logo'>) {
      commit(s => ({ ...s, school: { ...s.school, ...change } }), { text: 'Updated school branding' });
      toast.success('School details saved');
    },
    saveProfile(profile: SchoolProfile, password: string, confirm: string): string | null {
      if (!profile.firstName.trim() || !profile.lastName.trim()) return 'Enter your first and last name.';
      if (!/^\S+@\S+\.\S+$/.test(profile.email.trim())) return 'Enter a valid email address.';
      if (!profile.phone.trim()) return 'Enter a phone number.';
      if (password || confirm) {
        if (password.length < 6) return 'The new password needs at least 6 characters.';
        if (password !== confirm) return 'The passwords don’t match.';
      }
      commit(s => ({ ...s, profile: { ...profile, firstName: profile.firstName.trim(), lastName: profile.lastName.trim(), email: profile.email.trim().toLowerCase(), phone: profile.phone.trim() } }), { text: password ? 'Changed password and profile' : 'Updated profile', tone: 'sky' });
      toast.success(password ? 'Profile and password saved' : 'Profile saved');
      return null;
    },
    resetAll() {
      setState(seedState());
      toast.success('School portal demo data restored');
    },
  }), [commit]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, lookups, counts, actions };
}

type SchoolStore = ReturnType<typeof useSchoolStore>;
const SchoolContext = createContext<SchoolStore | null>(null);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const store = useSchoolStore();
  return <SchoolContext.Provider value={store}>{children}</SchoolContext.Provider>;
}

export function useSchool() {
  const store = useContext(SchoolContext);
  if (!store) throw new Error('useSchool must be used inside SchoolProvider');
  return store;
}
