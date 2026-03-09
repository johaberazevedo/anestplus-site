import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato — Anest+",
  description:
    "Fale com o Anest+ para suporte, dúvidas sobre o app, demonstração e propostas institucionais.",
};

export default function ContatoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}