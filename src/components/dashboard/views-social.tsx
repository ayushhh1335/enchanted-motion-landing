import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeft, AtSign, BadgeCheck, Bookmark, Check, ChevronDown, FileUser, Flag, Grid3x3, HandHeart, Heart, ImagePlus, Lock, MapPin, Menu,
  MessageCircle, MoreHorizontal, Pencil, Plus, Search, Send, Share2, Sparkles, UserCheck, UserMinus, UserPlus, UserRound, Users,
  UsersRound, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ME_ID, isMajorMate, isSchoolmate, majorOf, me, people, personById, type NotificationKind, type Person,
} from '@/content/dashboard-data';
import { cn } from '@/lib/utils';
import { PostCard, PostDialog } from './Feed';
import { CampaignDetailDialog, CampaignDialog, CompleteProfileDialog, EditProfileDialog, ForumDialog } from './dialogs';
import { Avatar, Bar, EmptyState, ProfileLink, ViewLink, compact, timeAgo, usd, usePhotoPicker } from './shared';
import { completionOf, useDashboard, useProfileSteps, type FeedPost, type LiveCampaign } from './store';

export function ViewHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return <header className="db-view-head">
    <div><h1>{title}</h1>{subtitle ? <p>{subtitle}</p> : null}</div>
    {children ? <div className="db-view-actions">{children}</div> : null}
  </header>;
}

function Tabs<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { value: T; label: string; count?: number }[]; label: string }) {
  return <div className="db-tabs" role="tablist" aria-label={label}>
    {items.map(item => <button key={item.value} type="button" role="tab" aria-selected={value === item.value} onClick={() => onChange(item.value)}>
      {item.label}{item.count ? <em>{item.count}</em> : null}
    </button>)}
  </div>;
}

/* ---------------- Network ---------------- */

type Scope = 'all' | 'school' | 'major';

