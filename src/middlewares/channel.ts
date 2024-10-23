import type { Context, NextFunction } from "grammy";
import { kv } from "../mod.ts";

const channelAllowedKey = (id: number) => ["channelAllowed", id];

const isChannelAllowed = async (id: number) =>
  (await kv.get(channelAllowedKey(id))).value ? true : false;

export const channelAllowed = async (c: Context, next: NextFunction) => {
  if (
    c.chat &&
    c.chat.type == "channel" &&
    !await isChannelAllowed(c.chat.id)
  ) return;
  await next();
};
