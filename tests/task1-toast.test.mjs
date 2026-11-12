import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('Task 1: Toast container markup exists with ARIA live region attributes', () => {
  assert.match(
    html,
    /<div\s+id="toastNotification"\s+class="toast-container"\s+role="status"\s+aria-live="polite"><\/div>/,
    'Expected #toastNotification element with role="status" and aria-live="polite"'
  );
});

test('Task 1: Toast CSS styles and keyframe animation exist', () => {
  assert.match(html, /\.toast-container\s*\{[^}]*position:\s*fixed/);
  assert.match(html, /\.toast-pill\s*\{[^}]*border-radius:\s*9999px/);
  assert.match(html, /@keyframes\s+toastSlideIn/);
});

test('Task 1: showToast function exists and clears state.toastTimer to prevent collisions', () => {
  assert.match(html, /function\s+showToast\s*\(\s*msg\s*\)\s*\{/);
  assert.match(html, /clearTimeout\s*\(\s*state\.toastTimer\s*\)/);
  assert.match(html, /state\.toastTimer\s*=\s*setTimeout/);
});
