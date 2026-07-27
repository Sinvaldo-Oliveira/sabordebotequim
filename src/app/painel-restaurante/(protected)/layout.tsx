import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isRestaurantRole } from "@/lib/auth/roles";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { RestaurantSidebar } from "@/components/painel/restaurant-sidebar";

/** Guarda de acesso do painel do restaurante: exige papel "restaurant". */
export default async function PainelRestauranteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();
  if (!profile || !isRestaurantRole(profile.role)) {
    redirect("/painel-restaurante/login");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="border-b border-line bg-surface">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <p className="font-display text-base text-secondary">
            Sabor de Botequim{" "}
            <span className="ml-2 rounded bg-leaf px-2 py-0.5 text-xs font-sans font-semibold text-white">
              Painel do restaurante
            </span>
          </p>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">
              {profile.fullName ?? profile.email}
            </span>
            <SignOutButton area="restaurant" />
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <RestaurantSidebar />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
