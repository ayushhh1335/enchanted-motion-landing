import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { SchoolShell } from '@/components/school/SchoolShell';
import { SchoolProvider } from '@/components/school/store';
import { isSection, type Section } from '@/components/school/ui';
import { homeFor, readSession } from '@/lib/demo-session';

type SchoolSearch = { section?: Section | undefined; focus?: string | undefined };

export const Route = createFileRoute('/school-admin')({
  // The demo session and school data live in browser storage.
  ssr: false,
  validateSearch: (search: Record<string, unknown>): SchoolSearch => {
    const section = search['section'];
    const focus = search['focus'];
    return {
      section: isSection(section) && section !== 'overview' ? section : undefined,
      focus: typeof focus === 'string' ? focus : undefined,
    };
  },
  head: () => ({ meta: [{ title: 'School portal — ByeUni' }, { name: 'description', content: 'Manage your school’s students, updates, suggestions, and reported content on ByeUni.' }, { name: 'robots', content: 'noindex' }] }),
  component: SchoolAdminPage,
});

function SchoolAdminPage() {
  const { section, focus } = Route.useSearch();
  const navigate = useNavigate();
  const [session] = useState(readSession);

  useEffect(() => {
    if (!session) navigate({ to: '/login', replace: true });
    else if (session.role !== 'school') navigate({ to: homeFor(session.role), replace: true });
  }, [session, navigate]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [section]);

  if (session?.role !== 'school') return null;
  return <SchoolProvider>
    <SchoolShell section={section ?? 'overview'} focus={focus} />
    <Toaster />
  </SchoolProvider>;
}
