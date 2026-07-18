import type { Metadata } from 'next';
import './globals.css';
import { AnnouncementBar, Footer, Header, Newsletter } from '@/components/LayoutParts';
import { site } from '@/lib/site';
import { getCatalog } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'Next Market | Smart Products for Everyday Life', template: '%s | Next Market' },
  description: site.description,
  openGraph: { title: 'Next Market PK', description: site.description, type: 'website', url: site.url }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog();
  return (
    <html lang="en">
      <body>
        <AnnouncementBar text={catalog.homepage.announcement} />
        <Header categories={catalog.categories} />
        <main>{children}</main>
        <Newsletter />
        <Footer />
      </body>
    </html>
  );
}
