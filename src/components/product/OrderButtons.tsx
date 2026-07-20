'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Product } from '@/types/product';

function makeWhatsAppUrl(productName: string) {
  const base = 'https://wa.me/923233086528';
  const message = `Hello Next Market,\n\nI am ordering: ${productName}\n\nI need more details about this product, including price, availability, delivery time, and payment options.\n\nThank you.`;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function OrderButtons({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleWhatsApp() {
    if (!confirm('We will open WhatsApp to place your order. Continue?')) return;
    setLoading(true);
    window.location.href = makeWhatsAppUrl(product.name);
  }

  function handleEmail() {
    // navigate to internal email order form
    router.push(`/order-email/${product.slug}`);
  }

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <button onClick={handleWhatsApp} className="btn btn-primary w-full sm:w-auto" disabled={loading}>
        {loading ? 'Opening WhatsApp...' : 'Order via WhatsApp'}
      </button>
      <button onClick={handleEmail} className="btn btn-outline w-full sm:w-auto">
        Order via Email
      </button>
      <a className="btn btn-ghost ml-0 sm:ml-2" href="https://www.facebook.com/profile.php?id=61575436003329" target="_blank" rel="noopener noreferrer">
        Facebook
      </a>
    </div>
  );
}
