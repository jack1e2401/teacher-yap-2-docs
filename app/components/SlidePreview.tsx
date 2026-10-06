'use client';

import { slideBadge, slidePages, slideStyle, type SlideItem } from '@/lib/slide-layout';

type Props = { raw: string; index: number; setIndex: (value: number) => void; present: boolean; setPresent: (value: boolean) => void };

export default function SlidePreview({ raw, index, setIndex, present, setPresent }: Props) {
  let deck: { title: string; slides: SlideItem[] };
  try { deck = JSON.parse(raw); } catch { return <div className="previewError">Không đọc được slide. Hãy tạo lại nội dung.</div>; }
  const pages = slidePages(deck.slides || []);
  const safeIndex = Math.max(0, Math.min(index, pages.length - 1));
  const slide = pages[safeIndex];
  if (!slide) return <div className="previewError">Chưa có slide để xem.</div>;
  const style = slideStyle(deck.title, slide.title, safeIndex, Boolean(slide.imageData));
  return <div className={present ? 'slidePreview present' : 'slidePreview'}>
    <div className={`slideCanvas referenceStyle referenceStyle${style}`}>
      <div className="referenceHeader"><h3>{slide.title}</h3><span>{deck.title}</span></div>
      {style === 0 && <div className={`referenceHero ${slide.imageData ? 'hasImage' : ''}`}><div className="referenceHeroPoints">{slide.bullets.map((bullet, i) => <p key={i}><b>{i + 1}</b><span>{bullet}</span></p>)}</div>{slide.imageData && <img src={slide.imageData} alt={`Ảnh minh họa ${slide.title}`}/>}</div>}
      {style === 1 && <div className={`referenceVocabulary ${slide.imageData ? 'hasImage' : ''}`}><div>{slide.bullets.map((bullet, i) => <p key={i}>{bullet}</p>)}</div>{slide.imageData && <img src={slide.imageData} alt={`Ảnh minh họa ${slide.title}`}/>}</div>}
      {style === 2 && <div className="referenceQuestions">{slide.bullets.map((bullet, i) => <div key={i}><b>{i + 1}</b><p>{bullet}</p></div>)}</div>}
      {style === 3 && <div className="referenceMap"><svg className="referenceMapLines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M32 28 L38 46 M62 46 L68 28 M32 73 L38 54 M62 54 L68 73"/></svg><div className="referenceMapCenter">{slideBadge(slide.title)}</div>{slide.bullets.map((bullet, i) => <p className={`mapItem mapItem${i}`} key={i}>{bullet}</p>)}</div>}
      {style === 4 && <div className="referenceWrap"><strong>TỔNG KẾT BÀI HỌC</strong>{slide.bullets.map((bullet, i) => <p key={i}><b>{i + 1}</b><span>{bullet}</span></p>)}</div>}
      <div className="referenceNumber">{safeIndex + 1} / {pages.length}</div>
    </div>
    <p className="previewNotes"><strong>Ghi chú giáo viên:</strong> {slide.speakerNotes}</p>
    <div className="actions previewControls"><button onClick={() => setIndex(Math.max(0, safeIndex - 1))} disabled={safeIndex === 0}>← Trước</button><span>Slide {safeIndex + 1} / {pages.length}</span><button onClick={() => setIndex(Math.min(pages.length - 1, safeIndex + 1))} disabled={safeIndex === pages.length - 1}>Sau →</button><button onClick={() => setPresent(!present)}>{present ? 'Thu nhỏ' : 'Trình chiếu'}</button></div>
  </div>;
}
