// Proxy: GET /api/movies and POST /api/movies
import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxyFetch';

export async function GET(req: NextRequest) {
  return proxyRequest(req, '/movies');
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/movies');
}
