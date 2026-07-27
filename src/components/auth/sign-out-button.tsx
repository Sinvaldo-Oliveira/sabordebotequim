import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function SignOutButton({ area }: { area: "admin" | "restaurant" }) {
  return (
    <form action={signOut.bind(null, area)}>
      <Button type="submit" variant="ghost" size="sm">
        <LogOut />
        Sair
      </Button>
    </form>
  );
}
