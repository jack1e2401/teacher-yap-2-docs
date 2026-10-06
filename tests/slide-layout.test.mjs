import test from 'node:test';
import assert from 'node:assert/strict';
import { slideBadge, slidePages, slideStyle } from '../lib/slide-layout.ts';

test('preview và export chia cùng số trang, giữ ảnh ở trang đầu', () => {
  const pages = slidePages([{ title: 'Từ vựng', bullets: ['1', '2', '3', '4', '5'], speakerNotes: 'Ghi chú', imageData: 'data:image/png;base64,AA', imageCredit: 'Nguồn' }]);
  assert.equal(pages.length, 2);
  assert.deepEqual(pages.map(page => page.bullets.length), [4, 1]);
  assert.equal(pages[0].imageData?.startsWith('data:image/png'), true);
  assert.equal(pages[1].imageData, undefined);
  assert.equal(pages[1].title, 'Từ vựng (tiếp)');
});

test('bố cục ổn định cho cùng một bộ slide', () => {
  assert.equal(slideStyle('My New School', 'Từ vựng', 2, false), slideStyle('My New School', 'Từ vựng', 2, false));
  assert.equal(slideStyle('My New School', 'Từ vựng', 2, true), 1);
  assert.equal(slideStyle('My New School', 'Sơ đồ ý', 4, false), 3);
  assert.equal(slideStyle('My New School', 'Bài đọc', 2, true), 0);
  assert.equal(slideBadge('Kiểm tra nhanh'), 'KIỂM TRA');
});
