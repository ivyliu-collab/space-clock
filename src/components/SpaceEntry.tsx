import { useState } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";

interface SpaceEntryProps {
  onEnter: (name: string) => void;
  loading: boolean;
}

export default function SpaceEntry({ onEnter, loading }: SpaceEntryProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onEnter(name.trim());
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
        className="relative z-10 mx-4 w-full max-w-md"
      >
        <div className="glass-card p-10 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-candy-orange/20"
          >
            <Bell className="h-8 w-8 text-secondary" />
          </motion.div>

          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            Ding!
          </h1>
          <p className="mb-8 text-muted-foreground">
            输入你的专属空间名，开始打卡
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：小王的工位"
              className="w-full rounded-2xl border border-border bg-card/60 px-5 py-4 text-center text-lg font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:ring-2 focus:ring-ring/40 backdrop-blur-sm"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!name.trim() || loading}
              className="w-full rounded-2xl bg-secondary py-4 text-lg font-bold text-secondary-foreground btn-shadow transition-all disabled:opacity-50"
            >
              {loading ? "进入中..." : "进入空间"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
