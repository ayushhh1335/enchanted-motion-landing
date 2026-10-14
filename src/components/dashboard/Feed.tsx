import { useMemo, useRef, useState, type FormEvent, type RefObject } from 'react';
import {
  BadgeCheck, Bookmark, Building2, ChevronLeft, ChevronRight, Earth, Flag, Heart, ImagePlus, Lightbulb, Link2, Lock, MessageCircle, MoreHorizontal,
  Send, Share2, Smile, Trash2, Trophy, Users, X, HandHeart,
} from 'lucide-react';
import { toast } from 'sonner';
import { AnimatedTooltip } from '@/components/ui/animated-tooltip';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ME_ID, majorOf, me, personById, type Audience, type PostKind } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';
import { CampaignDialog } from './dialogs';
import { FriendsCarousel, InvitePromo } from './home-widgets';
import { LinkChips, LinkedText, findLinks } from './LinkPreview';
import { VibeysMini } from './Rails';
import { Avatar, EmptyState, ProfileLink, timeAgo, usePhotoPicker } from './shared';
import { useDashboard, type FeedPost } from './store';

const kinds: { kind: PostKind; label: string; icon: typeof Trophy; tone: string }[] = [
  { kind: 'Photo', label: 'Photo', icon: ImagePlus, tone: 'mint' },
  { kind: 'Project', label: 'Project', icon: Lightbulb, tone: 'sky' },
  { kind: 'Achievement', label: 'Achievement', icon: Trophy, tone: 'sun' },
  { kind: 'Fundraiser', label: 'Fundraiser', icon: HandHeart, tone: 'rose' },
];
const audienceIcon: Record<Audience, typeof Earth> = { Public: Earth, Campus: Building2, Connections: Users };
const audiences: DropdownOption<Audience>[] = [
  { value: 'Public', icon: Earth, description: 'Anyone on or off ByeUni' },
  { value: 'Campus', icon: Building2, description: `Students at ${me.school}` },
  { value: 'Connections', icon: Users, description: 'Only people you’re connected with' },
];
const quickEmoji = ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'];

type FeedComment = FeedPost['comments'][number];

export function Composer({ autoFocus, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const { actions } = useDashboard();
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [kind, setKind] = useState<PostKind>('Update');
  const [audience, setAudience] = useState<Audience>('Public');
  const [campaignOpen, setCampaignOpen] = useState(false);
  const picker = usePhotoPicker(picked => setImages(list => [...list, ...picked].slice(0, 4)), { multiple: true });
  const links = useMemo(() => findLinks(text), [text]);
  const ready = text.trim().length > 0 || images.length > 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!ready) return;
    actions.createPost({ text: text.trim(), images, kind: kind === 'Update' && images.length ? 'Photo' : kind, audience });
    setText(''); setImages([]); setKind('Update');
    onDone?.();
  }

  return <form className="db-panel db-composer" onSubmit={submit}>
    <div className="db-composer-row">
      <Avatar person={me} size={44} />
      <textarea
        value={text}
        autoFocus={autoFocus}
        rows={text ? 3 : 1}
        maxLength={2000}
        onChange={event => setText(event.target.value)}
        placeholder="Share your ideas, projects, or campus moments…"
        aria-label="Write a post"
      />
    </div>
    <LinkChips links={links} />
    {images.length ? <div className={cn('db-compose-media', `n${images.length}`)}>
      {images.map((src, i) => <figure key={src.slice(-24) + i}>
        <img src={src} alt={`Attachment ${i + 1}`} />
        <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => setImages(list => list.filter((_, j) => j !== i))}><X /></button>
      </figure>)}
      {images.length < 4 ? <button type="button" className="db-compose-more" onClick={picker.open}><ImagePlus /><span>Add</span></button> : null}
    </div> : null}
    <div className="db-composer-tools">
      {kinds.map(item => <button
        key={item.kind}
        type="button"
        className={cn('db-chip', `tone-${item.tone}`)}
        aria-pressed={kind === item.kind}
        onClick={() => {
          if (item.kind === 'Photo') { setKind('Photo'); picker.open(); return; }
          if (item.kind === 'Fundraiser') { setCampaignOpen(true); return; }
          setKind(current => current === item.kind ? 'Update' : item.kind);
        }}
      ><item.icon /><span>{item.label}</span></button>)}
    </div>
    {(ready || kind !== 'Update') ? <div className="db-composer-foot">
      <Dropdown variant="pill" label="Who can see this" value={audience} onChange={setAudience} options={audiences} />
      <span className="db-count">{text.length}/2000</span>
      <Button variant="ink" type="submit" disabled={!ready}>Post <Send /></Button>
    </div> : null}
    {picker.element}
    <CampaignDialog open={campaignOpen} onOpenChange={setCampaignOpen} />
  </form>;
}

