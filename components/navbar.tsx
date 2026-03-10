"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

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
      className="relative text-sm font-medium text-zinc-600 transition-colors duration-300 hover:text-zinc-950 after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-0 after:bg-[#b9963b] after:transition-all after:duration-300 hover:after:w-full"
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75"
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="group flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-sm"
          >
            <Image
              src="/brand/anest-symbol.png"
              alt="Símbolo do Anest+"
              width={36}
              height={36}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
              priority
            />
          </motion.div>

          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-zinc-950 transition-colors group-hover:text-[#7a865f]">
              Anest+
            </span>
            <span className="mt-1 hidden text-[10px] uppercase tracking-[0.16em] text-zinc-400 sm:block">
              Seu assistente pessoal em anestesiologia
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink href="/produto">Produto</NavLink>
          <NavLink href="/hospitais">Hospitais</NavLink>
          <NavLink href="/seguranca">Segurança</NavLink>
          <NavLink href="/contato">Contato</NavLink>
        </nav>

        <motion.a
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          href={APPSTORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-2xl bg-[#1a2718] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#22331d] hover:shadow-md hover:shadow-[#1a2718]/20"
        >
          Baixar o app
        </motion.a>
      </div>
    </motion.header>
  );
}