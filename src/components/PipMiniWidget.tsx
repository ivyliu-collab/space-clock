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
 * Lightweight widget rendered inside PiP window.
 * Uses inline styles since Tailwind may not be fully available in the PiP document.
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

  const remainH = Math.floor(remaining / 3600000);
  const remainM = Math.floor((remaining % 3600000) / 60000);

  return (
    <div
      style={{
        padding: "16px",
        fontFamily: "'Quicksand', sans-serif",
        background: "linear-gradient(135deg, #FDFCFB 0%, #E2EBFF 100%)",
        minHeight: "100vh",
        boxSizing: "border-box",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "hsl(35, 80%, 55%)" }}>Ding!</span>
          <span style={{ fontSize: "10px", fontWeight: 600, color: "hsl(220, 10%, 50%)" }}>工作中</span>
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

      {/* Timer */}
      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "32px",
            fontWeight: 700,
            color: "hsl(230, 15%, 25%)",
            letterSpacing: "0.05em",
          }}
        >
          {formatDuration(elapsed)}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: "8px",
          borderRadius: "9999px",
          background: "hsl(220, 20%, 94%)",
          overflow: "hidden",
          marginBottom: "10px",
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
            width: `${progress * 100}%`,
            transition: "width 1s ease",
          }}
        />
      </div>

      {/* Info */}
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 600, color: "hsl(220, 10%, 50%)" }}>
        <span>{done ? "🎉 目标达成！" : `剩余 ${remainH}h ${remainM}m`}</span>
        <span>
          预计 <span style={{ color: "hsl(35, 80%, 55%)", fontWeight: 700 }}>{etaStr}</span> 下班
        </span>
      </div>
    </div>
  );
}
