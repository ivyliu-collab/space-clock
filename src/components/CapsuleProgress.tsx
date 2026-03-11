import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CapsuleProgressProps {
  startTime: string;
  goalHours: number;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function CapsuleProgress({ startTime, goalHours }: CapsuleProgressProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const tick = () => setElapsed(Date.now() - start);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const goalMs = goalHours * 3600 * 1000;
  const progress = Math.min(elapsed / goalMs, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="mb-2 flex items-center justify-between text-sm font-semibold text-muted-foreground">
        <span>进行中</span>
        <span>{formatDuration(elapsed)}</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="mt-2 text-right text-xs text-muted-foreground">
        目标 {goalHours}h
      </div>
    </motion.div>
  );
}
