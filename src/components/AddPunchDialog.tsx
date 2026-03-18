import { useState, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { PunchRecord } from "@/hooks/usePunch";

interface AddPunchDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (startTime: string, endTime: string) => void;
  records: PunchRecord[];
}

function getDatesWithRecords(records: PunchRecord[]): Set<string> {
  const set = new Set<string>();
  records.forEach((r) => {
    const d = new Date(r.start_time);
    set.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });
  return set;
}

export default function AddPunchDialog({ open, onClose, onSave, records }: AddPunchDialogProps) {
  const [date, setDate] = useState<Date>();
  const [startH, setStartH] = useState("09");
  const [startM, setStartM] = useState("30");
  const [endH, setEndH] = useState("18");
  const [endM, setEndM] = useState("30");

  const datesWithRecords = useMemo(() => getDatesWithRecords(records), [records]);

  const disabledDays = (day: Date) => {
    if (day > new Date()) return true;
    const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
    return datesWithRecords.has(key);
  };

  const canSave = date && startH && startM && endH && endM;

  const handleSave = () => {
    if (!date) return;
    const start = new Date(date);
    start.setHours(parseInt(startH), parseInt(startM), 0, 0);
    const end = new Date(date);
    end.setHours(parseInt(endH), parseInt(endM), 0, 0);
    if (end <= start) return;
    onSave(start.toISOString(), end.toISOString());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="glass-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">补打卡</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date picker */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">选择日期</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "yyyy-MM-dd") : "选择日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={disabledDays}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">上班时间</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={startH}
                  onChange={(e) => setStartH(e.target.value.padStart(2, "0"))}
                  className="w-14 rounded-xl border border-border bg-background px-2 py-2 text-center text-sm font-semibold text-foreground"
                />
                <span className="text-muted-foreground font-bold">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={startM}
                  onChange={(e) => setStartM(e.target.value.padStart(2, "0"))}
                  className="w-14 rounded-xl border border-border bg-background px-2 py-2 text-center text-sm font-semibold text-foreground"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">下班时间</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={endH}
                  onChange={(e) => setEndH(e.target.value.padStart(2, "0"))}
                  className="w-14 rounded-xl border border-border bg-background px-2 py-2 text-center text-sm font-semibold text-foreground"
                />
                <span className="text-muted-foreground font-bold">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={endM}
                  onChange={(e) => setEndM(e.target.value.padStart(2, "0"))}
                  className="w-14 rounded-xl border border-border bg-background px-2 py-2 text-center text-sm font-semibold text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="rounded-2xl">取消</Button>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
