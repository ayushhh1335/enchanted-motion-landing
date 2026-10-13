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

/** Images are stored by key so persisted admin data never holds stale build URLs. */
export const photos = { p1, p2, p3, p4, p5, p6, p7, p8, advisor } as const;
export const covers = { campus, laptop, lab, studyHub, code, seoul, team, future } as const;
export type PhotoKey = keyof typeof photos;
export type CoverKey = keyof typeof covers;
export const coverKeys = Object.keys(covers) as CoverKey[];
/** Covers may also be uploaded data URLs. */
export const coverSrc = (cover: string) => (covers as Record<string, string>)[cover] ?? cover;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const now = () => Date.now();
const daysAgo = (n: number) => now() - n * DAY;
const daysAhead = (n: number) => now() + n * DAY;
const hoursAgo = (n: number) => now() - n * HOUR;

export type Membership = 'Active' | 'Trial' | 'Expired';
export type School = {
  id: string; name: string; short: string; city: string; colors: [string, string]; duns: string;
  membership: Membership; active: boolean; baseStudents: number; createdAt: number; logo?: string | undefined;
};

export type UserType = 'fundraiser' | 'team' | 'guest';
export type AdminUser = {
  id: string; type: UserType; name: string; email: string; phone: string; city: string; createdAt: number; lastActive: number;
  enabled: boolean; suspended: boolean; suspendReason?: string | undefined; photo?: PhotoKey | undefined;
  schoolId?: string | undefined; major?: string | undefined; vibeys: number; parentId?: string | undefined; withdrawCash?: boolean | undefined;
  donated?: number | undefined;
};

export type SchoolAdmin = { id: string; name: string; title: string; email: string; schoolId: string; createdAt: number; active: boolean };

export type CampaignStatus = 'draft' | 'active' | 'complete';
export type AdminCampaign = {
  id: string; title: string; ownerId: string; category: string; visibility: 'Public' | 'Private'; cover: string;
  start: number; end: number; goal: number; raised: number; donors: number; likes: number; status: CampaignStatus; createdAt: number; story: string;
};

export type PaymentMethod = 'PayPal' | 'Stripe' | 'Apple Pay' | 'Coinbase';
export type Payment = {
  id: string; campaignId: string; donor: string; txn: string; type: 'Donor gift' | 'Gift with eCard'; method: PaymentMethod;
  at: number; amount: number; fee: number; status: 'paid' | 'processing' | 'refunded'; recurring?: 'Monthly' | 'Weekly' | undefined;
};

export type WithdrawalStatus = 'pending' | 'paid' | 'declined';
export type Withdrawal = {
  id: string; campaignId: string; requesterId: string; requestedBy: 'Fundraiser' | 'Team member'; amount: number; siteFee: number;
  requestedAt: number; status: WithdrawalStatus; declineReason?: string | undefined; decidedAt?: number | undefined;
  bank: { name: string; holder: string; last4: string; routing: string };
};

export type LibraryItem = { id: string; name: string; createdAt: number; active: boolean };
export type Quote = { id: string; text: string; author: string; createdAt: number; active: boolean };
export type ECard = { id: string; name: string; tier: 'Basic' | 'Premium'; cover: string; sent: number; active: boolean; createdAt: number };

export type Forum = { id: string; title: string; ownerId: string; members: number; posts: number; isPrivate: boolean; createdAt: number; removed: boolean };
export type ReportKind = 'forum' | 'comment' | 'user' | 'campaign';
export type Report = {
  id: string; kind: ReportKind; targetId: string; authorId: string; excerpt: string; reporterId: string; reason: string; at: number;
  status: 'open' | 'resolved' | 'dismissed'; resolution?: string | undefined;
};

export type WordCategory = 'suicidal' | 'bad';
export type WatchWord = { id: string; word: string; category: WordCategory; createdAt: number; hits: number };
export type FlagStatus = 'open' | 'supported' | 'removed' | 'dismissed';
export type Flag = { id: string; userId: string; where: 'Post' | 'Comment' | 'Forum' | 'Chat'; text: string; word: string; category: WordCategory; at: number; status: FlagStatus };

export type EarnRule = { id: number; action: string; description: string; vibeys: number; maxCount: number; streak: boolean; once: boolean; active: boolean };
export type AdminReward = { id: string; name: string; detail: string; required: number; active: boolean; cover: string; createdAt: number };
export type Redemption = { id: string; userId: string; rewardId: string; at: number; status: 'requested' | 'redeemed'; coupon?: string | undefined; redeemedAt?: number | undefined };
export type Contest = {
  id: string; name: string; from: number; to: number; entry: number; prize: string; prizeValue: number; active: boolean;
  participants: string[]; winnerId?: string | undefined; pickedAt?: number | undefined;
};

export type SystemConfig = {
  projectName: string; adminEmail: string; adminPhone: string; maxJourneyMedia: number;
  transactionalPct: number; merchantPct: number; merchantFee: number; basicEcard: number; premiumEcard: number; logo?: string | undefined;
};
export type EmailTemplate = { id: string; name: string; audience: string; subject: string; body: string; updatedAt: number };
export type Suggestion = { id: string; schoolId: string; userId: string; text: string; at: number };
export type AuditEntry = { id: string; at: number; text: string; tone: 'mint' | 'sky' | 'sun' | 'rose' };

