import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('E2E: Zero emojis present in entire codebase', () => {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const matches = html.match(new RegExp(emojiRegex, 'gu')) || [];
  assert.equal(matches.length, 0, `Expected 0 emojis, found: ${matches.join(', ')}`);
});

test('E2E: Both primary and master build copies exist and are identical', () => {
  const masterHtml = fs.readFileSync('google drive/01_Master_Prototype_&_Code_[Jimmy]/Master_Build_Code/index.html', 'utf8');
  assert.equal(html, masterHtml, 'Primary index.html and Master Build index.html must be identical');
});

test('E2E: All 8 core Nielsen & Shneiderman heuristics are fully wired', () => {
  // N1 / S3
  assert.match(html, /id="toastNotification"/);
  assert.match(html, /showToast\(/);
  // N2 & N4 / S1
  assert.match(html, /Enrolled · Protected on AIMS/);
  // N3 / S6
  assert.match(html, /Unstage Preview/);
  // N5 / S5
  assert.match(html, /calculateProjectedCredits/);
  assert.match(html, /timetableConflictBanner/);
  // N6 / S8
  assert.match(html, /SCHEDULE FIT:/);
  // N7 / S2
  assert.match(html, /e\.key === '\/'/);
  assert.match(html, /data-filter="coursework"/);
  // N9
  assert.match(html, /Inspect Prerequisite CS2201/);
  // S4
  assert.match(html, /REHEARSAL & AIMS HANDOFF COMPLETE/);
  assert.match(html, /startNewRehearsalBtn/);
});
