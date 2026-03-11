import { useState } from "react";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import PunchButton from "@/components/PunchButton";
import CapsuleProgress from "@/components/CapsuleProgress";
import WeeklyStats from "@/components/WeeklyStats";
import PunchHistory from "@/components/PunchHistory";
import SettingsDrawer from "@/components/SettingsDrawer";
import { usePunch } from "@/hooks/usePunch";

interface DashboardProps {
  spaceId: string;
  dailyGoal: number;
  onGoalChange: (h: number) => void;
  onExit: () => void;
}

export default function Dashboard({ spaceId, dailyGoal, onGoalChange, onExit }: DashboardProps) {
  const { records, activePunch, loading, startPunch, endPunch } = usePunch(spaceId);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Decorative */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 right-0 h-48 w-48 rounded-full bg-candy-mint/20" />
        <div className="absolute bottom-10 -left-10 h-36 w-36 rounded-3xl bg-candy-orange/10 rotate-45" />
        <div className="absolute top-1/2 right-1/4 h-24 w-24 rounded-full bg-candy-sky/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-foreground">Ding!</h1>
            <p className="text-xs font-semibold text-muted-foreground">{spaceId}</p>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="glass-card p-3 transition-colors hover:bg-muted/50"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Punch */}
        <div className="mb-6 flex justify-center">
          <PunchButton
            isActive={!!activePunch}
            onStart={startPunch}
            onEnd={endPunch}
            loading={loading}
          />
        </div>

        {/* Progress */}
        {activePunch && (
          <div className="mb-6">
            <CapsuleProgress startTime={activePunch.start_time} goalHours={dailyGoal} />
          </div>
        )}

        {/* Weekly */}
        <div className="mb-6">
          <WeeklyStats records={records} goalHours={dailyGoal} />
        </div>

        {/* History */}
        <PunchHistory records={records} />
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        goalHours={dailyGoal}
        onGoalChange={onGoalChange}
        spaceId={spaceId}
        onExit={onExit}
      />
    </div>
  );
}
