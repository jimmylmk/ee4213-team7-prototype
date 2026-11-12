export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface CourseSectionMeeting {
  section: string;
  type: 'Lecture' | 'Tutorial' | 'Lab';
  crn: string;
  day: DayOfWeek;
  start: string;
  end: string;
  room?: string;
  quotaAvailable: number;
  quotaTotal: number;
}

export interface Course {
  crn: string;
  code: string;
  title: string;
  day: DayOfWeek;
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
  syllabusPdf?: string;
  syllabusYear?: '2026/27' | '2025/26';
  lectureSection?: string;
  tutorialOptions?: CourseSectionMeeting[];
  labOptions?: CourseSectionMeeting[];
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  initials: string;
  date: string;
  verificationStatus: 'verified' | 'pending';
  commentCount: number;
  authorMeta: string;
  aboutAuthor: string;
  summary: string;
  body: string[];
  comments: { user: string; text: string }[];
  tags: string[];
  courseCode?: string;
  avatarUrl?: string;
  readTime?: string;
  helpfulCount?: number;
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
  major: 'Computer and Data Engineering (CDE)',
  standing: 'BEng Year 2 (Sem A 2026/27)',
  gpa: 3.42,
  completedPrereqs: [],
  baselineEnrolled: ['EE2000', 'CS1302', 'GE1501', 'GE1109'],
  minCredits: 12.0,
  maxCredits: 18.0
};

