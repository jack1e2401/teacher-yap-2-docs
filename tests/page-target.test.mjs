import test from 'node:test';
import assert from 'node:assert/strict';
import { targetWords, wordsPerLessonActivity, wordsPerSkknSection } from '../lib/page-target.ts';

test('mục tiêu nội dung tăng theo số trang và dừng ở lựa chọn dưới 25', () => {
  assert.equal(targetWords(5), 2000);
  assert.equal(targetWords(24), 7200);
  assert.ok(wordsPerLessonActivity(24, 4) > wordsPerLessonActivity(5, 4));
  assert.equal(wordsPerSkknSection(24), 900);
});
