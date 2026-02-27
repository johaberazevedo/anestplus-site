export const metadata = {
  title: "Hospitais — Anest+",
  description:
    "Modelo institucional do Anest+ para padronização do registro e implantação por unidade.",
};
export default function HospitaisPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Hospitais</h1>

      <p className="mt-3 text-zinc-600 max-w-2xl">
        O modelo institucional do Anest+ permite padronização do registro,
        identidade visual do hospital e implantação orientada ao fluxo local.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-medium">Diagnóstico</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Avaliação do fluxo e necessidades da unidade.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-medium">Configuração</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Ajuste de layout, identidade e padrão institucional.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-medium">Implantação</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Treinamento rápido e acompanhamento inicial.
          </p>
        </div>
      </div>
    </div>
  );
}