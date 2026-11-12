# Landing Page & Dashboard Integration (Prototype v2.1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate a dedicated, full-width Landing Page into `index.html` as the initial entry point, while encapsulating the existing registration sandbox, course inspector, and student blogs into a seamless, hash-routed Dashboard.

**Architecture:** Single self-contained HTML/CSS/JavaScript file using a dual-container single-page application (SPA) architecture (`#landingView` and `#dashboardView`). State transitions occur instantaneously without page reloads, accompanied by zero-dependency hash routing (`#landing`, `#rehearsal`, `#inspector`, `#blogs`) to support native browser Back/Forward navigation in offline `file://` environments.

**Tech Stack:** Vanilla JavaScript (ES2022), CSS3 (CSS Grid, Flexbox, Media Queries), Semantic HTML5, and Node.js v26 built-in test runner (`node:test`, `node:assert/strict`).

## Global Constraints

- **Zero Auth**: No login or signup barriers; clicking "Launch Sandbox" immediately initializes Marcus Li's active timetable workspace.
- **100% Offline Single-File Architecture**: Self-contained in `index.html` with zero external dependencies, CDN links, or build tools.
- **No GPA Predictors / Sliders**: Static syllabus splits, >20% group-work risk badges, and `[UNKNOWN]` provenance tags only.
- **Human-in-the-Loop Control Gate**: Explicit confirmation modal and AIMS handoff closure checklist remain required before simulated finalization.
- **Strict Zero Emoji Policy**: All titles, icons, and status indicators strictly use clean typography and plain text (`0 found` on regex `[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]`).
- **Codebase Targets**: Primary file `./index.html`; exact mirror synced to `google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html`.
- **Zero Regressions**: All 23 existing unit and E2E tests in `tests/*.test.mjs` must continue to pass without modification.

---

### Task 1: Dual-Container Layout DOM Structure & Top-Level CSS (Critical Fix #1)

**Files:**
- Create: `tests/task9-landing-dom-structure.test.mjs`
- Modify: `index.html:150-180` (CSS definitions), `index.html:1510-1550` (DOM container hierarchy)
- Mirror: `google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html`

**Interfaces:**
- Consumes: Existing `.app-header` and `.app-shell`
- Produces:
  - `<div id="landingView" class="landing-page-wrapper"></div>`
  - `<div id="dashboardView" class="app-layout" style="display: none;">` wrapping `.app-header` and `.app-shell`
  - CSS rule `.app-layout { display: flex; flex-direction: column; min-height: 100vh; width: 100%; }`

- [ ] **Step 1: Write the failing test**

Create `tests/task9-landing-dom-structure.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('Task 1: Landing view container exists as a top-level sibling', () => {
  assert.match(
    html,
    /<div\s+id="landingView"\s+class="landing-page-wrapper"/,
    'Expected #landingView container with class "landing-page-wrapper"'
  );
});

test('Task 1: Dashboard container encloses app-header and app-shell', () => {
  assert.match(
    html,
    /<div\s+id="dashboardView"\s+class="app-layout"[^>]*style="display:\s*none;"[^>]*>/,
    'Expected #dashboardView with display: none on initial load'
  );
  
  const dashboardStart = html.indexOf('id="dashboardView"');
  const headerPos = html.indexOf('class="app-header"');
  const shellPos = html.indexOf('class="app-shell"');
  
  assert.ok(dashboardStart < headerPos, '#dashboardView must start before .app-header');
  assert.ok(headerPos < shellPos, '.app-header must be followed by .app-shell inside dashboard');
});

test('Task 1: CSS defines .app-layout with flex-direction column', () => {
  assert.match(html, /\.app-layout\s*\{[^}]*display:\s*flex/);
  assert.match(html, /\.app-layout\s*\{[^}]*flex-direction:\s*column/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/task9-landing-dom-structure.test.mjs`
Expected: FAIL with "Expected #landingView container..." assertion error.

- [ ] **Step 3: Write minimal implementation**

