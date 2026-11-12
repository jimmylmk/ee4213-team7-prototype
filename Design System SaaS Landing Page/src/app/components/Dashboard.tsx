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
  Plus
} from "lucide-react";
import {
  masterSchedule,
  blogPosts,
  studentProfile,
  validateCourse,
  Course,
  BlogPost
} from "../data/courseData";
import { BrandMark } from "./Header";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

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
  const [inspectorCourseCode, setInspectorCourseCode] = useState<string>('EE4213');

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
      // Don't show currently enrolled unless it is the swapOut course
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

  const inspectorCourse = useMemo(() => {
    return masterSchedule.find(c => c.code === inspectorCourseCode) || masterSchedule[0];
  }, [inspectorCourseCode]);

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

              {/* Two-Column Grid: Left Timetable Canvas + Right Catalogue Bay */}
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
                      // Get all enrolled courses for this day
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
                            <div className="bg-[#fef9c3] border border-[#fde047] text-[#854d0e] p-2.5 rounded-lg text-left shadow-2xs">
                              <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                                <span>PLACEMENT</span>
                                <span>09:00–13:00</span>
                              </div>
                              <p className="text-[11px] font-semibold mt-1">Tech Placement</p>
                              <p className="text-[10px] text-muted-foreground">Off-campus office</p>
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
                                  <span className="text-muted-foreground">CRN {course.crn}</span>
                                </div>
                                <h4 className="font-semibold text-xs leading-tight mt-1">{course.title}</h4>
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 pt-1 border-t border-black/5 font-mono">
                                  <span>{course.start}–{course.end}</span>
                                  <span>{course.credits.toFixed(1)} CR</span>
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
                                <span>{stagedCourse.start}–{stagedCourse.end}</span>
                                <span>{stagedCourse.credits.toFixed(1)} CR</span>
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

          {/* TAB 2: COURSE INSPECTOR */}
          {activeTab === 'inspector' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-black/10 pb-5">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6c4cff] mb-1">
                    Syllabus & Schedule Fit
                  </p>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Course Deep-Dive: {inspectorCourse.code}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    {inspectorCourse.title} · CRN {inspectorCourse.crn} · {inspectorCourse.credits.toFixed(1)} Credits
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => changeTab('rehearsal')}
                  className="text-xs border-black/15 bg-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Return to Timetable
                </Button>
              </div>

              {/* Course Selector Strip */}
              <div className="bg-white border border-black/10 p-4 rounded-xl shadow-sm flex items-center justify-between gap-4">
                <span className="text-xs font-semibold">Select Course to Inspect:</span>
                <select
                  value={inspectorCourseCode}
                  onChange={(e) => setInspectorCourseCode(e.target.value)}
                  className="border border-black/15 bg-[#f8f7f3] rounded-lg px-3 py-1.5 text-xs font-mono outline-none"
                >
                  {masterSchedule.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.title} ({c.day} {c.start})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assessment Breakdown Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold border-b pb-2">Assessment Distribution</h3>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Continuous Coursework</span>
                      <span className="font-bold">{inspectorCourse.courseworkPct}%</span>
                    </div>
                    <div className="w-full bg-[#eeece6] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#6c4cff] h-full" style={{ width: `${inspectorCourse.courseworkPct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Final Examination</span>
                      <span className="font-bold">{inspectorCourse.examPct}%</span>
                    </div>
                    <div className="w-full bg-[#eeece6] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#ff7357] h-full" style={{ width: `${inspectorCourse.examPct}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Group Project Ratio</span>
                      <span className="font-bold">{inspectorCourse.groupPct}%</span>
                    </div>
                    <div className="w-full bg-[#eeece6] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#d9ff63] h-full" style={{ width: `${inspectorCourse.groupPct}%` }} />
                    </div>
                  </div>

                  <p className="text-[11px] text-muted-foreground pt-2">
                    Honest syllabus splits sourced directly from CityU Course Syllabus Database. No speculative GPA predictors.
                  </p>
                </div>

                {/* Schedule Fit and Prerequisite Card */}
                <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold border-b pb-2">Schedule Fit & Prerequisites</h3>

                  <div>
                    <span className="text-xs font-semibold text-muted-foreground">Class Schedule:</span>
                    <p className="text-xs font-mono font-bold mt-0.5">
                      {inspectorCourse.day} {inspectorCourse.start}–{inspectorCourse.end} (3 Hours Weekly)
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-muted-foreground">Prerequisite Requirements:</span>
                    {inspectorCourse.prereqs.length > 0 ? (
                      <div className="flex items-center gap-2 mt-1">
                        {inspectorCourse.prereqs.map(req => (
                          <Badge key={req} className="bg-[#fef3c7] text-[#92400e] border border-[#fde68a] font-mono text-xs">
                            Requires {req}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-green-700 font-medium mt-0.5">None (Open Prerequisite)</p>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-muted-foreground">Current Quota:</span>
                    <p className="text-xs font-mono mt-0.5">
                      {inspectorCourse.quotaAvailable} available / {inspectorCourse.quotaTotal} capacity
                    </p>
                  </div>

                  <div className="pt-3 border-t">
                    <Button
                      onClick={() => {
                        handleStageCourse(inspectorCourse.code);
                        changeTab('rehearsal');
                      }}
                      className="w-full bg-[#171717] text-white hover:bg-[#6c4cff] text-xs h-9"
                    >
                      Stage {inspectorCourse.code} in Weekly Timetable &rarr;
                    </Button>
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
                  Community Insights & Peer Feedback
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
                <span>I have verified open quota on CityU AIMS for candidate course.</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={handoffStep2}
                  onChange={(e) => setHandoffStep2(e.target.checked)}
                  className="mt-0.5 rounded"
                />
                <span>I understand that AIMS does not support atomic swap and requires manual drop-then-add.</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={handoffStep3}
                  onChange={(e) => setHandoffStep3(e.target.checked)}
                  className="mt-0.5 rounded"
                />
                <span>I confirm that my total credits will remain at or above the 12.0 credit minimum.</span>
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
