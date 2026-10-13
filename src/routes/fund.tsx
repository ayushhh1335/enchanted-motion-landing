import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import robotics from '@/assets/student-project.jpg';
import campus from '@/assets/campus-friends.jpg';
import study from '@/assets/study-hub.jpg';
import laptop from '@/assets/students-laptop.jpg';

export const Route = createFileRoute('/fund')({
  head: () => ({ meta: [{ title: 'Fund Your Success — ByeUni' }, { name: 'description', content: 'Explore student campaigns for books, equipment, travel, internships, housing, and exams.' }] }),
  component: FundPage,
});

const campaigns = [
  { title: 'Help Maya bring her robotics project to life', detail: 'Parts and an entry fee for a student robotics build.', raised: 1250, goal: 2000, image: robotics },
  { title: 'Equipment for a student-led campus map', detail: 'A laptop so the prototype can leave the lab computer.', raised: 640, goal: 1100, image: laptop },
  { title: 'Cover the fee for a licensing exam', detail: 'One step between coursework and the next qualification.', raised: 400, goal: 800, image: study },
  { title: 'Supplies for a campus build night', detail: 'Shared materials for a student-led collaborative project.', raised: 900, goal: 1200, image: campus },
];

function FundPage() {
  const [query, setQuery] = useState('');
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return campaigns;
    return campaigns.filter(item => `${item.title} ${item.detail}`.toLowerCase().includes(q));
  }, [query]);

  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap">
      <div className="sub-hero">
        <p className="eyebrow">Explore Campaigns</p>
        <h1>Raise support for the costs college actually asks for.</h1>
        <p>Books, travel, internships, equipment, housing, and licensing exams. Search campaigns, then support them on ByeUni.</p>
      </div>
      <div className="dir-toolbar">
        <label className="dir-search">Search
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search" />
        </label>
        <Button variant="ink" asChild><a href="https://byeuni.com/campaign-list.php">Open live campaigns</a></Button>
      </div>
      <div className="dir-grid">
        {shown.map(item => {
          const pct = Math.round((item.raised / item.goal) * 100);
          return <article key={item.title} className="dir-card">
            <img src={item.image} alt="" />
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
            <small>${item.raised.toLocaleString('en-US')} raised of ${item.goal.toLocaleString('en-US')}</small>
            <div className="bj-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><span style={{ width: `${pct}%` }} /></div>
            <Button variant="ink" asChild><a href="https://byeuni.com/campaign-list.php">Support this goal</a></Button>
          </article>;
        })}
      </div>
      {shown.length === 0 ? <p className="sample-note">No campaigns match that search.</p> : null}
    </main>
    <SiteFooter />
  </div>;
}
