"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  hospitalCode: string;
  hospital?: { code: string; name: string };
};

export default function HospitalIdentity(props: Props) {
  return <Identity key={props.hospitalCode} {...props} />;
}

function Identity({ hospitalCode, hospital }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const current = useRef<{ url: string; version: string } | null>(null);

  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    function clear() {
      if (current.current) URL.revokeObjectURL(current.current.url);
      current.current = null;
      setImage(null);
    }
    async function load() {
      try {
        const params = new URLSearchParams({ hospitalCode, metadata: "1" });
        const metadata = await fetch(`/api/pro/institucional/hospital-logo?${params}`, {
          signal: controller.signal, cache: "no-store", credentials: "omit",
        });
        if (disposed) return;
        if (metadata.status === 204 || metadata.status === 404) { clear(); return; }
        if (!metadata.ok) throw new Error("Logo indisponível");
        const data: unknown = await metadata.json();
        if (disposed) return;
        const version = data && typeof data === "object" && "version" in data ? data.version : null;
        if (typeof version !== "string" || !/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(version)) {
          throw new Error("Versão inválida");
        }
        if (version.toLowerCase() === current.current?.version) return;
        const imageParams = new URLSearchParams({ hospitalCode, version: version.toLowerCase() });
        // A imagem tem URL própria e imutável, sem herdar o no-store de um redirecionamento.
        const response = await fetch(`/api/pro/institucional/hospital-logo?${imageParams}`, {
          signal: controller.signal, cache: "force-cache", credentials: "omit",
        });
        if (disposed) return;
        if (response.status === 204 || response.status === 404) { clear(); return; }
        if (!response.ok || response.headers.get("content-type")?.split(";")[0] !== "image/png") {
          throw new Error("Logo indisponível");
        }
        const blob = await response.blob();
        if (disposed) return;
        if (!blob.size || blob.size > 2 * 1024 * 1024) throw new Error("Logo inválida");
        const url = URL.createObjectURL(blob);
        if (current.current) URL.revokeObjectURL(current.current.url);
        current.current = { url, version: version.toLowerCase() };
        setImage(url);
      } catch {
        if (!disposed) clear();
      }
    }
    // A logo permanece nesta visita ao painel; só uma nova entrada consulta a versão.
    void load();
    return () => {
      disposed = true;
      controller.abort();
    };
  }, [hospitalCode]);

  useEffect(() => () => {
    if (current.current) URL.revokeObjectURL(current.current.url);
    current.current = null;
  }, []);

  // O PNG público pode aparecer enquanto a lista autorizada ainda carrega o nome.
  if ((hospital && hospital.code !== hospitalCode) || (!hospital && !image)) return null;

  return <div className="flex min-w-0 flex-wrap items-center gap-4">
    {image && <div className="flex h-20 w-44 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white p-3">
      {/* O PNG público é carregado diretamente pela URL da versão. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={hospital ? `Logo de ${hospital.name}` : "Logo do hospital"} className="max-h-full max-w-full object-contain" onError={() => {
        if (current.current) URL.revokeObjectURL(current.current.url);
        current.current = null;
        setImage(null);
      }} />
    </div>}
    {hospital && <p className="min-w-0 break-words text-lg font-bold tracking-tight text-[#1a2718]">{hospital.name}</p>}
  </div>;
}
