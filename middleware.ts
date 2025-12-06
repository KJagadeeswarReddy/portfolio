import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Define domains
  // In development, we might use localhost:3000. Let's simulate subdomains.
  // We can treat "admin.localhost:3000" as admin.

  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname.replace(`.jagadeeswar.com`, "") // Remove main domain
      : hostname.replace(`.localhost:3000`, ""); // Remove localhost for dev

  // If the host is "admin", rewrite to /admin
  if (currentHost === "admin") {
     // Check if path already starts with /admin, if so, don't rewrite to avoid loops/duplication?
     // Actually Next.js rewrite keeps the URL in browser but serves different content.
     // If the user visits admin.jagadeeswar.com/dashboard, we want to serve /admin/dashboard
     // But our app/admin/ folder structure might be app/admin/page.tsx etc.
     // So we rewrite path `/something` to `/admin/something`.
     url.pathname = `/admin${url.pathname}`;
     return NextResponse.rewrite(url);
  }

  // If the host is "daily", rewrite to /blog
  if (currentHost === "daily") {
    url.pathname = `/blog${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // If the host is "www" or just the root domain
  if (currentHost === "www" || currentHost === "jagadeeswar.com" || currentHost === "localhost:3000") {
     // Rewrite to /home
     url.pathname = `/home${url.pathname}`;
     return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
