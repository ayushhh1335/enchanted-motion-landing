import type { ReactNode } from 'react';
import { Ban, BriefcaseBusiness, FolderKanban, GraduationCap, Lightbulb, Mail, MapPin, MessagesSquare, Phone, Target } from 'lucide-react';
import { agoText } from '@/components/dashboard/shared';
import { coverSrc, type AdminCampaign, type AdminUser, type Suggestion } from '@/content/admin-data';
import { cvisionFor, projectImage, type CvContent, type CvProfile } from '@/content/cvision-data';
import { ME_ID, people, type Person } from '@/content/dashboard-data';
import { useLiveStudent } from '@/lib/student-sync';
import { campaignState } from './store';
import { CampaignPill } from './views-overview';
import { Face, Pill, day, dollars, userPhoto } from './ui';

type Portfolio = { profile: CvProfile; content: CvContent; photo: string | undefined };

/** Sample CVision for most students; the demo student's own saved dashboard and CVision edits. */
function usePortfolio(student: AdminUser, schoolName: string): Portfolio {
  const live = useLiveStudent();
  const match = people.find(p => p.id === student.id && p.name === student.name);
  const person: Person = {
    id: match?.id ?? `school-${student.id}`,
    name: student.name,
    handle: student.email.split('@')[0]?.replace(/[^a-z0-9]/gi, '') ?? student.id,
    photo: userPhoto(student) ?? '',
    school: schoolName,
    major: student.major ?? 'Undeclared',
    year: match?.year ?? '',
    city: student.city,
    mutual: 0,
  };
  const sample = cvisionFor(person);
  if (student.id !== ME_ID || !live) return { profile: sample.profile, content: sample.cv.content, photo: userPhoto(student) };
  return {
    profile: { ...sample.profile, ...live.profile },
    content: { ...sample.cv.content, ...live.content },
    photo: live.account.photo || live.content.photo || userPhoto(student),
  };
}

export type StudentProfileProps = {
  student: AdminUser;
  schoolName: string;
  status: ReactNode;
  back: ReactNode;
  campaigns: AdminCampaign[];
  forums?: { id: string; title: string; members: number; removed?: boolean }[];
  suggestions: Suggestion[];
  actions?: ReactNode;
};

/** Read-only student profile for the school and platform consoles, built from the student's CVision. */
export function StudentProfile({ student, schoolName, status, back, campaigns, forums = [], suggestions, actions }: StudentProfileProps) {
  const { profile, content, photo } = usePortfolio(student, schoolName);
  const projects = content.projects ?? [];
  const education = content.education ?? [];
  return <section className="db-view adm-student">
    {back}
    <article className="db-panel adm-student-hero">
      <Face name={student.name} photo={photo} size={92} />
      <div className="adm-student-id">
        <h1>{student.name}</h1>
        {profile.headline ? <p>{profile.headline}</p> : null}
        <div className="adm-student-tags">
          {status}
          {content.openToWork ? <Pill tone="mint">Open to work</Pill> : null}
          <span>{student.major ?? 'Major not set'} · {schoolName}</span>
        </div>
      </div>
      {actions ? <div className="adm-student-actions">{actions}</div> : null}
    </article>
    {student.suspendReason ? <p className="adm-callout is-rose"><Ban /> Suspended: {student.suspendReason}</p> : null}

    <div className="adm-student-grid">
      <div className="adm-student-main">
        <article className="db-panel adm-student-card">
          <h2>About</h2>
          {profile.about ? <p>{profile.about}</p> : <p className="db-muted">No bio yet.</p>}
          {content.vision ? <blockquote>{content.vision}</blockquote> : null}
          {content.status ? <p className="adm-sub">Now: {content.status}</p> : null}
        </article>

        <article className="db-panel adm-student-card">
          <h2><BriefcaseBusiness /> Experience</h2>
          {profile.experience.length ? <ul className="adm-student-timeline">{profile.experience.map(item => <li key={item.id}>
            <strong>{item.role}</strong>
            <small>{item.org}{item.period ? ` · ${item.period}` : ''}</small>
            {item.detail ? <p>{item.detail}</p> : null}
          </li>)}</ul> : <p className="db-muted">No experience added.</p>}
        </article>

        {projects.length ? <article className="db-panel adm-student-card">
          <h2><FolderKanban /> Projects</h2>
          <div className="adm-student-projects">{projects.map(item => <figure key={item.id}>
            <img src={projectImage(item.image)} alt="" loading="lazy" />
            <figcaption><strong>{item.title}</strong><small>{item.description}</small></figcaption>
          </figure>)}</div>
        </article> : null}

        <article className="db-panel adm-student-card">
          <h2>Campaigns</h2>
          {campaigns.length ? <ul className="db-row-list is-plain">{campaigns.map(c => <li key={c.id}>
            <img className="adm-thumb" src={coverSrc(c.cover)} alt="" />
            <div><strong>{c.title}</strong><small>{dollars(c.raised)} of {dollars(c.goal)} · {c.donors} donors</small></div>
            <CampaignPill state={campaignState(c)} />
          </li>)}</ul> : <p className="db-muted">No campaigns yet.</p>}
        </article>

        <article className="db-panel adm-student-card">
          <h2><Lightbulb /> Suggestions to {schoolName}</h2>
          {suggestions.length ? <ul className="adm-suggestions">{suggestions.map(s => <li key={s.id}><p>“{s.text}”</p><small>{agoText(s.at)}</small></li>)}</ul>
            : <p className="db-muted">No suggestions sent.</p>}
        </article>
      </div>

      <aside className="adm-student-side">
        <article className="db-panel adm-student-card">
          <h2>Contact</h2>
          <ul className="adm-contact">
            <li><Mail /> <a href={`mailto:${student.email}`}>{student.email}</a></li>
            {student.phone ? <li><Phone /> {student.phone}</li> : null}
            {student.city ? <li><MapPin /> {student.city}</li> : null}
            <li><GraduationCap /> {schoolName}</li>
          </ul>
          <dl className="db-mini-stats">
            <div><dt>Joined</dt><dd>{day(student.createdAt)}</dd></div>
            <div><dt>Last active</dt><dd>{agoText(student.lastActive)}</dd></div>
            <div><dt>Vibeys</dt><dd>{student.vibeys.toLocaleString('en-US')}</dd></div>
          </dl>
        </article>

        {profile.skills.length ? <article className="db-panel adm-student-card">
          <h2>Skills</h2>
          <ul className="adm-student-skills">{profile.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
        </article> : null}

        {profile.goals.length ? <article className="db-panel adm-student-card">
          <h2><Target /> Goals</h2>
          <ul className="adm-student-goals">{profile.goals.map(goal => <li key={goal}>{goal}</li>)}</ul>
        </article> : null}

        {education.length ? <article className="db-panel adm-student-card">
          <h2><GraduationCap /> Education</h2>
          <ul className="adm-student-timeline">{education.map(item => <li key={item.id}>
            <strong>{item.school}</strong>
            <small>{item.degree}{item.period ? ` · ${item.period}` : ''}</small>
          </li>)}</ul>
        </article> : null}

        {forums.length ? <article className="db-panel adm-student-card">
          <h2><MessagesSquare /> Forums they run</h2>
          <ul className="db-row-list is-plain">{forums.map(f => <li key={f.id}>
            <div><strong>{f.title}</strong><small>{f.members.toLocaleString('en-US')} members</small></div>
            {f.removed ? <Pill tone="rose">Removed</Pill> : null}
          </li>)}</ul>
        </article> : null}
      </aside>
    </div>
  </section>;
}
