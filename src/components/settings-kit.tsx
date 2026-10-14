import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Bell, Check, Download, History, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown';
import { Switch } from '@/components/ui/switch';
import { downloadCsv } from '@/components/admin/ui';
import { cn } from '@/lib/utils';

/* Settings building blocks shared by the student dashboard, school portal, and admin console. */

/** Demo preferences live in browser storage and load after mount so server and client markup match. */
export function useStoredPrefs<T extends object>(key: string, defaults: T) {
  const [prefs, setPrefs] = useState<T>(defaults);
  const [savedAt, setSavedAt] = useState(0);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setPrefs({ ...defaults, ...(JSON.parse(raw) as Partial<T>) });
    } catch { /* Keep the defaults. */ }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = <K extends keyof T>(name: K, value: T[K]) => {
    const next = { ...prefs, [name]: value };
    setPrefs(next);
    setSavedAt(Date.now());
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Lasts for this page view. */ }
  };
  return { prefs, set, savedAt };
}

export function SavedHint({ at }: { at: number }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!at) return;
    setShown(true);
    const timer = window.setTimeout(() => setShown(false), 1800);
    return () => window.clearTimeout(timer);
  }, [at]);
  return <span className={cn('st-saved', shown && 'is-shown')} role="status">{shown ? <><Check /> Saved</> : null}</span>;
}

type RowProps = { icon: typeof Bell; title: string; note?: string };

export function SwitchRow({ icon: Icon, title, note, checked, onChange, disabled }: RowProps & { checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <label className={cn('st-row', disabled && 'is-off')}>
    <span className="st-ico"><Icon /></span>
    <span className="st-row-text"><strong>{title}</strong>{note ? <small>{note}</small> : null}</span>
    <Switch checked={checked && !disabled} onCheckedChange={onChange} disabled={disabled ?? false} />
  </label>;
}

export function ChoiceRow<T extends string>({ icon: Icon, title, note, value, onChange, options }: RowProps & { value: T; onChange: (value: T) => void; options: DropdownOption<T>[] }) {
  return <div className="st-row is-choice">
    <span className="st-ico"><Icon /></span>
    <span className="st-row-text"><strong>{title}</strong>{note ? <small>{note}</small> : null}</span>
    <Dropdown variant="pill" label={title} value={value} onChange={onChange} options={options} align="end" />
  </div>;
}

export function SettingsGroup({ title, note, children }: { title: string; note?: string | undefined; children: ReactNode }) {
  return <section className="db-panel st-group">
    <header><h3>{title}</h3>{note ? <p>{note}</p> : null}</header>
    <div className="st-rows">{children}</div>
  </section>;
}

/* ---------------- Activity log ---------------- */

export type ActivityTone = 'mint' | 'sky' | 'sun' | 'rose';
export type ActivityItem = { id: string; at: number; text: string; tone: ActivityTone; kind?: string | undefined };
type Range = 'all' | 'today' | 'week' | 'month';
const ranges: DropdownOption<Range>[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
];
const DAY = 86_400_000;
const PAGE = 25;
const dayLabel = (at: number) => isToday(at) ? 'Today' : isYesterday(at) ? 'Yesterday' : format(at, 'EEEE, MMM d');

/** Searchable, day-grouped history with optional kind filters and CSV export. */
export function ActivityLog({ items, kinds, filename, empty = 'Nothing here yet.' }: {
  items: ActivityItem[];
  kinds?: { value: string; label: string }[] | undefined;
  filename: string;
  empty?: string;
}) {
  const [query, setQuery] = useState('');
  const [range, setRange] = useState<Range>('all');
  const [kind, setKind] = useState('all');
  const [limit, setLimit] = useState(PAGE);
  const q = query.trim().toLowerCase();

  const shown = useMemo(() => {
    const since = range === 'today' ? new Date().setHours(0, 0, 0, 0) : range === 'week' ? Date.now() - 7 * DAY : range === 'month' ? Date.now() - 30 * DAY : 0;
    return [...items]
      .filter(item => item.at >= since && (kind === 'all' || item.kind === kind) && (!q || item.text.toLowerCase().includes(q)))
      .sort((a, b) => b.at - a.at);
  }, [items, range, kind, q]);
  useEffect(() => { setLimit(PAGE); }, [range, kind, q]);

  const groups = useMemo(() => {
    const out: { label: string; entries: ActivityItem[] }[] = [];
    for (const item of shown.slice(0, limit)) {
      const label = dayLabel(item.at);
      const last = out[out.length - 1];
      if (last?.label === label) last.entries.push(item);
      else out.push({ label, entries: [item] });
    }
    return out;
  }, [shown, limit]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of items) if (item.kind) map[item.kind] = (map[item.kind] ?? 0) + 1;
    return map;
  }, [items]);

  return <section className="db-panel act-log" aria-label="Activity history">
    <div className="act-tools">
      <label className="db-search-inline act-search">
        <Search aria-hidden="true" />
        <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search your activity" aria-label="Search your activity" />
      </label>
      <Dropdown variant="pill" label="Time range" value={range} onChange={setRange} options={ranges} align="end" />
      <Button variant="soft" size="icon" className="act-export" aria-label="Export as CSV" title="Export as CSV" disabled={!shown.length}
        onClick={() => downloadCsv(filename, ['Date', 'Time', 'Activity'], shown.map(item => [format(item.at, 'yyyy-MM-dd'), format(item.at, 'HH:mm'), item.text]))}>
        <Download />
      </Button>
    </div>
    {kinds?.length ? <div className="db-filter-row act-kinds">
      <button type="button" className="db-chip" aria-pressed={kind === 'all'} onClick={() => setKind('all')}>All</button>
      {kinds.filter(k => counts[k.value]).map(k => <button key={k.value} type="button" className="db-chip" aria-pressed={kind === k.value} onClick={() => setKind(k.value)}>
        {k.label}<em>{counts[k.value]}</em>
      </button>)}
    </div> : null}

    {groups.length ? groups.map(group => <div key={group.label} className="act-day">
      <h3>{group.label}</h3>
      <ul className="adm-audit act-list">
        {group.entries.map(entry => <li key={entry.id}>
          <i className={`is-${entry.tone}`} />
          <div><p>{entry.text}</p><small>{format(entry.at, 'h:mm a')}</small></div>
        </li>)}
      </ul>
    </div>) : <p className="act-empty"><History /> {q || range !== 'all' || kind !== 'all' ? 'No activity matches these filters.' : empty}</p>}

    {shown.length > limit ? <Button variant="soft" size="sm" className="act-more" onClick={() => setLimit(n => n + PAGE)}>Show {Math.min(PAGE, shown.length - limit)} more</Button> : null}
    <p className="act-foot">{shown.length} {shown.length === 1 ? 'entry' : 'entries'} · saved in this browser</p>
  </section>;
}
