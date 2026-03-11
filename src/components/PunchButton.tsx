import { useRef } from "react";
import { motion } from "framer-motion";
import { Play, Square } from "lucide-react";
import confetti from "canvas-confetti";

interface PunchButtonProps {
  isActive: boolean;
  onStart: () => void;
  onEnd: () => void;
  loading: boolean;
}

export default function PunchButton({ isActive, onStart, onEnd, loading }: PunchButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (isActive) {
      onEnd();
    } else {
      // Fire confetti from button position
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { x, y },
          colors: ["#A3B18A", "#DAD7CD", "#B5838D", "#FFD6A5", "#CAFFBF"],
          scalar: 0.8,
          gravity: 0.8,
          ticks: 120,
        });
      }
      onStart();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.button
        ref={btnRef}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.85 }}
        onClick={handleClick}
        disabled={loading}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className={`relative flex h-32 w-32 items-center justify-center rounded-full btn-shadow transition-colors ${
          isActive
            ? "bg-secondary text-secondary-foreground animate-pulse-soft"
            : "bg-primary text-primary-foreground"
        }`}
      >
        {isActive ? <Square className="h-10 w-10" /> : <Play className="h-10 w-10 ml-1" />}

        {/* Ripple ring on active */}
        {isActive && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-secondary"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>
      <span className="text-sm font-semibold text-muted-foreground">
        {isActive ? "🏡 下班回家！" : "🚀 上班开始！"}
      </span>
    </div>
  );
}
