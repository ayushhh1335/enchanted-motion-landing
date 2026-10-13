import code from '@/assets/portfolio.jpg';
import lab from '@/assets/student-project.jpg';
import campus from '@/assets/campus-friends.jpg';
import team from '@/assets/team.jpg';
import laptop from '@/assets/students-laptop.jpg';
import type { Experience, Person } from './dashboard-data';

export const cvSections = ['about', 'now', 'experience', 'projects', 'activity', 'skills', 'education', 'goals', 'writing', 'testimonials', 'campaign', 'contact'] as const;
export type CvSectionId = (typeof cvSections)[number];
export const cvSectionLabels: Record<CvSectionId, string> = {
  about: 'Vision statement',
  now: 'Things I do',
  experience: 'Experience',
  projects: 'Projects',
  activity: 'Coding activity',
  skills: 'Skills',
  education: 'Academic details',
  goals: 'Goals',
  writing: 'Writing',
  testimonials: 'Testimonials',
  campaign: 'Support my campaign',
  contact: 'Contact & socials',
};

export type CvTheme = 'minimal' | 'midnight' | 'campus' | 'editorial' | 'aurora' | 'terminal';
export const cvThemes: { id: CvTheme; label: string; swatch: [string, string, string] }[] = [
  { id: 'minimal', label: 'Minimal', swatch: ['#FFFFFF', '#111111', '#E5E5E5'] },
  { id: 'midnight', label: 'Midnight', swatch: ['#0B0D10', '#F4F4F5', '#1F232A'] },
  { id: 'campus', label: 'Campus', swatch: ['#EAF8F0', '#06291F', '#22D497'] },
  { id: 'editorial', label: 'Editorial', swatch: ['#F5EFE4', '#2A2118', '#D9CBB4'] },
  { id: 'aurora', label: 'Aurora', swatch: ['#120F2B', '#F2EEFF', '#8B5CF6'] },
  { id: 'terminal', label: 'Terminal', swatch: ['#050805', '#B7F7C8', '#1D3B26'] },
];

export type CvFont = 'modern' | 'editorial' | 'technical' | 'classic' | 'rounded';
export const cvFonts: { id: CvFont; label: string; note: string }[] = [
  { id: 'modern', label: 'Modern', note: 'Geist throughout' },
  { id: 'editorial', label: 'Editorial', note: 'Serif headings, sans body' },
  { id: 'technical', label: 'Technical', note: 'Mono headings, sans body' },
  { id: 'classic', label: 'Classic', note: 'Serif throughout' },
  { id: 'rounded', label: 'Rounded', note: 'Friendly rounded sans' },
];

export type CvLayout = 'classic' | 'split' | 'bento';
export const cvLayouts: { id: CvLayout; label: string; note: string }[] = [
  { id: 'classic', label: 'Classic', note: 'One calm column' },
  { id: 'split', label: 'Split', note: 'Sticky intro on the side' },
  { id: 'bento', label: 'Bento', note: 'Sections as a card grid' },
];

export const cvAccents = ['#0F7A56', '#2563EB', '#E11D48', '#F59E0B', '#7C3AED', '#0E7490', '#111111'];

export type CvItem = { id: string; title: string; detail: string; link: string };
export type CvProject = { id: string; title: string; description: string; image: string; link: string; tags: string[] };
export type CvEducation = { id: string; school: string; degree: string; period: string; detail: string };
export type CvWriting = { id: string; title: string; date: string; link: string };
export type CvTestimonial = { id: string; quote: string; name: string; role: string };
export type CvSocialKind = 'github' | 'linkedin' | 'x' | 'instagram' | 'website' | 'email';
export type CvSocial = { id: string; kind: CvSocialKind; url: string };

export type CvContent = {
  status: string;
  openToWork: boolean;
  vision: string;
  photo: string;
  now: CvItem[];
  projects: CvProject[];
  education: CvEducation[];
  writing: CvWriting[];
  testimonials: CvTestimonial[];
  socials: CvSocial[];
  github: string;
  leetcode: string;
  showGithub: boolean;
  showLeetcode: boolean;
};

