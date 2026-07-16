export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  images: string[];
  features: string[];
  specifications: Record<string, string | undefined>;
  rating: number;
  reviewCount: number;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  tags: string[];
};export type Category = { slug: string; name: string; description: string; image: string };
