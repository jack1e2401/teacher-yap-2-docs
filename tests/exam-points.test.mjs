import test from 'node:test';
import assert from 'node:assert/strict';
import * as schema from '../lib/schema.ts';

test('20 câu được phân bổ lại đúng 10 điểm và đáp án dùng điểm mới', () => {
  assert.equal(typeof schema.rebalanceExamPoints, 'function');
  const raw = {
    title: 'Kiểm tra', duration: 45, matrix: 'Ma trận', specification: 'Đặc tả', markingGuide: 'Mỗi câu 1 điểm',
    questions: Array.from({ length: 20 }, (_, i) => ({
      number: i + 1, type: 'trắc nghiệm', level: 'Biết', topic: 'Từ vựng',
      prompt: 'Câu hỏi', options: ['A', 'B'], answer: 'A', points: 1,
    })),
  };
  const fixed = schema.rebalanceExamPoints(raw, 10);
  assert.equal(fixed.questions.length, 20);
  assert.ok(Math.abs(fixed.questions.reduce((sum, q) => sum + q.points, 0) - 10) < 0.0001);
  assert.ok(fixed.questions.every(q => q.points > 0));
  assert.match(fixed.markingGuide, /0\.5 điểm/);
});

test('40 câu dùng điểm gọn và đủ tổng 10 điểm', () => {
  const raw = {
    title: 'Kiểm tra', duration: 45, matrix: '', specification: '', markingGuide: '',
    questions: Array.from({ length: 40 }, (_, i) => ({
      number: i + 1, type: i >= 38 ? 'tự luận' : 'trắc nghiệm', level: 'Biết', topic: 'Trường học',
      prompt: 'Câu hỏi', answer: 'Đáp án', points: i >= 38 ? 4 : 1,
    })),
  };
  const fixed = schema.rebalanceExamPoints(raw, 10);
  assert.ok(Math.abs(fixed.questions.reduce((sum, q) => sum + q.points, 0) - 10) < 0.0001);
  assert.ok(fixed.questions.every(q => Number.isInteger(q.points * 10)));
  assert.ok(fixed.questions[39].points > fixed.questions[0].points);
});
