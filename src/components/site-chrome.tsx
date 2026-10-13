import { Link } from '@tanstack/react-router';
import { useScrollMotion } from '@/hooks/use-scroll-motion';
import { ArrowRight, LayoutDashboard, Menu } from 'lucide-react';
import { useId, useState } from 'react';
import { DEMO_ACCOUNTS, homeFor, useDemoSession } from '@/lib/demo-session';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/ThemeToggle';

export const pages = [
  { to: '/school', label: 'School Admins Start Here' },
  { to: '/fund', label: 'Fund Your Success' },
  { to: '/people', label: 'Find Your People' },
] as const;

export function LogoMark() {
  const id = useId().replace(/[^\w-]/g, '');
  return <svg className="bj-mark" viewBox="0 0 40 52" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-stem`} x2="0" y2="1">
        <stop offset="0" style={{ stopColor: 'var(--logo-stem-a)' }} /><stop offset="1" style={{ stopColor: 'var(--logo-stem-b)' }} />
      </linearGradient>
      <linearGradient id={`${id}-rise`}>
        <stop offset="0" style={{ stopColor: 'var(--logo-rise-a)' }} /><stop offset="1" style={{ stopColor: 'var(--logo-rise-b)' }} />
      </linearGradient>
    </defs>
    <rect width="20" height="51.7" rx="10" fill={`url(#${id}-stem)`} />
    <rect x="-2.1" y="24.85" width="44.2" height="20" rx="10" transform="rotate(-34.35 20 34.85)" fill={`url(#${id}-rise)`} fillOpacity=".86" />
  </svg>;
}

export function Wordmark() {
  return <span className="bj-word" aria-hidden="true">byeun<span className="bj-i">ı</span></span>;
}

export function Logo() {
  return <Link to="/" className="bj-logo" aria-label="ByeUni home">
    <LogoMark />
    <Wordmark />
  </Link>;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { session } = useDemoSession();
  return <>
    <header className="bj-header site-wrap">
      <Logo />
      <nav className="bj-nav" aria-label="Main navigation">
        {pages.map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}
      </nav>
      <div className="bj-actions">
        <ThemeToggle />
        {session
          ? <Button variant="ink" asChild className="bj-join bj-dash"><Link to={homeFor(session.role)}><LayoutDashboard /> {{ student: 'Dashboard', school: 'Portal', admin: 'Admin' }[session.role]}</Link></Button>
          : <>
            <Button variant="ghost" asChild className="bj-login"><Link to="/login">Login</Link></Button>
            <Button variant="ink" asChild className="bj-join"><Link to="/register">Register <ArrowRight /></Link></Button>
          </>}
        <Button variant="ghost" size="icon" className="bj-burger" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu /></Button>
      </div>
    </header>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="modal-content">
        <DialogTitle className="font-display text-2xl">ByeUni</DialogTitle>
        <DialogDescription>Friends, funds, and futures start here.</DialogDescription>
        <nav className="mobile-navigation" aria-label="Mobile navigation">
          {pages.map(item => <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>{item.label}</Link>)}
          {session
            ? <Link to={homeFor(session.role)} onClick={() => setOpen(false)}>{DEMO_ACCOUNTS[session.role].nav}</Link>
            : <>
              <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
            </>}
        </nav>
      </DialogContent>
    </Dialog>
  </>;
}

const quickLinks = [
  { to: '/about', label: 'About Us' },
  { to: '/fund', label: 'Explore Campaigns' },
  { to: '/register', label: 'Start a Byeuni' },
  { to: '/blog', label: 'Our Blog' },
  { to: '/faqs', label: 'Byeuni FAQ’s' },
  { to: '/works', label: 'How Byeuni Works' },
] as const;

const chatLinks = [
  { to: '/login', label: 'Login/Register' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
  { to: '/works', label: 'How Byeuni Works' },
  { to: '/faqs', label: 'Byeuni FAQ’s' },
] as const;

function BlueskyIcon() {
  return <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.3 4.2c2.3 1.7 4.8 5.3 5.7 7.2.9-1.9 3.4-5.4 5.7-7.2 1.7-1.3 4.3-2.2 4.3.9s-.4 5.2-.6 5.9c-.7 2.6-3.3 3.2-5.6 2.8 4 .7 5.1 3 2.9 5.3-5 5.2-6.7-2.8-6.7-2.8s-1.7 8-6.7 2.8c-2.2-2.3-1.2-4.6 2.9-5.3-2.3.4-4.9-.3-5.6-2.8-.2-.7-.6-5.3-.6-5.9 0-3.1 2.7-2.1 4.3-.9z" /></svg>;
}

export function SiteFooter() {
  useScrollMotion();
  return <footer className="bj-footer">
    <div className="bj-footer-main">
      <div className="bj-footer-brand">
        <Logo />
        <p>Revolutionizing college success through the power of technology and modern communication.</p>
      </div>
      <nav aria-label="Quick Links">
        <h2>Quick Links</h2>
        {quickLinks.map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}
      </nav>
      <nav aria-label="Chat with Us">
        <h2><Link to="/chat">Chat with Us</Link></h2>
        {chatLinks.map(item => <Link key={item.label} to={item.to}>{item.label}</Link>)}
      </nav>
      <div className="bj-footer-social">
        <h2>Find us on</h2>
        <div>
          <a href="https://www.instagram.com/byeuni_your_tribe_your_vibe/" aria-label="Instagram" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm10 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm-5 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2zM17.2 6.6a1 1 0 1 1-1 1 1 1 0 0 1 1-1z" /></svg></a>
          <a href="https://www.linkedin.com/company/byeuni-llc" aria-label="LinkedIn" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M6.5 9H4V20h2.5zM5.2 4A1.6 1.6 0 1 0 5.2 7.2 1.6 1.6 0 0 0 5.2 4zM20 20h-2.5v-5.6c0-1.8-.8-2.4-1.8-2.4s-2 .9-2 2.5V20H11V9h2.4v1.5c.5-.9 1.7-1.8 3.4-1.8 2.2 0 3.2 1.4 3.2 4.1z" /></svg></a>
          <a href="https://byeuni.bsky.social" aria-label="Bluesky" target="_blank" rel="noreferrer"><BlueskyIcon /></a>
        </div>
        <a className="store-badge" href="https://play.google.com/store/apps/details?id=com.byeuniapp.sgtech" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="#34A853" d="M3 20.5 13.2 12 3 3.5z" /><path fill="#FBBC04" d="M16.7 15.5 13.2 12 3 20.5c.4.7 1.3.8 2 .3z" /><path fill="#EA4335" d="M3 3.5c.2-.7.9-1.1 1.7-.8L16.7 8.5 13.2 12z" /><path fill="#4285F4" d="M16.7 8.5 21 11c.8.5.8 1.6 0 2.1l-4.3 2.4L13.2 12z" /></svg><span><small>GET IT ON</small><strong>Google Play</strong></span></a>
        <a className="store-badge" href="https://apps.apple.com/us/app/byeuni/id1597726003" target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M16.4 12.7c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.3-.1-2.6.8-3.3.8s-1.7-.8-2.9-.7c-1.5 0-2.8.9-3.6 2.2-1.5 2.7-.4 6.6 1.1 8.8.7 1.1 1.6 2.3 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.9.7 1.9-1.1 2.6-2.2c.8-1.2 1.1-2.3 1.2-2.4-.1 0-2.2-.8-2.2-3.6zM14.6 6.4c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1.1 1.6-.9 2.6 1 .1 1.9-.5 2.5-1.2z" /></svg><span><small>Available on the</small><strong>App Store</strong></span></a>
      </div>
    </div>
    <p className="bj-footer-copy">Copyright © 2021-2026 <strong>Byeuni</strong> All rights reserved.</p>
  </footer>;
}
