import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(message: string, status = 400, errors?: string[]) {
  return NextResponse.json(
    { success: false, message, ...(errors ? { errors } : {}) },
    { status },
  );
}

export function isValidObjectId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}