export type CvState = {
  theme: CvTheme;
  font: CvFont;
  layout: CvLayout;
  accent: string;
  order: CvSectionId[];
  hidden: CvSectionId[];
  content: CvContent;
};

export const seedCv: CvState = {
  theme: 'minimal',
  font: 'modern',
  layout: 'classic',
  accent: '#0F7A56',
  order: ['about', 'now', 'experience', 'projects', 'activity', 'skills', 'education', 'goals', 'writing', 'testimonials', 'campaign', 'contact'],
  hidden: [],
  content: {
    status: 'Open to Summer 2027 SWE internships',
    openToWork: true,
    vision: 'I want to build software that makes the first year of college less lonely. Most students don’t lack talent, they lack the right people at the right time. I’m working on tools that close that gap.',
    photo: '',
    now: [
      { id: 'n1', title: 'Stanford Hackers', detail: 'Web lead. We run TreeHacks registration for 1,500 hackers.', link: 'https://treehacks.com' },
      { id: 'n2', title: 'CS 161 study group', detail: 'Thursdays at 7 in Huang. Bring snacks, leave with dynamic programming.', link: '' },
      { id: 'n3', title: 'Peer mentor', detail: 'Paired with five first-year CS students this quarter.', link: '' },
      { id: 'n4', title: 'HackMIT 2026', detail: 'Our four-person team is building an accessible campus map.', link: 'https://hackmit.org' },
    ],
    projects: [
      { id: 'p1', title: 'Coursework Planner', description: 'Plans four years of Stanford CS courses around prerequisites and quarter offerings. 2,300 students used it during enrollment.', image: 'code', link: 'https://github.com/ethancarter/course-planner', tags: ['React', 'TypeScript', 'Supabase'] },
      { id: 'p2', title: 'Green Quad volunteer app', description: 'Shift sign-ups and reminders for the campus composting garden. Replaced a 14-tab spreadsheet.', image: 'campus', link: '', tags: ['Next.js', 'Twilio'] },
      { id: 'p3', title: 'Low-power sensor dashboard', description: 'Visualizes battery drain across 40 field sensors for the Autonomous Systems Lab.', image: 'lab', link: '', tags: ['Python', 'D3'] },
      { id: 'p4', title: 'TreeHacks check-in', description: 'QR check-in for 1,500 hackers with offline mode for the Packard basement.', image: 'team', link: '', tags: ['React Native', 'Firebase'] },
    ],
    education: [
      { id: 'e1', school: 'Stanford University', degree: 'B.S. Computer Science, HCI track', period: '2023 – 2027', detail: 'Dean’s List · CS 106B section leader · GPA 3.86' },
      { id: 'e2', school: 'Los Gatos High School', degree: 'High school diploma', period: '2019 – 2023', detail: 'Robotics captain · AP Scholar with Distinction' },
    ],
    writing: [
      { id: 'w1', title: 'What I learned shipping to production in week two at Stripe', date: 'Sep 2026', link: '' },
      { id: 'w2', title: 'A first-year’s guide to surviving CS 106B', date: 'Mar 2026', link: '' },
      { id: 'w3', title: 'Why our hackathon team stopped using Jira', date: 'Nov 2025', link: '' },
    ],
    testimonials: [
      { id: 't1', quote: 'Ethan shipped more in ten weeks than most of our full-time hires do in a quarter, and he wrote the docs too.', name: 'Rachel Moore', role: 'Engineering Manager, Stripe' },
      { id: 't2', quote: 'The kind of section leader who stays an extra hour so nobody leaves stuck.', name: 'Prof. Alan Whitfield', role: 'Stanford Computer Science' },
    ],
    socials: [
      { id: 's1', kind: 'github', url: 'https://github.com/ethancarter' },
      { id: 's2', kind: 'linkedin', url: 'https://www.linkedin.com/in/ethancarter' },
      { id: 's3', kind: 'x', url: 'https://x.com/ethancarter' },
      { id: 's4', kind: 'email', url: 'mailto:ethan.carter@stanford.edu' },
    ],
    github: 'ethancarter',
    leetcode: 'ethan_c',
    showGithub: true,
    showLeetcode: true,
  },
};

