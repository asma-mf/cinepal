import { NextResponse } from 'next/server';
import { collectDefaultMetrics, Registry } from 'prom-client';

// We must store the registry in the global object in development
// to avoid recreating it on every hot reload.
const globalForPrometheus = globalThis as unknown as {
  promRegistry: Registry;
};

let registry: Registry;

if (!globalForPrometheus.promRegistry) {
  registry = new Registry();
  globalForPrometheus.promRegistry = registry;
  // Collect default metrics (CPU, Memory, Event Loop Lag, etc.)
  collectDefaultMetrics({ register: registry, prefix: 'cinepal_frontend_' });
} else {
  registry = globalForPrometheus.promRegistry;
}

export const dynamic = 'force-dynamic'; // Ensure Next.js doesn't cache this route

export async function GET() {
  try {
    const metrics = await registry.metrics();
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': registry.contentType,
      },
    });
  } catch (error) {
    console.error('Error generating metrics', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