1. In `index.html` inside `<style>`, add `.app-layout` and `.landing-page-wrapper` CSS rules:
```css
    /* Top-Level App & Landing Page Wrappers (Prototype v2.1) */
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
    }
    .landing-page-wrapper {
      min-height: 100vh;
      background: var(--page);
      color: var(--text);
      font-family: var(--font-sans);
    }
```

2. In `index.html` right after `<body>`, insert `<div id="landingView" class="landing-page-wrapper"></div>`:
```html
<body>
  <!-- 1. FULL-WIDTH LANDING PAGE CONTAINER (Loads on initial boot) -->
  <div id="landingView" class="landing-page-wrapper"></div>

  <!-- 2. EXISTING REHEARSAL DASHBOARD CONTAINER (Initially hidden) -->
  <div id="dashboardView" class="app-layout" style="display: none;">
    <!-- Top Global App Header -->
    <header class="app-header">
```

3. Wrap the end of `<div class="app-shell">` (just before `#controlGateModal`) with the closing `</div>` for `#dashboardView`:
```html
      </main>
    </div>
  </div><!-- /#dashboardView -->

  <!-- Toast Notification & Overlays -->
  <div id="toastNotification" class="toast-container" role="status" aria-live="polite"></div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/task9-landing-dom-structure.test.mjs`
Expected: PASS with 3 passing tests.

- [ ] **Step 5: Mirror to Master Build Code**

Copy `index.html` to `google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html`.

---

### Task 2: Landing Page Markup, Components & Responsive CSS (Important Fix #4 & #5)

**Files:**
- Create: `tests/task10-landing-content-and-responsive.test.mjs`
- Modify: `index.html:180-260` (Landing CSS & media queries), `index.html:1520-1700` (`#landingView` HTML markup)
- Mirror: `google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html`

**Interfaces:**
- Consumes: Tokens `--page`, `--text`, `--panel`, `--border`, `--accent`, `--radius-card`
- Produces:
  - Top Navigation Bar (`.landing-nav`) with anchor links (`#overviewSection`, `#capabilitiesSection`, `#personaSection`, `#walkthroughSection`) and CTA button `#navLaunchBtn`
  - Hero Section (`#overviewSection`) with kicker, headline, lead paragraph, and dual CTAs (`#heroLaunchBtn`, `#heroInspectBtn`)
  - 3 Core Capability Cards (`#capabilitiesSection`): Card 1 (`#cardLaunchRehearsalBtn`), Card 2 (`#cardLaunchInspectorBtn`), Card 3 (`#cardLaunchBlogsBtn`)
  - Marcus Li Persona Showcase (`#personaSection`): demographics, constraints, and CTA button `#personaLaunchBtn`
  - 3-Step Walkthrough Section (`#walkthroughSection`)
  - Landing Footer with CityU EE4213 Team 7 attribution
  - Responsive CSS `@media (max-width: 900px)` collapsing grid to single-column

- [ ] **Step 1: Write the failing test**

Create `tests/task10-landing-content-and-responsive.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('Task 2: All four required landing sections have target anchor IDs', () => {
  assert.match(html, /id="overviewSection"/);
  assert.match(html, /id="capabilitiesSection"/);
  assert.match(html, /id="personaSection"/);
  assert.match(html, /id="walkthroughSection"/);
});

test('Task 2: Action buttons exist across navigation, hero, cards, and persona', () => {
  assert.match(html, /id="navLaunchBtn"/);
  assert.match(html, /id="heroLaunchBtn"/);
  assert.match(html, /id="heroInspectBtn"/);
  assert.match(html, /id="cardLaunchRehearsalBtn"/);
  assert.match(html, /id="cardLaunchInspectorBtn"/);
  assert.match(html, /id="cardLaunchBlogsBtn"/);
  assert.match(html, /id="personaLaunchBtn"/);
});

test('Task 2: Responsive media queries collapse landing grid below 900px', () => {
  assert.match(html, /@media\s*\(\s*max-width:\s*900px\s*\)\s*\{[^}]*\.landing-grid-3\s*\{[^}]*grid-template-columns:\s*1fr/);
  assert.match(html, /@media\s*\(\s*max-width:\s*900px\s*\)\s*\{[^}]*\.landing-persona-banner\s*\{[^}]*flex-direction:\s*column/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/task10-landing-content-and-responsive.test.mjs`