export function NetworkView({ scope: initialScope }: { scope?: 'school' | 'major' | undefined }) {
  const { connections, actions, chats } = useDashboard();
  const [tab, setTab] = useState<'requests' | 'suggestions' | 'connections'>(initialScope ? 'suggestions' : 'requests');
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<Scope>(initialScope ?? 'all');
  const inScope = (p: Person) => scope === 'all' || (scope === 'school' ? isSchoolmate(p) : isMajorMate(p));
  const others = people.filter(person => person.id !== ME_ID);
  const match = (name: string, extra: string) => `${name} ${extra}`.toLowerCase().includes(query.trim().toLowerCase());
  const incoming = others.filter(p => connections[p.id] === 'incoming');
  const suggestions = others.filter(p => ['none', 'pending'].includes(connections[p.id] ?? 'none') && inScope(p));
  const connected = others.filter(p => connections[p.id] === 'connected' && inScope(p));
  const scopeChips = <div className="db-filter-row">
    <button type="button" className="db-chip" aria-pressed={scope === 'all'} onClick={() => setScope('all')}>Everyone</button>
    <button type="button" className="db-chip" aria-pressed={scope === 'school'} onClick={() => setScope('school')}>School friends · {me.school.replace(' University', '')}</button>
    <button type="button" className="db-chip" aria-pressed={scope === 'major'} onClick={() => setScope('major')}>Major friends · {majorOf(me)}</button>
  </div>;

  return <div className="db-view">
    <ViewHeader title="My Network" subtitle="Students from your campus, your major, and beyond.">
      <label className="db-search-inline"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search people" aria-label="Search people" /></label>
    </ViewHeader>
    <Tabs label="Network sections" value={tab} onChange={setTab} items={[
      { value: 'requests', label: 'Requests', count: incoming.length },
      { value: 'suggestions', label: 'Suggestions' },
      { value: 'connections', label: 'Connections' },
    ]} />

    {tab === 'requests' ? <section className="db-card-grid">
      {incoming.filter(p => match(p.name, p.school)).map(person => <article key={person.id} className="db-panel db-person-card">
        <ProfileLink personId={person.id} aria-label={`${person.name}'s profile`}><Avatar person={person} size={84} /></ProfileLink>
        <strong><ProfileLink personId={person.id} className="db-name-link">{person.name}</ProfileLink></strong>
        <small>{person.major} · {person.school}</small>
        <small className="db-mutual"><Users /> {person.mutual} mutual connections</small>
        <div className="db-card-actions">
          <Button variant="ink" size="sm" onClick={() => { actions.setConnection(person.id, 'connected'); toast.success(`You and ${person.name.split(' ')[0]} are now connected`); }}><Check /> Accept</Button>
          <Button variant="soft" size="sm" onClick={() => actions.setConnection(person.id, 'declined')}>Decline</Button>
        </div>
      </article>)}
      {incoming.length === 0 ? <EmptyState icon={UserPlus} title="No pending requests" body="When someone wants to connect, you'll see them here." /> : null}
    </section> : null}

    {tab === 'suggestions' ? scopeChips : null}
    {tab === 'suggestions' ? <section className="db-card-grid">
      {suggestions.filter(p => match(p.name, `${p.school} ${p.major}`)).map(person => {
        const pending = connections[person.id] === 'pending';
        return <article key={person.id} className="db-panel db-person-card">
          <button type="button" className="db-dismiss" aria-label={`Dismiss ${person.name}`} onClick={() => actions.setConnection(person.id, 'declined')}><X /></button>
          <ProfileLink personId={person.id} aria-label={`${person.name}'s profile`}><Avatar person={person} size={84} /></ProfileLink>
          <strong><ProfileLink personId={person.id} className="db-name-link">{person.name}</ProfileLink> {person.verified ? <BadgeCheck className="db-verified" /> : null}</strong>
          <small>{person.major} · {person.school}</small>
          <small className="db-mutual"><MapPin /> {person.city}</small>
          <small className="db-mutual"><Users /> {person.mutual} mutual</small>
          <Button variant={pending ? 'soft' : 'ink'} size="sm" className="db-wide" onClick={() => actions.setConnection(person.id, pending ? 'none' : 'pending')}>
            {pending ? <><Check /> Request sent</> : <><UserPlus /> Connect</>}
          </Button>
        </article>;
      })}
      {suggestions.length === 0 ? <EmptyState icon={Users} title="You're all caught up" body="Check back after the next campus event." /> : null}
    </section> : null}

    {tab === 'connections' ? <section>
      {scopeChips}
      <ul className="db-panel db-row-list">
        {connected.filter(p => match(p.name, p.school)).map(person => {
          const chat = chats.find(item => item.personId === person.id);
          return <li key={person.id}>
            <ProfileLink personId={person.id} aria-label={`${person.name}'s profile`}><Avatar person={person} size={48} /></ProfileLink>
            <div><strong><ProfileLink personId={person.id} className="db-name-link">{person.name}</ProfileLink></strong><small>{person.major} · {person.school}</small></div>
            {chat ? <Button variant="soft" size="sm" asChild><Link to="/dashboard" search={{ view: 'messages', chat: chat.id }}><MessageCircle /> Message</Link></Button> : null}
          </li>;
        })}
        {connected.length === 0 ? <li className="db-muted">No connections in this group yet.</li> : null}
      </ul>
    </section> : null}
  </div>;
}

/* ---------------- Messages ---------------- */

