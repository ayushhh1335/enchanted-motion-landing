import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ImagePlus, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Dropdown } from '@/components/ui/dropdown';
import { Switch } from '@/components/ui/switch';
import { projectImage, type CvContent } from '@/content/cvision-data';
import type { Experience } from '@/content/dashboard-data';
import { imageFileToDataUrl } from '@/lib/image-file';
import { cn } from '@/lib/utils';
import { useDashboard } from '../store';

type OpenProps = { open: boolean; onOpenChange: (open: boolean) => void };
type FieldKind = 'text' | 'textarea' | 'url' | 'tags' | 'select' | 'image';
type Field = { key: string; label: string; kind?: FieldKind; required?: boolean; max?: number; placeholder?: string; options?: { value: string; label: string }[] };
type Row = { id: string } & Record<string, string>;

export type ListKind = 'now' | 'projects' | 'education' | 'writing' | 'testimonials' | 'socials' | 'experience' | 'goals';

const socialKinds = [
  { value: 'github', label: 'GitHub' }, { value: 'linkedin', label: 'LinkedIn' }, { value: 'x', label: 'X (Twitter)' },
  { value: 'instagram', label: 'Instagram' }, { value: 'website', label: 'Website' }, { value: 'email', label: 'Email' },
];

const specs: Record<ListKind, { title: string; description: string; noun: string; limit: number; fields: Field[] }> = {
  now: {
    title: 'Things I do', description: 'Clubs, side projects and roles you are active in right now.', noun: 'item', limit: 8,
    fields: [
      { key: 'title', label: 'Title', required: true, max: 60, placeholder: 'Stanford Hackers' },
      { key: 'detail', label: 'One line about it', kind: 'textarea', max: 160 },
      { key: 'link', label: 'Link (optional)', kind: 'url', placeholder: 'https://' },
    ],
  },
  projects: {
    title: 'Projects', description: 'Show what you built. Drag cards on the page to reorder them.', noun: 'project', limit: 12,
    fields: [
      { key: 'image', label: 'Cover image', kind: 'image' },
      { key: 'title', label: 'Project name', required: true, max: 60 },
      { key: 'description', label: 'What it does and who used it', kind: 'textarea', max: 280 },
      { key: 'tags', label: 'Stack (comma separated)', kind: 'tags', placeholder: 'React, TypeScript' },
      { key: 'link', label: 'Link (optional)', kind: 'url', placeholder: 'https://github.com/…' },
    ],
  },
  education: {
    title: 'Academic details', description: 'Schools, degrees and honors.', noun: 'school', limit: 6,
    fields: [
      { key: 'school', label: 'School', required: true, max: 80 },
      { key: 'degree', label: 'Degree or program', max: 90 },
      { key: 'period', label: 'Years', max: 30, placeholder: '2023 – 2027' },
      { key: 'detail', label: 'Honors, GPA, activities', kind: 'textarea', max: 200 },
    ],
  },
  writing: {
    title: 'Writing', description: 'Posts, essays or talks you want people to read.', noun: 'post', limit: 10,
    fields: [
      { key: 'title', label: 'Title', required: true, max: 120 },
      { key: 'date', label: 'Date', max: 20, placeholder: 'Sep 2026' },
      { key: 'link', label: 'Link (optional)', kind: 'url', placeholder: 'https://' },
    ],
  },
  testimonials: {
    title: 'Testimonials', description: 'Short quotes from managers, professors or teammates.', noun: 'quote', limit: 6,
    fields: [
      { key: 'quote', label: 'Quote', kind: 'textarea', required: true, max: 280 },
      { key: 'name', label: 'Name', required: true, max: 60 },
      { key: 'role', label: 'Role', max: 80, placeholder: 'Engineering Manager, Stripe' },
    ],
  },
  socials: {
    title: 'Contact & socials', description: 'Where people can find you.', noun: 'link', limit: 8,
    fields: [
      { key: 'kind', label: 'Network', kind: 'select', options: socialKinds },
      { key: 'url', label: 'Link', kind: 'url', required: true, placeholder: 'https:// or mailto:' },
    ],
  },
  experience: {
    title: 'Experience', description: 'Internships, jobs and leadership roles.', noun: 'role', limit: 10,
    fields: [
      { key: 'role', label: 'Role', required: true, max: 80 },
      { key: 'org', label: 'Organization', required: true, max: 80 },
      { key: 'period', label: 'Dates', max: 40, placeholder: 'Jun – Sep 2026' },
      { key: 'detail', label: 'What you did', kind: 'textarea', max: 280 },
    ],
  },
  goals: {
    title: 'Goals', description: 'What you are working toward.', noun: 'goal', limit: 8,
    fields: [{ key: 'text', label: 'Goal', required: true, max: 120 }],
  },
};

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const isLink = (value: string) => /^(https?:\/\/[^\s.]+\.[^\s]+|mailto:[^\s@]+@[^\s@]+\.[^\s@]+)$/i.test(value);

