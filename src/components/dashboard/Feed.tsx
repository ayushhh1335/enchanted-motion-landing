import { useState, type FormEvent } from 'react';
import {
  BadgeCheck, Bookmark, Building2, Earth, Flag, Heart, ImagePlus, Lightbulb, Link2, Lock, MessageCircle, MoreHorizontal, Repeat2,
  Send, Share2, Trash2, Trophy, Users, X, HandHeart, Megaphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ME_ID, me, personById, schoolUpdates, type Audience, type PostKind } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';
import { CampaignDialog } from './dialogs';
import { Avatar, EmptyState, agoText, timeAgo, usePhotoPicker } from './shared';
import { useDashboard, type FeedPost } from './store';

const kinds: { kind: PostKind; label: string; icon: typeof Trophy; tone: string }[] = [
  { kind: 'Photo', label: 'Photo', icon: ImagePlus, tone: 'mint' },
  { kind: 'Project', label: 'Project', icon: Lightbulb, tone: 'sky' },
  { kind: 'Achievement', label: 'Achievement', icon: Trophy, tone: 'sun' },
  { kind: 'Fundraiser', label: 'Fundraiser', icon: HandHeart, tone: 'rose' },
];
const audienceIcon: Record<Audience, typeof Earth> = { Public: Earth, Campus: Building2, Connections: Users };

export function Composer({ autoFocus, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const { actions } = useDashboard();
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [kind, setKind] = useState<PostKind>('Update');
  const [audience, setAudience] = useState<Audience>('Public');
  const [campaignOpen, setCampaignOpen] = useState(false);
  const picker = usePhotoPicker(picked => setImages(list => [...list, ...picked].slice(0, 4)), { multiple: true });
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
      <label className="db-audience">
        <span className="sr-only">Who can see this</span>
        <select value={audience} onChange={event => setAudience(event.target.value as Audience)}>
          <option>Public</option><option>Campus</option><option>Connections</option>
        </select>
      </label>
      <span className="db-count">{text.length}/2000</span>
      <Button variant="ink" type="submit" disabled={!ready}>Post <Send /></Button>
    </div> : null}
    {picker.element}
    <CampaignDialog open={campaignOpen} onOpenChange={setCampaignOpen} />
  </form>;
}

export function PostCard({ post }: { post: FeedPost }) {
  const { actions } = useDashboard();
  const author = personById(post.authorId);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [burst, setBurst] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const AudienceIcon = audienceIcon[post.audience];
  const long = post.text.length > 240;
  const likers = post.likedBy.map(personById);
  const kind = kinds.find(item => item.kind === post.kind);

  function share() {
    const url = `${window.location.origin}/dashboard?post=${post.id}`;
    if (navigator.share) navigator.share({ title: `${author.name} on ByeUni`, text: post.text.slice(0, 100), url }).catch(() => undefined);
    else navigator.clipboard?.writeText(url).then(() => toast.success('Link copied'), () => toast.error('Could not copy the link'));
  }

  function likeFromMedia() {
    actions.toggleLike(post.id, true);
    setBurst(n => n + 1);
  }

  return <article className="db-panel db-post">
    <header className="db-post-head">
      <Avatar person={author} size={44} />
      <div>
        <strong>{post.authorId === ME_ID ? 'You' : author.name} {author.verified ? <BadgeCheck className="db-verified" aria-label="Verified" /> : null}</strong>
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
    </header>

    {post.text ? <p className={cn('db-post-text', long && !expanded && 'is-clamped')}>{post.text}</p> : null}
    {long ? <button type="button" className="db-link" onClick={() => setExpanded(v => !v)}>{expanded ? 'Show less' : 'See more'}</button> : null}

    {post.images.length ? <div className={cn('db-media', `n${Math.min(post.images.length, 4)}`)} onDoubleClick={likeFromMedia}>
      {post.images.slice(0, 4).map((src, i) => <img key={i} src={src} alt="" loading="lazy" />)}
      {burst ? <Heart key={burst} className="db-burst" aria-hidden="true" /> : null}
    </div> : null}

    <div className="db-post-stats">
      <span className="db-likers">
        {likers.length ? <span className="db-faces">{likers.slice(0, 3).map(person => <img key={person.id} src={person.photo} alt="" />)}</span> : <Heart className="db-heart-mini" />}
        {likeSummary(post.likes, post.liked ? 'You' : likers[0]?.name.split(' ')[0])}
      </span>
      <button type="button" className="db-link-muted" onClick={() => setShowComments(v => !v)}>{post.comments.length} comments · {post.reposts} reposts</button>
    </div>

    <footer className="db-post-actions">
      <button type="button" aria-pressed={post.liked} className={post.liked ? 'is-liked' : ''} onClick={() => actions.toggleLike(post.id)}><Heart /><span>Like</span></button>
      <button type="button" aria-expanded={showComments} onClick={() => setShowComments(v => !v)}><MessageCircle /><span>Comment</span></button>
      <button type="button" aria-pressed={post.reposted} className={post.reposted ? 'is-on' : ''} onClick={() => actions.toggleRepost(post.id)}><Repeat2 /><span>Repost</span></button>
      <button type="button" onClick={share}><Share2 /><span>Share</span></button>
      <button type="button" className={cn('db-save', post.saved && 'is-on')} aria-pressed={post.saved} aria-label={post.saved ? 'Remove from saved' : 'Save post'} onClick={() => actions.toggleSave(post.id)}><Bookmark /></button>
    </footer>

    {showComments ? <div className="db-comments">
      {post.comments.map(item => {
        const who = personById(item.authorId);
        return <div key={item.id} className="db-comment">
          <Avatar person={who} size={32} />
          <p><strong>{item.authorId === ME_ID ? 'You' : who.name}</strong>{item.text}<small>{timeAgo(item.at)}</small></p>
        </div>;
      })}
      <form className="db-comment-form" onSubmit={event => {
        event.preventDefault();
        if (!comment.trim()) return;
        actions.addComment(post.id, comment.trim());
        setComment('');
      }}>
        <Avatar person={me} size={32} />
        <input value={comment} onChange={event => setComment(event.target.value)} placeholder="Add a comment…" aria-label="Add a comment" autoFocus />
        <button type="submit" disabled={!comment.trim()} aria-label="Post comment"><Send /></button>
      </form>
    </div> : null}
  </article>;
}

function likeSummary(likes: number, first?: string) {
  if (likes === 0) return 'Be the first to like this';
  if (!first) return `${likes.toLocaleString('en-US')} likes`;
  return likes === 1 ? `${first}` : `${first} and ${(likes - 1).toLocaleString('en-US')} others`;
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
      {i === 1 ? <SchoolUpdates /> : null}
    </div>)}
  </div>;
}

function SchoolUpdates() {
  return <section className="db-panel db-updates" aria-label="Recent updates from your school">
    <header className="db-panel-head"><h2><Megaphone /> Recent updates · {me.school}</h2></header>
    {schoolUpdates.map(update => <article key={update.id}>
      <strong>{update.title}</strong>
      <p>{update.body}</p>
      <small>{agoText(update.at)}</small>
    </article>)}
  </section>;
}
