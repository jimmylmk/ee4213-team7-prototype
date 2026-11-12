import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('Task 4: Search input placeholder advertises the / shortcut', () => {
  assert.match(html, /placeholder="[^"]*Press \/ to search/);
});

test('Task 4: 100% Coursework filter pill exists in HTML and filter logic', () => {
  assert.match(html, /data-filter="coursework"[^>]*>100% Coursework<\/button>/);
  assert.match(html, /state\.activeFilter === 'coursework'/);
  assert.match(html, /c\.examPct === 0/);
});

test('Task 4: Keyboard event listener implements / accelerator and Escape hierarchy', () => {
  assert.match(html, /window\.addEventListener\('keydown'/);
  assert.match(html, /e\.key === '\/' && e\.target\.tagName !== 'INPUT' && e\.target\.tagName !== 'TEXTAREA'/);
  assert.match(html, /e\.key === 'Escape'/);
  assert.match(html, /controlGateModal.*classList\.contains\('open'\)/);
});
