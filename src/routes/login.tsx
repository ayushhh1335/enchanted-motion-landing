import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { Copy, GraduationCap, School, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/site-chrome';
import { DEMO_ACCOUNTS, REAL_LOGIN_URL, demoRoleFor, homeFor, readSession, signInDemo, type DemoRole } from '@/lib/demo-session';

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Login — ByeUni' }, { name: 'description', content: 'Sign in to ByeUni as a student, school admin, or platform admin.' }] }),
  component: LoginPage,
});

type RoleCopy = {
  value: DemoRole; label: string; icon: typeof ShieldCheck; title: string; blurb: string; emailLabel: string; submit: string;
  /** Hidden action field the hosted login page expects. */
  action: string;
};

const roles: RoleCopy[] = [
  { value: 'student', label: 'Student', icon: GraduationCap, title: 'Sign in to ByeUni', blurb: 'Try the demo dashboard', emailLabel: 'Email', submit: 'Sign in', action: 'login' },
  { value: 'school', label: 'School admin', icon: School, title: 'School sign in', blurb: 'Try the Stanford school portal', emailLabel: 'School email', submit: 'Sign in to school portal', action: 'school_login' },
  { value: 'admin', label: 'Platform admin', icon: ShieldCheck, title: 'Admin sign in', blurb: 'Try the admin console', emailLabel: 'Admin email', submit: 'Sign in to admin', action: 'admin_login' },
];

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<DemoRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const active = roles.find(item => item.value === role) ?? roles[0]!;
  const demo = DEMO_ACCOUNTS[role];

  useEffect(() => {
    const session = readSession();
    if (session) navigate({ to: homeFor(session.role), replace: true });
  }, [navigate]);

  // Demo accounts open the local dashboards; every other account still signs in on byeuni.com.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const demoRole = demoRoleFor(email);
    if (!demoRole) return;
    event.preventDefault();
    const signedIn = signInDemo(email, password);
    if (signedIn) navigate({ to: homeFor(signedIn) });
    else setError(`That password does not match the ${DEMO_ACCOUNTS[demoRole].label.toLowerCase()} demo account.`);
  }

  function switchRole(next: DemoRole) {
    setRole(next);
    setEmail('');
    setPassword('');
    setError('');
  }

  function fillDemo() {
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  }

  return <main className="gate">
    <div className="gate-panel">
      <Logo />
      <h1>{active.title}</h1>
      <div className="gate-roles" role="tablist" aria-label="Account type">
        {roles.map(item => <button key={item.value} type="button" role="tab" aria-selected={role === item.value} onClick={() => switchRole(item.value)}>
          <item.icon /> {item.label}
        </button>)}
      </div>
      <aside className={role === 'student' ? 'gate-demo' : `gate-demo is-${role}`} aria-label="Demo account">
        <span className="gate-demo-icon">{role === 'student' ? <Sparkles /> : <active.icon />}</span>
        <div>
          <strong>{active.blurb}</strong>
          <dl>
            <div><dt>Email</dt><dd>{demo.email}</dd></div>
            <div><dt>Password</dt><dd>{demo.password}</dd></div>
          </dl>
        </div>
        <Button variant="soft" size="sm" type="button" onClick={fillDemo}><Copy /> Use demo</Button>
      </aside>
      <form action={REAL_LOGIN_URL[role]} method="post" onSubmit={onSubmit}>
        <input type="hidden" name={active.action} value="action" />
        <label>
          {active.emailLabel}
          <input type="email" name="email" required autoComplete="username" placeholder="Email" value={email} onChange={event => { setEmail(event.target.value); setError(''); }} />
        </label>
        <label>
          <span>Password <a href={REAL_LOGIN_URL[role]}>Forgot your password?</a></span>
          <span className="gate-secret">
            <input type={showPassword ? 'text' : 'password'} name="password" required autoComplete="current-password" placeholder="Password" value={password} onChange={event => { setPassword(event.target.value); setError(''); }} />
            <button type="button" onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Hide' : 'Show'}</button>
          </span>
        </label>
        {error ? <p className="gate-error" role="alert">{error}</p> : null}
        <label className="check"><input type="checkbox" name="remember_checkbox" /> Remember me on this device</label>
        <Button variant="ink" size="hero" type="submit">{active.submit}</Button>
      </form>
      {role === 'student'
        ? <p>New to ByeUni? <Link to="/register">Create an account</Link></p>
        : <p>{role === 'school' ? 'ByeUni creates one school admin account for each partner university.' : 'Admin accounts are created by ByeUni staff.'}</p>}
    </div>
  </main>;
}
