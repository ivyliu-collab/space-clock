import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LeaveRecord {
  id: string;
  space_id: string;
  leave_date: string;
  leave_type: "morning" | "afternoon" | "full";
  credit_hours: number;
  created_at: string;
}

const CREDIT_MAP = { morning: 4.5, afternoon: 6.5, full: 9.5 } as const;

export function useLeave(spaceId: string | null) {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);

  const fetchLeaves = useCallback(async () => {
    if (!spaceId) return;
    const { data } = await supabase
      .from("leave_records")
      .select("*")
      .eq("space_id", spaceId)
      .order("leave_date", { ascending: false });
    setLeaves((data || []) as LeaveRecord[]);
  }, [spaceId]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const addLeave = useCallback(
    async (date: string, type: "morning" | "afternoon" | "full") => {
      if (!spaceId) return;
      await supabase.from("leave_records").insert({
        space_id: spaceId,
        leave_date: date,
        leave_type: type,
        credit_hours: CREDIT_MAP[type],
      });
      await fetchLeaves();
    },
    [spaceId, fetchLeaves]
  );

  const deleteLeave = useCallback(
    async (id: string) => {
      await supabase.from("leave_records").delete().eq("id", id);
      await fetchLeaves();
    },
    [fetchLeaves]
  );

  return { leaves, addLeave, deleteLeave, fetchLeaves };
}
