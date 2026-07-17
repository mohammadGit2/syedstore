export default async () =>
  new Response(JSON.stringify({ ok: true, service: 'next-market' }), { headers: { 'content-type': 'application/json' } });
