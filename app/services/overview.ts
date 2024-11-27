export async function getOverviewMetrics() {
    const response = await fetch("/api/overview");
    if (!response.ok) {
      throw new Error("Failed to fetch overview metrics");
    }
    return response.json();
  }
  