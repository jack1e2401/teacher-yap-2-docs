# Luồng nghiệp vụ và cấu trúc dự án

## Tạo tài liệu

`app/page.tsx` quản lý chế độ đang chọn, dữ liệu biểu mẫu và kết quả. Các thành phần trong `app/components/` phụ trách biểu mẫu, xem trước, lịch sử và tải file. `lib/schema.ts` là hợp đồng kiểm tra dữ liệu chung. `POST /api/generate` gọi DeepSeek, kiểm tra cấu trúc trả về và bổ sung nội dung khi tạo giáo án hoặc SKKN dài. `POST /api/export` chuyển kết quả đã kiểm tra thành DOCX/PPTX. Giáo viên cần rà soát kiến thức, số liệu, bản quyền ảnh và bố cục trước khi dùng.

Ô **số trang mục tiêu** nhận 5–24 cho giáo án/SKKN. `lib/page-target.ts` đổi số trang thành lượng chữ mong muốn; Word tự dàn trang theo máy, phông chữ và nội dung, nên không cam kết chính xác số trang.

## Thư viện sách

`app/thu-vien/page.tsx` cho phép tạo mục theo lớp 1–12, môn, tên sách và tên bài; dán văn bản hoặc tải TXT/DOCX riêng. `POST /api/textbooks` có hai tác vụ: `summarize` tóm tắt tài liệu đầu vào, `chat` trả lời dựa trên tóm tắt đang lưu. Prompt yêu cầu AI nói rõ khi thiếu dữ kiện. Liên kết SGK chính thức giúp giáo viên tìm tài liệu; ứng dụng không sao chép sẵn toàn bộ sách hoặc tự đọc nội dung từ đường dẫn.

## Lưu trữ và triển khai

`lib/client-storage.ts` dùng IndexedDB để lưu bài đã tạo và mục thư viện. Dữ liệu nằm trong **trình duyệt và origin hiện tại**: `localhost:3000` và tên miền Vercel là hai kho riêng. Xóa dữ liệu trình duyệt hoặc đổi máy có thể làm mất dữ liệu. Đây chưa phải tài khoản và đồng bộ máy chủ; nếu mở rộng thành pet project nhiều người dùng, có thể thay lớp lưu trữ này bằng API và cơ sở dữ liệu với xác thực.

DeepSeek chỉ được gọi từ API route phía máy chủ; đặt `DEEPSEEK_API_KEY` trong `.env.local` khi chạy local hoặc Environment Variables trên Vercel. Giới hạn lượt gọi hiện tại lưu trong bộ nhớ từng tiến trình, phù hợp giảm yêu cầu dồn dập nhưng không phải quota chung bền vững trên serverless. Muốn giới hạn theo tài khoản cần xác thực và bộ đếm tập trung.

Dev dùng `.next-dev`, còn build/start dùng `.next` để hot reload không ghi đè bản production đang chạy. Khi kiểm thử đồng thời, dùng hai cổng khác nhau, ví dụ dev 3000 và start 3001.

## Kho kiến thức nền và bản nháp dài

`knowledge-base/` lưu danh mục và nội dung từng bài trong repo. `scripts/import-knowledge.mjs` trích TXT/DOCX thành bản nháp, gắn hash chống trùng; quản trị viên duyệt trước khi chuyển sang `reviewed`. API `/api/knowledge-base` chỉ đọc các bài đã duyệt. Component `KnowledgeBasePicker` đưa văn bản nguồn vào form tạo nội dung hoặc thư viện; không tự tải toàn bộ SGK từ tên sách. Xem quy trình trong `knowledge-base/README.md`.

`lib/server/skkn-expansion.ts` phân bổ độ dài theo vai trò từng mục, gọi bổ sung theo nhóm nhỏ và sửa riêng mục quá ngắn. Kết quả đủ mục nhưng chưa đạt độ dài được trả cùng `warnings`, vẫn xem/tải được; cảnh báo được giữ trong lịch sử. Mục rỗng sau khi sửa vẫn là lỗi. Độ dài không được dùng để kết luận JSON sai định dạng.

## Hướng phát triển tiếp

- Thay IndexedDB bằng repository phía máy chủ và thêm người dùng.
- Tách prompt theo môn/lớp và đánh giá chất lượng bản nháp bằng bộ ví dụ có giáo viên duyệt.
- Thêm cơ chế chia tác vụ nền cho tài liệu dài, vì thời gian tối đa của một request phụ thuộc gói triển khai.
