import { Bot } from "grammy";

export const bot = new Bot(Deno.env.get("TOKEN") || "");
export const kv = await Deno.openKv();
