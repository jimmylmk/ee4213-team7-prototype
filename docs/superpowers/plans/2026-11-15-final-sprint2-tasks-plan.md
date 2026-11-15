# Final Sprint 2 Prototype (v2) Completion Implementation Plan

**Goal:** Complete all remaining prototype, persona, copy, v1 multi-link hosting, and HCI audit deliverables for CityU CampuSync so Jimmy can hand off the final v2 build and report evidence to Aadib before tonight's deadline.

**Branch:** `sprint-2-prototype-v2` (to be merged into `main`).

## Global Constraints
- Preserve locked names: `CityU CampuSync`, `Marcus Li`, `John Jones`, `Rehearsal Timetable`, `Course Inspector`, `CityU Blogs`.
- Strict Brand Provenance: Minimal text-only wordmark `CityU CampuSync` with violet `#7C3AED` accent. Never use CityU crimson or institutional crests.
- Strict Human-in-the-Loop: Read-only CRN handoff summary. Never add automated AIMS registration APIs.
- Zero emojis across the codebase.
- Zero build errors (`npm run build`) and 100% test pass rate (`npm test`).
- Ensure both v1 (pre-testing) and v2 (post-testing) live prototype URLs work seamlessly.

---

### Task 1: Package Pre-Testing Prototype (v1) into Vite Public Assets (`/v1/`)
**Files:**
- Create: `Design System SaaS Landing Page/public/v1/index.html`
- Create: `Design System SaaS Landing Page/public/v1.html`
- Modify: `tests/course-catalogue.test.mjs` (add v1 asset regression check)

**Requirements:**
- Copy the original single-file pre-testing prototype (`index.html` at root, commit `4b6eba1`) to `Design System SaaS Landing Page/public/v1/index.html` and `public/v1.html`.
- Verify that `npm run build` outputs `dist/v1/index.html` and `dist/v1.html`.
- Ensure GitHub Pages URL `https://jimmylmk.github.io/ee4213-team7-prototype/v1/` serves the authentic pre-testing v1 prototype.

---

### Task 2: Implement Two-Engineer Persona Architecture (Marcus Li & John Jones) on Landing Page
**Files:**
- Modify: `Design System SaaS Landing Page/src/app/components/TestimonialsSection.tsx`
- Modify: `Design System SaaS Landing Page/src/app/components/Header.tsx`
- Modify: `Design System SaaS Landing Page/src/app/components/Footer.tsx`
- Modify: `Design System SaaS Landing Page/src/app/components/HeroSection.tsx`

**Requirements:**
- In `TestimonialsSection.tsx`, update the heading and layout to showcase both student personas side-by-side in a responsive grid:
  1. **Marcus Li (Primary Persona)**: Year 2, BEng Computer & Data Engineering, JUPAS full-time student (SID 55412980). Focus: 12.0 credit full-time floor protection, 3-hour STEM lab conflict resolution, recurring tech internship/placement time blocking.
  2. **John Jones (Secondary Persona)**: Advanced Standing / Direct-Entry Transfer Student, BEng Electronic & Information Engineering (SID 55892144). Focus: Compressed 2-year graduation path, credit-waiver bridges, prerequisite waiver alignment, transfer pathway advice in CityU Blogs.
- Ensure consistent navigation links (`Student Personas`, `How It Works`) across Header, Mobile Menu, and Footer.

---

### Task 3: Refine Personal Time Controls & Timetable Header Ergonomics
**Files:**
- Modify: `Design System SaaS Landing Page/src/app/components/Dashboard.tsx`

**Requirements:**
- Reorganize timetable header toolbar to group timetable view actions logically and eliminate clutter:
  - Clear visual demarcation between Schedule Grid legend and Action Toolbar.
  - Make Personal Time toggle look like an active calendar layer switch with an intuitive `CalendarSync` / `Clock` icon and high visual affordance.
  - Ensure zero text truncation or awkward wraps on both desktop (`1280px+`) and mobile (`<768px`).

---

### Task 4: Generate Complete HCI & UX Proofreading Audit Report
**Files:**
- Create: `docs/HCI_PROOFREADING_AUDIT_REPORT.md`

**Requirements:**
- Generate the full audit table covering:
  1. Jakob Nielsen's 10 Usability Heuristics (H1–H10)
  2. Ben Shneiderman's 8 Golden Rules (R1–R8)
  3. Amershi et al.'s Human-AI Interaction Guidelines (G1, G2, G11, G16, G17, G18)
  4. Dark Patterns Audit (Zero Deception, Zero Manipulation/Fake Urgency, Zero Obstruction)
  5. Norman's Gulfs, Fitts' Law, Hick's Law & WCAG AA Contrast compliance
  6. Explicit Intentional Trade-offs documentation (Brand Provenance, Human-in-the-Loop, Occasional-use Simplicity, Locked Names)
- Include component names and line numbers for code evidence.

---

### Task 5: Verification, Git Integration, and Hand-off Documentation
**Files:**
- Run test suite: `npm test`
- Run production build: `npm run build`
- Git commit on `sprint-2-prototype-v2` and prepare merge to `main`.
- Generate ready-to-send summary message for Jimmy to reply to Aadib.
