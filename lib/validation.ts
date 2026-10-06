import { z } from "zod";

export const TASK_STATUSES = ["Pending", "In Progress", "Completed"] as const;
export const TASK_PRIORITIES = ["Low", "Medium", "High"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

const titleField = z
  .string({ error: "Title is required" })
  .trim()
  .min(3, "Title must be at least 3 characters long")
  .max(100, "Title must be at most 100 characters long");

const descriptionField = z
  .string()
  .trim()
  .max(500, "Description must be at most 500 characters long")
  .optional()
  .default("");

// POST /api/tasks
export const createTaskSchema = z.object({
  title: titleField,
  description: descriptionField,
  status: z.enum(TASK_STATUSES).optional().default("Pending"),
  priority: z.enum(TASK_PRIORITIES).optional().default("Medium"),
});

// PUT /api/tasks/:id (partial update allowed — no defaults so omitted fields stay untouched)
export const updateTaskSchema = z
  .object({
    title: titleField.optional(),
    description: z
      .string()
      .trim()
      .max(500, "Description must be at most 500 characters long")
      .optional(),
    status: z.enum(TASK_STATUSES).optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

// GET /api/tasks?search=&status=&priority=
export const taskQuerySchema = z.object({
  search: z.string().trim().max(100).optional().default(""),
  status: z.enum([...TASK_STATUSES, "All"]).optional().default("All"),
  priority: z.enum([...TASK_PRIORITIES, "All"]).optional().default("All"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;

/** Flatten Zod issues into user-friendly messages. */
export function validationMessages(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}
