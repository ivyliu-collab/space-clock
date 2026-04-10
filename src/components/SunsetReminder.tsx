import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SunsetReminderProps {
  sunsetTime: string; // "HH:mm"
}

const TIPS = [
  "🌅 嘿！日落马上开始了，别忘了抬头看看天空！",
  "🎨 大自然最棒的画作即将上演，快去窗边瞅一眼！",
  "📸 今天的晚霞可能是限量版哦，错过不补！",
  "🧡 太阳要下班了，它今天也辛苦了～",
  "✨ 日落倒计时！放下手机，用眼睛拍一张吧～",
  "🌇 黄金时刻来了！比任何滤镜都好看～",
];

function getRandomTip() {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
}

// Key to avoid showing the same reminder twice in one day
function getTodayKey() {
  return `sunset-reminded-${new Date().toISOString().slice(0, 10)}`;
}

export default function SunsetReminder({ sunsetTime }: SunsetReminderProps) {
  const [open, setOpen] = useState(false);
  const [tip] = useState(getRandomTip);

  useEffect(() => {
    if (!sunsetTime) return;

    const alreadyShown = sessionStorage.getItem(getTodayKey());
    if (alreadyShown) return;

    const [h, m] = sunsetTime.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return;

    // Target: 30 minutes before sunset
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);
    target.setMinutes(target.getMinutes() - 30);

    const diff = target.getTime() - now.getTime();

    // If already past the reminder window (but within 30min of sunset), show immediately
    // If sunset already passed, don't show
    const sunsetDate = new Date();
    sunsetDate.setHours(h, m, 0, 0);
    if (now.getTime() > sunsetDate.getTime()) return;

    if (diff <= 0) {
      // We're between reminder time and sunset — show now
      setOpen(true);
      sessionStorage.setItem(getTodayKey(), "1");
      return;
    }

    const timer = setTimeout(() => {
      if (!sessionStorage.getItem(getTodayKey())) {
        setOpen(true);
        sessionStorage.setItem(getTodayKey(), "1");
      }
    }, diff);

    return () => clearTimeout(timer);
  }, [sunsetTime]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xs rounded-2xl text-center">
        <DialogHeader className="items-center">
          <div className="text-5xl mb-2">🌅</div>
          <DialogTitle className="text-lg">日落提醒</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed pt-2">
            {tip}
          </DialogDescription>
          <p className="text-xs text-muted-foreground mt-1">
            今日日落时间 <span className="font-bold text-foreground">{sunsetTime}</span>
          </p>
        </DialogHeader>
        <Button
          onClick={() => setOpen(false)}
          className="mt-2 rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 text-white hover:from-orange-500 hover:to-pink-500"
        >
          知道啦 🧡
        </Button>
      </DialogContent>
    </Dialog>
  );
}
