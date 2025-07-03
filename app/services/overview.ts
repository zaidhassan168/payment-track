export async function getOverviewMetrics() {
    const response = await fetch("http://localhost:3000/api/overview");
    if (!response.ok) {
      throw new Error("Failed to fetch overview metrics");
    }
    return response.json();
  }
  