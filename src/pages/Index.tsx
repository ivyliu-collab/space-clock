import { useSpace } from "@/hooks/useSpace";
import SpaceEntry from "@/components/SpaceEntry";
import Dashboard from "@/pages/Dashboard";
import { AnimatePresence, motion } from "framer-motion";
import { getStoredSpaceId } from "@/lib/space";

const Index = () => {
  const { spaceId, dailyGoal, schedule, loading, enterSpace, exitSpace, updateGoal, updateSchedule, checkSpaceExists } = useSpace();

  return (
    <AnimatePresence mode="wait">
      {!spaceId ? (
        <motion.div key="entry" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <SpaceEntry onEnter={enterSpace} onCheckExists={checkSpaceExists} loading={loading} savedSpaceId={getStoredSpaceId()} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Dashboard
            spaceId={spaceId}
            dailyGoal={dailyGoal}
            schedule={schedule}
            onGoalChange={updateGoal}
            onScheduleChange={updateSchedule}
            onExit={exitSpace}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
