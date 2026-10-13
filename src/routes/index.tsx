import { createFileRoute, Link } from '@tanstack/react-router';
import { useReducedMotion } from 'motion/react';
import { useRef, useState, type ReactNode } from 'react';
import {
  ArrowRight, Bell, Bookmark, Compass, Flame, Heart, Home, MessageCircle, Pause, Play, Search, Share2, Sparkles, Star, Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ConnectionScene } from '@/components/ConnectionScene';
import { LogoMark, SiteFooter, SiteHeader, Wordmark } from '@/components/site-chrome';
import campus from '@/assets/campus-friends.jpg';
import robotics from '@/assets/student-project.jpg';
import study from '@/assets/study-hub.jpg';
import portfolio from '@/assets/portfolio.jpg';
import seoul from '@/assets/seoul.jpg';
import team from '@/assets/team.jpg';
import offer from '@/assets/offer.jpg';
import p1 from '@/assets/portrait-1.jpg';
import p2 from '@/assets/portrait-2.jpg';
import p3 from '@/assets/portrait-3.jpg';
import p4 from '@/assets/portrait-4.jpg';
import p5 from '@/assets/portrait-5.jpg';
import p6 from '@/assets/portrait-6.jpg';
import p7 from '@/assets/portrait-7.jpg';
import p8 from '@/assets/portrait-8.jpg';

