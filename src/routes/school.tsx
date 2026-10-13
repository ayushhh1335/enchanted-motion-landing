import { createFileRoute } from '@tanstack/react-router';
import { Calendar, Play, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

export const Route = createFileRoute('/school')({
  head: () => ({ meta: [{ title: 'School Admins — ByeUni' }, { name: 'description', content: 'School admin login, a demo booking, and the ByeUni school admin video.' }] }),
  component: SchoolPage,
});

const paths = [
  { href: '#school-login', icon: ShieldCheck, n: '01', title: 'Log into School Admin', body: 'Use the email and password issued for your campus account.' },
  { href: '#demo', icon: Calendar, n: '02', title: 'Request a Demo', body: 'Pick a time with the ByeUni team and see the platform with your own students in mind.' },
  { href: '#video', icon: Play, n: '03', title: 'School Admin video', body: 'A short walkthrough of how colleges use ByeUni for belonging and career readiness.' },
];

function SchoolPage() {
  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap school-page">
      <section className="school-hero">
        <div className="sub-hero">
          <p className="eyebrow">School Admins Start Here</p>
          <h1>Built for students. Powerful for universities.</h1>
          <p>Connect students by campus and major, keep goals visible, and support the path from the first semester to life after graduation.</p>
          <ul>
            <li>Peer connection by campus and major</li>
            <li>Goal visibility and accountability</li>
            <li>Career pathway awareness</li>
          </ul>
        </div>
        <form id="school-login" className="school-login" action="https://byeuni.com/school/" method="post">
          <p className="eyebrow">01 — School login</p>
          <h2>Welcome back.</h2>
          <input type="hidden" name="school_login" value="action" />
          <label>Email<input type="email" name="email" required placeholder="Email address" autoComplete="username" /></label>
          <label>Password<input type="password" name="password" required placeholder="Password" autoComplete="current-password" /></label>
          <Button variant="ink" size="hero" type="submit">Login</Button>
        </form>
      </section>

      <section className="school-paths" aria-label="Ways to get started">
        {paths.map(item => <a key={item.n} href={item.href}>
          <span>{item.n}</span>
          <item.icon size={18} />
          <strong>{item.title}</strong>
          <p>{item.body}</p>
        </a>)}
      </section>

      <section id="demo" className="school-panel">
        <div>
          <p className="eyebrow">02 — Request a demo</p>
          <h2>Book a time that works for your campus.</h2>
          <p>The scheduler is the same one ByeUni uses for school demos. Choose a slot and the team will meet you there.</p>
        </div>
        <div className="school-frame">
          <iframe title="Schedule a ByeUni demo" src="https://calendar.zoho.com/eventreqForm/zz08011230aac12458dd0e4bfc579099cfffc57453e97875d72a71cf3119617ede8b6f21548369dbc55c8df1ec2f428f0d875461d6?theme=0&l=en&tz=America/Detroit" />
        </div>
      </section>

      <section id="video" className="school-panel school-video">
        <div>
          <p className="eyebrow">03 — School Admin video</p>
          <h2>See how a campus gets started.</h2>
          <p>A walkthrough for school admins: who the platform is for, and what students and colleges each get from it.</p>
        </div>
        <div className="school-stage">
          <iframe src="https://www.youtube.com/embed/ECQYNyPr3gU?start=25" title="School Admin video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>;
}
