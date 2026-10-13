import { createFileRoute, Link } from '@tanstack/react-router';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

export const Route = createFileRoute('/chat')({
  head: () => ({ meta: [{ title: 'Chat with Us — ByeUni' }, { name: 'description', content: 'Message the ByeUni team, or sign in to chat with students and supporters on the platform.' }] }),
  component: ChatPage,
});

const paths = [
  ['/contact', 'Contact Us', 'Send a name, email, subject, and message to the ByeUni desk.'],
  ['/login', 'Login/Register', 'Student chats with classmates and supporters open after you sign in on ByeUni.'],
  ['/faqs', 'Byeuni FAQ’s', 'Short answers on payouts, PayPal, mentors, and getting started.'],
] as const;

function ChatPage() {
  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap">
      <div className="sub-hero">
        <p className="eyebrow">Chat with Us</p>
        <h1>Talk to the team, or to your campus.</h1>
        <p>Questions about the product come here. One-to-one and group chats with students and supporters stay on your ByeUni account.</p>
      </div>
      <div className="info-grid">
        {paths.map(([to, title, copy]) => <Link key={to} to={to} className="dir-card">
          <h3>{title}</h3>
          <p>{copy}</p>
        </Link>)}
      </div>
    </main>
    <SiteFooter />
  </div>;
}
