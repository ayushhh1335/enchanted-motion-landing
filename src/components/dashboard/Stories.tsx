import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Plus, Send, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ME_ID, me, personById, seedChats, type Story } from '@/content/dashboard-data';
import { Avatar, timeAgo, usePhotoPicker } from './shared';
import { useDashboard } from './store';

type Group = { personId: string; stories: Story[]; seen: boolean };

export function StoriesRail() {
  const { stories, seenStories, actions } = useDashboard();
  const [draft, setDraft] = useState<string | null>(null);
  const [viewing, setViewing] = useState<number | null>(null);
  const picker = usePhotoPicker(([picked]) => setDraft(picked ?? null));

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Story[]>();
    for (const story of stories) map.set(story.personId, [...(map.get(story.personId) ?? []), story]);
    const list = [...map.entries()].map(([personId, items]) => ({
      personId,
      stories: items.sort((a, b) => a.at - b.at),
      seen: items.every(story => seenStories.includes(story.id)),
    }));
    return list.sort((a, b) => (a.personId === ME_ID ? -1 : b.personId === ME_ID ? 1 : Number(a.seen) - Number(b.seen)));
  }, [stories, seenStories]);

  const mine = groups.find(group => group.personId === ME_ID);
  const others = groups.filter(group => group.personId !== ME_ID);

  return <section className="db-panel db-stories" aria-label="Stories">
    <header className="db-panel-head"><h2>Stories</h2></header>
    <div className="db-story-row">
      <div className="db-story">
        <button type="button" className="db-story-me" onClick={() => (mine ? setViewing(0) : picker.open())} aria-label={mine ? 'View your story' : 'Add to your story'}>
          {mine ? <Avatar person={me} size={64} ring={mine.seen ? 'seen' : 'story'} /> : <span className="db-story-add"><Plus /></span>}
        </button>
        <button type="button" className="db-story-plus" onClick={picker.open} aria-label="Upload a photo to your story"><Plus /></button>
        <small>Your story</small>
      </div>
      {others.map(group => {
        const person = personById(group.personId);
        return <button key={group.personId} type="button" className="db-story" onClick={() => setViewing(groups.indexOf(group))}>
          <Avatar person={person} size={64} ring={group.seen ? 'seen' : 'story'} />
          <small>{person.name.replace('Dr. ', '').split(' ')[0]}</small>
        </button>;
      })}
    </div>
    {picker.element}
    <StoryComposer image={draft} onClose={() => setDraft(null)} onShare={caption => { if (draft) actions.addStory(draft, caption); setDraft(null); }} onReplace={picker.open} />
    {viewing !== null && groups[viewing] ? <StoryViewer groups={groups} start={viewing} onClose={() => setViewing(null)} /> : null}
  </section>;
}

function StoryComposer({ image, onClose, onShare, onReplace }: { image: string | null; onClose: () => void; onShare: (caption: string) => void; onReplace: () => void }) {
  const [caption, setCaption] = useState('');
  useEffect(() => { if (!image) setCaption(''); }, [image]);
  return <Dialog open={Boolean(image)} onOpenChange={open => !open && onClose()}>
    <DialogContent className="db-dialog db-story-compose">
      <DialogTitle>New story</DialogTitle>
      <DialogDescription>Stories stay on your profile for 24 hours.</DialogDescription>
      {image ? <figure className="db-story-preview">
        <img src={image} alt="Story preview" />
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure> : null}
      <label className="db-field">Caption
        <input value={caption} maxLength={80} onChange={event => setCaption(event.target.value)} placeholder="Say something about this moment" />
      </label>
      <div className="db-dialog-actions">
        <Button variant="soft" type="button" onClick={onReplace}>Choose another</Button>
        <Button variant="ink" type="button" onClick={() => onShare(caption.trim())}>Share to story</Button>
      </div>
    </DialogContent>
  </Dialog>;
}

const STORY_MS = 5000;

