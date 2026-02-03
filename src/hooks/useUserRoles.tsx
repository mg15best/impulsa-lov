import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRolesResult {
  roles: AppRole[];
  loading: boolean;
  isAdmin: boolean;
  isTecnico: boolean;
  isAuditor: boolean;
  isIT: boolean;
  canWrite: boolean; // true for admin and tecnico
  canRead: boolean; // true for all authenticated users
}

export function useUserRoles(): UserRolesResult {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchRoles() {
      if (!user || !supabase) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching user roles:", error);
          setRoles([]);
        } else {
          setRoles(data?.map((r) => r.role) || []);
        }
      } catch (err) {
        console.error("Exception fetching user roles:", err);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRoles();
  }, [user]);

  const isAdmin = roles.includes("admin");
  const isTecnico = roles.includes("tecnico");
  const isAuditor = roles.includes("auditor");
  const isIT = roles.includes("it");
  const canWrite = isAdmin || isTecnico;
  const canRead = roles.length > 0; // All authenticated users with roles can read

  return {
    roles,
    loading,
    isAdmin,
    isTecnico,
    isAuditor,
    isIT,
    canWrite,
    canRead,
  };
}
