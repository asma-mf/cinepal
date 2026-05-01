// Proxy: POST /api/upload (multipart form data)
import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxyFetch';

export async function POST(req: NextRequest) {
  return proxyRequest(req, '/upload');
}
