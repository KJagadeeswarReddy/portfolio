import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Note: Middleware rewrites admin.jagadeeswar.com to /admin
  // So inside here, the path is relative.
  // However, verifying session is important.
  // If not logged in, we should redirect to login.
  // But due to the rewrite, we must be careful with redirects.

  // If we are at /admin/login, we don't redirect.
  // But this layout wraps /admin pages.

  // Let's assume the page component handles redirect or we do it here.
  // Since we don't have easy access to pathname here in layout (server component),
  // we might rely on pages or a client component wrapper.

  // For simplicity, let's just render the layout.
  // Authentication check should be done in individual pages or a middleware (but we already used middleware for routing).

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4 text-xl font-bold">Admin Panel</div>
        <nav className="mt-4">
          <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-700">Dashboard</Link>
          <Link href="/posts" className="block px-4 py-2 hover:bg-gray-700">Blog Posts</Link>
          <Link href="/documents" className="block px-4 py-2 hover:bg-gray-700">Knowledge Base</Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
