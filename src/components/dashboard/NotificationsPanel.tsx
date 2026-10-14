import { useEffect, useState } from 'react';
import { BellOff, CheckCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from './shared';
import { useDashboard } from './store';
import { NoticeList } from './views-social';

const DAY = 86_400_000;
type Filter = 'all' | 'unread' | 'requests';

/** Slides out beside the sidebar, like Instagram's notifications drawer. */
export function NotificationsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notices, connections, actions } = useDashboard();
  const [filter, setFilter] = useState<Filter>('all');
  const unread = notices.filter(n => n.unread).length;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const list = notices.filter(n => filter === 'all' || (filter === 'unread' ? n.unread : n.kind === 'request'));
  const today = new Date().setHours(0, 0, 0, 0);
  const groups = [
    { label: 'Today', items: list.filter(n => n.at >= today) },
    { label: 'This week', items: list.filter(n => n.at < today && n.at >= today - 6 * DAY) },
    { label: 'Earlier', items: list.filter(n => n.at < today - 6 * DAY) },
  ].filter(group => group.items.length);

  return <>
    <div className={cn('db-npanel-scrim', open && 'is-open')} onClick={onClose} aria-hidden="true" />
    <aside className={cn('db-npanel', open && 'is-open')} aria-label="Notifications" inert={!open}>
      <header className="db-npanel-head">
        <h2>Notifications</h2>
        <button type="button" className="db-icon-btn" title="Mark all as read" aria-label="Mark all as read" disabled={!unread} onClick={actions.markNoticesRead}><CheckCheck /></button>
        <button type="button" className="db-icon-btn" aria-label="Close notifications" onClick={onClose}><X /></button>
      </header>
      <div className="db-npanel-filters" role="tablist" aria-label="Filter notifications">
        {([['all', 'All'], ['unread', `Unread${unread ? ` · ${unread}` : ''}`], ['requests', 'Requests']] as const).map(([value, label]) =>
          <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)}>{label}</button>)}
      </div>
      <div className="db-npanel-body">
        {groups.map(group => <section key={group.label}>
          <h3>{group.label}</h3>
          <NoticeList compactMode notices={group.items} connections={connections} onAccept={id => actions.setConnection(id, 'connected')} />
        </section>)}
        {groups.length === 0 ? <EmptyState icon={BellOff} title={filter === 'unread' ? "You're all caught up" : 'Nothing here yet'} body="Likes, comments, requests, and campaign support show up here." /> : null}
      </div>
    </aside>
  </>;
}
