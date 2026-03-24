import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Anest+",
    template: "%s | Anest+",
  },
  description:
    "O Anest+ fortalece o registro anestésico com ficha anestésica digital, mais segurança no preenchimento, padronização da equipe e um fluxo pensado para a rotina real do centro cirúrgico.",
  metadataBase: new URL("https://anestplus.com"),
  openGraph: {
    type: "website",
    url: "https://anestplus.com",
    siteName: "Anest+",
    title: "Anest+ — Ficha anestésica digital com mais segurança e padronização",
    description:
      "Mais segurança no registro anestésico, ficha legível, padronização da equipe e um fluxo pensado para a rotina real do centro cirúrgico.",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anest+ — Ficha anestésica digital com mais segurança e padronização",
    description:
      "Mais segurança no registro anestésico, ficha legível, padronização da equipe e um fluxo pensado para a rotina real do centro cirúrgico.",
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