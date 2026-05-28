"use client";

import { useEffect, useState, useCallback } from "react";
import { hasPermission, type Permission } from "@/lib/permissions";

export type PanelUser = { name: string; email: string; role: string };

export function usePanelUser() {
  const [user, setUser] = useState<PanelUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const can = useCallback(
    (permission: Permission) => hasPermission(user?.role, permission),
    [user?.role]
  );

  return { user, can };
}
