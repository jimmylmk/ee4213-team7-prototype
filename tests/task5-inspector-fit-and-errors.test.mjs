import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('Task 5: Inspector header includes Return to Weekly Timetable breadcrumb button', () => {
  assert.match(html, /id="inspBackToTimetableBtn"/);
  assert.match(html, /Return to Weekly Timetable/);
});

test('Task 5: Inspector renders dynamic Schedule Fit badge evaluating projected schedule and placement', () => {
  assert.match(html, /SCHEDULE FIT: NO CLASH WITH YOUR SCHEDULE/);
  assert.match(html, /STATUS: CURRENTLY ENROLLED · \$\{course\.credits\.toFixed\(1\)\} CR/);
  assert.match(html, /SCHEDULE FIT: FITS CLASSES · OVERLAPS TECH PLACEMENT \(MON 09:00–13:00\)/);
});

test('Task 5: Catalogue and Inspector render constructive prerequisite hyperlink and advice', () => {
  assert.match(html, /data-inspect-prereq/);
  assert.match(html, /Inspect Prerequisite CS2201/);
  assert.match(html, /Non-major waiver requires Departmental Form ARRO-02/);
});
