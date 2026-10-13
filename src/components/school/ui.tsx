import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Flag, GraduationCap, HandHeart, LayoutDashboard, Lightbulb, Megaphone, MessagesSquare, School, UserCog } from 'lucide-react';

export const sections = ['overview', 'school', 'students', 'campaigns', 'forums', 'reports', 'updates', 'suggestions', 'profile'] as const;
export type Section = (typeof sections)[number];
export const isSection = (value: unknown): value is Section => typeof value === 'string' && (sections as readonly string[]).includes(value);

export type CountKey = 'reports' | 'newSuggestions' | 'inactive';
export const navGroups: { label: string; items: { section: Section; label: string; icon: typeof School; count?: CountKey }[] }[] = [
  { label: 'Campus', items: [
    { section: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { section: 'school', label: 'School details', icon: School },
  ] },
  { label: 'Students', items: [
    { section: 'students', label: 'Students', icon: GraduationCap, count: 'inactive' },
    { section: 'campaigns', label: 'Campaigns', icon: HandHeart },
    { section: 'forums', label: 'Forums', icon: MessagesSquare },
    { section: 'reports', label: 'Reported', icon: Flag, count: 'reports' },
  ] },
  { label: 'Engage', items: [
    { section: 'updates', label: 'Updates', icon: Megaphone },
    { section: 'suggestions', label: 'Suggestions', icon: Lightbulb, count: 'newSuggestions' },
  ] },
  { label: 'Account', items: [{ section: 'profile', label: 'My profile', icon: UserCog }] },
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
