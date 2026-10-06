import type { RequestData } from './schema';

export function englishSubject(input: Pick<RequestData, 'subject' | 'source'>): boolean {
  if (/^(tiếng\s*anh|anh\s*văn|english)(\s|$)/i.test(input.subject.trim())) return true;
  return /(?:^|\n)\s*(?:môn(?:\s*học)?|subject)\s*[:：-]\s*(?:tiếng\s*anh|anh\s*văn|english)\b/im.test(input.source);
}

export function languageInstruction(input: Pick<RequestData, 'subject' | 'source'>, kind: RequestData['kind']): string {
  const vietnamesePrimary = kind === 'lesson' || kind === 'skkn'
    ? 'BẮT BUỘC: Tiếng Việt là ngôn ngữ chính của toàn bộ giáo án hoặc sáng kiến kinh nghiệm. Viết tiêu đề mục, mục tiêu, phân tích, quy trình, lời hướng dẫn giáo viên, tiêu chí đánh giá và kết luận bằng tiếng Việt; các đoạn văn giải thích phải là tiếng Việt hoàn chỉnh. Không viết nguyên mục hoặc nguyên đoạn dài chỉ bằng tiếng Anh.'
    : '';
  if (!englishSubject(input)) return vietnamesePrimary;
  if (kind === 'lesson' || kind === 'skkn') return `${vietnamesePrimary} Với môn Tiếng Anh, chỉ dùng tiếng Anh ở từ vựng, mẫu câu, hội thoại, đoạn đọc, câu hỏi/bài tập cho học sinh và ví dụ minh họa cần thiết; đặt chúng trong phần giải thích tiếng Việt và thêm nghĩa hoặc đáp án tiếng Việt khi phù hợp. Không dịch máy từng câu, không trộn hai ngôn ngữ tùy tiện trong một câu. Giữ nguyên các khóa JSON và giá trị enum mà schema yêu cầu.`;
  return 'QUY TẮC NGÔN NGỮ CHO MÔN TIẾNG ANH: Viết nội dung song ngữ Việt–Anh theo chức năng sư phạm. Hướng dẫn giáo viên, mục tiêu, quy trình, tiêu chí đánh giá, ma trận, đặc tả, nhận xét và giải thích đáp án bằng tiếng Việt. Từ vựng, mẫu câu, hội thoại, đoạn đọc, yêu cầu bài tập và câu hỏi dành cho học sinh bằng tiếng Anh tự nhiên, đúng trình độ lớp; thêm nghĩa hoặc lời dẫn tiếng Việt ngắn khi cần để giáo viên dễ dùng. Trong đề kiểm tra, giữ nguyên câu hỏi và các lựa chọn tiếng Anh để học sinh làm bài; phần đáp án và hướng dẫn chấm có thể giải thích bằng tiếng Việt. Với slide, kết hợp tiêu đề/lời dẫn tiếng Việt và ví dụ hoặc hoạt động tiếng Anh trên cùng bộ slide, ưu tiên nội dung tiếng Anh mà học sinh cần nhìn thấy. Không dịch máy từng câu, không trộn hai ngôn ngữ tùy tiện trong một câu. Giữ nguyên các khóa JSON và giá trị enum mà schema yêu cầu.';
}