/** Bundled images are stored by key so a rebuild never leaves stale asset URLs in browser storage. */
const bundled: Record<string, string> = { code, lab, campus, team, laptop };
export const projectImage = (image: string) => bundled[image] ?? (image || laptop);

/* ---------------- Other students' CVision pages (sample data) ---------------- */

export type CvProfile = { headline: string; about: string; skills: string[]; experience: Experience[]; goals: string[] };
export type PublicCvision = { cv: CvState; profile: CvProfile };

type TrackId = 'code' | 'design' | 'build' | 'people';
type Track = {
  theme: CvTheme; font: CvFont; layout: CvLayout; coding: boolean;
  skills: string[];
  projects: Omit<CvProject, 'id' | 'link'>[];
  experience: (school: string) => Omit<Experience, 'id'>[];
  now: (school: string) => Omit<CvItem, 'id' | 'link'>[];
  goal: string;
  vision: string;
  testimonial: Omit<CvTestimonial, 'id'>;
};

const tracks: Record<TrackId, Track> = {
  code: {
    theme: 'midnight', font: 'technical', layout: 'split', coding: true,
    skills: ['Python', 'TypeScript', 'React', 'SQL', 'Algorithms', 'Git'],
    projects: [
      { title: 'Dining hall tracker', description: 'Live menus and wait times for every dining hall, built on scraped menus and a small Postgres API.', image: 'code', tags: ['Next.js', 'Postgres'] },
      { title: 'Study group matcher', description: 'Pairs classmates by course, schedule, and study style. 400 students matched in its first term.', image: 'team', tags: ['React', 'Firebase'] },
      { title: 'Course review explorer', description: 'Turns years of course evaluations into searchable charts for picking classes.', image: 'laptop', tags: ['Python', 'D3'] },
    ],
    experience: school => [
      { role: 'Software Engineering Intern', org: 'Northwind Labs', period: 'Summer 2026', detail: 'Shipped a billing dashboard used by the support team every day.' },
      { role: 'Teaching Assistant, Intro to Programming', org: school, period: '2025 – Present', detail: 'Run a weekly section and hold office hours for 30 students.' },
    ],
    now: school => [
      { title: 'Hackathon team', detail: 'Building something new every other weekend.' },
      { title: 'Competitive programming club', detail: `Weekly contests with the ${school} team.` },
    ],
    goal: 'Land a software engineering internship for next summer',
    vision: 'I like building small tools that save people time. Most of my projects start as a fix for something annoying on campus.',
    testimonial: { quote: 'Writes the clearest pull requests on the team and always leaves the code better than they found it.', name: 'Priya Raman', role: 'Engineering Manager, Northwind Labs' },
  },
  design: {
    theme: 'editorial', font: 'editorial', layout: 'bento', coding: false,
    skills: ['Figma', 'User research', 'Prototyping', 'Storyboarding', 'Adobe Creative Cloud', 'Illustration'],
    projects: [
      { title: 'Wayfinding for first-years', description: 'Redesigned campus signage after shadowing 20 new students during their first week.', image: 'campus', tags: ['Research', 'Figma'] },
      { title: 'Library booking app', description: 'Took study-room booking from nine taps to three. Now in pilot with the main library.', image: 'laptop', tags: ['Prototyping', 'Usability tests'] },
      { title: 'Student stories series', description: 'A short film and photo series about students who work their way through school.', image: 'team', tags: ['Storytelling', 'Premiere Pro'] },
    ],
    experience: school => [
      { role: 'Design Intern', org: 'Studio Meridian', period: 'Summer 2026', detail: 'Designed onboarding flows for a health app with 200k users.' },
      { role: 'Creative Lead', org: `${school} Design Collective`, period: '2025 – Present', detail: 'Run critiques and portfolio reviews for 40 members.' },
    ],
    now: school => [
      { title: 'Design Collective', detail: `Weekly critiques and portfolio nights at ${school}.` },
      { title: 'Freelance projects', detail: 'Branding for student-run businesses on campus.' },
    ],
    goal: 'Ship a design that thousands of students use every day',
    vision: 'Good design is mostly listening. I start with the people who struggle most with a thing and design for them first.',
    testimonial: { quote: 'Brings a level of care to research that makes the whole team’s work better.', name: 'Dana Ortiz', role: 'Design Director, Studio Meridian' },
  },
  build: {
    theme: 'campus', font: 'modern', layout: 'classic', coding: true,
    skills: ['SolidWorks', 'MATLAB', 'CAD', 'Prototyping', 'Arduino', 'Project management'],
    projects: [
      { title: 'Competition robot drivetrain', description: 'Designed a swerve drivetrain that cut our cycle time by 30% at regionals.', image: 'lab', tags: ['SolidWorks', 'CNC'] },
      { title: 'Low-cost water sensor', description: 'A $40 sensor that logs water quality for community gardens.', image: 'campus', tags: ['Arduino', 'C++'] },
      { title: 'Makerspace tool tracker', description: 'RFID check-out for 200 shared tools. Lost tools dropped to almost zero.', image: 'team', tags: ['RFID', 'Python'] },
    ],
    experience: school => [
      { role: 'Mechanical Engineering Intern', org: 'Atlas Robotics', period: 'Summer 2026', detail: 'Designed fixtures for an assembly line and cut setup time in half.' },
      { role: 'Robotics Team Lead', org: school, period: '2025 – Present', detail: 'Lead a 25-person team through build season.' },
    ],
    now: school => [
      { title: 'Robotics team', detail: `Build season at ${school} runs January to April.` },
      { title: 'Makerspace mentor', detail: 'Teaching laser cutter and 3D printer basics.' },
    ],
    goal: 'Take our team to the world championship',
    vision: 'I learn by building. Every project I take on ends with something you can hold, test, and break.',
    testimonial: { quote: 'The person everyone goes to when a prototype won’t cooperate at 2 a.m.', name: 'Prof. Helen Ward', role: 'Mechanical Engineering' },
  },
  people: {
    theme: 'minimal', font: 'classic', layout: 'classic', coding: false,
    skills: ['Research', 'Public speaking', 'Writing', 'Data analysis', 'Event planning', 'Leadership'],
    projects: [
      { title: 'First-gen mentorship circle', description: 'Matched 60 first-generation students with upper-year mentors for their first term.', image: 'campus', tags: ['Community', 'Program design'] },
      { title: 'Student wellbeing survey', description: 'Designed and analyzed a 1,200-response survey that shaped new counseling hours.', image: 'laptop', tags: ['Research', 'SPSS'] },
      { title: 'Voter registration drive', description: 'Registered 800 students in three weeks with a team of 15 volunteers.', image: 'team', tags: ['Organizing', 'Outreach'] },
    ],
    experience: school => [
      { role: 'Research Assistant', org: `${school} Social Science Lab`, period: '2025 – Present', detail: 'Run study sessions and clean survey data for two faculty projects.' },
      { role: 'Policy Intern', org: 'City Council Office', period: 'Summer 2026', detail: 'Wrote briefings on student housing and transit.' },
    ],
    now: school => [
      { title: 'Peer mentor', detail: `Supporting first-year students at ${school}.` },
      { title: 'Debate society', detail: 'Weekly practice rounds and regional tournaments.' },
    ],
    goal: 'Publish my first research paper before graduation',
    vision: 'I care about the people side of every problem: who it affects, who gets left out, and who should be in the room.',
    testimonial: { quote: 'Thoughtful, organized, and the first to volunteer when something needs doing.', name: 'Dr. Laura Chen', role: 'Faculty Advisor' },
  },
};

