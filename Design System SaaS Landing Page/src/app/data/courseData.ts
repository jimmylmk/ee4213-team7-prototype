export interface Course {
  crn: string;
  code: string;
  title: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  start: string;
  end: string;
  credits: number;
  quotaTotal: number;
  quotaAvailable: number;
  requiredMajor: string | null;
  prereqs: string[];
  category: 'stem' | 'ge';
  examPct: number;
  courseworkPct: number;
  groupPct: number;
  isBridge: boolean;
  examDate?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  initials: string;
  date: string;
  commentCount: number;
  authorMeta: string;
  aboutAuthor: string;
  summary: string;
  body: string[];
  comments: { user: string; text: string }[];
  tags: string[];
  courseCode?: string;
}

export interface StudentProfile {
  name: string;
  id: string;
  major: string;
  standing: string;
  gpa: number;
  completedPrereqs: string[];
  baselineEnrolled: string[];
  minCredits: number;
  maxCredits: number;
}

export const studentProfile: StudentProfile = {
  name: 'Marcus Li',
  id: '55412980',
  major: 'Computer Science',
  standing: 'BSc Year 3 (Sem A 2026/27)',
  gpa: 3.42,
  completedPrereqs: ['CS1302'],
  baselineEnrolled: ['EE2000', 'CS1302', 'GE1501', 'GE1109'],
  minCredits: 12.0,
  maxCredits: 18.0
};