export const adminProfile = { name: 'Jordan Avery', title: 'Platform admin', email: 'admin@byeuni.com', photo: advisor };

export const seedSchools: School[] = [
  { id: 'stanford', name: 'Stanford University', short: 'Stanford', city: 'Stanford, CA', colors: ['#8C1515', '#2E2D29'], duns: '00-921-4214', membership: 'Active', active: true, baseStudents: 1836, createdAt: daysAgo(640) },
  { id: 'ucla', name: 'University of California, Los Angeles', short: 'UCLA', city: 'Los Angeles, CA', colors: ['#2774AE', '#FFD100'], duns: '09-215-3664', membership: 'Active', active: true, baseStudents: 1418, createdAt: daysAgo(590) },
  { id: 'utaustin', name: 'The University of Texas at Austin', short: 'UT Austin', city: 'Austin, TX', colors: ['#BF5700', '#333F48'], duns: '17-042-3008', membership: 'Active', active: true, baseStudents: 1262, createdAt: daysAgo(520) },
  { id: 'umich', name: 'University of Michigan', short: 'Michigan', city: 'Ann Arbor, MI', colors: ['#00274C', '#FFCB05'], duns: '07-313-3571', membership: 'Active', active: true, baseStudents: 1107, createdAt: daysAgo(470) },
  { id: 'nyu', name: 'New York University', short: 'NYU', city: 'New York, NY', colors: ['#57068C', '#C9A8E0'], duns: '04-196-8306', membership: 'Active', active: true, baseStudents: 978, createdAt: daysAgo(410) },
  { id: 'howard', name: 'Howard University', short: 'Howard', city: 'Washington, DC', colors: ['#003A63', '#E51937'], duns: '05-628-2296', membership: 'Active', active: true, baseStudents: 536, createdAt: daysAgo(300) },
  { id: 'asu', name: 'Arizona State University', short: 'ASU', city: 'Tempe, AZ', colors: ['#8C1D40', '#FFC627'], duns: '94-336-0412', membership: 'Trial', active: true, baseStudents: 304, createdAt: daysAgo(60) },
  { id: 'uw', name: 'University of Washington', short: 'UW', city: 'Seattle, WA', colors: ['#4B2E83', '#B7A57A'], duns: '60-519-2003', membership: 'Expired', active: false, baseStudents: 91, createdAt: daysAgo(380) },
];

