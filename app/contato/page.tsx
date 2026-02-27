export const metadata = {
  title: "Contato — Anest+",
  description:
    "Fale com a equipe do Anest+ por e-mail ou WhatsApp para suporte e propostas institucionais.",
};
export default function ContatoPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Contato</h1>
      <p className="mt-3 text-zinc-600 max-w-2xl">
        Suporte técnico, dúvidas e propostas institucionais.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium">E-mail</p>
          <p className="mt-2 text-zinc-700">
            <a className="underline" href="mailto:anestplus@outlook.com">
              anestplus@outlook.com
            </a>
          </p>
          <p className="mt-3 text-sm text-zinc-600">
            Ideal para suporte e solicitações formais.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium">WhatsApp</p>
          <p className="mt-2 text-zinc-700">
            <a
              className="underline"
              href="https://wa.me/5571992288755"
              target="_blank"
              rel="noopener noreferrer"
            >
              (71) 99228-8755
            </a>
          </p>
          <p className="mt-3 text-sm text-zinc-600">
            Mais rápido para implantação institucional e dúvidas.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-3xl border border-zinc-200/70 bg-zinc-50 p-6 md:p-8">
        <h2 className="text-xl font-semibold tracking-tight">
          Quer levar o Anest+ para o seu hospital?
        </h2>
        <p className="mt-2 text-zinc-600 max-w-2xl">
          Eu explico o modelo institucional, implantação e como padronizar o registro na sua unidade.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="https://wa.me/5571992288755"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
          >
            Falar no WhatsApp
          </a>

          <a
            href="https://apps.apple.com/br/app/anest/id6753714859"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors"
          >
            Ver na App Store
          </a>
        </div>
      </div>
    </div>
  );
}