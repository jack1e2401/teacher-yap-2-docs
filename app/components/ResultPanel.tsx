'use client';

import DocumentPreview from './DocumentPreview';
import SlidePreview from './SlidePreview';
import type { Kind } from '@/lib/form-model';

type Props = {
  kind: Kind;
  raw?: string;
  warnings?: string[];
  sample: boolean;
  busy: boolean;
  subject: string;
  grade: number;
  slideIndex: number;
  setSlideIndex: (value: number) => void;
  present: boolean;
  setPresent: (value: boolean) => void;
  exportFile: (variant?: 'student' | 'teacher') => void;
};

export default function ResultPanel(props: Props) {
  const { kind, raw, sample, busy, subject, grade, slideIndex, setSlideIndex, present, setPresent, exportFile } = props;
  return <section className="card result">
    <div className="resultHead"><div><h2>Kết quả</h2>{sample && raw && <span className="badge">Dữ liệu mẫu</span>}</div>
      {raw && <div className="actions">{kind === 'exam' ? <><button onClick={() => exportFile('student')}>Đề học sinh .docx</button><button onClick={() => exportFile('teacher')}>Đáp án .docx</button></> : <button onClick={() => exportFile()}>{kind === 'slide' ? 'Tải .pptx' : 'Tải .docx'}</button>}</div>}
    </div>
    {props.warnings?.map((warning, index) => <p key={index} role="status" className="resultWarning">{warning}</p>)}
    {!raw ? <div className="empty">Nhập thông tin rồi chọn “Tạo với AI”, hoặc mở bài mẫu để xem nhanh.</div> : kind === 'slide'
      ? <SlidePreview raw={raw} index={slideIndex} setIndex={setSlideIndex} present={present} setPresent={setPresent}/>
      : <DocumentPreview kind={kind} raw={raw} subject={subject} grade={grade}/>}
  </section>;
}
