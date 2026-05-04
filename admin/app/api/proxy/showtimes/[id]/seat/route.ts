import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxyFetch';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/showtimes/${id}/seat`, 'PATCH');
}
