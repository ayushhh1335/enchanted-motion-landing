import { useEffect, useState } from 'react';

export type DemoRole = 'student' | 'school' | 'admin';
const roles: readonly DemoRole[] = ['student', 'school', 'admin'];

export const DEMO_ACCOUNTS = {
  student: { email: 'ethan.carter@stanford.edu', password: 'ByeUni@2026', label: 'Student', home: '/dashboard', nav: 'Dashboard' },
  school: { email: 'lchen@stanford.edu', password: 'School@2026', label: 'School admin', home: '/school-admin', nav: 'School portal' },
  admin: { email: 'admin@byeuni.com', password: 'Admin@2026', label: 'Platform admin', home: '/admin', nav: 'Admin console' },
} as const;

export const DEMO_CREDENTIALS = DEMO_ACCOUNTS.student;

/** Where each demo role lands; real accounts keep using byeuni.com. */
export const REAL_LOGIN_URL: Record<DemoRole, string> = {
  student: 'https://byeuni.com/login.php',
  school: 'https://byeuni.com/school/index.php',
  admin: 'https://byeuni.com/admin/index.php',
};

const SESSION_KEY = 'byeuni-demo-session';

export type DemoSession = { email: string; role: DemoRole; signedInAt: number };

export const homeFor = (role: DemoRole) => DEMO_ACCOUNTS[role].home;
export const isDemoRole = (value: unknown): value is DemoRole => roles.includes(value as DemoRole);

export function readSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Partial<DemoSession>;
    if (typeof session.email !== 'string') return null;
    return { email: session.email, role: isDemoRole(session.role) ? session.role : 'student', signedInAt: session.signedInAt ?? Date.now() };
  } catch {
    return null;
  }
}

export function demoRoleFor(email: string): DemoRole | null {
  const value = email.trim().toLowerCase();
  return roles.find(role => DEMO_ACCOUNTS[role].email === value) ?? null;
}

export const isDemoEmail = (email: string) => demoRoleFor(email) !== null;

export function signInDemo(email: string, password: string): DemoRole | null {
  const role = demoRoleFor(email);
  if (!role || password !== DEMO_ACCOUNTS[role].password) return null;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: DEMO_ACCOUNTS[role].email, role, signedInAt: Date.now() }));
  } catch { /* The session lasts for this page view without storage. */ }
  return role;
}

export function signOutDemo() {
  try { localStorage.removeItem(SESSION_KEY); } catch { /* Nothing stored. */ }
}

/** Session is read after mount so server and client markup match. */
export function useDemoSession() {
  const [session, setSession] = useState<DemoSession | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setSession(readSession());
    setReady(true);
  }, []);
  return { session, ready };
}
