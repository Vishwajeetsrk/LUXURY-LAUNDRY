"use client";

import { useEffect, useState, useCallback } from "react";
import { hasPermission, type Permission } from "@/lib/permissions";
import { buildApiUrl } from "@/lib/api";

export type PanelUser = { name: string; email: string; role: string };

export function usePanelUser() {
  const [user, setUser] = useState<PanelUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPanelUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          return;
        }

        const res = await fetch(buildApiUrl("/api/auth/me"), {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Unable to verify user");

        const verifiedUser = await res.json();
        const panelUser = {
          name: verifiedUser.name,
          email: verifiedUser.email,
          role: verifiedUser.role,
        };
        localStorage.setItem("user", JSON.stringify(panelUser));
        if (!cancelled) setUser(panelUser);
      } catch {
        localStorage.removeItem("user");
        setUser(null);
      }
    };

    loadPanelUser();
    return () => {
      cancelled = true;
    };
  }, []);

  const can = useCallback(
    (permission: Permission) => hasPermission(user?.role, permission),
    [user?.role]
  );

  return { user, can };
}
