# Design Specification: Nielsen's 10 & Shneiderman's 8 Heuristic UX Refinements (Prototype v2)

**Project:** Unified Course Planning & Safe-Swap Rehearsal Sandbox (CityU EE4213 Team 7)  
**Author:** Lam Kin (Jimmy), Lead Prototype Developer  
**Date:** November 12, 2026  
**Status:** Approved for Implementation  
**Target Codebase:** `index.html` & `google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html`

---

## 1. Executive Summary & Purpose

This design specification upgrades the Course Registration Sandbox prototype (`index.html`) from **Prototype v1** to **Prototype v2** by systematically eliminating usability friction points using **Nielsen's 10 Usability Heuristics (1994)** and **Shneiderman's 8 Golden Rules of Interface Design (1985)**.

The design adheres to the non-negotiable project boundaries:
1. **Zero Auth**: Immediate boot into Marcus Li's active timetable workspace (no login/signup screens).
2. **100% Offline Simulation**: No live scraping or network writes to CityU AIMS servers.
3. **No GPA Predictors / Sliders**: Static syllabus splits, $>20\%$ group-work risk badges, and `[UNKNOWN]` provenance tags.
4. **Human-in-the-Loop Control Gate**: Explicit confirmation modal and closure checklists before simulated handoff.
5. **Strict Zero Emoji Policy**: All feedback and badges use plain text and clean typography.

---

## 2. Heuristic & Golden Rule Mapping Matrix

| Heuristic / Principle | Concrete Prototype v2 Enhancement | UI Element / Location |
| :--- | :--- | :--- |
| **N1 / S3: Visibility of System Status & Informative Feedback** | Floating toast notification engine (`showToast`) for minor actions; live credit safety indicators. | Bottom-right toast popup; topbar `#creditIndicator`. |
| **N2 & N4 / S1: Real-World Match & Consistency** | Replaced internal designer jargon with authentic CityU academic terminology. | Timetable matrix header legend; card status badges. |
| **N3 / S6: User Control, Freedom & Easy Reversal** | Bidirectional un-staging directly on catalogue cards and shortlist items; one-click schedule reset. | Catalogue list action buttons; shortlist items; `#revertScheduleBtn`. |
| **N5 / S5: Error Prevention** | 12.0 credit visa floor protection, timetable clash detection, and conflict priority choices. | Timetable `#timetableConflictBanner`; `#liveAuditContainer`. |
| **N6 / S8: Recognition Rather than Recall** | Live "Timetable Fit" badges in Course Inspector; exact time deltas shown in modal. | `#inspBadges` in Inspector; `#controlGateModal`. |
| **N7 / S2: Flexibility, Efficiency & Accelerators** | Keyboard shortcuts (`/` for search, `Esc` for dismissal); quick filter presets (`100% Coursework`). | Global `keydown` listeners; `#filterPillsContainer`. |
| **N9: Help Users Recognize, Diagnose & Recover from Errors** | Constructive next-step links for blocked courses (e.g. clicking unmet prerequisite to open it in Inspector). | Catalogue item alerts; Inspector prerequisite tree. |
| **S4: Design Dialogs to Yield Closure** | Interactive 3-step checklist on the AIMS Quick-Entry Card yielding explicit completion state. | `#liveAuditContainer` handoff card. |

---

## 3. Detailed Component Architecture

### 3.1 State Schema Extensions (`state`)

The existing `state` object is extended with minimal, robust lifecycle properties:

```javascript
const state = {
  // Existing verified core
  enrolled: [...studentProfile.baselineEnrolled],
  swapOutId: null,
  selectedReplacement: null,
  shortlist: [],
  activeFilter: 'all',
  blogFilter: 'all',
  activeBlogPostId: null,
  showOutsideCommitments: true,
  commitmentPriorityMode: 'warn',
  highlightBridge: false,
  handoffData: null,
  initialSnapshot: null,

  // Heuristic UX additions
  toastTimer: null,
  handoffChecklist: {
    seatVerified: false,
    dropExecuted: false,
    addExecuted: false
  }
};
```

