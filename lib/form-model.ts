import { DEFAULT_TEXTBOOK } from './textbook-catalog';

export type Tab = 'lesson' | 'slide' | 'skkn';
export type Kind = 'lesson' | 'exam' | 'slide' | 'skkn';
export type QuestionType = 'trắc nghiệm' | 'đúng sai' | 'trả lời ngắn' | 'tự luận';
export type QuestionTypeCounts = Record<QuestionType, number>;

export type GeneratorFormData = {
  subject: string;
  grade: number;
  book: string;
  title: string;
  duration: number;
  goals: string;
  source: string;
  materials: string;
  warmup: string;
  vocabulary: string;
  reading: string;
  practice: string;
  application: string;
  homework: string;
  scope: string;
  points: number;
  questionCount: number;
  questionTypes: string;
  questionTypeCounts: QuestionTypeCounts;
  slideCount: number;
  pageCount: number;
  problem: string;
  measures: string;
  evidence: string;
};

export const initialForm: GeneratorFormData = {
  subject: '', grade: 6, book: DEFAULT_TEXTBOOK, title: '', duration: 45, goals: '', source: '',
  materials: '', warmup: '', vocabulary: '', reading: '', practice: '', application: '', homework: '',
  scope: '', points: 10, questionCount: 5, questionTypes: '',
  questionTypeCounts: { 'trắc nghiệm': 3, 'đúng sai': 0, 'trả lời ngắn': 1, 'tự luận': 1 },
  slideCount: 10, pageCount: 5, problem: '', measures: '', evidence: '',
};

export const questionTypes: QuestionType[] = ['trắc nghiệm', 'đúng sai', 'trả lời ngắn', 'tự luận'];
