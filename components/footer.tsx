import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-[#FCFCFC]">
      {/* Reduzi o py-16 para py-10 e o gap principal de 12 para 8 */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:justify-between">
        
        {/* COLUNA 1: BRANDING */}
        <div className="md:max-w-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[8px] shadow-sm">
              <Image
                src="/brand/anest-symbol.png"
                alt="Símbolo do Anest+"
                width={36}
                height={36}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-base font-bold tracking-tight text-zinc-950">
                Anest+
              </span>
              <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a865f]">
                ficha anestésica
              </span>
            </div>
          </div>

          {/* Reduzi o mt-6 para mt-4 */}
          <p className="mt-4 text-sm leading-relaxed text-zinc-500">
            O registro anestésico, do jeito que a rotina pede.
          </p>

          <p className="mt-1 text-sm font-semibold text-zinc-400">
            De anestesiologista, para anestesiologista.
          </p>
        </div>

        {/* COLUNAS DE LINKS */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:gap-12">
          
          {/* NAVEGAÇÃO */}
          <div>
            <p className="text-sm font-bold tracking-tight text-zinc-950">
              Navegação
            </p>
            {/* Reduzi o space-y-4 para space-y-2.5 (os links ficam mais juntinhos) */}
            <ul className="mt-3 space-y-2.5 text-sm font-medium text-zinc-500">
              <li>
                <Link className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-[#b9963b]" href="/produto">
                  Produto
                </Link>
              </li>
              <li>
                <Link className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-[#b9963b]" href="/hospitais">
                  Hospitais
                </Link>
              </li>
              <li>
                <Link className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-[#b9963b]" href="/seguranca">
                  Segurança
                </Link>
              </li>
              <li>
                <Link className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-[#b9963b]" href="/contato">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* LEGAL E SUPORTE */}
          <div>
            <p className="text-sm font-bold tracking-tight text-zinc-950">
              Legal
            </p>
            <ul className="mt-3 space-y-2.5 text-sm font-medium text-zinc-500">
              <li>
                <Link className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-[#b9963b]" href="/suporte">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-[#b9963b]" href="/privacidade">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-[#b9963b]" href="/termos">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTATO */}
          <div>
            <p className="text-sm font-bold tracking-tight text-zinc-950">
              Fale Conosco
            </p>
            <ul className="mt-3 space-y-2.5 text-sm font-medium text-zinc-500">
              <li>
                <a
                  className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-[#b9963b]"
                  href="mailto:anestplus@outlook.com"
                >
                  E-mail
                </a>
              </li>
              <li>
                <a
                  className="inline-block transition-all duration-300 hover:translate-x-1 hover:text-[#b9963b]"
                  href="https://wa.me/5571992288755"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-zinc-200/70">
        {/* Reduzi o py-6 para py-4 */}
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-[12px] font-medium text-zinc-400">
            © {new Date().getFullYear()} Anest+. Todos os direitos reservados.
          </p>
          <p className="text-[12px] font-medium text-zinc-400">
            Mais segurança, clareza e padronização.
          </p>
        </div>
      </div>
    </footer>
  );
}