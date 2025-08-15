// Central API URL config for client-side fetches
// For client-side requests, use relative URLs to avoid scheme issues
// For server-side requests, use the full URL
export const API_URL = typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    : '';