function sharePost(post: FeedPost) {
  const author = personById(post.authorId);
  const url = `${window.location.origin}/dashboard?post=${post.id}`;
  if (navigator.share) navigator.share({ title: `${author.name} on ByeUni`, text: post.text.slice(0, 100), url }).catch(() => undefined);
  else navigator.clipboard?.writeText(url).then(() => toast.success('Link copied'), () => toast.error('Could not copy the link'));
}

function PostHead({ post, onNavigate }: { post: FeedPost; onNavigate?: (() => void) | undefined }) {
  const { actions } = useDashboard();
  const author = personById(post.authorId);
  const AudienceIcon = audienceIcon[post.audience];
  const kind = kinds.find(item => item.kind === post.kind);
  return <header className="db-post-head">
    <ProfileLink personId={author.id} onClick={onNavigate} aria-label={`${author.name}'s profile`}><Avatar person={author} size={44} /></ProfileLink>
    <div>
      <strong><ProfileLink personId={author.id} onClick={onNavigate} className="db-name-link">{post.authorId === ME_ID ? 'You' : author.name}</ProfileLink> {author.verified ? <BadgeCheck className="db-verified" aria-label="Verified" /> : null}</strong>
      <small>{author.school} · {timeAgo(post.at)} · <AudienceIcon aria-label={post.audience} /></small>
    </div>
    {kind && post.kind !== 'Photo' ? <span className={cn('db-kind', `tone-${kind.tone}`)}><kind.icon />{kind.label}</span> : null}
    <DropdownMenu>
      <DropdownMenuTrigger asChild><button type="button" className="db-icon-btn" aria-label="Post options"><MoreHorizontal /></button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="db-menu">
        <DropdownMenuItem onSelect={() => actions.toggleSave(post.id)}><Bookmark />{post.saved ? 'Remove from saved' : 'Save post'}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => navigator.clipboard?.writeText(`${window.location.origin}/dashboard?post=${post.id}`).then(() => toast.success('Link copied'))}><Link2 />Copy link</DropdownMenuItem>
        <DropdownMenuSeparator />
        {post.authorId === ME_ID
          ? <DropdownMenuItem className="text-destructive" onSelect={() => actions.deletePost(post.id)}><Trash2 />Delete post</DropdownMenuItem>
          : <DropdownMenuItem onSelect={() => toast('Thanks. Our moderators will review this post.')}><Flag />Report post</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  </header>;
}

function Likers({ post }: { post: FeedPost }) {
  const likers = post.likedBy.map(personById);
  const first = post.liked ? 'you' : likers[0]?.name.split(' ')[0];
  return <span className="db-likers">
    {likers.length
      ? <AnimatedTooltip className="db-faces" items={likers.slice(0, 3).map(person => ({ id: person.id, name: person.name, designation: `${majorOf(person)} · ${person.school}`, avatar: <Avatar person={person} size={22} /> }))} />
      : <Heart className="db-heart-mini" />}
    <span>{post.likes === 0 ? 'Be the first to like this'
      : !first ? <b>{post.likes.toLocaleString('en-US')} likes</b>
        : post.likes === 1 ? <>Liked by <b>{first}</b></>
          : <>Liked by <b>{first}</b> and <b>{(post.likes - 1).toLocaleString('en-US')} others</b></>}</span>
  </span>;
}

