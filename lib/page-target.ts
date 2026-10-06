export const MIN_PAGES = 5;
export const MAX_PAGES = 24;

// Word pagination depends on fonts, tables and the user's editor. This is a content target.
export function targetWords(pageCount: number): number {
  return Math.max(2000, Math.round(pageCount * 300));
}

export function wordsPerLessonActivity(pageCount: number, activityCount: number): number {
  return Math.ceil((targetWords(pageCount) - 300) / Math.max(1, activityCount));
}

export function wordsPerSkknSection(pageCount: number): number {
  return Math.ceil(targetWords(pageCount) / 8);
}
