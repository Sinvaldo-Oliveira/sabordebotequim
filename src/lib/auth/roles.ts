/** Papéis de acesso do sistema (armazenados em profiles.role). */
export type Role =
  | "superadmin"
  | "admin"
  | "moderator"
  | "analyst"
  | "restaurant";

/** Papéis com acesso à dashboard administrativa. */
export const ADMIN_ROLES: readonly Role[] = [
  "superadmin",
  "admin",
  "moderator",
  "analyst",
];

export function isAdminRole(role: string | null | undefined): boolean {
  return ADMIN_ROLES.includes(role as Role);
}

export function isRestaurantRole(role: string | null | undefined): boolean {
  return role === "restaurant";
}
