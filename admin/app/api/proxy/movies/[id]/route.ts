// Proxy: GET/PUT/DELETE /api/movies/:id
import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxyFetch';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/movies/${id}`);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/movies/${id}`);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/movies/${id}`, 'DELETE');
}
