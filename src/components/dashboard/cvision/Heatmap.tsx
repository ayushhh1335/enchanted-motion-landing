import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { format, startOfDay, subDays } from 'date-fns';
import { ArrowUpRight, Code2, Flame, Github, Trophy } from 'lucide-react';

type Day = { date: Date; count: number };
type Activity = { days: Day[]; total: number; longest: number; current: number; best: Day };

/** Deterministic PRNG so a handle always renders the same sample history. */
function seeded(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleActivity(seed: string, weeks: number, intensity: number): Activity {
  const random = seeded(seed);
  const end = startOfDay(new Date());
  const span = (weeks - 1) * 7 + end.getDay() + 1;
  const days: Day[] = [];
  for (let i = span - 1; i >= 0; i -= 1) {
    const date = subDays(end, i);
    const weekday = date.getDay() > 0 && date.getDay() < 6;
    const season = 0.5 + 0.5 * Math.sin((span - i) / 19);
    const active = random() < (weekday ? 0.5 : 0.28) + season * 0.3;
    const count = active ? 1 + Math.floor(random() ** 2 * 11 * intensity * (0.6 + season)) : 0;
    days.push({ date, count });
  }
  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.count ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  for (let i = days.length - 1; i >= 0 && days[i]!.count > 0; i -= 1) current += 1;
  const best = days.reduce((top, day) => (day.count > top.count ? day : top), days[0]!);
  return { days, total: days.reduce((n, day) => n + day.count, 0), longest, current, best };
}

const level = (count: number) => (count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4);

function HeatGrid({ activity, unit }: { activity: Activity; unit: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const pin = () => { el.scrollLeft = el.scrollWidth; };
    pin();
    const observer = new ResizeObserver(pin);
    observer.observe(el);
    return () => observer.disconnect();
  }, [activity]);

  const weeks = Math.ceil(activity.days.length / 7);
  const months = Array.from({ length: weeks }, (_, w) => {
    const first = activity.days[w * 7];
    const prev = activity.days[(w - 1) * 7];
    if (!first) return '';
    if (w === 0) return first.date.getDate() <= 7 ? format(first.date, 'MMM') : '';
    return prev && prev.date.getMonth() !== first.date.getMonth() ? format(first.date, 'MMM') : '';
  });

  return <div className="cvp-heat-scroll" ref={scroller}>
    <div className="cvp-heat" style={{ '--weeks': weeks } as CSSProperties}>
      <div className="cvp-heat-months" aria-hidden="true">{months.map((label, i) => <span key={i}>{label}</span>)}</div>
      <div className="cvp-heat-days" aria-hidden="true"><span /><span>Mon</span><span /><span>Wed</span><span /><span>Fri</span><span /></div>
      <div className="cvp-heat-grid" role="img" aria-label={`${activity.total.toLocaleString('en-US')} ${unit} over ${weeks} weeks`}>
        {activity.days.map(day => <i key={day.date.getTime()} className={`is-l${level(day.count)}`} title={`${day.count || 'No'} ${unit} on ${format(day.date, 'EEE, MMM d')}`} />)}
      </div>
    </div>
  </div>;
}

function Legend() {
  return <span className="cvp-heat-legend" aria-hidden="true">Less {[0, 1, 2, 3, 4].map(n => <i key={n} className={`is-l${n}`} />)} More</span>;
}

export function GithubCard({ handle, sample }: { handle: string; sample: boolean }) {
  const activity = useMemo(() => sampleActivity(`gh:${handle}`, 53, 1), [handle]);
  return <article className="cvp-stat-card">
    <header className="cvp-stat-head">
      <span className="cvp-stat-mark"><Github /></span>
      <div><strong>GitHub</strong><a href={`https://github.com/${handle}`} target="_blank" rel="noreferrer">@{handle} <ArrowUpRight /></a></div>
      <b className="cvp-stat-total">{activity.total.toLocaleString('en-US')}<small>contributions this year</small></b>
    </header>
    <HeatGrid activity={activity} unit="contributions" />
    <footer className="cvp-stat-foot">
      {activity.current > 0 ? <span><Flame /> {activity.current}-day streak</span> : null}
      <span>Longest streak {activity.longest} days</span>
      <span>Best day {activity.best.count} on {format(activity.best.date, 'MMM d')}</span>
      <Legend />
    </footer>
    {sample ? <p className="cvp-sample">Sample activity. Visitors see your real GitHub graph once it is connected on byeuni.com.</p> : null}
  </article>;
}

const difficulties = [
  { id: 'easy', label: 'Easy', total: 873, share: 0.46 },
  { id: 'medium', label: 'Medium', total: 1828, share: 0.42 },
  { id: 'hard', label: 'Hard', total: 822, share: 0.12 },
] as const;

export function LeetcodeCard({ handle, sample }: { handle: string; sample: boolean }) {
  const activity = useMemo(() => sampleActivity(`lc:${handle}`, 26, 0.55), [handle]);
  const stats = useMemo(() => {
    const random = seeded(`lc-stats:${handle}`);
    const solved = 180 + Math.floor(random() * 260);
    const split = difficulties.map(d => ({ ...d, solved: Math.min(d.total, Math.round(solved * d.share)) }));
    return { split, solved: split.reduce((n, d) => n + d.solved, 0), rating: 1550 + Math.floor(random() * 450), top: (4 + random() * 14).toFixed(1) };
  }, [handle]);
  const total = difficulties.reduce((n, d) => n + d.total, 0);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const gap = 4;
  let offset = 0;

  return <article className="cvp-stat-card">
    <header className="cvp-stat-head">
      <span className="cvp-stat-mark is-leetcode"><Code2 /></span>
      <div><strong>LeetCode</strong><a href={`https://leetcode.com/u/${handle}`} target="_blank" rel="noreferrer">@{handle} <ArrowUpRight /></a></div>
      <b className="cvp-stat-total">{stats.rating.toLocaleString('en-US')}<small>contest rating · top {stats.top}%</small></b>
    </header>
    <div className="cvp-lc">
      <svg className="cvp-lc-ring" viewBox="0 0 110 110" role="img" aria-label={`${stats.solved} of ${total.toLocaleString('en-US')} problems solved`}>
        <circle cx="55" cy="55" r={radius} className="cvp-lc-track" />
        {stats.split.map(d => {
          const share = (d.solved / Math.max(1, stats.solved)) * circumference;
          const length = Math.max(0, share - gap);
          const arc = <circle key={d.id} cx="55" cy="55" r={radius} className={`cvp-lc-arc is-${d.id}`} strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} />;
          offset += share;
          return arc;
        })}
        <text x="55" y="53" textAnchor="middle" className="cvp-lc-num">{stats.solved}</text>
        <text x="55" y="70" textAnchor="middle" className="cvp-lc-sub">solved</text>
      </svg>
      <ul className="cvp-lc-bars">
        {stats.split.map(d => <li key={d.id} className={`is-${d.id}`}>
          <span>{d.label}</span><b>{d.solved}<small>/{d.total.toLocaleString('en-US')}</small></b>
          <i><em style={{ width: `${(d.solved / d.total) * 100}%` }} /></i>
        </li>)}
      </ul>
    </div>
    <HeatGrid activity={activity} unit="submissions" />
    <footer className="cvp-stat-foot">
      <span><Trophy /> {activity.total} submissions in 6 months</span>
      <span>Max streak {activity.longest} days</span>
      <Legend />
    </footer>
    {sample ? <p className="cvp-sample">Sample stats. Your public LeetCode profile replaces these on the live page.</p> : null}
  </article>;
}
