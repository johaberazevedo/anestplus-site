import Link from "next/link";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-950"
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 transition-colors duration-300">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-950 text-xs font-semibold text-white">
            A+
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-950">
            Anest+
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink href="/produto">Produto</NavLink>
          <NavLink href="/hospitais">Hospitais</NavLink>
          <NavLink href="/seguranca">Segurança</NavLink>
          <NavLink href="/contato">Contato</NavLink>
        </nav>

        {/* CTA */}
        <a
          href="https://apps.apple.com/br/app/anest/id6753714859"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-2xl bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-zinc-800 hover:shadow-md"
        >
          Baixar
        </a>
      </div>
    </header>
  );
}