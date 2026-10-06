'use client';

import type { SavedArticle } from '@/lib/client-storage';

const labels = { lesson: 'Giáo án', exam: 'Đề kiểm tra', slide: 'Slide', skkn: 'SKKN' };

export default function HistoryPanel({ articles, restore, remove }: {
  articles: SavedArticle[];
  restore: (article: SavedArticle) => void;
  remove: (article: SavedArticle) => void;
}) {
  return <section className="card historyPanel"><h2>Bài đã lưu trên máy này</h2>
    {articles.length === 0 ? <p className="hint">Bài tạo bằng AI sẽ tự lưu ở đây để mở lại vào lần sau.</p> : <div className="historyList">{articles.map(article =>
      <div className="historyItem" key={article.id}><button onClick={() => restore(article)}><b>{article.title}</b><span>{labels[article.kind]} · {new Date(article.createdAt).toLocaleString('vi-VN')}</span></button><button className="historyDelete" onClick={() => remove(article)}>Xóa</button></div>
    )}</div>}
    <p className="hint">Lưu trong trình duyệt tại localhost bằng IndexedDB. Bản trên Vercel và trình duyệt khác không tự đồng bộ.</p>
  </section>;
}
