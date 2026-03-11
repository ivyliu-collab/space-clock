import { useRef, useState } from "react";
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
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = () => {
    // Ripple effect
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const x = rect.width / 2;
      const y = rect.height / 2;
      const id = Date.now();
      setRipples((prev) => [...prev, { id, x, y }]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 700);
    }

    if (isActive) {
      onEnd();
    } else {
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        const cx = (rect.left + rect.width / 2) / window.innerWidth;
        const cy = (rect.top + rect.height / 2) / window.innerHeight;
        confetti({
          particleCount: 60,
          spread: 55,
          origin: { x: cx, y: cy },
          colors: ["#C1F0E0", "#FFB347", "#FDFD96", "#E2EBFF", "#FFDEE2"],
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
        className={`relative flex h-32 w-32 items-center justify-center rounded-full overflow-hidden btn-shadow transition-colors ${
          isActive
            ? "bg-secondary text-secondary-foreground animate-pulse-soft"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isActive ? <Square className="h-10 w-10" /> : <Play className="h-10 w-10 ml-1" />}

        {/* Ripple rings */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="ripple-ring absolute rounded-full bg-card/30"
            style={{ left: r.x - 60, top: r.y - 60, width: 120, height: 120 }}
          />
        ))}

        {/* Active pulse ring */}
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
