export function onRequestGet() {
  return Response.json({ ok: true, time: Date.now() / 1000 }, { headers: { 'Cache-Control': 'no-store' } });
}
