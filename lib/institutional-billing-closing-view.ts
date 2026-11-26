import type { BillingCloseRequest, ClosingChoice } from "@/lib/institutional-billing-closing";

export type ClosingReceipt = {
  operationId: string;
  request: BillingCloseRequest;
  snapshotDigest: string;
  signature: string;
};

export type ClosingItemView = {
  userId: string;
  documentId: string;
  date: string | null;
  procedure: string | null;
  professional: string | null;
  recordNumber: string | null;
  originalPlan: string | null;
  appliedPlan: string | null;
  classification: string | null;
  classifications: { id: string; label: string }[];
  rule: string | null;
  startsOn: string | null;
  publicationVersion: number | null;
  amountCents: number | null;
  blocker: string | null;
  previous: { included: boolean; amountCents: string | null } | null;
  changed: boolean;
};

export type ClosingDraft = {
  kind: "review";
  state: "open" | "closed";
  month: string;
  ended: boolean;
  expiresAt: string | null;
  basis: { baseVersion: number; sourceRevision: number; configurationHash: string } | null;
  plans: string[];
  rows: ClosingItemView[];
  choices: ClosingChoice[];
  summary: { totalCents: string; included: number; excluded: number; pending: number };
  receipt: ClosingReceipt | null;
  rectification: { baseVersion: number; previousTotalCents: string; deltaCents: string; changed: number; reason: string } | null;
};

export type ClosingCompleted = {
  kind: "completed";
  state: "closed";
  month: string;
  version: number;
  totalCents: string | null;
  closedAt: string | null;
  closedBy: string | null;
  reason: string | null;
  recovered?: boolean;
};

export type ClosingView = ClosingDraft | ClosingCompleted;

export function closingItemKey(userId: string, documentId: string) {
  return `${userId}:${documentId}`;
}
