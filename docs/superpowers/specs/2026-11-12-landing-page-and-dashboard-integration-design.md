# Design Specification: Landing Page & Dashboard Integration (Prototype v2.1)

**Project:** Unified Course Planning & Safe-Swap Rehearsal Sandbox (CityU EE4213 Team 7)  
**Author:** Lam Kin (Jimmy), Lead Prototype Developer  
**Date:** November 12, 2026  
**Status:** Approved for Implementation (Post-Review Revision)  
**Target Codebase:** `index.html` & `google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html`

---

## 1. Executive Summary & Purpose

This design specification upgrades the Course Registration Sandbox from **Prototype v2** to **Prototype v2.1** in response to team member feedback (WhatsApp request November 12, 2026):
> *"Could you also create a landing page. So when the user opens the link it opens landing page and you just create some intro or welcome message and then a link to the actual app."*

The primary goal is to provide a dedicated, welcoming entry experience for external evaluators, graders, and usability test participants before they dive into the complex registration matrix. The existing registration sandbox, course inspector, and student blogs are cleanly integrated as the **Dashboard** accessible via prominent call-to-action buttons.

### Core Non-Negotiable Boundaries Maintained
1. **Zero Auth**: No login or password gates; clicking "Launch Sandbox" immediately initializes the active Marcus Li timetable simulation.
2. **100% Offline Single-File Architecture**: Remains completely self-contained within `index.html`, with zero build tooling or network dependencies.
3. **No GPA Predictors / Sliders**: Adheres to honest epistemic boundaries, displaying static syllabus splits and `[UNKNOWN]` exam date tags.
4. **Human-in-the-Loop Control Gate**: Explicit confirmation modal and AIMS handoff closure checklist remain required before simulated finalization.
5. **Strict Zero Emoji Policy**: All titles, icons, and status indicators strictly use clean typography and plain text.

---

## 2. Top-Level Page Architecture & View-State Machine

### 2.1 DOM Hierarchy (Critical Fix #1)
In `index.html`, the `<body>` hosts two top-level sibling containers. Crucially, `<header class="app-header">` and `<div class="app-shell">` are both nested inside `<div id="dashboardView" class="app-layout">` so the dashboard header and controls do not leak onto the landing page:

```html
<body>
  <!-- 1. FULL-WIDTH LANDING PAGE CONTAINER (Loads on initial boot) -->
  <div id="landingView" class="landing-page-wrapper">
    <!-- Top Navigation, Hero Section, Feature Highlights, Persona Showcase, Walkthrough, Footer -->
  </div>

  <!-- 2. EXISTING REHEARSAL DASHBOARD CONTAINER (Initially hidden) -->
  <div id="dashboardView" class="app-layout" style="display: none;">
    <!-- Shared Dashboard Header (.app-header) -->
    <header class="app-header">...</header>

    <!-- Shell (.app-shell) holding Sidebar and Main Views -->
    <div class="app-shell">
      <aside class="app-sidebar">...</aside>
      <main class="app-main">
        <section id="rehearsalView" class="view-container">...</section>
        <section id="inspectorView" class="view-container">...</section>
        <section id="blogsView" class="view-container">...</section>
      </main>
    </div>
  </div>

  <!-- Global Overlays & Modals (Shared across views) -->
  <div id="toastNotification" class="toast-container" role="status" aria-live="polite"></div>
  <div class="modal-overlay" id="controlGateModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">...</div>
</body>
```

### 2.2 View Transition & Subview Lifecycle Engine (Critical Fix #2)
To ensure that deep-links into specific dashboard tabs (such as the Course Inspector or CityU Blogs) properly initialize all dynamic subview data, `showDashboard(targetSubView)` includes full lifecycle initializers:

```javascript
function showLandingPage(updateHash = true) {
  document.getElementById('landingView').style.display = 'block';
  document.getElementById('dashboardView').style.display = 'none';
  if (updateHash) {
    location.hash = '#landing';
  }
  updateLandingPageCTA();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function showDashboard(targetSubView = 'rehearsalView', updateHash = true) {
  document.getElementById('landingView').style.display = 'none';
  document.getElementById('dashboardView').style.display = 'flex';
  switchMainView(targetSubView);
  renderAll();

  // Subview-Specific Lifecycle Initializers (Critical Fix #2)
  if (targetSubView === 'inspectorView') {
    const code = state.swapOutId || state.enrolled[0] || 'CS3334';
    const selectEl = document.getElementById('inspectorCourseSelect');
    if (selectEl) selectEl.value = code;
    renderInspectorCourse(code);
  } else if (targetSubView === 'blogsView') {
    state.activeBlogPostId = null;
    renderBlogs();
  }

  if (updateHash) {
    location.hash = '#' + targetSubView.replace('View', '');
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}
```

