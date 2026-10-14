import { useMemo, useState, type ReactNode } from 'react';
import { Download, HandHeart, Heart, HeartOff, MessageSquare, PenLine, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Confirm } from '@/components/admin/ui';
import { ActivityLog, type ActivityItem } from '@/components/settings-kit';
import { ME_ID, personById } from '@/content/dashboard-data';
import { Avatar, EmptyState, ProfileLink, timeAgo, usd } from './shared';
import { useDashboard, type FeedPost } from './store';
import { Tabs } from './views-social';

type ActivityTab = 'timeline' | 'likes' | 'posts';

const kinds = [
  { value: 'posts', label: 'Posts & stories' },
  { value: 'comments', label: 'Comments' },
  { value: 'donations', label: 'Donations' },
  { value: 'vibeys', label: 'Vibeys' },
  { value: 'invites', label: 'Invites' },
];
const snip = (text: string, max = 70) => text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

/** Instagram-style "Your activity": one timeline built from everything this demo account did, plus likes and posts to manage. */
export function MyActivity() {
  const { layer, posts, paymentsMade, vibeys, invites, actions } = useDashboard();
  const [tab, setTab] = useState<ActivityTab>('timeline');
  const [deleting, setDeleting] = useState<FeedPost | null>(null);

  const mine = useMemo(() => posts.filter(p => p.authorId === ME_ID), [posts]);
  const liked = useMemo(() => posts.filter(p => p.liked), [posts]);
  const comments = useMemo(() => posts.flatMap(post => post.comments.filter(c => c.authorId === ME_ID).map(comment => ({ comment, post }))), [posts]);
  const given = paymentsMade.filter(p => p.status === 'Completed').reduce((n, p) => n + p.amount, 0);

  const items = useMemo<ActivityItem[]>(() => [
    ...mine.map(p => ({ id: p.id, at: p.at, kind: 'posts', tone: 'mint' as const, text: `You shared ${p.kind === 'Update' ? 'an update' : `a ${p.kind.toLowerCase()}`}: “${snip(p.text)}”` })),
    ...layer.myStories.map(s => ({ id: s.id, at: s.at, kind: 'posts', tone: 'mint' as const, text: s.caption ? `You added to your story: “${snip(s.caption)}”` : 'You added a photo to your story' })),
    ...comments.map(({ comment, post }) => ({
      id: comment.id, at: comment.at, kind: 'comments', tone: 'sky' as const,
      text: `You commented “${snip(comment.text, 60)}” on ${post.authorId === ME_ID ? 'your post' : `${personById(post.authorId).name}’s post`}`,
    })),
    ...paymentsMade.map(p => ({
      id: p.id, at: p.at, kind: 'donations', tone: p.status === 'Refunded' ? 'rose' as const : 'sun' as const,
      text: p.status === 'Refunded' ? `Your ${usd(p.amount)} gift to “${p.campaign}” was refunded` : `You gave ${usd(p.amount)} to “${p.campaign}”${p.status === 'Pending' ? ' · pending' : ''}`,
    })),
    ...vibeys.log.map(v => ({ id: v.id, at: v.at, kind: 'vibeys', tone: 'sun' as const, text: `${v.points >= 0 ? 'Earned' : 'Spent'} ${Math.abs(v.points)} Vibeys · ${v.label}` })),
    ...invites.map(i => ({ id: i.id, at: i.at, kind: 'invites', tone: 'sky' as const, text: `You invited ${i.name ?? i.email} to ByeUni${i.joined ? ' · they joined' : ''}` })),
  ], [mine, layer.myStories, comments, paymentsMade, vibeys.log, invites]);

  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...layer }, null, 2)], { type: 'application/json' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: 'byeuni-my-information.json' });
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Your information was downloaded');
  }

  return <div className="act-view">
    <div className="db-panel act-summary">
      <dl>
        <div><dt><PenLine /> Posts</dt><dd>{mine.length}</dd></div>
        <div><dt><MessageSquare /> Comments</dt><dd>{comments.length}</dd></div>
        <div><dt><Heart /> Likes</dt><dd>{liked.length}</dd></div>
        <div><dt><HandHeart /> Given</dt><dd>{usd(given)}</dd></div>
      </dl>
      <Button variant="soft" size="sm" onClick={download}><Download /> Download your information</Button>
    </div>

    <Tabs label="Activity sections" value={tab} onChange={setTab} items={[
      { value: 'timeline', label: 'Timeline' },
      { value: 'likes', label: 'Likes', count: liked.length },
      { value: 'posts', label: 'Your posts', count: mine.length },
    ]} />

    {tab === 'timeline' ? <ActivityLog items={items} kinds={kinds} filename="byeuni-my-activity.csv" empty="Post, comment, or support a campaign and it shows up here." /> : null}

    {tab === 'likes' ? liked.length
      ? <ul className="db-panel act-posts">
        {liked.map(post => <PostRow key={post.id} post={post}>
          <Button variant="soft" size="sm" onClick={() => actions.toggleLike(post.id, false)}><HeartOff /> Unlike</Button>
        </PostRow>)}
      </ul>
      : <EmptyState icon={Heart} title="No likes yet" body="Posts you like show up here so you can find them again." /> : null}

    {tab === 'posts' ? mine.length
      ? <ul className="db-panel act-posts">
        {mine.map(post => <PostRow key={post.id} post={post}>
          <Button variant="soft" size="icon" className="act-delete" aria-label="Delete post" title="Delete post" onClick={() => setDeleting(post)}><Trash2 /></Button>
        </PostRow>)}
      </ul>
      : <EmptyState icon={PenLine} title="You haven’t posted yet" body="Share an update from your feed and it shows up here." /> : null}

    <Confirm open={deleting !== null} onOpenChange={open => { if (!open) setDeleting(null); }} title="Delete this post?" body="It’s removed from your profile and your friends’ feeds." confirmLabel="Delete"
      onConfirm={() => { if (deleting) actions.deletePost(deleting.id); }} />
  </div>;
}

function PostRow({ post, children }: { post: FeedPost; children: ReactNode }) {
  const author = personById(post.authorId);
  return <li className="act-post">
    <ProfileLink personId={author.id} aria-label={`${author.name}'s profile`}><Avatar person={author} size={36} /></ProfileLink>
    <div>
      <small><ProfileLink personId={author.id} className="db-name-link">{post.authorId === ME_ID ? 'You' : author.name}</ProfileLink> · {timeAgo(post.at)}</small>
      <p>{post.text}</p>
      <span className="act-post-meta"><Heart /> {post.likes} <MessageSquare /> {post.comments.length}</span>
    </div>
    {post.images[0] ? <img src={post.images[0]} alt="" loading="lazy" /> : null}
    {children}
  </li>;
}
