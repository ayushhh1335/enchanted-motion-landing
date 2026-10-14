import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminProvider } from '@/components/admin/store';
import { isSection, type Section } from '@/components/admin/ui';
import { homeFor, readSession } from '@/lib/demo-session';

type AdminSearch = { section?: Section | undefined; focus?: string | undefined };

export const Route = createFileRoute('/admin')({
  // The demo session and admin data live in browser storage.
  ssr: false,
  validateSearch: (search: Record<string, unknown>): AdminSearch => {
    const section = search['section'];
    const focus = search['focus'];
    return {
      section: isSection(section) && section !== 'overview' ? section : undefined,
      focus: typeof focus === 'string' ? focus : undefined,
    };
  },
  head: () => ({ meta: [{ title: 'Admin console — ByeUni' }, { name: 'description', content: 'Platform admin tools for campaigns, fundraisers, schools, reports, forums, Vibeys, and system configuration.' }, { name: 'robots', content: 'noindex' }] }),
  component: AdminPage,
});

function AdminPage() {
  const { section, focus } = Route.useSearch();
  const navigate = useNavigate();
  const [session] = useState(readSession);

  useEffect(() => {
    if (!session) navigate({ to: '/login', replace: true });
    else if (session.role !== 'admin') navigate({ to: homeFor(session.role), replace: true });
  }, [session, navigate]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [section]);

  if (session?.role !== 'admin') return null;
  return <AdminProvider>
    <AdminShell section={section ?? 'overview'} focus={focus} />
    <Toaster />
  </AdminProvider>;
}
