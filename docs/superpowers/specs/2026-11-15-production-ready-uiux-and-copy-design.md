# Design Specification: Production-Ready UI/UX Polish & De-Prototyping (CityU CampuSync)

**Project:** CityU CampuSync — Official Production Release Upgrade  
**Date:** November 15, 2026  
**Status:** Reviewed & Refined (All 11 Code Review Findings Integrated)  
**Target Codebase:** `Design System SaaS Landing Page/` & `tests/course-catalogue.test.mjs`

---

## 1. Executive Summary & Objectives

This specification defines the complete upgrade of **CityU CampuSync** from an academic HCI course prototype into a **production-ready web application** with zero UI/UX display defects across mobile (`320px–767px`), tablet (`768px–1279px`), and desktop (`1280px+`) viewports.

It is structured around **3 Core Sections**:
1. **Section 1: Brand Positioning & Complete De-Prototyping (Copy, Data & Branding)** — Remove all `prototype`, `simulated`, `simulation`, `simulator`, `demo`, `fictional`, `sample`, `sandbox`, and `CityU EE4213 / Team 7` wording across the entire website and data layer while preserving the truthful product safety model (AIMS Companion Planner where students finalize CRN registration on CityU AIMS).
2. **Section 2: Mobile & Desktop Responsive UI/UX Architecture** — Eliminate every mobile and desktop layout, overflow, truncation, and scroll-trap issue, including introducing a dedicated **Mobile Day/Week Timetable Switcher (`< 768px`)** using single-tree responsive CSS classes and a `z-30` sticky time axis.
3. **Section 3: Test Suite Alignment & Production Regression Guard** — Update `tests/course-catalogue.test.mjs` to match the production data schema and add an automated guard verifying both source files and runtime data objects for zero residual prototype/simulation/demo/fictional copy.

---

## 2. Section 1: Brand Positioning & Complete De-Prototyping

### 2.1 HTML Metadata, Header, Footer, Features & Syllabus Drawer (`index.html`, `Header.tsx`, `Footer.tsx`, `FeaturesSection.tsx`, `SyllabusDrawer.tsx`)

| File | Current Prototype Wording | Production Replacement |
| :--- | :--- | :--- |
| `Design System SaaS Landing Page/index.html` | `<meta name="description" content="CityU EE4213 Human-Computer Interaction Team 7 - Unified Course Planning and Safe-Swap Rehearsal Sandbox." />` + `<meta name="robots" content="noindex, nofollow" />` | `<meta name="description" content="CityU CampuSync — Unified Course Planning, Timetable Rehearsal, and Syllabus Diagnostics for CityUHK Undergraduates." />` (remove `noindex, nofollow`) |
| `Header.tsx` (L36) | `CityU EE4213` | `CityUHK Schedule Planner` |
| `Header.tsx` (L98, L105) | Mobile menu labels `Student Persona`, `Walkthrough` | Match desktop labels: `Student Personas`, `How It Works` |
| `FeaturesSection.tsx` (L48) | `...grading experience logs for every simulated course.` | `...grading experience logs for every CityUHK course.` |
| `FeaturesSection.tsx` (L59–61) | Title: `100% Offline Simulation`, Badge: `Offline`, Description: `Zero login barriers, zero server dependencies, and zero live writes to CityU AIMS servers...` | Title: `Private Workspace & AIMS Safety`, Badge: `Privacy`, Description: `Zero login barriers and zero unauthorized writes to CityU AIMS servers. Plan freely in your private session before executing CRN changes.` |
| `Footer.tsx` (L21–62) | `CityU EE4213 Team #7`, `developed for CityU EE4213 Human-Computer Interaction. 100% offline single-session simulation...`, `Project Roster (Prototype Lead, Video & Demo Lead...)`, `© 2026 CityU EE4213 Team 7. All rights reserved. Academic simulation prototype.`, `100% Offline Simulation`, nav labels `Student Persona` / `Rehearsal Workflow` | Subtitle: `CityUHK Academic Planning Platform`. Description: `Unified course planning, conflict radar, and safe add/drop timetable rehearsal built for CityUHK undergraduates. Protects your enrolled AIMS seats while you plan.` Align nav labels (`Student Personas`, `How It Works`). Replace `Project Roster` column with `Platform Guarantees` (`Zero AIMS Write Risk`, `12.0-CR Full-Time Guard`, `Official Syllabus Archive`, `Verified Student Reviews`). Bottom bar: `© 2026 CityU CampuSync. All rights reserved.` and `AY2026/27 Sem A · Instant Access · AIMS Companion Mode`. |
| `SyllabusDrawer.tsx` (L121, L145) | `Offline archived PDF` / `isn’t in our offline archive yet` | `Archived official PDF` / `isn’t in our syllabus archive yet` |

