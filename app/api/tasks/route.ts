import { createTaskSchema, taskQuerySchema, validationMessages } from "@/lib/validation";
import { createTask, listTasks } from "@/lib/store";
import { fail, ok } from "@/lib/api";
import { connectDB, isDbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const parsed = taskQuerySchema.safeParse({
      search: url.searchParams.get("search") ?? "",
      status: url.searchParams.get("status") ?? "All",
      priority: url.searchParams.get("priority") ?? "All",
    });
    if (!parsed.success) {
      return fail("Invalid query parameters.", 400, validationMessages(parsed.error));
    }
    const tasks = await listTasks(parsed.data);
    return ok(
      { tasks, storage: isDbConfigured() ? "mongodb" : "memory" },
    );
  } catch (error) {
    console.error("GET /api/tasks failed:", error);
    return fail("Could not load tasks. Please try again.", 500);
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail("Request body must be valid JSON.", 400);
    }
    const parsed = createTaskSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Validation failed.", 400, validationMessages(parsed.error));
    }
    const task = await createTask(parsed.data);
    return ok({ task }, 201);
  } catch (error) {
    console.error("POST /api/tasks failed:", error);
    return fail("Could not create the task. Please try again.", 500);
  }
}
