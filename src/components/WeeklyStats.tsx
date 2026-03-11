import { useMemo } from "react";
import { motion } from "framer-motion";
import type { PunchRecord } from "@/hooks/usePunch";

interface WeeklyStatsProps {
  records: PunchRecord[];
  goalHours: number;
}

function getWeekDays() {
  const now = new Date();
  const day = now.getDay() || 7;
  const mon = new Date(now);
  mon.setDate(now.getDate() - day + 1);
  mon.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

const DAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];
const BAR_COLORS = [
  "bg-primary",
  "bg-primary/80",
  "bg-accent",
  "bg-primary/70",
  "bg-secondary/70",
  "bg-primary/60",
  "bg-secondary",
];

export default function WeeklyStats({ records, goalHours }: WeeklyStatsProps) {
  const weekDays = useMemo(() => getWeekDays(), []);

  const dailyHours = useMemo(() => {
    return weekDays.map((dayStart) => {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      let total = 0;
      records.forEach((r) => {
        const start = new Date(r.start_time);
        const end = r.end_time ? new Date(r.end_time) : new Date();
        if (start < dayEnd && end > dayStart) {
          const clampStart = Math.max(start.getTime(), dayStart.getTime());
          const clampEnd = Math.min(end.getTime(), dayEnd.getTime());
          total += (clampEnd - clampStart) / 3600000;
        }
      });
      return Math.round(total * 10) / 10;
    });
  }, [records, weekDays]);

  const weekAvg = useMemo(() => {
    const sum = dailyHours.reduce((a, b) => a + b, 0);
    const daysWithData = dailyHours.filter((h) => h > 0).length;
    return daysWithData > 0 ? (sum / daysWithData).toFixed(1) : "0";
  }, [dailyHours]);

  const maxH = Math.max(goalHours, ...dailyHours, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">本周概览</h3>
        <span className="text-xs font-semibold text-muted-foreground">
          周均 {weekAvg}h
        </span>
      </div>

      <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
        {dailyHours.map((h, i) => {
          const height = Math.max((h / maxH) * 100, 4);
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className={`w-full rounded-xl ${BAR_COLORS[i]} min-h-[4px]`}
              />
              <span className="text-[10px] font-semibold text-muted-foreground">
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