export function MessagesView({ chatId }: { chatId?: string | undefined }) {
  const { chats, actions } = useDashboard();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const scroller = useRef<HTMLDivElement>(null);
  const active = chats.find(chat => chat.id === chatId);
  const person = active ? personById(active.personId) : null;
  // Every sent message gets an auto-reply, so a fresh message of ours means they are typing.
  const typing = Boolean(active && active.last.from === 'me' && Date.now() - active.last.at < 4000);

  useEffect(() => { if (active?.unread) actions.readChat(active.id); }, [active, actions]);
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' }); }, [active?.messages.length, typing]);

  const open = (id?: string) => navigate({ to: '/dashboard', search: id ? { view: 'messages', chat: id } : { view: 'messages' } });
  const filtered = chats.filter(chat => personById(chat.personId).name.toLowerCase().includes(query.trim().toLowerCase()));

  return <div className={cn('db-view db-messages', active && 'has-thread')}>
    <section className="db-panel db-chat-list" aria-label="Conversations">
      <header className="db-panel-head"><h2>Messages</h2><span className="db-muted">{chats.reduce((n, c) => n + c.unread, 0)} unread</span></header>
      <label className="db-search-inline"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search messages" aria-label="Search messages" /></label>
      <ul>
        {filtered.map(chat => {
          const who = personById(chat.personId);
          return <li key={chat.id}>
            <button type="button" className={cn(chat.id === active?.id && 'is-active')} onClick={() => open(chat.id)}>
              <Avatar person={who} size={48} />
              <span><strong>{who.name}</strong><small className={chat.unread ? 'is-unread' : ''}>{chat.last.from === 'me' ? 'You: ' : ''}{chat.last.text}</small></span>
              <span className="db-chat-meta"><small>{timeAgo(chat.last.at)}</small>{chat.unread ? <em>{chat.unread}</em> : null}</span>
            </button>
          </li>;
        })}
      </ul>
    </section>

    <section className="db-panel db-thread" aria-label={person ? `Conversation with ${person.name}` : 'Conversation'}>
      {active && person ? <>
        <header className="db-thread-head">
          <button type="button" className="db-icon-btn db-back" aria-label="Back to conversations" onClick={() => open()}><ArrowLeft /></button>
          <ProfileLink personId={person.id} aria-label={`${person.name}'s profile`}><Avatar person={person} size={42} /></ProfileLink>
          <div><strong><ProfileLink personId={person.id} className="db-name-link">{person.name}</ProfileLink></strong><small>{person.online ? 'Active now' : `${person.school}`}</small></div>
        </header>
        <div className="db-bubbles" ref={scroller}>
          {active.messages.map(message => <p key={message.id} className={cn('db-bubble', message.from === 'me' ? 'is-me' : 'is-them')}>
            {message.text}<small>{timeAgo(message.at)}</small>
          </p>)}
          {typing ? <p className="db-bubble is-them is-typing" aria-label={`${person.name} is typing`}><i /><i /><i /></p> : null}
        </div>
        <form className="db-thread-input" onSubmit={event => {
          event.preventDefault();
          if (!draft.trim()) return;
          actions.sendMessage(active.id, draft.trim());
          setDraft('');
        }}>
          <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={`Message ${person.name.split(' ')[0]}…`} aria-label="Write a message" />
          <Button variant="ink" size="icon" type="submit" aria-label="Send message" disabled={!draft.trim()}><Send /></Button>
        </form>
      </> : <EmptyState icon={MessageCircle} title="Your messages" body="Pick a conversation to keep it going." />}
    </section>
  </div>;
}

/* ---------------- Forums ---------------- */

