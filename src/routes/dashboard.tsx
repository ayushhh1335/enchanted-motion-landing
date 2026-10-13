import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { DashboardProvider } from '@/components/dashboard/store';
import { isView, type View } from '@/components/dashboard/shared';
import { homeFor, readSession } from '@/lib/demo-session';

type DashboardSearch = { view?: View | undefined; chat?: string | undefined };

export const Route = createFileRoute('/dashboard')({
  // The demo session and uploads live in browser storage.
  ssr: false,
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    const view = search['view'];
    const chat = search['chat'];
    return {
      view: isView(view) && view !== 'home' ? view : undefined,
      chat: typeof chat === 'string' ? chat : undefined,
    };
  },
  head: () => ({ meta: [{ title: 'Home — ByeUni' }, { name: 'description', content: 'Your ByeUni feed, stories, network, campaigns, and Vibeys.' }, { name: 'robots', content: 'noindex' }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { view, chat } = Route.useSearch();
  const navigate = useNavigate();
  const [session] = useState(readSession);

  useEffect(() => {
    if (!session) navigate({ to: '/login', replace: true });
    else if (session.role !== 'student') navigate({ to: homeFor(session.role), replace: true });
  }, [session, navigate]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [view]);

  if (session?.role !== 'student') return null;
  return <DashboardProvider>
    <DashboardShell view={view ?? 'home'} chat={chat} />
    <Toaster position="top-center" richColors closeButton />
  </DashboardProvider>;
}
