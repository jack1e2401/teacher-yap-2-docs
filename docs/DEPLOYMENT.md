# Đưa dự án lên GitHub và Vercel

Chạy các lệnh dưới đây trong thư mục `tro-ly-giao-vien-ai`. Dự án là Next.js và có API route ở `app/api/`; Vercel sẽ triển khai các route này dưới dạng Functions.

## 1. Chuẩn bị repository GitHub

Tạo một repository trống trên GitHub, sau đó chạy:

```powershell
git add .
git commit -m "Prepare teacher AI app for deployment"
git branch -M main
git remote add origin https://github.com/TEN-CUA-BAN/TEN-REPO.git
git push -u origin main
```

Thay `TEN-CUA-BAN/TEN-REPO` bằng địa chỉ repository thật. Nếu repo đã có remote `origin`, dùng `git remote -v` để xem trước và bỏ qua lệnh `git remote add origin`.

`.gitignore` đã loại `node_modules/`, `.next/` và `.env*` khỏi commit; `.env.example` chỉ là mẫu không chứa key. Không đưa `.env.local` hoặc API key vào GitHub.

## 2. Import vào Vercel

1. Vào [Vercel New Project](https://vercel.com/new) và import repository GitHub.
2. Chọn **Framework Preset: Next.js**.
3. Nếu repository chứa trực tiếp app này, giữ **Root Directory** mặc định. Nếu repository là thư mục cha, chọn `tro-ly-giao-vien-ai`.
4. Giữ Build Command mặc định hoặc dùng `pnpm build`.

## 3. Thêm biến môi trường

Trong Vercel Project Settings → Environment Variables, thêm:

| Tên | Giá trị |
| --- | --- |
| `DEEPSEEK_API_KEY` | API key DeepSeek thật của bạn |
| `DEEPSEEK_MODEL` | `deepseek-flash` (hoặc model bạn đã kiểm tra hoạt động) |

Áp dụng cho **Production**; chọn thêm **Preview** nếu cần thử các nhánh khác. Không đặt tiền tố `NEXT_PUBLIC_` cho API key. Sau khi thay đổi biến môi trường, tạo deployment mới để cấu hình có hiệu lực.

## 4. Kiểm tra bản deploy

Mở URL Vercel, thử xem bài mẫu, tạo một đề ngắn bằng AI, rồi tải Word/PPTX. Nếu tạo nội dung dài bị timeout, kiểm tra cấu hình thời gian chạy của Vercel Functions và Fluid Compute. App có thể chờ DeepSeek tới 180 giây cho giáo án hoặc sáng kiến kinh nghiệm.

## Lưu ý khi mở công khai

- Bộ đếm 6 yêu cầu/phút/IP hiện lưu trong bộ nhớ của một tiến trình. Trên nhiều Vercel Function instance, nó không phải rate limit dùng chung. Nên cấu hình Vercel WAF rate limit cho `/api/generate` hoặc dùng kho lưu chung.
- DeepSeek có quota và chi phí riêng; đề dài, giáo án và sáng kiến kinh nghiệm có thể gọi API nhiều lần.
- Vercel Functions giới hạn kích thước request/response; file xuất rất lớn hoặc quá nhiều ảnh có thể vượt giới hạn.
- Ứng dụng chưa có đăng nhập hoặc lưu lịch sử.
