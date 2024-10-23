import type { Context, NextFunction } from "grammy";
import { bot } from "./mod.ts";
import { logsId } from "./config.ts";

export const log = async (message: string, c?: Context) => {
  if (c?.from) {
    await bot.api.sendMessage(
      logsId,
      "#U" + c.from.id + "\n" +
        message,
    );
  } else await bot.api.sendMessage(logsId, message);
};
