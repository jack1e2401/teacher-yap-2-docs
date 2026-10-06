'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GeneratorForm from './components/GeneratorForm';
import ResultPanel from './components/ResultPanel';
import HistoryPanel from './components/HistoryPanel';
import LoadingScreen from './components/LoadingScreen';
import DevModal from './components/DevModal';
import { deleteArticle, listArticles, saveArticle, type SavedArticle } from '@/lib/client-storage';
import { initialForm, type GeneratorFormData, type Kind, type QuestionType, type Tab } from '@/lib/form-model';
import mockInputs from '@/lib/mock-inputs.json';
import demoData from '@/lib/demo-data.json';
import './preview.css';

type Forms = Record<Tab, GeneratorFormData>;
type Results = Partial<Record<Kind, string>>;

function freshForms(): Forms {
  return { lesson: structuredClone(initialForm), slide: structuredClone(initialForm), skkn: structuredClone(initialForm) };
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('lesson');
  const [kind, setKind] = useState<'lesson' | 'exam'>('lesson');
  const [forms, setForms] = useState<Forms>(freshForms);
  const [results, setResults] = useState<Results>({});
  const [warnings, setWarnings] = useState<Partial<Record<Kind, string[]>>>({});
  const [sampleKinds, setSampleKinds] = useState<Partial<Record<Kind, boolean>>>({});
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [busy, setBusy] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);
  const [error, setError] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);
  const [present, setPresent] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  const activeKind: Kind = tab === 'lesson' ? kind : tab;
  const form = forms[tab];

  useEffect(() => {
    listArticles().then(saved => {
      setArticles(saved);
      if (saved[0]) restore(saved[0]);
    }).catch(() => setError('Không mở được kho lưu cục bộ của trình duyệt.'));
  }, []);

  function update(key: keyof GeneratorFormData, value: string | number) {
    setForms(current => ({ ...current, [tab]: { ...current[tab], [key]: value } }));
  }

  function updateCount(type: QuestionType, value: number) {
    setForms(current => {
      const counts = { ...current.lesson.questionTypeCounts, [type]: Math.max(0, Math.min(40, value || 0)) };
      return { ...current, lesson: { ...current.lesson, questionTypeCounts: counts,
        questionCount: Object.values(counts).reduce((sum, count) => sum + count, 0) } };
    });
  }

  function restore(article: SavedArticle) {
    const targetTab: Tab = article.kind === 'exam' ? 'lesson' : article.kind;
    setTab(targetTab);
    if (article.kind === 'exam' || article.kind === 'lesson') setKind(article.kind);
    setForms(current => ({ ...current, [targetTab]: { ...structuredClone(initialForm), ...article.input } as GeneratorFormData }));
    setResults(current => ({ ...current, [article.kind]: article.result }));
    setWarnings(current => ({ ...current, [article.kind]: article.warnings || [] }));
    setSampleKinds(current => ({ ...current, [article.kind]: false }));
    setSlideIndex(0);
    setError('');
  }

  async function generate() {
    if (busy || fileBusy) return;
    if (activeKind === 'exam' && (form.questionCount < 1 || form.questionCount > 40)) {
      setError('Tổng số câu phải từ 1 đến 40.'); return;
    }
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, kind: activeKind }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI chưa tạo được nội dung.');
      const raw = JSON.stringify(data.result);
      setResults(current => ({ ...current, [activeKind]: raw }));
      setWarnings(current => ({ ...current, [activeKind]: data.warnings || [] }));
      setSampleKinds(current => ({ ...current, [activeKind]: false }));
      setSlideIndex(0);
      const article: SavedArticle = { id: crypto.randomUUID(), kind: activeKind,
        title: data.result.title || form.title, createdAt: new Date().toISOString(), input: { ...form }, result: raw, warnings: data.warnings || [] };
      try { await saveArticle(article); setArticles(await listArticles()); }
      catch { setError('Nội dung đã tạo nhưng trình duyệt không lưu được. Hãy tải file trước khi đóng trang.'); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Có lỗi xảy ra.'); }
    finally { setBusy(false); }
  }

  function showSample() {
    const sample = structuredClone(demoData[activeKind]);
    if (activeKind === 'exam') {
      setForms(current => ({ ...current, lesson: { ...current.lesson, duration: 15, points: 10, questionCount: 5,
        questionTypeCounts: { 'trắc nghiệm': 3, 'đúng sai': 0, 'trả lời ngắn': 1, 'tự luận': 1 } } }));
    }
    setResults(current => ({ ...current, [activeKind]: JSON.stringify(sample) }));
    setWarnings(current => ({ ...current, [activeKind]: [] }));
    setSampleKinds(current => ({ ...current, [activeKind]: true }));
    setSlideIndex(0); setError('');
  }

  function fillMock() {
    setForms(current => ({ ...current, [tab]: { ...structuredClone(initialForm), ...mockInputs[activeKind] } as GeneratorFormData }));
    setError('');
  }

  async function exportFile(variant: 'student' | 'teacher' = 'teacher') {
    if (busy || fileBusy) return;
    setFileBusy(true);
    setError('');
    try {
      const result = JSON.parse(results[activeKind] || '');
      const response = await fetch('/api/export', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { ...form, kind: activeKind }, result, variant }) });
      if (!response.ok) throw new Error((await response.json()).error || 'Không xuất được file.');
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = activeKind === 'slide' ? 'slides.pptx' : `${activeKind}-${variant}.docx`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không xuất được file.'); }
    finally { setFileBusy(false); }
  }

  async function upload(file: File) {
    setError('');
    if (file.size > 2_000_000) { setError('Tệp tối đa 2 MB.'); return; }
    if (file.name.endsWith('.txt')) {
      const text = await file.text();
      if (text.length > 16000) { setError('Tối đa 16.000 ký tự.'); return; }
      update('source', text); return;
    }
    if (!file.name.endsWith('.docx')) { setError('Chỉ nhận .txt hoặc .docx.'); return; }
    const body = new FormData(); body.append('file', file);
    const response = await fetch('/api/read-docx', { method: 'POST', body });
    const data = await response.json();
    if (!response.ok) setError(data.error || 'Không đọc được tệp.');
    else update('source', data.text);
  }

  async function removeArticle(article: SavedArticle) {
    if (!window.confirm(`Xóa bản lưu “${article.title}”?`)) return;
    await deleteArticle(article.id);
    setArticles(await listArticles());
  }

  return <main className="shell">
    <LoadingScreen active={busy || fileBusy} label={fileBusy ? 'Đang chuẩn bị file tải về…' : 'AI đang tạo nội dung…'}/>
    <DevModal
      open={showLibraryModal}
      onClose={() => setShowLibraryModal(false)}
      title="Tính năng đang phát triển"
      message="Thư viện sách đang được hoàn thiện. Vui lòng quay lại sau."
      actionLabel="Đã hiểu"
    />
    <header><div className="eyebrow">CÔNG CỤ DÀNH CHO GIÁO VIÊN</div><h1>Trợ lý giáo viên AI</h1><p>Soạn bài, chuyển kế hoạch thành slide và phác thảo sáng kiến kinh nghiệm.</p></header>
    <nav>{([['lesson', 'Soạn bài'], ['slide', 'Tạo slide'], ['skkn', 'Viết SKKN']] as [Tab, string][]).map(([id, label]) =>
      <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); setError(''); }}>{label}</button>)}
      <button type="button" className="guideNav" onClick={() => setShowLibraryModal(true)}>Thư viện sách ↗</button>
      <Link className="guideNav" href="/huong-dan">Hướng dẫn sử dụng ↗</Link>
    </nav>
    <div className="grid">
      <GeneratorForm tab={tab} kind={kind} form={form} busy={busy || fileBusy} error={error} onKindChange={setKind}
        update={update} updateCount={updateCount} upload={upload} generate={generate} fillMock={fillMock} showSample={showSample}/>
      <ResultPanel kind={activeKind} raw={results[activeKind]} sample={Boolean(sampleKinds[activeKind])} busy={busy}
        warnings={warnings[activeKind]}
        subject={form.subject} grade={form.grade} slideIndex={slideIndex} setSlideIndex={setSlideIndex}
        present={present} setPresent={setPresent} exportFile={exportFile}/>
    </div>
    <HistoryPanel articles={articles} restore={restore} remove={removeArticle}/>
    <footer>Tham khảo Công văn 5512 cho kế hoạch bài dạy; Công văn 7991 cho kiểm tra định kỳ. Cần đối chiếu yêu cầu địa phương và tổ chuyên môn.</footer>
  </main>;
}
