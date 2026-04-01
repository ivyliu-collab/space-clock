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
      }, 2200);
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
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          style={{ paddingBottom: "20vh" }}
        >
          {/* Full-screen golden flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="fixed inset-0"
            style={{
              background: "radial-gradient(ellipse at center 40%, hsl(45 90% 65% / 0.4) 0%, transparent 60%)",
            }}
          />

          {/* Large golden glow */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 3.5, 3], opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute w-56 h-56 rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(45 90% 65% / 0.7) 0%, hsl(35 80% 55% / 0.3) 40%, transparent 70%)",
            }}
          />

          {/* Pixel stars burst - more particles, larger spread */}
          {[...Array(14)].map((_, i) => {
            const angle = (i / 14) * Math.PI * 2;
            const dist = 100 + Math.random() * 60;
            return (
              <motion.span
                key={i}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.5, 1],
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  opacity: [1, 1, 0],
                }}
                transition={{ duration: 1.1, delay: 0.08 + i * 0.03, ease: "easeOut" }}
                className="absolute text-2xl"
                style={{ imageRendering: "pixelated" }}
              >
                {["⭐", "✨", "🌟", "💫", "🎉"][i % 5]}
              </motion.span>
            );
          })}

          {/* Main "叮！" text - much larger */}
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{
              scale: [0, 1.5, 1.2],
              rotate: [-12, 6, 0],
            }}
            transition={{ type: "spring", stiffness: 350, damping: 10, delay: 0.05 }}
            className="relative z-10 flex flex-col items-center"
          >
            <span
              className="text-7xl md:text-8xl font-bold"
              style={{
                background: "linear-gradient(135deg, hsl(35 80% 55%), hsl(45 95% 65%), hsl(30 90% 60%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 4px 16px hsl(35 80% 60% / 0.6))",
                fontFamily: "'Quicksand', sans-serif",
              }}
            >
              叮！
            </span>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="mt-2 text-base md:text-lg font-semibold text-muted-foreground"
              style={{
                filter: "drop-shadow(0 1px 4px hsl(35 80% 60% / 0.3))",
              }}
            >
              辛苦啦，下班咯 🏡
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
