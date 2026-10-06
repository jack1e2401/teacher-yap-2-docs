const fs = require('node:fs');
const lines = fs.readFileSync('.env.local', 'utf8').split(/\r?\n/);
function env(name) {
  const line = lines.find(value => value.trimStart().startsWith(name + '='));
  return line?.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '') || '';
}
const key = env('DEEPSEEK_API_KEY');
const model = env('DEEPSEEK_MODEL') || 'deepseek-flash';
if (!key) { console.log('API key chưa được cấu hình.'); process.exit(1); }
(async () => {
  const balanceResponse = await fetch('https://api.deepseek.com/user/balance', {
    headers: { Authorization: 'Bearer ' + key },
  });
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, response_format: { type: 'json_object' }, max_tokens: 50,
      messages: [{ role: 'system', content: 'Reply with a JSON object.' }, { role: 'user', content: 'Return a JSON object with ok set to true.' }] }),
  });
  const data = await response.json();
  console.log(JSON.stringify({ balanceHttpStatus: balanceResponse.status, chatHttpStatus: response.status, requestedModel: model, returnedModel: data.model || null,
    validJson: (() => { try { return JSON.parse(data.choices?.[0]?.message?.content || '').ok === true; } catch { return false; } })(),
    errorType: data.error?.type || null, errorCode: data.error?.code || null }));
  if (!response.ok) process.exitCode = 1;
})().catch(error => { console.log(JSON.stringify({ networkError: error.cause?.code || error.code || error.name })); process.exitCode = 1; });
