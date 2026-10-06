import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

export const knowledgeLessonSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  book: z.string().trim().min(1).max(100),
  grade: z.number().int().min(1).max(12),
  subject: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  text: z.string().trim().min(30).max(16000),
  summary: z.string().trim().min(20).max(5000),
  status: z.enum(['draft', 'reviewed']),
  source: z.object({
    title: z.string().trim().min(1),
    url: z.string().url().refine(value => /^https?:\/\//.test(value)).optional(),
    edition: z.string().trim().min(1),
    pages: z.string().trim().min(1),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
  }),
});

export type KnowledgeLesson = z.infer<typeof knowledgeLessonSchema>;
export function contentHash(text: string) {
  return createHash('sha256').update(text.normalize('NFC').trim().replace(/\s+/g, ' ')).digest('hex');
}

export async function readKnowledgeLessons(root = path.join(process.cwd(), 'knowledge-base'), includeDrafts = false): Promise<KnowledgeLesson[]> {
  const result: KnowledgeLesson[] = [];
  const ids = new Set<string>();
  async function visit(directory: string) {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(file);
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
      const parsed = knowledgeLessonSchema.safeParse(JSON.parse(await readFile(file, 'utf8')));
      if (!parsed.success) throw new Error(`Bài trong knowledge-base sai định dạng: ${entry.name}`);
      if (ids.has(parsed.data.id)) throw new Error(`Mã bài bị trùng: ${parsed.data.id}`);
      ids.add(parsed.data.id);
      if (includeDrafts || parsed.data.status === 'reviewed') result.push(parsed.data);
    }
  }
  await visit(path.join(root, 'lessons'));
  return result.sort((a, b) => a.grade - b.grade || a.title.localeCompare(b.title, 'vi'));
}
