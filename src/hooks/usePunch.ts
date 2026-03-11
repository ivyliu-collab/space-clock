import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PunchRecord {
  id: string;
  space_id: string;
  start_time: string;
  end_time: string | null;
  created_at: string;
}

export function usePunch(spaceId: string | null) {
  const [records, setRecords] = useState<PunchRecord[]>([]);
  const [activePunch, setActivePunch] = useState<PunchRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    if (!spaceId) return;
    const { data } = await supabase
      .from("punch_records")
      .select("*")
      .eq("space_id", spaceId)
      .order("start_time", { ascending: false });
    
    const recs = (data || []) as PunchRecord[];
    setRecords(recs);
    const active = recs.find((r) => !r.end_time);
    setActivePunch(active || null);
  }, [spaceId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const startPunch = useCallback(async () => {
    if (!spaceId) return;
    setLoading(true);
    const { data } = await supabase
      .from("punch_records")
      .insert({ space_id: spaceId })
      .select()
      .single();
    if (data) {
      setActivePunch(data as PunchRecord);
      await fetchRecords();
    }
    setLoading(false);
  }, [spaceId, fetchRecords]);

  const endPunch = useCallback(async () => {
    if (!activePunch) return;
    setLoading(true);
    await supabase
      .from("punch_records")
      .update({ end_time: new Date().toISOString() })
      .eq("id", activePunch.id);
    setActivePunch(null);
    await fetchRecords();
    setLoading(false);
  }, [activePunch, fetchRecords]);

  return { records, activePunch, loading, startPunch, endPunch, fetchRecords };
}
