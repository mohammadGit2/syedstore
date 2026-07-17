import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { getCatalog } from '@/lib/catalog';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Dashboard', robots: { index: false, follow: false } };
export default async function AdminPage() { return <AdminDashboard initialCatalog={await getCatalog()} />; }
