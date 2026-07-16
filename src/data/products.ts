import catalog from '@/data/catalog.json';
import type { Category, Product } from '@/types/product';
export const categories = catalog.categories as Category[];
export const products = catalog.products as Product[];
export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
export const formatPrice = (price: number) => `Rs. ${price.toLocaleString('en-PK')}`;