### 2.3 Safe Hash Routing for Browser History (Important Fix #3)
To avoid `file://` security exceptions while enabling standard browser Back/Forward navigation, routing is managed via lightweight URL hash listening:

```javascript
function handleHashRoute() {
  const hash = window.location.hash.toLowerCase();
  if (hash === '#rehearsal') {
    showDashboard('rehearsalView', false);
  } else if (hash === '#inspector') {
    showDashboard('inspectorView', false);
  } else if (hash === '#blogs') {
    showDashboard('blogsView', false);
  } else {
    // Default to landing page on initial visit or #landing
    showLandingPage(false);
  }
}

window.addEventListener('hashchange', handleHashRoute);
```

### 2.4 Persistent Sidebar Return Navigation
At the very top of `<aside class="app-sidebar">`, above the view tabs:
```html
<div class="sidebar-home-link" style="padding: 12px 14px; border-bottom: 1px solid var(--border);">
  <button id="sidebarReturnHomeBtn" class="btn" style="width: 100%; height: 32px; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px;">
    &larr; Project Home / Overview
  </button>
</div>
```
Clicking `#sidebarReturnHomeBtn` invokes `showLandingPage()`, preserving any active schedule state or shortlisted courses on the dashboard.

---

## 3. Landing Page Component Breakdown & Wireframe

