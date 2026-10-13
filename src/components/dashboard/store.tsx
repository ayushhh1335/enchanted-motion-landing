import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  INVITES_PER_DAY, ME_ID, applyAccount, autoReplies, people, seedAccount, seedAutopays, seedCampaigns, seedChats, seedCommunities,
  seedConnections, seedContacts, seedEvents, seedInvites, seedJoined, seedMyCampaign, seedNotices, seedPaymentsMade, seedPosts,
  seedProfile, seedStories, seedVibes, spotlightFor, vibeyRules, vibeysStart, rewards,
  type Account, type Audience, type Autopay, type Campaign, type Chat, type ChatMessage, type Comment, type Community, type Contact,
  type ContactSource, type Invite, type PaymentMade, type Post, type PostKind, type Story, type VibeEntry,
} from '@/content/dashboard-data';
import { cvSections, seedCv, type CvContent, type CvSectionId, type CvState } from '@/content/cvision-data';
import { DEMO_ACCOUNTS } from '@/lib/demo-session';

export type ConnState = 'connected' | 'incoming' | 'pending' | 'none' | 'declined';
export type Rsvp = 'going' | 'interested';
export type VibeyEntry = { id: string; label: string; points: number; at: number };

/**
 * Only what the visitor changes is stored. Seed content comes from the bundle each load,
 * so built asset URLs never go stale in storage.
 */
type UserLayer = {
  myStories: Story[];
  seenStories: string[];
  myPosts: Post[];
  deletedPosts: string[];
  liked: string[];
  saved: string[];
  reposted: string[];
  extraComments: Record<string, Comment[]>;
  connections: Record<string, ConnState>;
  rsvp: Record<string, Rsvp>;
  joined: string[];
  myCommunities: Community[];
  sentMessages: Record<string, ChatMessage[]>;
  readChats: string[];
  donations: Record<string, number>;
  myCampaigns: Campaign[];
  vibeys: { balance: number; streak: number; lastLogin: string; awardedToday: Record<string, string>; log: VibeyEntry[] };
  redeemed: string[];
  profile: typeof seedProfile;
  noticesReadAt: number;
  account: Account;
  contacts: Contact[];
  paypal: { email: string; linkedAt: number } | null;
  paymentsMade: PaymentMade[];
  autopays: Autopay[];
  invites: Invite[];
  vibes: VibeEntry[];
  kudosDay: string;
  dismissed: string[];
  cv: CvState;
  deactivatedAt: number | null;
};

export type ContactInput = { name: string; email: string; phone: string; note: string };
export type PasswordChange = { current: string; next: string; confirm: string };
export type Identity = Pick<Account, 'firstName' | 'lastName' | 'username' | 'major' | 'gradYear' | 'photo'>;

