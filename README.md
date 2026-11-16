# CityU CampuSync: Unified Course Planning and Safe-Swap Rehearsal Sandbox (Prototype v2)

City University of Hong Kong (CityU) | EE4213 Human-Computer Interaction | Team 7

## 1. Project overview

CityU CampuSync is the prototype deliverable for Team 7 in the EE4213 Human-Computer Interaction course at the City University of Hong Kong (CityU).

The system addresses the high-stakes risks, fragmented information, and interface cognitive overload that undergraduate and non-local students experience during course add/drop periods. Using direct manipulation and a three-state timetable rehearsal model, students can simulate course schedules and swap decisions completely offline before entering course reference numbers (CRNs) into the official university registration system (AIMS).

---

## 2. Problem statement and background

Students navigating course enrollment at CityU face three central challenges:

1. **Non-atomic registration in AIMS.** The university registration system does not offer conditional ("if-and-only-if") swaps. To swap an enrolled course for a new one, a student must first drop the enrolled class in AIMS to free credit quota, then add the new course. If the target course fills or conflicts during the add step, the student loses the original seat and fails to secure the new class.
2. **Full-time 12.0 credit floor.** Non-local students on student visas and local full-time students must maintain a minimum of 12.0 credits per semester. When a student drops a 3.0 credit course, their registered load temporarily falls to 9.0 credits. This drop creates anxiety about visa compliance and student status.
3. **Fragmented academic data.** Timetable schedules reside in AIMS, syllabi in Canvas or departmental websites, peer workload feedback on discussion boards, and final exam dates remain unannounced at the start of the term.

CityU CampuSync provides an offline rehearsal space. Students verify timetable overlaps, audit credit minimums, review personal internship commitments, and generate a manual execution checklist before modifying live enrollments.

---

## 3. Three core views

The prototype organizes planning into three interconnected views, switchable through the navigation bar or keyboard shortcuts.

### View 1: Rehearsal and safe-swap sandbox
* **Weekly timetable matrix (Monday to Friday, 09:00 to 22:00).**
  - **Three-state card semantics:**
    - `[Enrolled · Protected on AIMS]` (solid border and background): Courses currently registered in AIMS.
    - `[Marked for Drop · Seat Protected]` (amber dashed border): Courses marked for release during a swap. The seat remains protected until manually dropped in AIMS.
    - `[Staged Preview · Not on AIMS]` (dashed ghost card): Candidate courses placed on the timetable from the catalogue. These courses are not yet submitted to AIMS.
* **Conflict banner (`#timetableConflictBanner`).**
  When a candidate course conflicts with an enrolled class, the timetable displays a targeted conflict banner rather than overlapping cards. Students can keep the enrolled course or mark the conflicting course for drop with one click.
* **Personal commitments toggle.**
  Students can load external commitments, such as an off-campus tech placement (Monday and Thursday, 09:00 to 13:00), to check for schedule overlaps with academic classes.
* **Bidirectional un-staging.**
  Staged courses show an active `Unstage Preview` button on both catalogue cards and the shortlist tray. Students can remove candidate courses from the timetable draft at any point.
* **Keyboard accelerators.**
  - Press `/` to focus and select the course search input from anywhere in the application.
  - Press `Esc` to step back through a three-level hierarchy:
    1. Close open modal dialogs.
    2. Cancel staged preview courses and return to the baseline schedule.
    3. Clear the search input and remove field focus.
* **Quick filter pills.**
  Students can filter the catalogue using preset pills: `All`, `GE Electives`, `STEM Major`, `100% Coursework` (no final exam), `Open Quota`, and `No Clash`.

### View 2: Course inspector and workload diagnostics
* **Live schedule fit badge.**
  The inspector evaluates candidate courses against the active timetable draft in real time. Badges indicate status: `[STATUS: CURRENTLY ENROLLED]`, `[SCHEDULE FIT: NO CLASH]`, `[TIMETABLE CLASH: OVERLAPS WITH ...]`, or `[SCHEDULE FIT: FITS CLASSES · OVERLAPS TECH PLACEMENT]`.
* **Prerequisite navigation.**
  When an applicant has not met course prerequisites (for example, `CS3334` requiring `CS2201`), the card provides an `[Inspect Prerequisite CS2201 ->]` action. This navigates directly to the required course in the inspector. A breadcrumb link (`[<- Return to Weekly Timetable]`) returns to the schedule.
* **Weekly workload distribution.**
  The inspector divides weekly hours across lectures, tutorials, labs, project work, and preparation readings based on syllabus specifications.
* **Epistemic boundaries (Known vs Unknown data).**
  The interface distinguishes between syllabus-verified data and missing information. When exam dates or future term offerings are not yet published, the system displays `[EXAM DATE: UNKNOWN · NOT PUBLISHED]` instead of speculative estimates.
* **13-week semester timeline.**
  A milestone view displays assignments, midterms, and project deadlines across the term alongside personal commitments to highlight peak workload periods.

### View 3: Student experience blogs
* **Peer feedback and advice.**
  Six student articles offer practical advice on navigating non-local student adjustments, balancing internships with coursework, and selecting Gateway Education (GE) electives.
* **Integrated course tags.**
  Articles feature course tags (such as `#EE2000` and `#CS1302`) that open the Course Inspector directly for the referenced class.

### Control gate and AIMS handoff
* **Verification modal (`#controlGateModal`).**
  Before staging or confirming changes, this dialog summarizes time deltas, CRNs, and net credit changes. It explicitly reminds students of the non-atomic nature of live AIMS registration.
