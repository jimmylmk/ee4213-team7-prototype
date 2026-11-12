import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');

test('Task 7: state.handoffChecklist schema is declared', () => {
  assert.match(html, /handoffChecklist:\s*\{\s*seatVerified:\s*false,\s*dropExecuted:\s*false,\s*addExecuted:\s*false\s*\}/);
});

test('Task 7: Interactive 3-step checklist markup is rendered on handoff card', () => {
  assert.match(html, /id="chkSeatVerified"/);
  assert.match(html, /id="chkDropExecuted"/);
  assert.match(html, /id="chkAddExecuted"/);
});

test('Task 7: Closure state and Start New Rehearsal button are present', () => {
  assert.match(html, /REHEARSAL & AIMS HANDOFF COMPLETE · 12\.0 CREDITS SECURED/);
  assert.match(html, /id="startNewRehearsalBtn"/);
});

test('Task 7: Lifecycle resets handoffChecklist in confirmSwap, revertSchedule, and resetSimulator', () => {
  const confirmBlock = html.slice(html.indexOf('function confirmSwap'), html.indexOf('function revertSchedule'));
  assert.match(confirmBlock, /handoffChecklist\s*=\s*\{\s*seatVerified:\s*false,\s*dropExecuted:\s*false,\s*addExecuted:\s*false\s*\}/);

  const revertBlock = html.slice(html.indexOf('function revertSchedule'), html.indexOf('function resetSimulator'));
  assert.match(revertBlock, /handoffChecklist\s*=\s*\{\s*seatVerified:\s*false,\s*dropExecuted:\s*false,\s*addExecuted:\s*false\s*\}/);

  const resetBlock = html.slice(html.indexOf('function resetSimulator'), html.indexOf('function switchMainView'));
  assert.match(resetBlock, /handoffChecklist\s*=\s*\{\s*seatVerified:\s*false,\s*dropExecuted:\s*false,\s*addExecuted:\s*false\s*\}/);
});
