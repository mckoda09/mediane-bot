import { kv } from "../mod.ts";

interface Profile {
  firstName: string;
  lastName: string;
  isFree: boolean;
}

const profileKey = (id: number) => ["profile", id];

export const getProfile = async (id: number) =>
  (await kv.get<Profile>(profileKey(id))).value;