**Lifecycle Reset Invariant (Critical Fix #3)**:
`state.handoffChecklist` must be explicitly reset to `{ seatVerified: false, dropExecuted: false, addExecuted: false }` in:
1. `confirmSwap()` (when staging a new swap handoff).
2. `revertSchedule()` (when reverting timetable to baseline).
3. `resetSimulator()` (when clearing all simulations).
4. `[Start New Rehearsal]` button click handler (clears `state.handoffData` while keeping confirmed schedule to allow rehearsing the next course trade).

---

### 3.2 View 1: Timetable & Rehearsal Dock Direct Manipulation

#### A. Academic Semantics in Legend & Card Badges (N2 & N4)
The header legend and timetable card badges update to clear student-facing terminology:
* **Solid Cards**: `[Enrolled · Protected on AIMS]` with distinct course border tones (Indigo `#3730a3`, Sky `#0369a1`, Emerald `#047857`, Amber `#c2410c`).
* **Muted Cards**: `[Marked for Drop · Seat Protected]` (`border: 2px dashed #d97706`).
* **Ghost Cards**: `[Staged Preview · Not on AIMS]` (`border: 2px dashed #06b6d4`).

#### B. Bidirectional Un-staging & Deadlock Elimination (N3, N5 / S5, S6, S7 - Critical Fix #2)
* **Elimination of Button Deadlock**: In `renderCatalogueList()` and `renderShortlistTray()`, never apply HTML `disabled` attribute to `data-stage` buttons solely because `state.swapOutId === null`. 
* **Interactive Feedforward (S7)**: If a student clicks `Stage Swap` when `state.swapOutId === null`, the system does NOT silently fail. Instead, it pulses the enrolled chips (`#swapOutButtonsContainer`), scrolls the control strip into focus if needed, and triggers an informative toast: `[Please select an enrolled class above to swap out first]`.
* **Bidirectional Unstage Toggle**: When a course is already actively staged as a replacement (`state.selectedReplacement === course.code`), its action button changes to a highlighted `Unstage Preview` button (`btn-danger`). Clicking it sets `state.selectedReplacement = null` and calls `renderAll()`.
* **Shortlist Tray**: Items currently staged on the grid display an active `Unstage` button.

#### C. Keyboard Accelerators & Priority Cascading (N7 / S2 - Important Fix #1)
* **Search Accelerator**: Pressing `/` globally focuses `#courseSearchInput` and selects text, guarded by:
  ```javascript
  if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    const searchInput = document.getElementById('courseSearchInput');
    searchInput.focus();
    searchInput.select();
  }
  ```
* **Escape Priority Cascade**: Pressing `Escape` executes in strict hierarchical order without race conditions:
  1. *Priority 1*: If `#controlGateModal` has class `.open`, close the modal and return.
  2. *Priority 2*: Else if `state.selectedReplacement !== null`, unstage the ghost preview (`state.selectedReplacement = null; renderAll();`) and return.
  3. *Priority 3*: Else if `#courseSearchInput` is focused or populated, clear search value, blur input, call `renderCatalogueList()`, and return.
* **Filter Preset**: Add a `[100% Coursework]` filter pill to `#filterPillsContainer` (`course.examPct === 0`).
* **Discoverability**: Placeholder reads `Search code, keyword, or weekday (Press / to search)...`.

---

### 3.3 View 2: Course Inspector & Cross-View Cognitive Load Reduction

#### A. Live Schedule Fit Badge (N6 / S8 - Critical Fix #1 & Important Fix #3/4)
Whenever `renderInspectorCourse(code)` executes, it dynamically evaluates the inspected course against `course.credits` and the projected schedule (`state.enrolled.filter(c => c !== state.swapOutId)`), appending the appropriate badge:
1. **Currently Enrolled**: `<span class="badge-pill" style="color:var(--accent); font-weight:700;">[STATUS: CURRENTLY ENROLLED · ${course.credits.toFixed(1)} CR]</span>`
2. **Currently Staged**: `<span class="badge-pill" style="color:#0891b2; font-weight:700;">[STATUS: STAGED ON TIMETABLE PREVIEW]</span>`
3. **Timetable Clash**: `<span class="badge-pill alert">[TIMETABLE CLASH: OVERLAPS WITH ${clash.code} (${clash.day} ${clash.start}-${clash.end})]</span>`
4. **Placement Collision (Kai Perez Persona)**: If non-clashing with classes but overlapping Monday Tech Placement while `state.showOutsideCommitments` is true:
   `<span class="badge-pill alert">[SCHEDULE FIT: FITS CLASSES · OVERLAPS TECH PLACEMENT (MON 09:00–13:00)]</span>`
5. **Clean Schedule**: `<span class="badge-pill" style="color:var(--positive); font-weight:700;">[SCHEDULE FIT: NO CLASH WITH YOUR SCHEDULE]</span>`

#### B. Constructive Error Diagnosis & Prerequisite Hyperlinks (N9)
When a course is blocked in the catalogue:
* **Unmet Prerequisite (e.g. `CS3334` needs `CS2201`)**:
  Renders an interactive chip `[Inspect Prerequisite CS2201 &rarr;]` that immediately loads `CS2201` in the Course Inspector so the student can inspect and plan their prerequisite progression.
* **Major Restrictions (e.g. `PHY2201` needs Physics)**:
  Renders advice badge `[Non-major waiver requires Departmental Form ARRO-02]`.

#### C. Contextual Return Breadcrumb (N4 / S1)
At the top header of `#inspectorView`, render a button: `<button class="btn" id="inspBackToTimetableBtn">&larr; Return to Weekly Timetable</button>`.

---

### 3.4 Feedback, Error Prevention & Dialog Closure

#### A. Ephemeral Toast Notification System (N1 / S3 - Important Fix #2)
* Container markup: `<div id="toastNotification" class="toast-container" role="status" aria-live="polite"></div>`.
* CSS specification:
  ```css
  .toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 120;
    pointer-events: none;
  }
  .toast-pill {
    background: #1e293b;
    color: #f8fafc;
    border: 1px solid #334155;
    padding: 8px 16px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    font-family: var(--font-sans);
    box-shadow: 0 4px 14px rgba(0,0,0,0.18);
    animation: toastSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes toastSlideIn {
    from { transform: translateY(12px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  ```
* Function `showToast(msg)` calls `clearTimeout(state.toastTimer)` before scheduling the 2500ms dismiss timer to prevent rapid-click collisions.

#### B. Scheduling Delta in Confirmation Dialog (N5 / N6)
In `#controlGateModal`, expand `#modalBodyText` to show exact scheduling deltas:
* **Drop Target**: `${dropCourse.code} (${dropCourse.title} · ${dropCourse.day} ${dropCourse.start}-${dropCourse.end} · CRN ${dropCourse.crn} · ${dropCourse.credits.toFixed(1)} CR)`
* **Replacement**: `${addCourse.code} (${addCourse.title} · ${addCourse.day} ${addCourse.start}-${addCourse.end} · CRN ${addCourse.crn} · ${addCourse.credits.toFixed(1)} CR)`
* **Projected Credit Load**: `${calculateProjectedCredits().toFixed(1)} CR (Preserves 12.0 CR Visa Floor)`
* **Non-Atomic Notice**: `"CityU AIMS requires dropping the old seat before registering the new one. Check live seat availability first."`

#### C. 3-Step Interactive AIMS Handoff Checklist (S4 - Critical Fix #3)
On the AIMS Quick-Entry Card, render an interactive form with 3 checkboxes:
1. `[ ] 1. Verified live seat availability on AIMS for Add CRN (${handoff.addCRN})`
2. `[ ] 2. Executed drop for ${handoff.dropCode} on AIMS using Drop CRN (${handoff.dropCRN})`
3. `[ ] 3. Executed add for ${handoff.addCode} on AIMS using Add CRN (${handoff.addCRN})`

Checking all three boxes immediately transitions the card into a green verified closure state:
`<div class="audit-card valid"><strong style="color:var(--positive)">[REHEARSAL & AIMS HANDOFF COMPLETE · 12.0 CREDITS SECURED]</strong><p style="font-size:11px; margin-top:4px;">You have successfully simulated the manual AIMS registration sequence with zero schedule clashes.</p><button class="btn btn-primary" id="startNewRehearsalBtn" style="margin-top:8px; width:100%;">Start New Rehearsal</button></div>`

Clicking `[Start New Rehearsal]` resets `state.handoffData = null; state.handoffChecklist = { seatVerified: false, dropExecuted: false, addExecuted: false }; renderAll();` while keeping the new schedule active.

---

## 4. Verification & Testing Strategy

1. **Static Analysis & Heuristic Linter Gate**:
   - Run `lint.mjs` to enforce zero-slop and style compliance (`0 FAIL`).
   - Run `inspect.mjs --app` at 1440px, 768px, and 390px viewports (`0 FAIL`).
2. **Zero-Emoji Enforcement**:
   - Run automated regex scan `[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]` across all files (`0 found`).
3. **Behavioral Test Suite**:
   - Verify bidirectional unstaging resets grid card states.
   - Verify Inspector timetable fit badge updates dynamically when `state.enrolled` changes.
   - Verify keyboard shortcuts (`/` and `Esc`) function properly.
   - Verify 3-step checklist enables the completion closure state.
