import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('Task 3: Catalogue stage button is never disabled solely because swapOutId is null', () => {
  assert.doesNotMatch(
    html,
    /canClickStage = state\.swapOutId !== null/,
    'Should not disable stage button when swapOutId is null'
  );
});

test('Task 3: Feedforward toast is triggered when staging without swapOutId', () => {
  assert.match(
    html,
    /Please select an enrolled class above to swap out first/,
    'Expected feedforward toast instruction'
  );
});

test('Task 3: Bidirectional un-staging exists in catalogue and shortlist', () => {
  assert.match(html, /Unstage Preview/);
  assert.match(html, /data-unstage/);
});
