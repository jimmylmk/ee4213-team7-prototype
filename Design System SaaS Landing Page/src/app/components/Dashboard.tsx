import { useState, useMemo, useEffect, useRef, type CSSProperties, type DragEvent } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Calendar,
  Search,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  X,
  ArrowLeft,
  ChevronDown,
  Clock,
  Pencil,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  FileText,
  CircleHelp
} from "lucide-react";
import {
  masterSchedule,
  blogPosts,
  studentProfile,
  validateCourse,
  getResolvedMeetings,
  parseMinutes,
  Course,
  CourseSectionMeeting,
  BlogPost
} from "../data/courseData";
import { BrandMark } from "./Header";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SyllabusDrawer } from "./SyllabusDrawer";
import { AnimatedOverlay } from "./AnimatedOverlay";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import { scrollIntoViewWithMotion } from "../utils/motion";

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const GRID_START_MINUTES = 8 * 60;
const GRID_END_MINUTES = 23 * 60;
const PIXELS_PER_HOUR = 44;
const MIN_EVENT_HEIGHT = 38;
const GRID_HEIGHT = (GRID_END_MINUTES - GRID_START_MINUTES) / 60 * PIXELS_PER_HOUR;
type CreditPolicy = 'standard' | 'overload' | 'final_sem';

const CREDIT_POLICY_LIMITS: Record<CreditPolicy, { minCredits: number; maxCredits: number }> = {
  standard: { minCredits: 12, maxCredits: 18 },
  overload: { minCredits: 12, maxCredits: 21 },
  final_sem: { minCredits: 3, maxCredits: 18 }
};

type DashboardTab = 'rehearsal' | 'inspector' | 'blogs';

const TABS: { id: DashboardTab; label: string; icon: typeof Calendar }[] = [
  { id: 'rehearsal', label: 'Rehearsal Timetable', icon: Calendar },
  { id: 'inspector', label: 'Course Inspector', icon: BookOpen },
  { id: 'blogs', label: 'CityU Blogs', icon: MessageSquare }
];

const parseTab = (view: string | null): DashboardTab =>
  view === 'inspector' ? 'inspector' : view === 'blogs' ? 'blogs' : 'rehearsal';

// One entry in a day column of the weekly grid; `clashes` lists the other entries it visibly overlaps
interface TimetableEvent {
  key: string;
  kind: 'enrolled' | 'staged' | 'personalBlock';
  course?: Course;
  label: string;
  section: string;
  meetingType: 'Lecture' | 'Tutorial' | 'Lab';
  meetingCrn: string;
  startStr: string;
  endStr: string;
  start: number;
  end: number;
  clashes: string[];
  lane: number;
  laneCount: number;
  personalBlock?: ActivePersonalBlock;
  stagedOverlap?: boolean;
}

interface DragPreviewMeeting {
  meeting: CourseSectionMeeting;
  reason: string | null;
  warnings: string[];
}

interface PersonalCommitment {
  id: string;
  label: string;
  category: 'Internship' | 'Part-time work' | 'Hackathon / project' | 'Personal';
  days: Array<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'>;
  startHour: number;
  endHour: number;
  enabled: boolean;
}

interface ActivePersonalBlock {
  id: string;
  commitmentId: string;
  day: PersonalCommitment['days'][number];
  startHour: number;
  endHour: number;
  label: string;
  category: PersonalCommitment['category'];
}

const COMMITMENT_DAYS: PersonalCommitment['days'] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_COMMITMENTS: PersonalCommitment[] = [
  { id: 'pc-1', label: 'Part-time internship shift', category: 'Internship', days: ['Thu'], startHour: 14, endHour: 16, enabled: true },
  { id: 'pc-2', label: 'Independent study & commute', category: 'Personal', days: ['Mon'], startHour: 10, endHour: 12, enabled: true }
];

const formatHour = (hour: number) => `${String(Math.floor(hour)).padStart(2, '0')}:${hour % 1 ? '30' : '00'}`;

