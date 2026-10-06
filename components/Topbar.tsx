"use client";

import { motion } from "framer-motion";
import { ListChecks, Plus, SlidersHorizontal } from "lucide-react";
import type { StatusFilter } from "@/components/task-types";
import type { TaskSummary } from "@/hooks/useTasks";

interface TopbarProps {
  statusFilter: StatusFilter;
  summary: TaskSummary;
  onOpenSidebar: () => void;
  onNewTask: () => void;
}

export function Topbar({
  statusFilter,
  summary,
  onOpenSidebar,
  onNewTask,
}: TopbarProps) {
  const activeViewLabel =
    statusFilter === "All"
      ? "All tasks"
      : statusFilter === "In Progress"
        ? "In Progress"
        : statusFilter;

  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 shadow-[0_6px_24px_-8px_rgba(0,0,0,0.25)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-stone-100 text-stone-700 shadow-sm transition hover:bg-stone-200 lg:hidden"
          aria-label="Open navigation"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white lg:hidden">
          <ListChecks className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <motion.h1
            key={activeViewLabel}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="truncate text-base font-semibold tracking-tight sm:text-lg"
          >
            {activeViewLabel}
          </motion.h1>
          <p className="truncate text-xs text-stone-500">
            {summary.total === 0
              ? "Nothing here yet — add your first task"
              : `${summary.total} total · ${summary.pending} pending · ${summary.inProgress} active · ${summary.completed} done`}
          </p>
        </div>
        <motion.button
          type="button"
          onClick={onNewTask}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-3.5 text-sm font-medium text-white shadow-[0_8px_20px_-6px_rgba(5,150,105,0.6)] transition-shadow hover:bg-emerald-500 hover:shadow-[0_10px_26px_-6px_rgba(5,150,105,0.7)] sm:px-4"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New task</span>
          <span className="sm:hidden">New</span>
        </motion.button>
      </div>
    </header>
  );
}
