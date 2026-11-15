# Production-Ready UI/UX Polish & De-Prototyping Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade CityU CampuSync to an official production-ready web application by removing all prototype/simulation/demo/fictional/EE4213-Team-7 wording and resolving all mobile (`320px–767px`) and desktop (`1024px+`) UI/UX layout issues.

**Architecture:** We update the data layer (`courseData.ts`) first so all instructor records and student blog posts reflect authentic CityUHK names, initials, and first-person narratives while preserving exported TypeScript identifiers (`simulatedCourseFeedback`, `SIMULATED_GRADE_POINTS`, `simulatedGEAreas`). Next, we upgrade the Landing Page components (`index.html`, `Header.tsx`, `HeroSection.tsx`, `FeaturesSection.tsx`, `Footer.tsx`, `SyllabusDrawer.tsx`) and `Dashboard.tsx` (including the single-tree responsive Mobile Day/Week Timetable Switcher, `z-30` sticky time axis, and mobile-safe flex/grid layouts). Finally, we update `tests/course-catalogue.test.mjs` with production copy and responsive layout regression assertions.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Vite 6, Node.js native test runner (`node --test`).

## Global Constraints

- Zero user-facing occurrences of `prototype`, `simulated`, `simulation`, `simulator`, `fictional`, `sandbox`, `Verified (demo)`, `Pending (demo)`, `Google Calendar demo`, `Sample student`, `CityU EE4213`, or `EE4213 Team`.
- Course code `EE4213` (`Human-Computer Interaction`) remains a valid catalogue course in `masterSchedule`.
- Internal exported variable names (`simulatedCourseFeedback`, `SIMULATED_GRADE_POINTS`, `simulatedGEAreas`, `SimulatedGrade`, `SimulatedCourseFeedback`) remain intact in `courseData.ts` for backwards-compatible test imports.
- Zero emojis across the entire codebase.
- Zero horizontal page overflow at `320px`, `375px`, `768px`, `1024px`, and `1440px` viewports.

---

### Task 1: Upgrade Data Layer (`courseData.ts`) & Align Catalogue Tests (`tests/course-catalogue.test.mjs`)

**Files:**
- Modify: `Design System SaaS Landing Page/src/app/data/courseData.ts:49-85`
- Modify: `Design System SaaS Landing Page/src/app/data/courseData.ts:399-768`
- Modify: `tests/course-catalogue.test.mjs:25-45`

**Interfaces:**
- Preserves exports: `simulatedGEAreas`, `SIMULATED_GRADE_POINTS`, `simulatedCourseFeedback`, `masterSchedule`, `blogPosts`, `studentProfile`, `validateCourse`, `getResolvedMeetings`, `getResolvedPrimarySection`, `parseMinutes`.

- [x] **Step 1: Update `tests/course-catalogue.test.mjs` to assert production faculty names, non-placeholder student authors/initials, and zero prototype/fictional strings in runtime data**
- [x] **Step 2: Run `npm test` to verify the new test assertions fail against the old prototype data**
- [x] **Step 3: Update `Design System SaaS Landing Page/src/app/data/courseData.ts` with realistic faculty names and first-person student blog posts**
- [x] **Step 4: Run `npm test` to verify data layer tests pass**

---

### Task 2: De-Prototype & Responsive Polish for Landing Page & Syllabus Drawer (`index.html`, `Header.tsx`, `HeroSection.tsx`, `FeaturesSection.tsx`, `Footer.tsx`, `SyllabusDrawer.tsx`)

**Files:**
- Modify: `Design System SaaS Landing Page/index.html:1-22`
- Modify: `Design System SaaS Landing Page/src/app/components/Header.tsx:34-108`
- Modify: `Design System SaaS Landing Page/src/app/components/HeroSection.tsx:18-133`
- Modify: `Design System SaaS Landing Page/src/app/components/FeaturesSection.tsx:45-64`
- Modify: `Design System SaaS Landing Page/src/app/components/Footer.tsx:15-65`
- Modify: `Design System SaaS Landing Page/src/app/components/SyllabusDrawer.tsx:118-152`

- [x] **Step 1: Update `index.html`, `Header.tsx`, `FeaturesSection.tsx`, `Footer.tsx`, and `SyllabusDrawer.tsx` to production branding and consistent navigation labels**
- [x] **Step 2: Update `HeroSection.tsx` so `< 640px` mobile screens render a responsive main card (`flex-wrap` badges, reduced oscillation) plus a 2-card summary grid below it without vertical overlap**
- [x] **Step 3: Run `npm run build` to verify TypeScript and Vite bundle compilation**

---

### Task 3: Upgrade `Dashboard.tsx` Copy, Mobile Day/Week Timetable Switcher, and Responsive Layouts

**Files:**
- Modify: `Design System SaaS Landing Page/src/app/components/Dashboard.tsx`
- Modify: `tests/course-catalogue.test.mjs`

- [x] **Step 1: Add production copy guard and mobile timetable responsive tests to `tests/course-catalogue.test.mjs`**
- [x] **Step 2: Update `Dashboard.tsx` to replace all simulation/prototype/demo/sample wording, add Mobile Day/Week Timetable Switcher (`< 768px`) with auto-day selection on stage and `z-30` sticky `TIME` column, and fix all mobile/desktop responsive layouts**
- [x] **Step 3: Run `npm test` and `npm run build` to verify all tests and production build pass**
