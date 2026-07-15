export default async () => new Response(JSON.stringify({ ok: true, service: 'syed-store' }), { headers: { 'content-type': 'application/json' } });
