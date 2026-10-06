"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/validation";
import { SELECT_CLASS, type PriorityFilter, type StatusFilter } from "@/components/task-types";

interface SearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  priorityFilter: PriorityFilter;
  onPriorityChange: (value: PriorityFilter) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  inputClass: string;
}

export function SearchBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  hasActiveFilters,
  onClearFilters,
  inputClass,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const activeCount =
    (statusFilter !== "All" ? 1 : 0) + (priorityFilter !== "All" ? 1 : 0);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-2xl border border-stone-200/70 bg-white p-3 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] sm:p-4"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            id="search"
            className={`${inputClass} pl-10`}
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-200 hover:text-stone-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition sm:flex-none ${
              showFilters || priorityFilter !== "All"
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-stone-100 text-stone-600 hover:border-stone-300 hover:bg-stone-200"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-stone-900">
                {activeCount}
              </span>
            )}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex h-10 items-center rounded-xl px-3 text-sm font-medium text-stone-500 transition hover:bg-stone-200 hover:text-stone-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            key="filters"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2.5 pt-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="filter-status"
                  className="mb-1.5 block text-xs font-medium text-stone-500"
                >
                  Status
                </label>
                <select
                  id="filter-status"
                  className={`${SELECT_CLASS} w-full`}
                  value={statusFilter}
                  onChange={(e) =>
                    onStatusChange(e.target.value as StatusFilter)
                  }
                >
                  <option value="All">All statuses</option>
                  {TASK_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="filter-priority"
                  className="mb-1.5 block text-xs font-medium text-stone-500"
                >
                  Priority
                </label>
                <select
                  id="filter-priority"
                  className={`${SELECT_CLASS} w-full`}
                  value={priorityFilter}
                  onChange={(e) =>
                    onPriorityChange(e.target.value as PriorityFilter)
                  }
                >
                  <option value="All">All priorities</option>
                  {TASK_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
