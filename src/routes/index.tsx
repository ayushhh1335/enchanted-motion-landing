import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ArrowRight, Bell, Bookmark, Compass, Flame, Heart, Home, MessageCircle, Play, Search, Share2, Sparkles, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import { FlipWords } from '@/components/ui/flip-words';
import { Spotlight } from '@/components/ui/spotlight';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { ConnectionScene } from '@/components/ConnectionScene';
import { LongJourney } from '@/components/LongJourney';
import { LogoMark, SiteFooter, SiteHeader, Wordmark } from '@/components/site-chrome';
import campus from '@/assets/campus-friends.jpg';
import robotics from '@/assets/student-project.jpg';
import study from '@/assets/study-hub.jpg';
import portfolio from '@/assets/portfolio.jpg';
import p1 from '@/assets/portrait-1.jpg';
import p2 from '@/assets/portrait-2.jpg';
import p3 from '@/assets/portrait-3.jpg';
import p4 from '@/assets/portrait-4.jpg';
import p5 from '@/assets/portrait-5.jpg';
import p6 from '@/assets/portrait-6.jpg';

export const Route = createFileRoute('/')({
  ssr: false,
  head: () => ({ meta: [
    { title: 'ByeUni — Where every student gets seen, supported, and funded.' },
    { name: 'description', content: 'ByeUni is the student network for friends, funds, and futures: find your people on campus, raise support for real educational costs, and build a CVision that keeps growing.' },
    { property: 'og:title', content: 'ByeUni — Where every student gets seen, supported, and funded.' },
    { property: 'og:description', content: 'Find your people, fund your goals, and build your future — one student network for college life.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

const faces = [p1, p2, p3, p4, p5];

function Bar({ value }: { value: number }) {
  return <div className="bj-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><span style={{ width: `${value}%` }} /></div>;
}

/** The student home feed, drawn as a still: what a student sees the moment they sign in. */
function ProductMock() {
  return <div className="lp-app" aria-hidden="true">
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
        <div className="bj-money"><div><b>$1,250</b> raised</div><div><b>$2,000</b> goal</div><div>62.5%</div></div>
        <Bar value={62.5} />
        <div className="bj-faces"><span>{faces.slice(0, 4).map(src => <img key={src} src={src} alt="" />)}</span><small>48 supporters</small></div>
        <div className="bj-support">Support this goal</div>
      </section>
      <section className="bj-badge">
        <Star size={18} />
        <div><strong>Achievement unlocked!</strong><p>You earned the “Consistent Learner” badge for a 7-day streak!</p><b>+50 Vibeys</b></div>
      </section>
    </aside>
  </div>;
}

function Hero({ onWatch }: { onWatch: () => void }) {
  return <section className="lp-hero" aria-labelledby="lp-hero-title">
    <div className="lp-hero-bg" aria-hidden="true">
      <Spotlight className="lp-hero-spot" />
      <Spotlight className="lp-hero-spot is-far" strength={0.14} />
    </div>
    <ContainerScroll className="lp-hero-scroll" titleComponent={<div className="lp-hero-copy">
      <Link to="/works" className="lp-pill"><LogoMark /> The student network for friends, funds &amp; futures <ArrowRight /></Link>
      <h1 id="lp-hero-title">Where every student gets <FlipWords className="lp-hero-flip" words={['seen.', 'supported.', 'funded.', 'hired.']} /></h1>
      <TextGenerateEffect
        className="lp-hero-lead"
        delay={0.035}
        words="ByeUni brings your campus friends, the goals you’re raising support for, and a portfolio that keeps growing into one place — so the people rooting for you can actually help."
      />
      <div className="lp-hero-cta">
        <Button variant="ink" size="hero" asChild><Link to="/register">Create your account <ArrowRight /></Link></Button>
        <Button variant="soft" size="hero" onClick={onWatch}><Play /> Watch the introduction</Button>
      </div>
      <div className="lp-hero-proof">
        <span className="lp-faces">{faces.map(src => <img key={src} src={src} alt="" />)}</span>
        <span><b>10,000+ students</b> are building, sharing, and growing together on ByeUni.</span>
      </div>
    </div>}>
      <ProductMock />
    </ContainerScroll>
  </section>;
}

function Index() {
  const [videoOpen, setVideoOpen] = useState(false);
  const watch = () => setVideoOpen(true);

  return <div id="top" className="lp-page">
    <div className="bj-progressbar" aria-hidden="true" />
    <SiteHeader />

    <main>
      <Hero onWatch={watch} />
      <LongJourney onWatch={watch} />
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
