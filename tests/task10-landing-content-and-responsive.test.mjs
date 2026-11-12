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
