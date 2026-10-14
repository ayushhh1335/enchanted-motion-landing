import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Flag, GraduationCap, HandHeart, LayoutDashboard, Lightbulb, Megaphone, MessagesSquare, School, UserCog } from 'lucide-react';

export const sections = ['overview', 'school', 'students', 'student', 'suggestions', 'updates', 'forums', 'campaigns', 'reports', 'profile'] as const;
export type Section = (typeof sections)[number];
export const isSection = (value: unknown): value is Section => typeof value === 'string' && (sections as readonly string[]).includes(value);

/** A single student's profile highlights Students in the menu. */
export const navSection = (section: Section): Section => section === 'student' ? 'students' : section;

export type CountKey = 'reports' | 'newSuggestions' | 'inactive';
/** Mirrors the ByeUni school admin menu. */
export const navGroups: { label: string; items: { section: Section; label: string; icon: typeof School; count?: CountKey }[] }[] = [
  { label: 'Campus', items: [
    { section: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'school', label: 'School Details', icon: School },
  ] },
  { label: 'Students', items: [
    { section: 'students', label: 'Students', icon: GraduationCap, count: 'inactive' },
    { section: 'suggestions', label: 'Suggestions', icon: Lightbulb, count: 'newSuggestions' },
    { section: 'updates', label: 'Updates', icon: Megaphone },
  ] },
  { label: 'Community', items: [
    { section: 'forums', label: 'Forums', icon: MessagesSquare },
    { section: 'campaigns', label: 'Campaigns', icon: HandHeart },
    { section: 'reports', label: 'Reported forums / comments / users', icon: Flag, count: 'reports' },
  ] },
  { label: 'Account', items: [{ section: 'profile', label: 'Profile', icon: UserCog }] },
];

export function SchoolLink({ section, focus, className, children, onClick, ...rest }: {
  section: Section; focus?: string | undefined; className?: string | undefined; children: ReactNode; onClick?: (() => void) | undefined;
  'aria-label'?: string | undefined; 'aria-current'?: 'page' | undefined;
}) {
  const search = section === 'overview' ? {} : focus ? { section, focus } : { section };
  return <Link to="/school-admin" search={search} className={className} onClick={onClick} {...rest}>{children}</Link>;
}

/** Hero and band gradients follow the school's own colors. */
export const schoolGradient = (colors: [string, string], angle = 120) => `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`;
