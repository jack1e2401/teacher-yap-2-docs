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

export function slideStyle(_deckTitle: string, title: string, index: number, hasImage: boolean): 0 | 1 | 2 | 3 | 4 {
  if (index === 0) return 0;
  if (/từ vựng|vocabulary|language focus|ngữ pháp|grammar/i.test(title)) return 1;
  if (/sơ đồ|mind.?map|nói|speaking|vận dụng|application/i.test(title)) return 3;
  if (hasImage) return 0;
  if (/củng cố|wrap.?up|homework|bài tập về nhà|consolidation/i.test(title)) return 4;
  if (/luyện tập|practice|kiểm tra|question|quiz|bài tập|đọc hiểu|comprehension/i.test(title)) return 2;
  return index % 2 ? 2 : 4;
}

export function slideBadge(title: string) {
  return /kiểm tra|câu hỏi|quiz/i.test(title) ? 'KIỂM TRA'
    : /sơ đồ|mind.?map/i.test(title) ? 'SƠ ĐỒ Ý'
    : /nói|speaking/i.test(title) ? 'LUYỆN NÓI'
    : /luyện|thực hành|vận dụng/i.test(title) ? 'THỰC HÀNH'
    : /khởi động|warm/i.test(title) ? 'KHỞI ĐỘNG' : 'KHÁM PHÁ';
}
