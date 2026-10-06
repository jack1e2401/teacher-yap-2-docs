'use client';

import { slideBadge, slidePages, slideStyle, type SlideItem } from '@/lib/slide-layout';

type Props = { raw: string; index: number; setIndex: (value: number) => void; present: boolean; setPresent: (value: boolean) => void };

export default function SlidePreview({ raw, index, setIndex, present, setPresent }: Props) {
  let deck: { title: string; slides: SlideItem[] };
  try { deck = JSON.parse(raw); } catch { return <div className="previewError">Không đọc được slide. Hãy tạo lại nội dung.</div>; }
  const pages = slidePages(deck.slides || []);
  const safeIndex = Math.min(index, pages.length - 1);
  const slide = pages[safeIndex];
  if (!slide) return <div className="previewError">Chưa có slide để xem.</div>;
  const style = slideStyle(deck.title, safeIndex, Boolean(slide.imageData));
  const middle = Math.ceil(slide.bullets.length / 2);
  const columns = [slide.bullets.slice(0, middle), slide.bullets.slice(middle)];
  return <div className={present ? 'slidePreview present' : 'slidePreview'}>
    <div className={`slideCanvas slideStyle${style}`}>
      <div className="pptStripe"/>
      <div className="pptTop"><span>{deck.title}</span><b>✦ &nbsp;{slideBadge(slide.title)}</b></div>
      <h3>{slide.title}</h3>
      {style === 0 && <div className={`pptEditorial ${slide.imageData ? 'withImage' : ''}`}><div className="pptRows">{slide.bullets.map((bullet, i) => <div key={i}><b>{String(i + 1).padStart(2, '0')}</b><span>{bullet}</span></div>)}</div>{slide.imageData && <figure><img src={slide.imageData} alt={`Ảnh minh họa cho ${slide.title}`}/><figcaption>WIKIMEDIA COMMONS</figcaption></figure>}</div>}
      {style === 1 && <><div className="pptProcess">{slide.bullets.map((bullet, i) => <div className="pptStep" key={i}><b>{i + 1}</b><p>{bullet}</p>{i < slide.bullets.length - 1 && <span aria-hidden="true">›</span>}</div>)}</div><div className="pptProcessCaption">QUAN SÁT &nbsp;→&nbsp; THỰC HÀNH &nbsp;→&nbsp; VẬN DỤNG</div></>}
      {style === 2 && <div className="pptSplit">{columns.map((bullets, col) => <div key={col}><b>{col ? 'ÁP DỤNG' : 'KHÁM PHÁ'}</b>{bullets.map((bullet, i) => <p key={i}>{bullet}</p>)}</div>)}</div>}
      <div className="pptNumber">{safeIndex + 1} / {pages.length}</div>
    </div>
    <p className="previewNotes"><strong>Ghi chú giáo viên:</strong> {slide.speakerNotes}</p>
    <div className="actions previewControls"><button onClick={() => setIndex(Math.max(0, safeIndex - 1))} disabled={safeIndex === 0}>← Trước</button><span>Slide {safeIndex + 1} / {pages.length}</span><button onClick={() => setIndex(Math.min(pages.length - 1, safeIndex + 1))} disabled={safeIndex === pages.length - 1}>Sau →</button><button onClick={() => setPresent(!present)}>{present ? 'Thu nhỏ' : 'Trình chiếu'}</button></div>
  </div>;
}
