import type { Circle } from "lucide-react";
import { CircleDashed, Clock, CheckCheck } from "lucide-react";
import type { TaskPriority, TaskStatus } from "@/lib/validation";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export type StatusFilter = TaskStatus | "All";
export type PriorityFilter = TaskPriority | "All";

export interface FormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  status: "Pending",
  priority: "Medium",
};

interface StatusMeta {
  dot: string;
  chip: string;
  icon: typeof Circle;
}

export const STATUS_META: Record<TaskStatus, StatusMeta> = {
  Pending: {
    dot: "bg-amber-500",
    chip: "border-amber-200 bg-amber-50 text-amber-800",
    icon: CircleDashed,
  },
  "In Progress": {
    dot: "bg-sky-600",
    chip: "border-sky-200 bg-sky-50 text-sky-800",
    icon: Clock,
  },
  Completed: {
    dot: "bg-emerald-600",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCheck,
  },
};

export const INPUT_CLASS =
  "w-full rounded-xl border border-stone-200 bg-stone-100 px-3.5 py-2.5 text-sm text-stone-800 shadow-inner placeholder:text-stone-400 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

export const SELECT_CLASS =
  "rounded-xl border border-stone-200 bg-stone-100 px-3 py-2 text-sm text-stone-800 shadow-inner transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
