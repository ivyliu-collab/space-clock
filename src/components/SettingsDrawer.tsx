import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  goalHours: number;
  onGoalChange: (hours: number) => void;
  spaceId: string;
  onExit: () => void;
}

export default function SettingsDrawer({
  open,
  onClose,
  goalHours,
  onGoalChange,
  spaceId,
  onExit,
}: SettingsDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 h-full w-80 glass-card p-6 shadow-xl"
            style={{ borderTopLeftRadius: "1.5rem", borderBottomLeftRadius: "1.5rem", borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">设置</h2>
              <button onClick={onClose} className="rounded-xl p-2 hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="mb-8">
              <label className="mb-2 block text-sm font-semibold text-muted-foreground">
                当前空间
              </label>
              <div className="rounded-2xl bg-muted px-4 py-3 text-sm font-bold text-foreground">
                {spaceId}
              </div>
            </div>

            <div className="mb-8">
              <label className="mb-3 block text-sm font-semibold text-muted-foreground">
                每日目标工时
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={16}
                  step={0.5}
                  value={goalHours}
                  onChange={(e) => onGoalChange(Number(e.target.value))}
                  className="flex-1 accent-secondary"
                />
                <span className="w-12 text-right text-lg font-bold text-foreground">
                  {goalHours}h
                </span>
              </div>
            </div>

            <button
              onClick={onExit}
              className="w-full rounded-2xl border border-border bg-card/60 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted backdrop-blur-sm"
            >
              退出空间
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