const trackFor = (major: string): TrackId => {
  if (/computer|data|electrical/i.test(major)) return 'code';
  if (/design|film|art/i.test(major)) return 'design';
  if (/mechanical|engineering/i.test(major)) return 'build';
  return 'people';
};

/** Hand-written intros for the featured classmates; everyone else gets their major's defaults. */
const featured: Record<string, Partial<Pick<CvProfile, 'headline' | 'about'>> & { status?: string; openToWork?: boolean; vision?: string }> = {
  marcus: { headline: 'Mechanical Engineering @ UT Austin · Robotics team lead', status: 'Headed to the FIRST Championship in Houston', vision: 'Our robotics team qualified for worlds with a robot we built in a garage. I want to make that kind of hands-on engineering possible for every student.' },
  chloe: { headline: 'Product Design @ Stanford · Making campus tools feel human', status: 'Open to Summer 2027 design internships', openToWork: true },
  hannah: { headline: 'Data Science @ Stanford · Turning messy data into decisions', status: 'Open to new-grad data science roles', openToWork: true },
  mia: { headline: 'Psychology @ UCLA · Pre-med, first in my family', status: 'Studying for the MCAT', vision: 'I want to be the doctor I needed growing up: someone who explains things clearly and treats patients like people.' },
  emma: { headline: 'Film & Television @ NYU · Documentary maker', status: 'On exchange in Seoul this semester', vision: 'I make short documentaries about food, family, and the people who keep neighborhoods running.' },
  sofia: { headline: 'Career Advisor · Stanford Career Education', status: 'Office hours Tuesdays and Thursdays', about: 'I help students find internships, prepare for interviews, and figure out what they actually want to do next.' },
};

