// Shared API helper for admin server components and actions
import { auth } from '@clerk/nextjs/server';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function adminFetch(path: string, options: RequestInit = {}) {
  const { getToken } = await auth();
  const token = await getToken();

  console.log(`[adminFetch] fetching ${BASE}${path}`);
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[adminFetch] error on ${path}: ${res.status} ${body}`);
    throw new Error(`API ${path} failed: ${res.status} ${body}`);
  }

  return res.json();
}
