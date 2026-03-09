import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Segurança & Privacidade — Anest+",
  description:
    "Conheça as principais características de segurança documental, privacidade local e Trust Layer do Anest+.",
};

export default function SegurancaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}