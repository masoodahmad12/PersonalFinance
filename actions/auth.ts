"use server";

import { redirect } from "next/navigation";
import { checkPassword, endSession, startSession } from "@/lib/auth";
import { ensureDefaultCategories } from "@/lib/data";

export type LoginState = { error?: string };

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || !password) return { error: "Enter your password." };

  let valid = false;
  try {
    valid = await checkPassword(password);
  } catch (error) {
    console.error(error);
    return { error: "Login is not configured. Check APP_PASSWORD_HASH." };
  }
  if (!valid) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Incorrect password." };
  }

  await startSession();
  try {
    await ensureDefaultCategories();
  } catch (error) {
    console.error("Could not seed default categories", error);
  }
  redirect(safeNext(formData.get("next")));
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}
