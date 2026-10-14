import { useState, type ReactNode } from 'react';
import { LayoutGrid, type LucideIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type DockEntry = { id: string; label: string; icon: LucideIcon; count?: number | undefined; soft?: boolean | undefined };
export type DockLinkProps = { className: string; 'aria-current'?: 'page' | undefined; onClick?: (() => void) | undefined; children: ReactNode };

/**
 * The student `LeftRail` dock for the school and platform consoles: icons only, labels slide out on hover.
 * Every menu section is listed in the More card; the dock holds the busiest ones.
 */
export function ConsoleDock({ label, me, dock, groups, active, renderLink, extras }: {
  label: string;
  me: ReactNode;
  dock: DockEntry[];
  groups: { label: string; items: DockEntry[] }[];
  active: string;
  renderLink: (entry: DockEntry, props: DockLinkProps) => ReactNode;
  extras: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const inMore = !dock.some(entry => entry.id === active) && groups.some(group => group.items.some(entry => entry.id === active));
  const content = (entry: DockEntry) => <>
    <entry.icon /><span>{entry.label}</span>
    {entry.count ? <em className={cn(entry.soft && 'is-soft')}>{entry.count}</em> : null}
  </>;

  return <aside className={cn('db-dock adm-dock', open && 'is-open')} aria-label={label}>
    {me}
    <i className="db-dock-sep" aria-hidden="true" />
    <nav className="db-dock-nav" aria-label={label}>
      {dock.map(entry => <ConsoleDockLink key={entry.id} entry={entry} active={active} render={renderLink}>{content(entry)}</ConsoleDockLink>)}
    </nav>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn('db-dock-item db-dock-more', inMore && 'is-active')} aria-label="All sections">
          <LayoutGrid /><span>All sections</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" sideOffset={14} className="db-more adm-more">
        <div className="adm-more-groups">
          {groups.map(group => <div key={group.label} className="adm-more-group">
            <small>{group.label}</small>
            {group.items.map(entry => <ConsoleDockLink key={entry.id} entry={entry} active={active} render={renderLink} item="db-more-item" onClick={close}>
              <entry.icon /><span>{entry.label}</span>{entry.count ? <em className={cn(entry.soft && 'is-soft')}>{entry.count}</em> : null}
            </ConsoleDockLink>)}
          </div>)}
        </div>
        <i className="db-more-sep" aria-hidden="true" />
        <div className="adm-more-extras">{extras(close)}</div>
      </PopoverContent>
    </Popover>
  </aside>;
}

function ConsoleDockLink({ entry, active, render, item = 'db-dock-item', onClick, children }: {
  entry: DockEntry; active: string; render: (entry: DockEntry, props: DockLinkProps) => ReactNode; item?: string; onClick?: () => void; children: ReactNode;
}) {
  const current = entry.id === active;
  return <>{render(entry, { className: cn(item, current && 'is-active'), 'aria-current': current ? 'page' : undefined, onClick, children })}</>;
}
