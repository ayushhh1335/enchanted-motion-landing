import { useMemo, useRef, useState, type CSSProperties, type DragEvent, type FormEvent, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import {
  ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, Briefcase, Copy, Eye, EyeOff, FileUser, Github, Globe, GraduationCap, GripVertical, ImagePlus,
  Instagram, Linkedin, Mail, MapPin, MessageCircle, Palette, Pencil, Printer, Quote, RotateCcw, Send, Target, Twitter,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import {
  cvAccents, cvFonts, cvLayouts, cvSectionLabels, cvThemes, cvisionFor, projectImage, type CvProfile, type CvProject, type CvSectionId,
  type CvSocialKind, type CvState,
} from '@/content/cvision-data';
import { ME_ID, me, people, type Person } from '@/content/dashboard-data';
import { imageFileToDataUrl } from '@/lib/image-file';
import { cn } from '@/lib/utils';
import { ProfileDialog } from '../dialogs';
import { Bar, EmptyState, ProfileLink, ViewLink, faceTone, initials, usd } from '../shared';
import { useDashboard, type LiveCampaign } from '../store';
import { IntroEditor, ListEditor, type ListKind } from './editors';
import { GithubCard, LeetcodeCard } from './Heatmap';

const SECTION_MIME = 'application/x-cvp-section';
const PROJECT_MIME = 'application/x-cvp-project';

type Editor = ListKind | 'intro' | 'headline' | null;
type DropMark = { id: string; after: boolean } | null;
/** Whose page is rendered: your editable one, or another student's read-only one. */
type Owner = { person: Person; cv: CvState; profile: CvProfile; campaigns: LiveCampaign[] };

const cvisionLink = (handle: string) => `https://byeuni.com/cVision.php?username=${handle}`;
const firstName = (person: Person) => person.name.replace(/^(Dr|Prof)\.?\s+/, '').split(' ')[0] ?? person.name;
const copyLink = (link: string) => navigator.clipboard?.writeText(link)
  .then(() => toast.success('CVision link copied'), () => toast.error('Copy failed. Select the link and copy it manually.'));

const socialIcons: Record<CvSocialKind, typeof Github> = { github: Github, linkedin: Linkedin, x: Twitter, instagram: Instagram, website: Globe, email: Mail };
const socialLabel = (url: string) => url.replace(/^mailto:/, '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const hasFiles = (event: DragEvent) => event.dataTransfer.types.includes('Files');
const isAfter = (event: DragEvent<HTMLElement>) => {
  const box = event.currentTarget.getBoundingClientRect();
  return event.clientY > box.top + box.height / 2;
};

/** Returns the id a dragged item should be inserted before, given where it was dropped. */
function insertBefore<T extends string>(order: readonly T[], from: T, target: T, after: boolean): T | null {
  if (!after) return target;
  const rest = order.filter(id => id !== from);
  return rest[rest.indexOf(target) + 1] ?? null;
}

async function readImage(file: File | undefined) {
  if (!file) return null;
  try {
    return await imageFileToDataUrl(file, 960, 0.8);
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'That image could not be used.');
    return null;
  }
}

export function CVisionView() {
  const { cv, profile, campaigns } = useDashboard();
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [customizing, setCustomizing] = useState(false);
  const edit = mode === 'edit';
  const link = cvisionLink(me.handle);
  const strength = usePageStrength();
  const owner: Owner = { person: me, cv, profile, campaigns: campaigns.filter(c => c.ownerId === ME_ID) };

  return <div className={cn('db-view cvp-view', edit && 'is-edit')}>
    <header className="cvp-bar">
      <div className="cvp-bar-id">
        <strong>CVision</strong>
        <small>{link.replace('https://', '')}</small>
      </div>
      <div className="cvp-bar-strength" title="How complete your page is">
        <span>Page strength <b>{strength}%</b></span>
        <Bar value={strength} max={100} />
      </div>
      <div className="cvp-mode" role="group" aria-label="Page mode">
        <button type="button" aria-pressed={edit} onClick={() => setMode('edit')}><Pencil /> Edit</button>
        <button type="button" aria-pressed={!edit} onClick={() => setMode('preview')}><Eye /> Preview</button>
      </div>
      <div className="cvp-bar-actions">
        <Button variant="soft" size="sm" className="cvp-customize-btn" onClick={() => setCustomizing(true)}><Palette /> Customize</Button>
        <Button variant="soft" size="sm" onClick={() => copyLink(link)}><Copy /> Copy link</Button>
        <Button variant="soft" size="sm" onClick={() => window.print()} aria-label="Print or save as PDF"><Printer /><span className="cvp-hide-sm">Save PDF</span></Button>
      </div>
    </header>

    {edit ? <p className="cvp-hint"><GripVertical /> Drag sections to reorder them, drop images onto your photo or project cards, and pick a theme on the right.</p> : null}

    <div className={cn('cvp-studio', edit && 'is-edit')}>
      <Portfolio edit={edit} owner={owner} />
      {edit ? <aside className="cvp-dock" aria-label="Customize your page"><CustomizePanel /></aside> : null}
    </div>

    <Sheet open={customizing} onOpenChange={setCustomizing}>
      <SheetContent side="right" className="db-sheet cvp-sheet">
        <SheetTitle>Customize</SheetTitle>
        <SheetDescription>Theme, type, layout and section order. Changes save as you go.</SheetDescription>
        <CustomizePanel />
      </SheetContent>
    </Sheet>
    <span className="sr-only" aria-live="polite">{cv.theme} theme, {cv.font} font, {cv.layout} layout</span>
  </div>;
}

/** Another student's portfolio, read-only, opened from their profile. */
export function PersonCVisionView({ personId }: { personId: string }) {
  const { campaigns, chats } = useDashboard();
  const person = people.find(p => p.id === personId && p.id !== ME_ID);
  const data = useMemo(() => (person ? cvisionFor(person) : null), [person]);

  if (!person || !data) return <div className="db-view">
    <EmptyState icon={FileUser} title="CVision not found" body="This student may have left ByeUni or hasn’t published a CVision yet.">
      <ViewLink view="network" className="db-link">Find people in My Network</ViewLink>
    </EmptyState>
  </div>;

  const owner: Owner = { person, ...data, campaigns: campaigns.filter(c => c.ownerId === person.id) };
  const link = cvisionLink(person.handle);
  const chat = chats.find(c => c.personId === person.id);

  return <div className="db-view cvp-view">
    <header className="cvp-bar">
      <ProfileLink personId={person.id} className="db-icon-btn cvp-bar-back" aria-label={`Back to ${person.name}'s profile`}><ArrowLeft /></ProfileLink>
      <div className="cvp-bar-id">
        <strong>{firstName(person)}’s CVision</strong>
        <small>{link.replace('https://', '')}</small>
      </div>
      <div className="cvp-bar-actions">
        {chat ? <Button variant="soft" size="sm" asChild><Link to="/dashboard" search={{ view: 'messages', chat: chat.id }}><MessageCircle /><span className="cvp-hide-sm">Message</span></Link></Button> : null}
        <Button variant="soft" size="sm" onClick={() => copyLink(link)}><Copy /> Copy link</Button>
        <Button variant="soft" size="sm" onClick={() => window.print()} aria-label="Print or save as PDF"><Printer /><span className="cvp-hide-sm">Save PDF</span></Button>
      </div>
    </header>
    <div className="cvp-studio">
      <Portfolio edit={false} owner={owner} />
    </div>
  </div>;
}

function usePageStrength() {
  const { cv, profile } = useDashboard();
  const c = cv.content;
  const checks = [
    c.vision.length > 40, c.now.length >= 2, c.projects.length >= 3, profile.experience.length > 0, profile.skills.length >= 5,
    c.education.length > 0, c.socials.length >= 2, c.testimonials.length > 0, c.showGithub || c.showLeetcode, c.writing.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* ---------------- Portfolio canvas ---------------- */

function Portfolio({ edit, owner }: { edit: boolean; owner: Owner }) {
  const { actions } = useDashboard();
  const { cv, profile, campaigns } = owner;
  const [editor, setEditor] = useState<Editor>(null);
  const [dragging, setDragging] = useState<CvSectionId | null>(null);
  const [mark, setMark] = useState<DropMark>(null);
  const c = cv.content;

  const filled: Record<CvSectionId, boolean> = {
    about: Boolean(c.vision || profile.about), now: c.now.length > 0, experience: profile.experience.length > 0,
    projects: c.projects.length > 0, activity: c.showGithub || c.showLeetcode, skills: profile.skills.length > 0,
    education: c.education.length > 0, goals: profile.goals.length > 0, writing: c.writing.length > 0,
    testimonials: c.testimonials.length > 0, campaign: campaigns.length > 0, contact: true,
  };
  const sections = cv.order.filter(id => !cv.hidden.includes(id) && (edit || filled[id]));

  const editorFor: Partial<Record<CvSectionId, Editor>> = {
    about: 'intro', now: 'now', experience: 'experience', projects: 'projects', activity: 'intro', skills: 'headline',
    education: 'education', goals: 'goals', writing: 'writing', testimonials: 'testimonials', contact: 'socials',
  };

  const dragProps = (id: CvSectionId) => !edit ? {} : {
    draggable: true,
    onDragStart: (event: DragEvent<HTMLElement>) => {
      event.dataTransfer.setData(SECTION_MIME, id);
      event.dataTransfer.effectAllowed = 'move';
      setDragging(id);
    },
    onDragEnd: () => { setDragging(null); setMark(null); },
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (!event.dataTransfer.types.includes(SECTION_MIME)) return;
      event.preventDefault();
      const after = isAfter(event);
      if (mark?.id !== id || mark.after !== after) setMark({ id, after });
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      const from = event.dataTransfer.getData(SECTION_MIME) as CvSectionId;
      if (!from) return;
      event.preventDefault();
      if (from !== id) actions.moveCvSection(from, insertBefore(cv.order, from, id, isAfter(event)));
      setDragging(null); setMark(null);
    },
  };

  const pageStyle = { '--cvp-accent': cv.accent } as CSSProperties;

  return <article className={cn('cvp-page', edit && 'is-edit')} data-theme={cv.theme} data-font={cv.font} data-layout={cv.layout} style={pageStyle}>
    <div className="cvp-inner">
      <Hero edit={edit} owner={owner} onEdit={setEditor} />
      <div className="cvp-sections">
        {sections.map(id => <section
          key={id}
          id={`cvp-${id}`}
          className={cn('cvp-block', `is-${id}`, dragging === id && 'is-dragging', mark?.id === id && (mark.after ? 'is-drop-after' : 'is-drop-before'), !filled[id] && 'is-empty')}
          aria-labelledby={`cvp-${id}-title`}
          {...dragProps(id)}
        >
          <header className="cvp-block-head">
            {edit ? <span className="cvp-grip" title="Drag to reorder"><GripVertical /></span> : null}
            <h2 id={`cvp-${id}-title`}>{cvSectionLabels[id]}</h2>
            {edit ? <span className="cvp-block-tools">
              {id === 'campaign'
                ? <ViewLink view="campaigns" className="cvp-tool" aria-label="Manage campaigns"><Pencil /></ViewLink>
                : <button type="button" className="cvp-tool" aria-label={`Edit ${cvSectionLabels[id]}`} onClick={() => setEditor(editorFor[id] ?? null)}><Pencil /></button>}
              <button type="button" className="cvp-tool" aria-label={`Hide ${cvSectionLabels[id]}`} onClick={() => { actions.toggleCvSection(id); toast(`${cvSectionLabels[id]} hidden`, { action: { label: 'Undo', onClick: () => actions.toggleCvSection(id) } }); }}><EyeOff /></button>
            </span> : null}
          </header>
          <SectionBody id={id} edit={edit} owner={owner} onEdit={() => setEditor(editorFor[id] ?? null)} />
        </section>)}
      </div>
      <footer className="cvp-footer">
        <span>© {new Date().getFullYear()} {owner.person.name}</span>
        <span>Made with <b>ByeUni CVision</b></span>
      </footer>
    </div>

    {edit ? <>
      {editor && editor !== 'intro' && editor !== 'headline' ? <ListEditor kind={editor} open onOpenChange={open => { if (!open) setEditor(null); }} /> : null}
      <IntroEditor open={editor === 'intro'} onOpenChange={open => { if (!open) setEditor(null); }} />
      <ProfileDialog open={editor === 'headline'} onOpenChange={open => { if (!open) setEditor(null); }} />
    </> : null}
  </article>;
}

function Hero({ edit, owner, onEdit }: { edit: boolean; owner: Owner; onEdit: (editor: Editor) => void }) {
  const { actions } = useDashboard();
  const { cv, profile, person } = owner;
  const c = cv.content;
  const input = useRef<HTMLInputElement>(null);
  const [dropping, setDropping] = useState(false);
  const photo = c.photo || person.photo;

  async function setPhoto(file: File | undefined) {
    const url = await readImage(file);
    if (url) { actions.setCvContent({ photo: url }); toast.success('Photo updated'); }
  }

  return <header className="cvp-hero">
    <div className="cvp-hero-top">
      {edit ? <button
        type="button"
        className={cn('cvp-photo is-editable', dropping && 'is-dropping')}
        onClick={() => input.current?.click()}
        onDragOver={event => { if (hasFiles(event)) { event.preventDefault(); setDropping(true); } }}
        onDragLeave={() => setDropping(false)}
        onDrop={event => { if (!hasFiles(event)) return; event.preventDefault(); setDropping(false); void setPhoto(event.dataTransfer.files[0]); }}
        aria-label="Change photo"
      >
        <img src={photo} alt="" />
        <span><ImagePlus /></span>
      </button> : <span className="cvp-photo">
        {photo
          ? <img src={photo} alt={person.name} />
          : <b className="db-initials" style={{ background: faceTone(person.name), fontSize: 30 }} role="img" aria-label={person.name}>{initials(person.name)}</b>}
      </span>}
      <input ref={input} type="file" accept="image/*" hidden onChange={event => { void setPhoto(event.target.files?.[0]); event.target.value = ''; }} />
      {edit ? <div className="cvp-hero-tools">
        <Button variant="soft" size="sm" onClick={() => onEdit('intro')}><Pencil /> Intro</Button>
        <Button variant="soft" size="sm" onClick={() => onEdit('headline')}>Headline & skills</Button>
      </div> : null}
    </div>
    <h1>{person.name}</h1>
    <p className="cvp-headline">{profile.headline}</p>
    {c.status ? <p className={cn('cvp-status', c.openToWork && 'is-open')}><i aria-hidden="true" />{c.status}</p> : null}
    <ul className="cvp-meta">
      <li><GraduationCap /> {person.major} · {person.school}</li>
      <li><MapPin /> {person.city}</li>
    </ul>
    <div className="cvp-hero-foot">
      <a className="cvp-cta" href="#cvp-contact">Get in touch <ArrowUpRight /></a>
      <ul className="cvp-socials">
        {c.socials.map(social => {
          const Icon = socialIcons[social.kind];
          return <li key={social.id}><a href={social.url} target={social.kind === 'email' ? undefined : '_blank'} rel="noreferrer" aria-label={`${social.kind}: ${socialLabel(social.url)}`}><Icon /></a></li>;
        })}
      </ul>
    </div>
  </header>;
}

function SectionBody({ id, edit, owner, onEdit }: { id: CvSectionId; edit: boolean; owner: Owner; onEdit: () => void }) {
  const { cv, profile, campaigns } = owner;
  const c = cv.content;
  const emptyNote = (text: string) => <button type="button" className="cvp-empty" onClick={onEdit}>{text}</button>;

  switch (id) {
    case 'about':
      return <div className="cvp-about">
        {c.vision ? <p className="cvp-lead">{c.vision}</p> : edit ? emptyNote('Write a vision statement') : null}
        {profile.about ? <p className="cvp-muted">{profile.about}</p> : null}
      </div>;
    case 'now':
      if (!c.now.length) return edit ? emptyNote('Add clubs, roles or side projects') : null;
      return <ul className="cvp-list">
        {c.now.map(item => {
          const body = <><strong>{item.title}</strong><span>{item.detail}</span>{item.link ? <ArrowUpRight className="cvp-arrow" /> : null}</>;
          return <li key={item.id}>{item.link ? <a className="cvp-row" href={item.link} target="_blank" rel="noreferrer">{body}</a> : <div className="cvp-row">{body}</div>}</li>;
        })}
      </ul>;
    case 'experience':
      if (!profile.experience.length) return edit ? emptyNote('Add an internship or role') : null;
      return <ol className="cvp-timeline">
        {profile.experience.map(item => <li key={item.id}>
          <span className="cvp-dot"><Briefcase /></span>
          <div>
            <p className="cvp-tl-title"><strong>{item.role}</strong> <span>· {item.org}</span></p>
            <small>{item.period}</small>
            {item.detail ? <p>{item.detail}</p> : null}
          </div>
        </li>)}
      </ol>;
    case 'projects':
      return <Projects edit={edit} projects={c.projects} onEdit={onEdit} />;
    case 'activity':
      if (!c.showGithub && !c.showLeetcode) return edit ? emptyNote('Turn on GitHub or LeetCode stats') : null;
      return <div className="cvp-activity">
        {c.showGithub && c.github ? <GithubCard handle={c.github} sample={edit} /> : null}
        {c.showLeetcode && c.leetcode ? <LeetcodeCard handle={c.leetcode} sample={edit} /> : null}
      </div>;
    case 'skills':
      if (!profile.skills.length) return edit ? emptyNote('Add your skills') : null;
      return <ul className="cvp-skills">{profile.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>;
    case 'education':
      if (!c.education.length) return edit ? emptyNote('Add your school') : null;
      return <ol className="cvp-timeline">
        {c.education.map(item => <li key={item.id}>
          <span className="cvp-dot"><GraduationCap /></span>
          <div>
            <p className="cvp-tl-title"><strong>{item.school}</strong></p>
            <small>{[item.degree, item.period].filter(Boolean).join(' · ')}</small>
            {item.detail ? <p>{item.detail}</p> : null}
          </div>
        </li>)}
      </ol>;
    case 'goals':
      if (!profile.goals.length) return edit ? emptyNote('Add a goal') : null;
      return <ol className="cvp-goals">{profile.goals.map((goal, i) => <li key={goal}><span>{String(i + 1).padStart(2, '0')}</span><Target />{goal}</li>)}</ol>;
    case 'writing':
      if (!c.writing.length) return edit ? emptyNote('Add a post or talk') : null;
      return <ul className="cvp-writing">
        {c.writing.map(post => {
          const body = <><span>{post.title}</span><time>{post.date}</time></>;
          return <li key={post.id}>{post.link ? <a href={post.link} target="_blank" rel="noreferrer">{body}</a> : <div>{body}</div>}</li>;
        })}
      </ul>;
    case 'testimonials':
      if (!c.testimonials.length) return edit ? emptyNote('Add a testimonial') : null;
      return <div className="cvp-quotes">
        {c.testimonials.map(item => <figure key={item.id}>
          <Quote aria-hidden="true" />
          <blockquote>{item.quote}</blockquote>
          <figcaption><strong>{item.name}</strong><span>{item.role}</span></figcaption>
        </figure>)}
      </div>;
    case 'campaign': {
      if (!campaigns.length) return edit ? <ViewLink view="campaigns" className="cvp-empty">Start a campaign to show it here</ViewLink> : null;
      return <div className="cvp-campaigns">
        {campaigns.map(campaign => <article key={campaign.id} className="cvp-campaign">
          <img src={campaign.image} alt="" />
          <div>
            <small>{campaign.category} · {campaign.daysLeft} days left</small>
            <h3>{campaign.title}</h3>
            <Bar value={campaign.raised} max={campaign.goal} />
            <p><b>{usd(campaign.raised)}</b> raised of {usd(campaign.goal)} · {campaign.donors} supporters</p>
            <ViewLink view="campaigns" className="cvp-cta is-small">Support <ArrowUpRight /></ViewLink>
          </div>
        </article>)}
      </div>;
    }
    case 'contact':
      return <Contact owner={owner} />;
  }
}

function Projects({ edit, projects, onEdit }: { edit: boolean; projects: CvProject[]; onEdit: () => void }) {
  const { actions } = useDashboard();
  const [mark, setMark] = useState<(DropMark & { file: boolean }) | null>(null);

  if (!projects.length) return edit ? <button type="button" className="cvp-empty" onClick={onEdit}>Add your first project</button> : null;

  const setImage = async (id: string, file: File | undefined) => {
    const url = await readImage(file);
    if (url) actions.setCvContent({ projects: projects.map(p => p.id === id ? { ...p, image: url } : p) });
  };
  const reorder = (from: string, target: string, after: boolean) => {
    const rest = projects.filter(p => p.id !== from);
    const moving = projects.find(p => p.id === from);
    if (!moving) return;
    const before = insertBefore(projects.map(p => p.id), from, target, after);
    const at = before ? rest.findIndex(p => p.id === before) : rest.length;
    rest.splice(at, 0, moving);
    actions.setCvContent({ projects: rest });
  };

  const card = (project: CvProject) => {
    const drop = !edit ? {} : {
      draggable: true,
      onDragStart: (event: DragEvent<HTMLElement>) => {
        event.stopPropagation();
        event.dataTransfer.setData(PROJECT_MIME, project.id);
        event.dataTransfer.effectAllowed = 'move';
      },
      onDragOver: (event: DragEvent<HTMLElement>) => {
        const types = event.dataTransfer.types;
        if (!types.includes(PROJECT_MIME) && !types.includes('Files')) return;
        event.preventDefault();
        event.stopPropagation();
        const file = types.includes('Files');
        const box = event.currentTarget.getBoundingClientRect();
        const after = !file && event.clientX > box.left + box.width / 2;
        if (mark?.id !== project.id || mark.after !== after || mark.file !== file) setMark({ id: project.id, after, file });
      },
      onDragLeave: () => setMark(null),
      onDrop: (event: DragEvent<HTMLElement>) => {
        event.stopPropagation();
        event.preventDefault();
        setMark(null);
        if (event.dataTransfer.files.length) { void setImage(project.id, event.dataTransfer.files[0]); return; }
        const from = event.dataTransfer.getData(PROJECT_MIME);
        const box = event.currentTarget.getBoundingClientRect();
        if (from && from !== project.id) reorder(from, project.id, event.clientX > box.left + box.width / 2);
      },
      onDragEnd: () => setMark(null),
    };
    const marked = mark?.id === project.id;
    return <article key={project.id} className={cn('cvp-project', marked && (mark.file ? 'is-file-over' : mark.after ? 'is-drop-after' : 'is-drop-before'))} {...drop}>
      <figure>
        <img src={projectImage(project.image)} alt="" loading="lazy" />
        {edit ? <span className="cvp-project-drop"><ImagePlus /> Drop an image</span> : null}
      </figure>
      <div>
        <h3>{project.link ? <a href={project.link} target="_blank" rel="noreferrer">{project.title} <ArrowUpRight /></a> : project.title}</h3>
        <p>{project.description}</p>
        {project.tags.length ? <ul className="cvp-tags">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul> : null}
      </div>
    </article>;
  };

  return <div className="cvp-projects">{projects.map(card)}</div>;
}

function Contact({ owner }: { owner: Owner }) {
  const { cv, person } = owner;
  const mine = person.id === ME_ID;
  const first = firstName(person);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const mail = cv.content.socials.find(social => social.kind === 'email');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError('Please add your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError(`Enter a valid email so ${first} can reply.`);
    if (message.trim().length < 10) return setError('Write at least a short sentence.');
    setError('');
    setName(''); setEmail(''); setMessage('');
    if (mine) toast.success('Message sent', { description: 'Visitors’ messages land in your ByeUni inbox. This one was a preview.' });
    else toast.success(`Message sent to ${first}`, { description: 'In this demo, nothing leaves your browser.' });
  }

  return <div className="cvp-contact">
    <div>
      <p className="cvp-lead">Want to build something, hire me, or just say hi? My inbox is open.</p>
      <ul className="cvp-contact-links">
        {cv.content.socials.map(social => {
          const Icon = socialIcons[social.kind];
          return <li key={social.id}><a href={social.url} target={social.kind === 'email' ? undefined : '_blank'} rel="noreferrer"><Icon /><span>{socialLabel(social.url)}</span><ArrowUpRight className="cvp-arrow" /></a></li>;
        })}
      </ul>
      {mail || !mine ? null : <p className="cvp-muted">Add an email link so people can reach you directly.</p>}
    </div>
    <form className="cvp-form" onSubmit={submit} noValidate>
      <label>Name<input value={name} maxLength={80} onChange={e => setName(e.target.value)} autoComplete="name" /></label>
      <label>Email<input type="email" value={email} maxLength={120} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
      <label>Message<textarea rows={4} value={message} maxLength={1000} onChange={e => setMessage(e.target.value)} /></label>
      {error ? <p className="cvp-form-error" role="alert">{error}</p> : null}
      <button type="submit" className="cvp-cta"><Send /> Send message</button>
    </form>
  </div>;
}

/* ---------------- Customize panel ---------------- */

function CustomizePanel() {
  const { cv, actions } = useDashboard();
  const [tab, setTab] = useState<'style' | 'sections'>('style');

  return <div className="cvp-panel">
    <div className="cvp-panel-tabs" role="tablist" aria-label="Customize">
      <button type="button" role="tab" aria-selected={tab === 'style'} onClick={() => setTab('style')}>Style</button>
      <button type="button" role="tab" aria-selected={tab === 'sections'} onClick={() => setTab('sections')}>Sections</button>
    </div>
    {tab === 'style' ? <div className="cvp-panel-body">
      <PanelGroup title="Theme">
        <div className="cvp-themes">
          {cvThemes.map(theme => <button
            key={theme.id}
            type="button"
            className="cvp-theme"
            aria-pressed={cv.theme === theme.id}
            onClick={() => actions.setCv({ theme: theme.id })}
            style={{ '--sw-bg': theme.swatch[0], '--sw-ink': theme.swatch[1], '--sw-line': theme.swatch[2] } as CSSProperties}
          >
            <span className="cvp-theme-art"><i /><i /><i /></span>
            <span>{theme.label}</span>
          </button>)}
        </div>
      </PanelGroup>
      <PanelGroup title="Accent">
        <div className="cvp-accents">
          {cvAccents.map(color => <button key={color} type="button" aria-label={`Accent ${color}`} aria-pressed={cv.accent.toLowerCase() === color.toLowerCase()} style={{ background: color }} onClick={() => actions.setCv({ accent: color })} />)}
          <label className="cvp-accent-custom" title="Custom color">
            <input type="color" value={cv.accent} onChange={e => actions.setCv({ accent: e.target.value })} aria-label="Custom accent color" />
          </label>
        </div>
      </PanelGroup>
      <PanelGroup title="Font">
        <div className="cvp-fonts">
          {cvFonts.map(font => <button key={font.id} type="button" className="cvp-font" data-font={font.id} aria-pressed={cv.font === font.id} onClick={() => actions.setCv({ font: font.id })}>
            <b>Aa</b><span><strong>{font.label}</strong><small>{font.note}</small></span>
          </button>)}
        </div>
      </PanelGroup>
      <PanelGroup title="Layout">
        <div className="cvp-layouts">
          {cvLayouts.map(layout => <button key={layout.id} type="button" className="cvp-layout" aria-pressed={cv.layout === layout.id} onClick={() => actions.setCv({ layout: layout.id })}>
            <span className={`cvp-layout-art is-${layout.id}`}><i /><i /><i /><i /></span>
            <strong>{layout.label}</strong><small>{layout.note}</small>
          </button>)}
        </div>
      </PanelGroup>
      <Button variant="ghost" size="sm" onClick={actions.resetCvDesign}><RotateCcw /> Reset design</Button>
    </div> : <SectionOrder />}
  </div>;
}

function PanelGroup({ title, children }: { title: string; children: ReactNode }) {
  return <section className="cvp-panel-group"><h3>{title}</h3>{children}</section>;
}

function SectionOrder() {
  const { cv, actions } = useDashboard();
  const [mark, setMark] = useState<DropMark>(null);
  const [dragging, setDragging] = useState<CvSectionId | null>(null);

  const step = (id: CvSectionId, delta: -1 | 1) => {
    const index = cv.order.indexOf(id);
    if (delta === -1) actions.moveCvSection(id, cv.order[index - 1] ?? null);
    else actions.moveCvSection(id, cv.order[index + 2] ?? null);
  };

  return <div className="cvp-panel-body">
    <p className="cvp-panel-note">Drag to reorder, or use the arrows. Hidden sections stay saved.</p>
    <ol className="cvp-order">
      {cv.order.map((id, index) => {
        const hidden = cv.hidden.includes(id);
        return <li
          key={id}
          draggable
          className={cn(hidden && 'is-hidden', dragging === id && 'is-dragging', mark?.id === id && (mark.after ? 'is-drop-after' : 'is-drop-before'))}
          onDragStart={event => { event.dataTransfer.setData(SECTION_MIME, id); event.dataTransfer.effectAllowed = 'move'; setDragging(id); }}
          onDragEnd={() => { setDragging(null); setMark(null); }}
          onDragOver={event => {
            if (!event.dataTransfer.types.includes(SECTION_MIME)) return;
            event.preventDefault();
            const after = isAfter(event);
            if (mark?.id !== id || mark.after !== after) setMark({ id, after });
          }}
          onDrop={event => {
            const from = event.dataTransfer.getData(SECTION_MIME) as CvSectionId;
            event.preventDefault();
            if (from && from !== id) actions.moveCvSection(from, insertBefore(cv.order, from, id, isAfter(event)));
            setDragging(null); setMark(null);
          }}
        >
          <GripVertical className="cvp-order-grip" />
          <span>{cvSectionLabels[id]}</span>
          <button type="button" className="cvp-tool" aria-label={`Move ${cvSectionLabels[id]} up`} disabled={index === 0} onClick={() => step(id, -1)}><ArrowUp /></button>
          <button type="button" className="cvp-tool" aria-label={`Move ${cvSectionLabels[id]} down`} disabled={index === cv.order.length - 1} onClick={() => step(id, 1)}><ArrowDown /></button>
          <Switch checked={!hidden} onCheckedChange={() => actions.toggleCvSection(id)} aria-label={`Show ${cvSectionLabels[id]}`} />
        </li>;
      })}
    </ol>
  </div>;
}
