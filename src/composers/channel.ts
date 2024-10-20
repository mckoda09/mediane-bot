import { Composer, InlineKeyboard } from "grammy";
import { channelIsAllowed } from "../db/channel.ts";
import { username } from "../mod.ts";

export const channelComposer = new Composer();

channelComposer.chatType("channel").command("alias", async (c) => {
  if (!await channelIsAllowed(c.chatId)) return;

  await c.deleteMessage();
  const reply_markup = new InlineKeyboard().url(
    "Перейти",
    `https://t.me/${username}`,
  );
  await c.reply("Привет!\nЯ Mediane — бот для сбора списков.", {
    reply_markup,
  });
});