function identityError(firstName: string, lastName: string, username: string) {
  if (!firstName || !lastName) return 'First and last name are required.';
  if (!/^[a-z0-9_.]{3,30}$/.test(username)) return 'Usernames use 3 to 30 letters, numbers, dots, or underscores.';
  if (people.some(p => p.id !== ME_ID && p.handle === username)) return `@${username} is already taken.`;
  return null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const digits = (phone: string) => phone.replace(/\D/g, '');
export const isEmail = (value: string) => EMAIL.test(value.trim());

function contactError(input: ContactInput, contacts: Contact[], ignoreId?: string) {
  if (!input.name.trim()) return 'Add a name.';
  if (!isEmail(input.email)) return 'Enter a valid email address.';
  const phone = digits(input.phone);
  if (phone && (phone.length < 10 || phone.length > 15)) return 'Phone numbers need 10 to 15 digits.';
  const email = input.email.trim().toLowerCase();
  if (contacts.some(c => c.id !== ignoreId && c.email.toLowerCase() === email)) return 'That email is already in your contacts.';
  return null;
}

const STORAGE_KEY = 'byeuni-dashboard-v1';
const dayKey = (time = Date.now()) => new Date(time).toISOString().slice(0, 10);
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function freshLayer(): UserLayer {
  return {
    myStories: [],
    seenStories: [],
    myPosts: [],
    deletedPosts: [],
    liked: [],
    saved: [],
    reposted: [],
    extraComments: {},
    connections: {},
    rsvp: { 'ev-fair': 'going' },
    joined: seedJoined,
    myCommunities: [],
    sentMessages: {},
    readChats: [],
    donations: {},
    myCampaigns: [seedMyCampaign],
    vibeys: { balance: vibeysStart.balance, streak: vibeysStart.streak, lastLogin: dayKey(Date.now() - 86_400_000), awardedToday: {}, log: [
      { id: 'v-seed-1', label: 'Supported Get our team to the FIRST Robotics Championship', points: 25, at: Date.now() - 2 * 86_400_000 },
      { id: 'v-seed-2', label: 'Daily login, 3-day streak', points: 15, at: Date.now() - 86_400_000 },
    ] },
    redeemed: [],
    profile: seedProfile,
    noticesReadAt: 0,
    account: seedAccount,
    contacts: seedContacts,
    paypal: { email: 'ethan.carter@stanford.edu', linkedAt: Date.now() - 45 * 86_400_000 },
    paymentsMade: seedPaymentsMade,
    autopays: seedAutopays,
    invites: seedInvites,
    vibes: seedVibes,
    kudosDay: '',
    dismissed: [],
    cv: seedCv,
    deactivatedAt: null,
  };
}

function loadLayer(): UserLayer {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<UserLayer>;
      const fresh = freshLayer();
      const cv = { ...fresh.cv, ...saved.cv, content: { ...fresh.cv.content, ...saved.cv?.content } };
      // Sections added in later versions join the end of a saved order.
      cv.order = [...cv.order.filter(id => cvSections.includes(id)), ...cvSections.filter(id => !cv.order.includes(id))];
      return { ...fresh, ...saved, account: { ...fresh.account, ...saved.account }, cv };
    }
  } catch { /* Fall back to a fresh demo. */ }
  return freshLayer();
}

export type NewPost = { text: string; images: string[]; kind: PostKind; audience: Audience };
export type NewCampaign = { title: string; goal: number; category: string; story: string; image: string };

