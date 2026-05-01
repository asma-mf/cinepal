import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxyFetch';

export async function GET(req: NextRequest) {
  return proxyRequest(req, '/movies/actor-search');
}
