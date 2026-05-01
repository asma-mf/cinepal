// Proxy: GET/POST /api/theatres
import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxyFetch';

export async function GET(req: NextRequest) {
  return proxyRequest(req, '/theatres');
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/theatres');
}
