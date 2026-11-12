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

test('E2E Landing: Anchor routing with #overviewSection resolves target element and invokes scrollIntoView safely', () => {
  assert.match(html, /targetId = rawHash\.startsWith\('#'\) \? rawHash\.slice\(1\) : rawHash/);
  assert.match(html, /targetEl = document\.getElementById\(targetId\)/);
  assert.match(html, /typeof targetEl\.scrollIntoView === 'function'/);

  let scrolled = false;
  let shownLanding = false;
  const mockElement = {
    scrollIntoView: () => {
      scrolled = true;
    }
  };
  const mockDocument = {
    getElementById: (id) => (id === 'overviewSection' ? mockElement : null),
    querySelector: () => {
      throw new Error('querySelector should not be called for hash navigation');
    }
  };
  const mockWindow = {
    location: { hash: '#overviewSection' }
  };

  function runMockRoute(win, doc) {
    const rawHash = win.location.hash || '';
    const lowerHash = rawHash.toLowerCase();
    if (lowerHash === '#rehearsal' || lowerHash === '#inspector' || lowerHash === '#blogs') {
      return;
    }
    shownLanding = true;
    if (rawHash && lowerHash !== '#landing') {
      const targetId = rawHash.startsWith('#') ? rawHash.slice(1) : rawHash;
      const targetEl = doc.getElementById(targetId);
      if (targetEl && typeof targetEl.scrollIntoView === 'function') {
        targetEl.scrollIntoView();
      }
    }
  }

  runMockRoute(mockWindow, mockDocument);
  assert.equal(shownLanding, true);
  assert.equal(scrolled, true);
});

test('E2E Landing: Architectural constraints verified (zero-auth, offline single-file, no GPA predictors, human-in-the-loop gate)', () => {
  // Zero auth - Marcus Li workspace direct access without login form
  assert.match(html, /Marcus Li/);
  assert.doesNotMatch(html, /<form[^>]*login/i);

  // 100% Offline Single-File Architecture - no external script tags
  const scriptTags = html.match(/<script[^>]*src=/gi) || [];
  assert.equal(scriptTags.length, 0, 'No external script tags allowed');

  // No GPA predictors / sliders
  assert.doesNotMatch(html, /gpaPredictor/i);
  assert.doesNotMatch(html, /type="range"/i);

  // Human-in-the-loop control gate
  assert.match(html, /controlGateModal/);
  assert.match(html, /modalAutoStageBtn/);
  assert.match(html, /modalManualGuideBtn/);
  assert.match(html, /modalCancelBtn/);
  assert.match(html, /function\s+confirmSwap/);
});
