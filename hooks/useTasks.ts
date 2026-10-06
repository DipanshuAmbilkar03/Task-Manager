import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/validation";
import {
  EMPTY_FORM,
  type FormState,
  type PriorityFilter,
  type StatusFilter,
  type Task,
} from "@/components/task-types";
import { readError, validateForm } from "@/components/task-utils";

export interface TaskSummary {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  high: number;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Task | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTasks = useCallback(
    async (signal?: AbortSignal) => {
      setGlobalError("");
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (statusFilter !== "All") params.set("status", statusFilter);
        if (priorityFilter !== "All") params.set("priority", priorityFilter);
        const query = params.toString() ? `?${params.toString()}` : "";
        const response = await fetch(`/api/tasks${query}`, { signal });
        if (!response.ok)
          throw new Error(await readError(response, "Could not load tasks."));
        const payload = await response.json();
        setTasks(payload.data.tasks ?? []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setGlobalError(
          error instanceof Error ? error.message : "Could not load tasks.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, statusFilter, priorityFilter],
  );

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    fetchTasks(controller.signal);
    return () => controller.abort();
  }, [fetchTasks]);

  const summary: TaskSummary = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "Pending").length,
      inProgress: tasks.filter((t) => t.status === "In Progress").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
      high: tasks.filter(
        (t) => t.priority === "High" && t.status !== "Completed",
      ).length,
    }),
    [tasks],
  );

  const hasActiveFilters =
    search !== "" || statusFilter !== "All" || priorityFilter !== "All";

  function applyStatusFilter(status: StatusFilter) {
    setStatusFilter(status);
  }

  function clearAllFilters() {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setFormErrors([]);
    setEditingId(null);
  }

  function focusForm() {
    requestAnimationFrame(() => {
      document
        .getElementById("task-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("title")?.focus({ preventScroll: true });
    });
  }

  function openNewTaskForm() {
    resetForm();
    setFormOpen(true);
    focusForm();
  }

  function startEditing(task: Task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
    });
    setFormErrors([]);
    setNotice("");
    setFormOpen(true);
    focusForm();
  }

  function closeForm() {
    resetForm();
    setFormOpen(false);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setNotice("");
    const errors = validateForm(form);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors([]);
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
      };
      const response = await fetch(
        editingId ? `/api/tasks/${editingId}` : "/api/tasks",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) {
        throw new Error(
          await readError(
            response,
            editingId
              ? "Could not update the task."
              : "Could not create the task.",
          ),
        );
      }
      setNotice(
        editingId ? "Task updated successfully." : "Task created successfully.",
      );
      resetForm();
      setFormOpen(false);
      setRefreshing(true);
      await fetchTasks();
    } catch (error) {
      setFormErrors([
        error instanceof Error ? error.message : "Something went wrong.",
      ]);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    if (task.status === status) return;
    setStatusUpdatingId(task.id);
    setGlobalError("");
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok)
        throw new Error(await readError(response, "Could not update status."));
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status } : t)),
      );
    } catch (error) {
      setGlobalError(
        error instanceof Error ? error.message : "Could not update status.",
      );
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function confirmDeleteTask() {
    const task = confirmDelete;
    if (!task) return;
    setDeletingId(task.id);
    setConfirmDelete(null);
    setGlobalError("");
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });
      if (!response.ok)
        throw new Error(
          await readError(response, "Could not delete the task."),
        );
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      if (editingId === task.id) {
        resetForm();
        setFormOpen(false);
      }
      setNotice("Task deleted.");
    } catch (error) {
      setGlobalError(
        error instanceof Error ? error.message : "Could not delete the task.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return {
    // data
    tasks,
    loading,
    refreshing,
    summary,
    // alerts
    globalError,
    notice,
    setNotice,
    // search + filters
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    hasActiveFilters,
    applyStatusFilter,
    clearAllFilters,
    // form
    form,
    setForm,
    formErrors,
    saving,
    editingId,
    formOpen,
    resetForm,
    openNewTaskForm,
    startEditing,
    closeForm,
    handleSubmit,
    // rows
    deletingId,
    statusUpdatingId,
    confirmDelete,
    setConfirmDelete,
    expandedId,
    setExpandedId,
    handleStatusChange,
    confirmDeleteTask,
  };
}

export type TasksController = ReturnType<typeof useTasks>;
export { TASK_PRIORITIES, TASK_STATUSES };
export type { TaskPriority, TaskStatus };
