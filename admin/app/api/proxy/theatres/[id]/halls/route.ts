// Proxy: POST /api/theatres/:id/halls
import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxyFetch';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/theatres/${id}/halls`);
}