export function CommunitiesView() {
  const { communities, actions } = useDashboard();
  const [tab, setTab] = useState<'joined' | 'discover'>('joined');
  const [creating, setCreating] = useState(false);
  const list = communities.filter(c => (tab === 'joined' ? c.joined : !c.joined));
  return <div className="db-view">
    <ViewHeader title="Forums" subtitle="Ask questions, share resources, and plan things together.">
      <Button variant="ink" onClick={() => setCreating(true)}><Plus /> Start a forum</Button>
    </ViewHeader>
    <Tabs label="Forum sections" value={tab} onChange={setTab} items={[
      { value: 'joined', label: 'Joined', count: communities.filter(c => c.joined).length },
      { value: 'discover', label: 'Discover' },
    ]} />
    <section className="db-card-grid is-wide">
      {list.map(c => <article key={c.id} className="db-panel db-forum-card">
        <img src={c.image} alt="" />
        <div>
          <span className="db-tag">{c.category}</span>
          <h3>{c.name}</h3>
          <p>{c.description}</p>
          <small><Users /> {c.members.toLocaleString('en-US')} members · {c.posts} new posts this week</small>
        </div>
        <Button variant={c.joined ? 'soft' : 'ink'} size="sm" onClick={() => { actions.toggleJoin(c.id); toast(c.joined ? `Left ${c.name}` : `Joined ${c.name}`); }}>
          {c.joined ? <><Check /> Joined</> : <><Plus /> Join</>}
        </Button>
      </article>)}
      {list.length === 0 ? <EmptyState icon={UsersRound} title={tab === 'joined' ? 'No forums yet' : "You've joined them all"} body={tab === 'joined' ? 'Join a forum from Discover or start your own.' : 'Start a new forum for your campus.'} /> : null}
    </section>
    <ForumDialog open={creating} onOpenChange={setCreating} />
  </div>;
}

/* ---------------- Notifications ---------------- */

const noticeIcon: Record<NotificationKind, typeof Heart> = {
  like: Heart, comment: MessageCircle, request: UserPlus, accepted: Check, forum: UsersRound, donation: HandHeart, vibeys: Sparkles,
};

export function NotificationsView() {
  const { notices, actions, connections } = useDashboard();
  return <div className="db-view">
    <ViewHeader title="Notifications" subtitle="Likes, comments, requests, and campaign support.">
      <Button variant="soft" onClick={actions.markNoticesRead}><Check /> Mark all as read</Button>
    </ViewHeader>
    <NoticeList notices={notices} connections={connections} onAccept={id => actions.setConnection(id, 'connected')} />
  </div>;
}

export function NoticeList({ notices, connections, onAccept, compactMode }: {
  notices: ReturnType<typeof useDashboard>['notices'];
  connections: ReturnType<typeof useDashboard>['connections'];
  onAccept: (id: string) => void;
  compactMode?: boolean;
}) {
  return <ul className={cn('db-panel db-notices', compactMode && 'is-compact')}>
    {notices.map(notice => {
      const Icon = noticeIcon[notice.kind];
      const person = notice.personId ? personById(notice.personId) : null;
      return <li key={notice.id} className={notice.unread ? 'is-unread' : ''}>
        <span className="db-notice-avatar">
          {person ? <Avatar person={person} size={44} /> : <span className="db-promo-icon is-sun"><Sparkles /></span>}
          <i className={`kind-${notice.kind}`}><Icon /></i>
        </span>
        <p>{person ? <strong><ProfileLink personId={person.id} className="db-name-link">{person.name}</ProfileLink> </strong> : null}{notice.text}<small>{timeAgo(notice.at)}</small></p>
        {notice.kind === 'request' && person && connections[person.id] === 'incoming'
          ? <Button variant="ink" size="sm" onClick={() => onAccept(person.id)}>Accept</Button>
          : notice.unread ? <span className="db-dot" aria-label="Unread" /> : null}
      </li>;
    })}
  </ul>;
}

/* ---------------- Saved ---------------- */

export function SavedView() {
  const { posts } = useDashboard();
  const saved = posts.filter(post => post.saved);
  return <div className="db-view db-feed">
    <ViewHeader title="Saved" subtitle="Posts you bookmarked to come back to." />
    {saved.length ? saved.map(post => <PostCard key={post.id} post={post} />) : <EmptyState icon={Bookmark} title="Nothing saved yet" body="Tap the bookmark on any post to keep it here." />}
  </div>;
}

/* ---------------- Profile (Instagram-style) ---------------- */

