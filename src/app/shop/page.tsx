import { ShopClient } from '@/components/shop/ShopClient';
import { getCatalog } from '@/lib/catalog';
export const dynamic = 'force-dynamic';
export const metadata={title:'Shop'};
export default async function Shop(){const catalog=await getCatalog();return <section className="container py-12"><h1 className="text-4xl font-black text-ocean">Shop Products</h1><ShopClient products={catalog.products} categories={catalog.categories}/></section>}
