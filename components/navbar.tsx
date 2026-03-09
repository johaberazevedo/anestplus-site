import Link from "next/link";
import Image from "next/image";

const APPSTORE_URL = "https://apps.apple.com/br/app/anest/id6753714859";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
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
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center gap-3">
  <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm">
  <Image
    src="/brand/anest-symbol.png"
    alt="Símbolo do Anest+"
    width={36}
    height={36}
    className="h-full w-full object-contain"
    priority
  />
</div>

  <div className="flex flex-col leading-none">
    <span className="text-sm font-semibold tracking-tight text-zinc-950">
      Anest+
    </span>
    <span className="mt-1 hidden text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:block">
      ficha anestésica digital
    </span>
  </div>
</Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink href="/produto">Produto</NavLink>
          <NavLink href="/hospitais">Hospitais</NavLink>
          <NavLink href="/seguranca">Segurança</NavLink>
          <NavLink href="/contato">Contato</NavLink>
        </nav>

        <a
          href={APPSTORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-2xl bg-[#1a2718] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#22331d] hover:shadow-md"
        >
          Baixar o app
        </a>
      </div>
    </header>
  );
}