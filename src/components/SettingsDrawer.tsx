import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { SpaceSchedule } from "@/hooks/useSpace";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  goalHours: number;
  onGoalChange: (hours: number) => void;
  schedule: SpaceSchedule;
  onScheduleChange: (s: SpaceSchedule) => void;
  spaceId: string;
  onExit: () => void;
}

export default function SettingsDrawer({
  open,
  onClose,
  goalHours,
  onGoalChange,
  schedule,
  onScheduleChange,
  spaceId,
  onExit,
}: SettingsDrawerProps) {
  const [useCustomSchedule, setUseCustomSchedule] = useState(
    schedule.goalStartTime !== "10:00" || schedule.goalEndTime !== "19:30"
  );
  const [localStart, setLocalStart] = useState(schedule.goalStartTime);
  const [localEnd, setLocalEnd] = useState(schedule.goalEndTime);

  function handleToggleCustom() {
    if (useCustomSchedule) {
      // Reset to defaults
      setUseCustomSchedule(false);
      setLocalStart("10:00");
      setLocalEnd("19:30");
      onScheduleChange({ goalStartTime: "10:00", goalEndTime: "19:30" });
    } else {
      setUseCustomSchedule(true);
    }
  }

  function handleTimeBlur() {
    onScheduleChange({ goalStartTime: localStart, goalEndTime: localEnd });
  }

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
            className="fixed right-0 top-0 z-50 h-full w-80 glass-card p-6 shadow-xl overflow-y-auto"
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

            {/* Goal schedule */}
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-muted-foreground">
                  目标上下班时间
                </label>
                <button
                  onClick={handleToggleCustom}
                  className={`relative h-6 w-11 rounded-full transition-colors ${useCustomSchedule ? "bg-secondary" : "bg-muted"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${useCustomSchedule ? "translate-x-5" : ""}`}
                  />
                </button>
              </div>
              <AnimatePresence>
                {useCustomSchedule && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
                      <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
                        上班
                        <input
                          type="time"
                          value={localStart}
                          onChange={(e) => setLocalStart(e.target.value)}
                          onBlur={handleTimeBlur}
                          className="rounded-xl bg-background/80 px-3 py-2 text-sm font-bold text-foreground border border-border outline-none"
                        />
                      </label>
                      <span className="mt-4 text-muted-foreground font-bold">—</span>
                      <label className="flex flex-col gap-1 text-xs font-semibold text-muted-foreground">
                        下班
                        <input
                          type="time"
                          value={localEnd}
                          onChange={(e) => setLocalEnd(e.target.value)}
                          onBlur={handleTimeBlur}
                          className="rounded-xl bg-background/80 px-3 py-2 text-sm font-bold text-foreground border border-border outline-none"
                        />
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!useCustomSchedule && (
                <p className="text-xs text-muted-foreground">默认 10:00 - 19:30</p>
              )}
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
