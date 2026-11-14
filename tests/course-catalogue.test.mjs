import test from 'node:test';
import assert from 'node:assert/strict';
import {
  blogPosts,
  getResolvedMeetings,
  getResolvedPrimarySection,
  masterSchedule,
  simulatedCourseFeedback,
  SIMULATED_GRADE_POINTS,
  validateCourse
} from '../Design System SaaS Landing Page/src/app/data/courseData.ts';

const course = code => {
  const found = masterSchedule.find(item => item.code === code);
  assert.ok(found, `${code} must exist`);
  return found;
};

test('Business catalogue has the requested courses and no fictional BUS900 entries', () => {
  for (const code of ['CB2100', 'CB2201', 'CB3043', 'AC5711', 'FB6881P']) course(code);
  assert.equal(masterSchedule.some(item => /^BUS900/.test(item.code)), false);
});

test('Student-life examples belong to the blog feed, not the course catalogue', () => {
  for (const tag of ['campus', 'social', 'housing', 'food']) {
    assert.ok(blogPosts.some(post => post.id.startsWith('life-example-') && post.tags.includes(tag)));
  }
  const examples = blogPosts.filter(post => post.id.startsWith('life-example-'));
  assert.equal(examples.length, 8);
  assert.ok(examples.every(post => !post.courseCode && post.authorMeta.includes('Fictional')));
  assert.ok(masterSchedule.every(item => typeof item.code === 'string'));
});

test('Example grade data covers common courses while retaining a no-data case', () => {
  for (const code of ['CB2100', 'CB2201', 'CB3043', 'GE2129', 'GE2335', 'EE2000']) {
    const feedback = simulatedCourseFeedback[code];
    assert.ok(feedback, `${code} must have example feedback`);
    assert.deepEqual(Object.keys(feedback.gradeCounts).sort(), Object.keys(SIMULATED_GRADE_POINTS).sort());
    assert.ok(Object.values(feedback.gradeCounts).every(count => Number.isInteger(count) && count >= 0));
    assert.ok(Object.values(feedback.gradeCounts).some(count => count > 0));
    assert.match(feedback.instructor, /Fictional|Example/);
  }
  assert.equal(simulatedCourseFeedback.GE1313, undefined);
});

test('Selected primary and tutorial sections determine meetings and availability', () => {
  const accounting = course('CB2100');
  const selected = { CB2100: { primaryCrn: '10551', tutorialCrn: '10441' } };
  assert.deepEqual(getResolvedMeetings(accounting, selected).map(item => item.crn), ['10551', '10441']);
  assert.ok(validateCourse(accounting, [], null, false, selected).reasons.some(reason => reason.includes('Availability unknown')));

  const operations = course('CB2201');
  const selection = { CB2201: { primaryCrn: '10341' } };
  assert.equal(getResolvedPrimarySection(operations, selection).quotaAvailable, 14);
  assert.equal(getResolvedMeetings(operations, selection)[0].day, 'Thu');
});

test('Full or restricted sections and unknown schedules cannot be confirmed as safe', () => {
  const restricted = course('CB3043');
  const reasons = validateCourse(restricted, [], null, false, { CB3043: { primaryCrn: '12945' } }).reasons;
  assert.ok(reasons.some(reason => reason.includes('full')));
  assert.ok(reasons.some(reason => reason.includes('Programme: EXFB')));
  assert.ok(reasons.some(reason => reason.includes('CB2300')));

  const unscheduled = course('FB6881P');
  assert.equal(getResolvedMeetings(unscheduled).length, 0);
  assert.ok(validateCourse(unscheduled, []).reasons.some(reason => reason.includes('Schedule unknown')));
});

test('Added GE courses have syllabus files and explicitly unknown schedules', () => {
  for (const code of ['GE2129', 'GE2335', 'GE1313', 'GE2105', 'GE1229']) {
    const item = course(code);
    assert.ok(item.syllabusPdf);
    assert.equal(getResolvedMeetings(item).length, 0);
    assert.ok(validateCourse(item, []).reasons.some(reason => reason.includes('Schedule unknown')));
  }
  assert.ok(course('GE1401').syllabusPdf);
  assert.ok(course('GE1105').syllabusPdf);
  assert.ok(validateCourse(course('GE1401'), []).reasons.some(reason => reason.includes('Prerequisite eligibility not verified')));
});
