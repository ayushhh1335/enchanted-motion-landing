import { createFileRoute, Link } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import p1 from '@/assets/portrait-1.jpg';
import p2 from '@/assets/portrait-2.jpg';
import p3 from '@/assets/portrait-3.jpg';
import p4 from '@/assets/portrait-4.jpg';
import p5 from '@/assets/portrait-5.jpg';
import p6 from '@/assets/portrait-6.jpg';
import p7 from '@/assets/portrait-7.jpg';
import p8 from '@/assets/portrait-8.jpg';

export const Route = createFileRoute('/people')({
  head: () => ({ meta: [{ title: 'Find Your People — ByeUni' }, { name: 'description', content: 'Find students by name, campus, and major.' }] }),
  component: PeoplePage,
});

const students = [
  { name: 'Alex Rivera', handle: 'alexr', major: 'Computer Science', campus: 'North Campus', when: '2h ago', photo: p1 },
  { name: 'Priya Shah', handle: 'priya', major: 'Design', campus: 'North Campus', when: '5h ago', photo: p2 },
  { name: 'Jordan Blake', handle: 'jordanb', major: 'Business', campus: 'City Campus', when: '1d ago', photo: p3 },
  { name: 'Maya Chen', handle: 'mayac', major: 'Engineering', campus: 'North Campus', when: '3h ago', photo: p4 },
  { name: 'Sam Okonkwo', handle: 'samok', major: 'Biology', campus: 'Health Campus', when: '3d ago', photo: p5 },
  { name: 'Sara Khan', handle: 'sarak', major: 'Arts', campus: 'City Campus', when: '12m ago', photo: p6 },
  { name: 'Rohan Mehta', handle: 'rohanm', major: 'Data Science', campus: 'North Campus', when: '8h ago', photo: p7 },
  { name: 'Ananya Desai', handle: 'ananyad', major: 'Product', campus: 'City Campus', when: '6h ago', photo: p8 },
];

function PeoplePage() {
  const [query, setQuery] = useState('');
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(person => `${person.name} ${person.major} ${person.campus}`.toLowerCase().includes(q));
  }, [query]);

  return <div className="bj-page subpage">
    <SiteHeader />
    <main className="site-wrap">
      <div className="sub-hero">
        <p className="eyebrow">Find Your People</p>
        <h1>Students in your campus and major.</h1>
        <p>Search by name, then open a profile on ByeUni to connect, message, and follow the work.</p>
      </div>
      <div className="dir-toolbar">
        <label className="dir-search">Search by name
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search by name..." />
        </label>
        <Button variant="ink" asChild><a href="https://byeuni.com/all-users.php">Open the live directory</a></Button>
      </div>
      <div className="member-grid">
        {shown.map(person => <article key={person.name} className="member-card">
          <h3>{person.name}</h3>
          <p><Sparkles size={13} /> {person.major}</p>
          <img src={person.photo} alt="" />
          <footer>
            <img src={person.photo} alt="" />
            <div><strong>@{person.handle}</strong><small>{person.when}</small></div>
            <Link to="/login">+ Add member</Link>
          </footer>
        </article>)}
      </div>
      {shown.length === 0 ? <p className="sample-note">No students match that search.</p> : null}
    </main>
    <SiteFooter />
  </div>;
}