### 3.1 Top Navigation Bar
- **Branding:** `CityU EE4213 Team 7 · Course Planning Sandbox`
- **Anchor Links (Important Fix #5):**
  - `<a href="#overviewSection">Overview</a>`
  - `<a href="#capabilitiesSection">Key Capabilities</a>`
  - `<a href="#personaSection">Student Persona</a>`
  - `<a href="#walkthroughSection">3-Step Walkthrough</a>`
- **Action Button:** `[Launch Sandbox Workspace &rarr;]` (class `btn btn-primary`) invoking `showDashboard('rehearsalView')`.

### 3.2 Hero Section (`id="overviewSection"`)
- **Kicker Tag:** `[STUDENT-CENTERED HCI PROTOTYPE V2.1 · CITYU AY2026/27]`
- **Headline:** `Unified Course Planning & Safe-Swap Rehearsal Sandbox`
- **Lead Paragraph:**
  `Eliminate the fear of dropping a course on CityU AIMS before securing a replacement. Safe-Swap Sandbox is a client-side rehearsal environment designed to protect your 12.0 credit full-time visa floor, detect timetable clashes in advance, and balance academic workloads against outside placement commitments.`
- **Dual CTA Buttons & In-Flight State Indicator (Minor Fix #8):**
  - Primary Hero CTA (`#heroLaunchBtn`):
    - Default: `Launch Rehearsal Sandbox &rarr;`
    - When simulation active (`state.swapOutId !== null || state.selectedReplacement !== null`): `Resume Active Rehearsal &rarr; [Rehearsal In-Progress]`
  - Secondary Hero CTA (`#heroInspectBtn`): `Course Workload Diagnostics` (calls `showDashboard('inspectorView')`)

### 3.3 Core Capabilities Grid (`id="capabilitiesSection"`, 3 Highlight Cards)
1. **Card 1: 3-State Safe-Swap Rehearsal (N2 & N3 / S5 & S6)**
   - Header: `[NON-ATOMIC AIMS REGISTRATION PROTECTION]`
   - Description: `Preview course trades across Solid (Enrolled), Muted (Marked for Drop), and Ghost (Staged Preview) states before modifying actual AIMS records. Automatic checks enforce the 12.0 credit visa floor and prevent timetable overlaps.`
   - Action Button: `Open Weekly Timetable &rarr;` (`showDashboard('rehearsalView')`)
2. **Card 2: Transparent Workload Diagnostics (N6 / S8)**
   - Header: `[STATIC SYLLABUS & DELIVERABLE TIMELINE]`
   - Description: `Inspect weekly lecture, tutorial, lab, project, and study hour distributions derived from official course syllabi. Correlate 13-week deliverable stress milestones directly against outside internship hours.`
   - Action Button: `Inspect Course Workload &rarr;` (`showDashboard('inspectorView')`)
3. **Card 3: Verified Peer Reviews & Blogs (N10 / S1)**
   - Header: `[AUTHENTIC CITYU STUDENT EXPERIENCES]`
   - Description: `Read 6 verified student blog reviews focusing on non-local adjustment, GE course selections, and placement balancing. Click any course tag inside an article to inspect its prerequisites instantly.`
   - Action Button: `Read Student Blogs &rarr;` (`showDashboard('blogsView')`)

### 3.4 Active Testing Persona Showcase (`id="personaSection"`)
- **Persona Name:** `Marcus Li (Synthesized Primary Persona: Subgroups A/C/D)`
- **Demographics:** `Year 1 STEM Undergraduate · Undeclared Major · Student ID: 55489201`
- **Academic Baseline:** `12.0 Credits Enrolled (EE2000, CS1302, GE1501, GE1109)`
- **Core Challenge:** `Marcus needs to swap his Friday afternoon elective (GE1109) for a morning course while protecting his 12.0 credit full-time visa floor and preventing clashes with his Thursday/Monday Tech Placement.`
- **Action Button (Minor Fix #7):** `Enter Rehearsal with Marcus's Baseline &rarr;` (`showDashboard('rehearsalView')`)

### 3.5 3-Step Walkthrough Section (`id="walkthroughSection"`)
- **Step 1: Select Drop Target** &mdash; Mark an enrolled course (`GE1109`) to swap out without releasing the seat.
- **Step 2: Preview Replacement** &mdash; Stage a candidate course (`GE1907`) onto the timetable to evaluate clashes and credit balance.
- **Step 3: Supervised AIMS Handoff** &mdash; Review the Human Control Gate delta, check the 3-step manual verification list, and copy verified CRNs to AIMS.

### 3.6 Footer
- Text: `CityU EE4213 Human-Computer Interaction · Team #7 · Unified Course Planning & Safe-Swap Rehearsal Sandbox`
- Academic Provenance note: `Designed for AY2026/27 Semester A Course Add/Drop Rehearsal. 100% Offline Simulation.`

---

## 4. Visual Design & Responsive CSS Tokens (Important Fix #4)

The landing page utilizes established design tokens from `index.html` and introduces responsive stacking:

```css
/* Dashboard Wrapper Layout (Critical Fix #1) */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

/* Landing Page Presentation Tokens */
.landing-page-wrapper {
  min-height: 100vh;
  background: var(--page);
  color: var(--text);
  font-family: var(--font-sans);
}

.landing-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.landing-hero {
  max-width: 1080px;
  margin: 0 auto;
  padding: 64px 24px 48px;
  text-align: center;
}

.landing-hero h1 {
  font-size: 36px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin: 16px 0;
}

.landing-hero p {
  font-size: 15px;
  line-height: 1.6;
  color: #475569;
  max-width: 780px;
  margin: 0 auto 32px;
}

.landing-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 1140px;
  margin: 0 auto 64px;
  padding: 0 24px;
}

.landing-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
}

.landing-persona-banner {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-card);
  max-width: 1140px;
  margin: 0 auto 64px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.landing-walkthrough {
  max-width: 1140px;
  margin: 0 auto 64px;
  padding: 0 24px;
}

/* Responsive Breakpoints (Important Fix #4) */
@media (max-width: 900px) {
  .landing-grid-3 {
    grid-template-columns: 1fr;
  }
  .landing-persona-banner {
    flex-direction: column;
    align-items: flex-start;
  }
  .landing-nav {
    padding: 12px 16px;
  }
}
```

### 4.1 Keyboard Accelerator Guard (Minor Fix #6)
In the global keydown handler for `/`, ensure the search focus only executes when `#dashboardView` is actively visible, or switches into `#rehearsalView` if pressed on the landing page:
```javascript
if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
  e.preventDefault();
  if (document.getElementById('dashboardView').style.display === 'none') {
    showDashboard('rehearsalView');
  }
  const searchInput = document.getElementById('courseSearchInput');
  if (searchInput) {
    searchInput.focus();
    searchInput.select();
  }
}
```

---

## 5. Verification & Testing Strategy

1. **Automated Test Suite (`tests/task9-landing-page.test.mjs`):**
   - Verify `#landingView` is rendered in DOM and displayed on page load.
   - Verify `#dashboardView` contains `.app-header` and `.app-shell` and is initially hidden (`display: none`).
   - Verify all primary and secondary CTA buttons invoke `showDashboard()`.
   - Verify `#sidebarReturnHomeBtn` exists and invokes `showLandingPage()`.
   - Verify hash routing switches views (`#landing`, `#rehearsal`, `#inspector`, `#blogs`).
   - Verify all 23 prior unit tests in `tests/*.test.mjs` pass with 0 regressions.
2. **Zero-Emoji Enforcement:**
   - Scan for regex `[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]` across all files (`0 found`).
3. **Design-Taste Linter & Responsive Inspector:**
   - Run `lint.mjs` (`0 FAIL`).
   - Run `inspect.mjs --app` across 1440px, 768px, and 390px viewports (`0 FAIL`).
4. **Mirror Synchronization:**
   - Ensure byte-for-byte exact equality between `./index.html` and `google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html`.
