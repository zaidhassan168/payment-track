import { API_URL } from "@/app/config/api";

export async function getOverviewMetrics() {
  // Use full URL for server-side requests, relative for client-side
  const url = API_URL ? `${API_URL}/api/overview` : "/api/overview";
  console.log('Fetching overview from:', url);

  const response = await fetch(url, {
    // Add cache configuration for server-side rendering
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error("Failed to fetch overview metrics");
  }
  return response.json();
}

//abc