function useDashboardState() {
  const [layer, setLayer] = useState<UserLayer>(loadLayer);
  const latest = useRef(layer);
  latest.current = layer;
  applyAccount(layer.account);
  const replyTimers = useRef<number[]>([]);
  // Set once the account is deleted so late updates (like auto-replies) can't write it back.
  const deleted = useRef(false);

  useEffect(() => {
    if (deleted.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layer));
    } catch {
      toast.error('Browser storage is full. New photos will last until you reload.');
    }
  }, [layer]);

  useEffect(() => () => replyTimers.current.forEach(window.clearTimeout), []);

  const update = useCallback((fn: (draft: UserLayer) => UserLayer) => setLayer(prev => fn(prev)), []);

  const award = useCallback((ruleId: string, label: string, opts: { daily?: boolean; points?: number } = {}) => {
    const rule = vibeyRules.find(item => item.id === ruleId);
    const points = opts.points ?? rule?.points ?? 0;
    const today = dayKey();
    if (opts.daily && latest.current.vibeys.awardedToday[ruleId] === today) return;
    setLayer(prev => ({ ...prev, vibeys: {
      ...prev.vibeys,
      balance: prev.vibeys.balance + points,
      awardedToday: { ...prev.vibeys.awardedToday, [ruleId]: today },
      log: [{ id: uid('v'), label, points, at: Date.now() }, ...prev.vibeys.log].slice(0, 40),
    } }));
    toast.success(`+${points} Vibeys`, { description: label });
  }, []);

  // Daily login streak, once per calendar day. The ref keeps StrictMode's double effect from paying twice.
  const loginChecked = useRef(false);
  useEffect(() => {
    if (loginChecked.current) return;
    loginChecked.current = true;
    if (latest.current.deactivatedAt) {
      setLayer(prev => ({ ...prev, deactivatedAt: null }));
      window.setTimeout(() => toast.success('Welcome back', { description: 'Your account is active again and your profile is visible.' }), 400);
    }
    const { vibeys } = latest.current;
    const today = dayKey();
    if (vibeys.lastLogin === today) return;
    const streak = vibeys.lastLogin === dayKey(Date.now() - 86_400_000) ? vibeys.streak + 1 : 1;
    const points = 5 * streak;
    setLayer(prev => ({ ...prev, vibeys: { ...prev.vibeys, streak, lastLogin: today, balance: prev.vibeys.balance + points,
      log: [{ id: uid('v'), label: `Daily login, ${streak}-day streak`, points, at: Date.now() }, ...prev.vibeys.log] } }));
    window.setTimeout(() => toast.success(`+${points} Vibeys`, { description: `Welcome back! You're on a ${streak}-day streak.` }), 700);
  }, []);

  const stories = useMemo(() => [...layer.myStories, ...seedStories], [layer.myStories]);

  const posts = useMemo(() => {
    const all = [...layer.myPosts, ...seedPosts].filter(post => !layer.deletedPosts.includes(post.id)).sort((a, b) => b.at - a.at);
    return all.map(post => {
      const liked = layer.liked.includes(post.id);
      return {
        ...post,
        liked,
        saved: layer.saved.includes(post.id),
        reposted: layer.reposted.includes(post.id),
        likes: post.likes + (liked ? 1 : 0),
        reposts: post.reposts + (layer.reposted.includes(post.id) ? 1 : 0),
        comments: [...post.comments, ...(layer.extraComments[post.id] ?? [])],
      };
    });
  }, [layer.myPosts, layer.deletedPosts, layer.liked, layer.saved, layer.reposted, layer.extraComments]);

  const connections = useMemo(() => ({ ...seedConnections, ...layer.connections }) as Record<string, ConnState>, [layer.connections]);

  const campaigns = useMemo(() => [...layer.myCampaigns, ...seedCampaigns].map(c => ({
    ...c,
    raised: c.raised + (layer.donations[c.id] ?? 0),
    donors: c.donors + (layer.donations[c.id] ? 1 : 0),
    myDonation: layer.donations[c.id] ?? 0,
  })), [layer.myCampaigns, layer.donations]);

  const communities = useMemo(() => [...layer.myCommunities, ...seedCommunities].map(c => ({
    ...c, joined: layer.joined.includes(c.id), members: c.members + (layer.joined.includes(c.id) && !seedJoined.includes(c.id) ? 1 : 0),
  })), [layer.myCommunities, layer.joined]);

  const events = useMemo(() => seedEvents.map(e => ({
    ...e, rsvp: layer.rsvp[e.id] as Rsvp | undefined, going: e.going + (layer.rsvp[e.id] === 'going' ? 1 : 0),
  })), [layer.rsvp]);

  const chats = useMemo<(Chat & { last: ChatMessage })[]>(() => seedChats.map(chat => {
    const messages = [...chat.messages, ...(layer.sentMessages[chat.id] ?? [])].sort((a, b) => a.at - b.at);
    const last = messages[messages.length - 1] ?? { id: `${chat.id}-empty`, from: 'them' as const, text: '', at: 0 };
    return { ...chat, messages, unread: layer.readChats.includes(chat.id) ? 0 : chat.unread, last };
  }).sort((a, b) => b.last.at - a.last.at), [layer.sentMessages, layer.readChats]);

  const notices = useMemo(() => seedNotices.map(n => ({ ...n, unread: n.at > layer.noticesReadAt })), [layer.noticesReadAt]);

  const actions = useMemo(() => ({
    addStory(image: string, caption: string) {
      update(prev => ({ ...prev, myStories: [{ id: uid('story'), personId: ME_ID, image, caption, at: Date.now() }, ...prev.myStories] }));
      toast.success('Added to your story');
    },
    deleteStory(id: string) {
      update(prev => ({ ...prev, myStories: prev.myStories.filter(story => story.id !== id) }));
      toast('Story deleted');
    },
    markStorySeen(id: string) {
      update(prev => prev.seenStories.includes(id) ? prev : { ...prev, seenStories: [...prev.seenStories, id] });
    },
    createPost(input: NewPost) {
      const post: Post = { id: uid('post'), authorId: ME_ID, at: Date.now(), likes: 0, likedBy: [], comments: [], reposts: 0, ...input };
      update(prev => ({ ...prev, myPosts: [post, ...prev.myPosts] }));
      toast.success('Posted to your feed');
      award('r-post', 'First post of the day', { daily: true });
    },
    deletePost(id: string) {
      update(prev => ({ ...prev, myPosts: prev.myPosts.filter(post => post.id !== id), deletedPosts: prev.myPosts.some(p => p.id === id) ? prev.deletedPosts : [...prev.deletedPosts, id] }));
      toast('Post removed');
    },
    toggleLike(id: string, force?: boolean) {
      update(prev => {
        const has = prev.liked.includes(id);
        const next = force ?? !has;
        if (next === has) return prev;
        return { ...prev, liked: next ? [...prev.liked, id] : prev.liked.filter(item => item !== id) };
      });
    },
    toggleSave(id: string) {
      const saved = !latest.current.saved.includes(id);
      update(prev => ({ ...prev, saved: saved ? [...prev.saved.filter(item => item !== id), id] : prev.saved.filter(item => item !== id) }));
      toast(saved ? 'Saved to your collection' : 'Removed from saved');
    },
    toggleRepost(id: string) {
      const reposted = !latest.current.reposted.includes(id);
      update(prev => ({ ...prev, reposted: reposted ? [...prev.reposted.filter(item => item !== id), id] : prev.reposted.filter(item => item !== id) }));
      toast(reposted ? 'Reposted to your network' : 'Repost undone');
    },
    addComment(postId: string, text: string) {
      const comment: Comment = { id: uid('c'), authorId: ME_ID, text, at: Date.now() };
      update(prev => ({ ...prev, extraComments: { ...prev.extraComments, [postId]: [...(prev.extraComments[postId] ?? []), comment] } }));
      award('r-comment', 'First comment of the day', { daily: true });
    },
    setConnection(personId: string, state: ConnState) {
      update(prev => ({ ...prev, connections: { ...prev.connections, [personId]: state } }));
    },
    setRsvp(eventId: string, value: Rsvp) {
      update(prev => {
        const rsvp = { ...prev.rsvp };
        if (rsvp[eventId] === value) delete rsvp[eventId];
        else rsvp[eventId] = value;
        return { ...prev, rsvp };
      });
    },
    toggleJoin(communityId: string) {
      update(prev => ({ ...prev, joined: prev.joined.includes(communityId) ? prev.joined.filter(id => id !== communityId) : [...prev.joined, communityId] }));
    },
    createCommunity(input: { name: string; description: string; category: string; image: string }) {
      const id = uid('forum');
      update(prev => ({ ...prev, myCommunities: [{ id, members: 1, posts: 0, ...input }, ...prev.myCommunities], joined: [...prev.joined, id] }));
      toast.success(`${input.name} is live`);
    },
    sendMessage(chatId: string, text: string) {
      const message: ChatMessage = { id: uid('m'), from: 'me', text, at: Date.now() };
      update(prev => ({ ...prev, sentMessages: { ...prev.sentMessages, [chatId]: [...(prev.sentMessages[chatId] ?? []), message] } }));
      const timer = window.setTimeout(() => {
        const reply: ChatMessage = { id: uid('m'), from: 'them', text: autoReplies[Math.floor(Math.random() * autoReplies.length)] ?? 'Sounds good!', at: Date.now() };
        update(prev => ({ ...prev, sentMessages: { ...prev.sentMessages, [chatId]: [...(prev.sentMessages[chatId] ?? []), reply] } }));
      }, 1600);
      replyTimers.current.push(timer);
    },
    readChat(chatId: string) {
      update(prev => prev.readChats.includes(chatId) ? prev : { ...prev, readChats: [...prev.readChats, chatId] });
    },
    donate(campaignId: string, amount: number, title: string) {
      const payment: PaymentMade = { id: uid('pm'), campaignId, campaign: title, amount, status: 'Completed', at: Date.now() };
      update(prev => ({ ...prev, donations: { ...prev.donations, [campaignId]: (prev.donations[campaignId] ?? 0) + amount }, paymentsMade: [payment, ...prev.paymentsMade] }));
      toast.success(`Thank you! $${amount} sent`, { description: title });
      award('r-donate', `Supported ${title}`);
    },
    createCampaign(input: NewCampaign) {
      const campaign: Campaign = { id: uid('camp'), ownerId: ME_ID, raised: 0, donors: 0, daysLeft: 30, ...input };
      const first = !latest.current.vibeys.awardedToday['r-campaign'];
      update(prev => ({ ...prev, myCampaigns: [campaign, ...prev.myCampaigns] }));
      toast.success('Campaign published');
      if (first) award('r-campaign', 'Published your first campaign');
    },
    redeem(rewardId: string) {
      const reward = rewards.find(item => item.id === rewardId);
      if (!reward) return;
      if (latest.current.vibeys.balance < reward.cost) {
        toast.error('Not enough Vibeys yet');
        return;
      }
      update(prev => ({ ...prev, redeemed: [...prev.redeemed, rewardId], vibeys: { ...prev.vibeys, balance: prev.vibeys.balance - reward.cost,
        log: [{ id: uid('v'), label: `Redeemed ${reward.name}`, points: -reward.cost, at: Date.now() }, ...prev.vibeys.log] } }));
      toast.success('Reward requested', { description: 'Your code will be emailed to ethan.carter@stanford.edu.' });
    },
    updateProfile(profile: Partial<typeof seedProfile>) {
      update(prev => ({ ...prev, profile: { ...prev.profile, ...profile } }));
    },
    markNoticesRead() {
      update(prev => ({ ...prev, noticesReadAt: Date.now() }));
    },

    /* Account (profile.php) */
    saveAccount(next: Account): string | null {
      const firstName = next.firstName.trim();
      const lastName = next.lastName.trim();
      const username = next.username.trim().toLowerCase();
      const nameError = identityError(firstName, lastName, username);
      if (nameError) return nameError;
      if (!isEmail(next.email)) return 'Enter a valid email address.';
      const phone = digits(next.phone);
      if (phone && (phone.length < 10 || phone.length > 15)) return 'Phone numbers need 10 to 15 digits.';
      if (!/^\d{5}$/.test(next.zip.trim())) return 'Enter a 5-digit ZIP code.';
      update(prev => ({ ...prev, account: { ...next, firstName, lastName, username, email: next.email.trim(), zip: next.zip.trim() } }));
      toast.success('Account details saved');
      return null;
    },
    saveProfile(identity: Identity, profile: Pick<typeof seedProfile, 'headline' | 'about' | 'skills'>): string | null {
      const firstName = identity.firstName.trim();
      const lastName = identity.lastName.trim();
      const username = identity.username.trim().toLowerCase();
      const error = identityError(firstName, lastName, username);
      if (error) return error;
      update(prev => ({
        ...prev,
        account: { ...prev.account, ...identity, firstName, lastName, username },
        profile: { ...prev.profile, headline: profile.headline.trim(), about: profile.about.trim(), skills: profile.skills },
      }));
      toast.success('Profile updated');
      return null;
    },
    changePassword(password: PasswordChange): string | null {
      if (!password.current) return 'Enter your current password.';
      if (password.current !== DEMO_ACCOUNTS.student.password) return 'Your current password is incorrect.';
      if (password.next.length < 8 || !/[a-z]/i.test(password.next) || !/\d/.test(password.next)) return 'New passwords need 8+ characters with a letter and a number.';
      if (password.next === password.current) return 'Pick a password that’s different from your current one.';
      if (password.next !== password.confirm) return 'The new passwords don’t match.';
      toast.success('Password changed', { description: 'On byeuni.com this signs you out on other devices. The demo sign-in stays the same.' });
      return null;
    },
    /** Hides the profile until the next sign-in, which reactivates it. */
    deactivateAccount() {
      const next = { ...latest.current, deactivatedAt: Date.now() };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* Kept in memory only. */ }
      setLayer(next);
    },
    deleteAccount() {
      deleted.current = true;
      replyTimers.current.forEach(window.clearTimeout);
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* Nothing stored. */ }
    },
    setPhoto(photo: string) {
      update(prev => ({ ...prev, account: { ...prev.account, photo } }));
      toast.success(photo ? 'Profile photo updated' : 'Profile photo removed');
    },

    /* Contacts */
    addContact(input: ContactInput): string | null {
      const error = contactError(input, latest.current.contacts);
      if (error) return error;
      const contact: Contact = { id: uid('ct'), name: input.name.trim(), email: input.email.trim(), phone: input.phone.trim(), note: input.note.trim(), source: 'Manual', addedAt: Date.now() };
      update(prev => ({ ...prev, contacts: [contact, ...prev.contacts] }));
      toast.success(`${contact.name} added to your contacts`);
      return null;
    },
    editContact(id: string, input: ContactInput): string | null {
      const error = contactError(input, latest.current.contacts, id);
      if (error) return error;
      update(prev => ({ ...prev, contacts: prev.contacts.map(c => c.id === id ? { ...c, name: input.name.trim(), email: input.email.trim(), phone: input.phone.trim(), note: input.note.trim() } : c) }));
      toast.success('Contact updated');
      return null;
    },
    importContacts(list: ContactInput[], source: ContactSource) {
      const accepted: Contact[] = [];
      let skipped = 0;
      for (const input of list) {
        if (contactError(input, [...latest.current.contacts, ...accepted])) { skipped += 1; continue; }
        accepted.push({ id: uid('ct'), name: input.name.trim(), email: input.email.trim(), phone: input.phone.trim(), note: input.note.trim(), source, addedAt: Date.now() });
      }
      if (accepted.length) update(prev => ({ ...prev, contacts: [...accepted, ...prev.contacts] }));
      const skippedText = skipped ? `${skipped} skipped (duplicate or missing email).` : undefined;
      if (accepted.length) toast.success(`Imported ${accepted.length} contact${accepted.length === 1 ? '' : 's'}`, skippedText ? { description: skippedText } : undefined);
      else toast.error('No new contacts to import', skippedText ? { description: skippedText } : undefined);
    },
    removeContacts(ids: string[]) {
      update(prev => ({ ...prev, contacts: prev.contacts.filter(c => !ids.includes(c.id)) }));
      toast(`Removed ${ids.length} contact${ids.length === 1 ? '' : 's'}`);
    },
    inviteContacts(ids: string[], to: 'byeuni' | 'campaign') {
      const chosen = latest.current.contacts.filter(c => ids.includes(c.id) && !c.joined);
      if (!chosen.length) return;
      update(prev => ({ ...prev, contacts: prev.contacts.map(c => chosen.some(x => x.id === c.id) ? { ...c, invitedAt: Date.now(), invitedTo: to } : c) }));
      if (to === 'byeuni') actions.sendInvites(chosen.map(c => c.email));
      else toast.success(`Campaign invite sent to ${chosen.length} contact${chosen.length === 1 ? '' : 's'}`, { description: 'They’ll get a link to Fund my trip to HackMIT 2026.' });
    },

    /* PayPal and payments */
    linkPaypal(email: string): string | null {
      if (!isEmail(email)) return 'Enter the email on your PayPal account.';
      update(prev => ({ ...prev, paypal: { email: email.trim(), linkedAt: Date.now() } }));
      toast.success('PayPal linked', { description: 'Donations to your campaigns now go straight to this account.' });
      return null;
    },
    unlinkPaypal() {
      update(prev => ({ ...prev, paypal: null }));
      toast('PayPal unlinked', { description: 'Link an account again before your campaigns can take donations.' });
    },
    setAutopay(id: string, active: boolean) {
      update(prev => ({ ...prev, autopays: prev.autopays.map(a => a.id === id ? { ...a, active } : a) }));
      toast(active ? 'Autopay resumed' : 'Autopay cancelled');
    },

    /* Invite friends to ByeUni */
    sendInvites(emails: string[]): { sent: number; error?: string } {
      const known = new Set(latest.current.invites.map(i => i.email.toLowerCase()));
      const fresh = [...new Set(emails.map(e => e.trim().toLowerCase()).filter(Boolean))];
      const bad = fresh.filter(e => !isEmail(e));
      if (bad.length) return { sent: 0, error: `Check ${bad.length === 1 ? 'this address' : 'these addresses'}: ${bad.join(', ')}` };
      const toSend = fresh.filter(e => !known.has(e) && e !== latest.current.account.email.toLowerCase());
      if (!toSend.length) return { sent: 0, error: 'You’ve already invited everyone on that list.' };
      const today = dayKey();
      const sentToday = latest.current.invites.filter(i => dayKey(i.at) === today).length;
      const paid = Math.max(0, Math.min(toSend.length, INVITES_PER_DAY - sentToday));
      update(prev => ({ ...prev, invites: [...toSend.map(email => ({ id: uid('inv'), email, at: Date.now(), joined: false })), ...prev.invites] }));
      if (paid) award('r-invite', `Invited ${paid} friend${paid === 1 ? '' : 's'} to ByeUni`, { points: 20 * paid });
      else toast.success(`Invite${toSend.length === 1 ? '' : 's'} sent`, { description: `You’ve hit today’s ${INVITES_PER_DAY}-invite Vibeys limit. Invites still go out.` });
      return { sent: toSend.length };
    },

    /* Vibe Check and Student of the Day */
    checkVibe(entry: Omit<VibeEntry, 'date' | 'at'>) {
      const today = dayKey();
      const first = !latest.current.vibes.some(v => v.date === today);
      update(prev => ({ ...prev, vibes: [...prev.vibes.filter(v => v.date !== today), { ...entry, date: today, at: Date.now() }] }));
      if (first) award('r-vibe', 'Daily Vibe Check', { daily: true });
      else toast('Check-in updated');
    },
    sendKudos() {
      const today = dayKey();
      if (latest.current.kudosDay === today) return;
      update(prev => ({ ...prev, kudosDay: today }));
      award('r-kudos', 'Cheered the Student of the Day', { daily: true });
    },
    dismissSuggestion(personId: string) {
      update(prev => ({ ...prev, dismissed: [...prev.dismissed, personId] }));
    },

    /* CVision */
    setCv(patch: Partial<Omit<CvState, 'content'>>) {
      update(prev => ({ ...prev, cv: { ...prev.cv, ...patch } }));
    },
    setCvContent(patch: Partial<CvContent>) {
      update(prev => ({ ...prev, cv: { ...prev.cv, content: { ...prev.cv.content, ...patch } } }));
    },
    moveCvSection(id: CvSectionId, before: CvSectionId | null) {
      update(prev => {
        if (id === before) return prev;
        const rest = prev.cv.order.filter(item => item !== id);
        const at = before ? rest.indexOf(before) : rest.length;
        rest.splice(at < 0 ? rest.length : at, 0, id);
        return { ...prev, cv: { ...prev.cv, order: rest } };
      });
    },
    toggleCvSection(id: CvSectionId) {
      update(prev => ({ ...prev, cv: { ...prev.cv, hidden: prev.cv.hidden.includes(id) ? prev.cv.hidden.filter(x => x !== id) : [...prev.cv.hidden, id] } }));
    },
    resetCvDesign() {
      update(prev => ({ ...prev, cv: { ...seedCv, content: prev.cv.content } }));
      toast('CVision design reset');
    },
    resetDemo() {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* Nothing stored. */ }
      setLayer(freshLayer());
      toast('Demo data reset');
    },
  }), [update, award]);

  const today = dayKey();
  return {
    layer, stories, posts, connections, campaigns, communities, events, chats, notices, actions,
    profile: layer.profile, vibeys: layer.vibeys, redeemed: layer.redeemed, seenStories: layer.seenStories,
    account: layer.account, contacts: layer.contacts, paypal: layer.paypal, paymentsMade: layer.paymentsMade, autopays: layer.autopays,
    invites: layer.invites, vibes: layer.vibes, todayVibe: layer.vibes.find(v => v.date === today), kudosSent: layer.kudosDay === today,
    dismissed: layer.dismissed, cv: layer.cv, spotlight: spotlightFor(),
  };
}