const gradYear = (year: string) => Number(year.match(/'(\d{2})/)?.[1] ?? 0);

export function cvisionFor(person: Person): PublicCvision {
  const track = tracks[trackFor(person.major)];
  const extra = featured[person.id] ?? {};
  const first = person.name.replace(/^(Dr|Prof)\.?\s+/, '').split(' ')[0] ?? person.name;
  const grad = gradYear(person.year);
  const accent = cvAccents[[...person.id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % (cvAccents.length - 1)] ?? cvAccents[0]!;
  const id = (prefix: string, i: number) => `${person.id}-${prefix}${i}`;
  const socials: CvSocial[] = [
    { id: id('s', 1), kind: 'linkedin', url: `https://www.linkedin.com/in/${person.handle}` },
    track.coding
      ? { id: id('s', 2), kind: 'github', url: `https://github.com/${person.handle}` }
      : { id: id('s', 2), kind: 'instagram', url: `https://www.instagram.com/${person.handle}` },
  ];

  return {
    profile: {
      headline: extra.headline ?? `${person.major} @ ${person.school}`,
      about: extra.about ?? `${first} is studying ${person.major} at ${person.school}. ${track.vision}`,
      skills: track.skills,
      experience: track.experience(person.school).map((item, i) => ({ ...item, id: id('x', i) })),
      goals: [track.goal],
    },
    cv: {
      theme: track.theme,
      font: track.font,
      layout: track.layout,
      accent,
      order: [...cvSections],
      hidden: [],
      content: {
        status: extra.status ?? (grad ? `Class of 20${grad}` : ''),
        openToWork: extra.openToWork ?? false,
        vision: extra.vision ?? track.vision,
        photo: person.photo,
        now: track.now(person.school).map((item, i) => ({ ...item, id: id('n', i), link: '' })),
        projects: track.projects.map((item, i) => ({ ...item, id: id('p', i), link: '' })),
        education: [{ id: id('e', 0), school: person.school, degree: person.major, period: grad ? `20${grad - 4} – 20${grad}` : '', detail: '' }],
        writing: [],
        testimonials: [{ ...track.testimonial, id: id('t', 0) }],
        socials,
        github: track.coding ? person.handle : '',
        leetcode: trackFor(person.major) === 'code' ? person.handle : '',
        showGithub: track.coding,
        showLeetcode: trackFor(person.major) === 'code',
      },
    },
  };
}
