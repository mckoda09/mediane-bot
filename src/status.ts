import { kv } from "./mod.ts";

type Status = "waitFirstName" | "waitLastName";

const statusKey = (userId: number) => ["status", userId];

export const getStatus = async (userId: number) =>
  (await kv.get<Status>(statusKey(userId))).value;

export const setStatus = async (userId: number, status: Status) =>
  await kv.set(statusKey(userId), status);

export const clearStatus = async (userId: number) =>
  await kv.delete(statusKey(userId));