export const Route = createFileRoute('/')({
  ssr: false,
  head: () => ({ meta: [
    { title: 'ByeUni — Your journey. Your people. Your possibilities.' },
    { name: 'description', content: 'Connect with students, share your progress, build your skills, and bring your biggest college goals within reach.' },
    { property: 'og:title', content: 'ByeUni — Your journey. Your people. Your possibilities.' },
    { property: 'og:description', content: 'A student community for a brighter tomorrow. Find your people, support campaigns, and build your CVision.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

// The campus banner film from the byeuni.com hero, served from ByeUni's own uploads.
const bannerVideo = 'https://byeuni.com/staging/wp-content/uploads/2026/04/byeuni-main-banner-video.mp4';

const portraits = [p1, p2, p3, p4, p5, p6, p7, p8];
const campusPosts = [
  { name: 'Kevin Tran', age: '20 age', photo: p3, image: portfolio, text: 'Finally deployed my portfolio website and loved all the feedback from this community.', likes: 95, comments: 24 },
  { name: 'Sara Khan', age: '18 age', photo: p5, image: seoul, text: 'Exploring Seoul during my exchange semester. This experience has been incredible!', likes: 128, comments: 17 },
  { name: 'Rohit Verma', age: '19 age', photo: p6, image: team, text: 'Our college team is building a sustainable campus initiative. Looking for volunteers.', likes: 64, comments: 10 },
  { name: 'Ananya Desai', age: '20 age', photo: p2, image: offer, text: 'Super excited to share that I’ve received an internship offer at Figma!', likes: 310, comments: 48, badge: 'Internship Offer' },
];
function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className} data-reveal>{children}</div>;
}

const steps = [
  { n: '01', title: 'Find your people', body: 'Meet students from your campus and major who are working on the same challenges.' },
  { n: '02', title: 'Share the work', body: 'Post progress, ask questions in forums, and keep the conversation going in chats.' },
  { n: '03', title: 'Fund the goal', body: 'Raise support for books, equipment, travel, internships, housing, and exams.' },
];
const features = [
  { label: 'Networks', title: 'Students who share your campus and major', body: 'Find localized collaboration, resource sharing, and support inside the same academic community.', to: '/people' as const, cta: 'Find your people', image: campus },
  { label: 'Campaigns', title: 'Fund the costs college actually asks for', body: 'Raise money for books, travel, internships, equipment, housing, licensing exams, and the rest of the plan.', to: '/fund' as const, cta: 'Fund your success', image: robotics },
  { label: 'CVision', title: 'A living page instead of a static résumé', body: 'Show skills, projects, and accomplishments in a page you keep updating as the semester changes.', to: '/register' as const, cta: 'Start your CVision', image: study },
  { label: 'Vibeys', title: 'Points for showing up, not for sitting still', body: 'Earn Vibeys for logging in, posting, commenting, and supporting campaigns, then redeem them for rewards.', to: '/register' as const, cta: 'Get started', image: offer },
];

/** Muted, looping campus film. Autoplays unless the visitor prefers reduced motion; always pausable. */
function CampusFilm({ onWatch }: { onWatch: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };
  return <section className="bj-film" aria-label="Students arriving on campus">
    <div className="bj-film-frame">
      <video ref={video} className="bj-film-video" src={bannerVideo} autoPlay={!reduce} muted loop playsInline preload="metadata" aria-hidden="true" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <button type="button" className="bj-film-toggle" onClick={toggle} aria-label={playing ? 'Pause background video' : 'Play background video'}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
      <div className="bj-film-copy" data-reveal>
        <p className="eyebrow">Friends · Funds · Futures</p>
        <h2>Your campus story<br /><em>starts here.</em></h2>
        <Button variant="soft" size="hero" data-magnetic onClick={onWatch}><Play size={14} /> Watch the introduction</Button>
      </div>
    </div>
  </section>;
}

function Bar({ value }: { value: number }) {
  return <div className="bj-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%` }} /></div>;
}

function ProductMock() {
  return <div className="bj-app" aria-hidden="true">
    <aside className="bj-side">
      <div className="bj-side-brand"><LogoMark /><Wordmark /></div>
      <nav>
        <span className="is-on"><Home size={15} /> Home</span>
        <span><Compass size={15} /> Explore</span>
        <span><MessageCircle size={15} /> Messages</span>
        <span><Heart size={15} /> Campaigns</span>
        <span><Flame size={15} /> Challenges</span>
        <span><Sparkles size={15} /> CVision</span>
        <span><Bookmark size={15} /> Saved</span>
      </nav>
    </aside>
    <div className="bj-feed">
      <div className="bj-searchline"><Search size={14} /> Search students, posts, skills, campaigns…</div>
      <article className="bj-post">
        <header><img src={p1} alt="" /><div><strong>Arjun Mehta</strong><small>Computer Science · 21 age</small></div><span>•••</span></header>
        <p>Just finished building my first full-stack project! A study buddy platform for college students. Feedback is super welcome!</p>
        <div className="bj-shot"><img src={study} alt="" /><div><b>StudyHub</b><small>Connect. Learn. Grow together.</small></div></div>
        <footer><span><Heart size={14} /> 124</span><span><MessageCircle size={14} /> 32</span><span><Share2 size={14} /> Share</span></footer>
      </article>
      <article className="bj-post">
        <header><img src={p2} alt="" /><div><strong>Priya Sharma</strong><small>Design · 21 age</small></div></header>
        <p>Here’s a few shots from my latest UI/UX project for a mental wellness app. Would love your thoughts!</p>
        <div className="bj-strip"><img src={portfolio} alt="" /><img src={study} alt="" /><img src={campus} alt="" /></div>
      </article>
    </div>
    <aside className="bj-rail">
      <div className="bj-rail-top"><Bell size={16} /><img src={p6} alt="" /><b>Arjun</b></div>
      <section className="bj-trend">
        <header><span>Trending Campaign</span><small>View all</small></header>
        <h3>Help Maya bring her robotics project to life</h3>
        <img src={robotics} alt="" />
        <div className="bj-money"><div><b data-count>$1,250</b> raised</div><div><b>$2,000</b> goal</div><div data-count>62.5%</div></div>
        <Bar value={62.5} />
        <div className="bj-faces"><span>{portraits.slice(0, 4).map(src => <img key={src} src={src} alt="" />)}</span><small>48 supporters</small></div>
        <div className="bj-support">Support this goal</div>
      </section>
      <section className="bj-badge">
        <Star size={18} />
        <div><strong>Achievement unlocked!</strong><p>You earned the “Consistent Learner” badge for a 7-day streak!</p><b>+50 Vibeys</b></div>
      </section>
    </aside>
  </div>;
}

function Index() {
  const [videoOpen, setVideoOpen] = useState(false);
  const [feature, setFeature] = useState(0);
  const spot = features[feature];

  return <div id="top" className="bj-page">
    <div className="bj-progressbar" aria-hidden="true" />
    <div className="bj-aurora" aria-hidden="true"><span /><span /><span /><span /></div>
    <SiteHeader />

    <main>
      <section className="site-wrap bj-hero">
        <div className="bj-copy">
          <p className="bj-pill"><LogoMark /> Friends, funds, and futures</p>
          <h1>Where students get seen, supported, and <em>funded.</em></h1>
          <p className="bj-lead">Document your college experience, find your friends, and fund your goals — all in one platform.</p>
          <div className="bj-cta">
            <Button variant="ink" size="hero" asChild data-magnetic><Link to="/register">Get started <ArrowRight /></Link></Button>
            <Button variant="soft" size="hero" asChild data-magnetic><Link to="/school">Request a demo</Link></Button>
          </div>
          <div className="bj-social">
            <div className="bj-stack">{portraits.slice(0, 4).map(src => <img key={src} src={src} alt="" />)}</div>
            <span><b data-count>10,000+</b> students are building, sharing and growing together on ByeUni.</span>
          </div>
        </div>
        <div className="bj-stage">
          <ProductMock />
          <div className="bj-chip bj-chip-a" aria-hidden="true" data-speed="0.35"><img src={p2} alt="" /><div><b>Meera joined</b><small>Design circle · just now</small></div></div>
          <div className="bj-chip bj-chip-b" aria-hidden="true" data-speed="-0.25"><span><Flame size={16} /></span><div><b>7-day streak</b><small>+50 Vibeys earned</small></div></div>
        </div>
      </section>

      <CampusFilm onWatch={() => setVideoOpen(true)} />

      <section className="site-wrap gv-steps" aria-labelledby="steps-title">
        <div className="gv-steps-copy">
          <p className="eyebrow">The platform</p>
          <h2 id="steps-title">Everything campus life asks for, in one place.</h2>
        </div>
        <div className="gv-step-grid" data-stagger>
          <article className="gv-step">
            <div className="gv-stage">
              <img src={campus} alt="" />
              <div className="gv-float gv-faces">
                <span>{portraits.slice(0, 4).map(src => <img key={src} src={src} alt="" />)}</span>
                <small>Same campus, same major</small>
              </div>
            </div>
            <span>01</span>
            <h3>Find your people</h3>
            <p>{steps[0].body}</p>
            <Link to="/people">Find your people <ArrowRight size={14} /></Link>
          </article>
          <article className="gv-step">
            <div className="gv-stage">
              <img src={study} alt="" />
              <div className="gv-float gv-note">
                <img src={p1} alt="" />
                <div><b>Studio tonight?</b><small>Priya · Design · just now</small></div>
              </div>
            </div>
            <span>02</span>
            <h3>Share the work</h3>
            <p>{steps[1].body}</p>
            <Link to="/people">Join the conversation <ArrowRight size={14} /></Link>
          </article>
          <article className="gv-step">
            <div className="gv-stage">
              <img src={robotics} alt="" />
              <div className="gv-float gv-fundlet">
                <div><b>$1,250</b><small>of $2,000 for the robotics kit</small></div>
                <div className="bj-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={62}><span style={{ width: '62%' }} /></div>
              </div>
            </div>
            <span>03</span>
            <h3>Fund the goal</h3>
            <p>{steps[2].body}</p>
            <Link to="/fund">Explore campaigns <ArrowRight size={14} /></Link>
          </article>
        </div>
      </section>

      <section className="site-wrap gv-feature" aria-labelledby="feature-title">
        <div className="gv-feature-copy">
          <h2 id="feature-title">From campus to career, together.</h2>
          <p>ByeUni is a student engagement platform for belonging, fundraising, and a portfolio that keeps growing after the semester ends.</p>
        </div>
        <div className="gv-tabs" role="tablist" aria-label="ByeUni features">
          {features.map((item, index) => <button key={item.label} type="button" role="tab" aria-selected={feature === index} onClick={() => setFeature(index)}>{item.label}</button>)}
        </div>
        <article className="gv-panel" key={spot.label}>
          <div className="gv-stage">
            <img src={spot.image} alt="" />
            {spot.label === 'Networks' ? <div className="gv-float gv-faces"><span>{portraits.slice(2, 6).map(src => <img key={src} src={src} alt="" />)}</span><small>On your campus</small></div> : null}
            {spot.label === 'Campaigns' ? <div className="gv-float gv-fundlet"><div><b>$1,250</b><small>raised of $2,000</small></div><div className="bj-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={62}><span style={{ width: '62%' }} /></div></div> : null}
            {spot.label === 'CVision' ? <div className="gv-float gv-note"><img src={p3} alt="" /><div><b>Maya Chen</b><small>CVision updated this week</small></div></div> : null}
            {spot.label === 'Vibeys' ? <div className="gv-float gv-note"><div><b>+50 Vibeys</b><small>New registration</small></div></div> : null}
          </div>
          <div>
            <p className="eyebrow">{spot.label}</p>
            <h3>{spot.title}</h3>
            <p>{spot.body}</p>
            <Button variant="ink" asChild><Link to={spot.to}>{spot.cta} <ArrowRight /></Link></Button>
          </div>
        </article>
      </section>

      <section className="site-wrap gv-works" aria-labelledby="works-title">
        <div>
          <h2 id="works-title">How students use ByeUni</h2>
          <p>Create a profile, find your campus, and keep a record of the work that should outlast a résumé.</p>
          <Button variant="ink" size="hero" asChild><Link to="/register">Get started</Link></Button>
        </div>
        <ol data-stagger>
          <li>
            <img src={p4} alt="" />
            <div><span>01</span><strong>Create your profile</strong><p>Join with your campus and major so the right students can find you.</p></div>
          </li>
          <li>
            <img src={team} alt="" />
            <div><span>02</span><strong>Join the conversation</strong><p>Use forums and chats to ask for feedback, collaborators, and advice.</p></div>
          </li>
          <li>
            <img src={portfolio} alt="" />
            <div><span>03</span><strong>Show the progress</strong><p>Update your CVision and open a campaign when a real educational cost shows up.</p></div>
          </li>
        </ol>
      </section>

      <section className="site-wrap gv-stories" aria-labelledby="stories-title">
        <div className="gv-steps-copy">
          <p className="eyebrow">On campus</p>
          <h2 id="stories-title">The work students are already sharing.</h2>
        </div>
        <div className="gv-story-grid">
          {campusPosts.map(post => <article key={post.name} className="gv-story">
            <img src={post.image} alt="" />
            <div>
              {post.badge ? <em>{post.badge}</em> : null}
              <h3>{post.text}</h3>
              <p>{post.name} · {post.age}</p>
            </div>
          </article>)}
        </div>
        <Button variant="soft" asChild><Link to="/people">Find your people <ArrowRight /></Link></Button>
      </section>

    </main>

    <SiteFooter />

    <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
      <DialogContent className="modal-content">
        <div className="modal-scene"><ConnectionScene compact /></div>
        <DialogTitle className="font-display text-2xl">Say hello to ByeUni.</DialogTitle>
        <DialogDescription>Friends, funds, and futures start here.</DialogDescription>
        <iframe className="video-frame" src="https://www.youtube.com/embed/kTfJ9lKSA6g?rel=0" title="Introduction to ByeUni" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        <Button variant="ink" size="hero" asChild><Link to="/register">Get started <ArrowRight /></Link></Button>
      </DialogContent>
    </Dialog>
  </div>;
}