export const masterSchedule: Course[] = [
  {
    crn: '10027',
    code: 'EE2000',
    title: 'Logic Circuit Design',
    day: 'Thu',
    start: '12:00',
    end: '14:50',
    credits: 3,
    quotaTotal: 211,
    quotaAvailable: 10,
    requiredMajor: 'CDE',
    prereqs: ['EE1002'],
    category: 'stem',
    syllabusPdf: './syllabi/EE2000.pdf',
    syllabusYear: '2025/26',
    examPct: 50,
    courseworkPct: 50,
    groupPct: 15,
    isBridge: false,
    lectureSection: 'C01',
    tutorialOptions: [
      { section: 'T01', type: 'Tutorial', crn: '10028', day: 'Wed', start: '15:00', end: '15:50', quotaAvailable: 4, quotaTotal: 116 },
      { section: 'T02', type: 'Tutorial', crn: '11345', day: 'Mon', start: '18:00', end: '18:50', quotaAvailable: 6, quotaTotal: 95 }
    ],
    labOptions: [
      { section: 'L02', type: 'Lab', crn: '10809', day: 'Mon', start: '15:00', end: '17:50', quotaAvailable: 6, quotaTotal: 57 },
      { section: 'L03', type: 'Lab', crn: '12433', day: 'Fri', start: '19:00', end: '21:50', quotaAvailable: 4, quotaTotal: 58 },
      { section: 'L01', type: 'Lab', crn: '10808', day: 'Mon', start: '09:00', end: '11:50', quotaAvailable: 0, quotaTotal: 58 }
    ]
  },
  { crn: '51003', code: 'CS1302', title: 'Introduction to Computer Science', day: 'Tue', start: '14:00', end: '16:00', credits: 3, quotaTotal: 30, quotaAvailable: 8, requiredMajor: null, prereqs: [], category: 'stem', examPct: 40, courseworkPct: 60, groupPct: 10, isBridge: false },
  { crn: '51004', code: 'GE1501', title: 'University Life & Society', day: 'Wed', start: '11:00', end: '13:00', credits: 3, quotaTotal: 30, quotaAvailable: 16, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 35, isBridge: false },
  { crn: '51002', code: 'GE1109', title: 'Global Cultures', day: 'Fri', start: '15:00', end: '18:00', credits: 3, quotaTotal: 30, quotaAvailable: 6, requiredMajor: null, prereqs: [], category: 'ge', examPct: 50, courseworkPct: 50, groupPct: 20, isBridge: false },
  { crn: '54081', code: 'GE1401', title: 'University English', day: 'Wed', start: '14:00', end: '17:00', credits: 3, quotaTotal: 30, quotaAvailable: 4, requiredMajor: null, prereqs: [], category: 'ge', examPct: 30, courseworkPct: 70, groupPct: 25, isBridge: false },
  { crn: '54086', code: 'GE1907', title: 'Asian Cities & Culture', day: 'Fri', start: '10:00', end: '12:00', credits: 3, quotaTotal: 30, quotaAvailable: 11, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 15, isBridge: false },
  { crn: '54087', code: 'GE2203', title: 'Sustainability & Society', day: 'Wed', start: '14:00', end: '16:00', credits: 3, quotaTotal: 30, quotaAvailable: 3, requiredMajor: null, prereqs: [], category: 'ge', examPct: 40, courseworkPct: 60, groupPct: 30, isBridge: false },
  { crn: '54090', code: 'GE2305', title: 'Film & Media Culture', day: 'Tue', start: '18:00', end: '21:00', credits: 3, quotaTotal: 30, quotaAvailable: 6, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 40, isBridge: false },
  { crn: '54091', code: 'GE2410', title: 'Public Speaking Skills', day: 'Thu', start: '19:00', end: '22:00', credits: 3, quotaTotal: 30, quotaAvailable: 3, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 20, isBridge: false },
  { crn: '54092', code: 'GE1601', title: 'Climate Change & Living', day: 'Mon', start: '14:00', end: '16:00', credits: 3, quotaTotal: 30, quotaAvailable: 7, requiredMajor: null, prereqs: [], category: 'ge', examPct: 30, courseworkPct: 70, groupPct: 20, isBridge: false },
  { crn: '54093', code: 'EE1002', title: 'Principles of Electronic Eng', day: 'Fri', start: '13:00', end: '15:00', credits: 3, quotaTotal: 35, quotaAvailable: 5, requiredMajor: null, prereqs: [], category: 'stem',
    syllabusPdf: './syllabi/EE1002.pdf',
    syllabusYear: '2026/27', examPct: 60, courseworkPct: 40, groupPct: 10, isBridge: true },
  { crn: '54094', code: 'GE1305', title: 'Music & Contemporary Life', day: 'Thu', start: '16:00', end: '18:00', credits: 2, quotaTotal: 25, quotaAvailable: 5, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 0, isBridge: false },
  { crn: '54095', code: 'GE2215', title: 'Urban Heritage Studies', day: 'Tue', start: '14:00', end: '17:00', credits: 3, quotaTotal: 30, quotaAvailable: 4, requiredMajor: null, prereqs: [], category: 'ge', examPct: 40, courseworkPct: 60, groupPct: 25, isBridge: false },
  { crn: '54096', code: 'PHY2201', title: 'Modern & Quantum Physics', day: 'Wed', start: '09:00', end: '12:00', credits: 3, quotaTotal: 25, quotaAvailable: 6, requiredMajor: 'Physics', prereqs: [], category: 'stem', examPct: 70, courseworkPct: 30, groupPct: 0, isBridge: false },
  { crn: '54097', code: 'DSC3001', title: 'Database Foundations', day: 'Fri', start: '10:00', end: '13:00', credits: 3, quotaTotal: 30, quotaAvailable: 4, requiredMajor: 'Data Science', prereqs: [], category: 'stem', examPct: 50, courseworkPct: 50, groupPct: 20, isBridge: false },
  { crn: '54098', code: 'CS3334', title: 'Data Structures & Algorithms', day: 'Mon', start: '16:00', end: '19:00', credits: 3, quotaTotal: 30, quotaAvailable: 8, requiredMajor: null, prereqs: ['CS2201'], category: 'stem',
    syllabusPdf: './syllabi/CS3334.pdf',
    syllabusYear: '2025/26', examPct: 40, courseworkPct: 60, groupPct: 30, isBridge: false },
  { crn: '54082', code: 'GE2101', title: 'Culture & Society', day: 'Mon', start: '10:00', end: '13:00', credits: 3, quotaTotal: 30, quotaAvailable: 9, requiredMajor: null, prereqs: [], category: 'ge', examPct: 50, courseworkPct: 50, groupPct: 20, isBridge: false },
  { crn: '54083', code: 'CS2115', title: 'Computer Systems', day: 'Thu', start: '09:00', end: '12:00', credits: 3, quotaTotal: 30, quotaAvailable: 7, requiredMajor: 'CS', prereqs: ['CS1302'], category: 'stem',
    syllabusPdf: './syllabi/CS2115.pdf',
    syllabusYear: '2025/26', examPct: 50, courseworkPct: 50, groupPct: 15, isBridge: false },
  { crn: '54084', code: 'GE1602', title: 'Ethics in Everyday Life', day: 'Thu', start: '13:00', end: '15:00', credits: 3, quotaTotal: 30, quotaAvailable: 0, requiredMajor: null, prereqs: [], category: 'ge', examPct: 30, courseworkPct: 70, groupPct: 10, isBridge: false },
  { crn: '54085', code: 'GE1804', title: 'Digital Citizenship', day: 'Tue', start: '09:00', end: '11:00', credits: 3, quotaTotal: 30, quotaAvailable: 0, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 30, isBridge: false },
  { crn: '54088', code: 'CS2201', title: 'Data Structures', day: 'Thu', start: '13:00', end: '16:00', credits: 3, quotaTotal: 30, quotaAvailable: 5, requiredMajor: 'CS', prereqs: ['CS1302'], category: 'stem', examPct: 50, courseworkPct: 50, groupPct: 20, isBridge: true },
  { crn: '54089', code: 'GE1203', title: 'Intro to Creative Film', day: 'Mon', start: '15:00', end: '17:00', credits: 2, quotaTotal: 30, quotaAvailable: 8, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 25, isBridge: false },
  { crn: '54101', code: 'EE4211', title: 'Computer Vision', day: 'Tue', start: '16:00', end: '19:00', credits: 3, quotaTotal: 30, quotaAvailable: 9, requiredMajor: null, prereqs: [], category: 'stem', examPct: 35, courseworkPct: 65, groupPct: 20, isBridge: false, syllabusPdf: './syllabi/EE4211.pdf' },
  { crn: '54102', code: 'EE4213', title: 'Human-Computer Interaction', day: 'Thu', start: '14:00', end: '17:00', credits: 3, quotaTotal: 30, quotaAvailable: 10, requiredMajor: null, prereqs: [], category: 'stem', examPct: 30, courseworkPct: 70, groupPct: 30, isBridge: false, syllabusPdf: './syllabi/EE4213.pdf' },
  { crn: '54103', code: 'EE4221', title: 'Cloud Computing Systems', day: 'Mon', start: '17:00', end: '20:00', credits: 3, quotaTotal: 30, quotaAvailable: 7, requiredMajor: null, prereqs: [], category: 'stem', examPct: 50, courseworkPct: 50, groupPct: 25, isBridge: false, syllabusPdf: './syllabi/EE4221.pdf' },
  { crn: '11974', code: 'GE2108', title: 'Literature in Our Lives', day: 'Thu', start: '15:00', end: '17:50', credits: 3, quotaTotal: 80, quotaAvailable: 5, requiredMajor: null, prereqs: [], category: 'ge', examPct: 40, courseworkPct: 60, groupPct: 20, isBridge: false, syllabusPdf: './syllabi/GE2108.pdf' },
  { crn: '10598', code: 'GE1205', title: 'Green Economics', day: 'Thu', start: '09:00', end: '11:50', credits: 3, quotaTotal: 120, quotaAvailable: 4, requiredMajor: null, prereqs: [], category: 'ge', examPct: 40, courseworkPct: 60, groupPct: 20, isBridge: false, syllabusPdf: './syllabi/GE1205.pdf' },
  { crn: '15053', code: 'GE1218', title: 'Social Entrepreneurship and Innovation', day: 'Tue', start: '16:00', end: '18:50', credits: 3, quotaTotal: 65, quotaAvailable: 4, requiredMajor: null, prereqs: [], category: 'ge', examPct: 30, courseworkPct: 70, groupPct: 25, isBridge: false, syllabusPdf: './syllabi/GE1218.pdf' },
  { crn: '13118', code: 'GE3207', title: 'Comparing Capitalisms in East Asia and the West', day: 'Wed', start: '12:00', end: '14:50', credits: 3, quotaTotal: 65, quotaAvailable: 2, requiredMajor: null, prereqs: [], category: 'ge', examPct: 50, courseworkPct: 50, groupPct: 20, isBridge: false, syllabusPdf: './syllabi/GE3207.pdf' },
  { crn: '14063', code: 'GE2336', title: 'Systems Thinking to Understanding Phenomena', day: 'Tue', start: '09:00', end: '11:50', credits: 3, quotaTotal: 110, quotaAvailable: 4, requiredMajor: null, prereqs: [], category: 'ge', examPct: 40, courseworkPct: 60, groupPct: 20, isBridge: false, syllabusPdf: './syllabi/GE2336.pdf' },
  {
    crn: '13147',
    code: 'GE2309',
    title: 'The World of NANO: The Next Big Thing Is Really Small',
    day: 'Tue',
    start: '12:00',
    end: '14:50',
    credits: 3,
    quotaTotal: 70,
    quotaAvailable: 15,
    requiredMajor: null,
    prereqs: [],
    category: 'ge',
    examPct: 35,
    courseworkPct: 65,
    groupPct: 20,
    isBridge: false,
    syllabusPdf: './syllabi/GE2309.pdf',
    syllabusYear: '2026/27',
    lectureSection: 'C01',
    tutorialOptions: [
      { section: 'T01', type: 'Tutorial', crn: '13148', day: 'Wed', start: '15:00', end: '15:50', quotaAvailable: 15, quotaTotal: 70 }
    ]
  },
  { crn: '10030', code: 'EE3210', title: 'Signals and Systems', day: 'Thu', start: '16:00', end: '18:50', credits: 3, quotaTotal: 180, quotaAvailable: 45, requiredMajor: 'CDE', prereqs: ['EE1002'], category: 'stem', examPct: 60, courseworkPct: 40, groupPct: 20, isBridge: false, syllabusPdf: './syllabi/EE3210.pdf' },
  {
    crn: '10293',
    code: 'CS3103',
    title: 'Operating Systems',
    day: 'Thu',
    start: '12:00',
    end: '14:50',
    credits: 3,
    quotaTotal: 94,
    quotaAvailable: 16,
    requiredMajor: 'CDE',
    prereqs: ['CS2115'],
    category: 'stem',
    examPct: 55,
    courseworkPct: 45,
    groupPct: 20,
    isBridge: false,
    syllabusPdf: './syllabi/CS3103.pdf',
    syllabusYear: '2025/26',
    lectureSection: 'C01',
    tutorialOptions: [
      { section: 'T02', type: 'Tutorial', crn: '10294', day: 'Fri', start: '15:00', end: '15:50', quotaAvailable: 17, quotaTotal: 47 },
      { section: 'T03', type: 'Tutorial', crn: '11259', day: 'Fri', start: '12:00', end: '12:50', quotaAvailable: 0, quotaTotal: 48 }
    ]
  },
  { crn: '10967', code: 'GE1105', title: 'Chinese Music Appreciation', day: 'Thu', start: '09:00', end: '11:50', credits: 3, quotaTotal: 120, quotaAvailable: 0, requiredMajor: null, prereqs: [], category: 'ge', examPct: 0, courseworkPct: 100, groupPct: 20, isBridge: false },
  { crn: '12003', code: 'BME3121', title: 'Biomedical Signals and Systems', day: 'Thu', start: '09:00', end: '11:50', credits: 3, quotaTotal: 86, quotaAvailable: 28, requiredMajor: 'Biomedical Engineering', prereqs: ['BME2123', 'BME2036'], category: 'stem', examPct: 60, courseworkPct: 40, groupPct: 15, isBridge: false },
  { crn: '15432', code: 'GE2312', title: 'Science, Technology and Society', day: 'Sat', start: '10:00', end: '12:50', credits: 3, quotaTotal: 80, quotaAvailable: 18, requiredMajor: null, prereqs: [], category: 'ge', examPct: 40, courseworkPct: 60, groupPct: 20, isBridge: false },
  { crn: '15433', code: 'EE3315', title: 'Electrical Engineering Topics', day: 'Sat', start: '09:00', end: '11:50', credits: 3, quotaTotal: 60, quotaAvailable: 12, requiredMajor: 'CDE', prereqs: [], category: 'stem', examPct: 50, courseworkPct: 50, groupPct: 15, isBridge: false, syllabusPdf: './syllabi/EE3315.pdf', syllabusYear: '2025/26' },
  // --- Added MA2001 + Core EE & CS Courses (2026/27 Official Syllabi) ---
  { crn: '10412', code: 'MA2001', title: 'Multi-variable Calculus and Linear Algebra', day: 'Mon', start: '09:00', end: '11:50', credits: 3, quotaTotal: 150, quotaAvailable: 18, requiredMajor: null, prereqs: ['MA1201'], category: 'stem', examPct: 60, courseworkPct: 40, groupPct: 0, isBridge: false, syllabusPdf: './syllabi/MA2001.pdf', syllabusYear: '2025/26' },
  { crn: '10029', code: 'EE3008', title: 'Principles of Communications', day: 'Thu', start: '09:00', end: '11:50', credits: 3, quotaTotal: 122, quotaAvailable: 11, requiredMajor: 'CDE', prereqs: ['MA2001', 'EE3210'], category: 'stem', examPct: 60, courseworkPct: 40, groupPct: 15, isBridge: false, syllabusPdf: './syllabi/EE3008.pdf', syllabusYear: '2026/27' },
  { crn: '10488', code: 'EE3009', title: 'Data Communications and Networking', day: 'Fri', start: '09:00', end: '11:50', credits: 3, quotaTotal: 95, quotaAvailable: 14, requiredMajor: 'CDE', prereqs: ['EE2004'], category: 'stem', examPct: 50, courseworkPct: 50, groupPct: 20, isBridge: false, syllabusPdf: './syllabi/EE3009.pdf', syllabusYear: '2026/27' },
  { crn: '10024', code: 'CS3201', title: 'Computer Networks', day: 'Fri', start: '12:00', end: '14:50', credits: 3, quotaTotal: 269, quotaAvailable: 7, requiredMajor: 'CS', prereqs: ['CS3334'], category: 'stem', examPct: 50, courseworkPct: 50, groupPct: 20, isBridge: false, syllabusPdf: './syllabi/CS3201.pdf', syllabusYear: '2025/26' },
  { crn: '10771', code: 'CS4487', title: 'Machine Learning', day: 'Wed', start: '18:30', end: '21:20', credits: 3, quotaTotal: 111, quotaAvailable: 31, requiredMajor: null, prereqs: ['MA2001', 'CS3334'], category: 'stem', examPct: 40, courseworkPct: 60, groupPct: 25, isBridge: false, syllabusPdf: './syllabi/CS4487.pdf', syllabusYear: '2025/26' },
  { crn: '10655', code: 'CS3402', title: 'Database Systems', day: 'Tue', start: '12:00', end: '14:50', credits: 3, quotaTotal: 120, quotaAvailable: 9, requiredMajor: null, prereqs: ['CS3334'], category: 'stem', examPct: 50, courseworkPct: 50, groupPct: 25, isBridge: false, syllabusPdf: './syllabi/CS3402.pdf', syllabusYear: '2025/26' }
];