Expected: FAIL with "All four required landing sections have target anchor IDs" assertion error.

- [ ] **Step 3: Write minimal implementation**

1. In `index.html` inside `<style>`, add landing page styling and responsive breakpoints:
```css
    /* Landing Page Presentation Styles (Prototype v2.1) */
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
    .landing-nav-brand {
      font-weight: 700;
      font-size: 14px;
      color: #0f172a;
      letter-spacing: -0.01em;
    }
    .landing-nav-links {
      display: flex;
      gap: 20px;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .landing-nav-links a {
      font-size: 13px;
      font-weight: 600;
      color: var(--muted);
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .landing-nav-links a:hover {
      color: var(--text);
    }
    .landing-hero {
      max-width: 1080px;
      margin: 0 auto;
      padding: 64px 24px 48px;
      text-align: center;
    }
    .landing-kicker {
      display: inline-block;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--accent);
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      padding: 4px 10px;
      border-radius: 9999px;
      margin-bottom: 16px;
    }
    .landing-hero h1 {
      font-size: 36px;
      line-height: 1.2;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #0f172a;
      margin: 0 0 16px;
    }
    .landing-hero p {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      max-width: 780px;
      margin: 0 auto 32px;
    }
    .landing-hero-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
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
    .landing-card-tag {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      color: var(--muted);
      margin-bottom: 8px;
      display: block;
    }
    .landing-card h3 {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px;
    }
    .landing-card p {
      font-size: 13px;
      line-height: 1.5;
      color: #475569;
      margin: 0 0 20px;
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
    .walkthrough-steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 20px;
    }
    .walkthrough-step-card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
      padding: 20px;
    }
    .landing-footer {
      border-top: 1px solid var(--border);
      background: var(--panel);
      padding: 32px 24px;
      text-align: center;
      font-size: 12px;
      color: var(--muted);
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
      .landing-nav-links {
        display: none;
      }
      .walkthrough-steps-grid {
        grid-template-columns: 1fr;
      }
    }
```

