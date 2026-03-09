import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm">
              <Image
                src="/brand/anest-symbol.png"
                alt="Símbolo do Anest+"
                width={36}
                height={36}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight text-zinc-950">
                Anest+
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                ficha anestésica digital
              </span>
            </div>
          </div>

          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-600">
            O registro anestésico, do jeito que a rotina pede.
          </p>

          <p className="mt-2 text-sm text-zinc-500">
            De anestesiologista, para anestesiologista.
          </p>
        </div>

        <div className="text-sm">
          <p className="text-sm font-semibold tracking-tight text-zinc-950">
            Navegação
          </p>

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
          <p className="text-sm font-semibold tracking-tight text-zinc-950">
            Contato
          </p>

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

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 border-t border-zinc-200/70 px-4 py-6 text-xs text-zinc-400 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Anest+. Todos os direitos reservados.</p>
        <p>Mais do que um registro digital — uma nova forma de documentar anestesia.</p>
      </div>
    </footer>
  );
}