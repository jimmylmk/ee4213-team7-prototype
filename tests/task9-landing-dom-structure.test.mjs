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
