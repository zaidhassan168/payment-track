import { API_URL } from "@/app/config/api";

export async function getOverviewMetrics() {
  const url = API_URL ? `${API_URL}/api/overview` : "/api/overview";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch overview metrics");
  }
  return response.json();
}
