import { CartClient } from '@/components/cart/CartClient';
export const metadata={title:'Cart'};
export default function Page(){return <section className="container py-16"><h1 className="text-4xl font-black text-ocean">Cart</h1><div className="mt-8"><CartClient /></div></section>}
