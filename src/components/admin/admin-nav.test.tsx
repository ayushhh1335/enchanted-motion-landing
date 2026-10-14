import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminProvider } from './store';
import { navGroups } from './ui';
import { LibraryView, SettingsView, VibeysView } from './views-platform';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => () => {},
  Link: ({ children, className }: { children: ReactNode; className?: string }) => <a className={className}>{children}</a>,
}));
import { SchoolsView } from './views-people';
import { ModerationView, SafetyView } from './views-trust';
import { PaymentsView } from './views-fundraising';
import { UsersView } from './views-people';

const labels = navGroups.flatMap(group => group.items.map(item => item.label));

describe('platform admin menu', () => {
  it('lists every ByeUni superadmin section', () => {
    expect(labels).toEqual([
      'Dashboard',
      'Email Templates',
      'Campaigns',
      'Fundraisers',
      'Categories',
      'Reports',
      'Withdrawals',
      'Schools',
      'Majors',
      'Quotes',
      'eCards',
      'School Admins',
      'Forums',
      'Reported forums / comments / users',
      'Report / Site Abuse',
      'Vibe-Check',
      'Vibeys Rewards',
      'Vibeys Action',
      'Grand Contest',
      'System Configuration',
    ]);
  });

  it('opens each section on its own page', () => {
    const pages: [string, ReactNode][] = [
      ['Fundraisers', <UsersView />],
      ['Categories', <LibraryView pane="categories" />],
      ['Majors', <LibraryView pane="majors" />],
      ['Quotes', <LibraryView pane="quotes" />],
      ['eCards', <LibraryView pane="ecards" />],
      ['Schools', <SchoolsView pane="schools" />],
      ['School Admins', <SchoolsView pane="admins" />],
      ['Reports', <PaymentsView />],
      ['Forums', <ModerationView pane="forums" />],
      ['Reported forums, comments & users', <ModerationView pane="reported" />],
      ['Report / Site Abuse', <SafetyView pane="abuse" />],
      ['Vibe-Check', <SafetyView pane="vibe" />],
      ['Vibeys Rewards', <VibeysView pane="rewards" />],
      ['Vibeys Action', <VibeysView pane="actions" />],
      ['Grand Contest', <VibeysView pane="contest" />],
      ['Email Templates', <SettingsView pane="emails" />],
      ['System Configuration', <SettingsView pane="system" />],
    ];
    for (const [title, view] of pages) {
      const { unmount } = render(<AdminProvider>{view}</AdminProvider>);
      expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
      unmount();
    }
  });
});
