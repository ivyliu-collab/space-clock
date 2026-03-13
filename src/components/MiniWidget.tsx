import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";

interface MiniWidgetProps {
  startTime: string;
  goalHours: number;
  onRestore: () => void;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MiniWidget({ startTime, goalHours, onRestore }: MiniWidgetProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const tick = () => setElapsed(Date.now() - start);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const goalMs = goalHours * 3600 * 1000;
  const remaining = Math.max(goalMs - elapsed, 0);
  const progress = Math.min(elapsed / goalMs, 1);

  const etaDate = new Date(new Date(startTime).getTime() + goalMs);
  const etaStr = `${String(etaDate.getHours()).padStart(2, "0")}:${String(etaDate.getMinutes()).padStart(2, "0")}`;

  const remainH = Math.floor(remaining / 3600000);
  const remainM = Math.floor((remaining % 3600000) / 60000);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed top-4 right-4 z-[60] w-64 glass-card p-4 cursor-move select-none"
      style={{ boxShadow: "0 8px 32px -8px hsl(220 30% 50% / 0.15)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-secondary">Ding!</span>
          <span className="text-[10px] font-semibold text-muted-foreground">工作中</span>
        </div>
        <button
          onClick={onRestore}
          className="rounded-lg p-1 hover:bg-muted transition-colors"
          title="恢复完整视图"
        >
          <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Timer */}
      <div className="text-center mb-2">
        <span className="font-mono text-2xl font-bold text-foreground tracking-wide">
          {formatDuration(elapsed)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-muted mb-2 relative">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: "#C1F0E0" }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          <span className="shimmer-sweep" />
        </motion.div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
        <span>
          {progress >= 1 ? "🎉 目标达成！" : `剩余 ${remainH}h ${remainM}m`}
        </span>
        <span>
          预计 <span className="text-secondary font-bold">{etaStr}</span> 下班
        </span>
      </div>
    </motion.div>
  );
}
