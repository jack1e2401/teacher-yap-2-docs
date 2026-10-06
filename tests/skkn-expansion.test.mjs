import test from 'node:test';
import assert from 'node:assert/strict';
import { expandSkknDraft, SKKN_SECTIONS } from '../lib/server/skkn-expansion.ts';

const words = count => Array(count).fill('nội-dung').join(' ');
const draft = count => ({ title: 'Đề tài thử nghiệm', ...Object.fromEntries(SKKN_SECTIONS.map(section => [section.key, words(count)])) });

test('mục applicability ngắn được sửa riêng, giữ nguyên các mục đã đạt', async () => {
  const input = draft(500);
  input.applicability = words(15);
  const requests = [];
  const output = await expandSkknDraft(input, 2000, async sections => {
    requests.push(sections.map(section => section.key));
    return { applicability: words(210) };
  });
  assert.deepEqual(requests, [['applicability']]);
  assert.equal(output.result.measures, input.measures);
  assert.equal(output.result.applicability, words(210));
  assert.deepEqual(output.warnings, []);
});

test('phản hồi vẫn ngắn không làm mất bản nháp và không retry vô hạn', async () => {
  let calls = 0;
  const input = draft(30);
  const output = await expandSkknDraft(input, 7200, async sections => {
    calls++;
    return Object.fromEntries(sections.map(section => [section.key, words(10)]));
  });
  assert.deepEqual(output.result, input);
  assert.ok(calls <= 16);
  assert.ok(output.warnings.some(message => message.includes('độ dài')));
});

test('lỗi mạng khi mở rộng giữ bản nháp đủ mục và báo chưa hoàn tất', async () => {
  let calls = 0;
  const output = await expandSkknDraft(draft(30), 2000, async () => {
    calls++;
    throw new Error('Network unavailable');
  });
  assert.equal(calls, 1);
  assert.equal(output.result.applicability, words(30));
  assert.ok(output.warnings.some(message => message.includes('bổ sung')));
});

test('mục rỗng không được coi là bài hoàn chỉnh, lỗi có tên tiếng Việt', async () => {
  const input = draft(500);
  input.applicability = '';
  await assert.rejects(() => expandSkknDraft(input, 2000, async () => ({})), /Khả năng áp dụng/);
});
