import type { Product } from '@/types/product';
export type CartItem = { id: string; name: string; slug: string; image: string; price: number; quantity: number; stockQuantity: number };
const KEY = 'syed-store-cart';
export function readCart(): CartItem[] { if (typeof window === 'undefined') return []; try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } }
export function writeCart(items: CartItem[]) { localStorage.setItem(KEY, JSON.stringify(items)); window.dispatchEvent(new Event('cart:updated')); }
export function addToCart(product: Product, quantity = 1) { const items = readCart(); const price = product.salePrice ?? product.price; const existing = items.find((item) => item.id === product.id); if (existing) existing.quantity = Math.min(product.stockQuantity, existing.quantity + quantity); else items.push({ id: product.id, name: product.name, slug: product.slug, image: product.images[0], price, quantity: Math.min(product.stockQuantity, quantity), stockQuantity: product.stockQuantity }); writeCart(items); }
