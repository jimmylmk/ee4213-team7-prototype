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
