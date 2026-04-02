import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Briefcase, PartyPopper, CalendarClock, CalendarOff, TrendingUp, Sparkles } from "lucide-react";
import { getMonthStats, HOLIDAY_NAMES } from "@/lib/holidays2026";
import type { LeaveRecord } from "@/hooks/useLeave";

interface MonthValuePageProps {
  leaves: LeaveRecord[];
  onBack: () => void;
}

export default function MonthValuePage({ leaves, onBack }: MonthValuePageProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const stats = useMemo(() => getMonthStats(year, month), [year, month]);

  const leaveDaysThisMonth = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return leaves.filter((l) => l.leave_date.startsWith(prefix));
  }, [leaves, year, month]);

  const leaveDayCount = leaveDaysThisMonth.length;
  const actualWorkDays = stats.workdays - leaveDayCount;
  const restDays = stats.totalDays - actualWorkDays;
  const valueRatio = stats.totalDays > 0 ? ((restDays / stats.totalDays) * 100).toFixed(1) : "0";

  // Holiday names this month
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const holidayName = HOLIDAY_NAMES[monthKey];

  const emoji = Number(valueRatio) >= 50 ? "🎉" : Number(valueRatio) >= 30 ? "😊" : "💪";

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
          <button onClick={onBack} className="glass-card p-2.5 transition-colors hover:bg-muted/50">
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
          <div className="absolute top-2 right-3 text-3xl animate-bounce">{emoji}</div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">摸鱼指数</p>
          <p className="text-5xl font-black text-primary mb-1">
            {valueRatio}
            <span className="text-lg font-bold">%</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            本月 {stats.totalDays} 天里有 {restDays} 天不用上班 ✌️
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard
            icon={<Briefcase className="h-4 w-4" />}
            label="总天数"
            value={`${stats.totalDays}`}
            unit="天"
            color="primary"
            delay={0.1}
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="工作日"
            value={`${stats.workdays}`}
            unit="天"
            color="secondary"
            delay={0.15}
            sub={leaveDayCount > 0 ? `请假${leaveDayCount}天后实际${actualWorkDays}天` : undefined}
          />
          <StatCard
            icon={<PartyPopper className="h-4 w-4" />}
            label="节假日"
            value={`${stats.holidays.length}`}
            unit="天"
            color="candy-orange"
            delay={0.2}
            sub={holidayName ? `🎊 ${holidayName}` : undefined}
          />
          <StatCard
            icon={<CalendarClock className="h-4 w-4" />}
            label="调休上班"
            value={`${stats.makeupDays.length}`}
            unit="天"
            color="candy-mint"
            delay={0.25}
            sub={stats.makeupDays.length > 0 ? "😤 该死的调休" : "😎 无调休"}
          />
        </div>

        {/* Leave info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5 mb-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <CalendarOff className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">本月请假</h3>
          </div>
          {leaveDayCount === 0 ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-1">🐂</p>
              <p className="text-xs text-muted-foreground">本月没有请假，劳模就是你！</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {leaveDaysThisMonth.map((l) => {
                const d = new Date(l.leave_date + "T00:00:00");
                const dayNum = d.getDate();
                const typeLabel = l.leave_type === "morning" ? "上午" : l.leave_type === "afternoon" ? "下午" : "全天";
                return (
                  <div key={l.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2">
                    <span className="text-xs font-semibold text-foreground">{month}月{dayNum}日</span>
                    <span className="text-[10px] font-semibold text-muted-foreground">{typeLabel} · {l.credit_hours}h</span>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Fun tip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-4 flex items-start gap-3"
        >
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-foreground mb-1">打工人小贴士</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {Number(valueRatio) >= 50
                ? "这个月一半时间都不用上班，简直是天选之月！🥳"
                : Number(valueRatio) >= 35
                ? "还不错的一个月，注意劳逸结合哦～ ☕"
                : Number(valueRatio) >= 25
                ? "这个月有点辛苦，记得犒劳自己！🍰"
                : "劳模之月！坚持就是胜利 💪🔥"}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  color,
  delay,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
  delay: number;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-4 flex flex-col items-center text-center"
    >
      <div className={`mb-2 rounded-full bg-${color}/10 p-2 text-${color}`}>{icon}</div>
      <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">{label}</p>
      <p className="text-2xl font-black text-foreground">
        {value}
        <span className="text-xs font-bold text-muted-foreground ml-0.5">{unit}</span>
      </p>
      {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}
