import { Bot } from "grammy";
import { utilsComposer } from "./composers/utils.ts";
import { channelAllowed } from "./middlewares/channel.ts";
import { channelComposer } from "./composers/channel.ts";
import { registerComposer } from "./composers/register.ts";

// Init
export const bot = new Bot(Deno.env.get("TOKEN") || "");
export const kv = await Deno.openKv();

// Middlewares
bot.use(channelAllowed); // Check if channel is in allowed list

// Composers
bot.use(utilsComposer); // Utilities, like /cancel
bot.use(channelComposer); // ???
bot.use(registerComposer); // User registration

// Graceful catch
bot.catch((e) => console.error(e.message));