const courseDescriptions: Record<string, string> = {
  'EE4213': 'Direct manipulation interfaces, heuristic evaluation, Norman design models, cognitive affordances, and user-centered interface architecture.',
  'CS3334': 'Fundamental algorithms, tree structures, graph analysis, and sorting techniques.',
  'EE2000': 'Foundational circuits, system response, signal processing primitives, and laboratory analysis.',
  'CS1302': 'Structured algorithmic programming, memory concepts, dynamic data structures, and computational thinking in modern software.',
  'GE1501': 'Interdisciplinary university transitions, critical societal inquiry, ethics in technology, and academic leadership.',
  'GE1109': 'Cross-cultural comparative frameworks, artistic identity, contemporary societies, and global interaction patterns.',
  'GE1907': 'Architectural urbanization, spatial development, heritage preservation, and studio design inquiries across East Asian metropolises.'
};

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = parseTab(searchParams.get('view'));

  // Navigation: the URL is the source of truth, so Back/Forward always lands on the matching view
  const [activeTab, setActiveTab] = useState<DashboardTab>(urlTab);
  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  // Blog reader: which post is expanded
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [blogSearchQuery, setBlogSearchQuery] = useState('');
  const [blogFilter, setBlogFilter] = useState<'all' | 'stem' | 'ge' | 'workload' | 'transfer'>('all');
  const [blogVerificationFilter, setBlogVerificationFilter] = useState<'all' | BlogPost['verificationStatus']>('all');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [helpfulPostIds, setHelpfulPostIds] = useState<string[]>([]);
  const [shareExperienceOpen, setShareExperienceOpen] = useState(false);
  const [shareCourseCode, setShareCourseCode] = useState('');
  const [shareTitle, setShareTitle] = useState('');
  const [shareSubtitle, setShareSubtitle] = useState('');
  const [shareCategory, setShareCategory] = useState<'stem' | 'ge' | 'workload' | 'transfer'>('stem');
  const [shareContext, setShareContext] = useState('');
  const [shareBody, setShareBody] = useState('');
  const activeBlogPost = posts.find(post => post.id === openPostId);
  const activeBlogCourseCode = activeBlogPost?.courseCode;
  const activeBlogCourse = masterSchedule.find(course => course.code === activeBlogCourseCode);
  const toggleHelpfulPost = (postId: string) => {
    setHelpfulPostIds(current => current.includes(postId)
      ? current.filter(id => id !== postId)
      : [...current, postId]
    );
  };
  const helpfulCountFor = (post: BlogPost) =>
    (post.helpfulCount ?? 0) + (helpfulPostIds.includes(post.id) ? 1 : 0);
  const normalizedBlogQuery = blogSearchQuery.trim().toLowerCase();
  const filteredBlogPosts = posts.filter(post => {
    const matchesCategory = blogFilter === 'all' || post.tags.includes(blogFilter);
    const matchesVerification = blogVerificationFilter === 'all' || post.verificationStatus === blogVerificationFilter;
    const searchableText = [post.courseCode, post.title, post.subtitle, post.author]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return matchesCategory && matchesVerification && (!normalizedBlogQuery || searchableText.includes(normalizedBlogQuery));
  });

  // Simulation State
  const [enrolled, setEnrolled] = useState<string[]>([...studentProfile.baselineEnrolled]);
  const [swapOutId, setSwapOutId] = useState<string | null>(null);
  const [selectedReplacements, setSelectedReplacementsState] = useState<string[]>([]);
  // Keep the draft current between batched actions so rapid additions cannot bypass the ceiling.
  const selectedReplacementsRef = useRef<string[]>([]);
  const setSelectedReplacements = (update: string[] | ((current: string[]) => string[])) => {
    const next = typeof update === 'function' ? update(selectedReplacementsRef.current) : update;
    selectedReplacementsRef.current = next;
    setSelectedReplacementsState(next);
  };
  const [selectedSections, setSelectedSections] = useState<Record<string, { tutorialCrn?: string; labCrn?: string }>>({});
  const [creditPolicy, setCreditPolicy] = useState<CreditPolicy>('standard');
  const [hoveredCourseCode, setHoveredCourseCode] = useState<string | null>(null);
  const [blockPersonalTime, setBlockPersonalTime] = useState(true);
  const [personalCommitments, setPersonalCommitments] = useState<PersonalCommitment[]>(() => DEFAULT_COMMITMENTS.map(commitment => ({ ...commitment, days: [...commitment.days] })));
  const [showCommitmentManager, setShowCommitmentManager] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState<PersonalCommitment['category']>('Internship');
  const [newDays, setNewDays] = useState<PersonalCommitment['days']>([]);
  const [newStartHour, setNewStartHour] = useState(9);
  const [newEndHour, setNewEndHour] = useState(10);
  const [editingCommitmentId, setEditingCommitmentId] = useState<string | null>(null);
  const [editingCommitmentDay, setEditingCommitmentDay] = useState<PersonalCommitment['days'][number] | null>(null);
  const [draggedCourseCode, setDraggedCourseCode] = useState<string | null>(null);
  const [draggedStagedCode, setDraggedStagedCode] = useState<string | null>(null);
  const [draggedPersonalBlock, setDraggedPersonalBlock] = useState<ActivePersonalBlock | null>(null);
  const [personalDragOffset, setPersonalDragOffset] = useState(0);
  const [personalDropPreview, setPersonalDropPreview] = useState<{ day: PersonalCommitment['days'][number]; startHour: number } | null>(null);
  const [highlightBridge, setHighlightBridge] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ge' | 'stem' | 'coursework' | 'open' | 'noclash'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Course Inspector State
  const [inspectorCourseCode, setInspectorCourseCode] = useState<string | null>(null);
  const [inspectorSearchQuery, setInspectorSearchQuery] = useState<string>('');
  const [inspectorDropdownOpen, setInspectorDropdownOpen] = useState<boolean>(false);
  const inspectorComboRef = useRef<HTMLDivElement>(null);
  const inspectorInputRef = useRef<HTMLInputElement>(null);
  const [syllabusDrawerOpen, setSyllabusDrawerOpen] = useState(false);

  const keepDrawerOpenRef = useRef(false);

  useEffect(() => {
    if (keepDrawerOpenRef.current) {
      keepDrawerOpenRef.current = false;
      return;
    }
    setSyllabusDrawerOpen(false);
  }, [inspectorCourseCode]);

  useEffect(() => {
    setInspectorSearchQuery('');
    setInspectorDropdownOpen(false);
  }, [inspectorCourseCode]);

  // Click outside and Esc key handler for Course Inspector combobox
  useEffect(() => {
    if (!inspectorDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (inspectorComboRef.current && !inspectorComboRef.current.contains(e.target as Node)) {
        setInspectorDropdownOpen(false);
        setInspectorSearchQuery('');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setInspectorDropdownOpen(false);
        setInspectorSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [inspectorDropdownOpen]);

  // Control Gate Modal State
  const [controlGateOpen, setControlGateOpen] = useState(false);
  const [handoffStep1, setHandoffStep1] = useState(false);
  const [handoffStep2, setHandoffStep2] = useState(false);
  const [handoffStep3, setHandoffStep3] = useState(false);
  const [personalOverlapAcknowledged, setPersonalOverlapAcknowledged] = useState(false);
  const [swapConfirmed, setSwapConfirmed] = useState(false);

  // Search input ref for '/' shortcut
  const searchInputRef = useRef<HTMLInputElement>(null);
  const controlGateRef = useRef<HTMLDivElement>(null);
  const commitmentManagerRef = useRef<HTMLDivElement>(null);
  const commitmentTitleRef = useRef<HTMLInputElement>(null);
  const shareExperienceRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [navHistory, setNavHistory] = useState<Array<{ tab: typeof activeTab; postId: string | null }>>([]);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Closing the gate always clears the attestation checklist so ticks never carry over to a different swap
  const closeControlGate = () => {
    setControlGateOpen(false);
    setHandoffStep1(false);
    setHandoffStep2(false);
    setHandoffStep3(false);
    setPersonalOverlapAcknowledged(false);
  };

  useEffect(() => {
    if (!profileMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileMenuOpen(false);
    };
    const handleProfileEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleProfileEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleProfileEscape);
    };
  }, [profileMenuOpen]);

  // Keyboard Accelerators
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (helpOpen) return;
      if (syllabusDrawerOpen && activeTab === 'inspector') return;
      const target = e.target as HTMLElement;
      // The search box only exists on the Timetable view, and must not steal focus from the open modal
      if (e.key === '/' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'SELECT') {
        if (activeTab !== 'rehearsal' || controlGateOpen || showCommitmentManager) return;
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'Escape') {
        if (shareExperienceOpen) {
          setShareExperienceOpen(false);
        } else if (showCommitmentManager) {
          setShowCommitmentManager(false);
        } else if (controlGateOpen) {
          closeControlGate();
        } else if (selectedReplacements.length) {
          setSelectedReplacements([]);
        } else if (searchQuery) {
          setSearchQuery('');
          searchInputRef.current?.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, controlGateOpen, showCommitmentManager, selectedReplacements, searchQuery, helpOpen, syllabusDrawerOpen, shareExperienceOpen]);

  useEffect(() => {
    if (showCommitmentManager) commitmentManagerRef.current?.focus();
  }, [showCommitmentManager]);

  useEffect(() => {
    if (showCommitmentManager && editingCommitmentId) commitmentTitleRef.current?.focus();
  }, [showCommitmentManager, editingCommitmentId, editingCommitmentDay]);

  useEffect(() => {
    if (shareExperienceOpen) shareExperienceRef.current?.focus();
  }, [shareExperienceOpen]);

  // Move keyboard focus into the dialog when it opens
  useEffect(() => {
    if (controlGateOpen) controlGateRef.current?.focus();
  }, [controlGateOpen]);

  // Scroll the requested blog post into view after the Blogs tab renders
  useEffect(() => {
    if (activeTab === 'blogs' && openPostId) {
      const post = document.getElementById(`blog-post-${openPostId}`);
      if (post) scrollIntoViewWithMotion(post, { block: 'start' });
    }
  }, [activeTab, openPostId]);

  // Tab changes go through the URL (push), and the effect above mirrors them into state
  const changeTab = (nextTab: DashboardTab) => {
    if (activeTab !== nextTab) {
      setNavHistory(history => [...history, { tab: activeTab, postId: openPostId }]);
    }
    setActiveTab(nextTab);
    setSearchParams(nextTab === 'rehearsal' ? {} : { view: nextTab });
  };

  const handleOpenPost = (postId: string) => {
    if (activeTab !== 'blogs' || openPostId !== postId) {
      setNavHistory(history => [...history, { tab: activeTab, postId: openPostId }]);
    }
    setActiveTab('blogs');
    setOpenPostId(postId);
    setSearchParams({ view: 'blogs' });
  };

  const handleStepBack = () => {
    const previous = navHistory[navHistory.length - 1];
    if (previous) {
      setNavHistory(history => history.slice(0, -1));
      setActiveTab(previous.tab);
      setOpenPostId(previous.postId);
      setSearchParams(previous.tab === 'rehearsal' ? {} : { view: previous.tab });
      return;
    }
    if (openPostId !== null) {
      setActiveTab('blogs');
      setOpenPostId(null);
      setSearchParams({ view: 'blogs' });
    }
  };

  // Helper calculations
  const enrolledCourses = useMemo(() => {
    return enrolled.map(code => masterSchedule.find(c => c.code === code)).filter(Boolean) as Course[];
  }, [enrolled]);

  const currentTotalCredits = useMemo(() => {
    return enrolledCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [enrolledCourses]);

  const calculateProjectedCredits = (replacements: string[]) => {
    let creds = currentTotalCredits;
    if (swapOutId) {
      const outCourse = masterSchedule.find(c => c.code === swapOutId);
      if (outCourse) creds -= outCourse.credits;
    }
    for (const code of replacements) {
      const inCourse = masterSchedule.find(c => c.code === code);
      if (inCourse) creds += inCourse.credits;
    }
    return creds;
  };
  const projectedCredits = calculateProjectedCredits(selectedReplacements);
  const activeMinCredits = CREDIT_POLICY_LIMITS[creditPolicy].minCredits;
  const activeMaxCredits = CREDIT_POLICY_LIMITS[creditPolicy].maxCredits;

  // Staged course object
  const stagedCourses = useMemo(
    () => selectedReplacements.flatMap(code => {
      const course = masterSchedule.find(c => c.code === code);
      return course ? [course] : [];
    }), [selectedReplacements]
  );

  const getStageCreditReason = (course: Course, replacements = selectedReplacements) => {
    if (replacements.includes(course.code) || enrolled.includes(course.code)) return null;
    const total = calculateProjectedCredits(replacements) + course.credits;
    if (total <= activeMaxCredits) return null;
    const overloadOption = creditPolicy !== 'overload' && total <= CREDIT_POLICY_LIMITS.overload.maxCredits
      ? ' If approved, you can also select the overload policy.'
      : '';
    return `Adding ${course.code} would raise the draft to ${total.toFixed(1)} CR, above the ${activeMaxCredits.toFixed(1)} CR limit. Remove a staged course or mark an enrolled course for drop.${overloadOption}`;
  };

  const validateDraftCourse = (course: Course, otherCourses = stagedCourses) => {
    const result = validateCourse(course, enrolled, swapOutId, false, selectedSections);
    const reasons = [...result.reasons];
    for (const other of otherCourses.filter(item => item.code !== course.code)) {
      for (const a of getResolvedMeetings(course, selectedSections)) {
        for (const b of getResolvedMeetings(other, selectedSections)) {
          if (a.day === b.day && Math.max(parseMinutes(a.start), parseMinutes(b.start)) < Math.min(parseMinutes(a.end), parseMinutes(b.end))) {
            reasons.push(`Schedule Conflict: ${course.code} (${a.section}) clashes with staged ${other.code} (${b.section}) on ${a.day}.`);
          }
        }
      }
    }
    return { ok: reasons.length === 0, reasons };
  };

  const swapOutCourse = useMemo(() => {
    if (!swapOutId) return null;
    return masterSchedule.find(c => c.code === swapOutId) || null;
  }, [swapOutId]);

  const activePersonalBlocks = useMemo<ActivePersonalBlock[]>(() =>
    blockPersonalTime
      ? personalCommitments.filter(commitment => commitment.enabled).flatMap(commitment =>
          commitment.days.map(day => ({
            id: `${commitment.id}-${day}`,
            commitmentId: commitment.id,
            day,
            startHour: commitment.startHour,
            endHour: commitment.endHour,
            label: commitment.label,
            category: commitment.category
          }))
        )
      : [], [blockPersonalTime, personalCommitments]);

  const getPersonalOverlaps = (course: Course) => {
    const meetings = getResolvedMeetings(course, selectedSections);
    return activePersonalBlocks.filter(block => meetings.some(meeting =>
      meeting.day === block.day &&
      parseMinutes(meeting.start) < block.endHour * 60 &&
      parseMinutes(meeting.end) > block.startHour * 60
    ));
  };
  const personalOverlapMessage = (block: ActivePersonalBlock) =>
    `Overlaps "${block.label}" (${block.day} ${formatHour(block.startHour)}-${formatHour(block.endHour)} · You entered).`;

  const stagedPersonalOverlaps = activePersonalBlocks.filter(block =>
    stagedCourses.some(course => getPersonalOverlaps(course).some(overlap => overlap.id === block.id))
  );
  const overlapKey = `${selectedReplacements.join(',')}|${stagedPersonalOverlaps.map(block => `${block.id}:${block.startHour}:${block.endHour}`).join('|')}`;
  useEffect(() => {
    setPersonalOverlapAcknowledged(false);
  }, [overlapKey]);

  const fatigueWarnings = useMemo(() => DAYS.flatMap(day => {
    const courses = enrolledCourses.filter(course => course.code !== swapOutId);
    courses.push(...stagedCourses);
    const intervals = [
      ...courses.flatMap(course => getResolvedMeetings(course, selectedSections)
        .filter(meeting => meeting.day === day)
        .map(meeting => ({ start: parseMinutes(meeting.start), end: parseMinutes(meeting.end) }))),
      ...activePersonalBlocks.filter(block => block.day === day)
        .map(block => ({ start: block.startHour * 60, end: block.endHour * 60 }))
    ].sort((a, b) => a.start - b.start);
    const merged: { start: number; end: number }[] = [];
    for (const interval of intervals) {
      const last = merged[merged.length - 1];
      if (last && interval.start <= last.end) last.end = Math.max(last.end, interval.end);
      else merged.push({ ...interval });
    }
    return merged.filter(interval => interval.end - interval.start > 6 * 60).map(interval => {
      const formatTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
      return `${day} ${formatTime(interval.start)}-${formatTime(interval.end)}: more than 6 continuous hours of scheduled activity.`;
    });
  }), [enrolledCourses, swapOutId, stagedCourses, selectedSections, activePersonalBlocks]);

  // Conflict detection for active staged course: every failing rule, not just the first
  const activeConflicts = useMemo(() => {
    return stagedCourses.flatMap((course, index) => validateDraftCourse(course, stagedCourses.slice(index + 1)).reasons);
  }, [stagedCourses, enrolled, swapOutId, selectedSections]);

  const wouldBeBelowMin = projectedCredits < activeMinCredits;
  const wouldExceedMax = projectedCredits > activeMaxCredits;
  const hasPendingChange = Boolean(stagedCourses.length || swapOutCourse);

  // Why the Control Gate Confirm button is disabled (empty when it can be pressed once attested)
  const confirmBlockers = useMemo(() => {
    const blockers: string[] = [];
    if (!hasPendingChange) {
      blockers.push('Nothing is staged: pick a course to add and/or a course to drop first.');
    }
    blockers.push(...activeConflicts);
    if (wouldBeBelowMin) {
      blockers.push(
        `Projected load is ${projectedCredits.toFixed(1)} CR, below the ${activeMinCredits.toFixed(1)} CR minimum for the selected credit policy. Stage a replacement course or cancel the drop.`
      );
    }
    if (wouldExceedMax) {
      blockers.push(
        `Projected load is ${projectedCredits.toFixed(1)} CR, above the ${activeMaxCredits.toFixed(1)} CR maximum for the selected credit policy. Reduce the staged load or select a policy that permits it.`
      );
    }
    return blockers;
  }, [hasPendingChange, activeConflicts, wouldBeBelowMin, wouldExceedMax, activeMinCredits, activeMaxCredits, projectedCredits]);

  // The attestation steps depend on the kind of change: add-only has no drop, drop-only has no add
  const needsAddSteps = stagedCourses.length > 0;
  const needsDropStep = Boolean(swapOutCourse);
  const checklistComplete =
    (!needsAddSteps || (handoffStep1 && handoffStep3)) && (!needsDropStep || handoffStep2);
  const canSeeCrns = stagedPersonalOverlaps.length === 0 || personalOverlapAcknowledged;
  const canConfirm = confirmBlockers.length === 0 && checklistComplete && canSeeCrns;

  // Day columns of the weekly grid: every event sorted by start time, with visible overlaps flagged
  const dayEvents = useMemo(() => {
    const result = {} as Record<(typeof DAYS)[number], TimetableEvent[]>;
    for (const day of DAYS) {
      const events: TimetableEvent[] = enrolledCourses.flatMap(course =>
        getResolvedMeetings(course, selectedSections)
          .filter(meeting => meeting.day === day)
          .map(meeting => ({
            key: `enrolled-${course.code}-${meeting.crn}`,
            kind: 'enrolled' as const,
            course,
            label: `${course.code} (${meeting.section} ${meeting.type})`,
            section: meeting.section,
            meetingType: meeting.type,
            meetingCrn: meeting.crn,
            startStr: meeting.start,
            endStr: meeting.end,
            start: parseMinutes(meeting.start),
            end: parseMinutes(meeting.end),
            clashes: [],
            lane: 0,
            laneCount: 1
          }))
      );
      for (const stagedCourse of stagedCourses) {
        events.push(...getResolvedMeetings(stagedCourse, selectedSections)
          .filter(meeting => meeting.day === day)
          .map(meeting => ({
            key: `staged-${stagedCourse.code}-${meeting.crn}`,
            kind: 'staged' as const,
            course: stagedCourse,
            label: `${stagedCourse.code} (${meeting.section} ${meeting.type})`,
            section: meeting.section,
            meetingType: meeting.type,
            meetingCrn: meeting.crn,
            startStr: meeting.start,
            endStr: meeting.end,
            start: parseMinutes(meeting.start),
            end: parseMinutes(meeting.end),
            clashes: [],
            lane: 0,
            laneCount: 1
          }))
        );
      }
      for (const block of activePersonalBlocks.filter(block => block.day === day)) {
        events.push({
          key: block.id,
          kind: 'personalBlock',
          label: block.label,
          section: '',
          meetingType: 'Lecture',
          meetingCrn: '',
          startStr: formatHour(block.startHour),
          endStr: formatHour(block.endHour),
          start: block.startHour * 60,
          end: block.endHour * 60,
          clashes: [],
          lane: 0,
          laneCount: 1,
          personalBlock: block,
          stagedOverlap: stagedPersonalOverlaps.some(overlap => overlap.id === block.id)
        });
      }
      events.sort((a, b) => a.start - b.start || a.end - b.end);
      let laneEnds: number[] = [];
      let group: TimetableEvent[] = [];
      let groupEnd = 0;
      for (const event of events) {
        const start = Math.max(event.start, GRID_START_MINUTES);
        const end = Math.max(Math.min(event.end, GRID_END_MINUTES), start + MIN_EVENT_HEIGHT / PIXELS_PER_HOUR * 60);
        if (group.length && start >= groupEnd) {
          group.forEach(item => { item.laneCount = laneEnds.length; });
          group = [];
          laneEnds = [];
        }
        let lane = laneEnds.findIndex(laneEnd => laneEnd <= start);
        if (lane < 0) lane = laneEnds.length;
        laneEnds[lane] = end;
        event.lane = lane;
        group.push(event);
        groupEnd = Math.max(group.length === 1 ? 0 : groupEnd, end);
      }
      group.forEach(item => { item.laneCount = laneEnds.length; });

      for (const a of events) {
        for (const b of events) {
          if (a === b || Math.max(a.start, b.start) >= Math.min(a.end, b.end)) continue;
          if (a.kind === 'personalBlock' || b.kind === 'personalBlock') continue;
          if (a.course?.code === b.course?.code) continue;
          // A staged course replacing the course marked for drop is not a clash
          const replacesDrop =
            (a.kind === 'staged' && b.course?.code === swapOutId) ||
            (b.kind === 'staged' && a.course?.code === swapOutId);
          if (!replacesDrop && !a.clashes.includes(b.label)) a.clashes.push(b.label);
        }
      }
      result[day] = events;
    }
    return result;
  }, [enrolledCourses, stagedCourses, activePersonalBlocks, swapOutId, selectedSections]);

  const dragPreviewByDay = useMemo(() => {
    const result = Object.fromEntries(DAYS.map(day => [day, []])) as Record<typeof DAYS[number], DragPreviewMeeting[]>;
    if (!draggedCourseCode) return result;

    const candidate = masterSchedule.find(course => course.code === draggedCourseCode);
    if (!candidate) return result;
    const activeEnrolled = [...enrolledCourses.filter(course => course.code !== swapOutId), ...stagedCourses.filter(course => course.code !== candidate.code)];
    const creditCeilingReason = getStageCreditReason(candidate) ? `Exceeds ${activeMaxCredits} CR limit` : null;

    for (const meeting of getResolvedMeetings(candidate, selectedSections)) {
      const reasons: string[] = [];
      if (creditCeilingReason) reasons.push(creditCeilingReason);
      if (meeting.quotaAvailable <= 0) {
        reasons.push(`${meeting.section} is full`);
      }

      for (const course of activeEnrolled) {
        for (const enrolledMeeting of getResolvedMeetings(course, selectedSections)) {
          if (
            meeting.day === enrolledMeeting.day &&
            Math.max(parseMinutes(meeting.start), parseMinutes(enrolledMeeting.start)) <
              Math.min(parseMinutes(meeting.end), parseMinutes(enrolledMeeting.end))
          ) {
            reasons.push(`${course.code} (${enrolledMeeting.section} ${enrolledMeeting.type})`);
          }
        }
      }

      const warnings = activePersonalBlocks.filter(block =>
        block.day === meeting.day &&
        parseMinutes(meeting.start) < block.endHour * 60 &&
        parseMinutes(meeting.end) > block.startHour * 60
      ).map(personalOverlapMessage);

      result[meeting.day].push({
        meeting,
        reason: reasons.length > 0 ? reasons.join(', ') : null,
        warnings
      });
    }

    return result;
  }, [draggedCourseCode, enrolledCourses, stagedCourses, projectedCredits, selectedReplacements, activeMaxCredits, creditPolicy, selectedSections, swapOutId, activePersonalBlocks]);

  // Filtered Catalogue
  const filteredCatalogue = useMemo(() => {
    let list = masterSchedule.filter(c => {
      if (enrolled.includes(c.code)) return false;
      return true;
    });

    if (activeFilter === 'ge') list = list.filter(c => c.category === 'ge');
    else if (activeFilter === 'stem') list = list.filter(c => c.category === 'stem');
    else if (activeFilter === 'coursework') list = list.filter(c => c.examPct === 0);
    else if (activeFilter === 'open') list = list.filter(c => c.quotaAvailable > 0);
    else if (activeFilter === 'noclash') list = list.filter(c => validateDraftCourse(c).ok);

    if (highlightBridge) list = list.filter(c => c.isBridge);

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(c => 
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.crn.includes(q) ||
        c.day.toLowerCase().includes(q)
      );
    }
    return list;
  }, [enrolled, swapOutId, activeFilter, highlightBridge, searchQuery, selectedSections, stagedCourses]);

  // Staging actions
  const handleStageCourse = (code: string) => {
    const course = masterSchedule.find(item => item.code === code);
    if (!course) {
      toast.error(`Course ${code} was not found in the catalogue.`);
      return false;
    }
    if (enrolled.includes(code)) {
      toast.error(`${code} is already enrolled.`);
      return false;
    }
    if (selectedReplacementsRef.current.includes(code)) return true;
    const reason = getStageCreditReason(course, selectedReplacementsRef.current);
    if (reason) {
      toast.error(reason);
      return false;
    }
    setSelectedReplacements(current => current.includes(code) ? current : [...current, code]);
    return true;
  };

  const handleSelectSwapOut = (code: string) => {
    if (swapOutId === code) {
      setSwapOutId(null);
    } else {
      setSwapOutId(code);
    }
  };

  const handleSelectSection = (code: string, type: 'tutorial' | 'lab', crn: string) => {
    setSelectedSections(current => ({
      ...current,
      [code]: {
        ...current[code],
        [type === 'tutorial' ? 'tutorialCrn' : 'labCrn']: crn
      }
    }));
  };

  const handleTimetableDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const courseCode = event.dataTransfer.getData('text/plain') || draggedCourseCode;
    if (!courseCode) return;
    if (handleStageCourse(courseCode)) toast.success(`${courseCode} staged on the timetable`);
    setDraggedCourseCode(null);
  };

  const changePersonalDay = (block: ActivePersonalBlock, changes?: { day: PersonalCommitment['days'][number]; startHour: number; endHour: number }) => {
    if (changes && changes.day === block.day && changes.startHour === block.startHour && changes.endHour === block.endHour) return;
    setPersonalCommitments(current => current.flatMap(commitment => {
      if (commitment.id !== block.commitmentId) return [commitment];
      const remainingDays = commitment.days.filter(day => day !== block.day);
      const remaining = remainingDays.length ? [{ ...commitment, days: remainingDays }] : [];
      if (!changes) return remaining;
      return [...remaining, { ...commitment, id: crypto.randomUUID(), days: [changes.day], startHour: changes.startHour, endHour: changes.endHour }];
    }));
  };

  const editCommitment = (commitment: PersonalCommitment, day: PersonalCommitment['days'][number] | null = null) => {
    setEditingCommitmentId(commitment.id);
    setEditingCommitmentDay(day);
    setNewLabel(commitment.label);
    setNewCategory(commitment.category);
    setNewDays(day ? [day] : [...commitment.days]);
    setNewStartHour(commitment.startHour);
    setNewEndHour(commitment.endHour);
    setShowCommitmentManager(true);
  };

  const renderSectionSelectors = (course: Course, compact = false) => {
    const renderOptions = (type: 'tutorial' | 'lab') => {
      const options = type === 'tutorial' ? course.tutorialOptions : course.labOptions;
      if (!options?.length) return null;

      const selectedCrn = type === 'tutorial'
        ? selectedSections[course.code]?.tutorialCrn || options.find(option => option.quotaAvailable > 0)?.crn || options[0].crn
        : selectedSections[course.code]?.labCrn || options.find(option => option.quotaAvailable > 0)?.crn || options[0].crn;

      return (
        <div key={type} className="space-y-1">
          <span className="block font-mono text-[10px] font-bold uppercase text-muted-foreground">
            {type === 'tutorial' ? 'Tutorial' : 'Lab'} section
          </span>
          <div className="flex flex-wrap gap-1">
            {options.map(option => {
              const isSelected = selectedCrn === option.crn;
              const isFull = option.quotaAvailable <= 0;
              return (
                <button
                  key={option.crn}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleSelectSection(course.code, type, option.crn)}
                  className={`rounded border px-2 py-1 text-left font-mono transition-colors ${
                    compact ? 'text-[10px]' : 'text-[11px]'
                  } ${
                    isSelected
                      ? 'border-[#6c4cff] bg-[#ece9ff] text-[#34266f] font-semibold'
                      : 'border-black/15 bg-white text-[#171717] hover:border-black/35'
                  }`}
                >
                  <span>{option.section} · {option.day} {option.start}–{option.end}</span>
                  <span className={`ml-1 font-semibold ${isFull ? 'text-red-700' : 'text-green-700'}`}>
                    {isFull ? 'FULL' : `${option.quotaAvailable} open`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    };

    if (!course.tutorialOptions?.length && !course.labOptions?.length) return null;
    return (
      <div className={`mt-2 space-y-2 ${compact ? '' : 'border-t border-black/10 pt-3'}`}>
        {renderOptions('tutorial')}
        {renderOptions('lab')}
      </div>
    );
  };

  const getCourseCrnSummary = (course: Course) =>
    getResolvedMeetings(course, selectedSections)
      .map(meeting => `CRN ${meeting.crn} (${meeting.section})`)
      .join(' + ');

  const handleOpenInspector = (code: string) => {
    setInspectorCourseCode(code);
    changeTab('inspector');
  };

  const executeSimulatedSwap = () => {
    // Defensive re-check so no caller can apply a blocked change
    if (confirmBlockers.length > 0) return;
    let newEnrolled = [...enrolled];
    if (swapOutId) {
      newEnrolled = newEnrolled.filter(c => c !== swapOutId);
    }
    newEnrolled.push(...stagedCourses.map(course => course.code));
    setEnrolled(newEnrolled);
    setSwapConfirmed(true);
    setSelectedReplacements([]);
    setSwapOutId(null);
    setHandoffStep1(false);
    setHandoffStep2(false);
    setHandoffStep3(false);
  };

  const resetAll = () => {
    setEnrolled([...studentProfile.baselineEnrolled]);
    setPersonalCommitments(DEFAULT_COMMITMENTS.map(commitment => ({ ...commitment, days: [...commitment.days] })));
    setBlockPersonalTime(true);
    setSwapOutId(null);
    setSelectedReplacements([]);
    setControlGateOpen(false);
    setSwapConfirmed(false);
    setHandoffStep1(false);
    setHandoffStep2(false);
    setHandoffStep3(false);
    setPersonalOverlapAcknowledged(false);
  };

  // Inspector Course Object & Dynamic Diagnostics
  const inspectorCourse = useMemo(() => {
    return masterSchedule.find(c => c.code === inspectorCourseCode) ?? null;
  }, [inspectorCourseCode]);

  const inspectorFilteredCourses = useMemo(() => {
    const q = inspectorSearchQuery.trim().toLowerCase();
    if (!q) return masterSchedule;
    return masterSchedule.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.day.toLowerCase().includes(q) ||
      c.crn.toLowerCase().includes(q)
    );
  }, [inspectorSearchQuery]);

  // Single source of truth: the Inspector verdict comes from the same validateCourse() call the Timetable uses
  const inspectorValidation = useMemo(
    () => inspectorCourse ? validateDraftCourse(inspectorCourse) : null,
    [inspectorCourse, enrolled, swapOutId, selectedSections, stagedCourses]
  );

  const scheduleFitDiagnostics = useMemo(() => {
    if (!inspectorCourse || !inspectorValidation) return null;
    const isEnrolled = enrolled.includes(inspectorCourse.code);
    const isStaged = selectedReplacements.includes(inspectorCourse.code);

    if (isEnrolled) {
      return {
        text: `[STATUS: CURRENTLY ENROLLED · ${inspectorCourse.credits.toFixed(1)} CR]`,
        color: 'text-[#6c4cff] bg-[#ece9ff] border-[#d9ccff]',
        isAlert: false
      };
    }

    if (!inspectorValidation.ok) {
      return {
        text: `[${isStaged ? 'STAGED BUT BLOCKED' : 'CANNOT ADD'}: ${inspectorValidation.reasons.join(' · ')}]`,
        color: 'text-red-700 bg-red-50 border-red-200',
        isAlert: true
      };
    }

    const personalOverlaps = getPersonalOverlaps(inspectorCourse);
    if (personalOverlaps.length > 0) {
      return {
        text: `[PERSONAL TIME OVERLAP: ${personalOverlaps.map(personalOverlapMessage).join(' ')}]`,
        color: 'text-amber-800 bg-amber-50 border-amber-200',
        isAlert: false
      };
    }

    if (isStaged) {
      return {
        text: `[STATUS: STAGED ON TIMETABLE PREVIEW · NO CONFLICTS]`,
        color: 'text-cyan-800 bg-cyan-100 border-cyan-200',
        isAlert: false
      };
    }

    return {
      text: `[SCHEDULE FIT: NO CONFLICTS]`,
      color: 'text-green-800 bg-green-50 border-green-200',
      isAlert: false
    };
  }, [enrolled, selectedReplacements, inspectorCourse, inspectorValidation, activePersonalBlocks, selectedSections]);

  // Workload Hour Segments
  const workloadMetrics = useMemo(() => {
    if (!inspectorCourse) return null;
    const lecH = 2;
    const tutH = 1;
    const labH = inspectorCourse.category === 'stem' ? 2 : 0;
    const projH = inspectorCourse.groupPct >= 25 ? 3 : 2;
    const prepH = inspectorCourse.examPct >= 50 ? 5 : 3;
    const totalH = lecH + tutH + labH + projH + prepH;
    return { lecH, tutH, labH, projH, prepH, totalH };
  }, [inspectorCourse]);

  // Matching blog posts
  const inspectorMatchingBlogs = useMemo(() => {
    if (!inspectorCourse) return [];
    const matching = posts.filter(p => p.courseCode === inspectorCourse.code);
    return matching.length > 0 ? matching : posts.slice(0, 2);
  }, [inspectorCourse, posts]);

  return (
    <div className="min-h-screen bg-[#f5f4ef] font-sans text-[#171717] flex flex-col">
      <Toaster position="bottom-right" />
      {/* Top Application Bar */}
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 md:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="flex shrink-0 items-center gap-2.5 pr-2">
            {(navHistory.length > 0 || openPostId !== null) && (
              <button
                type="button"
                onClick={handleStepBack}
                title="Back to previous view"
                aria-label="Back to previous view"
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-[#f5f4ef] hover:text-[#171717]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <BrandMark />
            <span className="font-semibold text-sm tracking-tight">CityUHK CampuSync</span>
          </div>

          {/* Segmented view switcher */}
          <nav
            aria-label="Simulator views"
            className="relative order-last grid w-full grid-cols-3 gap-1 rounded-xl bg-[#eeece6] p-1 lg:order-none lg:w-auto"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-1 left-1 top-1 rounded-lg bg-[#171717] shadow-sm transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{
                width: 'calc(33.333333% - 5.333333px)',
                transform: `translateX(calc(${TABS.findIndex(tab => tab.id === activeTab) * 100}% + ${TABS.findIndex(tab => tab.id === activeTab) * 4}px))`
              }}
            />
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => changeTab(id)}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`relative flex items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c4cff] ${
                  activeTab === id
                    ? 'text-white'
                    : 'text-[#171717]/70 hover:bg-white hover:text-[#171717]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <Sheet open={helpOpen} onOpenChange={open => {
              setHelpOpen(open);
              if (open) {
                setInspectorDropdownOpen(false);
                setProfileMenuOpen(false);
              }
            }}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  title="How it works"
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#E4E1DA] bg-white px-2.5 text-xs font-semibold text-[#18181B] transition-colors hover:bg-[#f8f7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
                >
                  <CircleHelp className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">How it works</span>
                </button>
              </SheetTrigger>
              <SheetContent
                onEscapeKeyDown={event => event.stopPropagation()}
                className="w-full max-w-[min(100vw,28rem)] gap-0 overflow-y-auto border-[#E4E1DA] bg-[#F7F5F0] sm:max-w-md data-[state=open]:duration-200 data-[state=closed]:duration-150 motion-reduce:!animate-none motion-reduce:!transition-none"
              >
                <SheetHeader className="border-b border-[#E4E1DA] px-6 pb-5 pt-8 pr-12 text-left">
                  <SheetTitle className="text-xl font-bold tracking-tight text-[#18181B]">How CityUHK CampuSync works</SheetTitle>
                  <SheetDescription className="text-sm leading-relaxed text-[#52525B]">
                    A quick guide to exploring courses and rehearsing a schedule.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-5 px-6 py-6">
                  <div className="rounded-xl border border-[#d1e5a0] bg-[#eff8d7] p-4 text-[#18181B]">
                    <p className="text-sm font-semibold">This is a simulation</p>
                    <p className="mt-1 text-xs leading-relaxed">
                      CityUHK CampuSync does not change your AIMS registration. Check live course information and register separately in AIMS.
                    </p>
                    <p className="mt-2 text-xs leading-relaxed">
                      Your draft, personal time and blog contributions are temporary and are lost when you reload or leave the app.
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xs font-semibold text-[#52525B]">Find an answer</h3>
                    <Accordion type="multiple" className="overflow-hidden rounded-xl border border-[#E4E1DA] bg-white motion-reduce:[&_svg]:transition-none">
                      <AccordionItem value="swap" className="border-[#E4E1DA] px-4">
                        <AccordionTrigger className="py-4 font-semibold text-[#18181B] hover:no-underline focus-visible:ring-[#18181B]/50 motion-reduce:transition-none">
                          How do I try a course swap?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-[#52525B]">
                          Select an enrolled course to mark it for drop, then stage one or more courses from the catalogue. Review the whole draft together. To remove a staged course, use its remove button or drag it to the removal area.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="warnings" className="border-[#E4E1DA] px-4">
                        <AccordionTrigger className="py-4 font-semibold text-[#18181B] hover:no-underline focus-visible:ring-[#18181B]/50 motion-reduce:transition-none">
                          What do the warnings mean?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-[#52525B]">
                          Courses that exceed your selected credit maximum cannot be staged. Academic clashes, unavailable seats, missing prerequisites and credit limits can prevent confirmation. Personal time overlaps are warnings, so you can decide whether to proceed.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="personal-time" className="border-[#E4E1DA] px-4">
                        <AccordionTrigger className="py-4 font-semibold text-[#18181B] hover:no-underline focus-visible:ring-[#18181B]/50 motion-reduce:transition-none">
                          How do I add personal time?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-[#52525B]">
                          Use the pencil next to Personal time to add or edit commitments. Drag a personal block to move that weekday, or select the block to edit it. Use the switch to show or hide personal time. Reset restores the sample schedule and commitments.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="inspect" className="border-[#E4E1DA] px-4">
                        <AccordionTrigger className="py-4 font-semibold text-[#18181B] hover:no-underline focus-visible:ring-[#18181B]/50 motion-reduce:transition-none">
                          How do I inspect a course?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-[#52525B]">
                          Select Inspect Details on a course or search in Course Inspector to see its schedule, assessment details, syllabus and related blog posts. Course details and blog posts are prototype data; check official sources before making decisions.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="aims" className="border-[#E4E1DA] px-4">
                        <AccordionTrigger className="py-4 font-semibold text-[#18181B] hover:no-underline focus-visible:ring-[#18181B]/50 motion-reduce:transition-none">
                          How do I register in AIMS?
                        </AccordionTrigger>
                        <AccordionContent className="text-sm leading-relaxed text-[#52525B]">
                          Open the Control Gate to review your changes and checklist. Check live seat availability and complete the applicable registration steps in AIMS yourself, then tick the checklist and confirm the change in the simulation.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          <div ref={profileMenuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setProfileMenuOpen(open => !open)}
              aria-haspopup="true"
              aria-expanded={profileMenuOpen}
              aria-label="Open Marcus Li profile menu"
              className="flex h-10 items-center gap-2 rounded-xl border border-[#E4E1DA] bg-white px-3 text-xs font-semibold transition-colors hover:bg-[#f8f7f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6c4cff]"
            >
              <span className="relative grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[#6c4cff] font-mono text-[11px] font-bold text-white" aria-hidden="true">
                <span>ML</span>
                <img
                  src="./avatars/marcus.svg"
                  alt=""
                  onError={event => { event.currentTarget.hidden = true; }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </span>
              <span className="max-[380px]:hidden">Marcus Li</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#E4E1DA] bg-white p-4 shadow-lg">
                <div className="border-b border-[#E4E1DA] pb-3">
                  <p className="text-sm font-bold">Marcus Li '28</p>
                  <p className="mt-1 text-xs text-muted-foreground">BEng Computer &amp; Data Engineering · Year 2</p>
                  <p className="mt-1 text-xs text-muted-foreground">Semester B 2026/27</p>
                </div>

                <label htmlFor="credit-policy" className="mt-3 block space-y-1.5 text-xs">
                  <span className="font-semibold">Credit Policy</span>
                  <select
                    id="credit-policy"
                    aria-label="Credit Policy"
                    value={creditPolicy}
                    onChange={event => {
                      const value = event.target.value;
                      if (value === 'standard' || value === 'overload' || value === 'final_sem') {
                        setCreditPolicy(value);
                      }
                    }}
                    className="h-9 w-full rounded-lg border border-[#E4E1DA] bg-white px-2 text-xs outline-none focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]"
                  >
                    <option value="standard">Standard (12–18 CR)</option>
                    <option value="overload">Overload Approved (12–21 CR)</option>
                    <option value="final_sem">Final Sem (3–18 CR)</option>
                  </select>
                </label>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  Controls min/max credit guardrails in Rehearsal Timetable
                </p>

                <Link
                  to="/"
                  className="mt-3 block w-full rounded-lg border-t border-[#E4E1DA] pt-3 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-[#171717]"
                >
                  Product Overview (Landing) →
                </Link>
              </div>
            )}
          </div>
          </div>
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Dynamic Content Views */}
        <main className="mx-auto w-full max-w-[1600px] flex-1 p-4 md:p-8">

          {/* TAB 1: REHEARSAL TIMETABLE */}
          {activeTab === 'rehearsal' && (
            <div className="space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-200 motion-safe:ease-out">
              {/* Eyebrow and Page Heading */}
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 border-b border-black/10 pb-5">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6c4cff] mb-1">
                    Academic Timetable Rehearsal
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Weekly Schedule & Safe-Swap Canvas
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mark an enrolled course for drop if needed, then stage one or more courses from the catalogue.
                  </p>
                </div>

                {/* Filter / Settings Pill Row */}
                <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap">
                  <button
                    onClick={() => setHighlightBridge(!highlightBridge)}
                    aria-pressed={highlightBridge}
                    title="Foundation courses required for Direct-Entry / Senior Year transfer students"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                      highlightBridge
                        ? 'bg-[#d9ff63] border-black text-[#171717] font-semibold'
                        : 'bg-white border-black/10 text-muted-foreground'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Direct-Entry Core (2)</span>
                  </button>

                  <div
                    role="status"
                    aria-label={`Projected credit load ${projectedCredits.toFixed(1)} of ${activeMaxCredits.toFixed(1)}, policy minimum ${activeMinCredits.toFixed(1)}`}
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-mono ${
                      wouldBeBelowMin || wouldExceedMax ? 'border-red-300 bg-red-50 font-semibold text-red-800' : 'border-black/10 bg-white'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${wouldBeBelowMin || wouldExceedMax ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span>Projected {projectedCredits.toFixed(1)} / {activeMaxCredits.toFixed(1)} CR (Min {activeMinCredits.toFixed(1)})</span>
                  </div>

                  {hasPendingChange && (
                    <Button
                      onClick={() => setControlGateOpen(true)}
                      className="h-9 bg-[#171717] text-xs font-semibold text-white hover:bg-[#6c4cff]"
                    >
                      Review Draft
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetAll}
                    title="Reset to Marcus Li baseline schedule"
                    className="h-9 border-black/15 bg-white text-xs"
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Conflict Radar Warning Banner */}
              {activeConflicts.length > 0 && (
                <div className="bg-[#fff1f2] border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">
                      Registration Conflict Detected{activeConflicts.length > 1 ? ` (${activeConflicts.length} issues)` : ''}
                    </h4>
                    <ul className="text-xs text-red-700 mt-0.5 space-y-0.5 list-disc pl-4">
                      {activeConflicts.map(reason => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {stagedPersonalOverlaps.length > 0 && (
                <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                  <p className="font-bold">Personal time overlap</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {stagedPersonalOverlaps.map(block => <li key={block.id}>{personalOverlapMessage(block)}</li>)}
                  </ul>
                  <p className="mt-1">You can still stage and review these courses.</p>
                </div>
              )}
              {fatigueWarnings.length > 0 && (
                <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                  <p className="font-bold">Fatigue warning</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {fatigueWarnings.map(warning => <li key={warning}>{warning}</li>)}
                  </ul>
                </div>
              )}

              {/* Credit Policy Minimum Load Warning */}
              {wouldBeBelowMin && (
                <div role="alert" className="bg-[#fff1f2] border-l-4 border-red-600 p-4 rounded-r-lg flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">
                      {creditPolicy === 'final_sem' ? 'Below Credit Policy Minimum' : 'Below Full-Time Minimum Load'}
                    </h4>
                    <p className="text-xs text-red-700 mt-0.5">
                      Projected load is {projectedCredits.toFixed(1)} CR, which is under the {activeMinCredits.toFixed(1)} CR minimum. This swap cannot be confirmed until you stage a course that brings the total back to {activeMinCredits.toFixed(1)} CR or more.
                    </p>
                  </div>
                </div>
              )}

              {wouldExceedMax && (
                <div role="alert" className="bg-[#fff1f2] border-l-4 border-red-600 p-4 rounded-r-lg flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-red-800">
                    Credit Ceiling Exceeded ({projectedCredits.toFixed(1)} / {activeMaxCredits.toFixed(1)} CR). Remove a staged course or mark an enrolled course for drop.
                    {creditPolicy !== 'overload' && projectedCredits <= CREDIT_POLICY_LIMITS.overload.maxCredits && ' If approved, you can also select the overload policy.'}
                  </p>
                </div>
              )}

              {/* Success Notification after Swap */}
              {swapConfirmed && (
                <div className="bg-[#ecfdf5] border-l-4 border-green-500 p-4 rounded-r-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-xs font-medium text-green-800">
                      Simulated draft applied to the weekly timetable. Complete registration separately on AIMS.
                    </span>
                  </div>
                  <button onClick={() => setSwapConfirmed(false)} className="text-green-700 hover:text-green-900 text-xs">
                    Dismiss
                  </button>
                </div>
              )}

              {/* Staging Dock Status Strip */}
              {hasPendingChange && (
                <div className="bg-white border border-black/10 p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-muted-foreground uppercase">Target to Drop:</span>
                      {swapOutCourse ? (
                        <Badge className="bg-[#fef3c7] text-[#92400e] border border-[#fde68a] hover:bg-[#fef3c7]">
                          {swapOutCourse.code} ({swapOutCourse.credits} CR)
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground italic font-mono">[None selected]</span>
                      )}
                    </div>

                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-muted-foreground uppercase">Courses to Add:</span>
                      {stagedCourses.length ? (
                        <div className="flex flex-wrap gap-1">{stagedCourses.map(course => (
                          <Badge key={course.code} className="bg-[#ece9ff] text-[#34266f] border border-[#d9ccff] hover:bg-[#ece9ff]">
                            {course.code} ({course.credits} CR)
                          </Badge>
                        ))}</div>
                      ) : (
                        <span className="text-muted-foreground italic font-mono">[None staged]</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setControlGateOpen(true)}
                      className="bg-[#171717] text-white hover:bg-[#6c4cff] text-xs h-8"
                    >
                      Open Control Gate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setSwapOutId(null); setSelectedReplacements([]); }}
                      className="text-xs h-8"
                    >
                      Clear Staging
                    </Button>
                  </div>
                </div>
              )}

              {/* Two-Column Grid: Left Timetable Calendar + Right Catalogue Bay */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Left 8 Columns: Weekly Timetable Calendar */}
                <div className="xl:col-span-8 bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-3">
                    <span className="font-semibold text-xs text-[#171717]">Weekly Academic Grid (Mon–Sat 08:00–23:00)</span>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#171717]" />
                        Enrolled
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm border-2 border-dashed border-[#b45309] bg-[#fffbeb]" />
                        Marked Drop
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm border-2 border-dashed border-[#6c4cff] bg-[#f5f3ff]" />
                        Staged
                      </span>
                      <div className={`inline-flex h-6 items-stretch overflow-hidden rounded-full border font-sans text-[#18181B] ${
                        blockPersonalTime ? 'border-[#18181B] bg-[#D9F99D]' : 'border-[#E4E1DA] bg-[#F7F5F0]'
                      }`}>
                        <button
                          type="button"
                          role="switch"
                          aria-label="Personal time"
                          aria-checked={blockPersonalTime}
                          onClick={() => setBlockPersonalTime(current => !current)}
                          title={blockPersonalTime ? 'Turn personal time off' : 'Turn personal time on'}
                          className="inline-flex items-center gap-1 rounded-l-full px-2 text-[10px] leading-none font-semibold transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#18181B]"
                        >
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          <span>Personal time ({personalCommitments.filter(commitment => commitment.enabled).length})</span>
                          <span className="font-medium">{blockPersonalTime ? 'On' : 'Off'}</span>
                        </button>
                        <button
                          type="button"
                          aria-label="Edit personal commitments"
                          title="Edit personal commitments"
                          onClick={() => {
                            setEditingCommitmentId(null);
                            setEditingCommitmentDay(null);
                            setNewLabel('');
                            setShowCommitmentManager(true);
                          }}
                          className="inline-flex items-center justify-center rounded-r-full border-l border-[#18181B]/20 px-1.5 text-[10px] leading-none transition-colors hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#18181B]"
                        >
                          <Pencil className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                      {draggedCourseCode && <span className="font-semibold text-emerald-700">Drop course to preview its schedule</span>}
                    </div>
                  </div>

                  {draggedStagedCode && (
                    <div
                      role="status"
                      onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
                      onDrop={event => {
                        event.preventDefault();
                        setSelectedReplacements(current => current.filter(code => code !== draggedStagedCode));
                        toast.success(`${draggedStagedCode} removed from the draft`);
                        setDraggedStagedCode(null);
                      }}
                      className="mb-3 rounded-lg border border-dashed border-red-400 bg-red-50 p-3 text-center text-xs font-semibold text-red-800"
                    >
                      Drop here to remove {draggedStagedCode} from the draft
                    </div>
                  )}
                  <div
                    className="w-full overflow-hidden"
                    onDragOver={event => {
                      if (!draggedCourseCode) return;
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'copy';
                    }}
                    onDrop={handleTimetableDrop}
                  >
                    <div className="w-full">
                      <div className="mb-1 grid w-full grid-cols-[44px_repeat(6,minmax(0,1fr))] gap-x-1">
                        <div className="flex items-center justify-center font-mono text-[10px] font-semibold text-muted-foreground">TIME</div>
                        {DAYS.map(day => (
                          <div key={day} className="border-b border-black/10 py-2 text-center font-mono text-xs font-bold uppercase text-muted-foreground">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid w-full grid-cols-[44px_repeat(6,minmax(0,1fr))] gap-x-1">
                        <div className="relative h-[660px]">
                          {Array.from({ length: 16 }, (_, index) => {
                            const hour = 8 + index;
                            const transform = index === 0 ? 'translateY(0)' : index === 15 ? 'translateY(-100%)' : 'translateY(-50%)';
                            return (
                              <span
                                key={hour}
                                className="absolute right-1 font-mono text-[10px] leading-none text-muted-foreground"
                                style={{ top: `${index * PIXELS_PER_HOUR}px`, transform }}
                              >
                                {`${String(hour).padStart(2, '0')}:00`}
                              </span>
                            );
                          })}
                        </div>

                        {DAYS.map(day => (
                          <div
                            key={day}
                            className="relative h-[660px] overflow-hidden border-l border-black/10 bg-[#FCFBF8]"
                            style={{ height: GRID_HEIGHT }}
                            aria-label={`${day} timetable`}
                            onDragOver={event => {
                              if (!draggedPersonalBlock) return;
                              event.preventDefault();
                              event.stopPropagation();
                              event.dataTransfer.dropEffect = 'move';
                              const duration = draggedPersonalBlock.endHour - draggedPersonalBlock.startHour;
                              const hour = GRID_START_MINUTES / 60 + (event.clientY - event.currentTarget.getBoundingClientRect().top) / PIXELS_PER_HOUR - personalDragOffset;
                              const startHour = Math.max(8, Math.min(23 - duration, Math.round(hour * 2) / 2));
                              setPersonalDropPreview({ day, startHour });
                            }}
                            onDrop={event => {
                              if (!draggedPersonalBlock) return;
                              event.preventDefault();
                              event.stopPropagation();
                              const duration = draggedPersonalBlock.endHour - draggedPersonalBlock.startHour;
                              const hour = GRID_START_MINUTES / 60 + (event.clientY - event.currentTarget.getBoundingClientRect().top) / PIXELS_PER_HOUR - personalDragOffset;
                              const startHour = Math.max(8, Math.min(23 - duration, Math.round(hour * 2) / 2));
                              if (day === draggedPersonalBlock.day && startHour === draggedPersonalBlock.startHour) {
                                setDraggedPersonalBlock(null);
                                setPersonalDropPreview(null);
                                return;
                              }
                              const source = personalCommitments.find(item => item.id === draggedPersonalBlock.commitmentId);
                              if (day !== draggedPersonalBlock.day && source?.days.includes(day)) {
                                toast.error(`This commitment already has a ${day} block. Edit or remove it first.`);
                                setDraggedPersonalBlock(null);
                                setPersonalDropPreview(null);
                                return;
                              }
                              changePersonalDay(draggedPersonalBlock, {
                                day,
                                startHour,
                                endHour: startHour + duration
                              });
                              setDraggedPersonalBlock(null);
                              setPersonalDropPreview(null);
                              toast.success(`Moved ${draggedPersonalBlock.label} to ${day} ${formatHour(startHour)}`);
                            }}
                          >
                            {Array.from({ length: 15 }, (_, index) => (
                              <div
                                key={`hour-line-${index}`}
                                className="pointer-events-none absolute inset-x-0 border-b border-[#EFECE6]"
                                style={{ top: `${(index + 1) * PIXELS_PER_HOUR}px` }}
                              />
                            ))}

                            {dayEvents[day].map(ev => {
                              const isMarkedForDrop = ev.kind === 'enrolled' && swapOutId === ev.course?.code;
                              const hasClash = ev.clashes.length > 0;
                              const clippedStart = Math.max(ev.start, GRID_START_MINUTES);
                              const top = ((clippedStart - GRID_START_MINUTES) / 60) * PIXELS_PER_HOUR;
                              const duration = Math.max(
                                0,
                                Math.min(ev.end, GRID_END_MINUTES) - clippedStart
                              );
                              const blockHeight = (duration / 60) * PIXELS_PER_HOUR;
                              const width = 100 / ev.laneCount;
                              const blockStyle: CSSProperties = {
                                top: `${top}px`,
                                height: `${blockHeight}px`,
                                minHeight: `${MIN_EVENT_HEIGHT}px`,
                                left: `${ev.lane * width}%`,
                                width: `${width}%`,
                                zIndex: hoveredCourseCode === ev.course?.code ? 20 : 2
                              };

                              if (ev.kind === 'personalBlock') {
                                const overlapsAcademic = dayEvents[day].some(other =>
                                  other.kind !== 'personalBlock' && ev.start < other.end && ev.end > other.start
                                );
                                return (
                                  <div
                                    key={ev.key}
                                    title={`${ev.label}, ${ev.startStr} - ${ev.endStr} · Drag to move or click to edit`}
                                    className={`group absolute box-border cursor-grab overflow-hidden rounded-lg border border-dashed bg-[#F4F1EA] text-[#18181B] shadow-xs outline-none transition-[transform,box-shadow] hover:shadow-md active:scale-[1.02] active:cursor-grabbing focus-within:ring-2 focus-within:ring-[#6c4cff] motion-reduce:transform-none motion-reduce:transition-none ${
                                      draggedPersonalBlock?.id === ev.personalBlock?.id ? 'cursor-grabbing shadow-md' : ''
                                    } ${overlapsAcademic || ev.stagedOverlap ? 'border-amber-600' : 'border-[#71717A]'}`}
                                    style={{
                                      ...blockStyle,
                                      backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(113,113,122,0.08) 6px, rgba(113,113,122,0.08) 8px)'
                                    }}
                                  >
                                    <button
                                      type="button"
                                      draggable
                                      aria-label={`Move or edit ${ev.label} on ${day}, ${ev.startStr} to ${ev.endStr}${overlapsAcademic ? ', overlaps a course' : ''}`}
                                      onDragStart={event => {
                                        if (!ev.personalBlock) return;
                                        event.stopPropagation();
                                        event.dataTransfer.setData('text/plain', ev.personalBlock.id);
                                        event.dataTransfer.effectAllowed = 'move';
                                        setPersonalDragOffset(Math.max(0, Math.min(
                                          ev.personalBlock.endHour - ev.personalBlock.startHour,
                                          (event.clientY - event.currentTarget.getBoundingClientRect().top) / PIXELS_PER_HOUR
                                        )));
                                        setDraggedPersonalBlock(ev.personalBlock);
                                      }}
                                      onDragEnd={() => { setDraggedPersonalBlock(null); setPersonalDropPreview(null); setPersonalDragOffset(0); }}
                                      onClick={() => {
                                        const commitment = personalCommitments.find(item => item.id === ev.personalBlock?.commitmentId);
                                        if (commitment) editCommitment(commitment, day);
                                      }}
                                      className="block h-full w-full cursor-inherit overflow-hidden p-1.5 pr-4 text-left outline-none"
                                    >
                                      <span className="block truncate text-[10px] font-bold leading-tight">{ev.label}</span>
                                      <span className="block text-[10px] leading-tight">{ev.startStr} - {ev.endStr}</span>
                                      {overlapsAcademic
                                        ? <span className="block text-[9px] font-semibold leading-tight text-amber-800">Overlap</span>
                                        : <span className="block text-[9px] leading-tight">{ev.personalBlock?.category} · You entered</span>}
                                    </button>
                                    <button
                                      type="button"
                                      aria-label={`Remove ${ev.label} on ${day}`}
                                      onClick={event => { event.stopPropagation(); if (ev.personalBlock) changePersonalDay(ev.personalBlock); }}
                                      onKeyDown={event => event.stopPropagation()}
                                      className="absolute right-0 top-0 rounded bg-white/90 p-0.5 opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#18181B] sm:opacity-0 group-hover:opacity-100 motion-reduce:transition-none"
                                    >
                                      <X className="h-3 w-3" aria-hidden="true" />
                                    </button>
                                  </div>
                                );
                              }

                              if (!ev.course) return null;
                              const isStaged = ev.kind === 'staged';
                              const cardClasses = hasClash
                                ? 'border-l-4 border-l-red-500 bg-red-50/80 text-red-900'
                                : isStaged
                                  ? 'border-l-4 border-l-[#4F46E5] bg-[#4F46E5]/[0.06] text-[#171717]'
                                  : isMarkedForDrop
                                    ? 'border-l-4 border-l-amber-500 bg-amber-50/60 text-[#713f12]'
                                    : 'border-l-4 border-l-[#18181B] bg-white text-[#171717]';

                              return (
                                <div
                                  key={ev.key}
                                  draggable={isStaged}
                                  onDragStart={event => {
                                    if (!isStaged) return;
                                    event.stopPropagation();
                                    event.dataTransfer.setData('text/plain', ev.course!.code);
                                    event.dataTransfer.effectAllowed = 'move';
                                    setDraggedStagedCode(ev.course!.code);
                                  }}
                                  onDragEnd={() => setDraggedStagedCode(null)}
                                  role="button"
                                  tabIndex={0}
                                  aria-pressed={isStaged ? undefined : isMarkedForDrop}
                                  aria-label={`${ev.course.code} ${ev.course.title}, ${ev.section} ${ev.meetingType}, ${ev.startStr} to ${ev.endStr}. ${
                                    isStaged ? 'Staged course. Drag to remove or use the remove button.' : isMarkedForDrop ? 'Marked for drop. Press to unmark.' : 'Press to mark for drop.'
                                  }`}
                                  onClick={() => !isStaged && handleSelectSwapOut(ev.course!.code)}
                                  onMouseEnter={() => setHoveredCourseCode(ev.course!.code)}
                                  onMouseLeave={() => setHoveredCourseCode(null)}
                                  onKeyDown={event => {
                                    if (event.target !== event.currentTarget || isStaged) return;
                                    if (event.key === 'Enter' || event.key === ' ') {
                                      event.preventDefault();
                                      handleSelectSwapOut(ev.course!.code);
                                    }
                                  }}
                                  title={`${ev.course.title} · ${ev.section} ${ev.meetingType} · CRN ${ev.meetingCrn} · ${ev.startStr}–${ev.endStr}${hasClash ? ` · Overlaps ${ev.clashes.join(', ')}` : ''}`}
                                  className={`absolute box-border flex h-full ${isStaged ? `cursor-grab hover:shadow-md active:scale-[1.02] active:cursor-grabbing ${draggedStagedCode === ev.course.code ? 'cursor-grabbing shadow-md' : ''}` : 'cursor-pointer'} flex-col justify-between overflow-hidden rounded border border-black/10 p-1.5 text-left shadow-xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#6c4cff] motion-reduce:transform-none motion-reduce:transition-none ${cardClasses} ${
                                    hoveredCourseCode === ev.course.code ? 'ring-2 ring-[#6c4cff]/50' : ''
                                  }`}
                                  style={blockStyle}
                                >
                                  <div className="flex min-w-0 items-center justify-between gap-1 font-mono leading-tight">
                                    <div className="flex min-w-0 items-center gap-1">
                                      <span className="truncate text-[11px] font-bold">{ev.course.code}</span>
                                      <span className="shrink-0 rounded bg-black/5 px-1 text-[9px] font-bold">{ev.section}</span>
                                    </div>
                                    <span className="shrink-0 whitespace-nowrap text-right text-[9px]">{ev.startStr}–{ev.endStr}</span>
                                  </div>
                                  {blockHeight < 75 ? (
                                    <div className="flex min-w-0 items-center justify-between gap-1">
                                      <span className="truncate text-[11px] font-medium leading-snug" title={ev.course.title}>
                                        {ev.course.title}
                                      </span>
                                      <div className="flex shrink-0 items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={event => { event.stopPropagation(); handleOpenInspector(ev.course!.code); }}
                                          onKeyDown={event => event.stopPropagation()}
                                          className="self-start text-[10px] font-semibold text-[#4F46E5] hover:underline"
                                        >
                                          Inspect
                                        </button>
                                        {isStaged && (
                                          <button
                                            type="button"
                                            onClick={event => { event.stopPropagation(); setSelectedReplacements(current => current.filter(code => code !== ev.course!.code)); }}
                                            onKeyDown={event => event.stopPropagation()}
                                            aria-label={`Remove staged ${ev.course.code}`}
                                            className="font-mono text-[10px] font-semibold text-muted-foreground hover:text-red-600"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <p
                                        className={`text-[11px] font-medium leading-snug ${
                                          duration >= 120 ? 'line-clamp-2' : 'truncate'
                                        }`}
                                        title={ev.course.title}
                                      >
                                        {ev.course.title}
                                      </p>
                                      <p className="truncate font-mono text-[9px] leading-tight text-muted-foreground">
                                        {ev.meetingType} · CRN {ev.meetingCrn}
                                      </p>
                                      <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={event => { event.stopPropagation(); handleOpenInspector(ev.course!.code); }}
                                            onKeyDown={event => event.stopPropagation()}
                                            className="self-start text-[10px] font-semibold text-[#4F46E5] hover:underline"
                                          >
                                            Inspect
                                          </button>
                                          {isStaged && (
                                            <button
                                              type="button"
                                              onClick={event => { event.stopPropagation(); setSelectedReplacements(current => current.filter(code => code !== ev.course!.code)); }}
                                              onKeyDown={event => event.stopPropagation()}
                                              aria-label={`Remove staged ${ev.course.code}`}
                                              className="font-mono text-[10px] font-semibold text-muted-foreground hover:text-red-600"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          )}
                                        </div>
                                        {duration >= 120 && (
                                          <span className="rounded bg-black/5 px-1 font-mono text-[9px] font-semibold uppercase text-muted-foreground">
                                            {isStaged ? 'STAGED' : 'AIMS'}
                                          </span>
                                        )}
                                      </div>
                                    </>
                                  )}
                                  {hasClash && (
                                    <span className="mt-0.5 block truncate text-[9px] font-semibold text-red-700">
                                      Overlaps {ev.clashes.join(', ')}
                                    </span>
                                  )}
                                </div>
                              );
                            })}

                            {draggedPersonalBlock && personalDropPreview?.day === day && (
                              <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-x-0 z-30 rounded-lg border-2 border-dashed border-[#6c4cff] bg-[#ece9ff]/80 p-1 text-[10px] font-semibold"
                                style={{
                                  top: `${(personalDropPreview.startHour - 8) * PIXELS_PER_HOUR}px`,
                                  height: `${(draggedPersonalBlock.endHour - draggedPersonalBlock.startHour) * PIXELS_PER_HOUR}px`
                                }}
                              >
                                {formatHour(personalDropPreview.startHour)} – {formatHour(personalDropPreview.startHour + draggedPersonalBlock.endHour - draggedPersonalBlock.startHour)}
                              </div>
                            )}
                            {dragPreviewByDay[day].map(({ meeting, reason, warnings }) => (
                              <div
                                key={`drag-${draggedCourseCode}-${meeting.crn}`}
                                aria-label={reason
                                  ? `Warning: ${reason}`
                                  : warnings.length
                                    ? `Personal time overlap: ${warnings.join(' ')}`
                                  : `Drop to Stage ${draggedCourseCode} ${meeting.section}`}
                                className={`pointer-events-none absolute z-30 box-border overflow-hidden rounded p-1 font-mono text-[10px] font-bold leading-tight ${
                                  reason
                                    ? 'border-2 border-dashed border-red-600 bg-red-500/15 text-red-900'
                                    : warnings.length
                                      ? 'border-2 border-dashed border-amber-600 bg-amber-50/80 text-amber-900'
                                    : 'border-2 border-dashed border-emerald-600 bg-emerald-500/15 text-emerald-900'
                                }`}
                                style={{
                                  top: `${((parseMinutes(meeting.start) - GRID_START_MINUTES) / 60) * PIXELS_PER_HOUR}px`,
                                  height: `${((parseMinutes(meeting.end) - parseMinutes(meeting.start)) / 60) * PIXELS_PER_HOUR}px`,
                                  minHeight: '38px',
                                  left: 0,
                                  right: 0
                                }}
                              >
                                {reason
                                  ? `Warning · ${reason}`
                                  : warnings.length
                                    ? `Personal time overlap · ${warnings.join(' ')}`
                                  : `Drop to Stage · ${draggedCourseCode} (${meeting.section})`}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 4 Columns: Course Catalogue & Staging Dock */}
                <div className="xl:col-span-4 bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col h-[650px]">
                  <div className="flex items-center justify-between pb-3 border-b mb-3">
                    <div>
                      <h3 className="font-semibold text-xs">Simulated Course Catalogue</h3>
                      <p className="text-[11px] text-muted-foreground">{filteredCatalogue.length} matching courses</p>
                    </div>
                  </div>

                  {highlightBridge && (
                    <div className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-[#d9ccff] bg-[#f5f3ff] px-3 py-2 text-[11px] text-[#34266f]" role="status">
                      <span>Showing Direct-Entry / Transfer foundation courses (EE1002, CS2201)</span>
                      <button
                        type="button"
                        onClick={() => setHighlightBridge(false)}
                        className="shrink-0 font-semibold text-[#4F46E5] hover:underline"
                      >
                        Show all
                      </button>
                    </div>
                  )}

                  <div className="relative mb-3">
                    <div className="h-10 w-full rounded-xl border border-[#E4E1DA] bg-white px-3 flex items-center gap-2 transition-colors focus-within:border-[#18181B] focus-within:ring-1 focus-within:ring-[#18181B]">
                      <Search className="h-4 w-4 shrink-0 text-[#71717A]" aria-hidden="true" />
                      <input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search course catalogue"
                        className="h-full min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#71717A]"
                        placeholder="Search code or title (e.g., EE4213)"
                      />
                      {searchQuery ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            searchInputRef.current?.focus();
                          }}
                          aria-label="Clear catalogue search"
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-black/50 transition hover:bg-black/5 hover:text-[#18181B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#18181B]"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      ) : (
                        <span className="shrink-0 rounded bg-[#eeece6] px-1.5 font-mono text-[11px] text-black/50" aria-hidden="true">
                          /
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3 text-[11px] font-mono">
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`px-2 py-1 rounded ${activeFilter === 'all' ? 'bg-[#171717] text-white' : 'bg-[#f5f4ef] text-muted-foreground'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveFilter('ge')}
                      className={`px-2 py-1 rounded ${activeFilter === 'ge' ? 'bg-[#171717] text-white' : 'bg-[#f5f4ef] text-muted-foreground'}`}
                    >
                      GE
                    </button>
                    <button
                      onClick={() => setActiveFilter('stem')}
                      className={`px-2 py-1 rounded ${activeFilter === 'stem' ? 'bg-[#171717] text-white' : 'bg-[#f5f4ef] text-muted-foreground'}`}
                    >
                      STEM
                    </button>
                    <button
                      onClick={() => setActiveFilter('coursework')}
                      className={`px-2 py-1 rounded ${activeFilter === 'coursework' ? 'bg-[#171717] text-white' : 'bg-[#f5f4ef] text-muted-foreground'}`}
                    >
                      100% CW
                    </button>
                    <button
                      onClick={() => setActiveFilter('open')}
                      className={`px-2 py-1 rounded ${activeFilter === 'open' ? 'bg-[#171717] text-white' : 'bg-[#f5f4ef] text-muted-foreground'}`}
                    >
                      Open Seats
                    </button>
                  </div>

                  {/* Catalogue Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {filteredCatalogue.length === 0 ? (
                      <div className="p-4 text-center space-y-2" role="status">
                        <p className="text-xs text-muted-foreground">
                          No courses match "<span className="font-semibold text-foreground">{searchQuery}</span>"
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery('');
                            searchInputRef.current?.focus();
                          }}
                          className="text-xs text-[#6c4cff] font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : filteredCatalogue.map(course => {
                      const validRes = validateDraftCourse(course);
                      const personalOverlaps = getPersonalOverlaps(course);
                      const isStaged = selectedReplacements.includes(course.code);
                      const creditReason = getStageCreditReason(course);

                      return (
                        <div
                          key={course.code}
                          draggable
                          onDragStart={event => {
                            setDraggedCourseCode(course.code);
                            event.dataTransfer.setData('text/plain', course.code);
                            event.dataTransfer.effectAllowed = 'copy';
                          }}
                          onDragEnd={() => setDraggedCourseCode(null)}
                          className={`cursor-grab active:cursor-grabbing p-3 rounded-xl border text-left transition-all ${
                            isStaged
                              ? 'bg-[#f5f3ff] border-[#6c4cff] ring-1 ring-[#6c4cff]'
                              : 'bg-white border-black/10 hover:border-black/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 font-mono text-xs font-bold text-[#171717]">
                              {course.code}
                            </span>
                            <span className={`font-mono text-[11px] px-1.5 py-0.5 rounded ${
                              course.quotaAvailable > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {course.quotaAvailable > 0 ? `${course.quotaAvailable} Open` : 'Full'}
                            </span>
                          </div>

                          <h5 className="font-semibold text-xs mt-1 leading-snug">{course.title}</h5>

                          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 font-mono">
                            <span>{course.day} {course.start}–{course.end}</span>
                            <span>{course.credits.toFixed(1)} CR</span>
                          </div>

                          {renderSectionSelectors(course, true)}

                          {/* Prereq or Conflict Warning */}
                          {!validRes.ok && (
                            <ul className="mt-2 space-y-0.5 text-[11px] text-red-600 font-medium">
                              {validRes.reasons.map(reason => (
                                <li key={reason}>[Alert] {reason}</li>
                              ))}
                            </ul>
                          )}
                          {personalOverlaps.length > 0 && (
                            <ul className="mt-2 space-y-0.5 text-[11px] font-medium text-amber-800">
                              {personalOverlaps.map(block => <li key={block.id}>Personal time overlap: {personalOverlapMessage(block)}</li>)}
                            </ul>
                          )}
                          {creditReason && (
                            <p id={`credit-limit-${course.code}`} className="mt-2 text-[11px] font-medium text-red-600">{creditReason}</p>
                          )}

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5">
                            <button
                              onClick={() => handleOpenInspector(course.code)}
                              className="text-[11px] font-mono text-[#6c4cff] hover:underline"
                            >
                              Inspect Details &rarr;
                            </button>

                            {isStaged ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setSelectedReplacements(current => current.filter(code => code !== course.code))}
                                className="h-7 text-[11px] px-2.5"
                              >
                                Unstage Preview
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={Boolean(creditReason)}
                                aria-describedby={creditReason ? `credit-limit-${course.code}` : undefined}
                                onClick={() => handleStageCourse(course.code)}
                                className="h-7 text-[11px] px-2.5 bg-[#171717] text-white hover:bg-[#6c4cff]"
                              >
                                Stage Swap
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COURSE INSPECTOR & WORKLOAD DIAGNOSTICS (EXACT ORIGINAL HCI FEATURES IN NEW SAAS STYLE) */}
          {activeTab === 'inspector' && (
            <div className="max-w-5xl mx-auto space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-200 motion-safe:ease-out">
              {/* Header with Breadcrumb and Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => changeTab('rehearsal')}
                      className="text-xs h-7 px-2.5 border-black/15 bg-white font-mono hover:bg-black/5"
                    >
                      <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                      Return to Weekly Timetable
                    </Button>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Course Inspector &amp; Workload Diagnostics
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Inspect syllabus workload splits, assessment risks, and sample peer reflections.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="inspector-course-search" className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    Find Course:
                  </label>
                  <div ref={inspectorComboRef} className="relative w-full sm:w-72 md:w-80 lg:w-96">
                    <div className="h-10 w-full rounded-xl border border-[#E4E1DA] bg-white px-3 flex items-center gap-2 transition-colors focus-within:border-[#18181B] focus-within:ring-1 focus-within:ring-[#18181B]">
                      <Search className="h-4 w-4 shrink-0 text-[#71717A]" aria-hidden="true" />
                      <input
                        ref={inspectorInputRef}
                        id="inspector-course-search"
                        type="text"
                        role="combobox"
                        aria-expanded={inspectorDropdownOpen}
                        aria-haspopup="listbox"
                        aria-controls="inspector-course-listbox"
                        aria-autocomplete="list"
                        placeholder="Search code or title (e.g., EE4213)"
                        value={inspectorSearchQuery}
                        onFocus={() => setInspectorDropdownOpen(true)}
                        onChange={(e) => {
                          setInspectorSearchQuery(e.target.value);
                          if (!inspectorDropdownOpen) setInspectorDropdownOpen(true);
                        }}
                        className="h-full min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#71717A]"
                      />
                      {inspectorSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setInspectorSearchQuery('');
                            inspectorInputRef.current?.focus();
                          }}
                          aria-label="Clear course search"
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-black/50 transition hover:bg-black/5 hover:text-[#18181B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#18181B]"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    {/* Accessible Combobox Dropdown Listbox */}
                    {inspectorDropdownOpen && (
                      <div
                        id="inspector-course-listbox"
                        role="listbox"
                        className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-72 overflow-y-auto rounded-xl border border-[#E5E2DC] bg-[#FFFFFF] p-1.5 shadow-xl"
                      >
                        {inspectorFilteredCourses.length > 0 ? (
                          inspectorFilteredCourses.map((c) => {
                            const isSelected = c.code === inspectorCourseCode;
                            return (
                              <div
                                key={c.code}
                                role="option"
                                aria-selected={isSelected}
                                tabIndex={0}
                                onClick={() => {
                                  setInspectorCourseCode(c.code);
                                  setInspectorSearchQuery('');
                                  setInspectorDropdownOpen(false);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setInspectorCourseCode(c.code);
                                    setInspectorSearchQuery('');
                                    setInspectorDropdownOpen(false);
                                  }
                                }}
                                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                                  isSelected ? 'bg-[#ece9ff] text-[#171717] font-semibold' : 'hover:bg-[#f8f7f3] text-[#171717]'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="font-mono font-bold">{c.code}</span>
                                    <span className="text-muted-foreground">—</span>
                                    <span className="truncate">{c.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 font-mono">
                                    <span>{c.day} {c.start}–{c.end}</span>
                                    <span>·</span>
                                    <span>{c.credits}.0 CR</span>
                                    <span>·</span>
                                    <span>CRN {c.crn}</span>
                                  </div>
                                </div>
                                {c.syllabusPdf && (
                                  <span className="shrink-0 rounded border border-[#d9ccff] bg-[#ece9ff] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#34266f]">
                                    <span className="whitespace-nowrap shrink-0">{c.syllabusYear || '2026/27'} Official PDF</span>
                                  </span>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center space-y-2">
                            <p className="text-xs text-muted-foreground">
                              No courses match "<span className="font-semibold text-foreground">{inspectorSearchQuery}</span>"
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setInspectorSearchQuery('');
                                inspectorInputRef.current?.focus();
                              }}
                              className="text-xs text-[#6c4cff] font-semibold hover:underline inline-flex items-center gap-1"
                            >
                              Clear search
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {inspectorCourse && (
                    <button
                      type="button"
                      onClick={() => setInspectorCourseCode(null)}
                      className="shrink-0 text-xs font-semibold text-muted-foreground hover:text-[#6c4cff] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6c4cff]"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>

              {!inspectorCourse ? (
                <section className="max-w-xl mx-auto py-10 px-8 rounded-2xl border border-[#E4E1DA] bg-white text-center shadow-sm">
                  <div className="relative mx-auto mb-5 h-32 w-36" aria-hidden="true">
                    <svg viewBox="0 0 144 128" className="h-full w-full" fill="none">
                      <rect x="19" y="12" width="79" height="100" rx="8" fill="#F7F5F0" stroke="#18181B" strokeWidth="2" />
                      <rect x="30" y="26" width="53" height="9" rx="3" fill="#D9F99D" />
                      <path d="M31 49H82M31 60H75M31 71H80M31 82H61" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <div className="absolute left-[62px] top-[39px] h-20 w-20 motion-safe:animate-[bounce_2.6s_ease-in-out_infinite]">
                      <svg viewBox="0 0 80 80" className="h-full w-full" fill="none">
                        <circle cx="31" cy="30" r="20" fill="#FFFFFF" fillOpacity=".85" stroke="#18181B" strokeWidth="3" />
                        <path d="M45 45L63 63" stroke="#18181B" strokeWidth="7" strokeLinecap="round" />
                        <path d="M19 30C19 23.4 24.4 18 31 18" stroke="#D9F99D" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#71717A]">
                    SYLLABUS &amp; WORKLOAD INSPECTOR
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-[#18181B]">
                    Inspect Every Syllabus Before You Commit
                  </h2>
                  <p className="mt-6 text-xs font-semibold text-[#18181B]">Choose a course to inspect</p>
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {['EE4213', 'CS3334', 'MA2001', 'GE1907', 'EE3008'].map(code => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setInspectorCourseCode(code)}
                        className="rounded-full border border-[#E4E1DA] bg-[#F7F5F0] px-4 py-1.5 font-mono text-xs font-semibold text-[#18181B] transition-all hover:bg-[#D9F99D] hover:border-[#18181B] motion-safe:hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181B]"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </section>
              ) : scheduleFitDiagnostics && workloadMetrics && (
              /* Main Inspector 2-Column Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left 6 Columns: Metadata, Badges, Workload Meter & Provenance Boundaries */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Card 1: Course Big Header & Dynamic Badges */}
                  <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="border-b border-black/10 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-2xl font-bold text-[#171717]">{inspectorCourse.code}</span>
                        <span className="font-mono text-xs text-muted-foreground">CRN {inspectorCourse.crn}</span>
                      </div>
                      <h2 className="text-base font-bold text-foreground mt-1">{inspectorCourse.title}</h2>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSyllabusDrawerOpen(true)}
                          className="text-xs font-semibold"
                        >
                          <FileText className="mr-1.5 h-3.5 w-3.5" />
                          View Official Syllabus
                        </Button>
                        {inspectorCourse.syllabusPdf && (
                          <span className="rounded-md border border-[#d9ccff] bg-[#ece9ff] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#34266f]">
                            <span className="whitespace-nowrap shrink-0">{inspectorCourse.syllabusYear || '2026/27'} Official PDF</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Badges Row */}
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      {/* Schedule Fit Badge */}
                      <span className={`px-2.5 py-1 rounded-md border font-semibold ${scheduleFitDiagnostics.color}`}>
                        {scheduleFitDiagnostics.text}
                      </span>

                      {/* Grading Split */}
                      <span className="px-2.5 py-1 rounded-md border border-black/10 bg-[#f8f7f3] text-foreground">
                        [GRADING: {inspectorCourse.courseworkPct}% COURSEWORK / {inspectorCourse.examPct}% EXAM]
                      </span>

                      {/* Group Work Risk */}
                      <span className={`px-2.5 py-1 rounded-md border ${
                        inspectorCourse.groupPct > 20
                          ? 'border-red-200 bg-red-50 text-red-700 font-semibold'
                          : 'border-black/10 bg-[#f8f7f3] text-foreground'
                      }`}>
                        {inspectorCourse.groupPct > 20
                          ? `[GROUP-WORK RISK: ${inspectorCourse.groupPct}%]`
                          : `[GROUP WORK: ${inspectorCourse.groupPct}%]`}
                      </span>

                      {/* Quota */}
                      <span className="px-2.5 py-1 rounded-md border border-black/10 bg-[#f8f7f3] text-foreground">
                        [QUOTA: {inspectorCourse.quotaAvailable} / {inspectorCourse.quotaTotal} SEATS]
                      </span>

                      {/* Credits */}
                      <span className="px-2.5 py-1 rounded-md border border-black/10 bg-[#f8f7f3] text-foreground">
                        [CREDITS: {inspectorCourse.credits.toFixed(1)}]
                      </span>

                      {/* Exam Date Tag */}
                      {inspectorCourse.examPct > 0 ? (
                        <span className="px-2.5 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-800 font-medium">
                          [EXAM DATE: UNKNOWN · NOT PUBLISHED]
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md border border-green-200 bg-green-50 text-green-800 font-medium">
                          [NO FINAL EXAM · 100% COURSEWORK]
                        </span>
                      )}

                      {/* Next Offering */}
                      <span className="px-2.5 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-800 font-medium">
                        [NEXT OFFERING: SEM A 2027/28 UNKNOWN]
                      </span>
                    </div>

                    {/* Course Description */}
                    <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                      {courseDescriptions[inspectorCourse.code] || 'Comprehensive foundational principles, computational inquiry, structured project development, and academic assessments.'}
                    </p>

                    {renderSectionSelectors(inspectorCourse)}

                    {/* Weekly Workload Hour Distribution (Segmented Meter Bar) */}
                    <div className="border-t border-black/10 pt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                          Weekly Workload Hour Distribution
                        </span>
                        <span className="font-mono text-xs font-bold text-[#6c4cff]">
                          Total: {workloadMetrics.totalH.toFixed(1)} hrs/wk
                        </span>
                      </div>

                      {/* Segmented Meter Bar */}
                      <div className="w-full h-3 rounded-md overflow-hidden flex bg-[#eeece6]">
                        <div
                          style={{ width: `${(workloadMetrics.lecH / workloadMetrics.totalH) * 100}%` }}
                          className="bg-[#171717]"
                          title={`Lecture: ${workloadMetrics.lecH} hrs/wk`}
                        />
                        <div
                          style={{ width: `${(workloadMetrics.tutH / workloadMetrics.totalH) * 100}%` }}
                          className="bg-[#6c4cff]"
                          title={`Tutorial: ${workloadMetrics.tutH} hr/wk`}
                        />
                        {workloadMetrics.labH > 0 && (
                          <div
                            style={{ width: `${(workloadMetrics.labH / workloadMetrics.totalH) * 100}%` }}
                            className="bg-[#0891b2]"
                            title={`Laboratory: ${workloadMetrics.labH} hrs/wk`}
                          />
                        )}
                        <div
                          style={{ width: `${(workloadMetrics.projH / workloadMetrics.totalH) * 100}%` }}
                          className="bg-[#d97706]"
                          title={`Project / Group: ${workloadMetrics.projH} hrs/wk`}
                        />
                        <div
                          style={{ width: `${(workloadMetrics.prepH / workloadMetrics.totalH) * 100}%` }}
                          className="bg-[#55b987]"
                          title={`Prep / Reading: ${workloadMetrics.prepH} hrs/wk`}
                        />
                      </div>

                      {/* Readout Legend */}
                      <p className="font-mono text-[11px] text-muted-foreground pt-1">
                        Lecture {workloadMetrics.lecH}h · Tutorial {workloadMetrics.tutH}h · Lab {workloadMetrics.labH}h · Project {workloadMetrics.projH}h · Prep {workloadMetrics.prepH}h
                      </p>
                    </div>

                    {/* What We Know vs Unknown Provenance Box (Lecture 07 AI Must Remain Silent) */}
                    <div className="border-t border-black/10 pt-4 space-y-2">
                      <p className="font-mono text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
                        What We Know &amp; What Remains Unknown
                      </p>
                      <ul className="text-xs space-y-2 text-foreground">
                        <li className="flex items-center justify-between">
                          <span>Assessment weights ({inspectorCourse.courseworkPct}% Coursework / {inspectorCourse.examPct}% Exam)</span>
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#f8f7f3] border text-muted-foreground">
                            Sample syllabus
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Weekly workload estimate ({workloadMetrics.totalH} hrs/wk)</span>
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#f8f7f3] border text-muted-foreground">
                            Sample syllabus
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Personal Time Block (16 hrs/wk)</span>
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#ece9ff] text-[#34266f] border border-[#d9ccff] font-semibold">
                            You entered
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Final examination exact date</span>
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                            {inspectorCourse.examPct > 0 ? 'Unknown · Not Published' : 'N/A (0% Exam)'}
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Whether {inspectorCourse.code} is offered in Sem A 2027/28</span>
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                            Unknown
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Project subgroup weekly meeting times</span>
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                            Unknown
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right 6 Columns: 13-Week Deliverable Map, Prerequisite Tree, Blogs & Action */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Card 2: 13-Week Semester Deliverable Map vs Outside Commitments */}
                  <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm space-y-3">
                    <div>
                      <h3 className="text-xs font-bold text-foreground">
                        13-Week Semester Deliverable Map vs Outside Commitments
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Visualizes deadline collisions against midterm periods and internship days.
                      </p>
                    </div>

                    {/* 13-Week Deliverable Table */}
                    <div className="overflow-x-auto border border-black/10 rounded-xl">
                      <table className="w-full text-center border-collapse text-[11px] font-mono">
                        <thead>
                          <tr className="bg-[#f8f7f3] border-b border-black/10 text-muted-foreground">
                            <th className="p-2 text-left font-semibold border-r border-black/10 whitespace-nowrap">Stream</th>
                            {Array.from({ length: 13 }, (_, i) => i + 1).map(w => (
                              <th key={w} className="p-1.5 min-w-[34px] border-r border-black/5 last:border-r-0">
                                W{w}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Row 1: Course Deliverables */}
                          <tr className="border-b border-black/5">
                            <td className="p-2 text-left font-bold text-[#171717] bg-[#fdfcf9] border-r border-black/10 whitespace-nowrap">
                              {inspectorCourse.code} Deliverables
                            </td>
                            {Array.from({ length: 13 }, (_, i) => i + 1).map(w => {
                              let note = '';
                              let isStress = false;
                              if (w === 4) note = 'Asg 1';
                              else if (w === 7) { note = 'Midterm'; isStress = true; }
                              else if (w === 9) note = 'Asg 2';
                              else if (w === 11) { note = 'Project'; isStress = true; }
                              else if (w === 12) { note = 'Due'; isStress = true; }

                              return (
                                <td
                                  key={w}
                                  className={`p-1.5 border-r border-black/5 last:border-r-0 text-[11px] ${
                                    isStress ? 'bg-[#fee2e2] text-red-800 font-bold' : ''
                                  }`}
                                >
                                  {note}
                                </td>
                              );
                            })}
                          </tr>

                          {/* Row 2: Placement & Sprints */}
                          <tr>
                            <td className="p-2 text-left font-bold text-[#171717] bg-[#fdfcf9] border-r border-black/10 whitespace-nowrap">
                              Placement &amp; Sprints
                            </td>
                            {Array.from({ length: 13 }, (_, i) => i + 1).map(w => {
                              let note = '';
                              let isOverlap = false;
                              if (w === 7) { note = 'Hackathon'; isOverlap = true; }
                              else if (w >= 10 && w <= 12) { note = 'Interviews'; isOverlap = true; }
                              else if (w >= 2 && w <= 13) { note = '16h/w'; }

                              return (
                                <td
                                  key={w}
                                  className={`p-1.5 border-r border-black/5 last:border-r-0 text-[11px] ${
                                    isOverlap ? 'bg-[#ffedd5] text-amber-900 font-bold' : 'text-muted-foreground'
                                  }`}
                                >
                                  {note}
                                </td>
                              );
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card 3: Prerequisite & Sequential Progression Tree */}
                  <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm space-y-3">
                    <h3 className="text-xs font-bold text-foreground">
                      Prerequisite &amp; Sequential Progression Tree
                    </h3>

                    <div className="flex items-center justify-between gap-2 p-3 bg-[#f8f7f3] rounded-xl border border-black/5 text-xs font-mono">
                      {/* Left: Prereq Node */}
                      <div className="p-2 rounded-lg bg-white border border-black/10 text-center flex-1">
                        <span className="text-[11px] text-muted-foreground block uppercase">Prerequisites</span>
                        <span className="font-bold text-foreground">
                          {inspectorCourse.prereqs.length > 0 ? inspectorCourse.prereqs.join(', ') : 'None'}
                        </span>
                      </div>

                      <div className="text-muted-foreground font-bold">&rarr;</div>

                      {/* Center: Target Node */}
                      <div className="p-2.5 rounded-lg bg-[#ece9ff] border border-[#6c4cff] text-center flex-1 shadow-xs">
                        <span className="text-[11px] text-[#34266f] block uppercase font-bold">Target</span>
                        <span className="font-bold text-[#171717]">{inspectorCourse.code}</span>
                      </div>

                      <div className="text-muted-foreground font-bold">&rarr;</div>

                      {/* Right: Next Sequence Node */}
                      <div className="p-2 rounded-lg bg-white border border-black/10 text-center flex-1">
                        <span className="text-[11px] text-muted-foreground block uppercase">Next Sequence</span>
                        <span className="font-bold text-foreground">
                          {inspectorCourse.category === 'stem' ? 'CS4335 / Major Core' : 'Advanced GE Cluster'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Embedded Reviews & Discussion from CityU Student Blogs */}
                  <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h3 className="text-xs font-bold text-foreground">
                          Reviews &amp; Discussion from CityU Student Blogs
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Authentic reviews with semester context. No numerical difficulty score is fabricated.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => changeTab('blogs')}
                        className="text-xs font-mono h-7 text-[#6c4cff] hover:underline"
                      >
                        Browse All Blogs
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {inspectorMatchingBlogs.map(post => (
                        <div key={post.id} className="p-3.5 rounded-xl border border-black/10 bg-[#f8f7f3] space-y-2 text-left">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#171717]">&ldquo;{post.title}&rdquo;</span>
                            <span className="font-mono text-[11px] bg-white border border-black/10 px-1.5 py-0.5 rounded text-muted-foreground">
                              CityU Blogs
                            </span>
                          </div>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            Context: <strong className="text-foreground">{post.author}</strong> · {post.authorMeta}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {post.summary}
                          </p>
                          <button
                            onClick={() => handleOpenPost(post.id)}
                            className="text-xs font-mono text-[#6c4cff] font-semibold hover:underline block pt-1"
                          >
                            Read {post.author}&rsquo;s Full Post on CityU Blogs &rarr;
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Primary Stage Action Button */}
                    <div className="pt-2">
                      {enrolled.includes(inspectorCourse.code) ? (
                        <Button
                          disabled
                          className="w-full text-xs h-10 font-semibold"
                        >
                          Currently Enrolled
                        </Button>
                      ) : selectedReplacements.includes(inspectorCourse.code) ? (
                        <Button
                          onClick={() => changeTab('rehearsal')}
                          className="w-full bg-[#171717] text-white hover:bg-[#6c4cff] text-xs h-10 font-semibold"
                        >
                          Already Staged (View Timetable &rarr;)
                        </Button>
                      ) : (
                        <>
                          {getStageCreditReason(inspectorCourse) && (
                            <p id="inspector-credit-limit" className="mb-2 text-xs font-medium text-red-600">{getStageCreditReason(inspectorCourse)}</p>
                          )}
                          <Button
                            disabled={Boolean(getStageCreditReason(inspectorCourse))}
                            aria-describedby={getStageCreditReason(inspectorCourse) ? 'inspector-credit-limit' : undefined}
                            onClick={() => {
                              if (handleStageCourse(inspectorCourse.code)) changeTab('rehearsal');
                            }}
                            className="w-full bg-[#171717] text-white hover:bg-[#6c4cff] text-xs h-10 font-semibold"
                          >
                            Stage {inspectorCourse.code} in Weekly Timetable &rarr;
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              </div>
              )}
            </div>
          )}

          {/* TAB 3: CITYU BLOGS */}
          {activeTab === 'blogs' && (
            <div className="mx-auto max-w-6xl space-y-6 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200 motion-safe:ease-out">
              {!openPostId ? (
                <>
                  <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">CityU Course Experience Blogs</h1>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Example posts and verification labels are simulated, not university checks. Shared posts stay in this session.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setShareExperienceOpen(true)}
                      className="h-9 shrink-0 bg-[#171717] text-xs font-semibold text-white hover:bg-[#6c4cff]"
                    >
                      + Share Course Experience
                    </Button>
                  </div>

                  <div className="h-10 w-full rounded-xl border border-[#E4E1DA] bg-white px-3 flex items-center gap-2 focus-within:border-[#18181B] focus-within:ring-1 focus-within:ring-[#18181B]">
                    <Search className="h-4 w-4 shrink-0 text-[#71717A]" aria-hidden="true" />
                    <input
                      value={blogSearchQuery}
                      onChange={event => setBlogSearchQuery(event.target.value)}
                      aria-label="Search course experience blogs"
                      placeholder="Search course code, topic, or author (e.g., CS3334, EE4213)"
                      className="h-full min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#71717A]"
                    />
                    {blogSearchQuery && (
                      <button
                        type="button"
                        aria-label="Clear blog search"
                        onClick={() => setBlogSearchQuery('')}
                        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-black/50 transition hover:bg-black/5 hover:text-[#18181B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#18181B]"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                      {([
                        ['all', 'All'],
                        ['stem', 'STEM'],
                        ['ge', 'GE'],
                        ['workload', 'Workload'],
                        ['transfer', 'Direct-Entry']
                      ] as const).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setBlogFilter(value)}
                          aria-pressed={blogFilter === value}
                          className={`rounded px-2.5 py-1.5 font-semibold transition ${
                            blogFilter === value ? 'bg-[#171717] text-white' : 'bg-[#f5f4ef] text-muted-foreground hover:bg-[#eeece6]'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#52525B]">
                      <span>Verification</span>
                      <select
                        value={blogVerificationFilter}
                        onChange={event => {
                          const value = event.target.value;
                          if (value === 'all' || value === 'verified' || value === 'pending') setBlogVerificationFilter(value);
                        }}
                        className="h-9 rounded-lg border border-[#E4E1DA] bg-white px-2.5 text-xs font-medium text-[#18181B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181B]"
                      >
                        <option value="all">All statuses</option>
                        <option value="verified">Verified (demo)</option>
                        <option value="pending">Pending (demo)</option>
                      </select>
                    </label>
                  </div>

                  {filteredBlogPosts.length === 0 ? (
                    <div className="space-y-2 rounded-xl border border-dashed border-[#E4E1DA] bg-white p-8 text-center" role="status">
                      <p className="text-sm text-muted-foreground">
                        {blogSearchQuery.trim() ? <>No posts match "<span className="font-semibold text-foreground">{blogSearchQuery}</span>" with these filters.</> : 'No posts match these filters.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setBlogSearchQuery('');
                          setBlogFilter('all');
                          setBlogVerificationFilter('all');
                        }}
                        className="text-xs font-semibold text-[#4F46E5] hover:underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {filteredBlogPosts.map(post => (
                        <article
                          key={post.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleOpenPost(post.id)}
                          onKeyDown={event => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              handleOpenPost(post.id);
                            }
                          }}
                          className="group cursor-pointer space-y-3 rounded-2xl border border-black/10 bg-white p-5 text-left shadow-sm transition-[transform,border-color,box-shadow] duration-200 motion-safe:hover:-translate-y-1 hover:border-[#6c4cff]/50 hover:shadow-md motion-safe:active:translate-y-0 motion-reduce:transition-none"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-[#d9ff63] font-mono text-xs font-bold text-[#171717]">
                                <span>{post.initials}</span>
                                {post.avatarUrl && (
                                  <img
                                    src={post.avatarUrl}
                                    alt={`${post.author} portrait`}
                                    onError={event => { event.currentTarget.hidden = true; }}
                                    className="absolute inset-0 h-full w-full object-cover"
                                  />
                                )}
                              </span>
                              <div className="min-w-0">
                                <h2 className="truncate text-xs font-bold">{post.author}</h2>
                                <p className="mt-0.5 text-[11px] text-muted-foreground">
                                  {post.date} · {post.comments.length} comments
                                </p>
                              </div>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              {post.readTime && (
                                <span className="rounded-full bg-[#f5f4ef] px-2 py-1 font-mono text-[10px] text-muted-foreground">
                                  {post.readTime}
                                </span>
                              )}
                              {post.courseCode && (
                                <button
                                  type="button"
                                  onClick={event => {
                                    event.stopPropagation();
                                    setBlogSearchQuery(post.courseCode || '');
                                    setBlogFilter('all');
                                    setBlogVerificationFilter('all');
                                  }}
                                  onKeyDown={event => event.stopPropagation()}
                                  aria-label={`Filter posts for ${post.courseCode}`}
                                  className="rounded-full border border-black/10 bg-[#f8f7f3] px-2 py-1 font-mono text-[11px] hover:border-[#6c4cff]"
                                >
                                  {post.courseCode}
                                </button>
                              )}
                            </div>
                          </div>

                          <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${
                            post.verificationStatus === 'verified'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-amber-200 bg-amber-50 text-amber-800'
                          }`}>
                            {post.verificationStatus === 'verified' ? 'Verified (demo)' : 'Pending (demo)'}
                          </span>
                          <h3 className="text-base font-bold leading-snug">{post.title}</h3>
                          <p className="text-xs text-muted-foreground">{post.subtitle}</p>
                          <p className="text-xs leading-relaxed text-muted-foreground">{post.summary}</p>
                          <div className="rounded-r-lg border-l-4 border-[#6c4cff] bg-[#f8f7f3] p-3 text-xs leading-relaxed text-muted-foreground">
                            <span className="font-semibold text-[#171717]">Context when written: </span>
                            {post.authorMeta}
                          </div>
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <button
                              type="button"
                              aria-pressed={helpfulPostIds.includes(post.id)}
                              onClick={event => {
                                event.stopPropagation();
                                toggleHelpfulPost(post.id);
                              }}
                              onKeyDown={event => event.stopPropagation()}
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-[transform,background-color,border-color,color] duration-200 motion-safe:active:scale-95 motion-reduce:transition-none ${
                                helpfulPostIds.includes(post.id)
                                  ? 'border-[#6c4cff] bg-[#ece9ff] text-[#34266f]'
                                  : 'border-black/10 bg-white text-muted-foreground hover:border-[#6c4cff]/50 hover:text-[#34266f]'
                              }`}
                            >
                              Helpful ({helpfulCountFor(post)})
                            </button>
                            <button
                              type="button"
                              onClick={event => {
                                event.stopPropagation();
                                handleOpenPost(post.id);
                              }}
                              onKeyDown={event => event.stopPropagation()}
                              className="inline-flex items-center gap-1 pt-1 text-xs font-semibold text-[#4F46E5] hover:underline"
                            >
                              Read Full Post
                              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 motion-safe:group-hover:translate-x-1.5 motion-reduce:transition-none" aria-hidden="true" />
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              ) : activeBlogPost ? (
                <>
                  <button
                    type="button"
                    onClick={() => setOpenPostId(null)}
                    className="text-xs font-semibold text-[#4F46E5] hover:underline"
                  >
                    ← Back to All Blogs
                  </button>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <article id={`blog-post-${activeBlogPost.id}`} className="space-y-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm md:p-7">
                      <header className="space-y-3 border-b border-black/10 pb-4">
                        <h1 className="text-2xl font-bold leading-tight md:text-3xl">{activeBlogPost.title}</h1>
                        <p className="text-sm text-muted-foreground">{activeBlogPost.subtitle}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold">{activeBlogPost.author}</span>
                          <span className="text-muted-foreground">· {activeBlogPost.date}</span>
                          <span className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${
                            activeBlogPost.verificationStatus === 'verified'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-amber-200 bg-amber-50 text-amber-800'
                          }`}>
                            {activeBlogPost.verificationStatus === 'verified' ? 'Verified (demo)' : 'Pending (demo)'}
                          </span>
                        </div>
                      </header>

                      <div className="rounded-r-lg border-l-4 border-[#6c4cff] bg-[#f8f7f3] p-3 text-xs leading-relaxed text-muted-foreground">
                        <span className="font-semibold text-[#171717]">Context when written: </span>
                        {activeBlogPost.authorMeta}
                      </div>

                      <div className="space-y-4 text-sm leading-relaxed text-foreground">
                        {activeBlogPost.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {activeBlogPost.tags.map(tag => (
                          <span key={tag} className="rounded-full border border-[#d9ccff] bg-[#ece9ff] px-2 py-0.5 font-mono text-[11px] text-[#34266f]">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <section className="space-y-3 border-t border-black/10 pt-4">
                        <h2 className="text-sm font-bold">Comments &amp; Peer Q&amp;A ({activeBlogPost.comments.length})</h2>
                        {activeBlogPost.comments.map((comment, index) => (
                          <div key={`${comment.user}-${index}`} className="rounded-lg border border-black/5 bg-[#f8f7f3] p-3 text-xs">
                            <span className="font-semibold">{comment.user}</span>
                            <p className="mt-1 leading-relaxed text-muted-foreground">{comment.text}</p>
                          </div>
                        ))}
                        <form
                          className="space-y-2"
                          onSubmit={event => {
                            event.preventDefault();
                            const text = (commentDrafts[activeBlogPost.id] || '').trim();
                            if (!text) return;
                            setPosts(current => current.map(post => post.id === activeBlogPost.id
                              ? {
                                  ...post,
                                  comments: [...post.comments, { user: "Marcus Li '28", text }],
                                  commentCount: post.comments.length + 1
                                }
                              : post
                            ));
                            setCommentDrafts(current => ({ ...current, [activeBlogPost.id]: '' }));
                          }}
                        >
                          <label htmlFor="blog-comment" className="block text-xs font-semibold">Add a comment</label>
                          <textarea
                            id="blog-comment"
                            value={commentDrafts[activeBlogPost.id] || ''}
                            onChange={event => setCommentDrafts(current => ({ ...current, [activeBlogPost.id]: event.target.value }))}
                            placeholder="Share a helpful follow-up or question..."
                            rows={3}
                            className="w-full rounded-lg border border-[#E4E1DA] bg-white p-3 text-xs outline-none focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]"
                          />
                          <Button type="submit" disabled={!(commentDrafts[activeBlogPost.id] || '').trim()} className="h-8 bg-[#171717] text-xs text-white hover:bg-[#6c4cff]">
                            Post Comment
                          </Button>
                        </form>
                      </section>
                      <div className="flex justify-end border-t border-black/10 pt-4">
                        <button
                          type="button"
                          aria-pressed={helpfulPostIds.includes(activeBlogPost.id)}
                          onClick={() => toggleHelpfulPost(activeBlogPost.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-[transform,background-color,border-color,color] duration-200 motion-safe:active:scale-95 motion-reduce:transition-none ${
                            helpfulPostIds.includes(activeBlogPost.id)
                              ? 'border-[#6c4cff] bg-[#ece9ff] text-[#34266f]'
                              : 'border-black/10 bg-white text-muted-foreground hover:border-[#6c4cff]/50 hover:text-[#34266f]'
                          }`}
                        >
                          Helpful ({helpfulCountFor(activeBlogPost)})
                        </button>
                      </div>
                    </article>

                    <aside className="space-y-4">
                      <section className="space-y-2 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                        <span className="relative mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-full border-2 border-[#E4E1DA] bg-[#d9ff63] font-mono text-lg font-bold text-[#171717] shadow-sm">
                          <span>{activeBlogPost.initials}</span>
                          {activeBlogPost.avatarUrl && (
                            <img
                              src={activeBlogPost.avatarUrl}
                              alt={`${activeBlogPost.author} portrait`}
                              onError={event => { event.currentTarget.hidden = true; }}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}
                        </span>
                        <h2 className="text-sm font-bold">About {activeBlogPost.author}</h2>
                        <p className="text-xs leading-relaxed text-muted-foreground">{activeBlogPost.aboutAuthor}</p>
                      </section>

                      <section className="space-y-2 rounded-2xl border border-[#E4E1DA] bg-[#f8f7f3] p-4 text-xs leading-relaxed text-muted-foreground">
                        <h2 className="font-bold text-[#171717]">Verification &amp; provenance</h2>
                        <p>
                          Verification labels are simulated for this prototype. Posts are not submitted for university review.
                        </p>
                      </section>

                      {activeBlogCourse && (
                        <section className="space-y-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                          <h2 className="text-sm font-bold">Course Actions</h2>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenInspector(activeBlogCourse.code)}
                            className="h-auto min-h-9 w-full whitespace-normal text-left text-xs"
                          >
                            Inspect {activeBlogCourse.code} Diagnostics →
                          </Button>
                          {enrolled.includes(activeBlogCourse.code) ? (
                            <Button type="button" disabled className="w-full text-xs">
                              Currently Enrolled
                            </Button>
                          ) : (
                            <>
                              {getStageCreditReason(activeBlogCourse) && (
                                <p id="blog-credit-limit" className="text-xs font-medium text-red-600">{getStageCreditReason(activeBlogCourse)}</p>
                              )}
                              <Button
                                type="button"
                                disabled={Boolean(getStageCreditReason(activeBlogCourse))}
                                aria-describedby={getStageCreditReason(activeBlogCourse) ? 'blog-credit-limit' : undefined}
                                onClick={() => {
                                  if (handleStageCourse(activeBlogCourse.code)) changeTab('rehearsal');
                                }}
                                className="h-auto min-h-9 w-full whitespace-normal bg-[#171717] text-left text-xs text-white hover:bg-[#6c4cff]"
                              >
                                {selectedReplacements.includes(activeBlogCourse.code) ? `View staged ${activeBlogCourse.code}` : `Stage ${activeBlogCourse.code} in Timetable`} →
                              </Button>
                            </>
                          )}
                        </section>
                      )}

                      <section className="space-y-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-bold">More from CityU Blogs</h2>
                        <div className="space-y-2">
                          {posts.filter(post => post.id !== activeBlogPost.id).slice(0, 2).map(post => (
                            <button
                              key={post.id}
                              type="button"
                              onClick={() => {
                                setOpenPostId(post.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="block w-full rounded-lg border border-[#E4E1DA] p-3 text-left transition-colors hover:border-[#6c4cff]/50 hover:bg-[#f8f7f3]"
                            >
                              <span className="block text-xs font-semibold leading-snug">{post.title}</span>
                              <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                                {post.courseCode || 'CityU experience'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </section>
                    </aside>
                  </div>
                </>
              ) : null}

              <AnimatedOverlay
                  open={shareExperienceOpen}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                  onClick={event => {
                    if (event.target === event.currentTarget) setShareExperienceOpen(false);
                  }}
                >
                  <div ref={shareExperienceRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="share-experience-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-black/10 bg-white p-6 shadow-2xl outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <h2 id="share-experience-title" className="text-lg font-bold">Share Course Experience</h2>
                        <p className="mt-1 text-xs text-muted-foreground">No login or ratings required. Posts stay in this session and are not submitted for review.</p>
                      </div>
                      <button type="button" aria-label="Close share form" onClick={() => setShareExperienceOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-black/5 hover:text-foreground">
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <form
                      className="space-y-4"
                      onSubmit={event => {
                        event.preventDefault();
                        const body = shareBody.trim().split(/\n\s*\n/).filter(Boolean);
                        const courseCode = shareCourseCode.trim().toUpperCase();
                        const title = shareTitle.trim();
                        const subtitle = shareSubtitle.trim();
                        const authorMeta = shareContext.trim();
                        if (!courseCode || !title || !subtitle || !authorMeta || body.length === 0) {
                          toast.error('Complete every field before sharing your course experience.');
                          return;
                        }

                        const newPost: BlogPost = {
                          id: `post-${Date.now()}`,
                          title,
                          subtitle,
                          author: "Marcus Li '28",
                          initials: 'ML',
                          avatarUrl: './avatars/marcus.svg',
                          readTime: '2 min read',
                          helpfulCount: 0,
                          date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                          verificationStatus: 'pending',
                          commentCount: 0,
                          authorMeta,
                          aboutAuthor: 'CityU undergraduate · Self-submitted experience in this prototype.',
                          summary: (body[0] || '').slice(0, 220),
                          body,
                          comments: [],
                          tags: [shareCategory],
                          courseCode
                        };
                        setPosts(current => [newPost, ...current]);
                        setBlogSearchQuery('');
                        setBlogFilter('all');
                        setBlogVerificationFilter('all');
                        setShareExperienceOpen(false);
                        setShareCourseCode('');
                        setShareTitle('');
                        setShareSubtitle('');
                        setShareCategory('stem');
                        setShareContext('');
                        setShareBody('');
                      }}
                    >
                      <label className="block space-y-1.5 text-xs font-semibold">
                        <span>Course Code</span>
                        <input required value={shareCourseCode} onChange={event => setShareCourseCode(event.target.value)} placeholder="e.g., EE4213" className="h-9 w-full rounded-lg border border-[#E4E1DA] px-3 font-normal outline-none focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]" />
                      </label>
                      <label className="block space-y-1.5 text-xs font-semibold">
                        <span>Post Title</span>
                        <input required value={shareTitle} onChange={event => setShareTitle(event.target.value)} placeholder="A clear, specific title" className="h-9 w-full rounded-lg border border-[#E4E1DA] px-3 font-normal outline-none focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]" />
                      </label>
                      <label className="block space-y-1.5 text-xs font-semibold">
                        <span>Subtitle</span>
                        <input required value={shareSubtitle} onChange={event => setShareSubtitle(event.target.value)} placeholder="A one-line summary" className="h-9 w-full rounded-lg border border-[#E4E1DA] px-3 font-normal outline-none focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]" />
                      </label>
                      <label className="block space-y-1.5 text-xs font-semibold">
                        <span>Category Tag</span>
                        <select
                          value={shareCategory}
                          onChange={event => {
                            const value = event.target.value;
                            if (value === 'stem' || value === 'ge' || value === 'workload' || value === 'transfer') {
                              setShareCategory(value);
                            }
                          }}
                          className="h-9 w-full rounded-lg border border-[#E4E1DA] bg-white px-3 font-normal outline-none focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]"
                        >
                          <option value="stem">STEM</option>
                          <option value="ge">GE</option>
                          <option value="workload">Workload</option>
                          <option value="transfer">Direct-Entry</option>
                        </select>
                      </label>
                      <label className="block space-y-1.5 text-xs font-semibold">
                        <span>Semester &amp; Weekly Hours Context</span>
                        <input required value={shareContext} onChange={event => setShareContext(event.target.value)} placeholder="e.g., Sem A 2026/27 · Year 3 CDE · ~10h/wk" className="h-9 w-full rounded-lg border border-[#E4E1DA] px-3 font-normal outline-none focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]" />
                      </label>
                      <label className="block space-y-1.5 text-xs font-semibold">
                        <span>Reflection Body</span>
                        <textarea required value={shareBody} onChange={event => setShareBody(event.target.value)} rows={5} placeholder="Write your course experience. Separate paragraphs with a blank line." className="w-full rounded-lg border border-[#E4E1DA] p-3 font-normal outline-none focus:border-[#18181B] focus:ring-1 focus:ring-[#18181B]" />
                      </label>
                      <div className="flex justify-end gap-2 border-t border-black/10 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShareExperienceOpen(false)} className="text-xs">
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-[#171717] text-xs text-white hover:bg-[#6c4cff]">
                          Share Post
                        </Button>
                      </div>
                    </form>
                  </div>
              </AnimatedOverlay>
            </div>
          )}
        </main>
      </div>

      {/* HUMAN-IN-THE-LOOP CONTROL GATE MODAL */}
      {inspectorCourse && (
        <SyllabusDrawer
          course={inspectorCourse}
          open={syllabusDrawerOpen && activeTab === 'inspector'}
          isEnrolled={enrolled.includes(inspectorCourse.code)}
          isStaged={selectedReplacements.includes(inspectorCourse.code)}
          stageBlockReason={getStageCreditReason(inspectorCourse)}
          onClose={() => setSyllabusDrawerOpen(false)}
          onSelectCourse={(code) => { keepDrawerOpenRef.current = code !== inspectorCourseCode; setInspectorCourseCode(code); }}
          onStage={handleStageCourse}
        />
      )}

      <AnimatedOverlay
          open={showCommitmentManager}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={event => {
            if (event.target === event.currentTarget) setShowCommitmentManager(false);
          }}
        >
          <div
            ref={commitmentManagerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="commitment-manager-title"
            tabIndex={-1}
            className="max-h-[90vh] max-w-lg w-full overflow-y-auto rounded-2xl border border-[#E4E1DA] bg-white p-6 shadow-xl outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="commitment-manager-title" className="text-lg font-bold text-[#18181B]">Personal commitments</h2>
                <p className="mt-1 text-xs leading-relaxed text-[#52525B]">Block internships, part-time shifts, or study windows to test timetable trade-offs before AIMS registration.</p>
              </div>
              <button
                type="button"
                aria-label="Close personal commitments"
                onClick={() => setShowCommitmentManager(false)}
                className="rounded p-1 text-[#52525B] transition-colors hover:bg-[#F7F5F0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#18181B]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <h3 className="text-sm font-semibold">Saved commitments</h3>
              {personalCommitments.length === 0 ? (
                <div className="rounded-lg border border-[#E4E1DA] bg-[#F7F5F0] p-3 text-xs">
                  <p>No personal commitments added yet.</p>
                  <button
                    type="button"
                    onClick={() => setPersonalCommitments(DEFAULT_COMMITMENTS.map(commitment => ({ ...commitment, days: [...commitment.days] })))}
                    className="mt-2 font-semibold underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#18181B]"
                  >
                    Restore sample commitments
                  </button>
                </div>
              ) : personalCommitments.map(commitment => (
                <div key={commitment.id} className="flex items-start gap-3 rounded-lg border border-[#E4E1DA] p-3">
                  <input
                    type="checkbox"
                    checked={commitment.enabled}
                    aria-label={`Enable ${commitment.label}`}
                    onChange={event => {
                      const enabled = event.target.checked;
                      setPersonalCommitments(current => current.map(item =>
                        item.id === commitment.id ? { ...item, enabled } : item
                      ));
                    }}
                    className="mt-1 accent-[#18181B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#18181B]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold">{commitment.label}</span>
                      <span className="rounded-md border border-[#E4E1DA] bg-[#F7F5F0] px-2 py-0.5 text-xs text-[#18181B]">{commitment.category}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-[#52525B]">
                      {commitment.days.map(day => <span key={day} className="rounded border border-[#E4E1DA] px-1.5 py-0.5">{day}</span>)}
                      <span className="ml-1">{formatHour(commitment.startHour)} - {formatHour(commitment.endHour)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Edit ${commitment.label} series`}
                    onClick={() => editCommitment(commitment)}
                    className="rounded p-1 text-[#52525B] hover:bg-[#F7F5F0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#18181B]"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${commitment.label}`}
                    onClick={() => setPersonalCommitments(current => current.filter(item => item.id !== commitment.id))}
                    className="rounded p-1 text-[#52525B] transition-colors hover:bg-[#F7F5F0] hover:text-[#18181B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#18181B]"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <form
              className="mt-5 space-y-4 border-t border-[#E4E1DA] pt-4"
              onSubmit={event => {
                event.preventDefault();
                const label = newLabel.trim();
                if (!label || newDays.length === 0 || newEndHour <= newStartHour) {
                  toast.error('Enter a title, day, and valid start and end time.');
                  return;
                }
                const editingCommitment = personalCommitments.find(item => item.id === editingCommitmentId);
                if (editingCommitmentDay && newDays[0] !== editingCommitmentDay && editingCommitment?.days.includes(newDays[0])) {
                  toast.error(`This commitment already has a ${newDays[0]} block. Edit or remove it first.`);
                  return;
                }
                setPersonalCommitments(current => {
                  const edited = current.find(item => item.id === editingCommitmentId);
                  const updated: PersonalCommitment = {
                    id: editingCommitmentId && !editingCommitmentDay ? editingCommitmentId : crypto.randomUUID(),
                    label, category: newCategory, days: [...newDays],
                    startHour: newStartHour, endHour: newEndHour, enabled: edited?.enabled ?? true
                  };
                  if (!edited) return [...current, updated];
                  if (!editingCommitmentDay) return current.map(item => item.id === edited.id ? updated : item);
                  return [...current.flatMap(item => {
                    if (item.id !== edited.id) return [item];
                    const days = item.days.filter(day => day !== editingCommitmentDay);
                    return days.length ? [{ ...item, days }] : [];
                  }), updated];
                });
                setBlockPersonalTime(true);
                setNewLabel('');
                setEditingCommitmentId(null);
                setEditingCommitmentDay(null);
              }}
            >
              <h3 className="text-sm font-semibold">{editingCommitmentId ? editingCommitmentDay ? `Edit ${editingCommitmentDay} block` : 'Edit commitment series' : 'Add a commitment'}</h3>
              <label className="block space-y-1 text-xs font-semibold">
                <span>Commitment title</span>
                <input
                  ref={commitmentTitleRef}
                  value={newLabel}
                  onChange={event => setNewLabel(event.target.value)}
                  placeholder="e.g., Industrial placement, Hackathon prep"
                  className="h-10 w-full rounded-lg border border-[#E4E1DA] bg-white px-3 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#18181B]"
                />
              </label>
              <label className="block space-y-1 text-xs font-semibold">
                <span>Category</span>
                <select
                  value={newCategory}
                  onChange={event => {
                    const category = event.target.value;
                    if (category === 'Internship' || category === 'Part-time work' || category === 'Hackathon / project' || category === 'Personal') setNewCategory(category);
                  }}
                  className="h-10 w-full rounded-lg border border-[#E4E1DA] bg-white px-3 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#18181B]"
                >
                  <option>Internship</option>
                  <option>Part-time work</option>
                  <option>Hackathon / project</option>
                  <option>Personal</option>
                </select>
              </label>
              <fieldset>
                <legend className="mb-1.5 text-xs font-semibold">Repeat days</legend>
                <div className="flex flex-wrap gap-2">
                  {COMMITMENT_DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      aria-pressed={newDays.includes(day)}
                      onClick={() => setNewDays(current => editingCommitmentDay ? [day] : current.includes(day) ? current.filter(item => item !== day) : COMMITMENT_DAYS.filter(item => item === day || current.includes(item)))}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181B] ${
                        newDays.includes(day) ? 'border-[#18181B] bg-[#18181B] text-[#D9F99D]' : 'border-[#E4E1DA] bg-white text-[#18181B] hover:bg-[#F7F5F0]'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1 text-xs font-semibold">
                  <span>Start time</span>
                  <select
                    value={newStartHour}
                    onChange={event => {
                      const hour = Number(event.target.value);
                      setNewStartHour(hour);
                      setNewEndHour(current => Math.max(hour + 0.5, current));
                    }}
                    className="h-10 w-full rounded-lg border border-[#E4E1DA] bg-white px-3 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#18181B]"
                  >
                    {Array.from({ length: 30 }, (_, index) => 8 + index / 2).map(hour => <option key={hour} value={hour}>{formatHour(hour)}</option>)}
                  </select>
                </label>
                <label className="block space-y-1 text-xs font-semibold">
                  <span>End time</span>
                  <select
                    value={newEndHour}
                    onChange={event => setNewEndHour(Number(event.target.value))}
                    className="h-10 w-full rounded-lg border border-[#E4E1DA] bg-white px-3 font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#18181B]"
                  >
                    {Array.from({ length: (23 - newStartHour) * 2 }, (_, index) => newStartHour + 0.5 + index / 2).map(hour => <option key={hour} value={hour}>{formatHour(hour)}</option>)}
                  </select>
                </label>
              </div>
              <button
                type="submit"
                disabled={!newLabel.trim() || newDays.length === 0}
                className="w-full rounded-lg bg-[#18181B] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#27272A] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181B]"
              >
                {editingCommitmentId ? 'Save changes' : '+ Add time block'}
              </button>
              {editingCommitmentId && (
                <button type="button" onClick={() => { setEditingCommitmentId(null); setEditingCommitmentDay(null); setNewLabel(''); }} className="w-full text-xs font-semibold underline">
                  Cancel editing
                </button>
              )}
            </form>
          </div>
      </AnimatedOverlay>

      <AnimatedOverlay
          open={controlGateOpen}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeControlGate(); }}
        >
          <div
            ref={controlGateRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="control-gate-title"
            tabIndex={-1}
            className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-black/10 space-y-5 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200 outline-none"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <h3 id="control-gate-title" className="text-base font-bold">Control Gate Verification</h3>
              </div>
              <button onClick={closeControlGate} aria-label="Close Control Gate" className="text-muted-foreground hover:text-black">
                <X className="h-4 w-4" />
              </button>
            </div>

            {stagedPersonalOverlaps.length > 0 && (
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <p className="font-bold">Personal time overlap</p>
                <ul className="list-disc space-y-1 pl-4">
                  {stagedPersonalOverlaps.map(block => <li key={block.id}>{personalOverlapMessage(block)}</li>)}
                </ul>
                <label className="flex items-start gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={personalOverlapAcknowledged}
                    onChange={event => setPersonalOverlapAcknowledged(event.target.checked)}
                    className="mt-0.5 accent-[#18181B]"
                  />
                  <span>I understand this overlaps my personal time and want to review the AIMS CRNs.</span>
                </label>
              </div>
            )}

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-2 gap-4 bg-[#f8f7f3] p-4 rounded-xl border border-black/5 text-xs">
              <div className="border-r pr-2 space-y-1">
                <span className="font-mono text-[11px] uppercase font-bold text-red-600">[DROP TARGET]</span>
                {swapOutCourse ? (
                  <>
                    <p className="font-bold text-sm">{swapOutCourse.code}</p>
                    <p className="text-muted-foreground">{swapOutCourse.title}</p>
                    <p className="font-mono text-[11px]">{canSeeCrns ? `${getCourseCrnSummary(swapOutCourse)} · ` : ''}{swapOutCourse.credits} CR</p>
                    <div className="space-y-0.5 text-[10px] font-mono text-muted-foreground">
                      {getResolvedMeetings(swapOutCourse, selectedSections).map(meeting => (
                        <p key={meeting.crn}>
                          {meeting.section} {meeting.type}: {meeting.day} {meeting.start}–{meeting.end}
                        </p>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="italic text-muted-foreground">No course dropped</p>
                )}
              </div>

              <div className="pl-2 space-y-1">
                <span className="font-mono text-[11px] uppercase font-bold text-green-600">[ADD CANDIDATES]</span>
                {stagedCourses.length ? stagedCourses.map(course => (
                  <div key={course.code} className="space-y-1">
                    <p className="font-bold text-sm">{course.code}</p>
                    <p className="text-muted-foreground">{course.title}</p>
                    <p className="font-mono text-[11px]">{canSeeCrns ? `${getCourseCrnSummary(course)} · ` : ''}{course.credits} CR</p>
                    <div className="space-y-0.5 text-[10px] font-mono text-muted-foreground">
                      {getResolvedMeetings(course, selectedSections).map(meeting => (
                        <p key={meeting.crn}>
                          {meeting.section} {meeting.type}: {meeting.day} {meeting.start}–{meeting.end}
                        </p>
                      ))}
                    </div>
                  </div>
                )) : (
                  <p className="italic text-muted-foreground">No course staged</p>
                )}
              </div>
            </div>

            {/* Credit Policy Load Compliance Summary */}
            <div className={`p-3 rounded-lg text-xs font-mono flex items-center justify-between ${
              !wouldBeBelowMin && !wouldExceedMax ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <span>Projected Total Load: {projectedCredits.toFixed(1)} Credits</span>
              <span>
                {wouldBeBelowMin
                  ? `VIOLATION (< ${activeMinCredits.toFixed(1)} CR)`
                  : wouldExceedMax
                    ? `VIOLATION (> ${activeMaxCredits.toFixed(1)} CR)`
                    : `Policy Load OK (${activeMinCredits.toFixed(1)}–${activeMaxCredits.toFixed(1)} CR)`}
              </span>
            </div>

            {/* Adaptive AIMS Handoff Checklist: only the steps that apply to this change */}
            {hasPendingChange && canSeeCrns && (
              <div className="space-y-2 border-t pt-3">
                <p className="text-xs font-bold text-muted-foreground uppercase font-mono">
                  Mandatory Execution Checklist
                </p>

                {(() => {
                  const steps: { key: string; checked: boolean; set: (v: boolean) => void; label: string }[] = [];
                  if (stagedCourses.length) {
                    steps.push({
                      key: 'verify',
                      checked: handoffStep1,
                      set: setHandoffStep1,
                      label: `Verified live seat availability on AIMS for ${stagedCourses.map(course => `${course.code}: ${getCourseCrnSummary(course)}`).join('; ')}.`
                    });
                  }
                  if (swapOutCourse) {
                    steps.push({
                      key: 'drop',
                      checked: handoffStep2,
                      set: setHandoffStep2,
                      label: `Executed drop for ${swapOutCourse.code} on AIMS using ${getCourseCrnSummary(swapOutCourse)}.`
                    });
                  }
                  if (stagedCourses.length) {
                    steps.push({
                      key: 'add',
                      checked: handoffStep3,
                      set: setHandoffStep3,
                      label: `Executed adds on AIMS for ${stagedCourses.map(course => `${course.code}: ${getCourseCrnSummary(course)}`).join('; ')}.`
                    });
                  }
                  return steps.map((step, i) => (
                    <label key={step.key} className="flex items-start gap-2.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={step.checked}
                        onChange={(e) => step.set(e.target.checked)}
                        className="mt-0.5 rounded"
                      />
                      <span>{i + 1}. {step.label}</span>
                    </label>
                  ));
                })()}
              </div>
            )}

            {/* Explicit reason(s) Confirm is unavailable */}
            {confirmBlockers.length > 0 && (
              <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 space-y-1">
                <p className="font-bold">Confirm is disabled because:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {confirmBlockers.map(reason => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
            {confirmBlockers.length === 0 && canSeeCrns && !checklistComplete && (
              <p className="text-[11px] text-muted-foreground">
                Confirm unlocks once every checklist step above is ticked.
              </p>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <Button variant="ghost" size="sm" onClick={closeControlGate} className="text-xs">
                Cancel
              </Button>

              <Button
                size="sm"
                disabled={!canConfirm}
                onClick={() => {
                  executeSimulatedSwap();
                  setControlGateOpen(false);
                }}
                className="bg-[#171717] text-white hover:bg-[#6c4cff] text-xs h-9"
              >
                {stagedCourses.length ? 'Confirm Draft in Simulation' : 'Confirm Drop in Simulation'}
              </Button>
            </div>
          </div>
      </AnimatedOverlay>
    </div>
  );
}
