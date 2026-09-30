import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
} from "./session";

/** Accepts either a raw bcrypt hash or a base64-encoded one (avoids `$` escaping in .env files). */
function getPasswordHash(): string {
  const raw = process.env.APP_PASSWORD_HASH?.trim();
  if (!raw) throw new Error("APP_PASSWORD_HASH is not set. Run `npm run hash-password`.");
  if (raw.startsWith("$2")) return raw;
  return Buffer.from(raw, "base64").toString("utf8");
}

export async function checkPassword(password: string): Promise<boolean> {
  return bcrypt.compare(password, getPasswordHash());
}

export async function startSession() {
  const token = await createSessionToken();
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function requireAuth() {
  if (!(await isAuthenticated())) redirect("/login");
}
