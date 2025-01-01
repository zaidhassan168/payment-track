import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(["/dashboard/:path*"]);
const isApiRoute = createRouteMatcher(['/(api|trpc)(.*)']);

// Define your custom API key here or fetch it from a secure location
const CUSTOM_API_KEY = process.env.CUSTOM_API_KEY || "my-custom-api-key";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  console.log("Request URL:", req.url);
  const path = req.nextUrl.pathname;
  console.log("Path:", path);

  // Check for the custom API key in the request headers
  const apiKey = req.headers.get('x-api-key');


  // if (path.startsWith("/api") && !userId) {
  // //     if (!apiKey || apiKey !== CUSTOM_API_KEY) {
  // //   return NextResponse.json(
  // //     { error: "Invalid API Key" },
  // //     { status: 403 } // Return a 403 status code for forbidden access
  // //   );
  // // }
  //   return NextResponse.json(
  //     { error: "Unauthorized" },
  //     { status: 401 } // Return a 401 status code
  //   );
  // }
  // if (isApiRoute(req)) await auth.protect();

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
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
