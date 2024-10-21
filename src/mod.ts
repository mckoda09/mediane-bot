import { Bot } from "grammy";
import { aliasComposer } from "./composers/alias.ts";
import { clearStatus } from "./status.ts";
import { channelComposer } from "./composers/channel.ts";
import {delay} from "./delay.ts"
import {stickers} from "./sticker.ts"

console.log("CLEANING BRANCH")

export const logsId = Number(Deno.env.get("LOGS_ID"));
export const adminId = Number(Deno.env.get("ADMIN_ID"));
export const username = Deno.env.get("BOT_USERNAME");

export const kv = await Deno.openKv();
export const bot = new Bot(Deno.env.get("TOKEN") || "");
await bot.api.setMyCommands([
  { command: "help", description: "Помощь по боту" },
]);

bot.chatType("private").command("cancel", async (c) => {
  await clearStatus(c.from.id);
  await c.react("👍");
});

bot.use(aliasComposer);
bot.use(channelComposer);

bot.catch((e) => console.error(e.message));
