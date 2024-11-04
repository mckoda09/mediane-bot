import { kv } from "../mod.ts";
import { getProfile } from "./profile.ts";

const entryKey = (
  channelId: number,
  userId: number,
  date: Date,
) => [
  "entry",
  channelId,
  date.toLocaleDateString("ru", { timeZone: "Asia/Yekaterinburg" }),
  userId,
];

export const getEntry = async (channelId: number, userId: number, date: Date) =>
  (await kv.get<true>(entryKey(channelId, userId, date))).value;

export const addEntry = async (channelId: number, userId: number, date: Date) =>
  await kv.set(entryKey(channelId, userId, date), true);

export const removeEntry = async (
  channelId: number,
  userId: number,
  date: Date,
) => await kv.delete(entryKey(channelId, userId, date));

export const listEntries = async (channelId: number, date: Date) =>
  (await Array.fromAsync(
    kv.list({
      prefix: [
        "entry",
        channelId,
        date.toLocaleDateString("ru", { timeZone: "Asia/Yekaterinburg" }),
      ],
    }),
    async (e) => await getProfile(Number(e.key[3])),
  )).filter((e) => e != null);
