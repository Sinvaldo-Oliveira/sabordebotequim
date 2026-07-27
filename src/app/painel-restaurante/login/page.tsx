import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login do restaurante",
  robots: { index: false },
};

export default async function PainelLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirecionar?: string }>;
}) {
  const { redirecionar } = await searchParams;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md">
        <p className="mb-6 text-center font-display text-2xl text-secondary">
          Sabor <span className="text-primary">de</span> Botequim
        </p>
        <Card>
          <CardHeader>
            <CardTitle>Painel do restaurante</CardTitle>
            <p className="mt-1 text-sm text-muted">
              Entre com o acesso enviado pela organização do festival.
            </p>
          </CardHeader>
          <CardContent>
            <LoginForm area="restaurant" redirectTo={redirecionar} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
