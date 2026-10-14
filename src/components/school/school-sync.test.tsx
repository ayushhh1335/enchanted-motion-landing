import type { ReactNode } from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminProvider, useAdmin } from '@/components/admin/store';
import { StudentProfileView as AdminStudentProfile } from '@/components/admin/views-people';
import { sendSuggestion } from '@/lib/student-sync';
import { SchoolProvider, useSchool } from './store';
import { navGroups } from './ui';
import { StudentProfileView } from './views-students';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => () => {},
  Link: ({ children, className }: { children: ReactNode; className?: string }) => <a className={className}>{children}</a>,
}));

afterEach(() => localStorage.clear());

function SchoolSuggestions() {
  const { suggestions } = useSchool();
  return <ul>{suggestions.map(s => <li key={s.id}>{s.text}</li>)}</ul>;
}

function AdminSuggestions() {
  const { suggestions } = useAdmin();
  return <ul>{suggestions.map(s => <li key={s.id}>{s.text}</li>)}</ul>;
}

describe('school admin menu', () => {
  it('follows the ByeUni school admin menu', () => {
    expect(navGroups.flatMap(group => group.items.map(item => item.label))).toEqual([
      'Dashboard', 'School Details', 'Students', 'Suggestions', 'Updates', 'Forums', 'Campaigns', 'Reported forums / comments / users', 'Profile',
    ]);
  });
});

describe('student suggestions', () => {
  it('reach the school admin and the platform admin', () => {
    render(<>
      <SchoolProvider><section aria-label="school"><SchoolSuggestions /></section></SchoolProvider>
      <AdminProvider><section aria-label="admin"><AdminSuggestions /></section></AdminProvider>
    </>);
    act(() => { sendSuggestion({ schoolId: 'stanford', userId: 'me', text: 'Keep Green Library open until 2am during finals.' }); });
    expect(screen.getAllByText('Keep Green Library open until 2am during finals.')).toHaveLength(2);
  });

  it('stay with the student’s own school', () => {
    render(<SchoolProvider><SchoolSuggestions /></SchoolProvider>);
    act(() => { sendSuggestion({ schoolId: 'ucla', userId: 'other', text: 'A UCLA-only idea that Stanford never sees.' }); });
    expect(screen.queryByText('A UCLA-only idea that Stanford never sees.')).not.toBeInTheDocument();
  });
});

describe('student profiles in the consoles', () => {
  it('show the student’s saved dashboard profile to the school admin', () => {
    localStorage.setItem('byeuni-dashboard-v1', JSON.stringify({ profile: { headline: 'Shipping tools for first-year students' } }));
    render(<SchoolProvider><StudentProfileView studentId="me" /></SchoolProvider>);
    expect(screen.getByRole('heading', { level: 1, name: 'Ethan Carter' })).toBeInTheDocument();
    expect(screen.getByText('Shipping tools for first-year students')).toBeInTheDocument();
  });

  it('open for the platform admin too', () => {
    render(<AdminProvider><AdminStudentProfile userId="me" /></AdminProvider>);
    expect(screen.getByRole('heading', { level: 1, name: 'Ethan Carter' })).toBeInTheDocument();
    expect(screen.getByText('More hackathon travel grants for undergrads.', { exact: false })).toBeInTheDocument();
  });
});