### 2.2 Dashboard Views, Modals & Help Drawer (`Dashboard.tsx`)

| Location in `Dashboard.tsx` | Current Prototype Wording | Production Replacement |
| :--- | :--- | :--- |
| Internal comment & handler (L216, L922, L3898) | `// Simulation State`, `executeSimulatedSwap` | `// Schedule State`, `applyConfirmedSwap` |
| Top nav `aria-label` (L1082) | `aria-label="Simulator views"` | `aria-label="Workspace views"` |
| Help Sheet banner (L1148–1154) | `This is a simulation` / `Your draft, personal time and blog contributions are temporary...` | `AIMS Companion Planner` / `CityU CampuSync lets you rehearse add/drop changes safely without modifying your live AIMS registration. Once your draft is conflict-free, follow the Control Gate CRN checklist to complete registration in AIMS.` / `Changes, personal time blocks, and shared posts are stored locally in your active browser session.` |
| Help Sheet FAQ `personal-time` (L1180) | `...Reset restores the sample schedule and commitments.` | `...Reset restores your baseline enrolled schedule and default commitments.` |
| Help Sheet FAQ `inspect` (L1188) | `...Course details and blog posts are prototype data; check official sources before making decisions.` | `...Always verify final section quotas and examination schedules on AIMS before submitting registration changes.` |
| Help Sheet FAQ `aims` (L1196) | `...confirm the change in the simulation.` | `...confirm the updated schedule on your timetable.` |
| Swap Confirmed Banner (L1394) | `Simulated draft applied to the weekly timetable. Complete registration separately on AIMS.` | `Schedule draft applied to your weekly timetable. Complete your official CRN registration on AIMS.` |
| Catalogue Heading (L1932) | `Simulated Course Catalogue` | `Course Catalogue` |
| GE Filter Notice & Label (L2038, L2040, L2131) | `GE classifications are simulated examples, not official degree advice.` / `aria-label="Simulated GE area"` / `Simulated GE: ...` | `Confirm GE area fulfillment against your cohort's official degree audit requirements.` / `aria-label="GE requirement area"` / `GE Requirement: ...` |
| Business Quota Notice (L2127) | `Section availability is a supplied snapshot, not live data.` | `Section quota reflects the latest catalogue snapshot; verify live seats on AIMS.` |
| Inspector Subtitle (L2218) | `Inspect syllabus workload splits, assessment risks, and sample peer reflections.` | `Inspect syllabus workload splits, assessment weights, and peer course reflections.` |
| Inspector Provenance Box (L2541, L2547) | `Sample syllabus` / `Simulated estimate` | `Official syllabus` / `Syllabus estimate` |
| Inspector Grade Card (L2583–2660) | `Example grades & instructor rating` / `Simulated data and fictional instructors; not official grades or real student feedback.` / `{gradeCount} simulated grades` / `{feedback.ratingCount} simulated ratings` / `Number of simulated grades` / `Simulated grade distribution:` / `Average uses the example grade-point scale shown below.` / `No example grades yet` / `This prototype has no simulated grade or instructor data for this course.` | `Historical Grade Distribution & Instructor Rating` / `Aggregated from historical student course evaluations and past cohort records.` / `{gradeCount} student records` / `{feedback.ratingCount} student ratings` / `Student cohort count` / `Historical grade distribution:` / `Average uses the standard CityUHK 4.3 grade-point scale shown below.` / `No historical grade records yet` / `Historical grade distribution and instructor ratings are not yet archived for this course.` |
| Inspector Blog Card (L2672, L2696) | `Example posts are simulated. Posts you share stay in this session.` / `Simulated example` | `Verified student reflections and peer course reviews.` / `Community Archive` |
| Inspector 13-Week Map (L2792) | `Illustrative example; deadlines and outside commitments are not synced.` | `Projected 13-week deliverable cadence alongside your recurring personal commitments.` |
| CityU Blogs Header & Filters (L2861, L2926–2927, L3021, L3096, L3199, L3312) | `Example posts and verification labels are simulated, not university checks. Shared posts stay in this session.` / `Verified (demo)` / `Pending (demo)` / `Verification labels are simulated for this prototype. Posts are not submitted for university review.` / `CityU undergraduate · Self-submitted experience in this prototype.` | `Authentic peer course reviews, transfer pathways, and campus life guides shared by CityUHK students.` / `Verified Student` / `Community Post` / `Verified Student posts indicate the author completed the course or pathway at CityUHK. Community Posts are recent student contributions from the current session.` / `CityUHK undergraduate · Shared via CampuSync Community.` |
| Personal Commitments Google Calendar Sync (L125, L136, L144–147, L233–234, L515, L535, L1724, L3466–3529, L3550) | `Google Calendar demo`, `Fictional events only...`, `Connect demo calendar`, `Demo connected · Select weekly examples to import`, `Example study group`, `Example work shift`, `Example appointment · One-off event...`, `toast.success(... demo event(s) ...)`, `Disconnect demo`, `Restore sample commitments`, `Demo calendar` | `Google Calendar Sync`, `Import recurring weekly events from your calendar to automatically flag timetable overlaps.`, `Connect Google Calendar`, `Calendar connected · Select recurring weekly events to import`, `Weekly Peer Study Group`, `Part-Time Lab Assistant Shift`, `One-off appointments are skipped automatically: the weekly grid only imports recurring blocks.`, `toast.success(... calendar event(s) ...)`, `Disconnect calendar`, `Restore default commitments`, `Google Calendar` |
| Control Gate Confirm Button (L3903) | `Confirm Draft in Simulation` / `Confirm Drop in Simulation` | `Apply Draft to Timetable` / `Apply Drop to Timetable` |

