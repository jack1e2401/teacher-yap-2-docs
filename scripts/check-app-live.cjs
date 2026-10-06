const base = 'http://localhost:3000/api/generate';
const cases = [
  { kind: 'exam', subject: 'Tiếng Anh', grade: 6, title: 'Kiểm tra My New School', duration: 15, goals: 'Từ vựng trường học', scope: 'My New School', points: 10, questionCount: 5, questionTypes: '3 trắc nghiệm, 1 trả lời ngắn, 1 tự luận', source: 'school, classroom, teacher' },
  { kind: 'slide', subject: 'Tiếng Anh', grade: 6, slideCount: 8, source: 'Kế hoạch bài dạy My New School, 45 phút. Mục tiêu: học từ vựng school, classroom, teacher và giới thiệu trường học. Khởi động quan sát tranh. Hình thành kiến thức: nghe, đọc từ mới. Luyện tập: hỏi đáp theo cặp. Vận dụng: giới thiệu trường. Củng cố: nhắc lại từ vựng.' },
  { kind: 'skkn', subject: 'Tiếng Anh', grade: 6, title: 'Tăng hứng thú học từ vựng lớp 6', problem: 'Học sinh ít sử dụng từ mới khi nói.', measures: 'Dự kiến luyện tập theo cặp và dùng tranh.', evidence: '[CẦN GIÁO VIÊN BỔ SUNG]' },
];
(async () => {
  for (const body of cases) {
    const response = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json();
    console.log(JSON.stringify({ kind: body.kind, status: response.status, error: data.error || null,
      items: data.result?.slides?.length || data.result?.questions?.length || null,
      hasResult: !!data.result }));
    if (!response.ok) process.exitCode = 1;
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
