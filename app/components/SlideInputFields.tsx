'use client';

import TextbookSelect from './TextbookSelect';

type SlideForm = {
  subject: string; grade: number; book: string; title: string; duration: number; goals: string;
  materials: string; warmup: string; vocabulary: string; reading: string; practice: string;
  application: string; homework: string; source: string; slideCount: number;
};

type Props = {
  form: SlideForm;
  update: (key: keyof SlideForm, value: string | number) => void;
  upload: (file: File) => void;
};

export default function SlideInputFields({ form, update, upload }: Props) {
  const area = (key: keyof SlideForm, label: string, placeholder: string, rows = 3) =>
    <label>{label}<textarea rows={rows} value={String(form[key])} onChange={e => update(key, e.target.value)} placeholder={placeholder}/></label>;
  return <div className="slideFields">
    <div className="row"><label>Môn học<input value={form.subject} onChange={e => update('subject', e.target.value)} placeholder="Tiếng Anh"/></label><label>Lớp<select value={form.grade} onChange={e => update('grade', Number(e.target.value))}>{Array.from({length:7},(_,i)=><option key={i}>{i+6}</option>)}</select></label></div>
    <TextbookSelect value={form.book} onChange={value => update('book', value)}/>
    <label>Tên bài / chủ đề<input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Unit 5: Food and Drink – Skills 1"/></label>
    <div className="row"><label>Thời lượng (phút)<input type="number" min="1" max="300" value={form.duration} onChange={e => update('duration', Number(e.target.value))}/></label><label>Số slide<input type="number" min="8" max="20" value={form.slideCount} onChange={e => update('slideCount', Number(e.target.value))}/></label></div>
    {area('goals','Mục tiêu / yêu cầu cần đạt','Học sinh đọc lấy thông tin, nói về món ăn địa phương...')}
    {area('materials','Học liệu và cách đánh giá','SGK trang 54; tranh minh họa; quan sát, hỏi đáp, sản phẩm nhóm...')}
    {area('warmup','Khởi động','Câu hỏi gợi mở, trò chơi hoặc tình huống mở bài')}
    {area('vocabulary','Từ vựng / cấu trúc trọng tâm','Từ tiếng Anh – nghĩa tiếng Việt; mẫu câu và ví dụ')}
    {area('reading','Bài đọc / nội dung khám phá','Đoạn đọc, câu hỏi, dữ kiện hoặc kiến thức cần trình bày')}
    {area('practice','Luyện tập: đọc, nghe, nói hoặc viết','Nhiệm vụ cụ thể, câu hỏi và đáp án dự kiến')}
    {area('application','Vận dụng / sơ đồ ý','Chủ đề thảo luận, câu hỏi gợi ý, sản phẩm học sinh')}
    {area('homework','Củng cố và bài tập về nhà','Những điều cần nhớ, nhiệm vụ sau giờ học')}
    <details className="slideSource"><summary>Tài liệu tham khảo thêm (không bắt buộc)</summary>{area('source','Dán kế hoạch hoặc ghi chú thêm','Có thể dán nội dung thô ở đây nếu đã có sẵn',5)}<label className="file">Tải tệp .txt / .docx<input type="file" accept=".txt,.docx" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/></label></details>
  </div>;
}