export const seedUsers: AdminUser[] = [
  { id: 'me', type: 'fundraiser', name: 'Ethan Carter', email: 'ethan.carter@stanford.edu', phone: '(650) 555-0142', city: 'Palo Alto, CA', photo: 'p1', schoolId: 'stanford', major: 'Computer Science', vibeys: 640, createdAt: daysAgo(210), lastActive: hoursAgo(1), enabled: true, suspended: false },
  { id: 'mia', type: 'fundraiser', name: 'Mia Thompson', email: 'mia.thompson@ucla.edu', phone: '(310) 555-0119', city: 'Los Angeles, CA', photo: 'p2', schoolId: 'ucla', major: 'Psychology', vibeys: 410, createdAt: daysAgo(180), lastActive: hoursAgo(3), enabled: true, suspended: false },
  { id: 'marcus', type: 'fundraiser', name: 'Marcus Reyes', email: 'marcus.reyes@utexas.edu', phone: '(512) 555-0187', city: 'Austin, TX', photo: 'p3', schoolId: 'utaustin', major: 'Mechanical Engineering', vibeys: 1220, createdAt: daysAgo(260), lastActive: hoursAgo(5), enabled: true, suspended: false },
  { id: 'chloe', type: 'fundraiser', name: 'Chloe Sullivan', email: 'chloe.sullivan@stanford.edu', phone: '(650) 555-0163', city: 'Palo Alto, CA', photo: 'p4', schoolId: 'stanford', major: 'Product Design', vibeys: 980, createdAt: daysAgo(240), lastActive: hoursAgo(2), enabled: true, suspended: false },
  { id: 'emma', type: 'fundraiser', name: 'Emma Wilson', email: 'emma.wilson@nyu.edu', phone: '(212) 555-0174', city: 'New York, NY', photo: 'p5', schoolId: 'nyu', major: 'Film & Television', vibeys: 535, createdAt: daysAgo(150), lastActive: hoursAgo(8), enabled: true, suspended: false },
  { id: 'lucas', type: 'fundraiser', name: 'Lucas Bennett', email: 'lucas.bennett@umich.edu', phone: '(734) 555-0128', city: 'Ann Arbor, MI', photo: 'p6', schoolId: 'umich', major: 'Business Administration', vibeys: 290, createdAt: daysAgo(120), lastActive: daysAgo(1), enabled: true, suspended: false },
  { id: 'hannah', type: 'fundraiser', name: 'Hannah Kim', email: 'hannah.kim@stanford.edu', phone: '(650) 555-0191', city: 'Palo Alto, CA', photo: 'p7', schoolId: 'stanford', major: 'Data Science', vibeys: 1460, createdAt: daysAgo(300), lastActive: hoursAgo(4), enabled: true, suspended: false },
  { id: 'amara', type: 'fundraiser', name: 'Amara Johnson', email: 'amara.johnson@howard.edu', phone: '(202) 555-0156', city: 'Washington, DC', photo: 'p8', schoolId: 'howard', major: 'Political Science', vibeys: 360, createdAt: daysAgo(95), lastActive: hoursAgo(20), enabled: true, suspended: false },
  { id: 'olivia', type: 'fundraiser', name: 'Olivia Martinez', email: 'olivia.martinez@ucla.edu', phone: '(310) 555-0133', city: 'Los Angeles, CA', schoolId: 'ucla', major: 'Nursing', vibeys: 140, createdAt: daysAgo(40), lastActive: hoursAgo(1), enabled: true, suspended: false },
  { id: 'noah', type: 'fundraiser', name: 'Noah Williams', email: 'noah.williams@umich.edu', phone: '(734) 555-0102', city: 'Ann Arbor, MI', schoolId: 'umich', major: 'Education', vibeys: 220, createdAt: daysAgo(75), lastActive: daysAgo(2), enabled: true, suspended: false },
  { id: 'tyler', type: 'fundraiser', name: 'Tyler Brooks', email: 'tyler.brooks@utexas.edu', phone: '(512) 555-0199', city: 'Austin, TX', schoolId: 'utaustin', major: 'Finance', vibeys: 35, createdAt: daysAgo(12), lastActive: hoursAgo(6), enabled: true, suspended: false },
  { id: 'jordan', type: 'fundraiser', name: 'Jordan Lee', email: 'jordan.lee@asu.edu', phone: '(480) 555-0110', city: 'Tempe, AZ', schoolId: 'asu', major: 'Biology', vibeys: 50, createdAt: daysAgo(6), lastActive: daysAgo(6), enabled: false, suspended: false },
  { id: 'priya', type: 'fundraiser', name: 'Priya Patel', email: 'priya.patel@uw.edu', phone: '(206) 555-0147', city: 'Seattle, WA', schoolId: 'uw', major: 'Economics', vibeys: 75, createdAt: daysAgo(200), lastActive: daysAgo(48), enabled: false, suspended: false },
  { id: 't-sam', type: 'team', name: 'Sam Ortiz', email: 'sam.ortiz@utexas.edu', phone: '(512) 555-0141', city: 'Austin, TX', schoolId: 'utaustin', parentId: 'marcus', withdrawCash: true, vibeys: 0, createdAt: daysAgo(90), lastActive: hoursAgo(9), enabled: true, suspended: false },
  { id: 't-grace', type: 'team', name: 'Grace Liu', email: 'grace.liu@nyu.edu', phone: '(212) 555-0108', city: 'New York, NY', schoolId: 'nyu', parentId: 'emma', withdrawCash: false, vibeys: 0, createdAt: daysAgo(70), lastActive: daysAgo(3), enabled: true, suspended: false },
  { id: 'g-linda', type: 'guest', name: 'Linda Carter', email: 'linda.carter@gmail.com', phone: '(408) 555-0165', city: 'San Jose, CA', vibeys: 0, donated: 450, createdAt: daysAgo(30), lastActive: daysAgo(4), enabled: true, suspended: false },
  { id: 'g-robert', type: 'guest', name: 'Robert Reyes', email: 'rob.reyes@outlook.com', phone: '(210) 555-0170', city: 'San Antonio, TX', vibeys: 0, donated: 600, createdAt: daysAgo(55), lastActive: daysAgo(9), enabled: true, suspended: false },
  { id: 'g-karen', type: 'guest', name: 'Karen Thompson', email: 'karen.t@yahoo.com', phone: '(818) 555-0131', city: 'Burbank, CA', vibeys: 0, donated: 120, createdAt: daysAgo(22), lastActive: daysAgo(22), enabled: true, suspended: false },
  { id: 'g-david', type: 'guest', name: 'David Kim', email: 'david.kim@gmail.com', phone: '(415) 555-0186', city: 'San Francisco, CA', vibeys: 0, donated: 250, createdAt: daysAgo(14), lastActive: daysAgo(2), enabled: true, suspended: false },
];

export const seedSchoolAdmins: SchoolAdmin[] = [
  { id: 'sa-laura', name: 'Laura Chen', title: 'Director of Student Affairs', email: 'lchen@stanford.edu', schoolId: 'stanford', createdAt: daysAgo(600), active: true },
  { id: 'sa-michael', name: 'Michael Torres', title: 'Dean of Students Office', email: 'mtorres@utexas.edu', schoolId: 'utaustin', createdAt: daysAgo(500), active: true },
  { id: 'sa-angela', name: 'Angela Brooks', title: 'Student Life Coordinator', email: 'angela.brooks@howard.edu', schoolId: 'howard', createdAt: daysAgo(280), active: true },
  { id: 'sa-kevin', name: "Kevin O'Neil", title: 'Campus Engagement Lead', email: 'koneil@umich.edu', schoolId: 'umich', createdAt: daysAgo(450), active: false },
];

