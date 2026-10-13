import { useState, type ReactNode } from 'react';
import { ArrowUpRight, Check, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import project from '@/assets/student-project.jpg';
import future from '@/assets/student-future.jpg';
import campus from '@/assets/campus-friends.jpg';

type Links = { register: string; login: string; people: string; funds: string; demo: string; school: string };
type PostTag = 'projects' | 'milestones' | 'campus';

const posts: { id: string; tag: PostTag; name: string; major: string; time: string; title: string; body: string; image?: string; likes: number; comments: number }[] = [
  { id: 'cs', tag: 'projects', name: 'Alex Rivera', major: 'Computer science', time: 'Sample · 2h', title: 'Shipped the campus map prototype', body: 'First version of a wayfinding project for new students. Looking for someone to test the routes.', image: project, likes: 24, comments: 6 },
  { id: 'design', tag: 'projects', name: 'Priya Shah', major: 'Design', time: 'Sample · 5h', title: 'Latest portfolio spread', body: 'A series on how students actually use the library after dark. Process notes, not just the final frames.', image: future, likes: 31, comments: 8 },
  { id: 'intern', tag: 'milestones', name: 'Jordan Blake', major: 'Business', time: 'Sample · 1d', title: 'The internship offer landed', body: 'Writing down what I practiced so the next person in my major can use it.', likes: 48, comments: 12 },
  { id: 'group', tag: 'campus', name: 'North Quad Lab', major: 'Campus group', time: 'Sample · 1d', title: 'Collaborative build night', body: 'Pairing programmers and designers on one student-led project this month.', image: campus, likes: 19, comments: 9 },
  { id: 'goal', tag: 'milestones', name: 'Sam Okonkwo', major: 'Biology', time: 'Sample · 3d', title: 'Halfway through the licensing plan', body: 'Study hours logged, one practice exam done, and a campaign open for the exam fee.', likes: 15, comments: 4 },
];

const campaigns = [
  { name: 'Maya Chen', major: 'Engineering', title: 'Help Maya bring her robotics project to life.', detail: 'Parts and an entry fee for a student robotics build.', raised: 1250, target: 2000, supporters: 18 },
  { name: 'Alex Rivera', major: 'Computer science', title: 'Equipment for a student-led campus map.', detail: 'A laptop so the prototype can leave the lab computer.', raised: 640, target: 1100, supporters: 11 },
  { name: 'Sam Okonkwo', major: 'Biology', title: 'Cover the fee for a licensing exam.', detail: 'One step between coursework and the next qualification.', raised: 400, target: 800, supporters: 9 },
  { name: 'North Quad Lab', major: 'Campus group', title: 'Supplies for a campus build night.', detail: 'Shared materials for a student-led collaborative project.', raised: 900, target: 1200, supporters: 22 },
];

const people = [
  { name: 'Alex Rivera', major: 'Computer science', focus: 'Projects', note: 'Looking for a design partner on a campus map.' },
  { name: 'Priya Shah', major: 'Design', focus: 'Projects', note: 'Sharing portfolio work and open to critiques.' },
  { name: 'Jordan Blake', major: 'Business', focus: 'Mentors', note: 'Happy to talk through internship interviews.' },
  { name: 'North Quad Lab', major: 'Campus groups', focus: 'Campus groups', note: 'A build night for programmers and designers.' },
  { name: 'Maya Chen', major: 'Engineering', focus: 'Projects', note: 'Building a robotics project with community support.' },
  { name: 'Sam Okonkwo', major: 'Biology', focus: 'Mentors', note: 'Working toward a licensing exam, one week at a time.' },
];

const vibeyTasks = [
  { id: 'login', label: 'Daily login', points: 1 },
  { id: 'forum', label: 'Create one forum post', points: 20 },
  { id: 'comment', label: 'Leave a forum comment', points: 10 },
];

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className} data-reveal>{children}</div>;
}

function Initials({ name }: { name: string }) {
  const tones = ['#111111', '#3A3632', '#605F5F', '#1A1A1A'];
  const letters = name.split(' ').map(part => part[0]).slice(0, 2).join('');
  return <span className="initials" style={{ background: tones[name.charCodeAt(0) % tones.length] }}>{letters}</span>;
}

function money(value: number) { return `$${value.toLocaleString('en-US')}`; }

