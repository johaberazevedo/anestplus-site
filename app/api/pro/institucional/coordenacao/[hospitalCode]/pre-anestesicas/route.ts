import { institutionalPreCoordination } from "@/lib/pro-pre-anesthetic";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ hospitalCode: string }> }) {
  return institutionalPreCoordination(request, (await context.params).hospitalCode);
}
