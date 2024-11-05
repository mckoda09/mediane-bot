import { Composer, InlineKeyboard } from "grammy";
import {
  checkChannel,
  getPost,
  requestPostClose,
  setPost,
} from "../db/channel.ts";
import { bot, link } from "../mod.ts";
import { listEntries } from "../db/entry.ts";

export const channelComposer = new Composer();

channelComposer.use(async (c, next) => {
  if (c.chat?.type == "channel" && (await checkChannel(c.chatId || 0))) {
    await next();
  }
});

channelComposer.chatType("channel").command("post", async (c) => {
  const delayToClose = 3 * 60 * 60 * 1000;

  await setPost(c.chatId, new Date(), c.msgId);
  await requestPostClose(c.chatId, new Date(), delayToClose);

  const reply_markup = new InlineKeyboard().url(
    "Запись в боте",
    `https://t.me/${link}?start=${c.chatId}`,
  );
  await c.editMessageText(await generatePostText(c.chatId, new Date()), {
    reply_markup,
    parse_mode: "HTML",
  });
});

export const updatePost = async (channelId: number, date: Date) => {
  const post = await getPost(channelId, date);
  if (!post) return;

  const reply_markup = new InlineKeyboard().url(
    "Запись в боте",
    `https://t.me/${link}?start=${channelId}`,
  );
  await bot.api.editMessageText(
    channelId,
    post,
    await generatePostText(channelId, date),
    { reply_markup, parse_mode: "HTML" },
  );
};

export const generatePostText = async (channelId: number, date: Date) => {
  const entries = await listEntries(channelId, date);
  const { free, paid } = Object.groupBy(entries, (profile) =>
    profile.isFree ? "free" : "paid",
  );

  const listText = [free, paid]
    .filter((l) => l != undefined)
    .map((l) => l.map((p) => `${p.firstName} ${p.lastName}`).join("\n"))
    .join("\n");

  const header =
    "<b>Столовая</b>\nна " +
    new Date().toLocaleDateString("ru", {
      timeZone: "Asia/Yekaterinburg",
      day: "2-digit",
      month: "long",
      weekday: "long",
    });

  const footer = `${free ? free.length : 0} беспл. + ${paid ? paid.length : 0} пл.`;

  return [header, listText, footer].filter((e) => e.length).join("\n\n");
};
