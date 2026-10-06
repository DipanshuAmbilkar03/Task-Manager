"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ListChecks, Loader2, Plus } from "lucide-react";
import type { TaskStatus } from "@/lib/validation";
import type { Task } from "@/components/task-types";
import { TaskCard } from "@/components/TaskCard";

interface TaskListProps {
  loading: boolean;
  refreshing: boolean;
  tasks: Task[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onNewTask: () => void;
  expandedId: string | null;
  onToggleExpand: (id: string | null) => void;
  onEdit: (task: Task) => void;
  onAskDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  deletingId: string | null;
  statusUpdatingId: string | null;
}

export function TaskList({
  loading,
  refreshing,
  tasks,
  hasActiveFilters,
  onClearFilters,
  onNewTask,
  expandedId,
  onToggleExpand,
  onEdit,
  onAskDelete,
  onStatusChange,
  deletingId,
  statusUpdatingId,
}: TaskListProps) {
  if (loading) {
    return (
      <ul className="space-y-2.5">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)]"
          >
            <div className="h-4 w-2/3 animate-pulse rounded bg-stone-200" />
            <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-stone-200" />
          </li>
        ))}
      </ul>
    );
  }

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dashed border-stone-300 bg-white/80 px-6 py-14 text-center shadow-[0_10px_30px_-14px_rgba(0,0,0,0.25)]"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <ListChecks className="h-6 w-6" strokeWidth={2.25} />
        </div>
        <p className="mt-4 font-medium">
          {hasActiveFilters
            ? "No tasks match your filters"
            : "All clear — nothing to do"}
        </p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-stone-500">
          {hasActiveFilters
            ? "Try a different search or clear the filters."
            : "Add your first task and it will show up here."}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="h-10 rounded-xl border border-stone-200 bg-stone-100 px-4 text-sm font-medium text-stone-600 transition hover:bg-stone-200"
            >
              Clear filters
            </button>
          ) : (
            <button
              type="button"
              onClick={onNewTask}
              className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition-shadow hover:bg-emerald-500 hover:shadow-md"
            >
              <Plus className="h-4 w-4" /> New task
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.ul layout className="space-y-2.5">
      <AnimatePresence initial={false}>
        {refreshing && (
          <motion.li
            key="refreshing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-xs text-stone-400"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Refreshing…
          </motion.li>
        )}
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            expanded={expandedId === task.id}
            onToggleExpand={() =>
              onToggleExpand(expandedId === task.id ? null : task.id)
            }
            onEdit={() => onEdit(task)}
            onAskDelete={() => onAskDelete(task)}
            onStatusChange={(status) => onStatusChange(task, status)}
            deleting={deletingId === task.id}
            statusUpdating={statusUpdatingId === task.id}
          />
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