* **Three-step manual execution checklist.**
  The handoff card provides one-click copying for course reference numbers (CRNs) and presents three manual verification steps:
  1. Confirm live seat quota for the add course in AIMS.
  2. Drop the old course in AIMS using the Drop CRN.
  3. Add the new course in AIMS using the Add CRN.
  When a student checks all three items, the interface confirms completion with `[REHEARSAL & AIMS HANDOFF COMPLETE · 12.0 CREDITS SECURED]` and offers a `[Start New Rehearsal]` button for subsequent swaps.

---

## 4. Human-computer interaction heuristics mapping

Every design decision maps to established interaction frameworks from Jakob Nielsen and Ben Shneiderman:

| HCI Heuristic / Rule | Interface Implementation | Code Component / Location |
| :--- | :--- | :--- |
| **N1 / S3: Visibility of system status** | Floating toast engine (`showToast`) provides immediate operation feedback without timer collisions. Real-time credit meter monitors credit load. | `showToast` utility, `#creditIndicator` |
| **N2 & N4 / S1: Match real world and consistency** | Uses authentic CityU academic terminology (`Protected on AIMS`, `Marked for Drop`, `CRN`, `Area 1/2/3 GE`) instead of technical database terms. | Timetable legend, course cards, filter pills |
| **N3 / S6: User control and freedom** | Bidirectional un-staging buttons in catalogue cards and shortlist tray. A global `Revert Schedule` button restores the baseline enrollment. | `#revertScheduleBtn`, catalogue action toggles |
| **N5 / S5: Error prevention** | Enforces the 12.0 credit minimum floor. Displays the guided conflict banner instead of overlapping schedule cards. | `#timetableConflictBanner`, credit validation logic |
| **N6 / S8: Recognition rather than recall** | Dynamic schedule fit badges indicate conflict reasons. Control Gate dialog provides a side-by-side comparison of drop and add courses. | `#inspBadges`, `#controlGateModal` |
| **N7 / S2: Flexibility and efficiency** | Press `/` to focus search with field protection, use `Esc` for hierarchical dismissal, and apply the `100% Coursework` filter pill. | Window keyboard listeners, `#filterPillsContainer` |
| **N9: Help users recognize and recover from errors** | Provides clickable prerequisite links (`[Inspect Prerequisite CS2201 ->]`) and clear instructions for major-restricted courses. | Prerequisite inspector routing, error banners |
| **S4: Design dialogs to yield closure** | Interactive three-step checklist on the AIMS handoff card leads to an explicit green completion state. | `#liveAuditContainer`, `#startNewRehearsalBtn` |

---

## 5. Core evaluation constraints

The project follows five strict academic constraints:

1. **Zero auth.** The prototype requires no account creation or login screen. It opens directly into the workspace of primary persona Marcus Li.
2. **100% offline simulation.** Single-page and client-side architecture with no external backend dependencies. The system performs no scraping or unauthorized writes to university servers.
3. **No GPA predictors.** The system presents syllabus facts and workload distributions. It avoids speculative grade slider widgets.
4. **Human-in-the-loop control gate.** The tool acts as a rehearsal sandbox. Students retain final decision authority and manually enter verified CRNs into AIMS.
5. **Strict zero emoji policy.** All interface typography, badges, notifications, and tests use clean text and standard symbols. Colored emojis are strictly avoided across the codebase.

---

## 6. File structure and quick start

### File locations
* **Offline single-file prototype:** `index.html`
* **Master build mirror:** `google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html`
* **Modern React and Vite application:** `Design System SaaS Landing Page/`
* **Design specifications and sprint plans:**
  - Audit report: `docs/HCI_PROOFREADING_AUDIT_REPORT.md`
  - Design specification: `docs/superpowers/specs/2026-11-12-nielsen-shneiderman-ux-improvements-design.md`
  - Implementation plan: `docs/superpowers/plans/2026-11-12-nielsen-shneiderman-ux-improvements-plan.md`
* **Automated test suite:**
  - `tests/*.test.mjs` (48 automated test units across 13 test suites)

### Run the prototype

You can run the project using either the modern React and Vite application or the single-file offline prototype:

1. **Option 1: Modern React and Vite application (Recommended)**
   Run the following command in the project root:
   ```bash
   npm start
   # or
   npm run dev
   ```
   The development server starts at `http://localhost:5173` and opens automatically in your default browser.

2. **Option 2: Single-file offline archive**
   Run the local static server:
   ```bash
   npm run serve:singlefile
   ```
   You can also open `index.html` directly in any modern web browser.

### Run automated tests

Run all 48 test units using Node.js built-in test runner:
```bash
npm test
```

---

## 7. Team 7 engineering roster

* **Lam Kin (Jimmy) — Lead Prototype Developer:** Built the prototype architecture, implemented HCI heuristic refinements, authored automated test suites, and managed deployment.
* **Aadib — Technical Lead and Systems Architect:** Managed the agile backlog, established system architecture, and authored report sections 2, 4, and 5.
* **Praneel — Video Producer and Presentation Lead:** Created the presentation slide deck, edited demonstration videos, and captured interface recordings.
* **Hudaifa — Usability Testing Lead and Moderator:** Moderated usability evaluation sessions, developed user personas, and authored report sections 1, 3.1, and 3.2.
* **Louis — Data Analyst and Master Report Lead:** Logged testing observations, computed System Usability Scale (SUS) scores, and authored report sections 3.3, 3.4, and 6.
