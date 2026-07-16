'use client';
import { useState } from 'react';
import { addToCart } from '@/components/cart/cart-store';
import type { Product } from '@/types/product';
export function AddToCartButton({ product }: { product: Product }) { const [added, setAdded] = useState(false); const disabled = product.stockQuantity <= 0; return <button disabled={disabled} onClick={() => { addToCart(product); setAdded(true); }} className="btn btn-primary mt-5 disabled:cursor-not-allowed disabled:bg-slate-400">{disabled ? 'Out of Stock' : added ? 'Added to Cart' : 'Add to Cart'}</button>; }
