# Trợ lý giáo viên AI

Ứng dụng hỗ trợ giáo viên THCS–THPT tạo bản nháp kế hoạch bài dạy, đề kiểm tra, slide và sáng kiến kinh nghiệm bằng DeepSeek. Kết quả được xem trước trên web và tải về dưới dạng Word hoặc PowerPoint để giáo viên rà soát, chỉnh sửa.

## Chức năng

- **Soạn bài:** tạo kế hoạch bài dạy với mục tiêu, học liệu và các hoạt động dạy học.
- **Bài kiểm tra:** chọn số câu theo từng dạng, xem đề và đáp án, tải file Word cho học sinh và giáo viên.
- **Tạo slide:** chuyển kế hoạch bài dạy thành slide có nhiều bố cục, ghi chú và ảnh minh họa khi tìm được ảnh phù hợp.
- **Sáng kiến kinh nghiệm:** tạo bản dự thảo có các mục nội dung để giáo viên bổ sung số liệu, minh chứng.
- **Thư viện sách:** lưu tóm tắt theo lớp 1–12, môn, sách và bài; nhập hoặc tải tài liệu riêng để AI tóm tắt, rồi hỏi đáp theo nội dung đã lưu.
- **Lịch sử trên máy:** tự lưu bài AI đã tạo trong IndexedDB của trình duyệt để mở lại khi chạy localhost lần sau.

Với kế hoạch bài dạy và SKKN, người dùng chọn mục tiêu 5–24 trang. Đây là mục tiêu độ dài nội dung; số trang thực tế có thể thay đổi khi mở bằng Word.

Với môn Tiếng Anh, câu hỏi và ví dụ dành cho học sinh có thể dùng tiếng Anh; giáo án và sáng kiến kinh nghiệm lấy tiếng Việt làm ngôn ngữ chính. Nội dung AI chỉ là bản nháp, cần được giáo viên kiểm tra trước khi sử dụng.

## Công nghệ

Next.js, React, TypeScript và các API route chạy phía máy chủ; DeepSeek tạo nội dung, `docx` xuất Word và `pptxgenjs` xuất PowerPoint.

Luồng nghiệp vụ và cấu trúc mã: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Kho nội dung SGK theo từng bài và cách nhập TXT/DOCX: [knowledge-base/README.md](knowledge-base/README.md). Kho hiện chưa nạp sẵn nội dung sách; chỉ bài đã duyệt mới xuất hiện trong form.

## Chạy trên máy

```powershell
pnpm install
Copy-Item .env.example .env.local
# Điền DEEPSEEK_API_KEY trong .env.local
pnpm dev
```

Mở `http://localhost:3000`. Hướng dẫn thao tác trong ứng dụng nằm tại `/huong-dan`.

## Kiểm tra

```powershell
pnpm build
pnpm test
```

Một số bài kiểm tra gọi `http://localhost:3000`, vì vậy cần mở ứng dụng ở một terminal khác khi chạy `pnpm test`.

Hướng dẫn đưa mã nguồn lên GitHub và triển khai Vercel: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