function StoryViewer({ groups, start, onClose }: { groups: Group[]; start: number; onClose: () => void }) {
  const { actions } = useDashboard();
  const [groupIndex, setGroupIndex] = useState(start);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const heldAt = useRef(0);
  const [reply, setReply] = useState('');
  const [liked, setLiked] = useState<string[]>([]);

  const group = groups[groupIndex];
  const story = group?.stories[index];
  const person = group ? personById(group.personId) : me;
  const isMine = group?.personId === ME_ID;

  useEffect(() => { if (story) actions.markStorySeen(story.id); }, [story, actions]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') next();
      if (event.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function next() {
    if (group && index < group.stories.length - 1) setIndex(index + 1);
    else if (groupIndex < groups.length - 1) { setGroupIndex(groupIndex + 1); setIndex(0); }
    else onClose();
  }
  function prev() {
    if (index > 0) setIndex(index - 1);
    else if (groupIndex > 0) { setGroupIndex(groupIndex - 1); setIndex((groups[groupIndex - 1]?.stories.length ?? 1) - 1); }
  }

  if (!group || !story) return null;
  const hold = {
    onPointerDown: () => { heldAt.current = Date.now(); setPaused(true); },
    onPointerUp: () => setPaused(false),
    onPointerLeave: () => setPaused(false),
  };
  const tap = (go: () => void) => () => { if (Date.now() - heldAt.current < 250) go(); };

  function sendReply() {
    const text = reply.trim();
    if (!text) return;
    const chat = seedChats.find(item => item.personId === person.id);
    if (chat) actions.sendMessage(chat.id, `Replied to your story: ${text}`);
    toast.success(`Reply sent to ${person.name.split(' ')[0]}`);
    setReply('');
  }

  return <Dialog open onOpenChange={open => !open && onClose()}>
    <DialogContent className="db-story-viewer">
      <DialogTitle className="sr-only">{person.name}'s story</DialogTitle>
      <DialogDescription className="sr-only">{story.caption || 'Photo story'}</DialogDescription>
      <div className="db-story-frame" data-paused={paused || undefined}>
        <img key={story.id} src={story.image} alt={story.caption || `${person.name}'s story`} />
        <div className="db-story-progress">
          {group.stories.map((item, i) => <span key={item.id}>
            <i className={i < index ? 'is-done' : i === index ? 'is-active' : ''} style={i === index ? { animationDuration: `${STORY_MS}ms`, animationPlayState: paused ? 'paused' : 'running' } : undefined} onAnimationEnd={i === index ? next : undefined} />
          </span>)}
        </div>
        <header className="db-story-top">
          <Avatar person={person} size={36} />
          <div><strong>{isMine ? 'Your story' : person.name}</strong><small>{timeAgo(story.at)}</small></div>
          {isMine ? <button type="button" aria-label="Delete this story" onClick={() => { actions.deleteStory(story.id); if (group.stories.length === 1) onClose(); else setIndex(Math.max(0, index - 1)); }}><Trash2 /></button> : null}
          <button type="button" aria-label="Close stories" onClick={onClose}><X /></button>
        </header>
        <button type="button" className="db-story-tap is-prev" aria-label="Previous story" onClick={tap(prev)} {...hold}><ChevronLeft /></button>
        <button type="button" className="db-story-tap is-next" aria-label="Next story" onClick={tap(next)} {...hold}><ChevronRight /></button>
        {story.caption ? <p className="db-story-caption">{story.caption}</p> : null}
        {!isMine ? <form className="db-story-reply" onSubmit={event => { event.preventDefault(); sendReply(); }}>
          <input value={reply} onChange={event => setReply(event.target.value)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} placeholder={`Reply to ${person.name.split(' ')[0]}…`} aria-label="Reply to story" />
          <button type="button" aria-label="Like story" aria-pressed={liked.includes(story.id)} className={liked.includes(story.id) ? 'is-liked' : ''} onClick={() => setLiked(list => list.includes(story.id) ? list.filter(id => id !== story.id) : [...list, story.id])}><Heart /></button>
          <button type="submit" aria-label="Send reply"><Send /></button>
        </form> : null}
      </div>
    </DialogContent>
  </Dialog>;
}