export const masterSchedule: Course[] = [
  { crn: '51001', code: 'EE2000', title: 'Engineering Foundations', day: 'Mon', start: '10:00', end: '12:00', credits: 3, quotaTotal: 30, quotaAvailable: 12, requiredMajor: null, prereqs: [], category: 'stem', examPct: 50, courseworkPct: 50, groupPct: 15, isBridge: false },
  { crn: '51003', code: 'CS1302', title: 'Introduction to Computer Science', day: 'Tue', start: '14:00', end: '16:00', credits: 3, quotaTotal: 30, quotaAvailable: 8, requiredMajor: null, prereqs: [], category: 'stem', examPct: 40, courseworkPct: 60, groupPct: 10, isBridge: false },
  { crn: '51004', code: 'GE1501', title: 'University Life & Society', day: 'Wed', start: '11:00', end: '13:00', credits: 3, quotaTotal: 30, quotaAvailable: 16, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 35, isBridge: false },
  { crn: '51002', code: 'GE1109', title: 'Global Cultures', day: 'Fri', start: '15:00', end: '18:00', credits: 3, quotaTotal: 30, quotaAvailable: 6, requiredMajor: null, prereqs: [], category: 'ge', examPct: 50, courseworkPct: 50, groupPct: 20, isBridge: false },
  { crn: '54081', code: 'GE1401', title: 'University English', day: 'Wed', start: '14:00', end: '17:00', credits: 3, quotaTotal: 30, quotaAvailable: 4, requiredMajor: null, prereqs: [], category: 'ge', examPct: 30, courseworkPct: 70, groupPct: 25, isBridge: false },
  { crn: '54086', code: 'GE1907', title: 'Asian Cities & Culture', day: 'Fri', start: '10:00', end: '12:00', credits: 3, quotaTotal: 30, quotaAvailable: 11, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 15, isBridge: false },
  { crn: '54087', code: 'GE2203', title: 'Sustainability & Society', day: 'Wed', start: '14:00', end: '16:00', credits: 3, quotaTotal: 30, quotaAvailable: 3, requiredMajor: null, prereqs: [], category: 'ge', examPct: 40, courseworkPct: 60, groupPct: 30, isBridge: false },
  { crn: '54090', code: 'GE2305', title: 'Film & Media Culture', day: 'Tue', start: '18:00', end: '21:00', credits: 3, quotaTotal: 30, quotaAvailable: 6, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 40, isBridge: false },
  { crn: '54091', code: 'GE2410', title: 'Public Speaking Skills', day: 'Thu', start: '19:00', end: '22:00', credits: 3, quotaTotal: 30, quotaAvailable: 3, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 20, isBridge: false },
  { crn: '54092', code: 'GE1601', title: 'Climate Change & Living', day: 'Mon', start: '14:00', end: '16:00', credits: 3, quotaTotal: 30, quotaAvailable: 7, requiredMajor: null, prereqs: [], category: 'ge', examPct: 30, courseworkPct: 70, groupPct: 20, isBridge: false },
  { crn: '54093', code: 'EE1002', title: 'Principles of Electronic Eng', day: 'Fri', start: '13:00', end: '15:00', credits: 3, quotaTotal: 35, quotaAvailable: 5, requiredMajor: null, prereqs: [], category: 'stem', examPct: 60, courseworkPct: 40, groupPct: 10, isBridge: true },
  { crn: '54094', code: 'GE1305', title: 'Music & Contemporary Life', day: 'Thu', start: '16:00', end: '18:00', credits: 2, quotaTotal: 25, quotaAvailable: 5, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 0, isBridge: false },
  { crn: '54095', code: 'GE2215', title: 'Urban Heritage Studies', day: 'Tue', start: '14:00', end: '17:00', credits: 3, quotaTotal: 30, quotaAvailable: 4, requiredMajor: null, prereqs: [], category: 'ge', examPct: 40, courseworkPct: 60, groupPct: 25, isBridge: false },
  { crn: '54096', code: 'PHY2201', title: 'Modern & Quantum Physics', day: 'Wed', start: '09:00', end: '12:00', credits: 3, quotaTotal: 25, quotaAvailable: 6, requiredMajor: 'Physics', prereqs: [], category: 'stem', examPct: 70, courseworkPct: 30, groupPct: 0, isBridge: false },
  { crn: '54097', code: 'DSC3001', title: 'Database Foundations', day: 'Fri', start: '10:00', end: '13:00', credits: 3, quotaTotal: 30, quotaAvailable: 4, requiredMajor: 'Data Science', prereqs: [], category: 'stem', examPct: 50, courseworkPct: 50, groupPct: 20, isBridge: false },
  { crn: '54098', code: 'CS3334', title: 'Data Structures & Algorithms', day: 'Mon', start: '16:00', end: '19:00', credits: 3, quotaTotal: 30, quotaAvailable: 8, requiredMajor: null, prereqs: ['CS2201'], category: 'stem', examPct: 40, courseworkPct: 60, groupPct: 30, isBridge: false },
  { crn: '54082', code: 'GE2101', title: 'Culture & Society', day: 'Mon', start: '10:00', end: '13:00', credits: 3, quotaTotal: 30, quotaAvailable: 9, requiredMajor: null, prereqs: [], category: 'ge', examPct: 50, courseworkPct: 50, groupPct: 20, isBridge: false },
  { crn: '54083', code: 'CS2115', title: 'Computer Systems', day: 'Thu', start: '09:00', end: '12:00', credits: 3, quotaTotal: 30, quotaAvailable: 7, requiredMajor: 'CS', prereqs: ['CS1302'], category: 'stem', examPct: 50, courseworkPct: 50, groupPct: 15, isBridge: false },
  { crn: '54084', code: 'GE1602', title: 'Ethics in Everyday Life', day: 'Thu', start: '13:00', end: '15:00', credits: 3, quotaTotal: 30, quotaAvailable: 0, requiredMajor: null, prereqs: [], category: 'ge', examPct: 30, courseworkPct: 70, groupPct: 10, isBridge: false },
  { crn: '54085', code: 'GE1804', title: 'Digital Citizenship', day: 'Tue', start: '09:00', end: '11:00', credits: 3, quotaTotal: 30, quotaAvailable: 0, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 30, isBridge: false },
  { crn: '54088', code: 'CS2201', title: 'Data Structures', day: 'Thu', start: '13:00', end: '16:00', credits: 3, quotaTotal: 30, quotaAvailable: 5, requiredMajor: 'CS', prereqs: ['CS1302'], category: 'stem', examPct: 50, courseworkPct: 50, groupPct: 20, isBridge: true },
  { crn: '54089', code: 'GE1203', title: 'Intro to Creative Film', day: 'Mon', start: '15:00', end: '17:00', credits: 2, quotaTotal: 30, quotaAvailable: 8, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 25, isBridge: false }
];

