import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  PartyPopper,
  CalendarOff,
  TrendingUp,
  Sparkles,
  Flame,
  Info,
  X,
} from "lucide-react";
import { getMonthStats, HOLIDAY_NAMES } from "@/lib/holidays2026";
import type { LeaveRecord } from "@/hooks/useLeave";
import type { PunchRecord } from "@/hooks/usePunch";

interface MonthValuePageProps {
  leaves: LeaveRecord[];
  records: PunchRecord[];
  overtimeStartTime: string; // e.g. "21:00"
  dailyGoalHours: number; // e.g. 8
  onBack: () => void;
}

/** Parse "HH:MM" to minutes since midnight */
function hmToMin(hm: string) {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

type ClockOutCategory = "overtime" | "strict" | "normal";

function categorizeRecord(
  rec: PunchRecord,
  dailyGoalHours: number,
  otStartMin: number
): ClockOutCategory | null {
  if (!rec.end_time) return null;
  const start = new Date(rec.start_time);
  const expectedEnd = new Date(start.getTime() + dailyGoalHours * 3600_000);
  const expectedEndMin = expectedEnd.getHours() * 60 + expectedEnd.getMinutes();
  const end = new Date(rec.end_time);
  const endMin = end.getHours() * 60 + end.getMinutes();
  if (endMin >= otStartMin) return "overtime";
  if (endMin <= expectedEndMin + 10) return "strict";
  return "normal";
}

export default function MonthValuePage({
  leaves,
  records,
  overtimeStartTime,
  dailyGoalHours,
  onBack,
}: MonthValuePageProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const [showCategoryInfo, setShowCategoryInfo] = useState(false);

  const stats = useMemo(() => getMonthStats(year, month), [year, month]);

  const leaveDaysThisMonth = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return leaves.filter((l) => l.leave_date.startsWith(prefix));
  }, [leaves, year, month]);

  const leaveDayCount = leaveDaysThisMonth.length;
  const actualWorkDays = stats.workdays - leaveDayCount;
  const restDays = stats.totalDays - actualWorkDays;

  // Overtime / on-time stats
  const otStartMin = useMemo(() => hmToMin(overtimeStartTime), [overtimeStartTime]);

  const monthRecords = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return records.filter((r) => r.start_time.startsWith(prefix) && r.end_time);
  }, [records, year, month]);

  const clockOutStats = useMemo(() => {
    let overtime = 0;
    let strict = 0;
    let normal = 0;
    for (const r of monthRecords) {
      const cat = categorizeRecord(r, dailyGoalHours, otStartMin);
      if (cat === "overtime") overtime++;
      else if (cat === "strict") strict++;
      else if (cat === "normal") normal++;
    }
    return { overtime, strict, normal };
  }, [monthRecords, dailyGoalHours, otStartMin]);

  // Improved value ratio:
  // Base ratio = restDays / totalDays (higher = more rest = better)
  // Bonus: on-time days boost ratio, overtime days reduce it
  const totalPunchDays = clockOutStats.overtime + clockOutStats.strict + clockOutStats.normal;
  const baseRatio = stats.totalDays > 0 ? (restDays / stats.totalDays) * 100 : 0;
  const otPenalty = totalPunchDays > 0 ? (clockOutStats.overtime / totalPunchDays) * 15 : 0;
  const strictBonus = totalPunchDays > 0 ? (clockOutStats.strict / totalPunchDays) * 10 : 0;
  const finalRatio = Math.max(0, Math.min(100, baseRatio - otPenalty + strictBonus)).toFixed(1);

  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const holidayName = HOLIDAY_NAMES[monthKey];

  const emoji =
    Number(finalRatio) >= 50 ? "🎉" : Number(finalRatio) >= 30 ? "😊" : "💪";

  return (
    <div className="relative min-h-screen">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-10 h-56 w-56 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-2xl" />
        <div className="absolute bottom-20 -left-16 h-44 w-44 rounded-full bg-gradient-to-tr from-candy-orange/15 to-candy-mint/15 blur-2xl" />
        <div className="absolute top-1/3 right-1/4 h-20 w-20 rounded-full bg-primary/10 blur-xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3"
        >
          <button
            onClick={onBack}
            className="glass-card p-2.5 transition-colors hover:bg-muted/50"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">
            {month}月上班性价比
          </h1>
        </motion.div>

        {/* Main score card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-6 mb-5 text-center relative overflow-hidden"
        >
          <div className="absolute top-2 right-3 text-3xl animate-bounce">
            {emoji}
          </div>
          <div className="flex items-center justify-center gap-1 mb-1">
            <p className="text-xs font-semibold text-muted-foreground">
              摸鱼指数
            </p>
            <button
              onClick={() => setShowFormulaInfo(true)}
              className="text-muted-foreground/60 hover:text-primary transition-colors"
            >
              <Info className="h-3 w-3" />
            </button>
          </div>
          <p className="text-5xl font-black text-primary mb-1">
            {finalRatio}
            <span className="text-lg font-bold">%</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            本月 {stats.totalDays} 天里有 {restDays} 天不用上班 ✌️
          </p>
        </motion.div>

        {/* Stats grid - 2x2 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* 工作日 (主) + 总天数 (副) */}
          <StatCard
            icon={<Briefcase className="h-4 w-4" />}
            label="工作日"
            value={`${stats.workdays}`}
            unit="天"
            colorClass="bg-primary/10 text-primary"
            delay={0.1}
            sub={`📅 本月共 ${stats.totalDays} 天`}
            sub2={
              leaveDayCount > 0
                ? `请假后实际 ${actualWorkDays} 天`
                : undefined
            }
          />
          {/* 节假日 + 调休 */}
          <StatCard
            icon={<PartyPopper className="h-4 w-4" />}
            label="节假日"
            value={`${stats.holidays.length}`}
            unit="天"
            colorClass="bg-candy-orange/10 text-candy-orange"
            delay={0.15}
            sub={holidayName ? `🎊 ${holidayName}` : undefined}
            sub2={
              stats.makeupDays.length > 0
                ? `😤 调休 ${stats.makeupDays.length} 天`
                : "😎 无调休"
            }
          />
          {/* 请假 */}
          <StatCard
            icon={<CalendarOff className="h-4 w-4" />}
            label="本月请假"
            value={`${leaveDayCount}`}
            unit="天"
            colorClass="bg-secondary/10 text-secondary"
            delay={0.2}
            sub={leaveDayCount === 0 ? "🐂 劳模就是你" : undefined}
            leaveDetails={
              leaveDaysThisMonth.length > 0
                ? leaveDaysThisMonth.map((l) => {
                    const d = new Date(l.leave_date + "T00:00:00");
                    const dayNum = d.getDate();
                    const typeLabel =
                      l.leave_type === "morning"
                        ? "上午"
                        : l.leave_type === "afternoon"
                        ? "下午"
                        : "全天";
                    return `${month}/${dayNum} ${typeLabel} ${l.credit_hours}h`;
                  })
                : undefined
            }
          />
          {/* 加班 */}
          <StatCard
            icon={<Flame className="h-4 w-4" />}
            label="本月加班"
            value={`${clockOutStats.overtime}`}
            unit="天"
            colorClass="bg-destructive/10 text-destructive"
            delay={0.25}
            sub={`🎯 准点下班 ${clockOutStats.strict} 天`}
            sub2={`☕ 正常下班 ${clockOutStats.normal} 天`}
            infoAction={() => setShowCategoryInfo(true)}
          />
        </div>

        {/* Fun tip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-4 flex items-start gap-3"
        >
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-foreground mb-1">
              打工人小贴士
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {Number(finalRatio) >= 50
                ? "这个月一半时间都不用上班，简直是天选之月！🥳"
                : Number(finalRatio) >= 35
                ? "还不错的一个月，注意劳逸结合哦～ ☕"
                : Number(finalRatio) >= 25
                ? "这个月有点辛苦，记得犒劳自己！🍰"
                : "劳模之月！坚持就是胜利 💪🔥"}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Formula info modal */}
      <InfoModal
        open={showFormulaInfo}
        onClose={() => setShowFormulaInfo(false)}
        title="摸鱼指数计算方式"
        lines={[
          "基础分 = 非工作日天数 ÷ 本月总天数 × 100",
          "加班惩罚 = 加班天数占比 × 15分",
          "准点奖励 = 准点下班天数占比 × 10分",
          "最终指数 = 基础分 - 加班惩罚 + 准点奖励",
          "指数越高，说明这个月越轻松 🎉",
        ]}
      />

      {/* Category info modal */}
      <InfoModal
        open={showCategoryInfo}
        onClose={() => setShowCategoryInfo(false)}
        title="下班分类说明"
        lines={[
          `🎯 准点下班：下班时间在目标时间（${goalEndTime}）10分钟内`,
          `☕ 正常下班：下班时间在准点之后、加班时间（${overtimeStartTime}）之前`,
          `🔥 加班：下班时间在${overtimeStartTime}之后`,
        ]}
      />
    </div>
  );
}

