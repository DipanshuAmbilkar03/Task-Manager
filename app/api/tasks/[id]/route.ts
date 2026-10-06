import { deleteTask, getTask, updateTask } from "@/lib/store";
import { updateTaskSchema, validationMessages } from "@/lib/validation";
import { fail, isValidObjectId, ok } from "@/lib/api";
import { connectDB } from "@/lib/db";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function invalidIdResponse(id: string, allowMemoryId: boolean) {
  if (allowMemoryId && id.startsWith("mem-")) return null;
  if (!isValidObjectId(id)) {
    return fail("Invalid task id. It must be a 24-character id.", 400);
  }
  return null;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const conn = await connectDB();
    const bad = invalidIdResponse(id, conn === null);
    if (bad) return bad;
    const task = await getTask(id);
    if (!task) return fail("Task not found.", 404);
    return ok({ task });
  } catch (error) {
    console.error("GET /api/tasks/:id failed:", error);
    return fail("Could not load the task. Please try again.", 500);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const conn = await connectDB();
    const bad = invalidIdResponse(id, conn === null);
    if (bad) return bad;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail("Request body must be valid JSON.", 400);
    }
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Validation failed.", 400, validationMessages(parsed.error));
    }
    const task = await updateTask(id, parsed.data);
    if (!task) return fail("Task not found.", 404);
    return ok({ task });
  } catch (error) {
    console.error("PUT /api/tasks/:id failed:", error);
    return fail("Could not update the task. Please try again.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const conn = await connectDB();
    const bad = invalidIdResponse(id, conn === null);
    if (bad) return bad;
    const removed = await deleteTask(id);
    if (!removed) return fail("Task not found.", 404);
    return ok({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/tasks/:id failed:", error);
    return fail("Could not delete the task. Please try again.", 500);
  }
}
