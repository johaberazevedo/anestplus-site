import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Anest+",
    template: "%s | Anest+",
  },
  description:
    "O Anest+ fortalece a documentação anestésica com avaliação pré-anestésica, ficha anestésica digital, assinatura, validação e fluxos institucionais de produção e conferência.",
  metadataBase: new URL("https://anestplus.com"),
  openGraph: {
    type: "website",
    url: "https://anestplus.com",
    siteName: "Anest+",
    title: "Anest+ — Documentação anestésica com mais segurança e padronização",
    description:
      "Avaliação pré-anestésica, ficha anestésicaZ, assinatura, validação e fluxos institucionais para a rotina real da anestesia.",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anest+ — Documentação anestésica com mais segurança e padronização",
    description:
      "Avaliação pré-anestésica, ficha legível, assinatura, validação e fluxos institucionais para a rotina real da anestesia.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