2. Inside `<div id="landingView" class="landing-page-wrapper">`, insert the complete semantic markup:
```html
  <div id="landingView" class="landing-page-wrapper">
    <!-- Top Navigation Bar -->
    <nav class="landing-nav">
      <div class="landing-nav-brand">CityU EE4213 Team 7 · Course Planning Sandbox</div>
      <ul class="landing-nav-links">
        <li><a href="#overviewSection">Overview</a></li>
        <li><a href="#capabilitiesSection">Key Capabilities</a></li>
        <li><a href="#personaSection">Student Persona</a></li>
        <li><a href="#walkthroughSection">3-Step Walkthrough</a></li>
      </ul>
      <button class="btn btn-primary" id="navLaunchBtn" style="height: 32px; font-size: 12px;">
        Launch Sandbox Workspace &rarr;
      </button>
    </nav>

    <!-- Hero Section (Important Fix #5: id="overviewSection") -->
    <header class="landing-hero" id="overviewSection">
      <span class="landing-kicker">[STUDENT-CENTERED HCI PROTOTYPE V2.1 · CITYU AY2026/27]</span>
      <h1>Unified Course Planning &amp; Safe-Swap Rehearsal Sandbox</h1>
      <p>
        Eliminate the fear of dropping a course on CityU AIMS before securing a replacement. Safe-Swap Sandbox is a client-side rehearsal environment designed to protect your 12.0 credit full-time visa floor, detect timetable clashes in advance, and balance academic workloads against outside placement commitments.
      </p>
      <div class="landing-hero-actions">
        <button class="btn btn-primary" id="heroLaunchBtn" style="height: 40px; font-size: 13px; padding: 0 20px;">
          Launch Rehearsal Sandbox &rarr;
        </button>
        <button class="btn" id="heroInspectBtn" style="height: 40px; font-size: 13px; padding: 0 20px;">
          Course Workload Diagnostics
        </button>
      </div>
    </header>

    <!-- 3 Core Capabilities Grid (id="capabilitiesSection") -->
    <section class="landing-grid-3" id="capabilitiesSection">
      <div class="landing-card">
        <div>
          <span class="landing-card-tag">[NON-ATOMIC AIMS REGISTRATION PROTECTION]</span>
          <h3>3-State Safe-Swap Rehearsal</h3>
          <p>
            Preview course trades across Solid (Enrolled), Muted (Marked for Drop), and Ghost (Staged Preview) states before modifying actual AIMS records. Automatic checks enforce the 12.0 credit visa floor and prevent timetable overlaps.
          </p>
        </div>
        <button class="btn btn-primary" id="cardLaunchRehearsalBtn" style="height: 32px; font-size: 12px; width: 100%;">
          Open Weekly Timetable &rarr;
        </button>
      </div>

      <div class="landing-card">
        <div>
          <span class="landing-card-tag">[STATIC SYLLABUS &amp; DELIVERABLE TIMELINE]</span>
          <h3>Transparent Workload Diagnostics</h3>
          <p>
            Inspect weekly lecture, tutorial, lab, project, and study hour distributions derived from official course syllabi. Correlate 13-week deliverable stress milestones directly against outside internship hours.
          </p>
        </div>
        <button class="btn" id="cardLaunchInspectorBtn" style="height: 32px; font-size: 12px; width: 100%;">
          Inspect Course Workload &rarr;
        </button>
      </div>

      <div class="landing-card">
        <div>
          <span class="landing-card-tag">[AUTHENTIC CITYU STUDENT EXPERIENCES]</span>
          <h3>Verified Peer Reviews &amp; Blogs</h3>
          <p>
            Read 6 verified student blog reviews focusing on non-local adjustment, GE course selections, and placement balancing. Click any course tag inside an article to inspect its prerequisites instantly.
          </p>
        </div>
        <button class="btn" id="cardLaunchBlogsBtn" style="height: 32px; font-size: 12px; width: 100%;">
          Read Student Blogs &rarr;
        </button>
      </div>
    </section>

    <!-- Testing Persona Showcase (id="personaSection") -->
    <section class="landing-persona-banner" id="personaSection">
      <div>
        <span class="landing-card-tag" style="color: var(--accent); font-weight: 700;">[PRIMARY TESTING PERSONA]</span>
        <h2 style="font-size: 18px; margin: 4px 0 6px; color: #0f172a;">Marcus Li (Subgroups A/C/D Synthesized)</h2>
        <p style="font-size: 12px; font-family: var(--font-mono); color: var(--muted); margin: 0 0 10px;">
          Year 1 STEM Undergraduate · Undeclared Major · Student ID: 55489201 · Full-Time 12.0–18.0 Credits
        </p>
        <p style="font-size: 13px; color: #334155; max-width: 680px; margin: 0;">
          Marcus needs to swap his Friday afternoon elective (GE1109) for a morning section while protecting his 12.0 credit full-time visa floor and avoiding timetable clashes with his Thursday and Monday Tech Placement (09:00–13:00).
        </p>
      </div>
      <button class="btn btn-primary" id="personaLaunchBtn" style="height: 36px; font-size: 12px; white-space: nowrap;">
        Enter Rehearsal with Marcus's Baseline &rarr;
      </button>
    </section>

    <!-- 3-Step Walkthrough (id="walkthroughSection") -->
    <section class="landing-walkthrough" id="walkthroughSection">
      <div style="text-align: center; margin-bottom: 24px;">
        <span class="landing-card-tag">[SAFE-SWAP REHEARSAL WORKFLOW]</span>
        <h2 style="font-size: 22px; color: #0f172a; margin: 4px 0;">How It Works in 3 Simple Steps</h2>
      </div>
      <div class="walkthrough-steps-grid">
        <div class="walkthrough-step-card">
          <strong style="font-size: 14px; color: var(--accent);">Step 1: Select Drop Target</strong>
          <p style="font-size: 12px; color: var(--muted); margin-top: 6px;">
            Choose an enrolled course (e.g. GE1109) to mark for swap-out. Its timetable card enters a muted state while your seat remains fully protected.
          </p>
        </div>
        <div class="walkthrough-step-card">
          <strong style="font-size: 14px; color: var(--accent);">Step 2: Preview Replacement</strong>
          <p style="font-size: 12px; color: var(--muted); margin-top: 6px;">
            Browse the 22-course simulated catalogue and click Stage Swap to project a ghost card onto the grid, verifying zero clashes and credit safety.
          </p>
        </div>
        <div class="walkthrough-step-card">
          <strong style="font-size: 14px; color: var(--accent);">Step 3: Supervised AIMS Handoff</strong>
          <p style="font-size: 12px; color: var(--muted); margin-top: 6px;">
            Review the Human Control Gate delta, check the 3-step manual verification list, and copy verified CRNs to AIMS with complete closure.
          </p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <p style="margin: 0 0 6px;">
        CityU EE4213 Human-Computer Interaction · Team #7 · Unified Course Planning &amp; Safe-Swap Rehearsal Sandbox
      </p>
      <p style="margin: 0; font-family: var(--font-mono); font-size: 11px;">
        Designed for AY2026/27 Semester A Course Add/Drop Rehearsal. 100% Offline Simulation.
      </p>
    </footer>
  </div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/task10-landing-content-and-responsive.test.mjs`
