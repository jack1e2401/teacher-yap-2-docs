import type { z } from 'zod';
import type { slideSchema } from './schema';

type Deck = z.infer<typeof slideSchema>;
type CommonsImage = { data: string; credit: string };

async function findCommonsImage(query: string): Promise<CommonsImage | null> {
  if (!query.trim()) return null;
  try {
    const api = new URL('https://commons.wikimedia.org/w/api.php');
    api.searchParams.set('action', 'query'); api.searchParams.set('generator', 'search');
    api.searchParams.set('gsrsearch', query.slice(0, 80)); api.searchParams.set('gsrnamespace', '6');
    api.searchParams.set('gsrlimit', '6'); api.searchParams.set('prop', 'imageinfo');
    api.searchParams.set('iiprop', 'url|mime|extmetadata'); api.searchParams.set('iiurlwidth', '520'); api.searchParams.set('format', 'json');
    const response = await fetch(api, { signal: AbortSignal.timeout(6000), headers: { 'User-Agent': 'TeacherSlides/1.0 (educational slide export)' } });
    if (!response.ok) return null;
    const result = await response.json() as { query?: { pages?: Record<string, { title: string; imageinfo?: { thumburl?: string; mime?: string; extmetadata?: { LicenseShortName?: { value?: string } } }[] }> } };
    for (const page of Object.values(result.query?.pages || {})) {
      const info = page.imageinfo?.[0], url = info?.thumburl;
      if (!url || !['image/jpeg', 'image/png'].includes(info?.mime || '') || !/cc|public domain/i.test(info?.extmetadata?.LicenseShortName?.value || '')) continue;
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.wikimedia.org')) continue;
      const image = await fetch(url, { signal: AbortSignal.timeout(6000), headers: { 'User-Agent': 'TeacherSlides/1.0 (educational slide export)' } });
      const mime = image.headers.get('content-type')?.split(';')[0];
      if (!image.ok || !['image/jpeg', 'image/png'].includes(mime || '') || Number(image.headers.get('content-length') || 0) > 350000) continue;
      const bytes = Buffer.from(await image.arrayBuffer());
      if (bytes.length > 350000) continue;
      return { data: `data:${mime};base64,${bytes.toString('base64')}`, credit: `Ảnh: Wikimedia Commons, ${page.title.replace(/^File:/, '')} (${info.extmetadata?.LicenseShortName?.value || 'CC'}). ${url}` };
    }
  } catch { /* Network or licensing issue: keep the diagram-only slide. */ }
  return null;
}

export async function prepareSlideDeck(deck: Deck): Promise<Deck> {
  const slides = deck.slides.map(slide => ({ ...slide }));
  const indices = slides.map((slide, index) => slide.imageQuery?.trim() && !/sơ đồ|mind.?map|nói|speaking|vận dụng|application/i.test(slide.title) ? index : -1).filter(index => index >= 0).slice(0, 6);
  await Promise.all(indices.map(async index => {
    const image = await findCommonsImage(slides[index].imageQuery || '');
    if (image) { slides[index].imageData = image.data; slides[index].imageCredit = image.credit; }
  }));
  return { ...deck, slides };
}
