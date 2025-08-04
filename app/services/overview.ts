export async function getOverviewMetrics() {
  // Use full absolute URL on server, relative path on client
  const isServer = typeof window === 'undefined';
  const baseUrl = isServer
    ? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
    : '';
  const url = isServer ? `${baseUrl}/api/overview` : '/api/overview';
  console.log('Fetching overview from:', url);

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch overview metrics');
  }
  return response.json();
}
