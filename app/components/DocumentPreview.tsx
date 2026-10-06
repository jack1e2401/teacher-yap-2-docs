'use client';

type Lesson = { title: string; goals: string; materials: string; activities: { name: string; minutes: number; goal: string; content: string; product: string; method: string }[] };
type Question = { number: number; type: string; level: string; topic: string; prompt: string; options?: string[]; answer: string; points: number };
type Exam = { title: string; duration: number; questions: Question[]; matrix: string; specification: string };
type Skkn = { title: string; introduction: string; basis: string; situation: string; measures: string; evaluation: string; applicability: string; conclusion: string; recommendations: string };
type Props = { kind: 'lesson' | 'exam' | 'skkn'; raw: string; subject: string; grade: number };

function Text({ value }: { value: string }) {
  return <>{String(value || '').split(/\n+/).filter(Boolean).map((part, i) => <p key={i}>{part}</p>)}</>;
}

function Metadata({ value }: { value: string }) {
  try {
    const rows = JSON.parse(value);
    if (Array.isArray(rows) && rows.every(row => row && typeof row === 'object')) {
      return <div className="previewMetaRows">{rows.map((row, i) => <div key={i}>{Object.entries(row).map(([key, val]) => <span key={key}><b>{key}:</b> {String(val)}</span>)}</div>)}</div>;
    }
  } catch { /* Plain text metadata. */ }
  return <Text value={value}/>;
}

export default function DocumentPreview({ kind, raw, subject, grade }: Props) {
  let data: Lesson | Exam | Skkn;
  try { data = JSON.parse(raw); } catch { return <div className="previewError">Không đọc được kết quả. Hãy tạo lại nội dung.</div>; }
  if (kind === 'lesson') {
    const lesson = data as Lesson;
    return <article className="documentPreview"><div className="previewPaperHead"><span>KẾ HOẠCH BÀI DẠY</span><small>{subject || 'Môn học'} · Lớp {grade}</small><h3>{lesson.title}</h3></div>
      <section><h4>I. Mục tiêu</h4><Text value={lesson.goals}/></section>
      <section><h4>II. Thiết bị dạy học và học liệu</h4><Text value={lesson.materials}/></section>
      <section><h4>III. Tiến trình dạy học</h4>{lesson.activities?.map((activity, i) => <div className="previewActivity" key={i}><div className="previewActivityHead"><b>{String(i + 1).padStart(2, '0')}</b><h5>{activity.name}</h5><span>{activity.minutes} phút</span></div><dl><dt>Mục tiêu</dt><dd><Text value={activity.goal}/></dd><dt>Nội dung</dt><dd><Text value={activity.content}/></dd><dt>Sản phẩm</dt><dd><Text value={activity.product}/></dd><dt>Tổ chức thực hiện</dt><dd><Text value={activity.method}/></dd></dl></div>)}</section>
    </article>;
  }
  if (kind === 'exam') {
    const exam = data as Exam;
    return <article className="documentPreview"><div className="previewPaperHead"><span>ĐỀ KIỂM TRA</span><small>{subject || 'Môn học'} · Lớp {grade} · {exam.duration} phút</small><h3>{exam.title}</h3></div>
      <section><h4>Câu hỏi</h4><div className="previewQuestions">{exam.questions?.map(q => <div className="previewQuestion" key={q.number}><div className="previewQuestionHead"><strong>Câu {q.number}. {q.prompt}</strong><span>{q.points} điểm</span></div>{q.options?.length ? <ol type="A">{q.options.map((option, i) => <li key={i}>{/^[A-D][.)]\s/i.test(option) ? option.replace(/^[A-D][.)]\s/i, '') : option}</li>)}</ol> : <div className="previewAnswerLine"/>}</div>)}</div></section>
      <details className="previewDetails"><summary>Đáp án và điểm từng câu</summary><div className="previewAnswers">{exam.questions?.map(q => <div key={q.number}><b>Câu {q.number}</b><span>{q.answer}</span><em>{q.points} điểm</em></div>)}</div></details>
      <details className="previewDetails"><summary>Ma trận và bản đặc tả</summary><h4>Ma trận</h4><Metadata value={exam.matrix}/><h4>Bản đặc tả</h4><Metadata value={exam.specification}/></details>
    </article>;
  }
  const skkn = data as Skkn;
  const fields: [string, string][] = [['I. Đặt vấn đề', skkn.introduction], ['II. Cơ sở', skkn.basis], ['III. Thực trạng', skkn.situation], ['IV. Biện pháp', skkn.measures], ['V. Đánh giá', skkn.evaluation], ['VI. Khả năng áp dụng', skkn.applicability], ['VII. Kết luận', skkn.conclusion], ['VIII. Kiến nghị', skkn.recommendations]];
  return <article className="documentPreview"><div className="previewPaperHead"><span>BẢN DỰ THẢO SÁNG KIẾN KINH NGHIỆM</span><small>{subject || 'Môn học'} · Lớp {grade}</small><h3>{skkn.title}</h3></div>{fields.map(([heading, value]) => <section key={heading}><h4>{heading}</h4><Text value={value}/></section>)}</article>;
}
