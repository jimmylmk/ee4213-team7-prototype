import { useState, useMemo, useEffect, useRef } from "react";
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
  Briefcase,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Menu,
  ChevronRight,
  Plus,
  Info
} from "lucide-react";
import {
  masterSchedule,
  blogPosts,
  studentProfile,
  validateCourse,
  parseMinutes,
  Course,
  BlogPost
} from "../data/courseData";
import { BrandMark } from "./Header";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

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
  const initialView = searchParams.get('view') || 'rehearsal';

  // Navigation
  const [activeTab, setActiveTab] = useState<'rehearsal' | 'inspector' | 'blogs'>(
    initialView === 'inspector' ? 'inspector' : initialView === 'blogs' ? 'blogs' : 'rehearsal'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Simulation State
  const [enrolled, setEnrolled] = useState<string[]>([...studentProfile.baselineEnrolled]);
  const [swapOutId, setSwapOutId] = useState<string | null>(null);
  const [selectedReplacement, setSelectedReplacement] = useState<string | null>(null);
  const [outsideCommitments, setOutsideCommitments] = useState<boolean>(true);
  const [highlightBridge, setHighlightBridge] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'ge' | 'stem' | 'coursework' | 'open' | 'noclash'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Course Inspector State
  const [inspectorCourseCode, setInspectorCourseCode] = useState<string>('CS3334');

  // Control Gate Modal State
  const [controlGateOpen, setControlGateOpen] = useState(false);
  const [handoffStep1, setHandoffStep1] = useState(false);
  const [handoffStep2, setHandoffStep2] = useState(false);
  const [handoffStep3, setHandoffStep3] = useState(false);
  const [swapConfirmed, setSwapConfirmed] = useState(false);

  // Search input ref for '/' shortcut
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard Accelerators
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === '/' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'Escape') {
        if (controlGateOpen) {
          setControlGateOpen(false);
        } else if (selectedReplacement) {
          setSelectedReplacement(null);
        } else if (searchQuery) {
          setSearchQuery('');
          searchInputRef.current?.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [controlGateOpen, selectedReplacement, searchQuery]);

  // Sync tab with URL
  const changeTab = (tab: 'rehearsal' | 'inspector' | 'blogs') => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setSearchParams(tab === 'rehearsal' ? {} : { view: tab });
  };

  // Helper calculations
  const enrolledCourses = useMemo(() => {
    return enrolled.map(code => masterSchedule.find(c => c.code === code)).filter(Boolean) as Course[];
  }, [enrolled]);

  const currentTotalCredits = useMemo(() => {
    return enrolledCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [enrolledCourses]);

  const projectedCredits = useMemo(() => {
    let creds = currentTotalCredits;
    if (swapOutId) {
      const outCourse = masterSchedule.find(c => c.code === swapOutId);
      if (outCourse) creds -= outCourse.credits;
    }
    if (selectedReplacement) {
      const inCourse = masterSchedule.find(c => c.code === selectedReplacement);
      if (inCourse) creds += inCourse.credits;
    }
    return creds;
  }, [currentTotalCredits, swapOutId, selectedReplacement]);

  // Staged course object
  const stagedCourse = useMemo(() => {
    if (!selectedReplacement) return null;
    return masterSchedule.find(c => c.code === selectedReplacement) || null;
  }, [selectedReplacement]);

  const swapOutCourse = useMemo(() => {
    if (!swapOutId) return null;
    return masterSchedule.find(c => c.code === swapOutId) || null;
  }, [swapOutId]);

  // Conflict detection for active staged course
  const activeConflict = useMemo(() => {
    if (!stagedCourse) return null;
    const res = validateCourse(stagedCourse, enrolled, swapOutId, outsideCommitments);
    if (!res.ok) {
      return res.reasons[0];
    }
    return null;
  }, [stagedCourse, enrolled, swapOutId, outsideCommitments]);

  // Filtered Catalogue
  const filteredCatalogue = useMemo(() => {
    let list = masterSchedule.filter(c => {
      if (enrolled.includes(c.code) && swapOutId !== c.code) return false;
      return true;
    });

    if (activeFilter === 'ge') list = list.filter(c => c.category === 'ge');
    else if (activeFilter === 'stem') list = list.filter(c => c.category === 'stem');
    else if (activeFilter === 'coursework') list = list.filter(c => c.examPct === 0);
    else if (activeFilter === 'open') list = list.filter(c => c.quotaAvailable > 0);
    else if (activeFilter === 'noclash') list = list.filter(c => validateCourse(c, enrolled, swapOutId, outsideCommitments).ok);

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
  }, [enrolled, swapOutId, activeFilter, highlightBridge, searchQuery, outsideCommitments]);

  // Staging actions
  const handleStageCourse = (code: string) => {
    if (selectedReplacement === code) {
      setSelectedReplacement(null);
    } else {
      setSelectedReplacement(code);
    }
  };

  const handleSelectSwapOut = (code: string) => {
    if (swapOutId === code) {
      setSwapOutId(null);
    } else {
      setSwapOutId(code);
    }
  };

  const handleOpenInspector = (code: string) => {
    setInspectorCourseCode(code);
    changeTab('inspector');
  };

  const executeSimulatedSwap = () => {
    if (!stagedCourse) return;
    let newEnrolled = [...enrolled];
    if (swapOutId) {
      newEnrolled = newEnrolled.filter(c => c !== swapOutId);
    }
    newEnrolled.push(stagedCourse.code);
    setEnrolled(newEnrolled);
    setSwapConfirmed(true);
    setSelectedReplacement(null);
    setSwapOutId(null);
  };

  const resetAll = () => {
    setEnrolled([...studentProfile.baselineEnrolled]);
    setSwapOutId(null);
    setSelectedReplacement(null);
    setControlGateOpen(false);
    setSwapConfirmed(false);
    setHandoffStep1(false);
    setHandoffStep2(false);
    setHandoffStep3(false);
  };

  // Inspector Course Object & Dynamic Diagnostics
  const inspectorCourse = useMemo(() => {
    return masterSchedule.find(c => c.code === inspectorCourseCode) || masterSchedule[0];
  }, [inspectorCourseCode]);

  const scheduleFitDiagnostics = useMemo(() => {
    const isEnrolled = enrolled.includes(inspectorCourse.code);
    const isStaged = selectedReplacement === inspectorCourse.code;

    if (isEnrolled) {
      return {
        text: `[STATUS: CURRENTLY ENROLLED · ${inspectorCourse.credits.toFixed(1)} CR]`,
        color: 'text-[#6c4cff] bg-[#ece9ff] border-[#d9ccff]',
        isAlert: false
      };
    }
    if (isStaged) {
      return {
        text: `[STATUS: STAGED ON TIMETABLE PREVIEW]`,
        color: 'text-cyan-800 bg-cyan-100 border-cyan-200',
        isAlert: false
      };
    }

    const projectedEnrolled = enrolled.filter(c => c !== swapOutId);
    const clashCourse = projectedEnrolled.map(code => masterSchedule.find(c => c.code === code)).find(existing => {
      if (!existing) return false;
      return existing.day === inspectorCourse.day &&
        parseMinutes(inspectorCourse.start) < parseMinutes(existing.end) &&
        parseMinutes(inspectorCourse.end) > parseMinutes(existing.start);
    });

    if (clashCourse) {
      return {
        text: `[TIMETABLE CLASH: OVERLAPS WITH ${clashCourse.code} (${clashCourse.day} ${clashCourse.start}-${clashCourse.end})]`,
        color: 'text-red-700 bg-red-50 border-red-200',
        isAlert: true
      };
    }

    if (outsideCommitments && (inspectorCourse.day === 'Mon' || inspectorCourse.day === 'Thu') && parseMinutes(inspectorCourse.start) < 13 * 60 && parseMinutes(inspectorCourse.end) > 9 * 60) {
      return {
        text: `[SCHEDULE FIT: FITS CLASSES · OVERLAPS TECH PLACEMENT (${inspectorCourse.day.toUpperCase()} 09:00–13:00)]`,
        color: 'text-amber-800 bg-amber-50 border-amber-200',
        isAlert: true
      };
    }

    return {
      text: `[SCHEDULE FIT: NO CLASH WITH YOUR SCHEDULE]`,
      color: 'text-green-800 bg-green-50 border-green-200',
      isAlert: false
    };
  }, [enrolled, swapOutId, selectedReplacement, inspectorCourse, outsideCommitments]);

  // Workload Hour Segments
  const workloadMetrics = useMemo(() => {
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
    const matching = blogPosts.filter(p => p.courseCode === inspectorCourse.code);
    return matching.length > 0 ? matching : blogPosts.slice(0, 2);
  }, [inspectorCourse]);

  return (
    <div className="min-h-screen bg-[#f5f4ef] font-sans text-[#171717] flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Obsidian Dark Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#171717] text-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link to="/" className="flex items-center gap-3">
            <BrandMark inverse />
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight">SafeSwap Sandbox</span>
              <span className="font-mono text-[9px] text-white/50 uppercase">EE4213 Team #7</span>
            </div>
          </Link>
          <button
            className="grid h-8 w-8 place-items-center text-white/70 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Workspace Card */}
        <div className="px-4 pt-5 pb-2">
          <div className="flex w-full items-center gap-3 border border-white/15 bg-white/[0.06] p-3 rounded-lg text-left">
            <span className="grid h-8 w-8 place-items-center bg-[#6c4cff] rounded text-xs font-bold font-mono">ML</span>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-[0.14em] text-white/45 font-mono">Workspace</span>
              <span className="block truncate text-xs font-semibold">{studentProfile.name}</span>
              <span className="block text-[10px] text-[#d9ff63] font-mono">{currentTotalCredits.toFixed(1)} Credits Enrolled</span>
            </div>
          </div>
        </div>

        {/* Simulator Views Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6" aria-label="Simulator navigation">
          <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">Views</p>
          
          <button
            onClick={() => changeTab('rehearsal')}
            className={`group flex w-full items-center gap-3 px-3 py-2.5 text-xs rounded transition ${
              activeTab === 'rehearsal'
                ? "bg-[#d9ff63] font-semibold text-[#171717]"
                : "text-white/60 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span className="flex-1 text-left">Rehearsal Timetable</span>
            <span className="font-mono text-[10px] opacity-70">{enrolled.length}</span>
          </button>

          <button
            onClick={() => changeTab('inspector')}
            className={`group flex w-full items-center gap-3 px-3 py-2.5 text-xs rounded transition ${
              activeTab === 'inspector'
                ? "bg-[#d9ff63] font-semibold text-[#171717]"
                : "text-white/60 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span className="flex-1 text-left">Course Inspector</span>
            <span className="font-mono text-[10px] opacity-70">22</span>
          </button>

          <button
            onClick={() => changeTab('blogs')}
            className={`group flex w-full items-center gap-3 px-3 py-2.5 text-xs rounded transition ${
              activeTab === 'blogs'
                ? "bg-[#d9ff63] font-semibold text-[#171717]"
                : "text-white/60 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="flex-1 text-left">CityU Blogs & Insights</span>
            <span className="font-mono text-[10px] opacity-70">5</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-white/10 p-4 space-y-2">
          <Link
            to="/"
            className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-white/60 hover:text-white hover:bg-white/[0.06] rounded transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Landing Page</span>
          </Link>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
            <span>SID {studentProfile.id}</span>
            <span className="text-[#55b987] font-mono">100% Offline</span>
          </div>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Dashboard Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-black/10 bg-[#f5f4ef]/90 px-4 md:px-8 backdrop-blur-xl">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              className="grid h-9 w-9 place-items-center border border-black/15 bg-white rounded lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/35" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full border border-black/15 bg-white rounded-lg pl-9 pr-12 text-xs outline-none transition placeholder:text-black/35 focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Search course code, title, or day (press / to focus)..."
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] bg-[#eeece6] px-1.5 py-0.5 rounded text-black/50">
                /
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Visa Floor Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-mono">
              <span className={`h-2 w-2 rounded-full ${projectedCredits >= 12.0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{projectedCredits.toFixed(1)} / 18.0 CR</span>
              <span className="text-[10px] text-muted-foreground">(Visa Floor: 12.0)</span>
            </div>

            {/* Control Gate Review Button */}
            {(selectedReplacement || swapOutId) && (
              <Button
                onClick={() => setControlGateOpen(true)}
                className="bg-[#171717] text-white hover:bg-[#6c4cff] text-xs h-9 font-semibold"
              >
                Review Swap in Control Gate
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={resetAll}
              title="Reset to Marcus Li baseline schedule"
              className="text-xs h-9 border-black/15 bg-white"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          </div>
        </header>

        {/* Dynamic Content Views */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* TAB 1: REHEARSAL TIMETABLE */}
          {activeTab === 'rehearsal' && (
            <div className="space-y-6">
              {/* Eyebrow and Page Heading */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-black/10 pb-5">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6c4cff] mb-1">
                    Academic Timetable Rehearsal
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Weekly Schedule & Safe-Swap Canvas
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click any enrolled course card to designate it as your swap target, then stage an elective from the right catalogue.
                  </p>
                </div>

                {/* Filter / Settings Pill Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setOutsideCommitments(!outsideCommitments)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                      outsideCommitments
                        ? 'bg-[#ece9ff] border-[#6c4cff] text-[#34266f] font-semibold'
                        : 'bg-white border-black/10 text-muted-foreground'
                    }`}
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Tech Placement (Mon/Thu)</span>
                  </button>

                  <button
                    onClick={() => setHighlightBridge(!highlightBridge)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                      highlightBridge
                        ? 'bg-[#d9ff63] border-black text-[#171717] font-semibold'
                        : 'bg-white border-black/10 text-muted-foreground'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Bridge Courses</span>
                  </button>
                </div>
              </div>

              {/* Conflict Radar Warning Banner */}
              {activeConflict && (
                <div className="bg-[#fff1f2] border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-800 uppercase tracking-wide">
                      Registration Conflict Detected
                    </h4>
                    <p className="text-xs text-red-700 mt-0.5">{activeConflict}</p>
                  </div>
                </div>
              )}

              {/* Success Notification after Swap */}
              {swapConfirmed && (
                <div className="bg-[#ecfdf5] border-l-4 border-green-500 p-4 rounded-r-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-xs font-medium text-green-800">
                      Simulated swap applied to weekly timetable. Follow the Control Gate checklist on AIMS to finalize.
                    </span>
                  </div>
                  <button onClick={() => setSwapConfirmed(false)} className="text-green-700 hover:text-green-900 text-xs">
                    Dismiss
                  </button>
                </div>
              )}

              {/* Staging Dock Status Strip */}
              {(swapOutId || selectedReplacement) && (
                <div className="bg-white border border-black/10 p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">Target to Drop:</span>
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
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">Candidate to Add:</span>
                      {stagedCourse ? (
                        <Badge className="bg-[#ece9ff] text-[#34266f] border border-[#d9ccff] hover:bg-[#ece9ff]">
                          {stagedCourse.code} ({stagedCourse.credits} CR)
                        </Badge>
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
                      onClick={() => { setSwapOutId(null); setSelectedReplacement(null); }}
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
                  <div className="flex items-center justify-between mb-4 border-b pb-3">
                    <span className="font-semibold text-xs text-[#171717]">Weekly Academic Grid (Mon–Fri 09:00–22:00)</span>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
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
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3 min-h-[500px]">
                    {DAYS.map(day => {
                      const dayEnrolled = enrolledCourses.filter(c => c.day === day);
                      const isStagedOnDay = stagedCourse && stagedCourse.day === day;
                      const hasPlacement = outsideCommitments && (day === 'Mon' || day === 'Thu');

                      return (
                        <div key={day} className="flex flex-col gap-2.5 bg-[#f8f7f3] p-2.5 rounded-xl border border-black/5">
                          <div className="font-mono text-xs font-bold text-center py-1 border-b border-black/10 text-muted-foreground uppercase">
                            {day}
                          </div>

                          {/* Tech Placement Card if applicable */}
                          {hasPlacement && (
                            <div className="bg-[#fef9c3] border border-[#fde047] text-[#854d0e] p-2.5 rounded-xl text-left shadow-xs">
                              <div>
                                <span className="font-mono text-[9px] uppercase font-bold bg-[#fef08a] px-1.5 py-0.5 rounded text-[#854d0e] inline-block">
                                  [Placement]
                                </span>
                              </div>
                              <p className="text-xs font-bold text-[#713f12] leading-tight mt-1.5">Tech Placement</p>
                              <div className="flex items-center justify-between text-[10px] text-[#854d0e]/80 mt-1.5 font-mono pt-1 border-t border-[#fde047]/60">
                                <span className="whitespace-nowrap font-medium">09:00–13:00</span>
                                <span className="text-[9px] opacity-75">Office</span>
                              </div>
                            </div>
                          )}

                          {/* Enrolled Courses */}
                          {dayEnrolled.map(course => {
                            const isMarkedForDrop = swapOutId === course.code;

                            return (
                              <div
                                key={course.code}
                                onClick={() => handleSelectSwapOut(course.code)}
                                className={`cursor-pointer p-3 rounded-xl transition-all shadow-xs text-left relative ${
                                  isMarkedForDrop
                                    ? 'bg-[#fffbeb] border-2 border-dashed border-[#b45309] ring-2 ring-[#fde68a]'
                                    : 'bg-white border border-black/10 hover:border-black/30'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono">
                                  <span className="font-bold text-[#171717]">{course.code}</span>
                                  <span className="text-muted-foreground whitespace-nowrap">CRN {course.crn}</span>
                                </div>
                                <h4 className="font-semibold text-xs leading-tight mt-1">{course.title}</h4>
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 pt-1 border-t border-black/5 font-mono">
                                  <span className="whitespace-nowrap">{course.start}–{course.end}</span>
                                  <span className="whitespace-nowrap">{course.credits.toFixed(1)} CR</span>
                                </div>

                                <div className="mt-2">
                                  {isMarkedForDrop ? (
                                    <span className="font-mono text-[9px] uppercase font-bold text-[#b45309]">
                                      [Marked for Drop]
                                    </span>
                                  ) : (
                                    <span className="font-mono text-[9px] uppercase text-muted-foreground">
                                      [Enrolled · AIMS Protected]
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {/* Staged Ghost Course */}
                          {isStagedOnDay && (
                            <div className="bg-[#f5f3ff] border-2 border-dashed border-[#6c4cff] p-3 rounded-xl shadow-xs text-left relative ring-2 ring-[#ece9ff]">
                              <button
                                onClick={() => setSelectedReplacement(null)}
                                className="absolute top-2 right-2 text-muted-foreground hover:text-red-600"
                                title="Dismiss staged preview"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                              <div className="flex items-center justify-between text-[10px] font-mono pr-4">
                                <span className="font-bold text-[#6c4cff]">{stagedCourse.code}</span>
                                <span className="text-muted-foreground">CRN {stagedCourse.crn}</span>
                              </div>
                              <h4 className="font-semibold text-xs leading-tight mt-1">{stagedCourse.title}</h4>
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 pt-1 border-t border-black/5 font-mono">
                                <span className="whitespace-nowrap">{stagedCourse.start}–{stagedCourse.end}</span>
                                <span className="whitespace-nowrap">{stagedCourse.credits.toFixed(1)} CR</span>
                              </div>
                              <div className="mt-2">
                                <span className="font-mono text-[9px] uppercase font-bold text-[#6c4cff] bg-[#ece9ff] px-1.5 py-0.5 rounded">
                                  [Staged Preview]
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right 4 Columns: Course Catalogue & Staging Dock */}
                <div className="xl:col-span-4 bg-white border border-black/10 rounded-2xl p-5 shadow-sm flex flex-col h-[650px]">
                  <div className="flex items-center justify-between pb-3 border-b mb-3">
                    <div>
                      <h3 className="font-semibold text-xs">Simulated Course Catalogue</h3>
                      <p className="text-[10px] text-muted-foreground">{filteredCatalogue.length} matching courses</p>
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3 text-[10px] font-mono">
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
                    {filteredCatalogue.map(course => {
                      const validRes = validateCourse(course, enrolled, swapOutId, outsideCommitments);
                      const isStaged = selectedReplacement === course.code;

                      return (
                        <div
                          key={course.code}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isStaged
                              ? 'bg-[#f5f3ff] border-[#6c4cff] ring-1 ring-[#6c4cff]'
                              : 'bg-white border-black/10 hover:border-black/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-[#171717]">{course.code}</span>
                            <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                              course.quotaAvailable > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {course.quotaAvailable > 0 ? `${course.quotaAvailable} Open` : 'Full'}
                            </span>
                          </div>

                          <h5 className="font-semibold text-xs mt-1 leading-snug">{course.title}</h5>

                          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 font-mono">
                            <span>{course.day} {course.start}–{course.end}</span>
                            <span>{course.credits.toFixed(1)} CR</span>
                          </div>

                          {/* Prereq or Conflict Warning */}
                          {!validRes.ok && (
                            <div className="mt-2 text-[10px] text-red-600 font-medium">
                              [Alert] {validRes.reasons[0]}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5">
                            <button
                              onClick={() => handleOpenInspector(course.code)}
                              className="text-[10px] font-mono text-[#6c4cff] hover:underline"
                            >
                              Inspect Details &rarr;
                            </button>

                            {isStaged ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setSelectedReplacement(null)}
                                className="h-6 text-[10px] px-2.5"
                              >
                                Unstage Preview
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleStageCourse(course.code)}
                                className="h-6 text-[10px] px-2.5 bg-[#171717] text-white hover:bg-[#6c4cff]"
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
            <div className="max-w-5xl mx-auto space-y-6">
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
                    US-013 to US-016 · Static Syllabus Assessment Badges, Provenance Boundaries &amp; 13-Week Deliverable Strip
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="inspectorCourseSelect" className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    Select Course:
                  </label>
                  <select
                    id="inspectorCourseSelect"
                    value={inspectorCourseCode}
                    onChange={(e) => setInspectorCourseCode(e.target.value)}
                    className="border border-black/15 bg-white rounded-lg px-3 py-1.5 text-xs font-mono outline-none shadow-xs"
                  >
                    {masterSchedule.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.title} ({c.day} {c.start})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Main Inspector 2-Column Layout */}
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

                    {/* Weekly Workload Hour Distribution (Segmented Meter Bar) */}
                    <div className="border-t border-black/10 pt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
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
                      <p className="font-mono text-[10px] text-muted-foreground pt-1">
                        Lecture {workloadMetrics.lecH}h · Tutorial {workloadMetrics.tutH}h · Lab {workloadMetrics.labH}h · Project {workloadMetrics.projH}h · Prep {workloadMetrics.prepH}h
                      </p>
                    </div>

                    {/* What We Know vs Unknown Provenance Box (Lecture 07 AI Must Remain Silent) */}
                    <div className="border-t border-black/10 pt-4 space-y-2">
                      <p className="font-mono text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                        What We Know &amp; What Remains Unknown
                      </p>
                      <ul className="text-xs space-y-2 text-foreground">
                        <li className="flex items-center justify-between">
                          <span>Assessment weights ({inspectorCourse.courseworkPct}% Coursework / {inspectorCourse.examPct}% Exam)</span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#f8f7f3] border text-muted-foreground">
                            Sample syllabus
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Weekly workload estimate ({workloadMetrics.totalH} hrs/wk)</span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#f8f7f3] border text-muted-foreground">
                            Sample syllabus
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Outside placement commitment (16 hrs/wk)</span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#ece9ff] text-[#34266f] border border-[#d9ccff] font-semibold">
                            You entered
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Final examination exact date</span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                            {inspectorCourse.examPct > 0 ? 'Unknown · Not Published' : 'N/A (0% Exam)'}
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Whether {inspectorCourse.code} is offered in Sem A 2027/28</span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                            Unknown
                          </span>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>Project subgroup weekly meeting times</span>
                          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
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
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Visualizes deadline collisions against midterm periods and internship days.
                      </p>
                    </div>

                    {/* 13-Week Deliverable Table */}
                    <div className="overflow-x-auto border border-black/10 rounded-xl">
                      <table className="w-full text-center border-collapse text-[10px] font-mono">
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
                                  className={`p-1.5 border-r border-black/5 last:border-r-0 text-[9px] ${
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
                                  className={`p-1.5 border-r border-black/5 last:border-r-0 text-[9px] ${
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
                        <span className="text-[10px] text-muted-foreground block uppercase">Prerequisites</span>
                        <span className="font-bold text-foreground">
                          {inspectorCourse.prereqs.length > 0 ? inspectorCourse.prereqs.join(', ') : 'None'}
                        </span>
                      </div>

                      <div className="text-muted-foreground font-bold">&rarr;</div>

                      {/* Center: Target Node */}
                      <div className="p-2.5 rounded-lg bg-[#ece9ff] border border-[#6c4cff] text-center flex-1 shadow-xs">
                        <span className="text-[10px] text-[#34266f] block uppercase font-bold">Target</span>
                        <span className="font-bold text-[#171717]">{inspectorCourse.code}</span>
                      </div>

                      <div className="text-muted-foreground font-bold">&rarr;</div>

                      {/* Right: Next Sequence Node */}
                      <div className="p-2 rounded-lg bg-white border border-black/10 text-center flex-1">
                        <span className="text-[10px] text-muted-foreground block uppercase">Next Sequence</span>
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
                        <p className="text-[10px] text-muted-foreground mt-0.5">
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
                            <span className="font-mono text-[9px] bg-white border border-black/10 px-1.5 py-0.5 rounded text-muted-foreground">
                              CityU Blogs
                            </span>
                          </div>
                          <p className="font-mono text-[10px] text-muted-foreground">
                            Context: <strong className="text-foreground">{post.author}</strong> · {post.authorMeta}
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {post.summary}
                          </p>
                          <button
                            onClick={() => changeTab('blogs')}
                            className="text-xs font-mono text-[#6c4cff] font-semibold hover:underline block pt-1"
                          >
                            Read {post.author}&rsquo;s Full Post on CityU Blogs &rarr;
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Primary Stage Action Button */}
                    <div className="pt-2">
                      <Button
                        onClick={() => {
                          handleStageCourse(inspectorCourse.code);
                          changeTab('rehearsal');
                        }}
                        className="w-full bg-[#171717] text-white hover:bg-[#6c4cff] text-xs h-10 font-semibold"
                      >
                        Stage {inspectorCourse.code} in Weekly Timetable &rarr;
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: CITYU BLOGS */}
          {activeTab === 'blogs' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-b border-black/10 pb-5">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6c4cff] mb-1">
                  Community Insights &amp; Peer Feedback
                </p>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  CityU Course Experience Blogs
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Real experiences from senior undergraduates balancing coursework, finals, and placements.
                </p>
              </div>

              <div className="space-y-4">
                {blogPosts.map(post => (
                  <div key={post.id} className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-[#d9ff63] text-[#171717] flex items-center justify-center font-bold text-xs font-mono">
                          {post.initials}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold">{post.author}</h4>
                          <p className="text-[10px] text-muted-foreground">{post.date}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono text-[10px] bg-[#f8f7f3]">
                        {post.courseCode}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold leading-snug">{post.title}</h3>
                    <p className="text-xs text-muted-foreground">{post.subtitle}</p>

                    <div className="bg-[#f8f7f3] p-3 rounded-lg text-xs leading-relaxed text-muted-foreground border border-black/5">
                      {post.summary}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t text-[11px] text-muted-foreground">
                      <span className="font-mono">{post.authorMeta}</span>
                      <button
                        onClick={() => post.courseCode && handleOpenInspector(post.courseCode)}
                        className="text-[#6c4cff] font-semibold hover:underline"
                      >
                        Inspect {post.courseCode} &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* HUMAN-IN-THE-LOOP CONTROL GATE MODAL */}
      {controlGateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-black/10 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <h3 className="text-base font-bold">Control Gate Verification</h3>
              </div>
              <button onClick={() => setControlGateOpen(false)} className="text-muted-foreground hover:text-black">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-2 gap-4 bg-[#f8f7f3] p-4 rounded-xl border border-black/5 text-xs">
              <div className="border-r pr-2 space-y-1">
                <span className="font-mono text-[10px] uppercase font-bold text-red-600">[DROP TARGET]</span>
                {swapOutCourse ? (
                  <>
                    <p className="font-bold text-sm">{swapOutCourse.code}</p>
                    <p className="text-muted-foreground">{swapOutCourse.title}</p>
                    <p className="font-mono text-[10px]">CRN {swapOutCourse.crn} · {swapOutCourse.credits} CR</p>
                  </>
                ) : (
                  <p className="italic text-muted-foreground">No course dropped</p>
                )}
              </div>

              <div className="pl-2 space-y-1">
                <span className="font-mono text-[10px] uppercase font-bold text-green-600">[ADD CANDIDATE]</span>
                {stagedCourse ? (
                  <>
                    <p className="font-bold text-sm">{stagedCourse.code}</p>
                    <p className="text-muted-foreground">{stagedCourse.title}</p>
                    <p className="font-mono text-[10px]">CRN {stagedCourse.crn} · {stagedCourse.credits} CR</p>
                  </>
                ) : (
                  <p className="italic text-muted-foreground">No course staged</p>
                )}
              </div>
            </div>

            {/* Visa Compliance Summary */}
            <div className={`p-3 rounded-lg text-xs font-mono flex items-center justify-between ${
              projectedCredits >= 12.0 ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <span>Projected Total Load: {projectedCredits.toFixed(1)} Credits</span>
              <span>{projectedCredits >= 12.0 ? 'Visa Floor Preserved (>= 12.0)' : 'VIOLATION (< 12.0)'}</span>
            </div>

            {/* 3-Step Manual AIMS Handoff Checklist */}
            <div className="space-y-2 border-t pt-3">
              <p className="text-xs font-bold text-muted-foreground uppercase font-mono">
                Mandatory Execution Checklist
              </p>
              
              <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={handoffStep1}
                  onChange={(e) => setHandoffStep1(e.target.checked)}
                  className="mt-0.5 rounded"
                />
                <span>1. Verified live seat availability on AIMS for Add CRN ({stagedCourse?.crn || 'N/A'}).</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={handoffStep2}
                  onChange={(e) => setHandoffStep2(e.target.checked)}
                  className="mt-0.5 rounded"
                />
                <span>2. Executed drop for {swapOutCourse?.code || 'course'} on AIMS using Drop CRN ({swapOutCourse?.crn || 'N/A'}).</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={handoffStep3}
                  onChange={(e) => setHandoffStep3(e.target.checked)}
                  className="mt-0.5 rounded"
                />
                <span>3. Executed add for {stagedCourse?.code || 'course'} on AIMS using Add CRN ({stagedCourse?.crn || 'N/A'}).</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
              <Button variant="ghost" size="sm" onClick={() => setControlGateOpen(false)} className="text-xs">
                Cancel
              </Button>

              <Button
                size="sm"
                disabled={!handoffStep1 || !handoffStep2 || !handoffStep3 || projectedCredits < 12.0}
                onClick={() => {
                  executeSimulatedSwap();
                  setControlGateOpen(false);
                }}
                className="bg-[#171717] text-white hover:bg-[#6c4cff] text-xs h-9"
              >
                Confirm Swap in Simulation
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
