import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-xs font-semibold text-white">
              A+
            </div>
            <span className="font-semibold tracking-tight text-zinc-950">
              Anest+
            </span>
          </div>

          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-600">
            O registro anestésico, do jeito que a rotina pede.
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            De anestesiologista para anestesiologistas.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-medium text-zinc-950">Navegação</p>
          <div className="mt-3 grid gap-2 text-zinc-600">
            <Link className="transition-colors hover:text-zinc-950" href="/produto">
              Produto
            </Link>
            <Link className="transition-colors hover:text-zinc-950" href="/hospitais">
              Hospitais
            </Link>
            <Link className="transition-colors hover:text-zinc-950" href="/seguranca">
              Segurança
            </Link>
            <Link className="transition-colors hover:text-zinc-950" href="/contato">
              Contato
            </Link>
          </div>
        </div>

        <div className="text-sm">
          <p className="font-medium text-zinc-950">Contato</p>
          <p className="mt-3 text-zinc-600">Suporte, implantação e parcerias.</p>

          <div className="mt-3 grid gap-2 text-zinc-600">
            <a
              className="transition-colors hover:text-zinc-950"
              href="mailto:anestplus@outlook.com"
            >
              anestplus@outlook.com
            </a>
            <a
              className="transition-colors hover:text-zinc-950"
              href="https://wa.me/5571992288755"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 border-t border-zinc-200/70 px-4 py-6 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Anest+. Todos os direitos reservados.</p>
        <p>Mais do que um registro digital — uma nova forma de documentar anestesia.</p>
      </div>
    </footer>
  );
}