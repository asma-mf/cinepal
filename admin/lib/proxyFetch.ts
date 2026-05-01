// Shared proxy helper: forwards requests from admin API routes to the backend with Clerk token
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function proxyRequest(
  req: NextRequest,
  backendPath: string,
  method?: string
): Promise<NextResponse> {
  const { getToken } = await auth();
  const token = await getToken();

  const resolvedMethod = method || req.method;
  const isBodyMethod = ['POST', 'PUT', 'PATCH'].includes(resolvedMethod);

  let body: BodyInit | undefined;
  let contentType: string | undefined;

  if (isBodyMethod) {
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('multipart/form-data')) {
      body = await req.formData() as unknown as BodyInit;
      // Let fetch set the boundary automatically by not setting content-type
    } else {
      body = await req.text();
      contentType = 'application/json';
    }
  }

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(contentType ? { 'Content-Type': contentType } : {}),
  };

  const res = await fetch(`${BASE}${backendPath}`, {
    method: resolvedMethod,
    headers,
    body,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
