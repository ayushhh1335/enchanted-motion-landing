import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  ME_ID, autoReplies, seedCampaigns, seedChats, seedCommunities, seedConnections, seedEvents, seedJoined, seedMyCampaign,
  seedNotices, seedPosts, seedProfile, seedStories, vibeyRules, vibeysStart, rewards,
  type Audience, type Campaign, type Chat, type ChatMessage, type Comment, type Community, type Post, type PostKind, type Story,
} from '@/content/dashboard-data';

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
};

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
  };
}

function loadLayer(): UserLayer {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...freshLayer(), ...(JSON.parse(raw) as Partial<UserLayer>) };
  } catch { /* Fall back to a fresh demo. */ }
  return freshLayer();
}

export type NewPost = { text: string; images: string[]; kind: PostKind; audience: Audience };
export type NewCampaign = { title: string; goal: number; category: string; story: string; image: string };

function useDashboardState() {
  const [layer, setLayer] = useState<UserLayer>(loadLayer);
  const latest = useRef(layer);
  latest.current = layer;
  const replyTimers = useRef<number[]>([]);

  useEffect(() => {
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
      update(prev => ({ ...prev, donations: { ...prev.donations, [campaignId]: (prev.donations[campaignId] ?? 0) + amount } }));
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
    resetDemo() {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* Nothing stored. */ }
      setLayer(freshLayer());
      toast('Demo data reset');
    },
  }), [update, award]);

  return {
    layer, stories, posts, connections, campaigns, communities, events, chats, notices, actions,
    profile: layer.profile, vibeys: layer.vibeys, redeemed: layer.redeemed, seenStories: layer.seenStories,
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

export function profileCompletion(profile: typeof seedProfile, hasStory: boolean) {
  const checks = [
    Boolean(profile.headline), Boolean(profile.about), profile.skills.length >= 3, profile.experience.length > 0,
    profile.goals.length > 0, hasStory, profile.skills.length >= 8,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
