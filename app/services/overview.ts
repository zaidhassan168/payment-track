import { headers } from "next/headers";

export async function getOverviewMetrics() {
  const isServer = typeof window === "undefined";
  let url = "/api/overview";
  if (isServer) {
    // Use request headers to get the host for SSR/SSG/serverless
    const h = await headers();
    const host = h.get("host");
    const protocol = host && host.startsWith("localhost") ? "http" : "https";
    url = `${protocol}://${host}/api/overview`;
  }
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch overview metrics");
  }
  return response.json();
}