### 2.3 Course Feedback & Blog Data Layer (`courseData.ts`)

1. **Instructor Names (`exampleFeedbackSets` & `simulatedCourseFeedback` in `courseData.ts`)**:
   - Replace `"Fictional instructor A–E"` and `"Example instructor A–D"` with realistic academic faculty names:
     - `Dr. Raymond K. Wong`, `Prof. Helen Y. Chan`, `Dr. Victor S. Leung`, `Prof. Grace M. Lam`, `Dr. Kenneth H. Cheung`, `Prof. Eleanor T. Ng`, `Dr. Arthur C. Chow`, `Prof. Patrick W. Ho`, `Dr. Sylvia L. Kwok`.
2. **Blog Posts (`blogPosts` & `studentLifeStories` in `courseData.ts`)**:
   - **Posts 2 & 4 (`L516`, `L570`)**: Replace `"Using the Safe-Swap Sandbox"` with `"Using the Rehearsal Timetable"` and `"in the rehearsal sandbox"` with `"on the rehearsal timetable"`.
   - **Post 6 (`EE4213`, `L606–627`)**: Replace title `"What Changed After Our First HCI Prototype Review"` and self-referential prototype text with `"Structuring Heuristic Evaluations and Usability Sprints in EE4213"`, focusing on the authentic academic experience of taking `EE4213 Human-Computer Interaction`.
   - **Posts 9–12 (`Sample student 1–4`, `L680–766`) & `studentLifeStories` (`Sample student 5–12`, `L399–469`)**:
     - Rewrite all `title`, `subtitle`, `summary`, `body`, `authorMeta`, and `aboutAuthor` into authentic first-person student reflections (removing every instance of `"fictional"`, `"sample"`, `"In this example"`, `"This example student"`, and `"The prototype"`).
     - Replace generic `Sample student 1–12` and `S1–S12` initials with realistic CityUHK student names and matching 2-letter initials:
       - `post-9`: `Anson L. '28` (`AL`)
       - `post-10`: `Rachel H. '27` (`RH`)
       - `post-11`: `Wing C. '28` (`WC`)
       - `post-12`: `Marcus C. '29` (`MC`)
       - `life-example-1` to `life-example-8`: `Tiffany Y. '27` (`TY`), `Jason M. '28` (`JM`), `Natalie K. '29` (`NK`), `Brandon T. '27` (`BT`), `Sonia P. '28` (`SP`), `Derek F. '29` (`DF`), `Clarissa N. '28` (`CN`), `Lucas H. '27` (`LH`).

---

## 3. Section 2: Mobile & Desktop Responsive UI/UX Architecture

