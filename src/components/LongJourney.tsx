import { useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  Angry, ArrowRight, BadgeCheck, BriefcaseBusiness, CalendarDays, Check, Clock, Crown, FileUser, Flame, Frown, Gift, HandHeart, Heart, HeartPulse, Laugh, Megaphone,
  Meh, MessageCircle, MessagesSquare, Pause, Play, ShieldCheck, Smartphone, Smile, Sparkles, Star, Trophy, Users,
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { Button } from '@/components/ui/button';
import { HoverEffect, type HoverCardItem } from '@/components/ui/card-hover-effect';
import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight';
import { InfiniteMovingCards, type MovingCard } from '@/components/ui/infinite-moving-cards';
import { LampContainer } from '@/components/ui/lamp';
import { StickyScroll, type StickyChapter } from '@/components/ui/sticky-scroll-reveal';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { Timeline, type TimelineEntry } from '@/components/ui/timeline';
import { LogoMark } from '@/components/Brand';
import campus from '@/assets/campus-friends.jpg';
import robotics from '@/assets/student-project.jpg';
import study from '@/assets/study-hub.jpg';
import portfolio from '@/assets/portfolio.jpg';
import team from '@/assets/team.jpg';
import future from '@/assets/student-future.jpg';
import p1 from '@/assets/portrait-1.jpg';
import p2 from '@/assets/portrait-2.jpg';
import p3 from '@/assets/portrait-3.jpg';
import p4 from '@/assets/portrait-4.jpg';
import p5 from '@/assets/portrait-5.jpg';
import p6 from '@/assets/portrait-6.jpg';
import p7 from '@/assets/portrait-7.jpg';
import p8 from '@/assets/portrait-8.jpg';

// The campus banner film from the byeuni.com hero, served from ByeUni's own uploads.
const bannerVideo = 'https://byeuni.com/staging/wp-content/uploads/2026/04/byeuni-main-banner-video.mp4';

function Faces({ list, small }: { list: string[]; small?: boolean }) {
  return <span className={small ? 'lp-faces is-sm' : 'lp-faces'}>{list.map(src => <img key={src} src={src} alt="" />)}</span>;
}

function Progress({ value, label }: { value: number; label: string }) {
  return <div className="bj-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={label}><span style={{ width: `${value}%` }} /></div>;
}

/* ---------------- Chapter pictures ---------------- */

function FriendsScene() {
  return <div className="lp-scene">
    <img className="lp-scene-photo" src={campus} alt="" />
    <div className="lp-float is-top-left"><Faces list={[p2, p4, p5, p6]} small /><span><b>Robotics Club</b><small>214 students on your campus</small></span></div>
    <div className="lp-float is-bottom-left"><img src={p2} alt="" /><span><b>Priya · Design</b><small>Anyone free to test the arm tonight?</small></span></div>
    <div className="lp-float lp-reply is-bottom-right"><span><small>I’m in. Lab 3 at 7?</small></span></div>
  </div>;
}

function FundsScene() {
  return <div className="lp-scene is-card">
    <article className="lp-campaign">
      <img src={robotics} alt="" />
      <div>
        <span className="lp-chip"><Clock /> 12 days left</span>
        <h4>Help Maya bring her robotics project to life</h4>
        <p className="lp-money"><b>$1,250</b><span>raised of $2,000 · 62%</span></p>
        <Progress value={62} label="Sample campaign, 62% funded" />
        <p className="lp-row"><Faces list={[p1, p3, p5, p7]} small /><small>48 supporters</small></p>
      </div>
    </article>
    <div className="lp-float is-top-right"><span className="lp-float-icon"><HandHeart /></span><span><b>Aunt Lena gave $50</b><small>“So proud of you, Maya!”</small></span></div>
  </div>;
}

const activity = (length: number) => Array.from({ length }, (_, i) => ((i * 37 + (i % 7) * 11) % 10) / 10);
const heat = activity(98);
const heatYear = activity(182);

function FuturesScene() {
  return <div className="lp-scene is-card">
    <article className="lp-cv">
      <header>
        <img src={p3} alt="" />
        <div><h4>Maya Chen <BadgeCheck /></h4><small>Mechanical Engineering · Robotics</small></div>
      </header>
      <p className="lp-status"><i aria-hidden="true" /> Open to summer internships</p>
      <div className="lp-tags"><span>ROS</span><span>CAD</span><span>Python</span><span>Embedded C</span></div>
      <div className="lp-cv-project"><img src={portfolio} alt="" /><div><b>Autonomous sorting arm</b><small>Regional finalist · three-person team</small></div></div>
      <div className="lp-heat" aria-hidden="true">{heat.map((level, i) => <i key={i} style={{ opacity: 0.12 + level * 0.88 }} />)}</div>
    </article>
  </div>;
}

const moods = [Laugh, Smile, Meh, Frown, Angry];

function VibeysScene() {
  return <div className="lp-scene is-card">
    <article className="lp-vibeys">
      <small>Your balance</small>
      <strong>1,240 <span>Vibeys</span></strong>
      <ol className="lp-streak" aria-label="7-day login streak">{Array.from({ length: 7 }, (_, i) => <li key={i}><Check /></li>)}</ol>
      <p className="lp-streak-note"><Flame /> 7-day login streak</p>
      <div className="lp-mood">
        <p>How’s your vibe today?</p>
        <div>{moods.map((Icon, i) => <span key={i} className={i === 1 ? 'is-on' : undefined}><Icon /></span>)}</div>
      </div>
    </article>
    <div className="lp-float is-bottom-right"><span className="lp-float-icon is-sun"><Star /></span><span><b>+50 Vibeys</b><small>Consistent Learner badge</small></span></div>
  </div>;
}

const chapters: StickyChapter[] = [
  {
    id: 'friends', tone: 'mint', eyebrow: 'Chapter 01 · Friends', title: 'Find your people in week one.',
    description: <>
      <p>ByeUni connects students by campus and major, so the classmates working on the same problems are one tap away. Forums keep the big questions going; private and group chats handle the late-night ones.</p>
      <ul className="lp-ticks"><li><Check /> Networks by campus and major</li><li><Check /> Forums for clubs, courses, and causes</li><li><Check /> Private and group chats</li></ul>
    </>,
    action: <Link to="/people" className="lp-link">Find your people <ArrowRight /></Link>,
    content: <FriendsScene />,
  },
  {
    id: 'funds', tone: 'sun', eyebrow: 'Chapter 02 · Funds', title: 'Fund the costs college actually asks for.',
    description: <>
      <p>When a real educational cost shows up, students open a campaign and share it with the people who already believe in them. Gifts arrive through PayPal as they come in, not at a finish line.</p>
      <ul className="lp-ticks"><li><Check /> Books, equipment, and travel</li><li><Check /> Internships, housing, and licensing exams</li><li><Check /> Updates that bring supporters back</li></ul>
    </>,
    action: <Link to="/fund" className="lp-link">Explore campaigns <ArrowRight /></Link>,
    content: <FundsScene />,
  },
  {
    id: 'futures', tone: 'sky', eyebrow: 'Chapter 03 · Futures', title: 'A living page instead of a static résumé.',
    description: <>
      <p>CVision turns projects, skills, and milestones into a portfolio page the student owns. Themes, layouts, and coding activity make it personal, and it keeps growing from the first semester to the first job.</p>
      <ul className="lp-ticks"><li><Check /> Projects, skills, and experience</li><li><Check /> GitHub and LeetCode activity</li><li><Check /> One link for every application</li></ul>
    </>,
    action: <Link to="/register" className="lp-link">Start your CVision <ArrowRight /></Link>,
    content: <FuturesScene />,
  },
  {
    id: 'vibeys', tone: 'rose', eyebrow: 'Chapter 04 · Showing up', title: 'Small steps, rewarded.',
    description: <>
      <p>Vibeys are points for participation: logging in, posting, commenting, adding friends, and supporting campaigns. Students redeem them for rewards. A 20-second Vibe Check shows how campus is really feeling, anonymously.</p>
      <ul className="lp-ticks"><li><Check /> +50 for joining, +20 for a forum post</li><li><Check /> Streak bonuses for showing up</li><li><Check /> An anonymous daily campus pulse</li></ul>
    </>,
    action: <Link to="/register" className="lp-link">Start earning Vibeys <ArrowRight /></Link>,
    content: <VibeysScene />,
  },
];

/* ---------------- One year, month by month ---------------- */

const year: TimelineEntry[] = [
  {
    id: 'sep', title: 'September', caption: 'Week one',
    content: <>
      <h4 className="lp-tl-title">Arrives knowing no one.</h4>
      <p>Maya signs up with her campus and major. Before her first lab, ByeUni has already introduced her to classmates in Mechanical Engineering and the Robotics Club forum.</p>
      <div className="lp-tl-media"><img src={campus} alt="Students talking together on a campus lawn" /><img src={team} alt="A student team working around a table" /></div>
    </>,
  },
  {
    id: 'oct', title: 'October', caption: 'Week six',
    content: <>
      <h4 className="lp-tl-title">Finds her team.</h4>
      <p>A forum post asking for a build partner gets 32 replies. Three of them become her team, and the group chat never really sleeps.</p>
      <article className="lp-tl-post">
        <header><img src={p1} alt="" /><span><b>Arjun Mehta</b><small>Computer Science · replied in Robotics Club</small></span></header>
        <p>Count me in. I can write the vision code if someone owns the gripper.</p>
        <footer><span><Heart /> 41</span><span><MessageCircle /> 32 replies</span></footer>
      </article>
    </>,
  },
  {
    id: 'nov', title: 'November', caption: 'The parts list',
    content: <>
      <h4 className="lp-tl-title">Gets backed.</h4>
      <p>The parts cost more than a student budget. Her campaign passes 60% in ten days, with family, classmates, and a few alumni chipping in.</p>
      <div className="lp-tl-hero">
        <img src={robotics} alt="Students building a robotics project in a makerspace" />
        <div className="lp-tl-fund"><p><b>$1,250</b><small>of $2,000 for the robotics kit</small></p><Progress value={62} label="Sample campaign, 62% funded" /></div>
      </div>
    </>,
  },
  {
    id: 'feb', title: 'February', caption: 'Competition season',
    content: <>
      <h4 className="lp-tl-title">Shows the work.</h4>
      <p>The build log, the code, and the competition video go on her CVision. One link now does what her résumé never could.</p>
      <div className="lp-tl-media"><img src={portfolio} alt="A student portfolio open on a laptop" /><img src={study} alt="Students studying together in a library" /></div>
    </>,
  },
  {
    id: 'apr', title: 'April', caption: 'The payoff',
    content: <>
      <h4 className="lp-tl-title">Gets noticed.</h4>
      <p>She’s named Student of the Day, sends her CVision link with an application, and the internship offer arrives before finals.</p>
      <div className="lp-tl-hero">
        <img src={future} alt="Students laughing together around their laptops" />
        <span className="lp-tl-badge"><Crown /> Student of the Day · Internship offer</span>
      </div>
    </>,
  },
];

/* ---------------- Platform tiles ---------------- */

function ForumsArt() {
  return <div className="lp-art lp-art-forums">
    {[['Robotics Club', '214 members', p4], ['CS 106B study group', '58 members', p6], ['Sustainable Campus', '1.2k members', p8]].map(([name, meta, src]) => <p key={name}>
      <img src={src} alt="" /><span><b>{name}</b><small>{meta}</small></span><em>Join</em>
    </p>)}
    <span className="lp-art-chat"><img src={p5} alt="" /> Notes from today’s lecture are up!</span>
  </div>;
}

function VibeArt() {
  return <div className="lp-art lp-art-vibe">
    <div className="lp-art-moods">{moods.map((Icon, i) => <span key={i} className={i === 0 ? 'is-on' : undefined}><Icon /></span>)}</div>
    <div className="lp-art-pulse"><i style={{ width: '58%' }} /><i style={{ width: '29%' }} /><i style={{ width: '13%' }} /></div>
    <small>Campus pulse · anonymous</small>
  </div>;
}

function SotdArt() {
  return <div className="lp-art lp-art-sotd">
    <span className="lp-art-ring"><img src={p7} alt="" /><Crown /></span>
    <p><b>Leah Park</b><small>Biology · organized the campus blood drive</small></p>
    <em><Sparkles /> 23 cheers</em>
  </div>;
}

function UpdatesArt() {
  return <div className="lp-art lp-art-updates">
    {[['Oct', '18', 'Career fair', 'Main quad · 10am'], ['Oct', '22', 'Robotics showcase', 'Engineering hall']].map(([month, day, title, place]) => <p key={title}>
      <span><small>{month}</small><b>{day}</b></span><span><b>{title}</b><small>{place}</small></span>
    </p>)}
  </div>;
}

function RewardsArt() {
  return <div className="lp-art lp-art-rewards">
    <span>+1 <small>daily login</small></span>
    <span>+20 <small>forum post</small></span>
    <span>+50 <small>first campaign</small></span>
  </div>;
}

function AppsArt() {
  return <div className="lp-art lp-art-apps">
    <span className="lp-art-phone"><LogoMark /><i /><i /><i /></span>
    <span className="lp-art-phone is-back"><i /><i /><i /></span>
  </div>;
}

function CvArt() {
  return <div className="lp-art lp-art-cv">
    <div className="lp-art-cv-card"><img src={p4} alt="" /><span><b>Jordan Blake</b><small>Business · Product strategy</small></span></div>
    <div className="lp-heat is-wide" aria-hidden="true">{heatYear.map((level, i) => <i key={i} style={{ opacity: 0.12 + level * 0.88 }} />)}</div>
  </div>;
}

/* ---------------- Voices ---------------- */

const voices: MovingCard[][] = [
  [
    { id: 'kevin', name: 'Kevin Tran', title: 'Computer Science', quote: 'Finally deployed my portfolio website and loved all the feedback from this community.', avatar: <img src={p3} alt="" /> },
    { id: 'sara', name: 'Sara Khan', title: 'Exchange semester in Seoul', quote: 'Exploring Seoul during my exchange semester. My campaign covered the flights, and this experience has been incredible.', avatar: <img src={p5} alt="" /> },
    { id: 'rohit', name: 'Rohit Verma', title: 'Environmental Studies', quote: 'Our college team is building a sustainable campus initiative. We found four volunteers in the forum in one afternoon.', avatar: <img src={p6} alt="" /> },
    { id: 'ananya', name: 'Ananya Desai', title: 'Design', quote: 'Super excited to share that my CVision landed me my first design internship offer!', avatar: <img src={p2} alt="" /> },
  ],
  [
    { id: 'arjun', name: 'Arjun Mehta', title: 'Computer Science', quote: 'Just finished my first full-stack project, a study buddy platform for college students. The feedback here is unreal.', avatar: <img src={p1} alt="" /> },
    { id: 'jordan', name: 'Jordan Blake', title: 'Business', quote: 'I wrote up how I prepped for my internship interviews so the next person in my major can use it.', avatar: <img src={p4} alt="" /> },
    { id: 'sam', name: 'Sam Okonkwo', title: 'Biology', quote: 'Halfway through my licensing plan: study hours logged, one practice exam done, and a campaign open for the exam fee.', avatar: <img src={p8} alt="" /> },
    { id: 'priya', name: 'Priya Sharma', title: 'Design', quote: 'Shared my UI case study for a mental wellness app and got thoughtful critiques from three design majors within an hour.', avatar: <img src={p7} alt="" /> },
  ],
];

/* ---------------- For universities ---------------- */

const schoolBenefits: HoverCardItem[] = [
  { id: 'belong', icon: <Users />, title: 'Belonging from week one', description: 'Students connect by campus and major before the first lecture, so nobody spends the semester alone.' },
  { id: 'pulse', icon: <HeartPulse />, title: 'An anonymous campus pulse', description: 'Vibe Check totals show how students are feeling, without ever revealing who said what.' },
  { id: 'updates', icon: <Megaphone />, title: 'Announcements students see', description: 'School updates and events land in the student feed, with one tap to add them to a calendar.' },
  { id: 'career', icon: <BriefcaseBusiness />, title: 'Career readiness, built in', description: 'Every student can keep a CVision of projects and skills that is ready for internships and first jobs.' },
  { id: 'recognition', icon: <Trophy />, title: 'Recognition that motivates', description: 'Student of the Day and Vibeys reward participation and progress, not only grades.' },
  { id: 'scoped', icon: <ShieldCheck />, title: 'A portal scoped to your school', description: 'School admins manage their own students and updates; payouts and platform-wide moderation stay with ByeUni.' },
];

const faqs: [string, string][] = [
  ['What is ByeUni?', 'ByeUni brings student connection, educational fundraising, and a dynamic portfolio together. Find peers, share your journey, and build toward your future.'],
  ['How can I find people on my campus?', 'Explore the ByeUni community to connect with students by campus and major. Forums and private or group chats keep conversations going.'],
  ['What can a campaign support?', 'Campaigns focus on educational goals such as textbooks, equipment, travel, internships, housing, or licensing exams. Visit the campaign list for current campaigns.'],
  ['What makes CVision different from a résumé?', 'CVision is a dynamic, student-owned webpage that brings your experiences, skills, and accomplishments together. It grows as you add new chapters to your student journey.'],
  ['What are Vibeys?', 'Vibeys are ByeUni’s participation rewards. Students earn points by engaging with their community and redeem them for rewards. Points are not cash.'],
  ['How do schools use ByeUni?', 'Colleges use ByeUni to connect students by campus and major, share updates, and support belonging and career readiness. School admins can request a demo from the School Admins page.'],
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
        <Button variant="soft" size="hero" onClick={onWatch}><Play size={14} /> Watch the introduction</Button>
      </div>
    </div>
  </section>;
}

/** The landing page's story, after the hero: why ByeUni exists, the four chapters, one student's year, and where to go next. */
export function LongJourney({ onWatch }: { onWatch: () => void }) {
  return <>
    <section id="why" className="lp-opener" aria-labelledby="lp-why-title">
      <HeroHighlight containerClassName="lp-opener-field" className="site-wrap lp-opener-body">
        <p className="lp-eyebrow">Why ByeUni exists</p>
        <h2 id="lp-why-title">Every fall, students arrive on campus knowing almost <Highlight>no one.</Highlight></h2>
        <TextGenerateEffect
          className="lp-opener-text"
          delay={0.045}
          words="They’re juggling classes, rent, and a résumé that doesn’t show what they can do. The people who would gladly help can’t see what they need. ByeUni gives every student one place to be *found,* *backed,* and *seen.*"
        />
        <ol className="lp-pillars">
          <li><a href="#friends"><span>01</span><Users /><strong>Friends</strong><small>Your campus and major, in one network.</small></a></li>
          <li><a href="#funds"><span>02</span><HandHeart /><strong>Funds</strong><small>Campaigns for the costs college actually asks for.</small></a></li>
          <li><a href="#futures"><span>03</span><FileUser /><strong>Futures</strong><small>A CVision that keeps growing after the semester.</small></a></li>
        </ol>
      </HeroHighlight>
    </section>

    <section className="site-wrap lp-section lp-chapters" aria-labelledby="lp-chapters-title">
      <header className="lp-head">
        <p className="lp-eyebrow">The platform, one chapter at a time</p>
        <h2 id="lp-chapters-title">Follow Maya through the four things college asks of every student.</h2>
      </header>
      <StickyScroll chapters={chapters} />
    </section>

    <CampusFilm onWatch={onWatch} />

    <section className="site-wrap lp-section lp-year" aria-labelledby="lp-year-title">
      <header className="lp-head is-center">
        <p className="lp-eyebrow">A year on ByeUni</p>
        <h2 id="lp-year-title">From the first lonely week to the first offer.</h2>
        <p>Maya is a composite of the students ByeUni is built for. Here is how one year adds up.</p>
      </header>
      <Timeline entries={year} />
    </section>

    <section className="site-wrap lp-section lp-platform" aria-labelledby="lp-platform-title">
      <header className="lp-head">
        <p className="lp-eyebrow">Everything in one place</p>
        <h2 id="lp-platform-title">Everything campus life asks for, in one student network.</h2>
        <p>The pieces that usually live in six different apps, built to work together for students and the schools that support them.</p>
      </header>
      <BentoGrid>
        <BentoGridItem className="is-wide" header={<ForumsArt />} icon={<MessagesSquare />} title="Forums and group chats" description="Clubs, courses, and causes each get a forum, while private and group chats keep the conversation going." />
        <BentoGridItem header={<VibeArt />} icon={<HeartPulse />} title="Vibe Check" description="A 20-second daily check-in. Notes stay private; schools only see anonymous campus totals." />
        <BentoGridItem header={<SotdArt />} icon={<Crown />} title="Student of the Day" description="Every day one student’s work gets the spotlight, and the whole campus can cheer them on." />
        <BentoGridItem header={<UpdatesArt />} icon={<CalendarDays />} title="Events and school updates" description="Announcements from your school and what’s on this week, right in your feed." />
        <BentoGridItem header={<RewardsArt />} icon={<Gift />} title="Vibeys rewards" description="Points for participation that students redeem for rewards. Credit for showing up, not cash." />
        <BentoGridItem header={<AppsArt />} icon={<Smartphone />} title="On iPhone and Android" description="Take campus with you. ByeUni is on the App Store and Google Play." />
        <BentoGridItem className="is-wide" header={<CvArt />} icon={<FileUser />} title="CVision portfolios" description="Themes, layouts, projects, and GitHub and LeetCode activity on a page each student owns." />
      </BentoGrid>
    </section>

    <section className="lp-section lp-voices" aria-labelledby="lp-voices-title">
      <header className="site-wrap lp-head is-center">
        <p className="lp-eyebrow">On campus</p>
        <h2 id="lp-voices-title">The work students are already sharing.</h2>
        <p>Illustrative posts based on how students use ByeUni.</p>
      </header>
      <InfiniteMovingCards items={voices[0] ?? []} speed="slow" />
      <InfiniteMovingCards items={voices[1] ?? []} direction="right" speed="slow" />
    </section>

    <section id="universities" className="lp-section lp-schools" aria-labelledby="lp-schools-title">
      <div className="site-wrap lp-schools-inner">
        <header className="lp-head">
          <p className="lp-eyebrow">For colleges and universities</p>
          <h2 id="lp-schools-title">Stronger connections. Brighter outcomes.</h2>
          <p>ByeUni is a student engagement and success platform for retention, belonging, and career readiness, with a portal that keeps every school focused on its own students.</p>
          <div className="lp-actions">
            <Button variant="ink" size="hero" asChild><Link to="/school">Request a demo <ArrowRight /></Link></Button>
            <Button variant="soft" size="hero" onClick={onWatch}><Play /> Watch the introduction</Button>
          </div>
        </header>
        <HoverEffect items={schoolBenefits} />
      </div>
    </section>

    <section className="site-wrap lp-section lp-faq" aria-labelledby="lp-faq-title">
      <div>
        <p className="lp-eyebrow">Questions, answered</p>
        <h2 id="lp-faq-title">Good questions. <em>A little clarity.</em></h2>
        <Button variant="soft" asChild><Link to="/faqs">More questions <ArrowRight /></Link></Button>
      </div>
      <Accordion type="single" collapsible>
        {faqs.map(([question, answer], i) => <AccordionItem key={question} value={`faq-${i}`}>
          <AccordionTrigger className="faq-trigger">{question}</AccordionTrigger>
          <AccordionContent className="faq-answer">{answer}</AccordionContent>
        </AccordionItem>)}
      </Accordion>
    </section>

    <section className="lp-finale" aria-labelledby="lp-finale-title">
      <LampContainer>
        <motion.h2
          id="lp-finale-title"
          initial={{ opacity: 0.5, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}
        >Your next chapter starts<br />with one connection.</motion.h2>
        <p>Share your journey. Find your people. Keep moving forward.</p>
        <div className="lp-actions">
          <Button variant="ink" size="hero" className="lp-light-btn" asChild><Link to="/register">Join ByeUni <ArrowRight /></Link></Button>
          <Button variant="soft" size="hero" className="lp-ghost-btn" asChild><Link to="/people">Explore the community</Link></Button>
        </div>
      </LampContainer>
    </section>
  </>;
}
