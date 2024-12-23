import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(["/dashboard/:path*"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId }: { userId: string | null } = await auth()
  console.log("Request URL:", req.url);

  if (isProtectedRoute(req)) {
    console.log("Protected route:", req.url);
    if (!userId) {
      console.log("No user session, redirecting to landing page");
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/"],
};