Expected: PASS with 3 passing tests.

- [ ] **Step 5: Mirror to Master Build Code**

Copy `index.html` to `google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html`.

---

### Task 3: View-State Engine, Deep-Linking Lifecycle & Safe Hash Routing (Critical Fix #2, Important Fix #3, Minor Fix #6-8)

**Files:**
- Create: `tests/task11-landing-routing-and-actions.test.mjs`
- Modify: `index.html:1560-1580` (Sidebar home return button), `index.html:3100-3350` (JavaScript routing and event listeners)
- Mirror: `google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html`

**Interfaces:**
- Consumes: `state`, `switchMainView()`, `renderAll()`, `renderInspectorCourse()`, `renderBlogs()`
- Produces:
  - `showLandingPage(updateHash = true)`
  - `showDashboard(targetSubView = 'rehearsalView', updateHash = true)`
  - `handleHashRoute()` listening on `window.addEventListener('hashchange', ...)`
  - `updateLandingPageCTA()`: updates `#heroLaunchBtn` to `Resume Active Rehearsal [Rehearsal In-Progress]` when simulation is active
  - Sidebar return button `#sidebarReturnHomeBtn`
  - Guarded keyboard shortcut `/`: launches dashboard if on landing page

- [ ] **Step 1: Write the failing test**

Create `tests/task11-landing-routing-and-actions.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('Task 3: showLandingPage and showDashboard functions are declared with lifecycle hooks', () => {
  assert.match(html, /function\s+showLandingPage\s*\(/);
  assert.match(html, /function\s+showDashboard\s*\(/);
  assert.match(html, /targetSubView === 'inspectorView'/);
  assert.match(html, /targetSubView === 'blogsView'/);
});

test('Task 3: Sidebar return home button exists in markup and has click listener', () => {
  assert.match(html, /id="sidebarReturnHomeBtn"/);
  assert.match(html, /sidebarReturnHomeBtn.*addEventListener\('click'/);
});

test('Task 3: Hash routing listener is wired to window hashchange', () => {
  assert.match(html, /window\.addEventListener\('hashchange',\s*handleHashRoute\)/);
  assert.match(html, /location\.hash\s*=\s*'#landing'/);
});

test('Task 3: Keyboard accelerator / transitions to rehearsalView when pressed on landing page', () => {
  assert.match(html, /document\.getElementById\('dashboardView'\)\.style\.display === 'none'/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/task11-landing-routing-and-actions.test.mjs`
