"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, X } from "lucide-react";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/validation";
import {
  INPUT_CLASS,
  STATUS_META,
  type FormState,
} from "@/components/task-types";

interface TaskFormProps {
  formOpen: boolean;
  editingId: string | null;
  form: FormState;
  onFormChange: (form: FormState) => void;
  formErrors: string[];
  saving: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onClose: () => void;
}

export function TaskForm({
  formOpen,
  editingId,
  form,
  onFormChange,
  formErrors,
  saving,
  onSubmit,
  onClose,
}: TaskFormProps) {
  return (
    <AnimatePresence initial={false}>
      {formOpen && (
        <motion.section
          id="task-form"
          key="task-form"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="scroll-mt-24 overflow-hidden"
        >
          <div className="rounded-2xl border border-stone-200/70 bg-white p-4 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  {editingId ? "Edit task" : "New task"}
                </h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  {editingId
                    ? "Update the fields and save."
                    : "Title is required (3–100 characters)."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close form"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-200 hover:text-stone-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formErrors.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 space-y-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {formErrors.map((error) => (
                  <li key={error} className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    {error}
                  </li>
                ))}
              </motion.ul>
            )}

            <form onSubmit={onSubmit} className="mt-4 space-y-3.5" noValidate>
              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-xs font-medium text-stone-600"
                >
                  Title *
                </label>
                <input
                  id="title"
                  className={INPUT_CLASS}
                  placeholder="e.g. Finish assignment report"
                  value={form.title}
                  maxLength={100}
                  onChange={(e) =>
                    onFormChange({ ...form, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-xs font-medium text-stone-600"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  className={`${INPUT_CLASS} min-h-20 resize-y`}
                  placeholder="Optional details (max 500 characters)"
                  value={form.description}
                  maxLength={500}
                  onChange={(e) =>
                    onFormChange({ ...form, description: e.target.value })
                  }
                />
                <p className="mt-1 text-right text-[11px] tabular-nums text-stone-400">
                  {form.description.trim().length}/500
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-stone-600">
                    Status
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {TASK_STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onFormChange({ ...form, status: s })}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                          form.status === s
                            ? STATUS_META[s].chip
                            : "border-stone-200 bg-stone-100 text-stone-600 hover:border-stone-300 hover:bg-stone-200"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-stone-600">
                    Priority
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {TASK_PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onFormChange({ ...form, priority: p })}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                          form.priority === p
                            ? p === "High"
                              ? "border-red-500 bg-red-500 text-white"
                              : p === "Medium"
                                ? "border-amber-500 bg-amber-500 text-white"
                                : "border-stone-300 bg-stone-200 text-stone-600"
                            : "border-stone-200 bg-stone-100 text-stone-600 hover:border-stone-300 hover:bg-stone-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-medium text-white shadow-[0_8px_20px_-6px_rgba(5,150,105,0.6)] transition-shadow hover:bg-emerald-500 hover:shadow-[0_10px_26px_-6px_rgba(5,150,105,0.7)] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none sm:px-6"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving…" : editingId ? "Save changes" : "Add task"}
                </motion.button>
                {editingId && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-10 rounded-xl border border-stone-200 bg-stone-100 px-4 text-sm font-medium text-stone-600 transition hover:bg-stone-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
