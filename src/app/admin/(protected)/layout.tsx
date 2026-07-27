import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isAdminRole } from "@/lib/auth/roles";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

/**
 * Guarda de acesso da área administrativa: exige sessão válida com papel
 * administrativo (superadmin, admin, moderator ou analyst).
 */
export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();
  if (!profile || !isAdminRole(profile.role)) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="border-b border-line bg-surface">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <p className="font-display text-base text-secondary">
            Sabor de Botequim{" "}
            <span className="ml-2 rounded bg-secondary px-2 py-0.5 text-xs font-sans font-semibold text-white">
              Admin
            </span>
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">
              {profile.fullName ?? profile.email}
            </span>
            <SignOutButton area="admin" />
          </div>
        </div>
      </header>
      <AdminNav />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
