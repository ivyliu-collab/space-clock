import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PunchRecord } from "@/hooks/usePunch";
import ConfirmDialog from "./ConfirmDialog";
import TimeEditDialog from "./TimeEditDialog";

interface PunchHistoryProps {
  records: PunchRecord[];
  onDelete: (id: string) => void;
  onUpdateTime: (id: string, field: "start_time" | "end_time", value: string) => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function duration(start: string, end: string | null) {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

/** Get records from the recent N days */
function recentDaysRecords(records: PunchRecord[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return records.filter((r) => new Date(r.start_time) >= cutoff);
}

export default function PunchHistory({ records, onDelete, onUpdateTime }: PunchHistoryProps) {
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string; field: "start_time" | "end_time"; value: string } | null>(null);

  const recent = recentDaysRecords(records, 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-6 card-hover"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">打卡记录</h3>
        <button
          onClick={() => navigate("/history")}
          className="flex items-center gap-1 rounded-xl bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent"
        >
          查看更多历史
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence>
          {recent.map((r) => (
            <motion.div
              key={r.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between rounded-2xl bg-background/60 px-4 py-3 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground">
                    {formatTime(r.start_time)}
                  </span>
                  <button
                    onClick={() => setEditTarget({ id: r.id, field: "start_time", value: r.start_time })}
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1 hover:bg-muted"
                  >
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                  </button>
                </div>
                {r.end_time && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">→ {formatTime(r.end_time)}</span>
                    <button
                      onClick={() => setEditTarget({ id: r.id, field: "end_time", value: r.end_time! })}
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1 hover:bg-muted"
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-xl px-3 py-1 text-xs font-bold ${
                  r.end_time
                    ? "bg-primary/15 text-primary-foreground"
                    : "bg-secondary/15 text-secondary"
                }`}>
                  {r.end_time ? duration(r.start_time, r.end_time) : "进行中"}
                </span>
                <button
                  onClick={() => setDeleteTarget(r.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1.5 hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {recent.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">暂无记录</p>
        )}
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除打卡记录"
        description="确定要删除这条打卡记录吗？此操作不可撤销。"
        confirmLabel="删除"
        destructive
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Time Edit */}
      {editTarget && (
        <TimeEditDialog
          open
          title={editTarget.field === "start_time" ? "调整开始时间" : "调整结束时间"}
          initialValue={editTarget.value}
          onSave={(iso) => {
            onUpdateTime(editTarget.id, editTarget.field, iso);
            setEditTarget(null);
          }}
          onClose={() => setEditTarget(null)}
        />
      )}
    </motion.div>
  );
}
