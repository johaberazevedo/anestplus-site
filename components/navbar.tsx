import Link from "next/link";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-zinc-700 hover:text-zinc-950 transition-colors"
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-zinc-950" />
          <span className="font-semibold tracking-tight">Anest+</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink href="/produto">Produto</NavLink>
          <NavLink href="/hospitais">Hospitais</NavLink>
          <NavLink href="/seguranca">Segurança</NavLink>
          <NavLink href="/contato">Contato</NavLink>
        </nav>

        <a
  href="https://apps.apple.com/br/app/anest/id6753714859"
  target="_blank"
  rel="noopener noreferrer"
  className="rounded-xl bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
>
  Baixar
</a>
      </div>
    </header>
  );
}