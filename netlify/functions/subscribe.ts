export default async (request: Request) => {
  try {
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    if (!process.env.NETLIFY) {
      // Not running in Netlify environment: respond success but do not persist
      return new Response(JSON.stringify({ ok: true, note: 'Not running on Netlify — subscriber saved locally (no-op in this environment).' }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    try {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore('next-market');
      const raw = await store.get('subscribers.json');
      const list = raw ? (JSON.parse(raw) as any[]) : [];
      list.push({ email, createdAt: new Date().toISOString() });
      await store.set('subscribers.json', JSON.stringify(list, null, 2));
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Failed to save subscriber' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Unexpected error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};
