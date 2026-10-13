import { createFileRoute, Link } from '@tanstack/react-router';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About us — ByeUni' }, { name: 'description', content: 'ByeUni helps college students find their people, fund their goals, and share the story of campus life.' }] }),
  component: AboutPage,
});

function AboutPage() {
  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap legal-copy">
      <div className="sub-hero">
        <p className="eyebrow">About Us</p>
        <h1>Friends, funds, and futures start here.</h1>
        <p>College is a lot at once: classes, roommates, money, and figuring out what comes next. ByeUni is the place students compare notes, cheer each other on, and raise support for the goals that matter.</p>
      </div>
      <section>
        <h2>Why students use ByeUni</h2>
        <p>People who care about you want to see the work and help. A campaign on ByeUni lets family, friends, and classmates learn what you are working toward and contribute through PayPal as gifts come in. You do not wait for a finish line before the support arrives.</p>
        <p>The same profile is also a CVision: a living page for skills, projects, and milestones, instead of a résumé that goes stale after one semester.</p>
      </section>
      <section>
        <h2>Keys to a strong Byeuni page</h2>
        <p>A campaign does better with a specific story, photos and video from campus, and updates that give people a reason to come back. A useful window is often 45 to 90 days, with a clear start and a clear close. Share it with people who already know you, then on social.</p>
        <p>Gifts can arrive through PayPal as they come in. You do not wait for a public total before support lands.</p>
      </section>
      <section>
        <h2>For campuses</h2>
        <p>ByeUni is a student engagement platform for belonging, fundraising, and career readiness. Colleges use it to connect students by campus and major.</p>
        <p><Link to="/school">School admins start here</Link></p>
      </section>
    </main>
    <SiteFooter />
  </div>;
}
