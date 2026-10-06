'use client';

import SlideInputFields from './SlideInputFields';
import TextbookSelect from './TextbookSelect';
import KnowledgeBasePicker from './KnowledgeBasePicker';
import { questionTypes, type GeneratorFormData, type Kind, type QuestionType, type Tab } from '@/lib/form-model';

type Props = {
  tab: Tab;
  kind: 'lesson' | 'exam';
  form: GeneratorFormData;
  busy: boolean;
  error: string;
  onKindChange: (kind: 'lesson' | 'exam') => void;
  update: (key: keyof GeneratorFormData, value: string | number) => void;
  updateCount: (type: QuestionType, value: number) => void;
  upload: (file: File) => void;
  generate: () => void;
  fillMock: () => void;
  showSample: () => void;
};

export default function GeneratorForm(props: Props) {
  const { tab, kind, form, busy, error, onKindChange, update, updateCount, upload, generate, fillMock, showSample } = props;
  const activeKind: Kind = tab === 'lesson' ? kind : tab;
  return <section className="card">
    <h2>Thông tin đầu vào</h2>
    {tab !== 'skkn' && <KnowledgeBasePicker minGrade={6} onSelect={lesson => {
      update('book', lesson.book);
      update('subject', lesson.subject);
      update('grade', lesson.grade);
      update('title', lesson.title);
      update('source', lesson.text);
      update('goals', lesson.summary);
    }}/>}
    {tab === 'lesson' && <div className="seg"><button className={kind === 'lesson' ? 'selected' : ''} onClick={() => onKindChange('lesson')}>Kế hoạch bài dạy</button><button className={kind === 'exam' ? 'selected' : ''} onClick={() => onKindChange('exam')}>Bài kiểm tra</button></div>}

    {tab !== 'slide' && <>
      <div className="row"><label>Môn học<input value={form.subject} onChange={e => update('subject', e.target.value)} placeholder="Tiếng Anh"/></label><label>Lớp<select value={form.grade} onChange={e => update('grade', Number(e.target.value))}>{Array.from({ length: 7 }, (_, i) => <option key={i}>{i + 6}</option>)}</select></label></div>
      {tab === 'lesson' && <TextbookSelect value={form.book} onChange={value => update('book', value)}/>}
      <label>{tab === 'skkn' ? 'Tên đề tài' : 'Tên bài / chủ đề'}<input value={form.title} onChange={e => update('title', e.target.value)} placeholder={tab === 'skkn' ? 'Tên sáng kiến' : 'My New School'}/></label>
    </>}

    {tab === 'lesson' && <>
      <div className="row"><label>Thời lượng (phút)<input type="number" min="1" max="300" value={form.duration} onChange={e => update('duration', Number(e.target.value))}/></label>{kind === 'exam' && <label>Tổng điểm<input type="number" min="1" max="100" value={form.points} onChange={e => update('points', Number(e.target.value))}/></label>}</div>
      {kind === 'lesson' && <PageCount value={form.pageCount} update={update}/>}
      <label>Yêu cầu cần đạt<textarea value={form.goals} onChange={e => update('goals', e.target.value)}/></label>
      {kind === 'exam' && <>
        <label>Phạm vi kiểm tra<input value={form.scope} onChange={e => update('scope', e.target.value)} placeholder="Unit, chủ đề, kiến thức được phép hỏi"/></label>
        <div className="questionCounts"><strong>Số câu theo dạng</strong><div className="questionCountGrid">{questionTypes.map(type => <label key={type}>{type}<input type="number" min="0" max="40" value={form.questionTypeCounts[type]} onChange={e => updateCount(type, Number(e.target.value))}/></label>)}</div><p>Tổng số câu: <strong>{form.questionCount}</strong> / 40</p></div>
      </>}
    </>}

    {tab === 'slide' && <SlideInputFields form={form} update={update} upload={upload}/>}

    {tab === 'skkn' && <>
      <PageCount value={form.pageCount} update={update}/>
      <label>Vấn đề, thực trạng<textarea value={form.problem} onChange={e => update('problem', e.target.value)}/></label>
      <label>Biện pháp đã / dự kiến áp dụng<textarea value={form.measures} onChange={e => update('measures', e.target.value)}/></label>
      <label>Minh chứng, dữ liệu trước / sau<textarea value={form.evidence} onChange={e => update('evidence', e.target.value)}/></label>
    </>}

    {tab === 'lesson' && <label>Tài liệu giáo viên cung cấp<textarea rows={4} value={form.source} onChange={e => update('source', e.target.value)}/></label>}
    <div className="actions"><button className="primary" disabled={busy} onClick={generate}>{busy ? 'Đang tạo...' : 'Tạo với AI'}</button><button onClick={fillMock}>Điền dữ liệu mẫu</button><button onClick={showSample}>Xem bài mẫu</button></div>
    {error && <p role="alert" className="error">{error} <button onClick={generate}>Thử lại</button></p>}
    <p className="hint">Nội dung AI chỉ là bản nháp; giáo viên kiểm tra trước khi sử dụng.</p>
    <p className="hint">Chế độ hiện tại: {activeKind === 'exam' ? 'Bài kiểm tra' : activeKind === 'lesson' ? 'Kế hoạch bài dạy' : activeKind === 'slide' ? 'Slide' : 'SKKN'}.</p>
  </section>;
}

function PageCount({ value, update }: { value: number; update: Props['update'] }) {
  return <label>Số trang mong muốn (5–24)<input type="number" min="5" max="24" value={value} onChange={e => update('pageCount', Number(e.target.value))}/><span className="fieldHelp">Đây là mục tiêu độ dài nội dung; số trang thực tế phụ thuộc Word và cách dàn trang.</span></label>;
}
