'use client';
import Link from 'next/link';
import { useState } from 'react';
import { nav, site } from '@/lib/site';
import { categories } from '@/data/products';

export function AnnouncementBar() {
  return (
    <div className="bg-ocean py-2 text-center text-sm font-semibold text-white">
      Cash on Delivery Available • Fast Delivery Across Pakistan • Quality Checked Products
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false),
    [search, setSearch] = useState(false);
  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
        <div className="container flex h-20 items-center justify-between">
          <Link className="text-2xl font-black text-ocean" href="/">
            {site.name}
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map((n) => (
              <Link className="font-semibold hover:text-sea" key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
            <div className="group relative">
              <button className="font-semibold">Mega Menu</button>
              <div className="invisible absolute left-0 top-8 grid w-[560px] grid-cols-2 gap-3 rounded-3xl border bg-white p-5 opacity-0 shadow-soft group-hover:visible group-hover:opacity-100">
                {categories.map((c) => (
                  <Link className="rounded-2xl bg-surface p-4" href={`/categories/${c.slug}`} key={c.slug}>
                    <b>{c.name}</b>
                    <span className="block text-sm text-slate-600">{c.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => setSearch(true)} aria-label="Search" className="font-semibold">
              Search
            </button>
            <Link href="/cart" className="font-semibold">
              Cart
            </Link>
            <button onClick={() => setOpen(!open)} className="lg:hidden" aria-label="Open menu">
              Menu
            </button>
          </div>
        </div>
        {open && (
          <nav className="container grid gap-3 pb-5 lg:hidden">
            {nav.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {search && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-ocean/70 p-4">
          <div className="mx-auto mt-24 max-w-2xl rounded-3xl bg-white p-6">
            <button onClick={() => setSearch(false)} className="float-right font-bold">
              Close
            </button>
            <h2 className="text-2xl font-black text-ocean">Search Next Market</h2>
            <form action="/search" className="mt-5">
              <input name="q" autoFocus placeholder="Search products" className="w-full rounded-2xl border p-4" />
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const to = encodeURIComponent('syedmohammadbinali@gmail.com');
      const subject = encodeURIComponent('NextMarket subscriber');
      const body = encodeURIComponent(`New subscriber: ${email}\n\nNote: (NextMarket subscriber)\nTime: ${new Date().toISOString()}`);
      // open user's mail client with prefilled message
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
    }
  }

  return (
    <section className="bg-ocean py-16 text-white">
      <div className="container grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-black">Get useful product updates</h2>
          <p className="mt-2 text-white/80">New arrivals, care tips, and exclusive Next Market offers.</p>
        </div>
        <form className="flex gap-2" onSubmit={handleSubscribe}>
          <input
            aria-label="Email"
            placeholder="Email address"
            className="min-w-0 flex-1 rounded-full px-5 text-charcoal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <button className="btn bg-sea text-white" type="submit">
            {status === 'loading' ? 'Opening email...' : 'Subscribe'}
          </button>
        </form>
        {status === 'success' && <p className="col-span-2 mt-3 text-green-100">Thanks — mail client opened to send your email.</p>}
        {status === 'error' && <p className="col-span-2 mt-3 text-red-100">There was a problem. Please try again later.</p>}
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-surface">
      <div className="container grid gap-8 py-14 md:grid-cols-3">
        <div>
          <h3 className="text-2xl font-black text-ocean">{site.name}</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-600">{site.description}</p>
        </div>
        <div>
          <h4 className="font-bold text-charcoal">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link className="text-slate-600 hover:text-sea" href={n.href}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-charcoal">Get in Touch</h4>
          <p className="mt-3 text-sm text-slate-600">
            <a className="hover:text-sea" href={site.whatsapp} target="_blank" rel="noopener noreferrer">
              Chat with us on WhatsApp
            </a>
          </p>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
