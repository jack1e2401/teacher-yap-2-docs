export const SKKN_SECTIONS = [
  { key: 'introduction', label: 'Đặt vấn đề', weight: 0.10 },
  { key: 'basis', label: 'Cơ sở lý luận', weight: 0.12 },
  { key: 'situation', label: 'Thực trạng', weight: 0.12 },
  { key: 'measures', label: 'Biện pháp thực hiện', weight: 0.28 },
  { key: 'evaluation', label: 'Đánh giá hiệu quả', weight: 0.14 },
  { key: 'applicability', label: 'Khả năng áp dụng', weight: 0.10 },
  { key: 'conclusion', label: 'Kết luận', weight: 0.07 },
  { key: 'recommendations', label: 'Kiến nghị', weight: 0.07 },
] as const;

type SectionKey = typeof SKKN_SECTIONS[number]['key'];
type SkknDraft = { title: string } & Record<SectionKey, string>;
export type SectionRequest = { key: SectionKey; label: string; wordTarget: number; draft: string };
type CompleteSections = (sections: SectionRequest[], repair: boolean) => Promise<unknown>;
const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

// Length is a writing target, not JSON validity. Never discard a usable draft for being short.
export async function expandSkknDraft(draft: SkknDraft, target: number, complete: CompleteSections) {
  const result = { ...draft };
  const totalWords = () => SKKN_SECTIONS.reduce((sum, section) => sum + wordCount(result[section.key]), 0);
  const needsMoreTotal = totalWords() < target * 0.95;
  const pending: SectionRequest[] = SKKN_SECTIONS
    .map(section => ({ ...section, wordTarget: Math.ceil(target * section.weight), draft: result[section.key] }))
    .filter(section => wordCount(section.draft) < section.wordTarget * (needsMoreTotal ? 1 : 0.55));
  const warnings: string[] = [];

  function merge(response: unknown, sections: SectionRequest[]) {
    if (!response || typeof response !== 'object' || Array.isArray(response)) return;
    const values = response as Record<string, unknown>;
    for (const { key } of sections) {
      const value = values[key];
      // Ignore missing/malformed fields and regressions; repair only affected fields below.
      if (typeof value === 'string' && wordCount(value) > wordCount(result[key])) result[key] = value.trim();
    }
  }

  try {
    while (pending.length) {
      const group = [pending.shift()!];
      if (pending[0] && group[0].wordTarget + pending[0].wordTarget <= 1500) group.push(pending.shift()!);
      merge(await complete(group, false), group);
      for (const section of group) {
        if (wordCount(result[section.key]) >= section.wordTarget * 0.95) continue;
        const repair = { ...section, draft: result[section.key] };
        merge(await complete([repair], true), [repair]);
      }
    }
  } catch {
    // Upstream errors/timeouts must not erase sections already generated successfully.
    warnings.push('Chưa hoàn tất bước bổ sung nội dung. Đã giữ bản nháp hiện có để thầy/cô xem và tải về.');
  }

  const emptySections = SKKN_SECTIONS.filter(section => !result[section.key].trim());
  if (emptySections.length) throw new Error(`Bản SKKN còn thiếu mục: ${emptySections.map(section => section.label).join(', ')}.`);
  const shortSections = SKKN_SECTIONS.filter(section => wordCount(result[section.key]) < target * section.weight * 0.55);
  if (totalWords() < target * 0.95 || shortSections.length) {
    warnings.push(`Bản nháp chưa đạt mục tiêu độ dài (khoảng ${totalWords()} / ${target} từ).${shortSections.length ? ` Cần bổ sung: ${shortSections.map(section => section.label).join(', ')}.` : ''} Thầy/cô có thể tải và tiếp tục chỉnh sửa.`);
  }
  return { result, warnings };
}
