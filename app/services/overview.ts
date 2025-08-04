export async function getOverviewMetrics() {
  const isServer = typeof window === "undefined";
  let url = "/api/overview";
  if (isServer) {
    // Use absolute URL on server
    const base =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
    url = `${base}/api/overview`;
  }
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch overview metrics");
  }
  return response.json();
}
