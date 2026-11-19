// Cloudflare Pages Function: the same recorder as server.py, writing to D1.
// Each POST is one session snapshot; the analysis keeps the last one per id.
// No client IP or other request metadata is stored.
const MAX_BODY = 2_000_000;

export async function onRequestPost({ request, env }) {
  const len = Number(request.headers.get('content-length') || 0);
  if (len > MAX_BODY) return Response.json({ error: 'too large' }, { status: 413 });
  let rec;
  try {
    const text = await request.text();
    if (!text || text.length > MAX_BODY) throw new Error('bad length');
    rec = JSON.parse(text);
    if (!rec || typeof rec !== 'object' || Array.isArray(rec)) throw new Error('payload must be a JSON object');
  } catch (e) {
    return Response.json({ error: `bad json: ${e.message}` }, { status: 400 });
  }
  const id = String(rec.id ?? 'anon').replace(/[^A-Za-z0-9_.-]/g, '_').slice(0, 80) || 'anon';
  const now = new Date().toISOString();
  rec._server_time = now;
  await env.DB.prepare('INSERT INTO snapshots (session_id, round, server_time, payload) VALUES (?1, ?2, ?3, ?4)')
    .bind(id, String(rec.round ?? '').slice(0, 60), now, JSON.stringify(rec)).run();
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
