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

  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname.replace(`.jagadeeswar.com`, "") // Remove main domain
      : hostname.replace(`.localhost:3000`, ""); // Remove localhost for dev

  let targetPath: string | null = null;

  if (currentHost === "admin") {
    targetPath = '/admin';
  } else if (currentHost === "daily") {
    targetPath = '/blog';
  } else if (currentHost === "www" || currentHost === "") {
    targetPath = '/home';
  }

  if (targetPath && !url.pathname.startsWith(targetPath)) {
    // If the root path is requested, rewrite to the target path.
    // Otherwise, prepend the target path.
    url.pathname = url.pathname === '/' ? targetPath : `${targetPath}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
