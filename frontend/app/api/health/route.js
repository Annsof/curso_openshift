export const dynamic = 'force-dynamic';

// Liveness probe del frontend.
export async function GET() {
  return Response.json({ status: 'UP' });
}
