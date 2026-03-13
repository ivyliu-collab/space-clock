import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ClockOutCelebrationProps {
  show: boolean;
  onComplete: () => void;
}

export default function ClockOutCelebration({ show, onComplete }: ClockOutCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          {/* Golden glow backdrop */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2.5, opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-40 h-40 rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(45 90% 65% / 0.6) 0%, transparent 70%)",
            }}
          />

          {/* Pixel stars burst */}
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const dist = 80 + Math.random() * 40;
            return (
              <motion.span
                key={i}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.2, 0.8],
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 0.9, delay: 0.1 + i * 0.04, ease: "easeOut" }}
                className="absolute text-lg"
                style={{ imageRendering: "pixelated" }}
              >
                {["⭐", "✨", "🌟", "💫"][i % 4]}
              </motion.span>
            );
          })}

          {/* Main "叮！" text */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{
              scale: [0, 1.3, 1],
              rotate: [−10, 5, 0],
            }}
            transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.05 }}
            className="relative z-10 flex flex-col items-center"
          >
            <span
              className="text-5xl font-bold"
              style={{
                background: "linear-gradient(135deg, hsl(35 80% 55%), hsl(45 90% 65%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 2px 8px hsl(35 80% 60% / 0.4))",
                fontFamily: "'Quicksand', sans-serif",
              }}
            >
              叮！
            </span>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-1 text-sm font-semibold text-muted-foreground"
            >
              辛苦啦，下班咯 🏡
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
