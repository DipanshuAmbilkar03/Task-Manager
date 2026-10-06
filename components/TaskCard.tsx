"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpDown,
  Check,
  Flag,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { TASK_STATUSES, type TaskStatus } from "@/lib/validation";
import { STATUS_META, type Task } from "@/components/task-types";
import { timeAgo } from "@/components/task-utils";

interface TaskCardProps {
  task: Task;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onAskDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
  deleting: boolean;
  statusUpdating: boolean;
}

export function TaskCard({
  task,
  index,
  expanded,
  onToggleExpand,
  onEdit,
  onAskDelete,
  onStatusChange,
  deleting,
  statusUpdating,
}: TaskCardProps) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -2 }}
      className={`group rounded-2xl border transition-shadow ${
        task.status === "Completed"
          ? "border-stone-200/70 bg-stone-50 shadow-[0_4px_14px_-8px_rgba(0,0,0,0.2)]"
          : "border-stone-200/70 bg-white shadow-[0_10px_30px_-12px_rgba(0,0,0,0.28)] hover:shadow-[0_18px_45px_-12px_rgba(0,0,0,0.35)]"
      }`}
    >
      <div className="flex items-start gap-3 p-3.5 sm:p-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() =>
            onStatusChange(task.status === "Completed" ? "Pending" : "Completed")
          }
          aria-label={task.status === "Completed" ? "Mark as pending" : "Mark as done"}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
            task.status === "Completed"
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-stone-300 bg-stone-100 text-transparent hover:border-emerald-500"
          }`}
        >
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </motion.button>
        <button
          type="button"
          onClick={onToggleExpand}
          className="min-w-0 flex-1 text-left"
        >
          <h3
            className={`break-words text-[15px] font-semibold leading-snug transition ${
              task.status === "Completed"
                ? "text-stone-400 line-through"
                : "text-stone-800"
            }`}
          >
            {task.title}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs font-medium">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 ${STATUS_META[task.status].chip}`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${STATUS_META[task.status].dot}`}
              />
              {task.status}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-stone-600">
              <Flag className="h-3 w-3" />
              {task.priority}
            </span>
            <span className="px-1 font-normal tabular-nums text-stone-400">
              {timeAgo(task.updatedAt)}
            </span>
          </div>
        </button>
        <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEdit}
            aria-label={`Edit ${task.title}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-stone-400 transition hover:border-stone-200 hover:bg-stone-100 hover:text-stone-800"
          >
            <Pencil className="h-4 w-4" />
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={deleting}
            onClick={onAskDelete}
            aria-label={`Delete ${task.title}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-stone-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-stone-200/70 bg-stone-50 px-4 py-3 sm:px-[52px]">
              {task.description ? (
                <p className="break-words text-sm leading-relaxed text-stone-600">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm italic text-stone-400">No description.</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 inline-flex items-center gap-1 text-xs font-medium text-stone-500">
                  <ArrowUpDown className="h-3 w-3" /> Move to
                </span>
                {TASK_STATUSES.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={statusUpdating || task.status === status}
                    onClick={() => onStatusChange(status)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      task.status === status
                        ? STATUS_META[status].chip
                        : "border-stone-200 bg-stone-100 text-stone-600 hover:border-stone-300 hover:bg-stone-200"
                    } disabled:opacity-50`}
                  >
                    {status}
                  </button>
                ))}
                {statusUpdating && (
                  <span className="inline-flex items-center gap-1 text-xs text-stone-400">
                    <Loader2 className="h-3 w-3 animate-spin" /> Updating…
                  </span>
                )}
              </div>
              <p className="mt-2.5 text-[11px] tabular-nums text-stone-400">
                Created {timeAgo(task.createdAt)} · Updated{" "}
                {timeAgo(task.updatedAt)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