export function LongJourney({ links, onWatch }: { links: Links; onWatch: () => void }) {
  const [feed, setFeed] = useState<'all' | PostTag>('all');
  const [circle, setCircle] = useState('All');
  const [done, setDone] = useState<string[]>([]);
  const visiblePosts = posts.filter(post => feed === 'all' || post.tag === feed);
  const visiblePeople = people.filter(person => circle === 'All' || person.focus === circle || person.major === circle);
  const previewPoints = done.reduce((sum, id) => sum + (vibeyTasks.find(task => task.id === id)?.points ?? 0), 0);
  const circles = ['All', 'Computer science', 'Design', 'Projects', 'Campus groups', 'Mentors'];

  return <>
    <section id="feed" className="site-wrap story-section" aria-labelledby="feed-title">
      <Reveal className="story-intro">
        <p className="eyebrow">Your campus, beyond the classroom</p>
        <h2 id="feed-title" className="section-title">Alex finds people who <em>get the project.</em></h2>
        <p>Same campus. Shared interests. A place to post the work, ask the class question, and keep the conversation going in forums or chats.</p>
      </Reveal>
      <div className="filter-row" role="toolbar" aria-label="Sample feed filters">
        {([['all', 'All'], ['projects', 'Projects'], ['milestones', 'Milestones'], ['campus', 'Campus']] as const).map(([id, label]) =>
          <button key={id} type="button" className="filter-chip" aria-pressed={feed === id} onClick={() => setFeed(id)}>{label}</button>)}
      </div>
      <p className="sample-note">Sample posts for the story. These students and counts are not live ByeUni activity.</p>
      <div className="feed-grid" data-stagger>
        {visiblePosts.map(post => <article key={post.id} className="feed-card">
          <header><Initials name={post.name} /><div><strong>{post.name}</strong><small>{post.major} · {post.time}</small></div></header>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
          {post.image ? <img src={post.image} alt="" /> : null}
          <footer><span><Heart size={14} /> {post.likes} likes</span><span><MessageCircle size={14} /> {post.comments} comments</span></footer>
        </article>)}
      </div>
      <Button variant="ink" size="hero" asChild className="story-cta"><a href={links.people} target="_blank" rel="noreferrer">Find your people <ArrowUpRight /></a></Button>
    </section>

    <section id="fundraising" className="campaign-band" aria-labelledby="fund-title">
      <div className="site-wrap story-section">
        <Reveal className="story-intro">
          <p className="eyebrow">Big dreams need a support system</p>
          <h2 id="fund-title" className="section-title">Maya’s robotics build needs a community, not just a budget.</h2>
          <p>Campaigns on ByeUni are for educational goals: books, travel and internships, equipment, housing, licensing exams, and student-led projects. The cards below are samples.</p>
        </Reveal>
        <div className="campaign-grid" data-stagger>
          {campaigns.map(item => {
            const pct = Math.round((item.raised / item.target) * 1000) / 10;
            return <article key={item.title} className="campaign-card">
              <header><Initials name={item.name} /><div><strong>{item.name}</strong><small>{item.major} · Sample campaign</small></div></header>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <div className="goal-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${item.name} sample progress, ${money(item.raised)} of ${money(item.target)}`}><span style={{ width: `${pct}%` }} /></div>
              <div className="goal-meta"><span>{money(item.raised)} raised of {money(item.target)}</span><span>{pct}%</span></div>
              <small className="supporter-line">{item.supporters} supporters in this sample</small>
              <Button variant="brand" asChild><a href={links.funds} target="_blank" rel="noreferrer">Support this goal <ArrowUpRight /></a></Button>
            </article>;
          })}
        </div>
        <p className="sample-note">Support this goal opens the real ByeUni campaign list. It does not start a payment from this page.</p>
      </div>
    </section>

    <section id="rewards" className="site-wrap story-section" aria-labelledby="reward-title">
      <div className="reward-layout">
        <Reveal>
          <p className="eyebrow">Small steps, real progress</p>
          <h2 id="reward-title" className="section-title">Vibeys reward the days <em>you show up.</em></h2>
          <p>Vibeys are ByeUni points for participation: daily login, a forum post, a comment, adding friends, creating a campaign, donating, and a 20-day login streak. Redeem them for rewards inside the product. They are not cash.</p>
          <ul className="check-list">
            <li><Check /> New registration +50</li>
            <li><Check /> Daily login +1 · one forum a day +20</li>
            <li><Check /> Daily comment +10 · campaign donation +20</li>
            <li><Check /> First 10 friends +20 · first campaign +50</li>
            <li><Check /> 20-day login streak +11</li>
          </ul>
        </Reveal>
        <div className="reward-panel">
          <p className="panel-kicker">Sample preview · nothing is saved</p>
          <h3>You&apos;re on a 7-day streak!</h3>
          <p>Complete today&apos;s sample steps to see the preview points add up.</p>
          <div className="streak-row" aria-hidden="true">{Array.from({ length: 7 }, (_, day) => <span key={day} className="is-on" />)}</div>
          <ul className="task-list">
            {vibeyTasks.map(task => <li key={task.id}>
              <button type="button" aria-pressed={done.includes(task.id)} onClick={() => setDone(current => current.includes(task.id) ? current.filter(id => id !== task.id) : [...current, task.id])}>
                <Check size={14} /> {task.label}
              </button>
              <span>+{task.points}</span>
            </li>)}
          </ul>
          <p className="preview-points"><strong>{previewPoints}</strong> preview Vibeys from the steps you marked here.</p>
        </div>
      </div>
    </section>

    <section id="profile" className="profile-band" aria-labelledby="profile-title">
      <div className="site-wrap profile-layout">
        <Reveal>
          <p className="eyebrow">More than a résumé</p>
          <h2 id="profile-title" className="section-title">Cvision is Alex’s living record of the work.</h2>
          <p>Cvision is a dynamic, student-owned webpage. Skills, projects, and accomplishments stay in one place and can keep growing from the first semester to the first career move.</p>
          <Button variant="ink" size="hero" asChild><a href={links.register} target="_blank" rel="noreferrer">Build your Cvision <ArrowUpRight /></a></Button>
        </Reveal>
        <article className="profile-sheet" aria-label="Sample Cvision preview for Alex Rivera">
          <p className="panel-kicker">Sample profile</p>
          <div className="profile-head"><Initials name="Alex Rivera" /><div><h3>Alex Rivera</h3><p>Computer science · campus map project</p></div></div>
          <img src={project} alt="Students collaborating on a creative project in a campus makerspace" data-clip />
          <div className="tag-row"><span>Wayfinding</span><span>Prototyping</span><span>Peer testing</span></div>
          <dl>
            <div><dt>Milestone</dt><dd>First public prototype shared with classmates</dd></div>
            <div><dt>Community</dt><dd>Forums, a design partner search, a build-night signup</dd></div>
            <div><dt>Goal</dt><dd>Equipment campaign so the project can travel</dd></div>
          </dl>
        </article>
      </div>
    </section>

    <section id="discover" className="site-wrap story-section" aria-labelledby="discover-title">
      <Reveal className="story-intro">
        <p className="eyebrow">Discover your people</p>
        <h2 id="discover-title" className="section-title">Find the students already working on something like yours.</h2>
        <p>ByeUni connects students by campus and major. The previews below are samples about belonging, not follower counts.</p>
      </Reveal>
      <div className="filter-row" role="toolbar" aria-label="Sample discovery filters">
        {circles.map(item => <button key={item} type="button" className="filter-chip" aria-pressed={circle === item} onClick={() => setCircle(item)}>{item}</button>)}
      </div>
      <div className="people-grid" data-stagger>
        {visiblePeople.map(person => <article key={person.name} className="people-card">
          <Initials name={person.name} />
          <h3>{person.name}</h3>
          <small>{person.major}</small>
          <p>{person.note}</p>
          <span className="tag-pill">{person.focus}</span>
        </article>)}
      </div>
      <Button variant="editorial" asChild className="story-cta"><a href={links.people} target="_blank" rel="noreferrer">Meet your community <ArrowUpRight /></a></Button>
    </section>

    <section id="activity" className="activity-band" aria-labelledby="activity-title">
      <div className="site-wrap story-section">
        <Reveal className="story-intro">
          <p className="eyebrow">Small wins deserve recognition</p>
          <h2 id="activity-title" className="section-title">The moments <em>worth a mention.</em></h2>
          <p>A sample stream of progress. Not a live activity feed.</p>
        </Reveal>
        <div className="activity-grid" data-stagger>
          <article className="activity-card wide"><Initials name="Alex Rivera" /><div><small>Sample · project</small><h3>Alex shares the first finished prototype.</h3><p>Classmates can see the work, not just the major on a profile.</p></div></article>
          <article className="activity-card mint"><small>Sample · campaign</small><h3>Maya’s robotics goal passes 62%.</h3><p>$1,250 of a $2,000 sample target.</p></article>
          <article className="activity-card ink"><small>Sample · Vibeys</small><h3>A 7-day streak badge.</h3><p>Consistency, shown as a preview — not a payout.</p></article>
          <article className="activity-card"><small>Sample · campus</small><h3>North Quad Lab finishes build night.</h3><p>A collaborative initiative with a photo worth keeping.</p><img src={campus} alt="" /></article>
          <article className="activity-card"><small>Sample · career</small><h3>Jordan writes up the internship offer.</h3><p>A milestone the next student in that major can learn from.</p></article>
        </div>
      </div>
    </section>

    <section id="journey" className="site-wrap story-section" aria-labelledby="journey-title">
      <Reveal className="story-intro">
        <p className="eyebrow">From joining to achieving</p>
        <h2 id="journey-title" className="section-title">Four moves. <em>One student story.</em></h2>
      </Reveal>
      <div className="path-progress" aria-hidden="true"><span /></div>
      <ol className="path">
        <li><span>01</span><h3>Join</h3><p>Create your student profile and discover your community.</p><a href={links.register} target="_blank" rel="noreferrer">Create an account</a></li>
        <li><span>02</span><h3>Participate</h3><p>Share updates, connect with peers, and take on the daily actions that earn Vibeys.</p><a href={links.people} target="_blank" rel="noreferrer">Find your people</a></li>
        <li><span>03</span><h3>Grow</h3><p>Build skills, document milestones, and keep a Cvision that is more than a résumé.</p><a href={links.register} target="_blank" rel="noreferrer">Start your Cvision</a></li>
        <li><span>04</span><h3>Get supported</h3><p>Share a meaningful educational goal and invite people to contribute.</p><a href={links.funds} target="_blank" rel="noreferrer">Explore campaigns</a></li>
      </ol>
    </section>

    <section className="possibility-band"><div className="site-wrap">
      <p className="eyebrow">Your next chapter</p>
      <h2>Your next chapter starts with <em>one connection.</em></h2>
      <p>Share your journey. Find your people. Keep moving forward.</p>
      <div className="stage-actions center-actions">
        <Button variant="ink" size="hero" asChild data-magnetic><a href={links.register} target="_blank" rel="noreferrer">Join ByeUni <ArrowUpRight /></a></Button>
        <Button variant="soft" size="hero" asChild data-magnetic><a href={links.people} target="_blank" rel="noreferrer">Explore the Community</a></Button>
      </div>
    </div></section>

    <section className="site-wrap university" id="universities">
      <div>
        <p className="eyebrow">For colleges and universities</p>
        <h3>Stronger connections. Brighter outcomes.</h3>
        <p>ByeUni is a student engagement and success platform for retention, belonging, and career readiness. Connect students by campus and major, support academic and career goals, and prepare students for life after graduation through a dynamic, student-owned experience.</p>
        <button type="button" className="text-link" onClick={onWatch}>Watch the introduction</button>
      </div>
      <div className="flex gap-3 flex-wrap">
        <Button variant="soft" size="hero" asChild><a href={links.school} target="_blank" rel="noreferrer">School admin login <ArrowUpRight /></a></Button>
        <Button variant="ink" size="hero" asChild><a href={links.demo} target="_blank" rel="noreferrer">Request a demo <ArrowUpRight /></a></Button>
      </div>
    </section>

    <section className="site-wrap story-section faq-grid" aria-labelledby="faq-title">
      <div>
        <p className="eyebrow">A few things you might be wondering</p>
        <h2 id="faq-title" className="section-title">Good questions. <em>A little clarity.</em></h2>
        <Button variant="editorial" asChild><a href="https://byeuni.com/byeuni-faqs/" target="_blank" rel="noreferrer">More questions? <ArrowUpRight /></a></Button>
      </div>
      <Accordion type="single" collapsible>
        {[
          ['What is ByeUni?', 'ByeUni brings student connection, educational fundraising, and a dynamic portfolio together. Find peers, share your journey, and build toward your future.'],
          ['How can I find people on my campus?', 'Explore the ByeUni community to connect with students by campus and major. Forums and private or group chats offer ways to keep conversations going.'],
          ['What can a campaign support?', 'Campaigns can focus on educational goals such as textbooks, equipment, travel, internships, housing, or licensing exams. The campaign cards on this page are samples. Visit the campaign list for current campaigns.'],
          ['What makes Cvision different from a résumé?', 'Cvision is a dynamic, student-owned webpage that brings your experiences, skills, and accomplishments together. It can grow as you add new chapters to your student journey.'],
          ['What are Vibeys?', 'Vibeys are ByeUni’s participation rewards. Students can earn points by engaging with their community and redeem them for rewards. Points are not cash. The streak panel on this page is a local preview only.'],
          ['Where do I create an account?', 'Use Join ByeUni to open account registration. If you already have an account, use Log in to return to the platform.'],
        ].map(([question, answer], i) => <AccordionItem key={question} value={`faq-${i}`}><AccordionTrigger className="faq-trigger">{question}</AccordionTrigger><AccordionContent className="faq-answer">{answer}</AccordionContent></AccordionItem>)}
      </Accordion>
    </section>
  </>;
}