function CommentForm({ postId, value, onChange, inputRef, emoji, autoFocus }: {
  postId: string; value: string; onChange: (value: string) => void; inputRef?: RefObject<HTMLInputElement | null>; emoji?: boolean; autoFocus?: boolean;
}) {
  const { actions } = useDashboard();
  return <form className="db-cmt-form" onSubmit={event => {
    event.preventDefault();
    if (!value.trim()) return;
    actions.addComment(postId, value.trim());
    onChange('');
  }}>
    {emoji ? <Popover>
      <PopoverTrigger asChild><button type="button" className="db-cmt-emoji-btn" aria-label="Add an emoji"><Smile /></button></PopoverTrigger>
      <PopoverContent side="top" align="start" className="db-cmt-emoji">
        {quickEmoji.map(item => <button key={item} type="button" onClick={() => { onChange(`${value}${item}`); inputRef?.current?.focus(); }}>{item}</button>)}
      </PopoverContent>
    </Popover> : <Avatar person={me} size={26} />}
    <input ref={inputRef} value={value} onChange={event => onChange(event.target.value)} placeholder="Add a comment…" aria-label="Add a comment" maxLength={500} autoFocus={autoFocus} />
    <button type="submit" className="db-cmt-post" disabled={!value.trim()}>Post</button>
  </form>;
}

function CommentHeart({ comment }: { comment: FeedComment }) {
  const { actions } = useDashboard();
  return <button type="button" className={cn('db-cmt-heart', comment.liked && 'is-liked')} aria-pressed={comment.liked} aria-label={comment.liked ? 'Unlike comment' : 'Like comment'} onClick={() => actions.toggleCommentLike(comment.id)}>
    <Heart />
  </button>;
}

/** One-line comment under a feed post. */
function CommentLine({ comment, onNavigate }: { comment: FeedComment; onNavigate?: (() => void) | undefined }) {
  const who = personById(comment.authorId);
  return <li className="db-cmt-line">
    <p><ProfileLink personId={who.id} onClick={onNavigate} className="db-name-link">{comment.authorId === ME_ID ? me.handle : who.handle}</ProfileLink> <LinkedText text={comment.text} /></p>
    <CommentHeart comment={comment} />
  </li>;
}

/** Full comment in the post view: face, text, then time, likes, and Reply. */
function CommentRow({ comment, postId, onReply, onNavigate }: { comment: FeedComment; postId: string; onReply: (handle: string) => void; onNavigate?: (() => void) | undefined }) {
  const { actions } = useDashboard();
  const who = personById(comment.authorId);
  const mine = comment.authorId === ME_ID;
  return <li className="db-cmt-row">
    <ProfileLink personId={who.id} onClick={onNavigate} aria-label={`${who.name}'s profile`}><Avatar person={who} size={32} /></ProfileLink>
    <div>
      <p><ProfileLink personId={who.id} onClick={onNavigate} className="db-name-link">{mine ? me.handle : who.handle}</ProfileLink> <LinkedText text={comment.text} /></p>
      <small>
        <span>{timeAgo(comment.at)}</span>
        {comment.likes ? <span>{comment.likes} like{comment.likes === 1 ? '' : 's'}</span> : null}
        <button type="button" onClick={() => onReply(mine ? me.handle : who.handle)}>Reply</button>
        {mine ? <button type="button" onClick={() => actions.deleteComment(postId, comment.id)}>Delete</button> : null}
      </small>
    </div>
    <CommentHeart comment={comment} />
  </li>;
}

