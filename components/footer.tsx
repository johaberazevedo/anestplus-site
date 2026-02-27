import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-zinc-950" />
            <span className="font-semibold tracking-tight">Anest+</span>
          </div>
          <p className="mt-3 text-sm text-zinc-600">
            Mais do que um registro digital — uma nova forma de documentar anestesia.
          </p>
        </div>

        <div className="text-sm">
          <p className="font-medium">Navegação</p>
          <div className="mt-3 grid gap-2 text-zinc-600">
            <Link className="hover:text-zinc-950" href="/produto">
              Produto
            </Link>
            <Link className="hover:text-zinc-950" href="/hospitais">
              Hospitais
            </Link>
            <Link className="hover:text-zinc-950" href="/seguranca">
              Segurança
            </Link>
            <Link className="hover:text-zinc-950" href="/contato">
              Contato
            </Link>
          </div>
        </div>

        <div className="text-sm">
          <p className="font-medium">Contato</p>
          <p className="mt-3 text-zinc-600">Suporte e parcerias.</p>
          <div className="mt-3 grid gap-2 text-zinc-600">
            <a className="hover:text-zinc-950" href="mailto:anestplus@outlook.com">
  anestplus@outlook.com
</a>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-8 text-xs text-zinc-500">
        © {new Date().getFullYear()} Anest+. Todos os direitos reservados.
      </div>
    </footer>
  );
}