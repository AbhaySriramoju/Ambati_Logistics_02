import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isMounted) setRole("customer");
        return;
      }
      const { data: staffData } = await supabase
        .from("staff")
        .select("role")
        .eq("user_id", user.id)
        .single();
      if (staffData && staffData.role) {
        if (isMounted) setRole(staffData.role.toLowerCase());
      } else {
        if (isMounted) setRole("customer");
      }
    }
    fetchRole();
    return () => {
      isMounted = false;
    };
  }, []);

  return role;
}
