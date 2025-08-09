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
  console.log("Fetching overview metrics from:", url);
  try {
    const response = await fetch(url, { cache: "no-store" });
    console.log("Overview metrics fetch status:", response.status);
    if (!response.ok) {
      const text = await response.text();
      console.error("Overview metrics fetch error body:", text);
      throw new Error("Failed to fetch overview metrics");
    }
    return response.json();
  } catch (err) {
    console.error("Overview metrics fetch exception:", err);
    throw err;
  }
}
