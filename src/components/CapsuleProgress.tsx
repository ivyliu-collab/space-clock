import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CapsuleProgressProps {
  startTime: string;
  goalHours: number;
}

/* Animated single digit that slides when changing */
function AnimatedDigit({ digit }: { digit: string }) {
  return (
    <span className="relative inline-block w-[0.6em] overflow-hidden text-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="inline-block"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function AnimatedTime({ text }: { text: string }) {
  return (
    <span className="inline-flex font-mono text-lg font-extrabold text-foreground">
      {text.split("").map((ch, i) => (
        ch === ":" ? <span key={i} className="mx-[1px]">:</span> : <AnimatedDigit key={i} digit={ch} />
      ))}
    </span>
  );
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
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
  const remaining = Math.max(goalMs - elapsed, 0);
  const progress = Math.min(elapsed / goalMs, 1);

  const remainH = Math.floor(remaining / 3600000);
  const remainM = Math.floor((remaining % 3600000) / 60000);

  // Estimated end time
  const etaDate = new Date(new Date(startTime).getTime() + goalMs);
  const etaStr = `${String(etaDate.getHours()).padStart(2, "0")}:${String(etaDate.getMinutes()).padStart(2, "0")}`;

  const encouragement = progress >= 1
    ? "🎉 目标达成！太棒了！"
    : `坚持住！还有 ${remainH} 小时 ${remainM} 分钟就能到钟啦 🥂`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 card-hover"
    >
      {/* Encouragement */}
      <p className="mb-3 text-center text-sm font-semibold text-secondary">
        {encouragement}
      </p>

      {/* Timer & ETA row */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">进行中</span>
          <AnimatedTime text={formatDuration(elapsed)} />
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">预计下班时间</p>
          <p className="text-base font-extrabold text-primary">{etaStr}</p>
        </div>
      </div>

      {/* Jelly progress bar */}
      <div className="h-5 overflow-hidden rounded-full bg-muted relative">
        <motion.div
          className="jelly-bar h-full rounded-full bg-primary relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
        >
          {/* Shimmer / glow sweep */}
          <span className="shimmer-sweep" />
        </motion.div>
      </div>

      <div className="mt-2 text-right text-xs text-muted-foreground">
        目标 {goalHours}h
      </div>
    </motion.div>
  );
}