export function PostCard({ post, onNavigate }: { post: FeedPost; onNavigate?: () => void }) {
  const { actions } = useDashboard();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [burst, setBurst] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const long = post.text.length > 240;
  const recent = post.comments.slice(-2);

  function likeFromMedia() {
    actions.toggleLike(post.id, true);
    setBurst(n => n + 1);
  }

  return <article className="db-panel db-post">
    <PostHead post={post} onNavigate={onNavigate} />

    {post.text ? <p className={cn('db-post-text', long && !expanded && 'is-clamped')}><LinkedText text={post.text} /></p> : null}
    {long ? <button type="button" className="db-link" onClick={() => setExpanded(v => !v)}>{expanded ? 'Show less' : 'See more'}</button> : null}

    {post.images.length ? <div className={cn('db-media', `n${Math.min(post.images.length, 4)}`)} onDoubleClick={likeFromMedia}>
      {post.images.slice(0, 4).map((src, i) => <img key={i} src={src} alt="" loading="lazy" />)}
      {burst ? <Heart key={burst} className="db-burst" aria-hidden="true" /> : null}
    </div> : null}

    <footer className="db-post-actions">
      <button type="button" aria-pressed={post.liked} className={post.liked ? 'is-liked' : ''} onClick={() => actions.toggleLike(post.id)}><Heart /><span>Like</span></button>
      <button type="button" onClick={() => setOpen(true)}><MessageCircle /><span>Comment</span></button>
      <button type="button" onClick={() => sharePost(post)}><Share2 /><span>Share</span></button>
      <button type="button" className={cn('db-save', post.saved && 'is-on')} aria-pressed={post.saved} aria-label={post.saved ? 'Remove from saved' : 'Save post'} onClick={() => actions.toggleSave(post.id)}><Bookmark /></button>
    </footer>

    <div className="db-post-stats"><Likers post={post} /></div>

    <div className="db-cmts">
      {post.comments.length > recent.length
        ? <button type="button" className="db-cmts-all" onClick={() => setOpen(true)}>View all {post.comments.length} comments</button>
        : null}
      {recent.length ? <ul className="db-cmt-lines">{recent.map(item => <CommentLine key={item.id} comment={item} onNavigate={onNavigate} />)}</ul> : null}
      <CommentForm postId={post.id} value={draft} onChange={setDraft} />
    </div>

    <PostDialog postId={open ? post.id : null} onClose={() => setOpen(false)} />
  </article>;
}

function MediaViewer({ images, onLike }: { images: string[]; onLike: () => void }) {
  const [index, setIndex] = useState(0);
  const [burst, setBurst] = useState(0);
  return <div className="db-pd-media" onDoubleClick={() => { onLike(); setBurst(n => n + 1); }}>
    <img key={index} src={images[index]} alt={`Photo ${index + 1} of ${images.length}`} />
    {images.length > 1 ? <>
      {index > 0 ? <button type="button" className="db-pd-nav is-prev" aria-label="Previous photo" onClick={() => setIndex(i => i - 1)}><ChevronLeft /></button> : null}
      {index < images.length - 1 ? <button type="button" className="db-pd-nav is-next" aria-label="Next photo" onClick={() => setIndex(i => i + 1)}><ChevronRight /></button> : null}
      <span className="db-pd-dots" aria-hidden="true">{images.map((_, i) => <i key={i} className={cn(i === index && 'is-on')} />)}</span>
    </> : null}
    {burst ? <Heart key={burst} className="db-burst" aria-hidden="true" /> : null}
  </div>;
}

