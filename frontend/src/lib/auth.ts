import { isPanelRole, isFullAdmin, hasPermission, type Permission } from "./permissions";

export { isPanelRole, isFullAdmin, hasPermission, type Permission };

/** @deprecated Use isPanelRole — any staff panel role */
export function isAdminRole(role: string | undefined | null): boolean {
  return isFullAdmin(role);
}
