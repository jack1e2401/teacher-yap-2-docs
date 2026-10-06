export type SlideItem = {
  title: string;
  bullets: string[];
  speakerNotes: string;
  imageQuery?: string;
  imageData?: string;
  imageCredit?: string;
};

export function slidePages<T extends SlideItem>(slides: T[]): T[] {
  return slides.flatMap(item => {
    const pages: T[] = [];
    for (let start = 0; start < item.bullets.length; start += 4) {
      pages.push({ ...item, title: item.title + (start ? ' (tiếp)' : ''), bullets: item.bullets.slice(start, start + 4),
        imageData: start ? undefined : item.imageData, imageCredit: start ? undefined : item.imageCredit });
    }
    return pages;
  });
}

export function slideStyle(deckTitle: string, index: number, hasImage: boolean): 0 | 1 | 2 {
  if (hasImage) return 0;
  let hash = 0;
  for (const char of deckTitle) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return ((index + Math.abs(hash % 3)) % 3) as 0 | 1 | 2;
}

export function slideBadge(title: string) {
  return /kiểm tra|câu hỏi|quiz/i.test(title) ? 'KIỂM TRA'
    : /luyện|thực hành|vận dụng/i.test(title) ? 'THỰC HÀNH'
    : /khởi động|warm/i.test(title) ? 'KHỞI ĐỘNG' : 'KHÁM PHÁ';
}
