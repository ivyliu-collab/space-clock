import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface TimeEditDialogProps {
  open: boolean;
  title: string;
  initialValue: string; // ISO string
  onSave: (iso: string) => void;
  onClose: () => void;
}

export default function TimeEditDialog({ open, title, initialValue, onSave, onClose }: TimeEditDialogProps) {
  const d = new Date(initialValue);
  const [date, setDate] = useState(
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  );
  const [time, setTime] = useState(
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  );

  const handleSave = () => {
    const newDate = new Date(`${date}T${time}:00`);
    if (!isNaN(newDate.getTime())) {
      onSave(newDate.toISOString());
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-foreground/10 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="glass-card p-6 w-full max-w-[320px] pointer-events-auto">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">{title}</h3>
                <button onClick={onClose} className="rounded-xl p-1.5 hover:bg-muted transition-colors">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="mb-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">日期</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-card/60 px-4 py-2.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">时间</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-card/60 px-4 py-2.5 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-border bg-card/60 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 rounded-2xl bg-secondary py-2.5 text-sm font-bold text-secondary-foreground btn-shadow transition-colors hover:bg-secondary/90"
                >
                  保存
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