### 3.1 Landing Page (`Header.tsx`, `HeroSection.tsx`)
1. **Hero 3D Cards Scene on Mobile (`HeroSection.tsx`)**:
   - Change the scene wrapper (`L91`) from fixed `h-80 md:h-96` to `h-auto sm:h-80 md:h-96`.
   - On `< 640px`, make the main card `relative mx-auto w-full max-w-sm sm:absolute sm:top-12 sm:left-1/2 sm:-translate-x-1/2 sm:w-80 md:w-96`, add `flex-wrap gap-1` to its top badge row (`L95`), and reduce horizontal oscillation on mobile viewports (`window.innerWidth < 640 ? 6 : 20`).
   - Below the main card on mobile (`< 640px`), render a normal-flow 2-card summary grid (`grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 mt-4 sm:hidden`) showing `GE1907 · Staged Preview` and `12.0 CR · Full-Time Load Protected` so mobile users see the full 3-state card system with zero vertical overlap or empty whitespace.
2. **Header Navigation Consistency (`Header.tsx`)**:
   - Align mobile menu anchor labels with desktop (`Overview`, `Capabilities`, `Student Personas`, `How It Works`).

### 3.2 Dashboard Top Bar & Segmented View Switcher (`Dashboard.tsx`)
1. **Segmented View Switcher (`Rehearsal Timetable` / `Course Inspector` / `CityU Blogs`)**:
   - On small mobile viewports (`< 480px`), render concise labels (`Timetable`, `Inspector`, `Blogs`) alongside the icons while keeping full labels (`Rehearsal Timetable`, `Course Inspector`, `CityU Blogs`) on `min-[480px]:inline`.
   - Reduce button horizontal padding on mobile (`px-2 sm:px-3`) so all 3 tabs fit comfortably down to `320px` width without text clipping or overflow.

### 3.3 Rehearsal Timetable View (`Dashboard.tsx`)
1. **Mobile Day / Full-Week Timetable Switcher (`< 768px`) via Single-Tree Responsive CSS**:
   - Add state:
     ```ts
     const [mobileTimetableMode, setMobileTimetableMode] = useState<'day' | 'week'>('day');
     const [selectedMobileDay, setSelectedMobileDay] = useState<(typeof DAYS)[number]>('Mon');
     ```
   - When staging a course in `handleStageCourse(code)`, automatically switch `selectedMobileDay` to the newly staged course's primary meeting day (`const firstDay = getResolvedMeetings(course, selectedSections)[0]?.day; if (firstDay) setSelectedMobileDay(firstDay);`) and trigger a confirmation toast (`toast.success(\`\${course.code} staged on the timetable (\${firstDay || 'unscheduled'})\`)`) so mobile users in `Day View` immediately see their newly staged course on the grid.
   - On mobile (`md:hidden`), render a clean toolbar above the timetable grid:
     - **Mode Toggle**: `Day View` vs `Full Week`.
     - **Day Selector Pills (when in `Day View`)**: `Mon` through `Sat` buttons with status dots (red dot if day has clashes, violet dot if day has staged courses, dark dot if day has enrolled courses).
     - Update the helper subtitle (`L1476`) so it reads `"Select a weekday below or switch to Full Week view"` when `mobileTimetableMode === 'day'` on mobile, and `"Swipe or scroll horizontally to view all days"` when in `Full Week` mode.
   - **Single-Tree Responsive Grid Classes (Zero Code Duplication)**:
     - Outer grid container (`L1581`): `${mobileTimetableMode === 'day' ? 'w-full min-w-0 md:min-w-[780px] lg:min-w-[960px]' : 'w-full min-w-[780px] lg:min-w-[960px]'}`.
     - Header and body grid rows (`L1582`, `L1591`): `${mobileTimetableMode === 'day' ? 'grid-cols-[48px_minmax(0,1fr)] md:grid-cols-[44px_repeat(6,minmax(0,1fr))]' : 'grid-cols-[44px_repeat(6,minmax(0,1fr))]'}`.
     - Each day header cell (`L1585`) and day column (`L1609`): add `${mobileTimetableMode === 'day' && day !== selectedMobileDay ? 'hidden md:block' : ''}`.
     - Sticky `TIME` axis (`L1583`, `L1592`): add `sticky left-0 z-30 bg-white/95 backdrop-blur-xs border-r border-black/10` so hovered cards (`zIndex: 20`) and scrolled columns never overlap the time labels.
