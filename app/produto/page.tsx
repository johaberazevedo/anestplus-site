import ProdutoClient from "./ProdutoClient";

export const metadata = {
  title: "Produto — Anest+",
  description:
    "Conheça como o Anest+ funciona na rotina real do centro cirúrgico: perfil, ficha anestésica, evolução intraoperatória, protocolos, QR Code, scanner e ficha anestésica finalizada.",
};

export default function ProdutoPage() {
  return <ProdutoClient />;
}