import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('Task 2: Header legend uses authentic academic semantics', () => {
  assert.match(html, /Solid:\s*Enrolled\s*·\s*Protected on AIMS/);
  assert.match(html, /Muted:\s*Marked for Drop\s*·\s*Seat Protected/);
  assert.match(html, /Ghost:\s*Staged Preview\s*·\s*Not on AIMS/);
});

test('Task 2: Card badges in renderTimetableMatrix use updated academic terminology', () => {
  assert.match(html, /statusText\s*=\s*'\[Enrolled · Protected on AIMS\]'/);
  assert.match(html, /statusText\s*=\s*'\[Marked for Drop · Seat Protected\]'/);
  assert.match(html, /statusText\s*=\s*'\[Staged Preview · Not on AIMS\]'/);
});
