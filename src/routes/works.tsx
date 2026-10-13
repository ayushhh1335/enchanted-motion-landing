import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

export const Route = createFileRoute('/works')({
  head: () => ({ meta: [{ title: 'How Byeuni Works — ByeUni' }, { name: 'description', content: 'Register, start a campaign, connect PayPal, share it, and keep your CVision current.' }] }),
  component: WorksPage,
});

const pillars = [
  ['Request help for', 'Tuition, rent, housing, books, and the other costs that show up during a semester.'],
  ['Document your progress', 'Blogs, photos, videos, and testimonials live on your CVision.'],
  ['Share your network', 'Find students on your campus and in your major.'],
  ['Build momentum', 'Stay on track toward the graduation goal you actually named.'],
];

const steps = [
  ['Follow the prompts to set up your fundraiser', 'Register, confirm the one-time codes sent to your phone and email, and verify PayPal if you do not have an account yet. From My Dashboard, choose Start a Campaign, pick a category, and write one to three paragraphs on why you are fundraising and how the funds will be used. Set the goal and add photos or video.'],
  ['Set up PayPal', 'Add and verify PayPal so gifts can reach you. You do not have to hit the goal before money arrives. One small transaction fee is deducted per donation.'],
  ['Share your fundraiser', 'Send the link to close friends and family by text and email, invite contacts from the site, and post it on social. Share it again as the days pass, and add teammates you trust so they can invite people too.'],
  ['Post updates and thank donors', 'Updates give people a reason to come back. Thank donors with the cards in your fundraising dashboard. More on asking, and on thank-you notes, is on the blog.'],
];

const closer = [
  ['Easy sign up', 'Join with email and phone. Your profile can be public or private.'],
  ['Find your friends', 'ByeUni looks for other students on your campus and in your major.'],
  ['Start your journey', 'Document classes, write, upload photos and video, and collect notes from mentors. Update whenever you want.'],
];

function WorksPage() {
  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap">
      <div className="sub-hero">
        <p className="eyebrow">How Byeuni Works</p>
        <h1>Make the college journey a success.</h1>
        <p>ByeUni brings social support, financial help, and career preparation into one student-owned place. Belonging, retention, and readiness sit in the same profile.</p>
      </div>
      <div className="info-grid">
        {pillars.map(([title, copy]) => <article key={title} className="dir-card"><h3>{title}</h3><p>{copy}</p></article>)}
      </div>
      <h2>A simple path</h2>
      <ol className="step-list">
        {steps.map(([title, copy], index) => <li key={title}><span>{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></li>)}
      </ol>
      <div className="info-grid">
        {closer.map(([title, copy]) => <article key={title} className="dir-card"><h3>{title}</h3><p>{copy}</p></article>)}
      </div>
      <p className="auth-switch"><Button variant="ink" asChild><Link to="/register">Start a Byeuni</Link></Button> <Link to="/blog">Find more tips on the blog</Link></p>
    </main>
    <SiteFooter />
  </div>;
}
