import type { FormState } from "@/components/task-types";

/** Client-side validation for the task form (mirrors server Zod rules). */
export function validateForm(form: FormState): string[] {
  const errors: string[] = [];
  const title = form.title.trim();
  if (!title) errors.push("Title is required.");
  else if (title.length < 3)
    errors.push("Title must be at least 3 characters long.");
  else if (title.length > 100)
    errors.push("Title must be at most 100 characters long.");
  if (form.description.trim().length > 500) {
    errors.push("Description must be at most 500 characters long.");
  }
  return errors;
}

/** Extract a user-friendly message from a failed API response. */
export async function readError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const payload = await response.json();
    if (payload?.message && typeof payload.message === "string") {
      const extra = Array.isArray(payload.errors)
        ? ` ${payload.errors.join(" ")}`
        : "";
      return `${payload.message}${extra}`;
    }
  } catch {
    // fall through to generic message
  }
  return `${fallback} (status ${response.status})`;
}

/** Relative time like "5m ago" / "2h ago" / "3d ago". */
export function timeAgo(value: string): string {
  const date = new Date(value).getTime();
  if (Number.isNaN(date)) return "";
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}
