import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpDown, Search, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePunch, type PunchRecord } from "@/hooks/usePunch";
import ConfirmDialog from "@/components/ConfirmDialog";
import TimeEditDialog from "@/components/TimeEditDialog";

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

/** Group records by ISO week */
function groupByWeek(records: PunchRecord[]) {
  const groups: Map<string, PunchRecord[]> = new Map();
  records.forEach((r) => {
    const d = new Date(r.start_time);
    const day = d.getDay() || 7;
    const mon = new Date(d);
    mon.setDate(d.getDate() - day + 1);
    const key = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, "0")}-${String(mon.getDate()).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  });
  return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

function weekLabel(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  const mon = new Date(y, m - 1, d);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return `${mon.getMonth() + 1}/${mon.getDate()} - ${sun.getMonth() + 1}/${sun.getDate()}`;
}

interface HistoryProps {
  spaceId: string;
}

export default function History({ spaceId }: HistoryProps) {
  const navigate = useNavigate();
  const { records, deletePunch, updatePunchTime } = usePunch(spaceId);
  const [asc, setAsc] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string; field: "start_time" | "end_time"; value: string } | null>(null);

  const filtered = useMemo(() => {
    let recs = [...records];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      recs = recs.filter((r) => {
        const startStr = new Date(r.start_time).toLocaleString("zh-CN").toLowerCase();
        const endStr = r.end_time ? new Date(r.end_time).toLocaleString("zh-CN").toLowerCase() : "";
        return startStr.includes(q) || endStr.includes(q);
      });
    }
    recs.sort((a, b) => {
      const diff = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
      return asc ? diff : -diff;
    });
    return recs;
  }, [records, search, asc]);

  const weeks = useMemo(() => groupByWeek(filtered), [filtered]);

  // Auto-expand first week
  useMemo(() => {
    if (weeks.length > 0 && expandedWeeks.size === 0) {
      setExpandedWeeks(new Set([weeks[0][0]]));
    }
  }, [weeks.length]);

  const toggleWeek = (key: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 right-0 h-48 w-48 rounded-full bg-candy-mint/20" />
        <div className="absolute bottom-10 -left-10 h-36 w-36 rounded-3xl bg-candy-orange/10 rotate-45" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3"
        >
          <button
            onClick={() => navigate("/")}
            className="glass-card p-2.5 transition-colors hover:bg-muted/50"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">全部记录</h1>
            <p className="text-xs font-semibold text-muted-foreground">{records.length} 条打卡</p>
          </div>
        </motion.div>

        {/* Search + Sort */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索日期..."
              className="w-full rounded-2xl border border-border bg-card/60 py-2.5 pl-9 pr-4 text-sm font-semibold text-foreground outline-none backdrop-blur-sm focus:ring-2 focus:ring-ring/40 placeholder:text-muted-foreground/60"
            />
          </div>
          <button
            onClick={() => setAsc(!asc)}
            className="flex items-center gap-1 rounded-2xl glass-card px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/50"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {asc ? "正序" : "倒序"}
          </button>
        </motion.div>

        {/* Weekly grouped records */}
        <div className="space-y-3">
          {weeks.map(([weekKey, recs]) => {
            const isExpanded = expandedWeeks.has(weekKey);
            const weekTotal = recs.reduce((sum, r) => {
              const ms = (r.end_time ? new Date(r.end_time).getTime() : Date.now()) - new Date(r.start_time).getTime();
              return sum + ms;
            }, 0);
            const totalH = Math.floor(weekTotal / 3600000);
            const totalM = Math.floor((weekTotal % 3600000) / 60000);

            return (
              <motion.div
                key={weekKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden"
              >
                {/* Week header */}
                <button
                  onClick={() => toggleWeek(weekKey)}
                  className="flex w-full items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-bold text-foreground">{weekLabel(weekKey)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted-foreground">{recs.length} 条</span>
                    <span className="rounded-xl bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                      {totalH}h {totalM}m
                    </span>
                  </div>
                </button>

                {/* Records */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1 px-3 pb-3">
                        {recs.map((r) => (
                          <div
                            key={r.id}
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
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {weeks.length === 0 && (
            <div className="glass-card p-8 text-center">
              <p className="text-sm font-semibold text-muted-foreground">
                {search ? "没有找到匹配的记录" : "暂无打卡记录"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="删除打卡记录"
        description="确定要删除这条打卡记录吗？此操作不可撤销。"
        confirmLabel="删除"
        destructive
        onConfirm={() => {
          if (deleteTarget) deletePunch(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {editTarget && (
        <TimeEditDialog
          open
          title={editTarget.field === "start_time" ? "调整开始时间" : "调整结束时间"}
          initialValue={editTarget.value}
          onSave={(iso) => {
            updatePunchTime(editTarget.id, editTarget.field, iso);
            setEditTarget(null);
          }}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