export const seedCampaigns: AdminCampaign[] = [
  { id: 'camp-hackmit', title: 'Fund my trip to HackMIT 2026', ownerId: 'me', category: 'Travel', visibility: 'Public', cover: 'code', start: daysAgo(21), end: daysAhead(9), goal: 2000, raised: 1150, donors: 31, likes: 84, status: 'active', createdAt: daysAgo(23), story: 'Our four-person team was accepted to HackMIT. This covers flights from SFO to Boston and two nights of lodging.' },
  { id: 'camp-robotics', title: 'Get our team to the FIRST Robotics Championship in Houston', ownerId: 'marcus', category: 'Travel', visibility: 'Public', cover: 'lab', start: daysAgo(30), end: daysAhead(12), goal: 5000, raised: 3240, donors: 58, likes: 212, status: 'active', createdAt: daysAgo(32), story: 'Our UT Austin team qualified for the world championship. Your support covers flights, hotel rooms, and shipping the robot.' },
  { id: 'camp-laptop', title: 'A laptop for my Political Science thesis', ownerId: 'amara', category: 'Equipment', visibility: 'Public', cover: 'laptop', start: daysAgo(10), end: daysAhead(20), goal: 1400, raised: 820, donors: 23, likes: 66, status: 'active', createdAt: daysAgo(11), story: 'My eight-year-old laptop died mid-semester. A new one keeps my thesis research and internship work on track.' },
  { id: 'camp-seoul', title: 'Study abroad in Seoul: housing and travel', ownerId: 'emma', category: 'Study abroad', visibility: 'Public', cover: 'seoul', start: daysAgo(45), end: daysAhead(30), goal: 6500, raised: 4100, donors: 74, likes: 305, status: 'active', createdAt: daysAgo(47), story: 'Help me finish my exchange semester at Yonsei and complete my documentary on Korean street food culture.' },
  { id: 'camp-mcat', title: 'MCAT prep books and exam fee', ownerId: 'mia', category: 'Exams', visibility: 'Public', cover: 'studyHub', start: daysAgo(12), end: daysAhead(18), goal: 600, raised: 260, donors: 9, likes: 41, status: 'active', createdAt: daysAgo(13), story: "I'm the first in my family applying to med school. This covers the full prep set and the exam registration." },
  { id: 'camp-garden', title: 'Green Quad community garden', ownerId: 'chloe', category: 'Community', visibility: 'Public', cover: 'campus', start: daysAgo(80), end: daysAgo(20), goal: 3000, raised: 3000, donors: 96, likes: 388, status: 'complete', createdAt: daysAgo(82), story: 'Raised beds, irrigation, and seed stock for a student-run garden on the Green Quad.' },
  { id: 'camp-neurips', title: 'Present my research at NeurIPS', ownerId: 'hannah', category: 'Conference', visibility: 'Public', cover: 'future', start: daysAgo(70), end: daysAgo(25), goal: 2400, raised: 2400, donors: 41, likes: 190, status: 'complete', createdAt: daysAgo(71), story: 'My paper on fair ranking models was accepted. This covers registration, flights, and lodging in Vancouver.' },
  { id: 'camp-coop', title: 'Launch funding for our campus delivery co-op', ownerId: 'lucas', category: 'Startup', visibility: 'Public', cover: 'team', start: daysAgo(60), end: daysAgo(5), goal: 8000, raised: 1850, donors: 27, likes: 73, status: 'active', createdAt: daysAgo(62), story: 'A student-owned co-op delivering groceries across Ann Arbor with e-bikes.' },
  { id: 'camp-asl', title: 'ASL interpreter certification', ownerId: 'noah', category: 'Education', visibility: 'Public', cover: 'future', start: daysAgo(8), end: daysAhead(40), goal: 1200, raised: 450, donors: 12, likes: 29, status: 'active', createdAt: daysAgo(9), story: 'Certification fees and practicum hours so I can interpret for Deaf students on campus.' },
  { id: 'camp-nursing', title: 'Nursing textbooks for junior year', ownerId: 'olivia', category: 'Books', visibility: 'Private', cover: 'studyHub', start: daysAhead(3), end: daysAhead(33), goal: 900, raised: 0, donors: 0, likes: 0, status: 'draft', createdAt: daysAgo(2), story: 'Clinical rotation textbooks and a stethoscope for my first hospital placement.' },
  { id: 'camp-crypto', title: 'Crypto giveaway: double every donation', ownerId: 'tyler', category: 'Other', visibility: 'Public', cover: 'laptop', start: daysAgo(4), end: daysAhead(26), goal: 10000, raised: 40, donors: 2, likes: 3, status: 'active', createdAt: daysAgo(5), story: 'Send any amount and I will send back double within 24 hours. Limited spots!' },
];

