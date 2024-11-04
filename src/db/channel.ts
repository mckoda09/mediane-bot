import { kv } from "../mod.ts";

const channelKey = (id: number) => ["channel", id];

export const checkChannel = async (id: number) =>
  (await kv.get<boolean>(channelKey(id))).value ? true : false;

const postKey = (
  channelId: number,
  date: Date,
) => [
  "post",
  channelId,
  date.toLocaleDateString("ru", { timeZone: "Asia/Yekaterinburg" }),
];

export const getPost = async (channelId: number, date: Date) =>
  (await kv.get<number>(postKey(channelId, date))).value;

export const setPost = async (
  channelId: number,
  date: Date,
  messageId: number,
) => await kv.set(postKey(channelId, date), messageId);

export const deletePost = async (channelId: number, date: Date) =>
  await kv.delete(postKey(channelId, date));

export const requestPostClose = async (
  channelId: number,
  date: Date,
  delay: number,
) => await kv.enqueue({ channelId, date }, { delay });
