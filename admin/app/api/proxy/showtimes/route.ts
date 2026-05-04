// Proxy: GET/POST /api/showtimes
import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxyFetch';

export async function GET(req: NextRequest) {
  return proxyRequest(req, '/showtimes');
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/showtimes');
}
