import { useState, useCallback, useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import { motion } from "framer-motion";
import { Settings, Pencil, Minimize2, Plus, CalendarOff } from "lucide-react";
import PunchButton from "@/components/PunchButton";
import CapsuleProgress from "@/components/CapsuleProgress";
import WeeklyStats from "@/components/WeeklyStats";
import PunchHistory from "@/components/PunchHistory";
import SettingsDrawer from "@/components/SettingsDrawer";
import TimeEditDialog from "@/components/TimeEditDialog";
import ClockOutCelebration from "@/components/ClockOutCelebration";
import PipMiniWidget from "@/components/PipMiniWidget";
import AddPunchDialog from "@/components/AddPunchDialog";
import LeavePage from "@/pages/LeavePage";
import { usePunch } from "@/hooks/usePunch";
import { useLeave } from "@/hooks/useLeave";
import { usePictureInPicture } from "@/hooks/usePictureInPicture";
import type { SpaceSchedule } from "@/hooks/useSpace";

interface DashboardProps {
  spaceId: string;
  dailyGoal: number;
  schedule: SpaceSchedule;
  onGoalChange: (h: number) => void;
  onScheduleChange: (s: SpaceSchedule) => void;
  onExit: () => void;
}

export default function Dashboard({ spaceId, dailyGoal, schedule, onGoalChange, onScheduleChange, onExit }: DashboardProps) {
  const { records, activePunch, loading, startPunch, endPunch, deletePunch, updatePunchTime, addManualPunch } = usePunch(spaceId);
  const { leaves, addLeave, deleteLeave } = useLeave(spaceId);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingStart, setEditingStart] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [addPunchOpen, setAddPunchOpen] = useState(false);
  const [showLeavePage, setShowLeavePage] = useState(false);
  const { isOpen: pipOpen, openPip, closePip } = usePictureInPicture();
  const [pipRoot, setPipRoot] = useState<Root | null>(null);

  const handleEndPunch = useCallback(async () => {
    await endPunch();
    setShowCelebration(true);
  }, [endPunch]);

  const handleOpenPip = useCallback(async () => {
    const result = await openPip();
    if (result) {
      const root = createRoot(result.container);
      setPipRoot(root);
    }
  }, [openPip]);

  useEffect(() => {
    if (pipRoot && activePunch) {
      pipRoot.render(
        <PipMiniWidget
          startTime={activePunch.start_time}
          goalHours={dailyGoal}
          onRestore={() => {
            closePip();
            setPipRoot(null);
          }}
        />
      );
    }
  }, [pipRoot, activePunch, dailyGoal, closePip]);

  useEffect(() => {
    if (!activePunch && pipOpen) {
      closePip();
      setPipRoot(null);
    }
  }, [activePunch, pipOpen, closePip]);

  // Show leave page
  if (showLeavePage) {
    return (
      <LeavePage
        leaves={leaves}
        records={records}
        onAdd={addLeave}
        onDelete={deleteLeave}
        onBack={() => setShowLeavePage(false)}
      />
    );
  }

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
          <div className="flex items-center gap-2">
            {activePunch && !pipOpen && (
              <button
                onClick={handleOpenPip}
                className="hidden md:flex glass-card p-3 transition-colors hover:bg-muted/50"
                title="画中画悬浮窗"
              >
                <Minimize2 className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={() => setSettingsOpen(true)}
              className="glass-card p-3 transition-colors hover:bg-muted/50"
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Punch */}
        <div className="mb-6 flex justify-center">
          <PunchButton
            isActive={!!activePunch}
            onStart={startPunch}
            onEnd={handleEndPunch}
            loading={loading}
          />
        </div>

        {/* Progress with edit button for active punch */}
        {activePunch && (
          <div className="mb-6">
            <div className="mb-2 flex justify-end">
              <button
                onClick={() => setEditingStart(true)}
                className="flex items-center gap-1 rounded-xl bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
              >
                <Pencil className="h-3 w-3" />
                调整开始时间
              </button>
            </div>
            <CapsuleProgress startTime={activePunch.start_time} goalHours={dailyGoal} />
          </div>
        )}

        {/* Weekly */}
        <div className="mb-6">
          <WeeklyStats records={records} leaves={leaves} goalHours={dailyGoal} goalStartTime={schedule.goalStartTime} goalEndTime={schedule.goalEndTime} />
        </div>

        {/* History with leave + add punch buttons */}
        <div className="mb-2 flex justify-end gap-2">
          <button
            onClick={() => setShowLeavePage(true)}
            className="flex items-center gap-1 rounded-xl bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            <CalendarOff className="h-3 w-3" />
            请假
          </button>
          <button
            onClick={() => setAddPunchOpen(true)}
            className="flex items-center gap-1 rounded-xl bg-muted/50 px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
          >
            <Plus className="h-3 w-3" />
            补打卡
          </button>
        </div>
        <PunchHistory
          records={records}
          onDelete={deletePunch}
          onUpdateTime={updatePunchTime}
        />

        {/* Add punch dialog */}
        <AddPunchDialog
          open={addPunchOpen}
          onClose={() => setAddPunchOpen(false)}
          onSave={addManualPunch}
          records={records}
        />
      </div>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        goalHours={dailyGoal}
        onGoalChange={onGoalChange}
        schedule={schedule}
        onScheduleChange={onScheduleChange}
        spaceId={spaceId}
        onExit={onExit}
      />

      {activePunch && editingStart && (
        <TimeEditDialog
          open
          title="调整开始时间"
          initialValue={activePunch.start_time}
          onSave={(iso) => {
            updatePunchTime(activePunch.id, "start_time", iso);
            setEditingStart(false);
          }}
          onClose={() => setEditingStart(false)}
        />
      )}

      <ClockOutCelebration show={showCelebration} onComplete={() => setShowCelebration(false)} />
    </div>
  );
}
