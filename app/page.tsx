"use client";

import { useState } from "react";
import { Alerts } from "@/components/Alerts";
import { DeleteDialog } from "@/components/DeleteDialog";
import { SearchBar } from "@/components/SearchBar";
import { Sidebar } from "@/components/Sidebar";
import { TaskForm } from "@/components/TaskForm";
import { TaskList } from "@/components/TaskList";
import { Topbar } from "@/components/Topbar";
import { INPUT_CLASS } from "@/components/task-types";
import { useTasks } from "@/hooks/useTasks";

export default function HomePage() {
  const tasks = useTasks();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-200 text-stone-800 lg:pl-20">
      <Sidebar
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        statusFilter={tasks.statusFilter}
        onSelectView={(status) => {
          tasks.applyStatusFilter(status);
          setSidebarOpen(false);
        }}
        hasActiveFilters={tasks.hasActiveFilters}
        onClearFilters={() => {
          tasks.clearAllFilters();
          setSidebarOpen(false);
        }}
        onNewTask={tasks.openNewTaskForm}
        summary={tasks.summary}
      />

      <Topbar
        statusFilter={tasks.statusFilter}
        summary={tasks.summary}
        onOpenSidebar={() => setSidebarOpen(true)}
        onNewTask={tasks.openNewTaskForm}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-3 py-4 sm:space-y-5 sm:px-6 sm:py-6">
        <Alerts globalError={tasks.globalError} notice={tasks.notice} />

        <SearchBar
          search={tasks.search}
          onSearchChange={tasks.setSearch}
          statusFilter={tasks.statusFilter}
          onStatusChange={tasks.setStatusFilter}
          priorityFilter={tasks.priorityFilter}
          onPriorityChange={tasks.setPriorityFilter}
          hasActiveFilters={tasks.hasActiveFilters}
          onClearFilters={tasks.clearAllFilters}
          inputClass={INPUT_CLASS}
        />

        <TaskForm
          formOpen={tasks.formOpen}
          editingId={tasks.editingId}
          form={tasks.form}
          onFormChange={tasks.setForm}
          formErrors={tasks.formErrors}
          saving={tasks.saving}
          onSubmit={tasks.handleSubmit}
          onClose={tasks.closeForm}
        />

        <section id="task-list" aria-live="polite" className="scroll-mt-24">
          <TaskList
            loading={tasks.loading}
            refreshing={tasks.refreshing}
            tasks={tasks.tasks}
            hasActiveFilters={tasks.hasActiveFilters}
            onClearFilters={tasks.clearAllFilters}
            onNewTask={tasks.openNewTaskForm}
            expandedId={tasks.expandedId}
            onToggleExpand={tasks.setExpandedId}
            onEdit={tasks.startEditing}
            onAskDelete={tasks.setConfirmDelete}
            onStatusChange={tasks.handleStatusChange}
            deletingId={tasks.deletingId}
            statusUpdatingId={tasks.statusUpdatingId}
          />
        </section>

        <DeleteDialog
          task={tasks.confirmDelete}
          onCancel={() => tasks.setConfirmDelete(null)}
          onConfirm={tasks.confirmDeleteTask}
        />
      </main>
    </div>
  );
}
