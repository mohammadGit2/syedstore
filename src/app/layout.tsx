import type { Metadata } from 'next';
import './globals.css';
import { AnnouncementBar, Footer, Header, Newsletter } from '@/components/LayoutParts';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'Next Market | Smart Products for Everyday Life', template: '%s | Next Market' },
  description: site.description,
  openGraph: { title: 'Next Market PK', description: site.description, type: 'website', url: site.url }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AnnouncementBar />
        <Header />
        <main>{children}</main>
        <Newsletter />
        <Footer />
      </body>
    </html>
  );
}