/** Instagram-style post view: photos on the left, the caption and comment thread on the right. */
function PostDetail({ post, onNavigate }: { post: FeedPost; onNavigate: () => void }) {
  const { actions } = useDashboard();
  const author = personById(post.authorId);
  const [draft, setDraft] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const reply = (handle: string) => {
    setDraft(`@${handle} `);
    input.current?.focus();
  };

  return <div className={cn('db-pd', post.images.length && 'has-media')}>
    {post.images.length ? <MediaViewer images={post.images} onLike={() => actions.toggleLike(post.id, true)} /> : null}
    <div className="db-pd-side">
      <PostHead post={post} onNavigate={onNavigate} />
      <ul className="db-pd-thread">
        {post.text ? <li className="db-cmt-row is-caption">
          <ProfileLink personId={author.id} onClick={onNavigate} aria-label={`${author.name}'s profile`}><Avatar person={author} size={32} /></ProfileLink>
          <div>
            <p><ProfileLink personId={author.id} onClick={onNavigate} className="db-name-link">{author.handle}</ProfileLink> <LinkedText text={post.text} /></p>
            <small><span>{timeAgo(post.at)}</span></small>
          </div>
        </li> : null}
        {post.comments.map(item => <CommentRow key={item.id} comment={item} postId={post.id} onReply={reply} onNavigate={onNavigate} />)}
        {post.comments.length === 0 ? <li className="db-pd-empty"><MessageCircle /><strong>No comments yet</strong><small>Start the conversation.</small></li> : null}
      </ul>
      <footer className="db-pd-foot">
        <div className="db-pd-actions">
          <button type="button" aria-pressed={post.liked} className={cn(post.liked && 'is-liked')} aria-label={post.liked ? 'Unlike' : 'Like'} onClick={() => actions.toggleLike(post.id)}><Heart /></button>
          <button type="button" aria-label="Comment" onClick={() => input.current?.focus()}><MessageCircle /></button>
          <button type="button" aria-label="Share" onClick={() => sharePost(post)}><Send /></button>
          <button type="button" aria-pressed={post.saved} className={cn('db-pd-save', post.saved && 'is-on')} aria-label={post.saved ? 'Remove from saved' : 'Save post'} onClick={() => actions.toggleSave(post.id)}><Bookmark /></button>
        </div>
        <Likers post={post} />
        <small className="db-pd-when">{timeAgo(post.at) === 'Just now' ? 'Just now' : `${timeAgo(post.at)} ago`}</small>
        <CommentForm postId={post.id} value={draft} onChange={setDraft} inputRef={input} emoji />
      </footer>
    </div>
  </div>;
}

/** Opens one post with its full comment thread, from the feed or a profile grid. Reads the live post so likes and comments update in place. */
export function PostDialog({ postId, onClose }: { postId: string | null; onClose: () => void }) {
  const { posts } = useDashboard();
  const post = posts.find(item => item.id === postId);
  if (!post) return null;
  const author = personById(post.authorId);
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className={cn('db-dialog db-post-dialog', post.images.length && 'has-media')}>
      <DialogTitle className="sr-only">Post by {author.name}</DialogTitle>
      <DialogDescription className="sr-only">{post.text.slice(0, 120) || 'Photo post'}</DialogDescription>
      <PostDetail post={post} onNavigate={onClose} />
    </DialogContent>
  </Dialog>;
}

const feedFilters = ['For you', 'Campus', 'Connections'] as const;

export function Feed() {
  const { posts, connections } = useDashboard();
  const [filter, setFilter] = useState<(typeof feedFilters)[number]>('For you');
  const shown = posts.filter(post => {
    if (filter === 'Campus') return personById(post.authorId).school === me.school || post.authorId === ME_ID;
    if (filter === 'Connections') return connections[post.authorId] === 'connected' || post.authorId === ME_ID;
    return true;
  });

  return <div className="db-feed">
    <Composer />
    <div className="db-feed-filter" role="tablist" aria-label="Feed filter">
      {feedFilters.map(item => <button key={item} type="button" role="tab" aria-selected={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
    </div>
    {shown.length === 0 ? <EmptyState icon={Lock} title="Nothing here yet" body="Posts from this group will show up here." /> : null}
    {shown.map((post, i) => <div key={post.id} className="db-feed-item">
      <PostCard post={post} />
      {i === 1 ? <FriendsCarousel kind="school" /> : null}
      {i === 2 ? <div className="db-mobile-only db-feed-promos"><VibeysMini /><InvitePromo /></div> : null}
      {i === 3 ? <FriendsCarousel kind="major" /> : null}
    </div>)}
  </div>;
}
