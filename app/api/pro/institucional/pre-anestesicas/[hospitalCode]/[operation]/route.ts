import { institutionalPreUpload } from "@/lib/pro-pre-anesthetic";
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ hospitalCode: string; operation: string }> }) {
  const { hospitalCode, operation } = await context.params;
  return institutionalPreUpload(request, hospitalCode, operation);
}
