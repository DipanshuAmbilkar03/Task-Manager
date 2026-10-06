"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { Task } from "@/components/task-types";

interface DeleteDialogProps {
  task: Task | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({ task, onCancel, onConfirm }: DeleteDialogProps) {
  return (
    <AnimatePresence>
      {task && (
        <motion.div
          key="delete-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-800/50 p-4 backdrop-blur-[2px] sm:items-center"
          onClick={onCancel}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label="Delete task"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_30px_80px_-12px_rgba(0,0,0,0.5)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold tracking-tight">
              Delete this task?
            </h2>
            <p className="mt-1 break-words text-sm text-stone-500">
              “{task.title}” will be permanently removed. This cannot be
              undone.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="h-10 flex-1 rounded-xl border border-stone-200 bg-stone-100 text-sm font-medium text-stone-600 transition hover:bg-stone-200"
              >
                Keep it
              </button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                className="h-10 flex-1 rounded-xl bg-red-600 text-sm font-medium text-white transition-shadow hover:bg-red-500 hover:shadow-md"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
