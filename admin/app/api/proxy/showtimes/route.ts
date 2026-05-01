// Proxy: GET/POST /api/showtimes
import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxyFetch';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  return proxyRequest(req, `/showtimes${qs ? `?${qs}` : ''}`);
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/showtimes');
}
