import { createFileRoute } from '@tanstack/react-router';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { ArrowUpRight, ArrowRight, Play, Users, Sparkles, Check, MessageCircle, GraduationCap, Heart, Menu, Globe, BadgeCheck, Sprout, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ConnectionScene } from '@/components/ConnectionScene';
import campus from '@/assets/campus-friends.jpg';

export const Route = createFileRoute('/')({
  ssr: false,
  head: () => ({ meta: [
    { title: 'ByeUni — Your people. Your potential.' },
    { name: 'description', content: 'Find your college community, fund your ambitions, and build your future with ByeUni. Your vibe, your tribe.' },
    { property: 'og:title', content: 'ByeUni — Your people. Your potential.' },
    { property: 'og:description', content: 'Friends, funds, and futures start here. Connect with students, share your journey, and bring your goals to life.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

const links = {
  register: 'https://byeuni.com/register.php', login: 'https://byeuni.com/login.php',
  people: 'https://byeuni.com/all-users.php', funds: 'https://byeuni.com/campaign-list.php',
  demo: 'https://byeuni.com/bookdemo.php', school: 'https://byeuni.com/school/',
};
const features = [
  { id: 'people', number: '01', title: 'Find your people.', label: 'Your tribe is out there.', icon: Users, description: 'Same campus. Shared interests. Big ideas. Meet the people who make your college experience feel like you.', details: 'Connect with students by campus and major. Find peers facing the same challenges, exchange ideas in forums, and keep the conversation going with private or group chats.', cta: 'Find your people', href: links.people },
  { id: 'funds', number: '02', title: 'Fund your ambitions.', label: 'Big dreams. Real support.', icon: Heart, description: 'From textbooks to your next big adventure. Rally a community around the goals that matter to you.', details: 'Create a campaign for books, travel, internships, equipment, housing, or licensing exams. Share your story and connect with people who want to support your educational journey.', cta: 'Explore campaigns', href: links.funds },
  { id: 'future', number: '03', title: 'Own your future.', label: 'More than a résumé.', icon: Sparkles, description: 'Turn your experiences into a living story. Show the world what you’re learning, building, and becoming.', details: 'Cvision is your dynamic, student-owned webpage. Bring your skills, experiences, and accomplishments together in a creative profile that grows with you—from your first semester to your first career move.', cta: 'Build your Cvision', href: links.register },
];

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .65, delay, ease: [.2,.7,.2,1] }}>{children}</motion.div>;
}
function Logo() { return <a href="#" aria-label="ByeUni home" className="logo"><span className="logo-mark" aria-hidden="true" />byeuni<span className="text-primary">.</span></a>; }
function FeatureArt({ id }: { id: string }) {
  return <div className={`feature-art ${id}`} aria-hidden="true">
    {id === 'people' ? <><div className="mini-profile"><img src={campus} alt="" width={49} height={49} loading="lazy" /><strong>Your next connection</strong><small>Same campus. Same energy.</small><div className="mini-pill">Let’s connect ↗</div></div><span className="art-bubble"><MessageCircle size={22} /></span></>
    : id === 'funds' ? <><div className="mini-fund"><small>YOUR NEXT CHAPTER</small><strong>A little support. A big leap.</strong><div className="progress" /><small>Every contribution counts ♡</small></div><span className="art-bubble"><Heart size={20} /></span></>
    : <><div className="mini-cv"><small className="text-muted-foreground text-[9px]">MY CVISION</small><div><strong>Hello, future.</strong></div><div className="cv-tags"><span>Creative</span><span>Curious</span><span>Driven</span></div><div className="cv-line" /><div className="cv-line short" /><div className="cv-line" /></div><span className="art-bubble"><Sparkles size={22} /></span></>}
  </div>;
}

function Index() {
  const [modal, setModal] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const selected = features.find(item => item.id === modal);
  const reduce = useReducedMotion();
  return <MotionConfig reducedMotion="user"><div>
    <div className="site-wrap">
      <header className="site-header">
        <Logo />
        <nav aria-label="Main navigation" className="nav-links">
          <a href="#possibilities">Discover ByeUni</a>
          <a href={links.funds}>Fund your success <ArrowUpRight className="inline size-3 ml-1" /></a>
          <a href="#universities">For universities <ChevronDown className="inline size-3 ml-1" /></a>
        </nav>
        <div className="nav-actions">
          <Button variant="ghost" asChild className="login-link text-xs"><a href={links.login}>Log in</a></Button>
          <Button variant="ink" asChild className="text-xs h-10 px-5"><a href={links.register}>Get started <ArrowUpRight /></a></Button>
          <Button variant="ghost" size="icon" className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu /></Button>
        </div>
      </header>
      <main>
        <section className="hero">
          <div className="hero-scene"><ConnectionScene /></div>
          <Reveal className="hero-copy">
            <div className="eyebrow"><span className="status-dot" /> YOUR VIBE. YOUR TRIBE.</div>
            <h1>Your people.<br />Your potential.<br /><span className="last-line">Your ByeUni.</span></h1>
            <p className="hero-description">College is more than a degree. Find your community,<br className="hidden lg:block" /> fund your dreams, and build a future that’s yours.</p>
            <div className="hero-actions">
              <Button variant="brand" size="hero" asChild><a href={links.register}>Find your place <ArrowUpRight /></a></Button>
              <Button variant="soft" size="hero" onClick={() => setModal('video')}><Play size={14} /> Meet ByeUni</Button>
            </div>
            <div className="hero-footnote"><div className="avatar-stack">{[15,45,72].map((position) => <img key={position} src={campus} alt="" width={30} height={30} style={{ objectPosition: `${position}% 25%` }} />)}</div><span>A little connection. A world of possibility.</span></div>
          </Reveal>
          <motion.div className="float-note note-people" animate={reduce ? {} : { y: [0,-9,0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}><div className="note-icon"><Users size={18} /></div><div><strong>You belong here.</strong><span>Your people are waiting.</span></div></motion.div>
          <motion.div className="float-note note-goal" animate={reduce ? {} : { y: [0,8,0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}><div className="note-icon"><Heart size={17} /></div><div><strong>Dream it. Fund it.</strong><span>Goals backed by your community.</span></div></motion.div>
          <motion.div className="float-note note-future" animate={reduce ? {} : { y: [0,-7,0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}><div className="note-icon"><Sparkles size={17} /></div><div><strong>Your next chapter.</strong><span>Make it a good one.</span></div></motion.div>
          <a href="#possibilities" className="hero-label">GOOD THINGS START WITH CONNECTION <ArrowRight size={12} /></a>
        </section>
        <div className="value-strip">
          <div><Users size={18} /><span>Real people. Meaningful connections.</span></div>
          <div><Sprout size={18} /><span>Big ambitions. A little backup.</span></div>
          <div><Globe size={18} /><span>Your campus. A world of possibilities.</span></div>
        </div>
        <section id="possibilities" className="section">
          <Reveal className="section-heading"><div><div className="eyebrow">A SPACE TO BECOME</div><h2 className="section-title">Three ways to move forward.<br />One place to start.</h2></div><p>Your college journey isn’t one-size-fits-all.<br />Neither is ByeUni. Make room for what’s next.</p></Reveal>
          <div className="feature-grid">{features.map((feature, index) => <Reveal key={feature.id} delay={index * .1}><motion.article className="feature-card" whileHover={reduce ? {} : { y: -7, rotateX: 2, rotateY: -2 }} transition={{ duration: .3 }}>
            <FeatureArt id={feature.id} /><div className="feature-body"><div className="eyebrow text-muted-foreground mb-3">{feature.number} / {feature.label}</div><h3>{feature.title}</h3><p>{feature.description}</p><Button variant="editorial" onClick={() => setModal(feature.id)} className="text-xs mt-2">Explore {feature.id === 'future' ? 'Cvision' : feature.id === 'funds' ? 'campaigns' : 'your community'} <ArrowUpRight /></Button></div>
          </motion.article></Reveal>)}</div>
        </section>
      </main>
    </div>
    <section className="community-band" id="community"><div className="site-wrap section community-grid">
      <Reveal><img className="community-photo" src={campus} alt="University students connecting and sharing ideas on campus" width={1536} height={1024} loading="lazy" /></Reveal>
      <Reveal className="community-copy"><div className="eyebrow"><span className="status-dot" /> BUILT AROUND YOU</div><h2 className="section-title">You don’t have to<br />figure it out alone.</h2><p>The best part of college? The people you find along the way. ByeUni brings your campus closer, so you can share the questions, celebrate the wins, and grow together.</p><ul><li><Check /> Connect with students on your campus and in your major</li><li><Check /> Find support for your academic and personal goals</li><li><Check /> Build a story that goes beyond your degree</li></ul><Button variant="ink" size="hero" asChild><a href={links.people}>Meet your community <ArrowUpRight /></a></Button></Reveal>
    </div></section>
    <div className="site-wrap">
      <section className="section"><Reveal><div className="eyebrow">THE LITTLE THINGS THAT MAKE A BIG DIFFERENCE</div><h2 className="section-title">More connection. More momentum.</h2></Reveal><div className="tools-row">
        {[{ icon: MessageCircle, title: 'Start a conversation.', text: 'Ask the class question. Share the big idea. Forums and chats make it easier to connect with people who get it.' },{ icon: Users, title: 'Build your network.', text: 'Find familiar faces and fresh perspectives. Connect across your campus and major, one conversation at a time.' },{ icon: BadgeCheck, title: 'Good vibes get rewarded.', text: 'Meet Vibeys. Earn points when you participate, post, and support your community—then redeem them for rewards.' }].map((item, i) => <Reveal key={item.title} delay={i * .1}><div className="tool-icon"><item.icon size={20} /></div><h3>{item.title}</h3><p>{item.text}</p></Reveal>)}
      </div></section>
      <section className="university" id="universities"><div><div className="eyebrow mb-3"><GraduationCap size={16} /> FOR COLLEGES & UNIVERSITIES</div><h3>Stronger connections. Brighter outcomes.</h3><p>Support belonging, student engagement, and career readiness on your campus.</p></div><div className="flex gap-3 flex-wrap"><Button variant="soft" size="hero" asChild><a href={links.school}>School admin login <ArrowUpRight /></a></Button><Button variant="ink" size="hero" asChild><a href={links.demo}>Let’s talk <ArrowUpRight /></a></Button></div></section>
    </div>
    <section className="final-band"><Reveal className="site-wrap"><div className="eyebrow">FRIENDS. FUNDS. FUTURES.</div><h2>Your next chapter<br />starts with a hello.</h2><p>Find your people. Back your dreams. Become your kind of brilliant.</p><Button variant="brand" size="hero" asChild><a href={links.register}>Say hello to ByeUni <ArrowUpRight /></a></Button></Reveal></section>
    <footer className="site-wrap footer"><Logo /><div className="footer-links"><a href="https://byeuni.com/keys-to-byeuni-success/">About us</a><a href="https://byeuni.com/byeuni-faqs/">FAQs</a><a href="https://byeuni.com/contact-us/">Contact</a><a href="https://byeuni.com/privacy-policy-2/">Privacy</a><a href="https://byeuni.com/byeuni-llc-terms-of-service/">Terms</a></div><span className="copyright">© 2026 ByeUni. All good things reserved.</span></footer>

    <Dialog open={modal !== null} onOpenChange={open => { if (!open) setModal(null); }}><DialogContent className="modal-content">
      {modal === 'video' ? <><DialogTitle className="font-display text-2xl">Say hello to ByeUni.</DialogTitle><DialogDescription>Friends, funds, and futures start here.</DialogDescription><iframe className="video-frame" src="https://www.youtube.com/embed/kTfJ9lKSA6g?rel=0" title="Introduction to ByeUni" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /><Button variant="brand" size="hero" asChild><a href={links.register}>Start your next chapter <ArrowUpRight /></a></Button></>
      : selected ? <><div className="modal-scene"><ConnectionScene compact /></div><div className="eyebrow mt-2">{selected.label}</div><DialogTitle className="font-display text-3xl">{selected.title}</DialogTitle><DialogDescription className="modal-copy">{selected.details}</DialogDescription><Button variant="ink" size="hero" asChild><a href={selected.href}>{selected.cta} <ArrowUpRight /></a></Button></> : null}
    </DialogContent></Dialog>
    <Dialog open={mobileOpen} onOpenChange={setMobileOpen}><DialogContent className="modal-content"><DialogTitle className="font-display text-2xl">Explore ByeUni</DialogTitle><DialogDescription>Your people. Your potential.</DialogDescription><nav className="mobile-navigation" aria-label="Mobile navigation"><a href="#possibilities" onClick={() => setMobileOpen(false)}>Discover ByeUni</a><a href={links.people}>Find your people ↗</a><a href={links.funds}>Fund your success ↗</a><a href="#universities" onClick={() => setMobileOpen(false)}>For universities</a><a href={links.login}>Log in ↗</a></nav></DialogContent></Dialog>
  </div></MotionConfig>;
}