function toRows(items: object[]): Row[] {
  return items.map(item => {
    const row: Row = { id: '' };
    for (const [key, value] of Object.entries(item)) row[key] = Array.isArray(value) ? value.join(', ') : String(value ?? '');
    return row;
  });
}

function blankRow(kind: ListKind): Row {
  const row: Row = { id: newId(kind) };
  for (const field of specs[kind].fields) row[field.key] = field.kind === 'select' ? field.options?.[0]?.value ?? '' : '';
  return row;
}

function rowError(kind: ListKind, row: Row) {
  for (const field of specs[kind].fields) {
    const value = (row[field.key] ?? '').trim();
    if (field.required && !value) return `${field.label} is required.`;
    if (field.kind === 'url' && value && !isLink(value)) return `${field.label} must start with https:// or mailto:.`;
  }
  return null;
}

export function ListEditor({ kind, open, onOpenChange }: OpenProps & { kind: ListKind }) {
  const { cv, profile, actions } = useDashboard();
  const spec = specs[kind];
  const [rows, setRows] = useState<Row[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<{ id: string; message: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [imageFor, setImageFor] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const source = kind === 'experience' ? profile.experience
      : kind === 'goals' ? profile.goals.map((text, i) => ({ id: `goal-${i}`, text }))
        : cv.content[kind];
    const next = toRows(source);
    setRows(next);
    setOpenId(next[0]?.id ?? null);
    setError(null);
  }, [open, kind]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = (id: string, key: string, value: string) => {
    setRows(list => list.map(row => row.id === id ? { ...row, [key]: value } : row));
    if (error?.id === id) setError(null);
  };
  const move = (index: number, delta: number) => setRows(list => {
    const next = [...list];
    const [row] = next.splice(index, 1);
    if (row) next.splice(index + delta, 0, row);
    return next;
  });
  const add = () => {
    const row = blankRow(kind);
    setRows(list => [...list, row]);
    setOpenId(row.id);
  };

  function save() {
    for (const row of rows) {
      const message = rowError(kind, row);
      if (message) { setOpenId(row.id); setError({ id: row.id, message }); return; }
    }
    const clean = rows.map(row => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v.trim()]))) as Row[];
    if (kind === 'experience') actions.updateProfile({ experience: clean as unknown as Experience[] });
    else if (kind === 'goals') actions.updateProfile({ goals: clean.map(row => row['text'] ?? '') });
    else if (kind === 'projects') {
      actions.setCvContent({
        projects: clean.map(row => ({
          id: row.id, title: row['title'] ?? '', description: row['description'] ?? '', link: row['link'] ?? '', image: row['image'] || 'laptop',
          tags: (row['tags'] ?? '').split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 6),
        })),
      });
    } else actions.setCvContent({ [kind]: clean } as Partial<CvContent>);
    toast.success(`${spec.title} updated`);
    onOpenChange(false);
  }

  async function pickImage(file: File | undefined) {
    if (!file || !imageFor) return;
    try {
      patch(imageFor, 'image', await imageFileToDataUrl(file, 960, 0.8));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'That image could not be used.');
    }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="db-dialog cvp-editor">
      <DialogTitle>{spec.title}</DialogTitle>
      <DialogDescription>{spec.description}</DialogDescription>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={event => { void pickImage(event.target.files?.[0]); event.target.value = ''; }} />
      <ol className="cvp-ed-list">
        {rows.map((row, index) => {
          const expanded = openId === row.id;
          const label = row[spec.fields.find(f => f.kind !== 'image' && f.kind !== 'select')?.key ?? 'title'] || `New ${spec.noun}`;
          return <li key={row.id} className={cn('cvp-ed-row', expanded && 'is-open', error?.id === row.id && 'has-error')}>
            <div className="cvp-ed-head">
              <button type="button" className="cvp-ed-toggle" aria-expanded={expanded} onClick={() => setOpenId(expanded ? null : row.id)}>
                <ChevronDown /><span>{label}</span>
              </button>
              <button type="button" className="db-icon-btn" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></button>
              <button type="button" className="db-icon-btn" aria-label="Move down" disabled={index === rows.length - 1} onClick={() => move(index, 1)}><ArrowDown /></button>
              <button type="button" className="db-icon-btn" aria-label={`Remove ${label}`} onClick={() => setRows(list => list.filter(r => r.id !== row.id))}><Trash2 /></button>
            </div>
            {expanded ? <div className="db-form cvp-ed-body">
              {spec.fields.map(field => {
                const value = row[field.key] ?? '';
                if (field.kind === 'image') {
                  return <div key={field.key} className="cvp-ed-image">
                    <img src={projectImage(value)} alt="" />
                    <div>
                      <strong>{field.label}</strong>
                      <small>JPG or PNG. You can also drop an image straight onto the project card.</small>
                      <span>
                        <Button type="button" variant="soft" size="sm" onClick={() => { setImageFor(row.id); fileInput.current?.click(); }}><ImagePlus /> Upload</Button>
                        {value.startsWith('data:') ? <Button type="button" variant="ghost" size="sm" onClick={() => patch(row.id, 'image', '')}><RotateCcw /> Default</Button> : null}
                      </span>
                    </div>
                  </div>;
                }
                if (field.kind === 'select') {
                  return <label key={field.key} className="db-field">{field.label}
                    <Dropdown value={value} onChange={next => patch(row.id, field.key, next)} options={field.options ?? []} />
                  </label>;
                }
                if (field.kind === 'textarea') {
                  return <label key={field.key} className="db-field">{field.label}
                    <textarea rows={3} value={value} maxLength={field.max} onChange={e => patch(row.id, field.key, e.target.value)} />
                  </label>;
                }
                return <label key={field.key} className="db-field">{field.label}
                  <input
                    value={value}
                    maxLength={field.max ?? 300}
                    placeholder={field.placeholder}
                    inputMode={field.kind === 'url' ? 'url' : undefined}
                    onChange={e => patch(row.id, field.key, e.target.value)}
                  />
                </label>;
              })}
              {error?.id === row.id ? <p className="ac-error" role="alert">{error.message}</p> : null}
            </div> : null}
          </li>;
        })}
      </ol>
      {rows.length === 0 ? <p className="cvp-ed-empty">Nothing here yet. Add your first {spec.noun}.</p> : null}
      <div className="db-dialog-actions cvp-ed-actions">
        <Button type="button" variant="soft" onClick={add} disabled={rows.length >= spec.limit}><Plus /> Add {spec.noun}</Button>
        <span />
        <Button type="button" variant="soft" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button type="button" variant="ink" onClick={save}>Save</Button>
      </div>
    </DialogContent>
  </Dialog>;
}

