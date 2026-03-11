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

/* Cute sleeping cat SVG for empty state */
function SleepingCat() {
  return (
    <svg viewBox="0 0 120 80" className="mx-auto h-20 w-20 opacity-60" fill="none">
      {/* body */}
      <ellipse cx="60" cy="58" rx="35" ry="18" fill="hsl(var(--muted))" />
      {/* head */}
      <circle cx="60" cy="38" r="18" fill="hsl(var(--muted))" />
      {/* ears */}
      <polygon points="46,24 42,10 54,22" fill="hsl(var(--muted-foreground) / 0.3)" />
      <polygon points="74,24 78,10 66,22" fill="hsl(var(--muted-foreground) / 0.3)" />
      {/* closed eyes */}
      <path d="M51 36 Q54 39 57 36" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M63 36 Q66 39 69 36" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* mouth */}
      <path d="M57 42 Q60 44 63 42" stroke="hsl(var(--muted-foreground))" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* tail */}
      <path d="M95 58 Q105 45 98 38" stroke="hsl(var(--muted))" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* zzz */}
      <text x="82" y="20" fontSize="10" fill="hsl(var(--muted-foreground) / 0.5)" fontWeight="bold">z</text>
      <text x="90" y="14" fontSize="8" fill="hsl(var(--muted-foreground) / 0.4)" fontWeight="bold">z</text>
      <text x="96" y="9" fontSize="6" fill="hsl(var(--muted-foreground) / 0.3)" fontWeight="bold">z</text>
    </svg>
  );
}

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

  const hasData = dailyHours.some((h) => h > 0);
  const maxH = Math.max(goalHours, ...dailyHours, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6 card-hover"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">本周概览</h3>
        <span className="text-xs font-semibold text-muted-foreground">
          周均 {weekAvg}h
        </span>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <SleepingCat />
          <p className="text-sm font-semibold text-muted-foreground">本周还没开始努力哦~</p>
        </div>
      ) : (
        <div className="flex items-end justify-between gap-2" style={{ height: 120 }}>
          {dailyHours.map((h, i) => {
            const height = Math.max((h / maxH) * 100, 4);
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 120, damping: 14 }}
                  className={`w-full rounded-xl ${BAR_COLORS[i]} min-h-[4px]`}
                />
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {DAY_LABELS[i]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
