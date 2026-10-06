import { connectDB } from "@/lib/db";
import { TaskModel } from "@/models/Task";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type CreateTaskInput,
  type TaskPriority,
  type TaskStatus,
  type UpdateTaskInput,
} from "@/lib/validation";

export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

interface MemoryTask extends TaskDTO {}

const memoryTasks: MemoryTask[] = [];
let memorySeq = 1;

function toDTO(doc: {
  _id: unknown;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt?: Date;
  updatedAt?: Date;
}): TaskDTO {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? "",
    status: doc.status,
    priority: doc.priority,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function matchesFilter(
  task: MemoryTask,
  filter: { search: string; status: string; priority: string },
): boolean {
  if (filter.status !== "All" && task.status !== filter.status) return false;
  if (filter.priority !== "All" && task.priority !== filter.priority) return false;
  if (filter.search) {
    const q = filter.search.toLowerCase();
    const hay = `${task.title} ${task.description}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function isStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value);
}

function isPriority(value: string): value is TaskPriority {
  return (TASK_PRIORITIES as readonly string[]).includes(value);
}

export async function usesDatabase(): Promise<boolean> {
  return (await connectDB()) !== null;
}

export async function listTasks(filter: {
  search: string;
  status: string;
  priority: string;
}): Promise<TaskDTO[]> {
  const conn = await connectDB();
  if (conn) {
    const query: Record<string, unknown> = {};
    if (filter.status !== "All" && isStatus(filter.status)) {
      query.status = filter.status;
    }
    if (filter.priority !== "All" && isPriority(filter.priority)) {
      query.priority = filter.priority;
    }
    if (filter.search) {
      const rx = new RegExp(filter.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [{ title: rx }, { description: rx }];
    }
    const docs = await TaskModel.find(query).sort({ createdAt: -1 }).lean();
    return docs.map((d) =>
      toDTO({
        _id: d._id,
        title: d.title as string,
        description: (d.description as string) ?? "",
        status: d.status as TaskStatus,
        priority: d.priority as TaskPriority,
        createdAt: d.createdAt as Date,
        updatedAt: d.updatedAt as Date,
      }),
    );
  }
  return memoryTasks
    .filter((t) => matchesFilter(t, filter))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function createTask(input: CreateTaskInput): Promise<TaskDTO> {
  const conn = await connectDB();
  if (conn) {
    const doc = await TaskModel.create({
      title: input.title,
      description: input.description ?? "",
      status: input.status ?? "Pending",
      priority: input.priority ?? "Medium",
    });
    return toDTO({
      _id: doc._id,
      title: doc.title,
      description: doc.description,
      status: doc.status,
      priority: doc.priority,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
  const now = new Date().toISOString();
  const task: MemoryTask = {
    id: `mem-${Date.now()}-${memorySeq++}`,
    title: input.title,
    description: input.description ?? "",
    status: input.status ?? "Pending",
    priority: input.priority ?? "Medium",
    createdAt: now,
    updatedAt: now,
  };
  memoryTasks.push(task);
  return task;
}

export async function getTask(id: string): Promise<TaskDTO | null> {
  const conn = await connectDB();
  if (conn) {
    const doc = await TaskModel.findById(id).lean();
    if (!doc) return null;
    return toDTO({
      _id: doc._id,
      title: doc.title as string,
      description: (doc.description as string) ?? "",
      status: doc.status as TaskStatus,
      priority: doc.priority as TaskPriority,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date,
    });
  }
  return memoryTasks.find((t) => t.id === id) ?? null;
}

export async function updateTask(id: string, patch: UpdateTaskInput): Promise<TaskDTO | null> {
  const conn = await connectDB();
  if (conn) {
    const doc = await TaskModel.findByIdAndUpdate(id, patch, {
      new: true,
      runValidators: true,
    }).lean();
    if (!doc) return null;
    return toDTO({
      _id: doc._id,
      title: doc.title as string,
      description: (doc.description as string) ?? "",
      status: doc.status as TaskStatus,
      priority: doc.priority as TaskPriority,
      createdAt: doc.createdAt as Date,
      updatedAt: doc.updatedAt as Date,
    });
  }
  const task = memoryTasks.find((t) => t.id === id);
  if (!task) return null;
  if (patch.title !== undefined) task.title = patch.title;
  if (patch.description !== undefined) task.description = patch.description ?? "";
  if (patch.status !== undefined) task.status = patch.status;
  if (patch.priority !== undefined) task.priority = patch.priority;
  task.updatedAt = new Date().toISOString();
  return { ...task };
}

export async function deleteTask(id: string): Promise<boolean> {
  const conn = await connectDB();
  if (conn) {
    const result = await TaskModel.findByIdAndDelete(id);
    return result !== null;
  }
  const index = memoryTasks.findIndex((t) => t.id === id);
  if (index === -1) return false;
  memoryTasks.splice(index, 1);
  return true;
}
