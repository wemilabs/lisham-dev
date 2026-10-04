import { type NextRequest, NextResponse } from "next/server";

const publishedSlugs = new Set(process.env.BLOG_SLUGS?.split(",") ?? []);

export function proxy(request: NextRequest) {
  // env is frozen at `next dev` start, so posts created during a dev
  // session would 404 until restart; skip the check outside production.
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const slug = (request.nextUrl.pathname.split("/")[2] ?? "").replace(
    /^\d{2,}-/,
    "",
  );
  if (publishedSlugs.has(slug)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/404", request.url));
}

export const config = { matcher: "/blog/:slug" };
