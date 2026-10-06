"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCheck,
  CircleDashed,
  Clock,
  Inbox,
  ListChecks,
  Plus,
  X,
} from "lucide-react";
import type { StatusFilter } from "@/components/task-types";
import type { TaskSummary } from "@/hooks/useTasks";

interface NavItem {
  label: string;
  value: StatusFilter;
  icon: typeof Inbox;
  count: number;
}

interface SidebarProps {
  sidebarOpen: boolean;
  onClose: () => void;
  statusFilter: StatusFilter;
  onSelectView: (status: StatusFilter) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onNewTask: () => void;
  summary: TaskSummary;
}

function navItems(summary: TaskSummary): NavItem[] {
  return [
    { label: "All", value: "All", icon: Inbox, count: summary.total },
    { label: "Pending", value: "Pending", icon: CircleDashed, count: summary.pending },
    { label: "Active", value: "In Progress", icon: Clock, count: summary.inProgress },
    { label: "Done", value: "Completed", icon: CheckCheck, count: summary.completed },
  ];
}

export function Sidebar({
  sidebarOpen,
  onClose,
  statusFilter,
  onSelectView,
  hasActiveFilters,
  onClearFilters,
  onNewTask,
  summary,
}: SidebarProps) {
  const items = navItems(summary);

  return (
    <>
      {/* Desktop rail — fixed, never scrolls */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col items-center overflow-visible border-r border-white/10 bg-stone-800 py-5 text-stone-100 shadow-[14px_0_45px_-10px_rgba(0,0,0,0.55)] drop-shadow-[8px_0_16px_rgba(0,0,0,0.35)] lg:flex">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.5)]">
          <ListChecks className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <nav className="mt-8 flex flex-col gap-1.5" aria-label="Task views">
          {items.map((item) => {
            const Icon = item.icon;
            const active = statusFilter === item.value;
            return (
              <div key={item.label} className="group relative">
                <motion.button
                  type="button"
                  onClick={() => onSelectView(item.value)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label={item.label}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
                    active
                      ? "bg-white text-stone-800 shadow-[0_6px_18px_rgba(0,0,0,0.45)]"
                      : "text-stone-300 hover:bg-stone-700 hover:text-white hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </motion.button>
                {active && (
                  <motion.span
                    layoutId="rail-active"
                    className="absolute -left-[13px] top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-white"
                  />
                )}
                <span className="pointer-events-none absolute left-14 top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg bg-stone-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-xl ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
                  {item.label} · {item.count}
                </span>
              </div>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-3 pb-1">
          {hasActiveFilters && (
            <motion.button
              type="button"
              onClick={onClearFilters}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              aria-label="Clear filters"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-600 text-stone-300 transition hover:border-stone-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
          <motion.button
            type="button"
            onClick={onNewTask}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            aria-label="New task"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-stone-700 shadow-[0_8px_22px_rgba(0,0,0,0.5)] transition-shadow hover:shadow-[0_10px_28px_rgba(0,0,0,0.55)]"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="fixed inset-0 z-30 bg-stone-800/50 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="mobile-drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-y-auto border-r border-white/10 bg-stone-800 text-stone-100 shadow-[24px_0_70px_-12px_rgba(0,0,0,0.65)] lg:hidden"
          >
            <div className="flex items-center gap-3 px-5 pb-5 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.5)]">
                <ListChecks className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[15px] font-semibold tracking-tight">
                  Tasks
                </h2>
                <p className="text-xs text-stone-300">{summary.total} total</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-300 transition hover:bg-stone-700 hover:text-white"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 px-3" aria-label="Task views">
              {items.map((item) => {
                const Icon = item.icon;
                const active = statusFilter === item.value;
                return (
                  <motion.button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      onSelectView(item.value);
                      onClose();
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-white text-stone-700"
                        : "text-stone-300 hover:bg-stone-700/80 hover:text-white"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span>{item.label}</span>
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                        active
                          ? "bg-stone-700 text-white"
                          : "bg-stone-700 text-stone-200"
                      }`}
                    >
                      {item.count}
                    </span>
                  </motion.button>
                );
              })}
            </nav>

            <div className="px-3 pb-5 pt-3">
              <motion.button
                type="button"
                onClick={() => {
                  onNewTask();
                  onClose();
                }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-stone-700 shadow transition-shadow hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span>New task</span>
              </motion.button>
              <p className="mt-4 text-center text-[11px] tabular-nums text-stone-500">
                {summary.pending} pending · {summary.completed} done
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
