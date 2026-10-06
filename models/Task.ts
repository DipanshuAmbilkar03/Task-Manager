import { Schema, model, models } from "mongoose";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/validation";

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title must be at most 100 characters long"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Description must be at most 500 characters long"],
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: "Status must be Pending, In Progress or Completed",
      },
      default: "Pending",
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: "Priority must be Low, Medium or High",
      },
      default: "Medium",
    },
  },
  { timestamps: true },
);

export const TaskModel = models.Task || model("Task", TaskSchema);
