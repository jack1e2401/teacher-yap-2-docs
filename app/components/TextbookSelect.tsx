'use client';

import { DEFAULT_TEXTBOOK, OTHER_TEXTBOOK, REFERENCE_TEXTBOOKS } from '@/lib/textbook-catalog';

export default function TextbookSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const isListed = value === DEFAULT_TEXTBOOK || REFERENCE_TEXTBOOKS.includes(value);
  const selection = !value ? '' : isListed ? value : OTHER_TEXTBOOK;
  return <div>
    <label>Bộ sách
      <select value={selection} onChange={event => onChange(event.target.value)}>
        <option value="" disabled>Chọn bộ sách</option>
        <optgroup label="SGK nền · Năm học 2026–2027">
          <option value={DEFAULT_TEXTBOOK}>{DEFAULT_TEXTBOOK}</option>
        </optgroup>
        <optgroup label="Bộ sách tham khảo">
          {REFERENCE_TEXTBOOKS.map(book => <option key={book} value={book}>{book}</option>)}
        </optgroup>
        <option value={OTHER_TEXTBOOK}>Tài liệu khác / bộ sách khác</option>
      </select>
    </label>
    {selection === OTHER_TEXTBOOK && <label>Tên bộ sách hoặc tài liệu
      <input value={value === OTHER_TEXTBOOK ? '' : value} onChange={event => onChange(event.target.value || OTHER_TEXTBOOK)} placeholder="Nhập tên tài liệu riêng"/>
    </label>}
  </div>;
}
