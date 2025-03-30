// app/api/keepalive/route.js
import { db } from '@/lib/db';

export async function GET(req) {
  // Verify secret (replace with your own)
  if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  await db.$queryRaw`SELECT 1`; // Zero-cost query
  return Response.json({ success: true, timestamp: new Date() });
}