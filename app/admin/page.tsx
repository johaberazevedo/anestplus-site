import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/admin-auth";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }

  return <AdminDashboardClient />;
}
