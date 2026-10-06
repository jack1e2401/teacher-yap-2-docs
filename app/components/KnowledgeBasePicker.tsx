'use client';

import { useEffect, useState } from 'react';
import type { KnowledgeLesson } from '@/lib/server/knowledge-base';

export default function KnowledgeBasePicker({ onSelect, minGrade = 1 }: { onSelect: (lesson: KnowledgeLesson) => void; minGrade?: number }) {
  const [lessons, setLessons] = useState<KnowledgeLesson[]>([]);
  const [status, setStatus] = useState('Đang đọc kho bài học…');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/knowledge-base', { signal: controller.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const available = (data.lessons as KnowledgeLesson[]).filter(lesson => lesson.grade >= minGrade);
      setLessons(available);
      setStatus(available.length ? '' : 'Kho SGK nền chưa có bài đã duyệt phù hợp. Thầy/cô vẫn có thể bổ sung tài liệu riêng bên dưới.');
    }).catch(error => {
      if (!controller.signal.aborted) setStatus(error instanceof Error ? error.message : 'Không đọc được kho bài học.');
    });
    return () => controller.abort();
  }, [minGrade]);

  return <div className="knowledgePicker">
    <label>Bài học từ kho SGK nền
      <select value="" disabled={!lessons.length} onChange={event => {
        const lesson = lessons.find(item => item.id === event.target.value);
        if (lesson) onSelect(lesson);
      }}>
        <option value="">Chọn bài để điền nội dung tham chiếu</option>
        {lessons.map(lesson => <option key={lesson.id} value={lesson.id}>Lớp {lesson.grade} · {lesson.subject} · {lesson.book} · {lesson.title}</option>)}
      </select>
    </label>
    {status && <p className="hint" role="status">{status}</p>}
  </div>;
}
