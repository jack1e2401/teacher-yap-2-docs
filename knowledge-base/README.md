# Kho kiến thức nền

Kho này lưu nội dung bài học đã đối chiếu nguồn để dùng chung khi tạo giáo án, đề, slide và ghi chú thư viện. Danh mục bộ sách nằm trong `catalog.json`; danh mục không đồng nghĩa đã có nội dung sách. Hiện kho chưa chứa bài SGK nào.

## Cấu trúc

- `catalog.json`: năm học, bộ sách mặc định và liên kết nguồn chính thức.
- `sources/`: bản nguồn do quản trị viên đặt trên máy; được bỏ qua khi commit Git.
- `lessons/`: mỗi bài một JSON gồm văn bản đã trích xuất, tóm tắt và xuất xứ. Có thể chia thư mục con theo lớp/môn.
- `templates/lesson.metadata.json`: mẫu metadata để nhập bài; đây chỉ là mẫu, không phải nội dung SGK.

## Nhập một bài

1. Chuẩn bị TXT hoặc DOCX của **một bài** từ nguồn được phép sử dụng. Nếu là PDF có chữ, trích văn bản trước; PDF scan cần OCR. Rà soát chữ, bảng, công thức và thứ tự đoạn sau khi trích. Công cụ hiện chưa nhập PDF/OCR hoặc ảnh.
2. Sao chép mẫu metadata ra file riêng, điền mã bài, lớp, môn, bộ sách, tên bài, tóm tắt, phiên bản và trang nguồn. URL nên trỏ đến tài liệu cụ thể khi có. Không để nguyên chữ giữ chỗ trong mẫu.
3. Từ thư mục dự án, chạy bằng Node 22.18 trở lên:

```powershell
node scripts/import-knowledge.mjs knowledge-base/sources/bai-1.docx knowledge-base/sources/bai-1.metadata.json
```

4. Công cụ trích chữ và lưu bản `draft` vào `lessons/`. Giới hạn 2 MB/file và 16.000 ký tự/bài; tài liệu dài cần chia thành các phần. Mã bài và hash nội dung giúp chặn trùng trước khi lưu; không ghi đè bài cũ. Công cụ không gọi AI và không mất token.
5. Đối chiếu văn bản và tóm tắt với bản nguồn; sửa nội dung cần thiết rồi đổi `status` từ `draft` thành `reviewed`. App sẽ cho chọn bài trong **Bài học từ kho SGK nền**. Bài chưa duyệt không được API trả về.

## Khi sử dụng

Chọn bài ở trang tạo nội dung sẽ điền lớp, môn, sách, tên bài, tóm tắt và văn bản nguồn để AI tham chiếu. Chọn ở Thư viện sẽ điền biểu mẫu, giáo viên có thể sửa và lưu thành ghi chú cá nhân. Bản nguồn giữ nguyên trong kho; app không ghi từ trình duyệt vào thư mục này.

Các bài `reviewed` được `GET /api/knowledge-base` cung cấp công khai cho người dùng app. Chỉ đưa nội dung được phép chia sẻ vào kho chung. Tài liệu cá nhân của giáo viên tiếp tục nằm trong thư viện trình duyệt, không tự đưa vào kho chung.

Trên Vercel, kho chung được đóng gói khi triển khai; thêm/sửa bài cần triển khai lại. Đây là kho file nhỏ, chưa có tìm kiếm toàn văn/vector hay đồng bộ cơ sở dữ liệu. Với nhiều sách, nên chuyển sang cơ sở dữ liệu và truy vấn riêng từng bài để không trả cả kho trong một request.
