import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';
import { ArrowUpRight, Users, Heart, Sparkles, Check, BookOpen, Laptop, Plane, GraduationCap, Home, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import project from '@/assets/student-project.jpg';
import future from '@/assets/student-future.jpg';

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .1 }} transition={{ duration: .6 }}>{children}</motion.div>;
}

export function LongJourney({ links }: { links: { register: string; people: string; funds: string } }) {
  return <>
    <section className="site-wrap journey-section" aria-labelledby="journey-title">
      <Reveal className="journey-intro"><div className="eyebrow">SMALL STEPS. BIG POSSIBILITIES.</div><h2 className="section-title" id="journey-title">Your journey doesn’t need<br />a perfect starting point.</h2><p>A new campus. A fresh idea. A goal that feels just out of reach. Start where you are, and make your next move with people beside you.</p></Reveal>
      <div className="journey-steps">{[
        { icon: Users, title: 'Show up as yourself.', text: 'Bring your interests, your major, and your curiosity. Your profile is the beginning of a connection—not a test you need to pass.' },
        { icon: Heart, title: 'Find a little support.', text: 'Meet peers, share the questions on your mind, and put your ambitions out there. You don’t have to have every answer.' },
        { icon: Sparkles, title: 'Keep becoming.', text: 'Collect the projects, experiences, and milestones that make your journey yours. Give your future self something to build on.' },
      ].map((step, i) => <Reveal className="journey-step" key={step.title}><div className="journey-number">0{i + 1}</div><step.icon size={28} /><h3>{step.title}</h3><p>{step.text}</p></Reveal>)}</div>
    </section>
    <section className="chapter-band"><div className="site-wrap journey-section chapter-grid">
      <Reveal className="chapter-photo"><figure><img src={project} width={1536} height={1024} loading="lazy" alt="Students collaborating on a creative project in a campus makerspace" /><figcaption><span>GOOD IDEAS GROW TOGETHER</span><span>01 / CONNECTION</span></figcaption></figure></Reveal>
      <Reveal className="chapter-copy"><div className="eyebrow">FROM CLASSMATES TO COLLABORATORS</div><h2>Someone out there<br />gets your big idea.</h2><p>The study partner who makes a difficult class click. The creative who shares your vision. The friend who reminds you that you belong. Your campus is full of connections worth making.</p><ul><li><Check /> Find peers who share your campus or major</li><li><Check /> Take a conversation beyond the classroom</li><li><Check /> Share perspectives, questions, and small wins</li></ul><Button variant="ink" size="hero" asChild><a href={links.people}>Make a connection <ArrowUpRight /></a></Button><div className="chapter-caption">A shared interest can be the start of something bigger.</div></Reveal>
    </div></section>
    <section className="site-wrap journey-section semester-grid">
      <Reveal className="semester-heading"><div className="eyebrow">EVERY CHAPTER COUNTS</div><h2 className="section-title">Not just your<br />first semester.<br />Your whole story.</h2><p>College changes. You change with it. Make space for the people, goals, and experiences that matter in each chapter.</p><Button variant="editorial" asChild className="mt-7"><a href={links.register}>Start your story <ArrowUpRight /></a></Button></Reveal>
      <div className="semester-list">{[
        ['THE FIRST HELLO', 'A new place. A familiar feeling.', 'Finding your feet can take time. Connect with students on your campus, ask a question, and make that first unfamiliar day a little less unfamiliar.'],
        ['THE EVERYDAY MOMENTUM', 'Small wins add up.', 'A useful conversation. A project you’re proud of. A goal with a little support behind it. Give the everyday moments a place in your story.'],
        ['THE BIGGER AMBITION', 'Make room for your next leap.', 'Maybe it’s an internship, an exam, or an idea you want to bring to life. Share what you’re working toward and explore support through a campaign.'],
        ['THE NEXT CHAPTER', 'Take your experiences with you.', 'Your degree is part of the picture—not the whole picture. Bring your skills, projects, and accomplishments together with Cvision.'],
      ].map(([label, title, text]) => <Reveal className="semester-item" key={title}><div className="eyebrow">{label}</div><h3>{title}</h3><p>{text}</p></Reveal>)}</div>
    </section>
    <section className="chapter-band"><div className="site-wrap journey-section">
      <Reveal className="journey-intro"><div className="eyebrow">PUT A LITTLE SUPPORT BEHIND IT</div><h2 className="section-title">Big dreams come<br />in all shapes.</h2><p>Educational goals are personal. Explore campaigns, or share a goal of your own with the people who want to see you move forward.</p></Reveal>
      <div className="ambition-grid">{[
        { icon: BookOpen, title: 'The essentials.', text: 'Textbooks, course materials, and the tools that help you keep learning.' },
        { icon: Laptop, title: 'The right equipment.', text: 'A laptop, creative tools, or equipment for the work you’re ready to do.' },
        { icon: Plane, title: 'A wider perspective.', text: 'Travel and experiences that bring your education beyond the classroom.' },
        { icon: GraduationCap, title: 'The next qualification.', text: 'Licensing exams and the milestones between learning and your career.' },
        { icon: Home, title: 'A steadier foundation.', text: 'Housing needs and practical support for your educational journey.' },
        { icon: Lightbulb, title: 'Your own big idea.', text: 'A personal educational ambition with a story worth sharing.' },
      ].map(item => <Reveal key={item.title}><article className="ambition-item"><item.icon size={28} /><h3>{item.title}</h3><p>{item.text}</p></article></Reveal>)}</div>
      <Reveal className="mt-10"><Button variant="ink" size="hero" asChild><a href={links.funds}>Explore student campaigns <ArrowUpRight /></a></Button></Reveal>
    </div></section>
    <section className="site-wrap journey-section chapter-grid reverse">
      <Reveal className="chapter-photo"><figure><img src={future} width={1536} height={1024} loading="lazy" alt="A student sharing her creative portfolio with peers in a university library" /><figcaption><span>MORE THAN A LINE ON A RÉSUMÉ</span><span>02 / YOUR FUTURE</span></figcaption></figure></Reveal>
      <Reveal className="chapter-copy"><div className="eyebrow">MEET CVISION</div><h2>You’re more than<br />your major.</h2><p>You’re the project you stayed up to finish. The skill you taught yourself. The experience that changed your perspective. Cvision brings those pieces together in a living, student-owned webpage.</p><ul><li><Check /> Bring your skills and accomplishments together</li><li><Check /> Make space for your projects and experiences</li><li><Check /> Keep your story growing as you do</li></ul><Button variant="ink" size="hero" asChild><a href={links.register}>Start your Cvision <ArrowUpRight /></a></Button><div className="chapter-caption">Your story deserves more than a single page of bullet points.</div></Reveal>
    </section>
    <section className="possibility-band"><Reveal className="site-wrap"><div className="eyebrow">YOUR VIBE. YOUR TRIBE. YOUR NEXT CHAPTER.</div><h2>Less figuring it out alone.<br />More moving forward<br />together.</h2><p>There’s no single way to do college. Find the people and possibilities that make your experience feel like yours.</p><Button variant="ink" size="hero" asChild><a href={links.register}>Find your place <ArrowUpRight /></a></Button></Reveal></section>
    <section className="site-wrap journey-section faq-grid">
      <Reveal><div className="eyebrow">A FEW THINGS YOU MIGHT BE WONDERING</div><h2 className="section-title">Good questions.<br />A little clarity.</h2><Button variant="editorial" asChild><a href="https://byeuni.com/byeuni-faqs/">More questions? <ArrowUpRight /></a></Button></Reveal>
      <Reveal><Accordion type="single" collapsible>{[
        ['What is ByeUni?', 'ByeUni brings student connection, educational fundraising, and a dynamic portfolio together. Find peers, share your journey, and build toward your future.'],
        ['How can I find people on my campus?', 'Explore the ByeUni community to connect with students by campus and major. Forums and private or group chats offer ways to keep conversations going.'],
        ['What can a campaign support?', 'Campaigns can focus on educational goals such as textbooks, equipment, travel, internships, housing, or licensing exams. Visit the campaign pages for current campaigns and platform details.'],
        ['What makes Cvision different from a résumé?', 'Cvision is a dynamic, student-owned webpage that brings your experiences, skills, and accomplishments together. It can grow as you add new chapters to your student journey.'],
        ['What are Vibeys?', 'Vibeys are ByeUni’s participation rewards. Students can earn points by engaging with their community and redeem them for rewards. See ByeUni for current reward details.'],
        ['Where do I create an account?', 'Use any Get started button to open ByeUni’s account registration page. If you already have an account, use Log in to return to the platform.'],
      ].map(([question, answer], i) => <AccordionItem key={question} value={`faq-${i}`}><AccordionTrigger className="faq-trigger">{question}</AccordionTrigger><AccordionContent className="faq-answer">{answer}</AccordionContent></AccordionItem>)}</Accordion></Reveal>
    </section>
  </>;
}