import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, ArrowRight, AlertCircle } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";

interface SpaceEntryProps {
  onEnter: (name: string) => void;
  onCheckExists: (name: string) => Promise<boolean>;
  loading: boolean;
  savedSpaceId: string | null;
}

export default function SpaceEntry({ onEnter, onCheckExists, loading, savedSpaceId }: SpaceEntryProps) {
  const [name, setName] = useState("");
  const [checking, setChecking] = useState(false);
  const [confirmExisting, setConfirmExisting] = useState(false);
  const [pendingName, setPendingName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setChecking(true);
    const exists = await onCheckExists(trimmed);
    setChecking(false);

    if (exists) {
      setPendingName(trimmed);
      setConfirmExisting(true);
    } else {
      onEnter(trimmed);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Decorative floating shapes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-candy-mint/30" />
        <div className="absolute top-1/3 right-10 h-40 w-40 rounded-3xl bg-candy-orange/15 rotate-12" />
        <div className="absolute bottom-20 left-1/4 h-32 w-32 rounded-full bg-candy-sky/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mx-4 w-full max-w-md space-y-4"
      >
        {/* Returning user — saved space */}
        <AnimatePresence>
          {savedSpaceId && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-card p-6"
            >
              <p className="mb-3 text-xs font-semibold text-muted-foreground">欢迎回来 👋</p>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onEnter(savedSpaceId)}
                disabled={loading}
                className="flex w-full items-center justify-between rounded-2xl bg-secondary/10 px-5 py-4 transition-colors hover:bg-secondary/20"
              >
                <div className="text-left">
                  <p className="text-base font-bold text-foreground">{savedSpaceId}</p>
                  <p className="text-xs text-muted-foreground">点击直接进入你的空间</p>
                </div>
                <ArrowRight className="h-5 w-5 text-secondary" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New user — create space */}
        <div className="glass-card p-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-candy-orange/20"
          >
            <Bell className="h-7 w-7 text-secondary" />
          </motion.div>

          <h1 className="mb-1.5 text-2xl font-bold tracking-tight text-foreground">
            Ding!
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            {savedSpaceId ? "或者，创建一个新空间" : "创建你的专属打卡空间"}
          </p>

          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="给你的空间起个名字"
              className="w-full rounded-2xl border border-border bg-card/60 px-5 py-3.5 text-center text-base font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:ring-2 focus:ring-ring/40 backdrop-blur-sm"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!name.trim() || loading || checking}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3.5 text-base font-bold text-secondary-foreground btn-shadow transition-all disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {checking ? "检查中..." : loading ? "创建中..." : "创建空间"}
            </motion.button>
          </form>

          {/* Hint */}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-muted/40 px-3 py-2.5 text-left">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
            <p className="text-[11px] leading-relaxed text-muted-foreground/80">
              空间名就是你的"钥匙"，名字相同会进入同一空间。建议取一个独特的名字，比如加上你的名字或特殊符号。
            </p>
          </div>
        </div>
      </motion.div>

      {/* Confirm entering existing space */}
      <ConfirmDialog
        open={confirmExisting}
        title="该空间已存在"
        description={`"${pendingName}" 已经有人在使用了。如果这是你的空间，可以直接进入；否则建议换一个更独特的名字。`}
        confirmLabel="直接进入"
        onConfirm={() => {
          setConfirmExisting(false);
          onEnter(pendingName);
        }}
        onCancel={() => setConfirmExisting(false)}
      />
    </div>
  );
}
