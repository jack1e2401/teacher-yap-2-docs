import test from 'node:test';
import assert from 'node:assert/strict';
import { requestSchema, validateResult } from '../lib/schema.ts';

test('đề kiểm tra phải đúng số câu từng dạng', () => {
  const input = requestSchema.parse({ kind: 'exam', questionCount: 3, points: 3,
    questionTypeCounts: { 'trắc nghiệm': 2, 'đúng sai': 0, 'trả lời ngắn': 0, 'tự luận': 1 } });
  const questions = Array.from({ length: 3 }, (_, i) => ({ number: i + 1, type: i === 2 ? 'tự luận' : 'trắc nghiệm',
    level: 'Biết', topic: 'Trường học', prompt: 'Câu hỏi', answer: 'Đáp án', points: 1 }));
  const result = { title: 'Đề', duration: 15, questions, matrix: '', specification: '', markingGuide: '' };
  assert.equal(validateResult('exam', result, input).questions.length, 3);
  assert.throws(() => validateResult('exam', { ...result, questions: questions.map(q => ({ ...q, type: 'tự luận' })) }, input), /trắc nghiệm/);
  assert.throws(() => validateResult('exam', result, { ...input, questionCount: 4 }), /Tổng số câu theo dạng/);
});
