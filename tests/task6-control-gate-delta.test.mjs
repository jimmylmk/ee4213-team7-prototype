import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('Task 6: Modal body contains delta placeholders for timings, credits, and CRNs', () => {
  assert.match(html, /id="modalDeltaContainer"/);
  assert.match(html, /id="modalProjectedCredits"/);
});

test('Task 6: Modal population logic formats full course deltas and visa floor preservation', () => {
  assert.match(html, /calculateProjectedCredits\(\)\.toFixed\(1\)} CR \(Preserves 12\.0 CR Visa Floor\)/);
  assert.match(html, /CityU AIMS requires dropping the old seat before registering the new one/);
});
