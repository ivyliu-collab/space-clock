import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStoredSpaceId, setStoredSpaceId, clearStoredSpaceId } from "@/lib/space";

export interface SpaceSchedule {
  goalStartTime: string;
  goalEndTime: string;
  overtimeStartTime: string;
}

export function useSpace() {
  const [spaceId, setSpaceId] = useState<string | null>(getStoredSpaceId());
  const [dailyGoal, setDailyGoal] = useState(8);
  const [schedule, setSchedule] = useState<SpaceSchedule>({ goalStartTime: "10:00", goalEndTime: "19:30", overtimeStartTime: "21:00" });
  const [loading, setLoading] = useState(false);

  const checkSpaceExists = useCallback(async (name: string): Promise<boolean> => {
    const { data } = await supabase
      .from("spaces")
      .select("space_id")
      .eq("space_id", name)
      .maybeSingle();
    return !!data;
  }, []);

  const enterSpace = useCallback(async (name: string, forceCreate = false) => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("spaces")
        .select("*")
        .eq("space_id", name)
        .maybeSingle();

      if (!data) {
        await supabase.from("spaces").insert({ space_id: name, daily_goal_hours: 8 });
      } else {
        setDailyGoal(Number(data.daily_goal_hours));
        setSchedule({
          goalStartTime: (data as any).goal_start_time ?? "10:00",
          goalEndTime: (data as any).goal_end_time ?? "19:30",
          overtimeStartTime: (data as any).overtime_start_time ?? "21:00",
        });
      }
      setStoredSpaceId(name);
      setSpaceId(name);
    } finally {
      setLoading(false);
    }
  }, []);

  const exitSpace = useCallback(() => {
    clearStoredSpaceId();
    setSpaceId(null);
  }, []);

  const updateGoal = useCallback(async (hours: number) => {
    if (!spaceId) return;
    setDailyGoal(hours);
    await supabase.from("spaces").update({ daily_goal_hours: hours }).eq("space_id", spaceId);
  }, [spaceId]);

  const updateSchedule = useCallback(async (s: SpaceSchedule) => {
    if (!spaceId) return;
    setSchedule(s);
    await supabase
      .from("spaces")
      .update({
        goal_start_time: s.goalStartTime,
        goal_end_time: s.goalEndTime,
      } as any)
      .eq("space_id", spaceId);
  }, [spaceId]);

  // Load on mount
  useEffect(() => {
    if (spaceId) {
      supabase.from("spaces").select("*").eq("space_id", spaceId).maybeSingle().then(({ data }) => {
        if (data) {
          setDailyGoal(Number(data.daily_goal_hours));
          setSchedule({
            goalStartTime: (data as any).goal_start_time ?? "10:00",
            goalEndTime: (data as any).goal_end_time ?? "19:30",
          });
        }
      });
    }
  }, [spaceId]);

  return { spaceId, dailyGoal, schedule, loading, enterSpace, exitSpace, updateGoal, updateSchedule, checkSpaceExists };
}
