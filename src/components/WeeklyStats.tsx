import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import type { PunchRecord } from "@/hooks/usePunch";

interface WeeklyStatsProps {
  records: PunchRecord[];
  goalHours: number;
}

/* Persist goal schedule in localStorage */
function getGoalSchedule(): { start: string; end: string } {
  try {
    const raw = localStorage.getItem("ding_goal_schedule");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { start: "09:30", end: "18:30" };
}

function setGoalSchedule(s: { start: string; end: string }) {
  localStorage.setItem("ding_goal_schedule", JSON.stringify(s));
}

function getWeekDays() {
  const now = new Date();
  const day = now.getDay() || 7;
  const mon = new Date(now);
  mon.setDate(now.getDate() - day + 1);
  mon.setHours(0, 0, 0, 0);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

/** Parse "HH:MM" to minutes since midnight */
function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const DAY_LABELS = ["一", "二", "三", "四", "五"];

/* Cute sleeping cat SVG for empty state */
function SleepingCat() {
  return (
    <svg viewBox="0 0 120 80" className="mx-auto h-20 w-20 opacity-60" fill="none">
      <ellipse cx="60" cy="58" rx="35" ry="18" fill="hsl(var(--muted))" />
      <circle cx="60" cy="38" r="18" fill="hsl(var(--muted))" />
      <polygon points="46,24 42,10 54,22" fill="hsl(var(--muted-foreground) / 0.3)" />
      <polygon points="74,24 78,10 66,22" fill="hsl(var(--muted-foreground) / 0.3)" />
      <path d="M51 36 Q54 39 57 36" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M63 36 Q66 39 69 36" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M57 42 Q60 44 63 42" stroke="hsl(var(--muted-foreground))" strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d="M95 58 Q105 45 98 38" stroke="hsl(var(--muted))" strokeWidth="5" fill="none" strokeLinecap="round" />
      <text x="82" y="20" fontSize="10" fill="hsl(var(--muted-foreground) / 0.5)" fontWeight="bold">z</text>
      <text x="90" y="14" fontSize="8" fill="hsl(var(--muted-foreground) / 0.4)" fontWeight="bold">z</text>
      <text x="96" y="9" fontSize="6" fill="hsl(var(--muted-foreground) / 0.3)" fontWeight="bold">z</text>
    </svg>
  );
}

export default function WeeklyStats({ records, goalHours }: WeeklyStatsProps) {
  const [schedule, setScheduleState] = useState(getGoalSchedule);
  const [showSettings, setShowSettings] = useState(false);

  const weekDays = useMemo(() => getWeekDays(), []);

  const goalStartMin = parseTime(schedule.start);
  const goalEndMin = parseTime(schedule.end);

  // The visible timeline window: 1h before goal start to 1h after goal end
  const viewStart = Math.max(goalStartMin - 60, 0);
  const viewEnd = Math.min(goalEndMin + 60, 24 * 60);
  const viewSpan = viewEnd - viewStart;

  /** For each weekday, find earliest start and latest end (in minutes since midnight) */
  const dailyIntervals = useMemo(() => {
    return weekDays.map((dayStart) => {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      let earliest = Infinity;
      let latest = -Infinity;
      let hasData = false;

      records.forEach((r) => {
        const start = new Date(r.start_time);
        const end = r.end_time ? new Date(r.end_time) : new Date();
        if (start < dayEnd && end > dayStart) {
          hasData = true;
          const clampStart = new Date(Math.max(start.getTime(), dayStart.getTime()));
          const clampEnd = new Date(Math.min(end.getTime(), dayEnd.getTime()));
          const startMin = clampStart.getHours() * 60 + clampStart.getMinutes();
          const endMin = clampEnd.getHours() * 60 + clampEnd.getMinutes();
          earliest = Math.min(earliest, startMin);
          latest = Math.max(latest, endMin);
        }
      });

      return hasData ? { earliest, latest } : null;
    });
  }, [records, weekDays]);

  const hasData = dailyIntervals.some((d) => d !== null);

  const weekAvg = useMemo(() => {
    let totalMs = 0;
    let daysWithData = 0;
    weekDays.forEach((dayStart) => {
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);
      let dayTotal = 0;
      records.forEach((r) => {
        const start = new Date(r.start_time);
        const end = r.end_time ? new Date(r.end_time) : new Date();
        if (start < dayEnd && end > dayStart) {
          const cs = Math.max(start.getTime(), dayStart.getTime());
          const ce = Math.min(end.getTime(), dayEnd.getTime());
          dayTotal += ce - cs;
        }
      });
      if (dayTotal > 0) {
        totalMs += dayTotal;
        daysWithData++;
      }
    });
    return daysWithData > 0 ? (totalMs / daysWithData / 3600000).toFixed(1) : "0";
  }, [records, weekDays]);

  function handleSave(start: string, end: string) {
    const newSchedule = { start, end };
    setScheduleState(newSchedule);
    setGoalSchedule(newSchedule);
    setShowSettings(false);
  }

  /** Convert minutes to position percentage within the view */
  function toPercent(min: number): number {
    return ((min - viewStart) / viewSpan) * 100;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card p-6 card-hover"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">本周概览</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            周均 {weekAvg}h
          </span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-xl p-1.5 transition-colors hover:bg-muted/60"
            title="目标时间设置"
          >
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Goal time settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <GoalSettings
              start={schedule.start}
              end={schedule.end}
              onSave={handleSave}
              onCancel={() => setShowSettings(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!hasData ? (
        <div className="flex flex-col items-center gap-2 py-4">
          <SleepingCat />
          <p className="text-sm font-semibold text-muted-foreground">本周还没开始努力哦~</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {dailyIntervals.map((interval, i) => {
            const goalLeft = toPercent(goalStartMin);
            const goalWidth = toPercent(goalEndMin) - goalLeft;

            let actualLeft = 0;
            let actualWidth = 0;
            if (interval) {
              actualLeft = toPercent(Math.max(interval.earliest, viewStart));
              const actualRight = toPercent(Math.min(interval.latest, viewEnd));
              actualWidth = actualRight - actualLeft;
            }

            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4 text-center text-[10px] font-semibold text-muted-foreground">
                  {DAY_LABELS[i]}
                </span>
                <div className="relative h-5 flex-1 rounded-full bg-muted/40 overflow-hidden">
                  {/* Goal range (底色条) */}
                  <div
                    className="absolute inset-y-0 rounded-full bg-primary/25"
                    style={{ left: `${goalLeft}%`, width: `${goalWidth}%` }}
                  />
                  {/* Actual range (高亮色条) */}
                  {interval && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: i * 0.06, type: "spring", stiffness: 120, damping: 16 }}
                      className="absolute inset-y-1 rounded-full bg-secondary/70"
                      style={{
                        left: `${actualLeft}%`,
                        width: `${actualWidth}%`,
                        transformOrigin: "left",
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
          {/* Subtle time markers */}
          <div className="flex items-center gap-2">
            <span className="w-4" />
            <div className="relative flex-1 h-3">
              <span
                className="absolute text-[9px] font-semibold text-muted-foreground/60 -translate-x-1/2"
                style={{ left: `${toPercent(goalStartMin)}%` }}
              >
                {schedule.start}
              </span>
              <span
                className="absolute text-[9px] font-semibold text-muted-foreground/60 -translate-x-1/2"
                style={{ left: `${toPercent(goalEndMin)}%` }}
              >
                {schedule.end}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ---------- Goal settings sub-component ---------- */
function GoalSettings({
  start,
  end,
  onSave,
  onCancel,
}: {
  start: string;
  end: string;
  onSave: (s: string, e: string) => void;
  onCancel: () => void;
}) {
  const [s, setS] = useState(start);
  const [e, setE] = useState(end);

  return (
    <div className="mb-4 rounded-2xl bg-muted/40 p-3">
      <div className="flex items-center gap-3 mb-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          上班
          <input
            type="time"
            value={s}
            onChange={(ev) => setS(ev.target.value)}
            className="rounded-lg bg-background/80 px-2 py-1 text-xs font-semibold text-foreground border border-border outline-none"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          下班
          <input
            type="time"
            value={e}
            onChange={(ev) => setE(ev.target.value)}
            className="rounded-lg bg-background/80 px-2 py-1 text-xs font-semibold text-foreground border border-border outline-none"
          />
        </label>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="rounded-xl px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted/60 transition-colors"
        >
          取消
        </button>
        <button
          onClick={() => onSave(s, e)}
          className="rounded-xl bg-secondary/80 px-3 py-1 text-xs font-bold text-secondary-foreground hover:bg-secondary transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  );
}