Expected: FAIL with "showLandingPage and showDashboard functions are declared..." assertion error.

- [ ] **Step 3: Write minimal implementation**

1. In `index.html` inside `<aside class="app-sidebar">`, add `#sidebarReturnHomeBtn` as the first element:
```html
      <div class="sidebar-brand">
        <div class="brand-title">Safe-Swap Sandbox</div>
        <span class="badge-offline">100% Offline Simulation</span>
      </div>

      <!-- Sidebar Return to Project Home Button (Prototype v2.1) -->
      <div class="sidebar-home-link" style="padding: 10px 14px; border-bottom: 1px solid var(--border);">
        <button id="sidebarReturnHomeBtn" class="btn" style="width: 100%; height: 30px; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px;">
          &larr; Project Home / Overview
        </button>
      </div>

      <div class="sidebar-nav">
```

2. In `<script>` under UI Rendering / Routing Engines, declare `showLandingPage`, `showDashboard`, `updateLandingPageCTA`, and `handleHashRoute`:
```javascript
    /* ==========================================================================
       TOP-LEVEL SPA VIEW ROUTING & HASH NAVIGATION (PROTOTYPE V2.1)
       ========================================================================== */
    function updateLandingPageCTA() {
      const heroBtn = document.getElementById('heroLaunchBtn');
      if (!heroBtn) return;
      const isRehearsalActive = state.swapOutId !== null || state.selectedReplacement !== null || state.handoffData !== null;
      if (isRehearsalActive) {
        heroBtn.innerHTML = 'Resume Active Rehearsal &rarr; <span style="font-size:11px; opacity:0.85; margin-left:4px;">[In-Progress]</span>';
      } else {
        heroBtn.innerHTML = 'Launch Rehearsal Sandbox &rarr;';
      }
    }

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

      // Subview Lifecycle Initializers (Critical Fix #2)
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

    function handleHashRoute() {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#rehearsal') {
        showDashboard('rehearsalView', false);
      } else if (hash === '#inspector') {
        showDashboard('inspectorView', false);
      } else if (hash === '#blogs') {
        showDashboard('blogsView', false);
      } else {
        showLandingPage(false);
      }
    }

    window.addEventListener('hashchange', handleHashRoute);
```

3. Update the global keyboard shortcut listener for `/` to handle landing page state:
```javascript
      // 1. Search accelerator '/'
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
        return;
      }
```

4. In the event listeners section, wire all landing page buttons and `#sidebarReturnHomeBtn`:
```javascript
    // Landing Page Action Buttons
    document.getElementById('navLaunchBtn')?.addEventListener('click', () => showDashboard('rehearsalView'));
    document.getElementById('heroLaunchBtn')?.addEventListener('click', () => showDashboard('rehearsalView'));
    document.getElementById('heroInspectBtn')?.addEventListener('click', () => showDashboard('inspectorView'));
    document.getElementById('cardLaunchRehearsalBtn')?.addEventListener('click', () => showDashboard('rehearsalView'));
    document.getElementById('cardLaunchInspectorBtn')?.addEventListener('click', () => showDashboard('inspectorView'));
    document.getElementById('cardLaunchBlogsBtn')?.addEventListener('click', () => showDashboard('blogsView'));
    document.getElementById('personaLaunchBtn')?.addEventListener('click', () => showDashboard('rehearsalView'));

    // Sidebar Return to Landing Page
    document.getElementById('sidebarReturnHomeBtn')?.addEventListener('click', () => showLandingPage());
```

