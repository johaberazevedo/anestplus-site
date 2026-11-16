import Link from "next/link";
import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/admin-auth";
import HospitalsClient from "./HospitalsClient";

export default async function HospitalsPage() {
  if (!(await hasValidAdminSession())) redirect("/admin/login");

  return (
    <main className="min-h-screen bg-[#f7f8f4] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black tracking-tight text-zinc-950">Hospitais</h1>
          <nav aria-label="Administração" className="mt-4 flex gap-4 text-sm font-bold">
            <Link href="/admin" className="text-[#566244] hover:underline">Residentes</Link>
            <span aria-current="page" className="text-zinc-950">Hospitais</span>
          </nav>
        </header>
        <HospitalsClient />
      </div>
    </main>
  );
}