/** Deterministic generator so every reset produces the same ledger. */
function seeded(seed: number) {
  let t = seed;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const donors = ['Linda Carter', 'Robert Reyes', 'Karen Thompson', 'David Kim', 'Anonymous', 'Susan Miller', 'James Anderson', 'Patricia Moore', 'Michael Brown', 'Jennifer Davis', 'Chris Taylor', 'Anonymous', 'Ashley Wilson', 'Brian Clark', 'Megan Lewis'];
const amounts = [10, 15, 20, 25, 25, 35, 50, 50, 75, 100, 100, 150, 250];

function buildPayments(): Payment[] {
  const rand = seeded(2026);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(rand() * list.length)] as T;
  const funded = seedCampaigns.filter(c => c.raised > 0);
  return Array.from({ length: 72 }, (_, i): Payment => {
    const amount = pick(amounts);
    const methodRoll = rand();
    const method: PaymentMethod = methodRoll < .68 ? 'PayPal' : methodRoll < .86 ? 'Stripe' : methodRoll < .96 ? 'Apple Pay' : 'Coinbase';
    const fee = Math.round((amount * 0.029 + 0.3) * 100) / 100;
    const at = i < 4 ? hoursAgo(2 + i * 5) : daysAgo(Math.floor(rand() * 178) + 1) - Math.floor(rand() * DAY);
    const status: Payment['status'] = i === 1 ? 'processing' : i === 9 ? 'refunded' : 'paid';
    return {
      id: `pay-${i + 1}`,
      campaignId: pick(funded).id,
      donor: pick(donors),
      txn: `${method === 'PayPal' ? 'PAYID' : method === 'Stripe' ? 'ch' : method === 'Apple Pay' ? 'ap' : 'cb'}-${Math.floor(rand() * 36 ** 8).toString(36).toUpperCase().padStart(8, '0')}`,
      type: rand() < .22 ? 'Gift with eCard' : 'Donor gift',
      method, at, amount, fee, status,
      recurring: rand() < .12 ? (rand() < .7 ? 'Monthly' : 'Weekly') : undefined,
    };
  }).sort((a, b) => b.at - a.at);
}
export const seedPayments = buildPayments();

export const seedWithdrawals: Withdrawal[] = [
  { id: 'wd-1', campaignId: 'camp-robotics', requesterId: 'marcus', requestedBy: 'Fundraiser', amount: 1164.2, siteFee: 35.8, requestedAt: daysAgo(1), status: 'pending', bank: { name: 'Chase', holder: 'Marcus Reyes', last4: '4821', routing: '111000614' } },
  { id: 'wd-2', campaignId: 'camp-robotics', requesterId: 't-sam', requestedBy: 'Team member', amount: 388.4, siteFee: 11.6, requestedAt: hoursAgo(5), status: 'pending', bank: { name: 'Chase', holder: 'Marcus Reyes', last4: '4821', routing: '111000614' } },
  { id: 'wd-3', campaignId: 'camp-seoul', requesterId: 'emma', requestedBy: 'Fundraiser', amount: 1941.7, siteFee: 58.3, requestedAt: daysAgo(3), status: 'pending', bank: { name: 'Bank of America', holder: 'Emma Wilson', last4: '0937', routing: '026009593' } },
  { id: 'wd-4', campaignId: 'camp-hackmit', requesterId: 'me', requestedBy: 'Fundraiser', amount: 485.2, siteFee: 14.8, requestedAt: daysAgo(6), status: 'paid', decidedAt: daysAgo(5), bank: { name: 'Wells Fargo', holder: 'Ethan Carter', last4: '7310', routing: '121042882' } },
  { id: 'wd-5', campaignId: 'camp-garden', requesterId: 'chloe', requestedBy: 'Fundraiser', amount: 2911.6, siteFee: 88.4, requestedAt: daysAgo(18), status: 'paid', decidedAt: daysAgo(16), bank: { name: 'Charles Schwab', holder: 'Chloe Sullivan', last4: '5582', routing: '121202211' } },
  { id: 'wd-6', campaignId: 'camp-neurips', requesterId: 'hannah', requestedBy: 'Fundraiser', amount: 2329.1, siteFee: 70.9, requestedAt: daysAgo(24), status: 'paid', decidedAt: daysAgo(23), bank: { name: 'Capital One', holder: 'Hannah Kim', last4: '2264', routing: '056073502' } },
  { id: 'wd-7', campaignId: 'camp-laptop', requesterId: 'amara', requestedBy: 'Fundraiser', amount: 291.0, siteFee: 9.0, requestedAt: daysAgo(9), status: 'declined', declineReason: 'Account holder name does not match the fundraiser. Please add your own bank account.', decidedAt: daysAgo(8), bank: { name: 'PNC Bank', holder: 'Denise Johnson', last4: '9045', routing: '054000030' } },
];

export const seedCategories: LibraryItem[] = ['Travel', 'Equipment', 'Study abroad', 'Exams', 'Community', 'Conference', 'Startup', 'Books', 'Education', 'Medical', 'Other']
  .map((name, i) => ({ id: `cat-${i + 1}`, name, createdAt: daysAgo(700 - i * 30), active: name !== 'Medical' }));
export const seedMajors: LibraryItem[] = ['Computer Science', 'Psychology', 'Mechanical Engineering', 'Product Design', 'Film & Television', 'Business Administration', 'Data Science', 'Political Science', 'Nursing', 'Education', 'Finance', 'Biology', 'Economics', 'Undeclared']
  .map((name, i) => ({ id: `maj-${i + 1}`, name, createdAt: daysAgo(680 - i * 20), active: name !== 'Undeclared' }));
