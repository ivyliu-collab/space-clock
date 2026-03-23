import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Plus, Sun, Sunset, Calendar as CalIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { LeaveRecord } from "@/hooks/useLeave";
import type { PunchRecord } from "@/hooks/usePunch";

interface LeavePageProps {
  leaves: LeaveRecord[];
  records: PunchRecord[];
  onAdd: (date: string, type: "morning" | "afternoon" | "full") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onBack: () => void;
}

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; hours: string }> = {
  morning: { label: "上午", icon: <Sun className="h-3.5 w-3.5" />, hours: "4.5h" },
  afternoon: { label: "下午", icon: <Sunset className="h-3.5 w-3.5" />, hours: "6.5h" },
  full: { label: "全天", icon: <CalIcon className="h-3.5 w-3.5" />, hours: "9.5h" },
};

export default function LeavePage({ leaves, records, onAdd, onDelete, onBack }: LeavePageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [leaveType, setLeaveType] = useState<"morning" | "afternoon" | "full">("full");
  const [saving, setSaving] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // Dates that already have leave records
  const leaveDates = useMemo(
    () => new Set(leaves.map((l) => l.leave_date)),
    [leaves]
  );

  const handleSave = async () => {
    if (!selectedDate) return;
    setSaving(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    await onAdd(dateStr, leaveType);
    setSelectedDate(undefined);
    setLeaveType("full");
    setSaving(false);
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
          <button onClick={onBack} className="glass-card p-2.5 transition-colors hover:bg-muted/50">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">请假管理</h1>
        </motion.div>

        {/* Add leave */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-5 mb-6"
        >
          <h3 className="text-sm font-bold text-foreground mb-4">记录请假</h3>

          {/* Date picker */}
          <div className="mb-4">
            <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">选择日期</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "yyyy年M月d日", { locale: zhCN }) : "选择请假日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    setSelectedDate(d);
                    setDateOpen(false);
                  }}
                  disabled={(date) => {
                    const ds = format(date, "yyyy-MM-dd");
                    return leaveDates.has(ds) || date > new Date();
                  }}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Leave type */}
          <div className="mb-5">
            <Label className="text-xs font-semibold text-muted-foreground mb-2 block">请假类型</Label>
            <RadioGroup
              value={leaveType}
              onValueChange={(v) => setLeaveType(v as "morning" | "afternoon" | "full")}
              className="flex gap-3"
            >
              {(["morning", "afternoon", "full"] as const).map((t) => (
                <Label
                  key={t}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center gap-2 rounded-2xl border-2 px-3 py-2.5 transition-all",
                    leaveType === t
                      ? "border-primary bg-primary/10"
                      : "border-muted bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value={t} className="sr-only" />
                  <span className="text-xs font-semibold">{TYPE_LABELS[t].label}</span>
                  <span className="text-[10px] text-muted-foreground">{TYPE_LABELS[t].hours}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Button
            onClick={handleSave}
            disabled={!selectedDate || saving}
            className="w-full rounded-2xl"
          >
            <Plus className="mr-1 h-4 w-4" />
            添加请假记录
          </Button>
        </motion.div>

        {/* Leave list */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-bold text-foreground mb-3">请假记录</h3>
          {leaves.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">暂无请假记录</p>
          ) : (
            <div className="flex flex-col gap-2">
              {leaves.map((l) => {
                const info = TYPE_LABELS[l.leave_type];
                return (
                  <div
                    key={l.id}
                    className="flex items-center justify-between rounded-2xl bg-muted/30 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{info.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {format(parseISO(l.leave_date), "M月d日 EEEE", { locale: zhCN })}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {info.label} · 抵扣 {l.credit_hours}h
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(l.id)}
                      className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
