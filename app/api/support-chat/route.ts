import { NextResponse } from "next/server";
import { getSupportReply, type SupportFlow } from "@/lib/support-chat/matcher";

const SUPPORT_FLOWS: SupportFlow[] = [
  "idle",
  "anest_sync_awaiting_network",
  "anest_sync_awaiting_success_message",
  "anest_print_awaiting_hospital",
  "anest_print_awaiting_printer_visible",
  "anest_signature_awaiting_profile_check",
];

function parseSupportFlow(value: unknown): SupportFlow {
  return typeof value === "string" && SUPPORT_FLOWS.includes(value as SupportFlow)
    ? (value as SupportFlow)
    : "idle";
}

function parseCollected(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    )
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message : "";
    const area = body?.context?.area === "production" ? "production" : "general";
    const activeFlow = parseSupportFlow(body?.context?.activeFlow);
    const collected = parseCollected(body?.context?.collected);

    if (message.length > 1200) {
      return NextResponse.json(
        {
          error:
            "Mensagem muito longa. Envie uma descrição mais curta do problema.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(getSupportReply(message, { area, activeFlow, collected }));
  } catch {
    return NextResponse.json(
      {
        error:
          "Não foi possível processar a mensagem agora. Tente novamente em instantes.",
      },
      { status: 400 }
    );
  }
}
