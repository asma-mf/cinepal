// Proxy: PUT/DELETE /api/showtimes/:id
import { NextRequest } from 'next/server';
import { proxyRequest } from '@/lib/proxyFetch';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/showtimes/${id}`, 'GET');
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/showtimes/${id}`);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyRequest(req, `/showtimes/${id}`, 'DELETE');
}
