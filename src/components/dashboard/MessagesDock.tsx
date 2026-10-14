import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Maximize2, MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { personById } from '@/content/dashboard-data';
import { cn } from '@/lib/utils';
import { Avatar, ProfileLink, timeAgo } from './shared';
import { useDashboard } from './store';

/** Floating inbox in the bottom corner, like Instagram's desktop Messages pill. */
export function MessagesDock() {
  const { chats, actions } = useDashboard();
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const scroller = useRef<HTMLDivElement>(null);
  const unread = chats.reduce((n, chat) => n + chat.unread, 0);
  const active = open && chatId ? chats.find(chat => chat.id === chatId) : undefined;
  const person = active ? personById(active.personId) : null;
  // Every sent message gets an auto-reply, so a fresh message of ours means they are typing.
  const typing = Boolean(active && active.last.from === 'me' && Date.now() - active.last.at < 4000);
  const faces = chats.slice(0, 3).map(chat => personById(chat.personId));

  useEffect(() => { if (active?.unread) actions.readChat(active.id); }, [active, actions]);
  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight }); }, [active?.id, active?.messages.length, typing]);

  if (!open) return <div className="db-msgdock">
    <button type="button" className="db-msgdock-pill" onClick={() => setOpen(true)} aria-label={unread ? `Messages, ${unread} unread` : 'Messages'}>
      <span className="db-msgdock-icon"><MessageCircle />{unread ? <em>{unread}</em> : null}</span>
      <span className="db-msgdock-label">Messages</span>
      <span className="db-msgdock-faces" aria-hidden="true">{faces.map(face => <Avatar key={face.id} person={face} size={28} online={false} />)}</span>
    </button>
  </div>;

  return <div className="db-msgdock">
    <section
      className="db-msgdock-panel"
      role="dialog"
      aria-label={person ? `Conversation with ${person.name}` : 'Messages'}
      onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}
    >
      <header className="db-msgdock-head">
        {active && person ? <>
          <button type="button" className="db-icon-btn" aria-label="Back to conversations" onClick={() => setChatId(null)}><ArrowLeft /></button>
          <ProfileLink personId={person.id} aria-label={`${person.name}'s profile`}><Avatar person={person} size={34} /></ProfileLink>
          <div><strong>{person.name}</strong><small>{person.online ? 'Active now' : person.school}</small></div>
        </> : <h2>Messages{unread ? <em>{unread}</em> : null}</h2>}
        <Link
          to="/dashboard"
          search={active ? { view: 'messages', chat: active.id } : { view: 'messages' }}
          className="db-icon-btn"
          aria-label="Open full inbox"
          title="Open full inbox"
          onClick={() => setOpen(false)}
        ><Maximize2 /></Link>
        <button type="button" className="db-icon-btn" aria-label="Close messages" onClick={() => setOpen(false)}><X /></button>
      </header>

      {active && person ? <>
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
          <input autoFocus value={draft} onChange={e => setDraft(e.target.value)} placeholder={`Message ${person.name.split(' ')[0]}…`} aria-label="Write a message" />
          <Button variant="ink" size="icon" type="submit" aria-label="Send message" disabled={!draft.trim()}><Send /></Button>
        </form>
      </> : <div className="db-chat-list db-msgdock-list">
        <ul>
          {chats.map(chat => {
            const who = personById(chat.personId);
            return <li key={chat.id}>
              <button type="button" onClick={() => { setChatId(chat.id); setDraft(''); }}>
                <Avatar person={who} size={44} />
                <span><strong>{who.name}</strong><small className={chat.unread ? 'is-unread' : ''}>{chat.last.from === 'me' ? 'You: ' : ''}{chat.last.text}</small></span>
                <span className="db-chat-meta"><small>{timeAgo(chat.last.at)}</small>{chat.unread ? <em>{chat.unread}</em> : null}</span>
              </button>
            </li>;
          })}
        </ul>
      </div>}
    </section>
  </div>;
}
