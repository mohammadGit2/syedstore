'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { Product } from '@/types/product';

type Props = { product: Product };

export default function OrderForm({ product }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [payment, setPayment] = useState('Cash on Delivery');
  const [subject, setSubject] = useState(`Order Request - ${product.name}`);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // restore saved customer info
    setName(localStorage.getItem('nm_name') || '');
    setEmail(localStorage.getItem('nm_email') || '');
    setPhone(localStorage.getItem('nm_phone') || '');
    setLocation(localStorage.getItem('nm_location') || '');
  }, []);

  useEffect(() => {
    // default message body
    setMessage(`Hello Next Market,\n\nI would like to buy the following product:\n\nProduct: ${product.name}\n\nPlease confirm availability, final price, delivery charges, and expected delivery time.\n\nCustomer Details:\nName: ${name}\nPhone: ${phone}\nLocation: ${location}\nPayment Method: ${payment}\n\nThank you.`);
  }, [name, phone, location, payment, product.name]);

  function validate() {
    if (!name.trim()) return 'Please enter your full name.';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address.';
    if (!phone.trim()) return 'Please enter your phone number.';
    if (!location.trim()) return 'Please enter your delivery location.';
    return '';
  }

  function openMailClient() {
    const err = validate();
    if (err) return alert(err);
    // save details locally
    localStorage.setItem('nm_name', name);
    localStorage.setItem('nm_email', email);
    localStorage.setItem('nm_phone', phone);
    localStorage.setItem('nm_location', location);

    const to = 'syedmohammadbinali@gmail.com';
    const body = message;
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setLoading(true);
    window.location.href = mailto;
    setTimeout(() => setLoading(false), 1500);
  }

  async function copyDetails() {
    const text = `Product: ${product.name}\nName: ${name}\nPhone: ${phone}\nLocation: ${location}\nPayment: ${payment}\n\n${message}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Copy failed — you can manually select and copy the message.');
    }
  }

  return (
    <div className="card p-6">
      <div className="flex gap-4">
        <div className="w-32 h-32 overflow-hidden rounded">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="bg-surface h-full w-full" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold">{product.name}</h3>
          <p className="text-sm text-slate-600">Please fill your details below — we'll open your email client for submission.</p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          openMailClient();
        }}
        className="mt-4 grid gap-3"
      >
        <input placeholder="Full Name*" className="input" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email Address*" className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        <input placeholder="Phone Number*" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="Delivery Location / City*" className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
        <label className="text-sm">Payment Method*</label>
        <select className="input" value={payment} onChange={(e) => setPayment(e.target.value)}>
          <option>Cash on Delivery</option>
          <option>Advance Payment</option>
        </select>

        <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />

        <textarea className="input h-32" value={message} onChange={(e) => setMessage(e.target.value)} />

        <div className="flex items-center gap-3">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Opening email...' : 'Send via Email'}
          </button>
          <button type="button" className="btn btn-outline" onClick={copyDetails}>
            {copied ? 'Copied' : 'Copy details'}
          </button>
        </div>
      </form>
    </div>
  );
}
