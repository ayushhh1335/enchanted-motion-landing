import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardProvider } from '@/components/dashboard/store';
import { isView, type View } from '@/components/dashboard/shared';
import { homeFor, readSession } from '@/lib/demo-session';

type DashboardSearch = { view?: View | undefined; chat?: string | undefined; tab?: string | undefined; person?: string | undefined };

export const Route = createFileRoute('/dashboard')({
  // The demo session and uploads live in browser storage.
  ssr: false,
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    const view = search['view'];
    const chat = search['chat'];
    const tab = search['tab'];
    const person = search['person'];
    return {
      view: isView(view) && view !== 'home' ? view : undefined,
      chat: typeof chat === 'string' ? chat : undefined,
      tab: typeof tab === 'string' && /^[a-z-]{1,20}$/.test(tab) ? tab : undefined,
      person: (view === 'profile' || view === 'cvision') && typeof person === 'string' && /^[a-z0-9-]{1,40}$/.test(person) ? person : undefined,
    };
  },
  head: () => ({ meta: [{ title: 'Home — ByeUni' }, { name: 'description', content: 'Your ByeUni feed, stories, network, campaigns, and Vibeys.' }, { name: 'robots', content: 'noindex' }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { view, chat, tab, person } = Route.useSearch();
  const navigate = useNavigate();
  const [session] = useState(readSession);

  useEffect(() => {
    if (!session) navigate({ to: '/login', replace: true });
    else if (session.role !== 'student') navigate({ to: homeFor(session.role), replace: true });
  }, [session, navigate]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [view, person]);

  if (session?.role !== 'student') return null;
  return <DashboardProvider>
    <DashboardShell view={view ?? 'home'} chat={chat} tab={tab} person={person} />
    <Toaster />
  </DashboardProvider>;
}
