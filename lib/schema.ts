import { z } from 'zod';
export const slideSchema = z.object({ title: z.string().min(1), slides: z.array(z.object({ title: z.string().min(1), bullets: z.array(z.string()).min(1).max(5), speakerNotes: z.string(), imageQuery: z.string().max(80).optional(), imageData: z.string().max(810000).regex(/^data:image\/(jpeg|png);base64,/).optional(), imageCredit: z.string().max(1000).optional() })).min(1).max(30) });
const activity = z.object({ name: z.string(), minutes: z.number().nonnegative(), goal: z.string(), content: z.string(), product: z.string(), method: z.string() });
export const lessonSchema = z.object({ title: z.string(), goals: z.string(), materials: z.string(), activities: z.array(activity).min(4) });
const question = z.object({ number: z.number().int().positive(), type: z.enum(['trắc nghiệm','đúng sai','trả lời ngắn','tự luận']), level: z.enum(['Biết','Hiểu','Vận dụng']), topic: z.string(), prompt: z.string(), options: z.array(z.string()).optional(), answer: z.string(), points: z.number().positive() });
export const examSchema = z.object({ title: z.string(), duration: z.number().positive(), questions: z.array(question).min(1), matrix: z.string(), specification: z.string(), markingGuide: z.string() });
export const skknSchema = z.object({ title: z.string(), introduction: z.string(), basis: z.string(), situation: z.string(), measures: z.string(), evaluation: z.string(), applicability: z.string(), conclusion: z.string(), recommendations: z.string() });
const questionTypeCountsSchema = z.object({ 'trắc nghiệm': z.coerce.number().int().min(0).max(40), 'đúng sai': z.coerce.number().int().min(0).max(40), 'trả lời ngắn': z.coerce.number().int().min(0).max(40), 'tự luận': z.coerce.number().int().min(0).max(40) });
export const requestSchema = z.object({ kind: z.enum(['lesson','exam','slide','skkn']), subject: z.string().max(100).default(''), grade: z.coerce.number().int().min(6).max(12).default(6), book: z.string().max(100).default(''), title: z.string().max(200).default(''), duration: z.coerce.number().min(1).max(300).default(45), goals: z.string().max(3000).default(''), source: z.string().max(16000).default(''), materials: z.string().max(3000).default(''), warmup: z.string().max(3000).default(''), vocabulary: z.string().max(3000).default(''), reading: z.string().max(3000).default(''), practice: z.string().max(3000).default(''), application: z.string().max(3000).default(''), homework: z.string().max(3000).default(''), scope: z.string().max(1000).default(''), points: z.coerce.number().min(1).max(100).default(10), questionCount: z.coerce.number().int().min(1).max(40).default(5), questionTypes: z.string().max(200).default(''), questionTypeCounts: questionTypeCountsSchema.optional(), slideCount: z.coerce.number().int().min(8).max(20).default(10), pageCount: z.coerce.number().int().min(5).max(24).default(5), problem: z.string().max(3000).default(''), measures: z.string().max(3000).default(''), evidence: z.string().max(3000).default('') });
export type RequestData = z.infer<typeof requestSchema>;
export type Kind = RequestData['kind'];
export const resultSchema = { lesson: lessonSchema, exam: examSchema, slide: slideSchema, skkn: skknSchema };
function normalizeExam(data: unknown): unknown {
  if (!data || typeof data !== 'object' || !('questions' in data) || !Array.isArray(data.questions)) return data;
  const exam = data as Record<string, unknown>;
  const asText = (value: unknown) => typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return { ...exam, matrix: asText(exam.matrix), specification: asText(exam.specification), markingGuide: asText(exam.markingGuide),
    questions: data.questions.map((question: unknown) => {
    if (!question || typeof question !== 'object') return question;
    const q = question as Record<string, unknown>;
    const level = String(q.level || '').trim().toLowerCase();
    const type = String(q.type || '').trim().toLowerCase();
    return { ...q,
      level: level === 'nhận biết' ? 'Biết' : level === 'thông hiểu' ? 'Hiểu' : q.level,
      type: type === 'nhiều lựa chọn' || type === 'trắc nghiệm nhiều lựa chọn' ? 'trắc nghiệm'
        : type === 'đúng/sai' || type === 'đúng - sai' ? 'đúng sai'
        : type === 'tự luận ngắn' ? 'trả lời ngắn' : q.type,
    };
  }) };
}
export function rebalanceExamPoints(data: unknown, requestedPoints: number) {
  const exam = examSchema.parse(normalizeExam(data));
  const current = exam.questions.reduce((sum, q) => sum + q.points, 0);
  const precision = Math.abs(requestedPoints * 10 - Math.round(requestedPoints * 10)) < 0.001 && requestedPoints * 10 >= exam.questions.length ? 10 : 100;
  if (Math.abs(current - requestedPoints) <= 0.01 && exam.questions.every(q => Math.abs(q.points * precision - Math.round(q.points * precision)) < 0.001)) return exam;
  const totalUnits = Math.round(requestedPoints * precision);
  if (totalUnits < exam.questions.length) throw new Error('Tổng điểm quá nhỏ so với số câu.');
  const remaining = totalUnits - exam.questions.length;
  const weights = exam.questions.map(q => q.points);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const exact = weights.map(weight => remaining * weight / weightSum);
  const units = exact.map(value => 1 + Math.floor(value));
  let left = totalUnits - units.reduce((sum, value) => sum + value, 0);
  const order = exact.map((value, index) => ({ index, fraction: value - Math.floor(value) })).sort((a, b) => b.fraction - a.fraction);
  for (let i = 0; i < left; i++) units[order[i].index]++;
  const questions = exam.questions.map((q, index) => ({ ...q, points: units[index] / precision }));
  return { ...exam, questions, markingGuide: questions.map(q => `Câu ${q.number}: ${q.answer} (${q.points} điểm)`).join('\n') };
}
export function validateResult(kind: Kind, data: unknown, req: RequestData) {
  const parsed = resultSchema[kind].parse(kind === 'exam' ? normalizeExam(data) : data);
  if (kind === 'slide' && slideSchema.parse(parsed).slides.length !== req.slideCount) throw new Error('Số slide không khớp yêu cầu.');
  if (kind === 'exam') {
    const exam = examSchema.parse(parsed);
    if (req.questionTypeCounts && Object.values(req.questionTypeCounts).reduce((sum, count) => sum + count, 0) !== req.questionCount) throw new Error('Tổng số câu theo dạng không khớp số câu của đề.');
    if (exam.questions.length !== req.questionCount) throw new Error('Số câu không khớp yêu cầu.');
    if (req.questionTypeCounts) for (const [type, count] of Object.entries(req.questionTypeCounts)) {
      if (exam.questions.filter(q => q.type === type).length !== count) throw new Error(`Số câu ${type} không khớp yêu cầu.`);
    }
    const total = exam.questions.reduce((sum, q) => sum + q.points, 0);
    if (Math.abs(total - req.points) > 0.01) throw new Error('Tổng điểm không khớp yêu cầu.');
    if (new Set(exam.questions.map(q => q.number)).size !== exam.questions.length || exam.questions.some(q => !q.answer.trim())) throw new Error('Đề hoặc đáp án thiếu câu.');
  }
  return parsed;
}