export const blogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Placement + CS3334: What My Week Actually Looked Like',
    subtitle: 'Spoiler: Saturday mornings were sacred during Weeks 11-12',
    author: "Mei L. '27",
    initials: 'ML',
    date: 'October 4, 2026',
    commentCount: 2,
    authorMeta: 'Sem B 2025/26 · Year 3 CS · 4-day placement · ~13h/wk · Final Grade: A-',
    aboutAuthor: 'Major: Computer Science · Placement: Software Intern (Mon-Thu) · Focus: Graph algorithms & systems',
    summary: 'I took CS3334 while on a Monday-to-Thursday placement. On paper my timetable had zero clashes, but Weeks 11-12 group project deadlines overlapped with placement deliverables.',
    body: [
      'I took CS3334 while on a Monday-to-Thursday placement. On paper my timetable was clean: lectures and labs did not clash with office hours. In practice, weekday evenings were short and required strict pacing.',
      'The midterm in Week 7 was manageable because the weekly tutorials covered the core tree and graph analysis questions directly. Weeks 11-12 were the real crunch: the group project landed on the exact same weeks as my placement sprint deliverables, so I booked Saturday mornings exclusively for coding.',
      'Would I take it again? Yes, because technical internship interviews rely heavily on CS3334 material. Just inspect the 13-week deliverable strip before committing.'
    ],
    comments: [
      { user: "Kevin W. '28", text: 'Did you find the tutorial attendances were strictly checked on Monday evenings?' },
      { user: "Mei L. '27", text: 'Yes, 10% tutorial engagement. Make sure your commute allows arriving by 18:00.' }
    ],
    tags: ['stem', 'workload', 'placement'],
    courseCode: 'CS3334'
  },
  {
    id: 'post-2',
    title: 'GE1907 vs GE1109: Why 100% Coursework Saved My Add/Drop Sanity',
    subtitle: 'Trading a 50% final exam for continuous cultural studio projects',
    author: "Chloe T. '27",
    initials: 'CT',
    date: 'September 28, 2026',
    commentCount: 3,
    authorMeta: 'Sem A 2025/26 · Year 2 BBA · No internship · ~6h/wk · Final Grade: A',
    aboutAuthor: 'Major: Business Administration · Exchange: Seoul Sem B · Focus: Continuous coursework GEs',
    summary: 'GE1907 Asian Cities has zero final examination (100% coursework and 15% group work). Swapping out of GE1109 freed up my entire final exam week.',
    body: [
      'During Add/Drop week I was originally enrolled in GE1109 on Friday late afternoons (15:00-18:00), which carried a 50% final examination weight.',
      'Using the Safe-Swap Sandbox, I rehearsed replacing GE1109 with GE1907 (Asian Cities & Culture, Fri 10:00-12:00) while keeping my original GE1109 seat protected until I verified the open quota.',
      'Because GE1907 is 100% coursework with only 15% group work, my Week 14 examination schedule was completely clear for my major core finals.'
    ],
    comments: [
      { user: "Marcus L. '29", text: 'How fast did the 11 open seats in GE1907 fill up during Week 2?' },
      { user: "Chloe T. '27", text: 'Check live AIMS seats right before executing the manual CRN drop/add sequence.' }
    ],
    tags: ['ge', 'exam'],
    courseCode: 'GE1907'
  },
  {
    id: 'post-3',
    title: 'Direct-Entry Transfer Pathway: Waiving CS1302 and Resolving Bridge Clashes',
    subtitle: 'Avoiding Year 1/2 prerequisite lockouts for Associate Degree transfers',
    author: "John J. '27",
    initials: 'JJ',
    date: 'September 22, 2026',
    commentCount: 1,
    authorMeta: 'Sem A 2025/26 · Advanced Standing II EE · Transfer Pathway · ~15h/wk · Final Grade: A',
    aboutAuthor: 'Major: Electronic & Computer Engineering · Entry: Direct-Entry Year 3 Transfer',
    summary: 'If you are an Advanced Standing transfer student, check Bridge courses (EE1002, CS2201) early and verify prerequisite chains before dropping foundation seats.',
    body: [
      'Entering as a direct-entry transfer student meant balancing Year 1 foundation bridge courses alongside Year 2/3 major requirements.',
      'Never drop CS1302 blindly on AIMS if you plan to take CS2115 or CS2201, because both enforce CS1302 as a strict prerequisite in the validation engine.',
      'Use the "Filter Bridge Courses" toggle in the timetable dock to isolate EE1002 and CS2201 and verify non-clashing afternoon slots.'
    ],
    comments: [
      { user: "Kevin W. '28", text: 'The prerequisite tree in the Course Inspector makes the CS1302 -> CS2201 -> CS3334 chain super clear.' }
    ],
    tags: ['transfer', 'stem'],
    courseCode: 'CS1302'
  },
  {
    id: 'post-4',
    title: 'Beware of the 2-Credit Drop Trap: GE1305, GE1203 and the 12-Credit Visa Floor',
    subtitle: 'Why swapping a 3-credit GE for a 2-credit elective triggers a visa alert',
    author: "Kevin W. '28",
    initials: 'KW',
    date: 'September 18, 2026',
    commentCount: 4,
    authorMeta: 'Sem B 2025/26 · Year 2 Mechanical · International Visa · ~4h/wk · Final Grade: B+',
    aboutAuthor: 'Major: Mechanical Engineering · Status: Non-local Full-Time Student (12.0 CR minimum)',
    summary: 'GE1305 and GE1203 are only 2.0 credits! If you hold a 12.0-credit baseline and swap a 3.0-credit course for a 2.0-credit course, your load drops to 11.0 CR.',
    body: [
      'Many students see GE1305 (Music & Contemporary Life) or GE1203 (Intro to Creative Film) with open seats and 100% coursework and try to swap out a 3-credit GE for them.',
      'If you are sitting at the 12.0-credit baseline (4 courses x 3.0 CR), swapping a 3-credit course for a 2-credit course drops your total to 11.0 credits — violating the 12.0-credit full-time student visa requirement.',
      'Always stage the swap in the rehearsal sandbox first so the live credit pill and visa floor guard catch the 11.0 CR drop before you touch AIMS.'
    ],
    comments: [
      { user: "Aadib B. '27", text: 'Critical reminder: AIMS also drops you to 9.0 CR momentarily during a non-atomic manual swap.' }
    ],
    tags: ['ge', 'workload', 'transfer'],
    courseCode: 'GE1305'
  },
  {
    id: 'post-5',
    title: 'How I Chose My Sem B Schedule Using a Week-by-Week Deliverable Sheet',
    subtitle: 'A very unscientific spreadsheet that saved my Week 7 midterm',
    author: "Jordan K. '28",
    initials: 'JK',
    date: 'September 12, 2026',
    commentCount: 2,
    authorMeta: 'Sem B 2025/26 · Year 2 Data Science · 10h/wk · Final Grade: A',
    aboutAuthor: 'Major: Data Science · Focus: Machine Learning & Database Systems',
    summary: 'Aligning midterm exam dates and group presentations across DSC3001 and CS2115 prevented an impossible Week 8 crunch.',
    body: [
      'In Semester B of my second year I had to choose between two elective combinations: DSC3001 (Database Foundations) or PHY2201 (Modern Physics).',
      'By inspecting the syllabus deliverable distributions, I noticed DSC3001 distributed its weight into continuous bi-weekly mini-quizzes, whereas PHY2201 concentrated 70% of its grade on a single final exam.',
      'Pairing DSC3001 with CS2115 smoothed my weekly cognitive workload and let me balance my study hours predictably throughout the term.'
    ],
    comments: [
      { user: "Marcus L. '29", text: 'The 100% Coursework filter pill really helped isolate continuous assessment options.' }
    ],
    tags: ['workload', 'stem'],
    courseCode: 'DSC3001'
  }
];

