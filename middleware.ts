import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard/:path*"]);
const isApiRoute = createRouteMatcher(['/(api|trpc)(.*)']);

// Define your custom API key here or fetch it from a secure location
const CUSTOM_API_KEY = process.env.CUSTOM_API_KEY || "my-custom-api-key";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const path = req.nextUrl.pathname;
  const response = NextResponse.next();

  // Set CORS headers for API routes
  if (isApiRoute(req)) {
    response.headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");

    // Handle preflight requests (OPTIONS method)
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: response.headers,
      });
    }
  }

  // Handle protected routes
  if (isProtectedRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Validate custom API key for API routes
  // if (isApiRoute(req)) {
  //   const apiKey = req.headers.get("x-api-key");
  //   if (!userId && (!apiKey || apiKey !== CUSTOM_API_KEY)) {
  //     return NextResponse.json(
  //       { error: "Unauthorized" },
  //       { status: 401 }
  //     );
  //   }
  // }

  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
