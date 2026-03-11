import { motion } from "framer-motion";
import { Play, Square } from "lucide-react";

interface PunchButtonProps {
  isActive: boolean;
  onStart: () => void;
  onEnd: () => void;
  loading: boolean;
}

export default function PunchButton({ isActive, onStart, onEnd, loading }: PunchButtonProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isActive ? onEnd : onStart}
        disabled={loading}
        className={`relative flex h-32 w-32 items-center justify-center rounded-full btn-shadow transition-colors ${
          isActive
            ? "bg-secondary text-secondary-foreground animate-pulse-soft"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {isActive ? <Square className="h-10 w-10" /> : <Play className="h-10 w-10 ml-1" />}
      </motion.button>
      <span className="text-sm font-semibold text-muted-foreground">
        {isActive ? "点击结束打卡" : "点击开始打卡"}
      </span>
    </div>
  );
}
