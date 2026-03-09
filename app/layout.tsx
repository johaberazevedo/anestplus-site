import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default: "Anest+",
    template: "%s | Anest+",
  },
  description:
    "O Anest+ simplifica o registro anestésico com fluxo rápido, padronizado e ficha anestésica digital pronta para imprimir, exportar ou compartilhar.",
  metadataBase: new URL("https://anestplus.com"),

  openGraph: {
  type: "website",
  url: "https://anestplus.com",
  siteName: "Anest+",
  title: "Anest+ — Ficha anestésica digital, sem complicação",
  description:
    "Fluxo rápido, claro e padronizado para evoluir casos e finalizar a ficha anestésica com menos retrabalho e mais tranquilidade no centro cirúrgico.",
  locale: "pt_BR",
},

  twitter: {
  card: "summary_large_image",
  title: "Anest+ — Ficha anestésica digital, sem complicação",
  description:
    "Fluxo rápido, claro e padronizado para evoluir casos e finalizar a ficha anestésica com menos retrabalho e mais tranquilidade no centro cirúrgico.",
},

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        <Navbar />
        <main className="w-full px-4">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}