import { useEffect, useState } from "react";

interface PipMiniWidgetProps {
  startTime: string;
  goalHours: number;
  onRestore: () => void;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * PiP widget — prominent remaining countdown, small elapsed at bottom-left.
 */
export default function PipMiniWidget({ startTime, goalHours, onRestore }: PipMiniWidgetProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const tick = () => setElapsed(Date.now() - start);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const goalMs = goalHours * 3600 * 1000;
  const remaining = Math.max(goalMs - elapsed, 0);
  const progress = Math.min(elapsed / goalMs, 1);
  const done = progress >= 1;

  const etaDate = new Date(new Date(startTime).getTime() + goalMs);
  const etaStr = `${String(etaDate.getHours()).padStart(2, "0")}:${String(etaDate.getMinutes()).padStart(2, "0")}`;

  return (
    <div
      style={{
        padding: "16px",
        fontFamily: "'Quicksand', 'SF Pro Display', 'Segoe UI', system-ui, sans-serif",
        background: "linear-gradient(135deg, #FDFCFB 0%, #E2EBFF 100%)",
        minHeight: "100vh",
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "hsl(35, 80%, 55%)", fontFamily: "inherit" }}>Ding!</span>
          <span style={{ fontSize: "10px", fontWeight: 600, color: "hsl(220, 10%, 50%)", fontFamily: "inherit" }}>工作中</span>
        </div>
        <button
          onClick={onRestore}
          style={{
            border: "none",
            background: "hsl(220, 20%, 94%)",
            borderRadius: "8px",
            padding: "4px 8px",
            cursor: "pointer",
            fontSize: "10px",
            fontWeight: 600,
            color: "hsl(220, 10%, 50%)",
          }}
          title="恢复完整视图"
        >
          ↗ 返回
        </button>
      </div>

      {/* Remaining countdown — prominent */}
      <div style={{ textAlign: "center", marginBottom: "4px" }}>
        <div style={{ fontSize: "10px", fontWeight: 600, color: "hsl(220, 10%, 50%)", marginBottom: "2px" }}>
          {done ? "🎉 已超出目标" : "距离下班还有"}
        </div>
        <span
          style={{
            fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
            fontSize: "32px",
            fontWeight: 700,
            color: done ? "hsl(35, 80%, 55%)" : "hsl(230, 15%, 25%)",
            letterSpacing: "0.05em",
          }}
        >
          {done ? formatDuration(elapsed - goalMs) : formatDuration(remaining)}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: "8px",
          borderRadius: "9999px",
          background: "hsl(220, 20%, 94%)",
          overflow: "hidden",
          marginBottom: "8px",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: "9999px",
            background: done
              ? "linear-gradient(90deg, hsl(35, 80%, 70%), hsl(35, 90%, 60%))"
              : "linear-gradient(90deg, hsl(160, 40%, 82%), hsl(160, 50%, 72%))",
            width: `${Math.min(progress * 100, 100)}%`,
            transition: "width 1s ease",
          }}
        />
      </div>

      {/* Bottom row: elapsed (left), ETA (right) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", fontWeight: 600, color: "hsl(220, 10%, 50%)", fontFamily: "inherit" }}>
        <span>
          已打卡 <span style={{ fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace", fontWeight: 700, color: "hsl(230, 15%, 25%)" }}>{formatDuration(elapsed)}</span>
        </span>
        <span>
          预计 <span style={{ fontFamily: "'SF Mono', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace", color: "hsl(35, 80%, 55%)", fontWeight: 700 }}>{etaStr}</span> 下班
        </span>
      </div>
    </div>
  );
}