export const blogPosts: BlogPost[] = [
  {
    id: 'post-1',
    title: 'Placement + CS3334: What My Week Actually Looked Like',
    subtitle: 'Spoiler: Saturday mornings were sacred during Weeks 11-12',
    author: "Mei L. '27",
    initials: 'ML',
    date: 'October 4, 2026',
    verificationStatus: 'verified',
    avatarUrl: './avatars/mei.svg',
    readTime: '4 min read',
    helpfulCount: 18,
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
    verificationStatus: 'verified',
    avatarUrl: './avatars/chloe.svg',
    readTime: '3 min read',
    helpfulCount: 24,
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
    verificationStatus: 'verified',
    avatarUrl: './avatars/john.svg',
    readTime: '4 min read',
    helpfulCount: 15,
    commentCount: 1,
    authorMeta: 'Sem A 2025/26 · Advanced Standing II EE · Transfer Pathway · ~15h/wk · Final Grade: A',
    aboutAuthor: 'Major: Electronic & Computer Engineering · Entry: Direct-Entry Year 3 Transfer',
    summary: 'If you are an Advanced Standing transfer student, check Direct-Entry Core courses (EE1002, CS2201) early and verify prerequisite chains before dropping foundation seats.',
    body: [
      'Entering as a direct-entry transfer student meant balancing Year 1 foundation bridge courses alongside Year 2/3 major requirements.',
      'Never drop CS1302 blindly on AIMS if you plan to take CS2115 or CS2201, because both enforce CS1302 as a strict prerequisite in the validation engine.',
      'Use the "Direct-Entry Core (2)" toggle in the timetable dock to isolate EE1002 and CS2201 and verify non-clashing afternoon slots.'
    ],
    comments: [
      { user: "Kevin W. '28", text: 'The prerequisite tree in the Course Inspector makes the CS1302 -> CS2201 -> CS3334 chain super clear.' }
    ],
    tags: ['transfer', 'stem'],
    courseCode: 'CS1302'
  },
  {
    id: 'post-4',
    title: 'Beware of the 2-Credit Drop Trap: GE1305, GE1203 and the 12.0-Credit Full-Time Minimum Load',
    subtitle: 'Why swapping a 3-credit GE for a 2-credit elective triggers a minimum credit load alert',
    author: "Kevin W. '28",
    initials: 'KW',
    date: 'September 18, 2026',
    verificationStatus: 'pending',
    avatarUrl: './avatars/kevin.svg',
    readTime: '2 min read',
    helpfulCount: 31,
    commentCount: 4,
    authorMeta: 'Sem B 2025/26 · Year 2 Mechanical · Full-Time Student · ~4h/wk · Final Grade: B+',
    aboutAuthor: 'Major: Mechanical Engineering · Status: Non-local Full-Time Student (12.0 CR minimum)',
    summary: 'GE1305 and GE1203 are only 2.0 credits! If you hold a 12.0-credit baseline and swap a 3.0-credit course for a 2.0-credit course, your load drops to 11.0 CR.',
    body: [
      'Many students see GE1305 (Music & Contemporary Life) or GE1203 (Intro to Creative Film) with open seats and 100% coursework and try to swap out a 3-credit GE for them.',
      'If you are sitting at the 12.0-credit baseline (4 courses x 3.0 CR), swapping a 3-credit course for a 2-credit course drops your total to 11.0 credits — violating the 12.0-credit full-time minimum load requirement.',
      'Always stage the swap in the rehearsal sandbox first so the live credit pill and full-time minimum load guard catch the 11.0 CR drop before you touch AIMS.'
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
    verificationStatus: 'verified',
    avatarUrl: './avatars/jordan.svg',
    readTime: '3 min read',
    helpfulCount: 12,
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
  },
  {
    id: 'post-6',
    title: 'What Changed After Our First HCI Prototype Review',
    subtitle: 'A quick think-aloud pass helped us simplify the course-planning flow.',
    author: "Elena C. '27",
    initials: 'EC',
    date: 'October 20, 2026',
    verificationStatus: 'verified',
    avatarUrl: './avatars/alex.svg',
    readTime: '3 min read',
    helpfulCount: 19,
    commentCount: 1,
    authorMeta: 'Sem A 2026/27 · Year 3 CDE · No placement · ~9h/wk',
    aboutAuthor: 'Major: Computer and Data Engineering · Focus: interaction design and interface prototyping',
    summary: 'Our first prototype put too many actions on one screen. A short think-aloud review helped us make the next step easier to spot.',
    body: [
      'In EE4213, our team tested an early course-planning prototype with a short think-aloud session. People hesitated when the main action and the course details competed for attention.',
      'We simplified the screen and made the selected course state clearer. The change did not make the project smaller, but it made the next step easier to explain.'
    ],
    comments: [
      { user: "Ken W. '28", text: 'Did you keep the syllabus link visible after simplifying the layout?' }
    ],
    tags: ['stem', 'workload'],
    courseCode: 'EE4213'
  },
  {
    id: 'post-7',
    title: 'Planning the Weekly Work for Computer Vision',
    subtitle: 'Small, regular review sessions worked better than leaving everything for the project deadline.',
    author: "Daniel W. '27",
    initials: 'DW',
    date: 'October 16, 2026',
    verificationStatus: 'verified',
    avatarUrl: './avatars/priya.svg',
    readTime: '3 min read',
    helpfulCount: 14,
    commentCount: 1,
    authorMeta: 'Sem A 2026/27 · Year 4 CDE · Part-time research assistant · ~11h/wk',
    aboutAuthor: 'Major: Computer and Data Engineering · Focus: image analysis and applied machine learning',
    summary: 'I reserved time each week to review lecture material and test the computer-vision methods on small examples.',
    body: [
      'EE4211 felt more manageable when I reviewed each topic shortly after class instead of waiting until the project deadline. Testing a method on a small image helped me catch gaps in my understanding.',
      'My research shifts changed week to week, so I kept the study blocks flexible and checked the assessment schedule before agreeing to extra lab hours.'
    ],
    comments: [
      { user: "Mira T. '28", text: 'Were the weekly review blocks enough during project weeks?' }
    ],
    tags: ['stem', 'workload'],
    courseCode: 'EE4211'
  },
  {
    id: 'post-8',
    title: 'Keeping Up with MA2001 Alongside Other Core Courses',
    subtitle: 'Short problem-solving sessions made it easier to spot topics I needed to revisit.',
    author: "Amina R. '28",
    initials: 'AR',
    date: 'October 12, 2026',
    verificationStatus: 'pending',
    avatarUrl: './avatars/ryan.svg',
    readTime: '2 min read',
    helpfulCount: 22,
    commentCount: 1,
    authorMeta: 'Sem A 2026/27 · Year 2 CDE · Peer tutor · ~12h/wk',
    aboutAuthor: 'Major: Computer and Data Engineering · Focus: calculus, linear algebra, and peer support',
    summary: 'I split revision into shorter sessions and noted which problem types needed another pass before the next class.',
    body: [
      'For MA2001, I found it useful to work through a few problems after each class and keep a list of the steps that still felt unclear.',
      'Peer-tutoring hours made my week busier, so I planned study blocks ahead of time and used them to revisit the harder examples rather than reread everything.'
    ],
    comments: [
      { user: "Liam S. '29", text: 'Did you find it easier to review calculus or linear algebra in short sessions?' }
    ],
    tags: ['stem', 'workload'],
    courseCode: 'MA2001'
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

// Programmes accepted for each `requiredMajor` value; unlisted values must match the profile major by substring.
const MAJOR_ELIGIBILITY: Record<string, string[]> = {
  CS: ['Computer Science', 'Computer and Data Engineering'],
  CDE: ['Computer and Data Engineering']
};

function isMajorEligible(requiredMajor: string): boolean {
  const accepted = MAJOR_ELIGIBILITY[requiredMajor] ?? [requiredMajor];
  return accepted.some(m => studentProfile.major.includes(m));
}

export function getResolvedMeetings(
  course: Course,
  selectedSections?: Record<string, { tutorialCrn?: string; labCrn?: string }>
): CourseSectionMeeting[] {
  const meetings: CourseSectionMeeting[] = [
    {
      section: course.lectureSection || 'C01',
      type: 'Lecture',
      crn: course.crn,
      day: course.day,
      start: course.start,
      end: course.end,
      quotaAvailable: course.quotaAvailable,
      quotaTotal: course.quotaTotal,
    }
  ];

  if (course.tutorialOptions && course.tutorialOptions.length > 0) {
    const chosenCrn = selectedSections?.[course.code]?.tutorialCrn;
    const chosen =
      (chosenCrn ? course.tutorialOptions.find(t => t.crn === chosenCrn) : undefined) ||
      course.tutorialOptions.find(t => t.quotaAvailable > 0) ||
      course.tutorialOptions[0];
    if (chosen) meetings.push(chosen);
  }

  if (course.labOptions && course.labOptions.length > 0) {
    const chosenCrn = selectedSections?.[course.code]?.labCrn;
    const chosen =
      (chosenCrn ? course.labOptions.find(l => l.crn === chosenCrn) : undefined) ||
      course.labOptions.find(l => l.quotaAvailable > 0) ||
      course.labOptions[0];
    if (chosen) meetings.push(chosen);
  }

  return meetings;
}

export function validateCourse(
  course: Course,
  enrolledCodes: string[],
  swapOutCode: string | null = null,
  outsideCommitments = false,
  selectedSections?: Record<string, { tutorialCrn?: string; labCrn?: string }>
): ValidationResult {
  const reasons: string[] = [];
  const courseMeetings = getResolvedMeetings(course, selectedSections);

  // 1. Quota check across all resolved meetings (lecture, chosen tutorial, chosen lab)
  for (const m of courseMeetings) {
    if (m.quotaAvailable <= 0) {
      if (m.type === 'Lecture') {
        reasons.push(`Course ${course.code} is full (0/${m.quotaTotal} seats open).`);
      } else {
        reasons.push(`Section ${course.code} (${m.section} ${m.type}) is full (0/${m.quotaTotal} seats open).`);
      }
    }
  }

  // 2. Prereq check: completed courses and currently enrolled ones (unless marked for drop) both count
  const satisfiedPrereqs = new Set([
    ...studentProfile.completedPrereqs,
    ...enrolledCodes.filter(code => code !== swapOutCode)
  ]);
  for (const req of course.prereqs) {
    if (!satisfiedPrereqs.has(req)) {
      const dropNote = req === swapOutCode ? ' (it is currently marked for drop)' : '';
      reasons.push(`Unmet Prerequisite: ${req} is required before enrolling in ${course.code}${dropNote}.`);
    }
  }

  // 3. Major restriction
  if (course.requiredMajor && !isMajorEligible(course.requiredMajor)) {
    reasons.push(`Major Restriction: Restricted to ${course.requiredMajor} majors only.`);
  }

  // 4. Time clash check against currently enrolled courses (excluding the one being swapped out)
  const activeEnrolled = enrolledCodes
    .filter(code => code !== swapOutCode)
    .map(code => masterSchedule.find(c => c.code === code))
    .filter(Boolean) as Course[];

  for (const cM of courseMeetings) {
    const cStart = parseMinutes(cM.start);
    const cEnd = parseMinutes(cM.end);

    for (const enr of activeEnrolled) {
      const enrMeetings = getResolvedMeetings(enr, selectedSections);
      for (const eM of enrMeetings) {
        if (eM.day === cM.day) {
          const eStart = parseMinutes(eM.start);
          const eEnd = parseMinutes(eM.end);
          if (Math.max(cStart, eStart) < Math.min(cEnd, eEnd)) {
            const cLabel = courseMeetings.length > 1 ? `${course.code} (${cM.section} ${cM.type})` : course.code;
            const eLabel = enrMeetings.length > 1 ? `${enr.code} (${eM.section} ${eM.type})` : enr.code;
            reasons.push(`Schedule Conflict: ${cLabel} clashes with enrolled course ${eLabel} (${cM.day} ${cM.start}-${cM.end}).`);
          }
        }
      }
    }

    // 5. Personal time block check: Mon & Thu 09:00 - 13:00
    if (outsideCommitments) {
      if (cM.day === 'Mon' || cM.day === 'Thu') {
        const pStart = 9 * 60;
        const pEnd = 13 * 60;
        if (Math.max(cStart, pStart) < Math.min(cEnd, pEnd)) {
          const cLabel = courseMeetings.length > 1 ? `${course.code} (${cM.section} ${cM.type})` : course.code;
          reasons.push(`Personal Block Conflict: ${cLabel} overlaps with your blocked personal time (${cM.day} 09:00-13:00).`);
        }
      }
    }
  }

  return {
    ok: reasons.length === 0,
    reasons
  };
}