function InfoModal({
  open,
  onClose,
  title,
  lines,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  lines: string[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card p-5 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {lines.map((line, i) => (
                <p
                  key={i}
                  className="text-[11px] text-muted-foreground leading-relaxed"
                >
                  {line}
                </p>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  colorClass,
  delay,
  sub,
  sub2,
  infoAction,
  leaveDetails,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  colorClass: string;
  delay: number;
  sub?: string;
  sub2?: string;
  infoAction?: () => void;
  leaveDetails?: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-4 flex flex-col items-center text-center relative"
    >
      {infoAction && (
        <button
          onClick={infoAction}
          className="absolute top-2 right-2 text-muted-foreground/50 hover:text-primary transition-colors"
        >
          <Info className="h-3 w-3" />
        </button>
      )}
      <div className={`mb-2 rounded-full p-2 ${colorClass}`}>{icon}</div>
      <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="text-2xl font-black text-foreground">
        {value}
        <span className="text-xs font-bold text-muted-foreground ml-0.5">
          {unit}
        </span>
      </p>
      {sub && (
        <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>
      )}
      {sub2 && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub2}</p>
      )}
      {leaveDetails && leaveDetails.length > 0 && (
        <div className="mt-1.5 w-full flex flex-col gap-0.5">
          {leaveDetails.map((d, i) => (
            <p key={i} className="text-[9px] text-muted-foreground text-center">{d}</p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