5. At initial startup, call `handleHashRoute()`:
```javascript
    // Initial Load
    saveInitialSnapshot();
    renderAll();
    renderBlogs();
    renderInspectorCourse('CS3334');
    handleHashRoute();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/task11-landing-routing-and-actions.test.mjs`
Expected: PASS with 4 passing tests.

- [ ] **Step 5: Mirror to Master Build Code**

Copy `index.html` to `google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html`.

---

### Task 4: Comprehensive End-to-End Verification & Linter Audit

**Files:**
- Create: `tests/e2e-all-landing-and-dashboard.test.mjs`
- Test: Run all 27 unit and E2E tests (`tests/*.test.mjs`)
- Verify: `index.html` and `Master_Build_Code/index.html`

**Interfaces:**
- Consumes: All implemented tasks across `index.html`
- Produces: 100% passing tests, 0 emojis, 0 linter failures.

- [ ] **Step 1: Write comprehensive end-to-end test suite**

Create `tests/e2e-all-landing-and-dashboard.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('E2E Landing: Zero emojis present in entire codebase', () => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const matches = html.match(new RegExp(emojiRegex, 'gu')) || [];
  assert.equal(matches.length, 0, `Expected 0 emojis, found: ${matches.join(', ')}`);
});

test('E2E Landing: Primary index.html and Master Build index.html are identical', () => {
  const masterHtml = fs.readFileSync('google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html', 'utf8');
  assert.equal(html, masterHtml, 'Primary index.html and Master Build index.html must have 0 diff');
});

test('E2E Landing: Landing page and Dashboard integration is complete', () => {
  assert.match(html, /id="landingView"/);
  assert.match(html, /id="dashboardView"/);
  assert.match(html, /id="sidebarReturnHomeBtn"/);
  assert.match(html, /showLandingPage/);
  assert.match(html, /showDashboard/);
  assert.match(html, /handleHashRoute/);
});
```

- [ ] **Step 2: Run all test suites**

Run: `node --test tests/*.test.mjs`
Expected: PASS for all tests across all test suites (27/27 pass).

- [ ] **Step 3: Run design-taste linter**

Run: `node /Users/wat2002221/.gemini/config/skills/design-taste-frontend/scripts/lint.mjs index.html`
Expected: `0 FAIL`.

- [ ] **Step 4: Run design-taste visual inspector**

Run: `node /Users/wat2002221/.gemini/config/skills/design-taste-frontend/scripts/inspect.mjs --app index.html`
Expected: `0 FAIL` across 1440px, 768px, and 390px viewports.

---

## Self-Review Checklist

1. **Spec Coverage**:
   - Section 2.1 DOM Hierarchy (.app-header enclosed inside #dashboardView): Task 1.
   - Section 2.2 Lifecycle Initializations in showDashboard: Task 3.
   - Section 2.3 Hash Routing (window.hashchange): Task 3.
   - Section 2.4 Sidebar Return Navigation: Task 3.
   - Section 3 Component Breakdown (Top bar, Hero, 3 Cards, Persona, Walkthrough, Footer): Task 2.
   - Section 4 Responsive CSS media queries (<900px): Task 2.
   - Section 4.1 Keyboard accelerator guard: Task 3.
   - Section 5 Verification Strategy (27 tests, 0 emojis, linter, mirror sync): Task 4.

2. **Placeholder Scan**: Zero instances of "TODO", "TBD", "implement later", or vague instructions. Every step has exact runnable test code and exact diffs.

3. **Type and Signature Consistency**:
   - `showLandingPage(updateHash)` and `showDashboard(targetSubView, updateHash)` match across all tasks.
   - Element IDs (`#landingView`, `#dashboardView`, `#sidebarReturnHomeBtn`, `#navLaunchBtn`, `#heroLaunchBtn`, `#heroInspectBtn`, `#cardLaunchRehearsalBtn`, `#cardLaunchInspectorBtn`, `#cardLaunchBlogsBtn`, `#personaLaunchBtn`) match across all tests and markup.
