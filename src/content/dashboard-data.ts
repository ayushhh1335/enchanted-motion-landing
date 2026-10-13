import p1 from '@/assets/portrait-1.jpg';
import p2 from '@/assets/portrait-2.jpg';
import p3 from '@/assets/portrait-3.jpg';
import p4 from '@/assets/portrait-4.jpg';
import p5 from '@/assets/portrait-5.jpg';
import p6 from '@/assets/portrait-6.jpg';
import p7 from '@/assets/portrait-7.jpg';
import p8 from '@/assets/portrait-8.jpg';
import advisor from '@/assets/offer.jpg';
import campus from '@/assets/campus-friends.jpg';
import laptop from '@/assets/students-laptop.jpg';
import lab from '@/assets/student-project.jpg';
import studyHub from '@/assets/study-hub.jpg';
import code from '@/assets/portfolio.jpg';
import seoul from '@/assets/seoul.jpg';
import team from '@/assets/team.jpg';
import future from '@/assets/student-future.jpg';

export type Person = {
  id: string;
  name: string;
  handle: string;
  photo: string;
  school: string;
  major: string;
  year: string;
  city: string;
  mutual: number;
  verified?: boolean;
  online?: boolean;
};

export type Story = { id: string; personId: string; image: string; caption?: string; at: number };
export type Comment = { id: string; authorId: string; text: string; at: number };
export type PostKind = 'Update' | 'Photo' | 'Project' | 'Achievement' | 'Fundraiser';
export type Audience = 'Public' | 'Campus' | 'Connections';
export type Post = {
  id: string;
  authorId: string;
  at: number;
  audience: Audience;
  kind: PostKind;
  text: string;
  images: string[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
  reposts: number;
};
export type Campaign = {
  id: string;
  ownerId: string;
  title: string;
  category: string;
  image: string;
  raised: number;
  goal: number;
  donors: number;
  daysLeft: number;
  story: string;
};
export type CampusEvent = { id: string; date: string; title: string; place: string; time: string; going: number; online?: boolean };
export type Community = { id: string; name: string; image: string; members: number; category: string; description: string; posts: number };
export type ChatMessage = { id: string; from: 'me' | 'them'; text: string; at: number };
export type Chat = { id: string; personId: string; unread: number; messages: ChatMessage[] };
export type NotificationKind = 'like' | 'comment' | 'request' | 'accepted' | 'forum' | 'donation' | 'vibeys';
export type Notice = { id: string; personId?: string; kind: NotificationKind; text: string; at: number };
export type SchoolUpdate = { id: string; title: string; body: string; at: number };
export type VibeyRule = { id: string; label: string; detail: string; points: number };
export type Reward = { id: string; name: string; cost: number; detail: string };
export type Experience = { id: string; role: string; org: string; period: string; detail: string };

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
/** Seed timestamps are offsets from the moment the dashboard loads. */
export const ago = (ms: number) => Date.now() - ms;

export const ME_ID = 'me';

export const me: Person = {
  id: ME_ID,
  name: 'Ethan Carter',
  handle: 'ethancarter',
  photo: p1,
  school: 'Stanford University',
  major: 'B.S. Computer Science',
  year: "Class of '27",
  city: 'Palo Alto, CA',
  mutual: 0,
  verified: true,
};

export const people: Person[] = [
  me,
  { id: 'mia', name: 'Mia Thompson', handle: 'miathompson', photo: p2, school: 'UCLA', major: 'Psychology', year: "Class of '26", city: 'Los Angeles, CA', mutual: 14, online: true },
  { id: 'marcus', name: 'Marcus Reyes', handle: 'marcusbuilds', photo: p3, school: 'UT Austin', major: 'Mechanical Engineering', year: "Class of '27", city: 'Austin, TX', mutual: 9, verified: true },
  { id: 'chloe', name: 'Chloe Sullivan', handle: 'chloesull', photo: p4, school: 'Stanford University', major: 'Product Design', year: "Class of '27", city: 'Palo Alto, CA', mutual: 31, online: true },
  { id: 'emma', name: 'Emma Wilson', handle: 'emmaonfilm', photo: p5, school: 'NYU', major: 'Film & Television', year: "Class of '26", city: 'New York, NY', mutual: 6 },
  { id: 'lucas', name: 'Lucas Bennett', handle: 'lucasb', photo: p6, school: 'University of Michigan', major: 'Business Administration', year: "Class of '28", city: 'Ann Arbor, MI', mutual: 4, online: true },
  { id: 'hannah', name: 'Hannah Kim', handle: 'hannahkim', photo: p7, school: 'Stanford University', major: 'Data Science', year: "Class of '26", city: 'Palo Alto, CA', mutual: 22, verified: true },
  { id: 'amara', name: 'Amara Johnson', handle: 'amaraj', photo: p8, school: 'Howard University', major: 'Political Science', year: "Class of '27", city: 'Washington, DC', mutual: 3 },
  { id: 'sofia', name: 'Dr. Sofia Martinez', handle: 'stanfordcareers', photo: advisor, school: 'Stanford Career Education', major: 'Career Advisor', year: 'Staff', city: 'Palo Alto, CA', mutual: 48, verified: true },
];

export const personById = (id: string) => people.find(person => person.id === id) ?? me;

/** Connection state the demo account starts with. */
export const seedConnections: Record<string, 'connected' | 'incoming' | 'none'> = {
  chloe: 'connected',
  hannah: 'connected',
  sofia: 'connected',
  marcus: 'connected',
  mia: 'incoming',
  amara: 'incoming',
  emma: 'none',
  lucas: 'none',
};

export const seedStories: Story[] = [
  { id: 's-chloe', personId: 'chloe', image: campus, caption: 'Green Quad volunteers 🌱', at: ago(2 * HOUR) },
  { id: 's-marcus', personId: 'marcus', image: lab, caption: 'Late night in the robotics lab', at: ago(4 * HOUR) },
  { id: 's-emma', personId: 'emma', image: seoul, caption: 'Seoul at golden hour', at: ago(5 * HOUR) },
  { id: 's-hannah', personId: 'hannah', image: code, caption: 'Model finally converged 🎉', at: ago(7 * HOUR) },
  { id: 's-mia', personId: 'mia', image: studyHub, caption: 'Powell Library szn', at: ago(9 * HOUR) },
  { id: 's-lucas', personId: 'lucas', image: team, caption: 'Team retreat at Lake Michigan', at: ago(11 * HOUR) },
  { id: 's-amara', personId: 'amara', image: future, caption: 'Capitol Hill internship, week 3', at: ago(14 * HOUR) },
  { id: 's-sofia', personId: 'sofia', image: laptop, caption: 'Resume reviews open all week', at: ago(16 * HOUR) },
];

export const seedPosts: Post[] = [
  {
    id: 'post-green-quad',
    authorId: 'chloe',
    at: ago(2 * HOUR),
    audience: 'Public',
    kind: 'Project',
    text: 'Proud to share that our student team just launched Green Quad, a campus composting initiative! 🌱\nWe turned an empty lot behind Lagunita into a community garden and had 60+ students show up for the first build day. Grateful to everyone who pitched in.',
    images: [campus, team, studyHub],
    likes: 126,
    likedBy: ['hannah', 'marcus'],
    comments: [
      { id: 'c1', authorId: 'hannah', text: 'This is amazing! Count me in for the next build day.', at: ago(HOUR) },
      { id: 'c2', authorId: 'sofia', text: 'Love seeing this. Add it to your CVision projects!', at: ago(40 * MIN) },
    ],
    reposts: 8,
  },
  {
    id: 'post-research',
    authorId: 'hannah',
    at: ago(5 * HOUR),
    audience: 'Campus',
    kind: 'Achievement',
    text: 'Wrapped up a 10-week research sprint at the Stanford Autonomous Systems Lab. Our paper on low-power sensor fusion was accepted to the undergrad track at NeurIPS! 🎉',
    images: [lab],
    likes: 342,
    likedBy: ['chloe'],
    comments: [{ id: 'c3', authorId: 'marcus', text: 'Huge congrats Hannah 👏', at: ago(3 * HOUR) }],
    reposts: 21,
  },
  {
    id: 'post-seoul',
    authorId: 'emma',
    at: ago(9 * HOUR),
    audience: 'Public',
    kind: 'Photo',
    text: 'Week six of my exchange semester in Seoul. Shooting a short documentary on street food vendors in Gwangjang Market. Every day feels like a new chapter.',
    images: [seoul],
    likes: 214,
    likedBy: [],
    comments: [],
    reposts: 5,
  },
  {
    id: 'post-app',
    authorId: 'marcus',
    at: ago(DAY),
    audience: 'Public',
    kind: 'Project',
    text: 'Shipped my first full-stack app: a parts tracker for the UT Robotics team. React, Supabase, and a lot of coffee. Feedback welcome!',
    images: [code, laptop],
    likes: 95,
    likedBy: [],
    comments: [{ id: 'c4', authorId: 'lucas', text: 'Clean UI. Is it open source?', at: ago(20 * HOUR) }],
    reposts: 3,
  },
  {
    id: 'post-fair',
    authorId: 'sofia',
    at: ago(DAY + 4 * HOUR),
    audience: 'Campus',
    kind: 'Update',
    text: 'The Fall Career & Internship Fair is next Saturday at Tresidder Union. 120+ employers, including Google, Nvidia, and the Gates Foundation. Bring your CVision link and drop by for a free headshot.',
    images: [],
    likes: 61,
    likedBy: [],
    comments: [],
    reposts: 12,
  },
  {
    id: 'post-me-hackmit',
    authorId: ME_ID,
    at: ago(3 * DAY),
    audience: 'Public',
    kind: 'Achievement',
    text: 'We got into HackMIT 2026! 🚀 Four of us from Stanford Hackers are flying to Boston next month. If you want to help us get there, the campaign link is on my profile.',
    images: [code],
    likes: 188,
    likedBy: ['chloe', 'hannah'],
    comments: [{ id: 'c5', authorId: 'chloe', text: 'LET\'S GO 🎉', at: ago(3 * DAY - HOUR) }],
    reposts: 14,
  },
  {
    id: 'post-me-study',
    authorId: ME_ID,
    at: ago(6 * DAY),
    audience: 'Campus',
    kind: 'Photo',
    text: 'CS 161 study group is back. Thursdays, 7 PM, Huang basement. Bring snacks, leave with dynamic programming.',
    images: [studyHub, laptop],
    likes: 74,
    likedBy: ['hannah'],
    comments: [],
    reposts: 2,
  },
  {
    id: 'post-me-stripe',
    authorId: ME_ID,
    at: ago(21 * DAY),
    audience: 'Public',
    kind: 'Update',
    text: 'Wrapped my summer as a software engineering intern at Stripe. Grateful for a team that let an intern ship to production in week two.',
    images: [team],
    likes: 256,
    likedBy: ['sofia', 'marcus'],
    comments: [],
    reposts: 9,
  },
];

export const seedCampaigns: Campaign[] = [
  { id: 'camp-robotics', ownerId: 'marcus', title: 'Get our team to the FIRST Robotics Championship in Houston', category: 'Travel', image: lab, raised: 3240, goal: 5000, donors: 58, daysLeft: 12, story: 'Our UT Austin team qualified for the world championship. Your support covers flights, hotel rooms, and shipping the robot.' },
  { id: 'camp-laptop', ownerId: 'amara', title: 'A laptop for my Political Science thesis', category: 'Equipment', image: laptop, raised: 820, goal: 1400, donors: 23, daysLeft: 20, story: 'My eight-year-old laptop died mid-semester. A new one keeps my thesis research and internship work on track.' },
  { id: 'camp-seoul', ownerId: 'emma', title: 'Study abroad in Seoul: housing and travel', category: 'Study abroad', image: seoul, raised: 4100, goal: 6500, donors: 74, daysLeft: 30, story: 'Help me finish my exchange semester at Yonsei and complete my documentary on Korean street food culture.' },
  { id: 'camp-mcat', ownerId: 'mia', title: 'MCAT prep books and exam fee', category: 'Exams', image: studyHub, raised: 260, goal: 600, donors: 9, daysLeft: 18, story: "I'm the first in my family applying to med school. This covers the full prep set and the exam registration." },
];

export const seedMyCampaign: Campaign = {
  id: 'camp-hackmit', ownerId: ME_ID, title: 'Fund my trip to HackMIT 2026', category: 'Travel', image: code, raised: 1150, goal: 2000, donors: 31, daysLeft: 9,
  story: 'Our four-person team was accepted to HackMIT. This covers flights from SFO to Boston and two nights of lodging.',
};

export const seedEvents: CampusEvent[] = [
  { id: 'ev-fair', date: '2026-10-18', title: 'Fall Career & Internship Fair', place: 'Tresidder Union, Stanford', time: '10:00 AM – 4:00 PM', going: 412 },
  { id: 'ev-green', date: '2026-10-22', title: 'Campus Sustainability Workshop', place: 'Online · Zoom', time: '4:00 – 5:30 PM PT', going: 120, online: true },
  { id: 'ev-hack', date: '2026-10-29', title: 'Hack Night: Build with AI', place: 'Gates Computer Science Building', time: '6:00 – 11:00 PM', going: 86 },
  { id: 'ev-firstgen', date: '2026-11-04', title: 'First-Gen Students Mixer', place: 'Old Union Courtyard', time: '5:00 – 7:00 PM', going: 64 },
];

export const seedCommunities: Community[] = [
  { id: 'cs-majors', name: 'Stanford CS Majors', image: code, members: 2840, category: 'Major', description: 'Course tips, internship leads, and late-night debugging help for Stanford CS students.', posts: 18 },
  { id: 'women-stem', name: 'Women in STEM', image: lab, members: 5120, category: 'Network', description: 'Mentorship, scholarships, and research openings for women in science and engineering.', posts: 9 },
  { id: 'bay-founders', name: 'Bay Area Student Founders', image: laptop, members: 1310, category: 'Startups', description: 'Pitch practice, co-founder matching, and demo nights across Bay Area campuses.', posts: 6 },
  { id: 'study-abroad', name: 'Study Abroad Network', image: seoul, members: 3770, category: 'Travel', description: 'Visas, housing, scholarships, and stories from students studying overseas.', posts: 12 },
  { id: 'green-campus', name: 'Campus Sustainability', image: campus, members: 960, category: 'Causes', description: 'Plan green projects, share wins, and find volunteers on your campus.', posts: 4 },
  { id: 'first-gen', name: 'First-Gen Collective', image: team, members: 2205, category: 'Community', description: 'A home for first-generation college students and the people who back them.', posts: 15 },
];

export const seedJoined = ['cs-majors', 'green-campus'];

export const seedChats: Chat[] = [
  { id: 'chat-chloe', personId: 'chloe', unread: 2, messages: [
    { id: 'm1', from: 'them', text: 'Hey! Are you coming to the Green Quad build day Saturday?', at: ago(3 * HOUR) },
    { id: 'm2', from: 'me', text: "Wouldn't miss it. Need me to bring anything?", at: ago(2 * HOUR + 50 * MIN) },
    { id: 'm3', from: 'them', text: 'Gloves and a playlist 😄', at: ago(25 * MIN) },
    { id: 'm4', from: 'them', text: 'Also, can you help with the volunteer sign-up page?', at: ago(24 * MIN) },
  ] },
  { id: 'chat-marcus', personId: 'marcus', unread: 1, messages: [
    { id: 'm5', from: 'them', text: 'Thanks for sharing our Houston campaign, man. We just passed 60%!', at: ago(5 * HOUR) },
  ] },
  { id: 'chat-hannah', personId: 'hannah', unread: 0, messages: [
    { id: 'm6', from: 'me', text: 'Congrats on NeurIPS!! Drinks on me after midterms.', at: ago(DAY) },
    { id: 'm7', from: 'them', text: 'Haha deal. Coupa Café on Friday?', at: ago(DAY - HOUR) },
  ] },
  { id: 'chat-sofia', personId: 'sofia', unread: 0, messages: [
    { id: 'm8', from: 'them', text: 'Hi Ethan, your resume review is booked for Thursday at 2 PM.', at: ago(2 * DAY) },
    { id: 'm9', from: 'me', text: 'Perfect, thank you!', at: ago(2 * DAY - HOUR) },
  ] },
];

export const autoReplies = [
  'Sounds good! 🙌',
  'Haha, totally. Talk soon!',
  "Let me check and get back to you.",
  'Love that idea.',
  'See you there!',
];

export const seedNotices: Notice[] = [
  { id: 'n1', personId: 'chloe', kind: 'like', text: 'liked your post about HackMIT.', at: ago(20 * MIN) },
  { id: 'n2', personId: 'mia', kind: 'request', text: 'sent you a connection request.', at: ago(HOUR) },
  { id: 'n3', personId: 'hannah', kind: 'comment', text: 'commented: "Let\'s pair on the hackathon!"', at: ago(3 * HOUR) },
  { id: 'n4', personId: 'lucas', kind: 'donation', text: 'donated $25 to Fund my trip to HackMIT 2026.', at: ago(6 * HOUR) },
  { id: 'n5', kind: 'vibeys', text: 'You earned 15 Vibeys for a 3-day login streak.', at: ago(DAY) },
  { id: 'n6', personId: 'sofia', kind: 'forum', text: 'invited you to the forum Stanford CS Majors.', at: ago(2 * DAY) },
  { id: 'n7', personId: 'marcus', kind: 'accepted', text: 'accepted your connection request.', at: ago(3 * DAY) },
];

export const schoolUpdates: SchoolUpdate[] = [
  { id: 'u1', title: 'Winter quarter enrollment opens Nov 3', body: 'Check Axess for your enrollment time and meet your advisor before then.', at: ago(6 * HOUR) },
  { id: 'u2', title: 'Green Library extends midterm hours', body: 'Open until 2 AM, Sunday to Thursday, through October 31.', at: ago(DAY) },
];

export const vibeyRules: VibeyRule[] = [
  { id: 'r-login', label: 'Daily login', detail: '5 × your current streak', points: 5 },
  { id: 'r-post', label: 'First post of the day', detail: 'Share an update, photo, or project', points: 10 },
  { id: 'r-comment', label: 'First comment of the day', detail: 'Cheer on someone in your network', points: 5 },
  { id: 'r-donate', label: 'Support a campaign', detail: 'Any donation to a student campaign', points: 25 },
  { id: 'r-friends', label: 'Reach 10 connections', detail: 'One-time bonus', points: 50 },
  { id: 'r-campaign', label: 'Publish your first campaign', detail: 'One-time bonus', points: 100 },
];

export const rewards: Reward[] = [
  { id: 'rw-coffee', name: '$5 Starbucks gift card', cost: 250, detail: 'Emailed within 2 business days' },
  { id: 'rw-spotify', name: 'Spotify Premium, 1 month', cost: 400, detail: 'Student plan code' },
  { id: 'rw-amazon', name: '$10 Amazon gift card', cost: 500, detail: 'Emailed within 2 business days' },
  { id: 'rw-grand', name: 'Grand Prize entry: $1,000 scholarship', cost: 1000, detail: 'Drawing on December 15, 2026' },
];

export const seedProfile = {
  headline: 'CS @ Stanford · Building tools that help students find their people',
  about: "I'm a junior studying Computer Science with a focus on human-computer interaction. I lead the web team at Stanford Hackers and love shipping small, useful things.",
  skills: ['React', 'TypeScript', 'Python', 'Figma', 'Machine Learning', 'Public speaking'],
  experience: [
    { id: 'x1', role: 'Software Engineering Intern', org: 'Stripe', period: 'Jun – Sep 2026', detail: 'Built internal tooling for payout reconciliation used by 40+ engineers.' },
    { id: 'x2', role: 'Web Lead', org: 'Stanford Hackers', period: '2025 – Present', detail: 'Run a team of 6 building the TreeHacks registration platform.' },
  ] as Experience[],
  goals: ['Land a full-time SWE role at a mission-driven startup', 'Mentor 5 first-year CS students'],
};

export const vibeysStart = { balance: 640, streak: 3 };