export const seedQuotes: Quote[] = [
  { id: 'q1', text: 'The beautiful thing about learning is that no one can take it away from you.', author: 'B.B. King', createdAt: daysAgo(400), active: true },
  { id: 'q2', text: 'Alone we can do so little; together we can do so much.', author: 'Helen Keller', createdAt: daysAgo(380), active: true },
  { id: 'q3', text: 'It always seems impossible until it is done.', author: 'Nelson Mandela', createdAt: daysAgo(300), active: true },
  { id: 'q4', text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe', createdAt: daysAgo(210), active: true },
  { id: 'q5', text: 'Education is the passport to the future.', author: 'Malcolm X', createdAt: daysAgo(90), active: false },
];
export const seedEcards: ECard[] = [
  { id: 'ec-1', name: 'Thank you, friend', tier: 'Basic', cover: 'campus', sent: 412, active: true, createdAt: daysAgo(500) },
  { id: 'ec-2', name: 'Go get it', tier: 'Basic', cover: 'future', sent: 288, active: true, createdAt: daysAgo(480) },
  { id: 'ec-3', name: 'Proud of your team', tier: 'Basic', cover: 'team', sent: 151, active: true, createdAt: daysAgo(300) },
  { id: 'ec-4', name: 'Graduation gold', tier: 'Premium', cover: 'studyHub', sent: 97, active: true, createdAt: daysAgo(260) },
  { id: 'ec-5', name: 'Bon voyage', tier: 'Premium', cover: 'seoul', sent: 64, active: true, createdAt: daysAgo(140) },
  { id: 'ec-6', name: 'Build something great', tier: 'Premium', cover: 'code', sent: 12, active: false, createdAt: daysAgo(30) },
];

export const seedForums: Forum[] = [
  { id: 'f-cs', title: 'CS Majors Network', ownerId: 'me', members: 2140, posts: 318, isPrivate: false, createdAt: daysAgo(200), removed: false },
  { id: 'f-green', title: 'Green Campus Collective', ownerId: 'chloe', members: 860, posts: 142, isPrivate: false, createdAt: daysAgo(160), removed: false },
  { id: 'f-premed', title: 'Pre-Med Study Circle', ownerId: 'mia', members: 1205, posts: 260, isPrivate: true, createdAt: daysAgo(150), removed: false },
  { id: 'f-firstgen', title: 'First-Gen Founders', ownerId: 'amara', members: 540, posts: 88, isPrivate: false, createdAt: daysAgo(90), removed: false },
  { id: 'f-film', title: 'Film & Photo Club', ownerId: 'emma', members: 730, posts: 121, isPrivate: false, createdAt: daysAgo(120), removed: false },
  { id: 'f-crypto', title: 'Free crypto signals 🚀', ownerId: 'tyler', members: 14, posts: 22, isPrivate: false, createdAt: daysAgo(6), removed: false },
];

export const seedReports: Report[] = [
  { id: 'rp-1', kind: 'forum', targetId: 'f-crypto', authorId: 'tyler', excerpt: 'Join for guaranteed 10x signals. Send $50 to unlock the VIP channel.', reporterId: 'hannah', reason: 'Spam or scam', at: hoursAgo(2), status: 'open' },
  { id: 'rp-2', kind: 'comment', targetId: 'c-tyler-1', authorId: 'tyler', excerpt: 'DM me to double your money, guaranteed returns 💸', reporterId: 'chloe', reason: 'Spam or scam', at: hoursAgo(5), status: 'open' },
  { id: 'rp-3', kind: 'campaign', targetId: 'camp-crypto', authorId: 'tyler', excerpt: 'Crypto giveaway: double every donation', reporterId: 'marcus', reason: 'Misleading or fraudulent fundraiser', at: daysAgo(1), status: 'open' },
  { id: 'rp-4', kind: 'user', targetId: 'tyler', authorId: 'tyler', excerpt: 'Sends repeated DMs asking students to donate to his giveaway.', reporterId: 'mia', reason: 'Harassment or unwanted contact', at: daysAgo(1), status: 'open' },
  { id: 'rp-5', kind: 'comment', targetId: 'c-noah-1', authorId: 'noah', excerpt: 'honestly this is the dumbest project idea I have seen this year', reporterId: 'amara', reason: 'Bullying', at: daysAgo(2), status: 'open' },
  { id: 'rp-6', kind: 'user', targetId: 'lucas', authorId: 'lucas', excerpt: 'Profile photo looks like a stock image.', reporterId: 'olivia', reason: 'Fake profile', at: daysAgo(11), status: 'dismissed', resolution: 'Verified with University of Michigan student ID.' },
];

export const seedWords: WatchWord[] = [
  ...['kill myself', 'end it all', 'no reason to live', 'want to disappear', 'self harm'].map((word, i) => ({ id: `w-s${i}`, word, category: 'suicidal' as const, createdAt: daysAgo(300 - i), hits: [3, 1, 2, 4, 1][i] ?? 0 })),
  ...['scam', 'idiot', 'loser', 'stupid', 'hate you', 'dumbest'].map((word, i) => ({ id: `w-b${i}`, word, category: 'bad' as const, createdAt: daysAgo(290 - i), hits: [14, 9, 6, 11, 3, 2][i] ?? 0 })),
];

export const seedFlags: Flag[] = [
  { id: 'fl-1', userId: 'olivia', where: 'Post', text: 'Finals are crushing me and honestly I just want to disappear for a while.', word: 'want to disappear', category: 'suicidal', at: hoursAgo(1), status: 'open' },
  { id: 'fl-2', userId: 'tyler', where: 'Comment', text: 'Anyone who does not donate is a loser.', word: 'loser', category: 'bad', at: hoursAgo(7), status: 'open' },
  { id: 'fl-3', userId: 'noah', where: 'Comment', text: 'honestly this is the dumbest project idea I have seen this year', word: 'dumbest', category: 'bad', at: daysAgo(2), status: 'open' },
  { id: 'fl-4', userId: 'lucas', where: 'Forum', text: 'Pretty sure that crypto giveaway is a scam, do not send money.', word: 'scam', category: 'bad', at: daysAgo(3), status: 'open' },
  { id: 'fl-5', userId: 'jordan', where: 'Chat', text: 'Some days I feel like there is no reason to live.', word: 'no reason to live', category: 'suicidal', at: daysAgo(5), status: 'supported' },
];

export const seedRules: EarnRule[] = [
  { id: 1, action: 'Registration', description: 'Create a ByeUni account', vibeys: 50, maxCount: 0, streak: false, once: true, active: true },
  { id: 2, action: 'Daily login', description: 'Log in once a day (multiplied by the current streak)', vibeys: 5, maxCount: 0, streak: true, once: false, active: true },
  { id: 3, action: 'First forum of the day', description: 'Create the first forum of the day', vibeys: 10, maxCount: 0, streak: false, once: false, active: true },
  { id: 4, action: 'First campaign', description: 'Publish your first campaign', vibeys: 100, maxCount: 0, streak: false, once: true, active: true },
  { id: 5, action: 'Ten friends', description: 'Reach the accepted-friend target', vibeys: 75, maxCount: 10, streak: false, once: true, active: true },
  { id: 6, action: 'First comment of the day', description: 'Comment on a post or forum', vibeys: 5, maxCount: 0, streak: false, once: false, active: true },
  { id: 7, action: 'Donation', description: 'Donate to a campaign', vibeys: 20, maxCount: 0, streak: false, once: false, active: true },
  { id: 8, action: 'Streak bonus', description: 'Bonus every N consecutive login days', vibeys: 50, maxCount: 7, streak: true, once: false, active: true },
];

export const seedRewards: AdminReward[] = [
  { id: 'rw-starbucks', name: 'Starbucks $10 gift card', detail: 'Coffee on us for finals week', required: 250, active: true, cover: 'studyHub', createdAt: daysAgo(300) },
  { id: 'rw-chipotle', name: 'Chipotle $15 meal card', detail: 'A burrito bowl and a drink', required: 300, active: true, cover: 'campus', createdAt: daysAgo(260) },
  { id: 'rw-bn', name: 'Barnes & Noble $20', detail: 'Textbooks or a good read', required: 350, active: true, cover: 'future', createdAt: daysAgo(200) },
  { id: 'rw-spotify', name: 'Spotify Premium, 3 months', detail: 'Study playlists without ads', required: 400, active: true, cover: 'team', createdAt: daysAgo(180) },
  { id: 'rw-amazon', name: 'Amazon $25 gift card', detail: 'Dorm essentials and more', required: 500, active: true, cover: 'laptop', createdAt: daysAgo(150) },
  { id: 'rw-airpods', name: 'AirPods (3rd gen)', detail: 'Limited stock, ships in the US', required: 2500, active: false, cover: 'code', createdAt: daysAgo(40) },
];

export const seedRedemptions: Redemption[] = [
  { id: 'rd-1', userId: 'hannah', rewardId: 'rw-amazon', at: hoursAgo(3), status: 'requested' },
  { id: 'rd-2', userId: 'marcus', rewardId: 'rw-spotify', at: hoursAgo(14), status: 'requested' },
  { id: 'rd-3', userId: 'chloe', rewardId: 'rw-starbucks', at: daysAgo(1), status: 'requested' },
  { id: 'rd-4', userId: 'me', rewardId: 'rw-starbucks', at: daysAgo(12), status: 'redeemed', coupon: 'SBX-7H2K-91QZ', redeemedAt: daysAgo(11) },
  { id: 'rd-5', userId: 'emma', rewardId: 'rw-bn', at: daysAgo(20), status: 'redeemed', coupon: 'BN-20-55TR-0P', redeemedAt: daysAgo(19) },
];

export const seedContests: Contest[] = [
  { id: 'gc-fall', name: 'Fall Finals Grand Prize', from: daysAgo(20), to: daysAhead(15), entry: 100, prize: 'Apple iPad Air', prizeValue: 599, active: true, participants: ['me', 'hannah', 'chloe', 'marcus', 'emma', 'amara', 'mia'] },
  { id: 'gc-spring', name: 'Spring Break Getaway', from: daysAgo(60), to: daysAgo(10), entry: 150, prize: '$500 travel voucher', prizeValue: 500, active: true, participants: ['marcus', 'emma', 'lucas', 'hannah', 'noah'] },
  { id: 'gc-summer', name: 'Summer Kickoff Giveaway', from: daysAgo(140), to: daysAgo(95), entry: 80, prize: 'Nintendo Switch OLED', prizeValue: 349, active: false, participants: ['hannah', 'chloe', 'me', 'mia'], winnerId: 'hannah', pickedAt: daysAgo(93) },
];

export const seedConfig: SystemConfig = {
  projectName: 'ByeUni', adminEmail: 'support@byeuni.com', adminPhone: '(415) 555-0100', maxJourneyMedia: 10,
  transactionalPct: 2.9, merchantPct: 2.2, merchantFee: 0.3, basicEcard: 0.99, premiumEcard: 2.99,
};

export const seedTemplates: EmailTemplate[] = [
  { id: 'tpl-welcome-fund', name: 'Welcome email', audience: 'Fundraisers', subject: 'Welcome to ByeUni, {{first_name}}!', body: 'Hi {{first_name}},\n\nWelcome to ByeUni. Finish your profile, find your classmates, and start your first campaign when you are ready.\n\nSee you on campus,\nThe ByeUni team', updatedAt: daysAgo(40) },
  { id: 'tpl-welcome-guest', name: 'Welcome email', audience: 'Guests', subject: 'Thanks for supporting students on ByeUni', body: 'Hi {{first_name}},\n\nThanks for joining ByeUni. You can follow the campaigns you support and send eThank-you cards to students.\n\nThe ByeUni team', updatedAt: daysAgo(40) },
  { id: 'tpl-wd-requested', name: 'Withdrawal requested', audience: 'Admins', subject: 'New withdrawal request: {{campaign_title}}', body: '{{requester_name}} requested {{amount}} from "{{campaign_title}}". Review it in the admin console.', updatedAt: daysAgo(120) },
  { id: 'tpl-wd-accepted', name: 'Withdrawal accepted', audience: 'Fundraisers', subject: 'Your withdrawal is on its way', body: 'Hi {{first_name}},\n\nWe approved your withdrawal of {{amount}} from "{{campaign_title}}". Funds usually arrive in 2 to 3 business days.', updatedAt: daysAgo(120) },
  { id: 'tpl-wd-denied', name: 'Withdrawal declined', audience: 'Fundraisers', subject: 'We could not process your withdrawal', body: 'Hi {{first_name}},\n\nWe could not approve your withdrawal from "{{campaign_title}}".\n\nReason: {{decline_reason}}\n\nReply to this email if you have questions.', updatedAt: daysAgo(120) },
  { id: 'tpl-reward', name: 'Your Reward Coupon is Here!', audience: 'Fundraisers', subject: 'Your {{reward_name}} is ready', body: 'Hi {{first_name}},\n\nThanks for being part of ByeUni. Here is your coupon code: {{coupon_code}}', updatedAt: daysAgo(60) },
];

export const seedSuggestions: Suggestion[] = [
  { id: 'sg-1', schoolId: 'stanford', userId: 'chloe', text: 'Please add more study spaces open past midnight during finals.', at: daysAgo(2) },
  { id: 'sg-2', schoolId: 'stanford', userId: 'hannah', text: 'Late-night study rooms in Green Library would help a lot.', at: daysAgo(4) },
  { id: 'sg-3', schoolId: 'stanford', userId: 'me', text: 'More hackathon travel grants for undergrads.', at: daysAgo(6) },
  { id: 'sg-4', schoolId: 'stanford', userId: 'chloe', text: 'Composting bins in every dorm kitchen.', at: daysAgo(9) },
  { id: 'sg-5', schoolId: 'utaustin', userId: 'marcus', text: 'Shuttle service to the robotics lab on weekends.', at: daysAgo(3) },
  { id: 'sg-6', schoolId: 'utaustin', userId: 'tyler', text: 'Allow crypto payments for tuition.', at: daysAgo(5) },
  { id: 'sg-7', schoolId: 'ucla', userId: 'mia', text: 'Free MCAT prep workshops for first-gen students.', at: daysAgo(7) },
  { id: 'sg-8', schoolId: 'ucla', userId: 'olivia', text: 'More mental health counselors during finals week.', at: daysAgo(1) },
];

export const seedAudit: AuditEntry[] = [
  { id: 'au-1', at: daysAgo(5), text: 'Marked HackMIT withdrawal as paid ($485.20)', tone: 'mint' },
  { id: 'au-2', at: daysAgo(8), text: "Declined Amara Johnson's withdrawal: bank name mismatch", tone: 'rose' },
  { id: 'au-3', at: daysAgo(11), text: 'Dismissed fake-profile report on Lucas Bennett', tone: 'sky' },
  { id: 'au-4', at: daysAgo(19), text: 'Sent Barnes & Noble coupon to Emma Wilson', tone: 'sun' },
];
