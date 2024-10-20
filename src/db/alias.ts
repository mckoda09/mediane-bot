import { kv } from "../mod.ts";

const firstNameKey = (userId: number) => ["firstName", userId];
const lastNameKey = (userId: number) => ["lastName", userId];

export const setFirstName = async (userId: number, firstName: string) => {
  await kv.set(firstNameKey(userId), firstName);
};

export const setLastName = async (userId: number, lastName: string) => {
  await kv.set(lastNameKey(userId), lastName);
};

export const getFirstName = async (userId: number) =>
  (await kv.get<string>(firstNameKey(userId))).value;

export const getLastName = async (userId: number) =>
  (await kv.get<string>(lastNameKey(userId))).value;
