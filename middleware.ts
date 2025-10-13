import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const response = NextResponse.next();
  const path = req.nextUrl.pathname;

  // Set CORS headers for API routes
  if (path.startsWith("/api") || path.startsWith("/trpc")) {
    response.headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-api-key"
    );

    // Handle preflight requests (OPTIONS method)
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: response.headers,
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
