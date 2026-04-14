"use client";

import { useMemo, useState } from "react";
import {
  decodeTrustMarker,
  type DecodedTrustResult,
} from "@/lib/trust/decodeTrustMarker";
import { extractTrustMarker } from "@/lib/trust/extractTrustMarker";
import {
  verifyTrustSignature,
  type TrustVerificationResult,
} from "@/lib/trust/verifyTrustSignature";

type ValidationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "success";
      fileName: string;
      marker: string;
      decoded: DecodedTrustResult;
      extractedTextPreview: string;
      verification: TrustVerificationResult;
    };

export default function TrustValidatorClient() {
  const [state, setState] = useState<ValidationState>({ status: "idle" });

  const summary = useMemo(() => {
    if (state.status !== "success") return null;
    return state.decoded.payload?.anestplusTrust ?? null;
  }, [state]);

  async function handleFileChange(file: File | null) {
    if (!file) return;

    setState({ status: "loading" });

    try {
      const pdfText = await extractPdfText(file);
      const marker = extractTrustMarker(pdfText);

      if (!marker) {
        const hasPrefix = pdfText.includes("ANESTPLUS_TRUST");
        const preview = pdfText.slice(-1200).trim();
        const technicalPreview = preview || "Nenhum trecho extraído.";

        setState({
          status: "error",
          message: hasPrefix
            ? `Foi identificada uma referência parcial ao marcador ANESTPLUS_TRUST, mas não foi possível reconstruir um marcador válido para validação.\n\nTrecho técnico extraído:\n${technicalPreview}`
            : `Não foi possível localizar um marcador ANESTPLUS_TRUST válido no texto pesquisável deste PDF.\n\nTrecho técnico extraído:\n${technicalPreview}`,
        });
        return;
      }

      const decoded = decodeTrustMarker(marker);
      const verification = await verifyTrustSignature(decoded.payload);

      if (!verification.overallValid) {
        setState({
          status: "error",
          message: [
            "O marcador Trust foi encontrado e decodificado, mas a validação criptográfica falhou.",
            "",
            ...verification.errors,
          ].join("\n"),
        });
        return;
      }

      setState({
        status: "success",
        fileName: file.name,
        marker,
        decoded,
        extractedTextPreview: pdfText.slice(0, 1600),
        verification,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Falha ao ler o PDF no navegador.";

      setState({ status: "error", message });
    }
  }

  function handleReset() {
    setState({ status: "idle" });
  }

  return (
    <div className="grid gap-6">
      {state.status === "idle" && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-blue-400 hover:bg-blue-50/50">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          />
          <div className="pointer-events-none flex flex-col items-center justify-center p-10 text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-900">
              Clique ou arraste um documento PDF
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Para iniciar a verificação de autenticidade e autoria
            </p>
          </div>
        </div>
      )}

      {state.status === "loading" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="mt-4 text-sm font-medium text-slate-700">
            Lendo PDF e analisando integridade criptográfica...
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-red-800">
                Falha na validação
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-700">
                {state.message}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              Validar outro documento
            </button>
          </div>
        </div>
      )}

      {state.status === "success" && summary && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">
                  Autenticidade Confirmada
                </p>
              </div>
              <p className="mt-2 text-sm text-emerald-800">
                O documento{" "}
                <span className="font-semibold">{state.fileName}</span> teve o
                marcador Trust decodificado, o hash do payload confirmado e a
                assinatura digital validada com a chave pública embutida.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="shrink-0 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:bg-emerald-100"
            >
              Nova Validação
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Resultado criptográfico
              </h2>
            </div>

            <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
              <InfoCell
                label="Hash do payload"
                value={state.verification.hashMatches ? "Confere" : "Divergente"}
              />
              <InfoCell
                label="Assinatura ECDSA"
                value={
                  state.verification.signatureValid ? "Válida" : "Inválida"
                }
              />
              <InfoCell
                label="JSON Trust"
                value={
                  state.verification.jsonDecoded ? "Decodificado" : "Falhou"
                }
              />
              <InfoCell
                label="Resultado final"
                value={
                  state.verification.overallValid
                    ? "Documento válido"
                    : "Documento inválido"
                }
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-900 px-6 py-4">
              <svg
                className="h-4 w-4 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.957 11.957 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <h2 className="text-sm font-semibold text-white">
                Certificado do Signatário
              </h2>
            </div>

            <div className="grid gap-px bg-slate-100 sm:grid-cols-2">
              <InfoCell
                label="Profissional Responsável"
                value={summary.signer?.name ?? "—"}
              />
              <InfoCell
                label="Conselho (CRM)"
                value={summary.signer?.crm ?? "—"}
              />
              <InfoCell
                label="Especialidade (RQE)"
                value={summary.signer?.rqe ?? "—"}
              />
              <InfoCell
                label="Data e Hora da Assinatura"
                value={
                  summary.signedAtISO8601
                    ? new Date(summary.signedAtISO8601).toLocaleString("pt-BR")
                    : "—"
                }
              />
            </div>
          </div>

<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
  <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-6 py-4">
    <h2 className="text-sm font-semibold text-slate-900">
      Contexto da assinatura
    </h2>
  </div>

  <div
  className={`grid gap-px bg-slate-100 ${
    summary.authContext?.signerUserId ? "sm:grid-cols-2" : "sm:grid-cols-3"
  }`}
>
  <InfoCell
    label="Método de autenticação"
    value={friendlyAuthMethod(summary.authContext?.authMethod)}
  />
  <InfoCell
    label="Origem da assinatura"
    value={friendlySignatureProvider(summary.authContext?.signatureProvider)}
  />
  <InfoCell
    label="Modo do dispositivo"
    value={friendlyDeviceMode(summary.authContext?.deviceMode)}
  />

  {summary.authContext?.signerUserId ? (
    <InfoCell
      label="Identificador interno do profissional"
      value={summary.authContext.signerUserId}
    />
  ) : null}
</div>
</div>

          <details className="group rounded-3xl border border-slate-200 bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 rounded-3xl">
              <span>Dados Técnicos para Auditoria (Logs, Hashes e JSON)</span>
              <span className="transition duration-300 group-open:-rotate-180 text-slate-400">
                <svg
                  fill="none"
                  height="24"
                  shapeRendering="geometricPrecision"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M6 9l6 6 6-6"></path>
                </svg>
              </span>
            </summary>

            <div className="border-t border-slate-200 p-6 space-y-8">
              <div>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Trust Layer Criptográfica
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow
                    label="Algoritmo"
                    value={summary.crypto?.algorithm ?? "—"}
                    mono
                  />
                  <InfoRow
                    label="Versão do Schema"
                    value={String(summary.schemaVersion ?? "—")}
                    mono
                  />
                  <InfoRow
                    label="Payload Hash (SHA-256)"
                    value={summary.crypto?.payloadHashSHA256 ?? "—"}
                    mono
                  />
                  <InfoRow
                    label="Chave Pública (Base64)"
                    value={summary.crypto?.publicKeyBase64 ?? "—"}
                    mono
                  />
                  <div className="sm:col-span-2">
                    <InfoRow
                      label="Assinatura Digital (Signature)"
                      value={summary.crypto?.signatureBase64 ?? "—"}
                      mono
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <details className="rounded-xl border border-slate-200">
                  <summary className="cursor-pointer bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl">
                    Visualizar JSON Decodificado
                  </summary>
                  <div className="p-4 border-t border-slate-200">
                    <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-900 p-4 text-[11px] text-cyan-400">
                      {JSON.stringify(state.decoded.payload, null, 2)}
                    </pre>
                  </div>
                </details>

                <details className="rounded-xl border border-slate-200">
                  <summary className="cursor-pointer bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl">
                    Visualizar Marcador Bruto
                  </summary>
                  <div className="p-4 border-t border-slate-200">
                    <pre className="max-h-[300px] overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-50 p-4 text-[11px] text-slate-600">
                      {state.marker}
                    </pre>
                  </div>
                </details>

                <details className="rounded-xl border border-slate-200">
                  <summary className="cursor-pointer bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl">
                    Prévia do Texto Extraído do PDF
                  </summary>
                  <div className="p-4 border-t border-slate-200">
                    <pre className="max-h-[300px] overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-50 p-4 text-[11px] text-slate-600">
                      {state.extractedTextPreview}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-2 break-all text-sm leading-6 text-slate-900 ${
          mono ? "font-mono text-[11px] text-slate-700" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function friendlyAuthMethod(value?: string): string {
  switch (value) {
    case "face_id":
      return "Face ID";
    case "touch_id":
      return "Touch ID";
    case "institutional_pin":
  return "PIN individual do profissional";
    case "biometric":
      return "Biometria";
    default:
      return value ?? "—";
  }
}

function friendlySignatureProvider(value?: string): string {
  switch (value) {
    case "secure_enclave_biometrics":
      return "Secure Enclave + biometria";
    case "institutional_pin_key":
  return "Chave institucional vinculada ao profissional";
    default:
      return value ?? "—";
  }
}

function friendlyDeviceMode(value?: string): string {
  switch (value) {
    case "personal_ios":
      return "iPhone pessoal";
    case "institutional_ipad":
      return "iPad institucional";
    default:
      return value ?? "—";
  }
}

async function loadPdfJsFromCdn() {
  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-pdfjs-cdn="true"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Falha ao carregar leitor de PDF.")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.dataset.pdfjsCdn = "true";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Falha ao carregar leitor de PDF."));
    document.head.appendChild(script);
  });

  const pdfjsLib = (window as any).pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  return pdfjsLib;
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await loadPdfJsFromCdn();

  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);

  const loadingTask = pdfjsLib.getDocument({ data: uint8 });
  const pdf = await loadingTask.promise;

  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");

    pages.push(pageText);
  }

  return pages.join("\n");
}