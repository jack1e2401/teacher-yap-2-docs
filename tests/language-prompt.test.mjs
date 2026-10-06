import test from 'node:test';
import assert from 'node:assert/strict';
import { englishSubject, languageInstruction } from '../lib/language-prompt.ts';

test('áp dụng quy tắc song ngữ cho môn Tiếng Anh', () => {
  assert.equal(englishSubject({ subject: 'Tiếng Anh', source: '' }), true);
  assert.match(languageInstruction({ subject: 'English', source: '' }, 'slide'), /song ngữ Việt–Anh/);
  assert.equal(englishSubject({ subject: '', source: 'KẾ HOẠCH BÀI DẠY\nMôn học: Tiếng Anh\nLớp: 6' }), true);
});

test('không áp dụng cho môn khác hoặc đoạn tiếng Anh thông thường', () => {
  assert.equal(languageInstruction({ subject: 'Ngữ văn', source: 'Đọc một đoạn English' }, 'exam'), '');
});

test('giáo án và SKKN bắt buộc lấy tiếng Việt làm ngôn ngữ chính', () => {
  for (const kind of ['lesson', 'skkn']) {
    assert.match(languageInstruction({ subject: 'Tiếng Anh', source: '' }, kind), /BẮT BUỘC: Tiếng Việt là ngôn ngữ chính/);
    assert.match(languageInstruction({ subject: 'Toán', source: '' }, kind), /BẮT BUỘC: Tiếng Việt là ngôn ngữ chính/);
    assert.match(languageInstruction({ subject: 'Tiếng Anh', source: '' }, kind), /chỉ dùng tiếng Anh ở từ vựng/);
  }
});