export type DashboardStore = ReturnType<typeof useDashboardState>;
export type FeedPost = DashboardStore['posts'][number];
export type LiveCampaign = DashboardStore['campaigns'][number];

const StoreContext = createContext<DashboardStore | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const store = useDashboardState();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useDashboard() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useDashboard must be used inside DashboardProvider');
  return store;
}

export type ProfileStepId = 'photo' | 'headline' | 'about' | 'skills' | 'experience' | 'goals' | 'story' | 'paypal';
export type ProfileStep = { id: ProfileStepId; label: string; hint: string; done: boolean };

export const MIN_SKILLS = 5;

/** Everything "Profile completion" counts. Each step maps to a control that can finish it. */
export function useProfileSteps(): ProfileStep[] {
  const { profile, account, paypal, stories } = useDashboard();
  return [
    { id: 'photo', label: 'Upload your own profile photo', hint: 'Helps classmates and donors recognize you.', done: Boolean(account.photo) },
    { id: 'headline', label: 'Write a headline', hint: 'One line about what you study or build.', done: Boolean(profile.headline.trim()) },
    { id: 'about', label: 'Tell people about yourself', hint: 'A few sentences for your profile and CVision.', done: Boolean(profile.about.trim()) },
    { id: 'skills', label: `Add at least ${MIN_SKILLS} skills`, hint: profile.skills.length >= MIN_SKILLS ? `${profile.skills.length} skills on your profile.` : `${profile.skills.length} of ${MIN_SKILLS} added.`, done: profile.skills.length >= MIN_SKILLS },
    { id: 'experience', label: 'Add an internship, job, or role', hint: 'Shown in the Experience section of your CVision.', done: profile.experience.length > 0 },
    { id: 'goals', label: 'Set a goal', hint: 'What you’re working toward this year.', done: profile.goals.length > 0 },
    { id: 'story', label: 'Share your first story', hint: 'A photo from campus that disappears after a day.', done: stories.some(story => story.personId === ME_ID) },
    { id: 'paypal', label: 'Link PayPal for donations', hint: 'Your campaigns can’t take donations without it.', done: Boolean(paypal) },
  ];
}

export const completionOf = (steps: ProfileStep[]) => Math.round((steps.filter(step => step.done).length / steps.length) * 100);
