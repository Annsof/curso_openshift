export const dynamic = 'force-dynamic';

// Readiness probe del frontend.
export async function GET() {
  return Response.json({ status: 'READY' });
}
