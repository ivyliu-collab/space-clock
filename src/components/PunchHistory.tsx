import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import type { PunchRecord } from "@/hooks/usePunch";

interface PunchHistoryProps {
  records: PunchRecord[];
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function duration(start: string, end: string | null) {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function PunchHistory({ records }: PunchHistoryProps) {
  const [asc, setAsc] = useState(false);

  const sorted = [...records].sort((a, b) => {
    const diff = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    return asc ? diff : -diff;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6 card-hover"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">打卡记录</h3>
        <button
          onClick={() => setAsc(!asc)}
          className="flex items-center gap-1 rounded-xl bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent"
        >
          <ArrowUpDown className="h-3 w-3" />
          {asc ? "正序" : "倒序"}
        </button>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence>
          {sorted.slice(0, 20).map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between rounded-2xl bg-background/60 px-4 py-3"
            >
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {formatTime(r.start_time)}
                </div>
                {r.end_time && (
                  <div className="text-xs text-muted-foreground">
                    → {formatTime(r.end_time)}
                  </div>
                )}
              </div>
              <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
                r.end_time
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary/15 text-secondary"
              }`}>
                {r.end_time ? duration(r.start_time, r.end_time) : "进行中"}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {records.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">暂无记录</p>
        )}
      </div>
    </motion.div>
  );
}
