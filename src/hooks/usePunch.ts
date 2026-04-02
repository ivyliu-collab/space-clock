import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PunchRecord {
  id: string;
  space_id: string;
  start_time: string;
  end_time: string | null;
  created_at: string;
}

/** Check if a date string is from a previous day */
function isPreviousDay(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() !== now.getFullYear() ||
    d.getMonth() !== now.getMonth() ||
    d.getDate() !== now.getDate()
  );
}

/** Get 23:59:59 of the same day as the given date */
function endOfDay(iso: string): string {
  const d = new Date(iso);
  d.setHours(23, 59, 59, 0);
  return d.toISOString();
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

    // Auto-close any active punch from a previous day
    for (const r of recs) {
      if (!r.end_time && isPreviousDay(r.start_time)) {
        const autoEnd = endOfDay(r.start_time);
        await supabase
          .from("punch_records")
          .update({ end_time: autoEnd })
          .eq("id", r.id);
        r.end_time = autoEnd;
      }
    }

    setRecords(recs);
    const active = recs.find((r) => !r.end_time);
    setActivePunch(active || null);
  }, [spaceId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Midnight auto-close: check every minute
  useEffect(() => {
    if (!activePunch) return;
    const check = () => {
      if (isPreviousDay(activePunch.start_time)) {
        fetchRecords();
      }
    };
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [activePunch, fetchRecords]);

  /** Check if there's already a record for today */
  const getTodayRecord = useCallback((): PunchRecord | null => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return records.find((r) => {
      const d = new Date(r.start_time);
      const rStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return rStr === todayStr && !!r.end_time; // only completed records count
    }) || null;
  }, [records]);

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

  /** Delete old record and start fresh */
  const replaceAndStart = useCallback(async (oldId: string) => {
    if (!spaceId) return;
    setLoading(true);
    await supabase.from("punch_records").delete().eq("id", oldId);
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

  /** Continue from old record's start time */
  const continueFromOld = useCallback(async (oldId: string) => {
    if (!spaceId) return;
    setLoading(true);
    // Re-open the old record by clearing its end_time
    await supabase
      .from("punch_records")
      .update({ end_time: null })
      .eq("id", oldId);
    await fetchRecords();
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

  const deletePunch = useCallback(async (id: string) => {
    await supabase.from("punch_records").delete().eq("id", id);
    await fetchRecords();
  }, [fetchRecords]);

  const updatePunchTime = useCallback(async (id: string, field: "start_time" | "end_time", value: string) => {
    await supabase
      .from("punch_records")
      .update({ [field]: value })
      .eq("id", id);
    await fetchRecords();
  }, [fetchRecords]);

  const addManualPunch = useCallback(async (startTime: string, endTime: string) => {
    if (!spaceId) return;
    await supabase
      .from("punch_records")
      .insert({ space_id: spaceId, start_time: startTime, end_time: endTime });
    await fetchRecords();
  }, [spaceId, fetchRecords]);

  return { records, activePunch, loading, startPunch, endPunch, fetchRecords, deletePunch, updatePunchTime, addManualPunch };
}