export function IntroEditor({ open, onOpenChange }: OpenProps) {
  const { cv, actions } = useDashboard();
  const [status, setStatus] = useState('');
  const [openToWork, setOpenToWork] = useState(true);
  const [vision, setVision] = useState('');
  const [github, setGithub] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [showGithub, setShowGithub] = useState(true);
  const [showLeetcode, setShowLeetcode] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const c = cv.content;
    setStatus(c.status); setOpenToWork(c.openToWork); setVision(c.vision);
    setGithub(c.github); setLeetcode(c.leetcode); setShowGithub(c.showGithub); setShowLeetcode(c.showLeetcode);
    setError('');
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function save() {
    const handle = /^[A-Za-z0-9](?:[A-Za-z0-9_-]{0,38})$/;
    if (showGithub && !handle.test(github.trim())) return setError('Enter a valid GitHub username, or hide the GitHub graph.');
    if (showLeetcode && !handle.test(leetcode.trim())) return setError('Enter a valid LeetCode username, or hide the LeetCode card.');
    actions.setCvContent({ status: status.trim(), openToWork, vision: vision.trim(), github: github.trim(), leetcode: leetcode.trim(), showGithub, showLeetcode });
    toast.success('Intro updated');
    onOpenChange(false);
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="db-dialog cvp-editor">
      <DialogTitle>Intro & coding profiles</DialogTitle>
      <DialogDescription>Your status line, vision statement, and the activity graphs on your page.</DialogDescription>
      <div className="db-form">
        <label className="db-field">Status line<input value={status} maxLength={80} onChange={e => setStatus(e.target.value)} placeholder="Open to Summer 2027 SWE internships" /></label>
        <label className="cvp-switch-row"><span><strong>Open to work</strong><small>Shows a green badge next to your status.</small></span><Switch checked={openToWork} onCheckedChange={setOpenToWork} /></label>
        <label className="db-field">Vision statement<textarea rows={4} value={vision} maxLength={600} onChange={e => setVision(e.target.value)} /></label>
        <div className="db-field-row">
          <label className="db-field">GitHub username<input value={github} maxLength={39} onChange={e => { setGithub(e.target.value); setError(''); }} /></label>
          <label className="db-field">LeetCode username<input value={leetcode} maxLength={39} onChange={e => { setLeetcode(e.target.value); setError(''); }} /></label>
        </div>
        <label className="cvp-switch-row"><span><strong>Show GitHub contributions</strong><small>Year heatmap and streaks.</small></span><Switch checked={showGithub} onCheckedChange={setShowGithub} /></label>
        <label className="cvp-switch-row"><span><strong>Show LeetCode stats</strong><small>Solved by difficulty and submission heatmap.</small></span><Switch checked={showLeetcode} onCheckedChange={setShowLeetcode} /></label>
        {error ? <p className="ac-error" role="alert">{error}</p> : null}
        <div className="db-dialog-actions">
          <Button type="button" variant="soft" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" variant="ink" onClick={save}>Save</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
