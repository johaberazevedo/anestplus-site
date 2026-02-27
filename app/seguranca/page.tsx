export const metadata = {
  title: "Segurança & Privacidade — Anest+",
  description:
    "Entenda os princípios de segurança e privacidade do Anest+.",
};
export default function SegurancaPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">
        Segurança & Privacidade
      </h1>

      <p className="mt-3 text-zinc-600 max-w-2xl">
        Transparência e previsibilidade são fundamentais em soluções médicas.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-medium">Uso responsável de dados</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Estrutura pensada para minimizar exposição desnecessária.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 p-6">
          <h2 className="font-medium">Exportação segura</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Relatórios gerados conforme a rotina institucional.
          </p>
        </div>
      </div>
    </div>
  );
}