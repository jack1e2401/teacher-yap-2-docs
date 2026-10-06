import Link from 'next/link';
import './guide.css';

export const metadata = {
  title: 'Hướng dẫn sử dụng | Trợ lý giáo viên AI',
  description: 'Cách tạo kế hoạch bài dạy, đề kiểm tra, slide và SKKN bằng Trợ lý giáo viên AI.',
};

const sections = [
  { id: 'bat-dau', label: 'Bắt đầu' },
  { id: 'soan-bai', label: 'Soạn bài' },
  { id: 'kiem-tra', label: 'Bài kiểm tra' },
  { id: 'slide', label: 'Tạo slide' },
  { id: 'skkn', label: 'Viết SKKN' },
  { id: 'tai-file', label: 'Tải và sửa file' },
  { id: 'thu-vien', label: 'Thư viện & lịch sử' },
  { id: 'loi', label: 'Lỗi thường gặp' },
];

export default function GuidePage() {
  return <main className="guideShell">
    <div className="guideTop"><Link href="/" className="guideBack">← Về trang tạo nội dung</Link><span>TRỢ LÝ GIÁO VIÊN AI</span></div>
    <header className="guideHero">
      <div className="eyebrow">HƯỚNG DẪN SỬ DỤNG</div>
      <h1>Từ thông tin đầu vào<br/>đến file có thể chỉnh sửa.</h1>
      <p>Chọn loại tài liệu, cung cấp nội dung bài học, kiểm tra bản nháp rồi tải Word hoặc PowerPoint. Mỗi bước bên dưới tương ứng với một phần trên giao diện.</p>
      <Link href="/" className="guideStart">Bắt đầu tạo nội dung <span aria-hidden="true">↗</span></Link>
    </header>
    <div className="guideLayout">
      <aside className="guideToc" aria-label="Mục lục hướng dẫn"><strong>TRONG TRANG NÀY</strong>{sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}</aside>
      <div className="guideContent">
        <section id="bat-dau" className="guideSection">
          <span className="guideKicker">01 · QUY TRÌNH CHUNG</span><h2>Bắt đầu trong bốn bước</h2>
          <div className="guideSteps">
            <div><b>01</b><h3>Chọn chế độ</h3><p>Chọn Soạn bài, Tạo slide hoặc Viết SKKN. Trong Soạn bài, chọn tiếp Kế hoạch bài dạy hoặc Bài kiểm tra.</p></div>
            <div><b>02</b><h3>Điền thông tin</h3><p>Nhập tên bài, lớp, phạm vi và tài liệu liên quan. Nút <strong>Điền dữ liệu mẫu</strong> chỉ điền các ô để bro thử nhanh.</p></div>
            <div><b>03</b><h3>Tạo và rà soát</h3><p>Bấm <strong>Tạo với AI</strong> rồi chờ kết quả. Xem bản nháp trình bày sẵn, kiểm tra kiến thức, số liệu và đáp án.</p></div>
            <div><b>04</b><h3>Tải file</h3><p>Chọn nút tải Word hoặc PowerPoint ở góc phần Kết quả. File tải về vẫn chỉnh sửa được.</p></div>
          </div>
          <div className="guideNote"><strong>Muốn xem trước mà không gọi AI?</strong> Bấm <em>Xem bài mẫu</em>. Kết quả sẽ được gắn nhãn “Dữ liệu mẫu” và có thể dùng để thử thao tác tải file.</div>
        </section>

        <section id="soan-bai" className="guideSection">
          <span className="guideKicker">02 · WORD</span><h2>Kế hoạch bài dạy</h2>
          <ol><li>Trong <strong>Soạn bài</strong>, chọn <strong>Kế hoạch bài dạy</strong>.</li><li>Điền môn, lớp, bộ sách, tên bài, thời lượng, yêu cầu cần đạt và mục tiêu từ <strong>5 đến 24 trang</strong>. Dán tài liệu giáo viên cung cấp nếu có.</li><li>Bấm <strong>Tạo với AI</strong>. Bản nháp gồm mục tiêu, học liệu và bốn hoạt động: khởi động, hình thành kiến thức, luyện tập, vận dụng.</li><li>Kiểm tra thời lượng từng hoạt động, câu hỏi, sản phẩm học sinh và cách đánh giá; sau đó tải <strong>.docx</strong>.</li></ol>
          <p className="guideAside">Nội dung càng cụ thể thì bài soạn càng sát lớp học. Ví dụ: nêu từ vựng, cấu trúc, hoạt động và mục tiêu cần đạt thay vì chỉ nhập tên bài.</p>
        </section>

        <section id="kiem-tra" className="guideSection">
          <span className="guideKicker">03 · WORD</span><h2>Bài kiểm tra</h2>
          <ol><li>Trong <strong>Soạn bài</strong>, chọn <strong>Bài kiểm tra</strong>. Nhập tên chủ đề, thời gian, phạm vi và tổng điểm.</li><li>Điền số câu cho từng dạng: trắc nghiệm, đúng/sai, trả lời ngắn và tự luận. Tổng số câu tự cộng, tối đa <strong>40 câu</strong>.</li><li>Sau khi tạo, đọc đề và mở phần đáp án/ma trận ở cuối bản xem trước để đối chiếu điểm từng câu.</li><li>Tải <strong>Đề học sinh .docx</strong> và <strong>Đáp án .docx</strong> riêng. File giáo viên có ma trận, đặc tả, đề và bảng đáp án.</li></ol>
          <div className="guideNote"><strong>Ví dụ:</strong> 12 trắc nghiệm + 4 đúng/sai + 2 trả lời ngắn + 2 tự luận = 20 câu. Nếu yêu cầu nhiều câu, AI tạo theo nhóm để tránh cắt mất cuối đề.</div>
        </section>

        <section id="slide" className="guideSection">
          <span className="guideKicker">04 · POWERPOINT</span><h2>Tạo slide từ kế hoạch bài dạy</h2>
          <ol><li>Chọn <strong>Tạo slide</strong>, điền môn, lớp, bộ sách, tên bài và mục tiêu.</li><li>Điền các ô khởi động, từ vựng, bài đọc, luyện tập, vận dụng và củng cố. Có thể mở <strong>Tài liệu tham khảo thêm</strong> để dán hoặc tải tệp <strong>.txt / .docx</strong>.</li><li>Chọn từ <strong>8 đến 20 slide</strong>, rồi bấm <strong>Tạo với AI</strong>. Xem từng trang bằng Trước/Sau hoặc Trình chiếu.</li><li>Tải <strong>.pptx</strong> và chỉnh sửa nội dung, ảnh, sơ đồ trong PowerPoint.</li></ol>
          <p className="guideAside">Ảnh minh họa được tìm từ Wikimedia Commons khi có ảnh phù hợp và máy chủ có kết nối mạng. Nếu không tìm được, slide vẫn xuất với các thành phần đồ họa có thể chỉnh sửa.</p>
        </section>

        <section id="skkn" className="guideSection">
          <span className="guideKicker">05 · WORD</span><h2>Viết bản dự thảo SKKN</h2>
          <ol><li>Chọn <strong>Viết SKKN</strong> và nhập tên đề tài, vấn đề/thực trạng, biện pháp, minh chứng trước–sau và mục tiêu <strong>5–24 trang</strong>.</li><li>Bấm <strong>Tạo với AI</strong>. Hệ thống viết các mục đặt vấn đề, cơ sở, thực trạng, biện pháp, đánh giá, khả năng áp dụng và kết luận.</li><li>Kiểm tra các vị trí <strong>[CẦN GIÁO VIÊN BỔ SUNG]</strong>, thêm số liệu và tài liệu đã xác minh rồi tải <strong>.docx</strong>.</li></ol>
          <div className="guideNote"><strong>Lưu ý:</strong> Đây là bản dự thảo. App không tự xác minh thành tích, số liệu hay nguồn tham khảo.</div>
        </section>

        <section id="tai-file" className="guideSection">
          <span className="guideKicker">06 · KẾT QUẢ</span><h2>Chỉnh sửa và tải file</h2>
          <p>Kết quả nằm ở cột bên phải dưới dạng bản xem trước dễ đọc. Với đề kiểm tra, mở phần đáp án và ma trận ở cuối bản xem trước. Với slide, dùng Trước/Sau để kiểm tra từng trang.</p>
          <p>Word dùng định dạng <strong>.docx</strong>; slide dùng <strong>.pptx</strong>. Tải file rồi mở trong Word/PowerPoint để chỉnh nội dung và bố cục cuối cùng.</p>
        </section>

        <section id="thu-vien" className="guideSection">
          <span className="guideKicker">07 · LƯU TRỮ</span><h2>Thư viện sách và lịch sử</h2>
          <p>Mở <Link href="/thu-vien">Thư viện sách</Link> để lưu tóm tắt theo lớp 1–12, môn, sách hoặc từng bài. Có thể dán nội dung hoặc tải tài liệu TXT/DOCX riêng, nhờ AI tóm tắt rồi đặt câu hỏi dựa trên bản tóm tắt. Nếu tài liệu thiếu thông tin, AI sẽ báo chưa đủ dữ kiện.</p>
          <p>Bài đã tạo bằng AI được lưu trong <strong>Lịch sử trên máy</strong> ở trang chính. Dữ liệu nằm trong trình duyệt đang dùng: mở lại cùng địa chỉ localhost vẫn thấy bài cũ; đổi trình duyệt, tên miền hoặc xóa dữ liệu trình duyệt sẽ có kho khác.</p>
          <p>Số trang 5–24 là <strong>mục tiêu nội dung</strong>, không phải số trang Word cố định. Kiểm tra bản xuất và chỉnh sửa khi cần.</p>
        </section>

        <section id="loi" className="guideSection">
          <span className="guideKicker">07 · HỖ TRỢ</span><h2>Lỗi thường gặp</h2>
          <div className="guideFaq"><div><h3>“Quá nhiều yêu cầu”</h3><p>Chờ khoảng một phút rồi thử lại. Bản chạy local giới hạn 6 lượt tạo trong 60 giây cho mỗi IP.</p></div><div><h3>“Chưa cấu hình API key”</h3><p>Người quản trị cần đặt <code>DEEPSEEK_API_KEY</code> trên máy chủ hoặc trong Environment Variables của Vercel.</p></div><div><h3>AI trả kết quả chưa hợp lệ</h3><p>Thử lại với phạm vi gọn và tài liệu đầu vào rõ hơn. Với đề kiểm tra, kiểm tra tổng số câu từng dạng.</p></div><div><h3>Không xuất được file</h3><p>Kiểm tra thông tin đầu vào và thử tạo lại. Nếu lỗi tiếp diễn, báo cho người quản trị kèm chế độ và số câu/slide đã chọn.</p></div></div>
        </section>
        <div className="guideEnd"><strong>Sẵn sàng thử?</strong><span>Quay về trang chính và dùng “Điền dữ liệu mẫu” cho lần đầu.</span><Link href="/">Mở công cụ tạo nội dung →</Link></div>
      </div>
    </div>
  </main>;
}
