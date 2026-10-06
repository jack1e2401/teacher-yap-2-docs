type Message = { role: 'system' | 'user' | 'assistant'; content: string };

export class DeepSeekError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export async function completeWithDeepSeek(options: {
  messages: Message[];
  json?: boolean;
  maxTokens: number;
  timeoutMs?: number;
}): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new DeepSeekError('Chưa cấu hình DEEPSEEK_API_KEY trên máy chủ.', 503);
  let response: Response;
  try {
    response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      signal: AbortSignal.timeout(options.timeoutMs ?? 60_000),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || 'deepseek-flash',
        thinking: { type: 'disabled' },
        ...(options.json ? { response_format: { type: 'json_object' } } : {}),
        max_tokens: options.maxTokens,
        temperature: 0.35,
        messages: options.messages,
      }),
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError'))
      throw new DeepSeekError('DeepSeek phản hồi quá thời gian. Vui lòng thử lại.', 504);
    throw new DeepSeekError('Máy chủ không kết nối được DeepSeek.', 502);
  }
  if (!response.ok) {
    const message = response.status === 401 ? 'DeepSeek từ chối API key.'
      : response.status === 402 ? 'Tài khoản DeepSeek không đủ số dư.'
      : response.status === 429 ? 'DeepSeek đang giới hạn tốc độ.'
      : `DeepSeek trả lỗi ${response.status}.`;
    throw new DeepSeekError(message, 502);
  }
  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new DeepSeekError('DeepSeek không trả nội dung.', 502);
  return content.trim();
}