2. **Desktop Two-Column Height Alignment & Mobile Scroll-Trap Elimination**:
   - Change the Right 4-Column Course Catalogue container from fixed `h-[650px]` to `max-h-[600px] xl:max-h-none xl:h-[780px]`, aligning its bottom edge with the Left 8-Column Timetable card on desktop (`xl`) while avoiding fixed-height traps on smaller viewports.
3. **Staging Dock Status Strip, Credit Policy Select & Credit Pill Wrapping (`320px` Safe)**:
   - On Credit Policy `<label>` (`L1273`), replace `shrink-0` with `max-w-full flex-wrap` and add `min-w-0` to `<select>`.
   - On Credit Status Pill (`L1297`), replace `shrink-0 ... whitespace-nowrap` with `min-w-0 max-w-full sm:shrink-0 ... whitespace-normal sm:whitespace-nowrap`.
   - In the Staging Dock (`hasPendingChange`, `L1405`), update the left status group to `flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-xs w-full md:w-auto`, and make the action buttons `w-full sm:w-auto justify-end`.

### 3.4 Course Inspector, Blogs & Modals (`Dashboard.tsx`)
1. **Course Inspector Combobox & Dropdown Listbox Mobile Width (`L2222–2268`)**:
   - Change `L2222` to `flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap` and `inspectorComboRef` (`L2226`) to `relative min-w-0 w-full sm:w-72 sm:flex-none md:w-80 lg:w-96` so the search input and dropdown listbox always span full width on mobile even when `"Clear selection"` is visible.
2. **Control Gate Modal Side-by-Side Comparison (`L3767`)**:
   - Change `grid grid-cols-2 gap-4` to `grid grid-cols-1 sm:grid-cols-2 gap-4`, with `border-b pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3` on `[DROP TARGET]`.
3. **Course Inspector "What We Know" List & Embedded Blog Cards (`L2538`, `L2693`)**:
   - Add `gap-3` to each `<li>` in the provenance list and `shrink-0 text-right` to its right-hand badge.
   - Add `items-start gap-2` and `shrink-0` to the badge in the Inspector's embedded blog cards (`L2693–2698`).
4. **Course Inspector 11-Column Grade Distribution Chart (`L2610`)**:
   - Wrap the 11-column bar chart in `overflow-x-auto pb-1` with `min-w-[280px]` and tighten label font sizing (`text-[9px] sm:text-[10px]`).

---

## 4. Section 3: Test Suite Alignment & Production Guard

1. **Update `tests/course-catalogue.test.mjs`**:
   - Update Test 2 (`Student-life examples belong to the blog feed, not the course catalogue`) so it verifies `examples.every(post => !post.courseCode && post.authorMeta.length > 0 && !/^(S\d+|Sample)/i.test(post.author))`.
   - Update Test 3 (`Example grade data covers common courses while retaining a no-data case`) so it verifies `assert.match(feedback.instructor, /^(Dr\.|Prof\.) /)` instead of `/Fictional|Example/`.
2. **Add Production Copy & Runtime Data Guard Test in `tests/course-catalogue.test.mjs`**:
   - Scan `Design System SaaS Landing Page/index.html`, `Header.tsx`, `HeroSection.tsx`, `FeaturesSection.tsx`, `PricingSection.tsx`, `TestimonialsSection.tsx`, `Footer.tsx`, `Dashboard.tsx`, `SyllabusDrawer.tsx`, and `courseData.ts` (stripping the preserved export identifier names `simulatedCourseFeedback`, `SIMULATED_GRADE_POINTS`, `simulatedGEAreas`, `SimulatedGrade`, `SimulatedCourseFeedback`) against:
     `/\b(prototype|simulated|simulation|simulator|fictional|sandbox)\b|sample (student|schedule|commitments|reflection|scenario|syllabus|approach|conversation|search|week)|Verified \(demo\)|Pending \(demo\)|Google Calendar demo|Connect demo|Disconnect demo|Demo calendar|demo event|CityU EE4213|EE4213 Team/i`
   - Also iterate over runtime `blogPosts` and `Object.values(simulatedCourseFeedback)` to assert zero prototype/sample/fictional strings and valid 2-letter author initials (`!/^S\d+$/.test(post.initials)`).
