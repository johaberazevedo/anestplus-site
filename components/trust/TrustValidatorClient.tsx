"use client";

import { useMemo, useState } from "react";
import {
  decodeTrustMarker,
  type DecodedTrustResult,
} from "@/lib/trust/decodeTrustMarker";
import { extractTrustMarker } from "@/lib/trust/extractTrustMarker";

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
  const preview = pdfText.slice(-2000);

  setState({
    status: "error",
    message: hasPrefix
      ? `Encontrei referência parcial a ANESTPLUS_TRUST, mas não consegui extrair um marcador completo.\n\nTrecho final extraído:\n${preview}`
      : `Não encontrei o marcador ANESTPLUS_TRUST no texto do PDF.\n\nTrecho final extraído:\n${preview}`,
  });
  return;
}

      const decoded = decodeTrustMarker(marker);

      setState({
        status: "success",
        fileName: file.name,
        marker,
        decoded,
        extractedTextPreview: pdfText.slice(0, 1600),
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Falha ao ler o PDF no navegador.";

      setState({ status: "error", message });
    }
  }

  return (
    <div className="grid gap-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800">
              Selecionar documento
            </label>
            <p className="mt-1 text-sm text-slate-500">
              PDF exportado pelo Anest+ com marcador Trust embutido.
            </p>
          </div>

          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
            PDF
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-5">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-3 file:text-sm file:font-medium file:text-white"
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          A leitura é feita no navegador e tenta localizar automaticamente o
          marcador Trust no texto pesquisável do PDF.
        </p>
      </div>

      {state.status === "idle" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Selecione um PDF exportado pelo Anest+ para tentar localizar o marcador Trust.
        </div>
      )}

            {state.status === "loading" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-slate-900" />
            <p className="text-sm font-medium text-slate-700">
              Lendo PDF e procurando marcador Trust...
            </p>
          </div>
        </div>
      )}

            {state.status === "error" && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-700">
            Falha na validação
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-red-700">
            {state.message}
          </p>
        </div>
      )}

      {state.status === "success" && (
        <>
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Documento identificado
            </p>
            <p className="mt-3 text-base font-semibold text-emerald-900">
              Marcador Trust encontrado
            </p>
            <p className="mt-2 break-all text-sm text-emerald-800">
              {state.fileName}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Resumo da assinatura
              </h2>

              {summary ? (
                <div className="mt-4 grid gap-3 text-sm">
                  <InfoRow
                    label="Schema"
                    value={String(summary.schemaVersion ?? "—")}
                  />
                  <InfoRow
                    label="Assinado em"
                    value={summary.signedAtISO8601 ?? "—"}
                  />
                  <InfoRow
                    label="Assinante"
                    value={summary.signer?.name ?? "—"}
                  />
                  <InfoRow label="CRM" value={summary.signer?.crm ?? "—"} />
                  <InfoRow label="RQE" value={summary.signer?.rqe ?? "—"} />
                  <InfoRow
                    label="Algoritmo"
                    value={summary.crypto?.algorithm ?? "—"}
                  />
                  <InfoRow
                    label="Payload hash"
                    value={summary.crypto?.payloadHashSHA256 ?? "—"}
                    mono
                  />
                  <InfoRow
                    label="Public key"
                    value={summary.crypto?.publicKeyBase64 ?? "—"}
                    mono
                  />
                  <InfoRow
                    label="Signature"
                    value={summary.crypto?.signatureBase64 ?? "—"}
                    mono
                  />
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600">
                  O marcador foi decodificado, mas o JSON esperado não foi encontrado.
                </p>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Marcador bruto
              </h2>
              <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap break-all rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
                {state.marker}
              </pre>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">
              JSON decodificado
            </h2>
            <pre className="mt-4 max-h-[560px] overflow-auto whitespace-pre-wrap break-all rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
              {JSON.stringify(state.decoded.payload, null, 2)}
            </pre>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">
              Prévia do texto extraído
            </h2>
            <pre className="mt-4 max-h-[320px] overflow-auto whitespace-pre-wrap break-all rounded-xl bg-slate-50 p-4 text-xs text-slate-700">
              {state.extractedTextPreview}
            </pre>
          </div>
        </>
      )}
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
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 break-all text-sm leading-6 text-slate-900 ${
          mono ? "font-mono text-[13px]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
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