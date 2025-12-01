/**
 * Health check endpoint for ECS container health checks
 * This endpoint should respond quickly without querying the database
 */
export async function GET() {
  return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
}
