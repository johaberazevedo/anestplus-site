import { institutionalPreOwner } from "@/lib/pro-pre-anesthetic";
export const runtime = "nodejs";
async function handler(request: Request, context: { params: Promise<{ operation: string }> }) {
  return institutionalPreOwner(request, (await context.params).operation);
}
export const GET = handler;
export const POST = handler;
