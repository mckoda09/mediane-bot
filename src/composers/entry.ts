import { Composer, InlineKeyboard } from "grammy";
import { checkChannel, getPost } from "../db/channel.ts";
import { addEntry, getEntry, removeEntry } from "../db/entry.ts";
import { updatePost } from "./channel.ts";
import { getProfile } from "../db/profile.ts";

export const entryComposer = new Composer();

entryComposer.chatType("private").command("start", async (c) => {
  const channelId = Number(c.msg.text.split(" ")[1]);
  if (!channelId) return; // 1. Check if channel id is provided

  if (!(await checkChannel(channelId))) return; // 2. Check if channel is allowed

  const chatMember = await c.api.getChatMember(channelId, c.from.id);
  const allowedStatuses = ["member", "creator", "administrator", "restricted"];
  if (!allowedStatuses.includes(chatMember.status)) return; // 3. Check if user is member of channel

  const profile = await getProfile(c.from.id);
  if (!profile) {
    await c.reply("Ты не зарегистрирован в системе! Обратись к @mckoda09");
    return;
  }

  const post = await getPost(channelId, new Date());

  const entry = await getEntry(channelId, c.from.id, new Date());

  const reply_markup = new InlineKeyboard();
  if (post) {
    entry
      ? reply_markup.text("Отменить запись", `remove:${channelId}`)
      : reply_markup.text("Записаться", `add:${channelId}`);
  } else {
    reply_markup.text("Запись закрыта 🔒", "closed");
  }

  await c.reply(
    `<b>${entry ? "Записан ✅" : "Не записан 🚫"}</b>\nна ${new Date().toLocaleDateString(
      "ru",
      {
        timeZone: "Asia/Yekaterinburg",
        day: "2-digit",
        month: "long",
        weekday: "long",
      },
    )}`,
    { parse_mode: "HTML", reply_markup },
  );
});

entryComposer.chatType("private").callbackQuery(/add:.*/, async (c) => {
  const channelId = Number(c.callbackQuery.data.split(":")[1]);
  if (!channelId) return; // 1. Check if channel id is provided

  if (!(await checkChannel(channelId))) return; // 2. Check if channel is allowed

  const chatMember = await c.api.getChatMember(channelId, c.from.id);
  const allowedStatuses = ["member", "creator", "administrator", "restricted"];
  if (!allowedStatuses.includes(chatMember.status)) return; // 3. Check if user is member of channel

  const post = await getPost(channelId, new Date()); // 4. Check if modifying is allowed
  if (!post) {
    const reply_markup = new InlineKeyboard().text(
      "🔒 Запись закрыта",
      "closed",
    );
    await c.editMessageReplyMarkup({ reply_markup });
    await c.answerCallbackQuery({
      text: "🔒 Запись закрыта!\n\nСкорее всего, вышло время, до которого можно было записаться.",
      show_alert: true,
    });
    return;
  }

  await addEntry(channelId, c.from.id, new Date());

  const reply_markup = new InlineKeyboard().text(
    "Отменить запись",
    `remove:${channelId}`,
  );
  await c.editMessageText(
    `<b>Записан ✅</b>\nна ${new Date().toLocaleDateString("ru", {
      timeZone: "Asia/Yekaterinburg",
      day: "2-digit",
      month: "long",
      weekday: "long",
    })}`,
    { parse_mode: "HTML", reply_markup },
  );
  await c.answerCallbackQuery({ text: "Теперь ты записан." });
  await updatePost(channelId, new Date());
});

entryComposer.chatType("private").callbackQuery(/remove:.*/, async (c) => {
  const channelId = Number(c.callbackQuery.data.split(":")[1]);
  if (!channelId) return; // 1. Check if channel id is provided

  if (!(await checkChannel(channelId))) return; // 2. Check if channel is allowed

  const chatMember = await c.api.getChatMember(channelId, c.from.id);
  const allowedStatuses = ["member", "creator", "administrator", "restricted"];
  if (!allowedStatuses.includes(chatMember.status)) return; // 3. Check if user is member of channel

  const post = await getPost(channelId, new Date()); // 4. Check if modifying is allowed
  if (!post) {
    const reply_markup = new InlineKeyboard().text(
      "🔒 Запись закрыта",
      "closed",
    );
    await c.editMessageReplyMarkup({ reply_markup });
    await c.answerCallbackQuery({
      text: "🔒 Запись закрыта!\n\nСкорее всего, вышло время, до которого можно было записаться.",
      show_alert: true,
    });
    return;
  }

  await removeEntry(channelId, c.from.id, new Date());

  const reply_markup = new InlineKeyboard().text(
    "Записаться",
    `add:${channelId}`,
  );
  await c.editMessageText(
    `<b>Не записан 🚫</b>\nна ${new Date().toLocaleDateString("ru", {
      timeZone: "Asia/Yekaterinburg",
      day: "2-digit",
      month: "long",
      weekday: "long",
    })}`,
    { parse_mode: "HTML", reply_markup },
  );
  await c.answerCallbackQuery({ text: "Ты больше не записан." });
  await updatePost(channelId, new Date());
});
