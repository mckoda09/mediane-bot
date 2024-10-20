import type { Context } from "grammy";
import { bot, logsId } from "./mod.ts";

export const log = async (message: string, c?: Context) => {
  if (c && c.from) {
    await bot.api.sendMessage(
      logsId,
      "#U" + c.from.id + "\n" +
        [c.from.first_name, c.from.last_name].join(" ") + " " +
        (c.from.is_premium ? "✶" : "") + "\n" +
        message,
    );
  } else {
    await bot.api.sendMessage(logsId, message);
  }
};
