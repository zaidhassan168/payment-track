export async function getOverviewMetrics() {
  // Always use relative URL for internal API calls
  const url = '/api/overview';
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch overview metrics');
  }
  return response.json();
}
