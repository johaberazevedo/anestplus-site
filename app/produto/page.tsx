export const metadata = {
  title: "Produto — Anest+",
  description:
    "Conheça os recursos do Anest+: ficha rápida, evolução prática, prescrição estruturada e exportação em PDF.",
};
export default function ProdutoPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Produto</h1>
      <p className="mt-3 text-zinc-600 max-w-2xl">
        O Anest+ foi desenvolvido para simplificar o registro anestésico,
        reduzir retrabalho e trazer mais clareza durante o plantão.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-medium">Criação rápida de ficha</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Campos essenciais organizados para preenchimento direto e objetivo.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-medium">Linha do tempo prática</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Atualização simples dos parâmetros durante todo o intraoperatório.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-medium">Prescrição estruturada</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Organização clara de dose e via, facilitando revisão posterior.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-medium">Exportação em PDF</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Relatório pronto para arquivamento ou impressão.
          </p>
        </div>
      </div>
    </div>
  );
}