function PostGrid({ posts, label, empty }: { posts: FeedPost[]; label: string; empty: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return <section className="db-grid" aria-label={label}>
    {posts.map(post => <button key={post.id} type="button" className="db-tile" onClick={() => setOpenId(post.id)} aria-label={`Open post: ${post.text.slice(0, 60) || 'photo'}`}>
      {post.images[0] ? <img src={post.images[0]} alt="" loading="lazy" /> : <span className="db-tile-text">{post.text}</span>}
      {post.images.length > 1 ? <Grid3x3 className="db-tile-multi" aria-hidden="true" /> : null}
      <span className="db-tile-hover"><Heart /> {post.likes} <MessageCircle /> {post.comments.length}</span>
    </button>)}
    {posts.length === 0 ? empty : null}
    <PostDialog postId={openId} onClose={() => setOpenId(null)} />
  </section>;
}

function CampaignGrid({ campaigns, empty }: { campaigns: LiveCampaign[]; empty: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return <section className="db-card-grid is-wide">
    {campaigns.map(c => <article key={c.id} className="db-panel db-forum-card db-has-open">
      <img src={c.image} alt="" />
      <div>
        <span className="db-tag">{c.category}</span>
        <h3><button type="button" className="db-card-open" onClick={() => setOpenId(c.id)}>{c.title}</button></h3>
        <Bar value={c.raised} max={c.goal} />
        <small>{usd(c.raised)} of {usd(c.goal)} · {c.donors} donors · {c.daysLeft} days left</small>
      </div>
    </article>)}
    {campaigns.length === 0 ? empty : null}
    <CampaignDetailDialog campaignId={openId} onClose={() => setOpenId(null)} />
  </section>;
}

/** Link-in-bio to a student's CVision portfolio; your own id opens your editor. */
function CVisionBioLink({ personId, handle }: { personId: string; handle: string }) {
  return <Link
    to="/dashboard"
    search={personId === ME_ID ? { view: 'cvision' } : { view: 'cvision', person: personId }}
    className="db-bio-link"
    aria-label={personId === ME_ID ? 'Open your CVision' : `Open @${handle}'s CVision`}
  ><FileUser /> CVision portfolio</Link>;
}

export function ProfileView() {
  const { posts, stories, connections, vibeys, profile, campaigns, actions } = useDashboard();
  const [tab, setTab] = useState<'posts' | 'saved' | 'campaigns'>('posts');
  const [editing, setEditing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const picker = usePhotoPicker(([image]) => { if (image) actions.addStory(image, ''); });
  const steps = useProfileSteps();
  const completion = completionOf(steps);
  const mine = posts.filter(post => post.authorId === ME_ID);
  const saved = posts.filter(post => post.saved);
  const highlights = stories.filter(story => story.personId === ME_ID);
  const connected = Object.values(connections).filter(state => state === 'connected').length + 248;
  const myCampaigns = campaigns.filter(c => c.ownerId === ME_ID);

  return <div className="db-view db-profile">
    <section className="db-panel db-profile-hero">
      <Avatar person={me} size={120} ring={highlights.length ? 'story' : undefined} className="db-profile-photo" />
      <div className="db-profile-main">
        <div className="db-profile-name">
          <h1>{me.handle} <BadgeCheck className="db-verified" /></h1>
          <div>
            <Button variant="soft" size="sm" onClick={() => setEditing(true)}><Pencil /> Edit profile</Button>
            <Button variant="soft" size="sm" onClick={() => navigator.clipboard?.writeText(`https://byeuni.com/cVision.php?username=${me.handle}`).then(() => toast.success('Profile link copied'))}><Share2 /> Share</Button>
            <ViewLink view="settings" className="db-icon-btn db-profile-menu" aria-label="Settings and privacy"><Menu /></ViewLink>
          </div>
        </div>
        <dl className="db-profile-stats">
          <div><dd>{mine.length}</dd><dt>posts</dt></div>
          <div><dd>{connected}</dd><dt>connections</dt></div>
          <div><dd>{compact(vibeys.balance)}</dd><dt>vibeys</dt></div>
        </dl>
        <div className="db-profile-bio">
          <strong>{me.name}</strong>
          {profile.headline ? <p>{profile.headline}</p> : null}
          {profile.about ? <p className="db-profile-about">{profile.about}</p> : null}
          <span><AtSign /> {me.school} · {me.year} · {me.city}</span>
          <CVisionBioLink personId={ME_ID} handle={me.handle} />
        </div>
      </div>
    </section>

    {completion < 100 ? <section className="db-panel db-complete-strip">
      <div><strong>Your profile is {completion}% complete</strong><Bar value={completion} max={100} /></div>
      <Button variant="ink" size="sm" onClick={() => setCompleting(true)}>Finish profile</Button>
    </section> : null}

    <div className="db-highlights" aria-label="Story highlights">
      <button type="button" className="db-story" onClick={picker.open}><span className="db-story-add"><ImagePlus /></span><small>New</small></button>
      {highlights.map(story => <figure key={story.id} className="db-story"><span className="db-highlight"><img src={story.image} alt="" /></span><small>{story.caption || timeAgo(story.at)}</small></figure>)}
      {picker.element}
    </div>

    <Tabs label="Profile sections" value={tab} onChange={setTab} items={[
      { value: 'posts', label: 'Posts' }, { value: 'saved', label: 'Saved' }, { value: 'campaigns', label: 'Campaigns' },
    ]} />

    {tab === 'posts' ? <PostGrid posts={mine} label="Your posts" empty={<EmptyState icon={Grid3x3} title="No posts yet" body="Share an update, a project, or a campus moment from your home feed." />} /> : null}
    {tab === 'saved' ? <PostGrid posts={saved} label="Saved posts" empty={<EmptyState icon={Bookmark} title="Nothing saved yet" body="Tap the bookmark on any post to keep it here." />} /> : null}
    {tab === 'campaigns' ? <CampaignGrid campaigns={myCampaigns} empty={<EmptyState icon={HandHeart} title="No campaigns yet" body="Raise support for books, travel, equipment, or exams.">
      <Button variant="ink" size="sm" onClick={() => setCreating(true)}><Plus /> Start a campaign</Button>
    </EmptyState>} /> : null}

    <EditProfileDialog open={editing} onOpenChange={setEditing} />
    <CompleteProfileDialog open={completing} onOpenChange={setCompleting} />
    <CampaignDialog open={creating} onOpenChange={setCreating} />
  </div>;
}

/* ---------------- Someone else's profile ---------------- */

export function PersonProfileView({ personId }: { personId: string }) {
  const { posts, stories, connections, campaigns, chats, actions } = useDashboard();
  const [tab, setTab] = useState<'posts' | 'campaigns'>('posts');
  const person = people.find(p => p.id === personId && p.id !== ME_ID);

  if (!person) return <div className="db-view">
    <EmptyState icon={UserRound} title="Profile not found" body="This student may have left ByeUni or changed their username.">
      <ViewLink view="network" className="db-link">Find people in My Network</ViewLink>
    </EmptyState>
  </div>;

  const state = connections[person.id] ?? 'none';
  const first = person.name.split(' ')[0] ?? person.name;
  const chat = chats.find(c => c.personId === person.id);
  const hasStory = stories.some(story => story.personId === person.id);
  const sameSchool = person.school === me.school;
  const all = posts.filter(post => post.authorId === person.id);
  const visible = all.filter(post => post.audience === 'Public' || state === 'connected' || (post.audience === 'Campus' && sameSchool));
  const hidden = all.length - visible.length;
  const theirCampaigns = campaigns.filter(c => c.ownerId === person.id);
  const shareLink = () => navigator.clipboard?.writeText(`https://byeuni.com/cVision.php?username=${person.handle}`)
    .then(() => toast.success('Profile link copied'), () => toast.error('Could not copy the link'));

  const connectButton = state === 'connected'
    ? <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="soft" size="sm"><UserCheck /> Connected <ChevronDown /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="db-menu">
        <DropdownMenuItem onSelect={() => { actions.setConnection(person.id, 'none'); toast(`Removed ${first} from your connections`); }}><UserMinus />Remove connection</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    : state === 'incoming'
      ? <>
        <Button variant="ink" size="sm" onClick={() => { actions.setConnection(person.id, 'connected'); toast.success(`You and ${first} are now connected`); }}><Check /> Accept request</Button>
        <Button variant="soft" size="sm" onClick={() => actions.setConnection(person.id, 'declined')}>Decline</Button>
      </>
      : state === 'pending'
        ? <Button variant="soft" size="sm" onClick={() => actions.setConnection(person.id, 'none')}><Check /> Request sent</Button>
        : <Button variant="ink" size="sm" onClick={() => { actions.setConnection(person.id, 'pending'); toast.success(`Request sent to ${first}`); }}><UserPlus /> Connect</Button>;

  return <div className="db-view db-profile">
    <section className="db-panel db-profile-hero">
      <Avatar person={person} size={120} ring={hasStory ? 'story' : undefined} className="db-profile-photo" />
      <div className="db-profile-main">
        <div className="db-profile-name">
          <h1>{person.handle} {person.verified ? <BadgeCheck className="db-verified" aria-label="Verified" /> : null}</h1>
          <div>
            {connectButton}
            {chat ? <Button variant="soft" size="sm" asChild><Link to="/dashboard" search={{ view: 'messages', chat: chat.id }}><MessageCircle /> Message</Link></Button> : null}
            <Button variant="soft" size="sm" asChild><Link to="/dashboard" search={{ view: 'cvision', person: person.id }}><FileUser /> CVision</Link></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button type="button" className="db-icon-btn" aria-label={`More options for ${person.name}`}><MoreHorizontal /></button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="db-menu">
                <DropdownMenuItem onSelect={shareLink}><Share2 />Copy profile link</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toast('Thanks. Our moderators will review this profile.')}><Flag />Report profile</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <dl className="db-profile-stats">
          <div><dd>{visible.length}</dd><dt>posts</dt></div>
          <div><dd>{person.mutual}</dd><dt>mutual</dt></div>
          <div><dd>{theirCampaigns.length}</dd><dt>{theirCampaigns.length === 1 ? 'campaign' : 'campaigns'}</dt></div>
        </dl>
        <div className="db-profile-bio">
          <strong>{person.name}</strong>
          <p>{person.major} · {person.year}</p>
          <span><MapPin /> {person.school} · {person.city}</span>
          <CVisionBioLink personId={person.id} handle={person.handle} />
          {state === 'connected' ? <small className="db-muted">You’re connected</small> : state === 'incoming' ? <small className="db-muted">{first} wants to connect with you</small> : null}
        </div>
      </div>
    </section>

    <Tabs label={`${person.name}'s profile sections`} value={tab} onChange={setTab} items={[
      { value: 'posts', label: 'Posts' }, { value: 'campaigns', label: 'Campaigns' },
    ]} />

    {tab === 'posts' ? <>
      {hidden > 0 ? <p className="db-muted db-profile-note"><Lock /> {hidden} more {hidden === 1 ? 'post is' : 'posts are'} shared with {first}’s connections only.</p> : null}
      <PostGrid posts={visible} label={`${person.name}'s posts`} empty={<EmptyState icon={Grid3x3} title="No posts yet" body={`When ${first} shares something, it shows up here.`} />} />
    </> : null}
    {tab === 'campaigns' ? <CampaignGrid campaigns={theirCampaigns} empty={<EmptyState icon={HandHeart} title="No campaigns" body={`${first} isn’t fundraising right now.`} />} /> : null}
  </div>;
}