export interface ValidationResult {
  ok: boolean;
  reasons: string[];
}

export function parseMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function validateCourse(
  course: Course,
  enrolledCodes: string[],
  swapOutCode: string | null = null,
  outsideCommitments = false
): ValidationResult {
  const reasons: string[] = [];

  // 1. Quota check
  if (course.quotaAvailable <= 0) {
    reasons.push(`Course ${course.code} is full (0/${course.quotaTotal} seats open).`);
  }

  // 2. Prereq check
  for (const req of course.prereqs) {
    if (!studentProfile.completedPrereqs.includes(req)) {
      reasons.push(`Unmet Prerequisite: ${req} is required before enrolling in ${course.code}.`);
    }
  }

  // 3. Major restriction
  if (course.requiredMajor && course.requiredMajor !== 'CS' && !studentProfile.major.includes(course.requiredMajor)) {
    reasons.push(`Major Restriction: Restricted to ${course.requiredMajor} majors only.`);
  }

  // 4. Time clash check against currently enrolled courses (excluding the one being swapped out)
  const activeEnrolled = enrolledCodes
    .filter(code => code !== swapOutCode)
    .map(code => masterSchedule.find(c => c.code === code))
    .filter(Boolean) as Course[];

  const cStart = parseMinutes(course.start);
  const cEnd = parseMinutes(course.end);

  for (const enr of activeEnrolled) {
    if (enr.day === course.day) {
      const eStart = parseMinutes(enr.start);
      const eEnd = parseMinutes(enr.end);
      if (Math.max(cStart, eStart) < Math.min(cEnd, eEnd)) {
        reasons.push(`Schedule Conflict: Clashes with enrolled course ${enr.code} (${enr.day} ${enr.start}-${enr.end}).`);
      }
    }
  }

  // 5. Outside placement check: Mon & Thu 09:00 - 13:00
  if (outsideCommitments) {
    if (course.day === 'Mon' || course.day === 'Thu') {
      const pStart = 9 * 60;
      const pEnd = 13 * 60;
      if (Math.max(cStart, pStart) < Math.min(cEnd, pEnd)) {
        reasons.push(`Placement Conflict: Clashes with Off-Campus Tech Placement (${course.day} 09:00-13:00).`);
      }
    }
  }

  return {
    ok: reasons.length === 0,
    reasons
  };
}
