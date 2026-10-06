'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TextbookSelect from '../components/TextbookSelect';
import KnowledgeBasePicker from '../components/KnowledgeBasePicker';
import LoadingScreen from '../components/LoadingScreen';
import { DEFAULT_TEXTBOOK } from '@/lib/textbook-catalog';
import { deleteTextbookNote, listTextbookNotes, saveTextbookNote, type TextbookNote } from '@/lib/client-storage';
import './textbook.css';

const officialReader = 'https://taphuan.nxbgd.vn';
const defaultForm = {
  grade: 6,
  subject: 'Tiếng Anh',
  book: DEFAULT_TEXTBOOK,
  type: 'lesson' as 'book' | 'lesson',
  title: '',
  sourceText: '',
  summary: '',
  sourceUrl: officialReader,
};
type Form = typeof defaultForm;
type ChatMessage = { role: 'user' | 'assistant'; content: string };
const normalizedText = (value: string) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');

export default function TextbookLibrary() {
  const [form, setForm] = useState<Form>(defaultForm);
  const [notes, setNotes] = useState<TextbookNote[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uploadNotice, setUploadNotice] = useState(false);

  useEffect(() => { listTextbookNotes().then(setNotes).catch(() => setError('Trình duyệt không mở được kho lưu cục bộ.')); }, []);
  const selected = notes.find(note => note.id === selectedId);
  const update = (key: keyof Form, value: string | number) => setForm(current => ({ ...current, [key]: value }));

  async function summarize() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/textbooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'summarize', ...form }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      update('summary', data.summary);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không tóm tắt được.'); }
    finally { setBusy(false); }
  }

  async function save() {
    if (!form.title.trim() || !form.summary.trim()) { setError('Cần tên sách/bài và tóm tắt trước khi lưu.'); return; }
    const duplicate = notes.find(note => note.id !== selectedId && note.grade === form.grade && note.type === form.type &&
      normalizedText(note.subject) === normalizedText(form.subject) && normalizedText(note.book) === normalizedText(form.book) &&
      normalizedText(note.title) === normalizedText(form.title));
    if (duplicate) { select(duplicate); setError('Mục này đã có trong thư viện. Đã mở bản cũ để bro chỉnh sửa.'); return; }
    const note: TextbookNote = {
      ...form, id: selectedId || crypto.randomUUID(), updatedAt: new Date().toISOString(),
      chatHistory: selected?.chatHistory || [],
    };
    try { await saveTextbookNote(note); setNotes(await listTextbookNotes()); setSelectedId(note.id); setError(''); }
    catch { setError('Không lưu được trong trình duyệt.'); }
  }

  function select(note: TextbookNote) {
    setSelectedId(note.id);
    setForm({ grade: note.grade, subject: note.subject, book: note.book, type: note.type, title: note.title,
      sourceText: note.sourceText || '', summary: note.summary, sourceUrl: note.sourceUrl });
    setMessages(note.chatHistory || []);
    setError('');
  }

  async function remove(note: TextbookNote) {
    await deleteTextbookNote(note.id);
    setNotes(await listTextbookNotes());
    if (selectedId === note.id) { setSelectedId(null); setForm(defaultForm); setMessages([]); }
  }

  async function chat() {
    if (busy || !selected || !question.trim()) return;
    setBusy(true); setError('');
    const asked = question.trim();
    try {
      const response = await fetch('/api/textbooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        action: 'chat', grade: selected.grade, subject: selected.subject, book: selected.book, title: selected.title,
        summary: selected.summary, question: asked, history: messages.slice(-10),
      }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const next: ChatMessage[] = [...messages, { role: 'user', content: asked }, { role: 'assistant', content: data.answer }];
      setMessages(next); setQuestion('');
      const updated = { ...selected, chatHistory: next, updatedAt: new Date().toISOString() };
      await saveTextbookNote(updated);
      setNotes(await listTextbookNotes());
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không gửi được câu hỏi.'); }
    finally { setBusy(false); }
  }

  return <main className="shell textbookPage">
    <LoadingScreen active={busy}/>
    <header><div className="eyebrow">THƯ VIỆN CỦA GIÁO VIÊN</div><h1>Tóm tắt sách và bài học</h1><p>Lưu ghi chú theo lớp, môn, sách, bài; hỏi AI dựa trên tóm tắt đã lưu.</p></header>
    <nav><Link className="guideNav" href="/">← Về công cụ tạo nội dung</Link><Link className="guideNav" href="/huong-dan">Hướng dẫn sử dụng</Link></nav>
    <aside className="sourceNotice"><strong>SGK năm học 2026–2027:</strong> Xem sách điện tử trên <a href={officialReader} target="_blank" rel="noopener noreferrer">trang chính thức của NXB Giáo dục Việt Nam ↗</a>. Một số sách đã được chỉnh sửa năm 2026; kiểm tra đúng bản đang sử dụng tại trường. Thư viện này chỉ lưu tóm tắt và tài liệu do bro cung cấp.</aside>
    <div className="textbookGrid">
      <section className="card textbookForm"><h2>{selectedId ? 'Sửa ghi chú' : 'Thêm sách hoặc bài'}</h2>
        <KnowledgeBasePicker onSelect={lesson => {
          setSelectedId(null);
          setMessages([]);
          setError('');
          setForm({ grade: lesson.grade, subject: lesson.subject, book: lesson.book, type: 'lesson', title: lesson.title,
            sourceText: lesson.text, summary: lesson.summary, sourceUrl: lesson.source.url || '' });
        }}/>
        <div className="row"><label>Lớp<select value={form.grade} onChange={e => update('grade', Number(e.target.value))}>{Array.from({length:12},(_,i)=><option key={i}>{i+1}</option>)}</select></label><label>Loại mục<select value={form.type} onChange={e => update('type', e.target.value)}><option value="book">Tổng quan sách</option><option value="lesson">Từng bài học</option></select></label></div>
        <div className="row"><label>Môn học<input value={form.subject} onChange={e => update('subject', e.target.value)}/></label><TextbookSelect value={form.book} onChange={value => update('book', value)}/></div>
        <label>Tên sách / tên bài<input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Unit 1: My New School"/></label>
        <label>Link nguồn<input value={form.sourceUrl} onChange={e => update('sourceUrl', e.target.value)} placeholder="https://..."/></label>
        <label>Nội dung giáo viên cung cấp<textarea rows={6} maxLength={16000} value={form.sourceText} onChange={e => update('sourceText', e.target.value)} placeholder="Dán mục tiêu, ý chính hoặc trích đoạn cần tóm tắt..."/></label>
        <div className="actions"><button type="button" onClick={() => setUploadNotice(true)}>Tải sách / tài liệu lên</button></div>
        {uploadNotice && <p role="status" className="hint">Tính năng đang phát triển.</p>}
        <div className="actions"><button disabled={busy || !form.sourceText.trim()} onClick={summarize}>Tóm tắt bằng AI</button></div>
        <label>Tóm tắt nội dung chính<textarea rows={8} value={form.summary} onChange={e => update('summary', e.target.value)} placeholder="Có thể tự viết hoặc dùng nút tóm tắt ở trên"/></label>
        <div className="actions"><button className="primary" onClick={save}>Lưu vào thư viện</button><button onClick={() => { setSelectedId(null); setForm(defaultForm); setMessages([]); }}>Tạo mục mới</button></div>
        {error && <p role="alert" className="error">{error}</p>}
      </section>
      <div className="textbookSide"><section className="card"><h2>Đã lưu trên trình duyệt này</h2>{notes.length ? <div className="noteList">{notes.map(note => <div key={note.id} className={note.id === selectedId ? 'noteItem selected' : 'noteItem'}><button onClick={() => select(note)}><b>Lớp {note.grade} · {note.subject}</b><span>{note.book} / {note.type === 'book' ? 'Sách' : 'Bài'}: {note.title}</span></button><button className="deleteNote" onClick={() => remove(note)}>Xóa</button></div>)}</div> : <p>Chưa có mục nào. Thêm tóm tắt đầu tiên ở cột bên trái.</p>}</section>
        <section className="card textbookChat"><h2>Hỏi về mục đang chọn</h2>{selected ? <><p className="chatContext">Ngữ cảnh: {selected.title}. AI chỉ dùng tóm tắt đã lưu để trả lời.</p><div className="chatMessages">{messages.length ? messages.map((message, index) => <p key={index} className={message.role}>{message.content}</p>) : <p>Ví dụ: “Bài này có những ý chính nào?”</p>}</div><div className="chatComposer"><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && chat()} placeholder="Hỏi về bài học..."/><button disabled={busy || !question.trim()} onClick={chat}>Gửi</button></div></> : <p>Chọn một sách hoặc bài đã lưu để bắt đầu chat.</p>}</section>
      </div>
    </div>
    <p className="hint">Dữ liệu nằm trong IndexedDB của trình duyệt tại localhost này. Xóa dữ liệu trình duyệt hoặc đổi trình duyệt sẽ mất bản lưu; bản Vercel có kho riêng theo tên miền.</p>
  </main>;
}
