import { Composer, InlineKeyboard } from "grammy";
import { stickers } from "../sticker.ts";
import { clearStatus, getStatus, setStatus } from "../status.ts";
import {
  getFirstName,
  getLastName,
  setFirstName,
  setLastName,
} from "../db/alias.ts";
import { log } from "../logger.ts";

export const aliasComposer = new Composer();

aliasComposer.chatType("private").command("start", async (c) => {
  await log("Запустил бота", c);
  await setStatus(c.from.id, "firstName");

  await c.replyWithSticker(stickers.hello);
  await c.reply(
    "Привет! Как тебя зовут? (только имя)",
  );
});

aliasComposer.chatType("private").on("msg:text", async (c) => {
  const status = await getStatus(c.from.id);
  switch (status) {
    case "firstName": {
      const uppercased = c.message.text.charAt(0).toUpperCase() +
        c.message.text.slice(1);
      await setFirstName(
        c.from.id,
        uppercased,
      );
      await setStatus(c.from.id, "lastName");

      await c.reply("Хорошо, а как твоя фамилия?");
      break;
    }
    case "lastName": {
      const uppercased = c.message.text.charAt(0).toUpperCase() +
        c.message.text.slice(1);

      await setLastName(
        c.from.id,
        uppercased,
      );
      await clearStatus(c.from.id);

      const firstName = await getFirstName(c.from.id);
      const reply_markup = new InlineKeyboard()
        .text("Да ✅", "alias-yes").row()
        .text("Нет ❌", "alias-no");

      await c.reply(`Тебя зовут ${firstName} ${uppercased}?`, { reply_markup });
      break;
    }
  }
});

aliasComposer.callbackQuery("alias-yes", async (c) => {
  if (!c.from) return;

  const firstName = await getFirstName(c.from.id);
  const lastName = await getLastName(c.from.id);

  await c.editMessageText(
    `Тебя зовут ${firstName} ${lastName}?\n\nДа ✅`,
  );
  await c.reply("Хорошо! Теперь ты можешь записываться.");
  await c.answerCallbackQuery();
});

aliasComposer.callbackQuery("alias-no", async (c) => {
  if (!c.from) return;

  await setStatus(c.from.id, "firstName");

  const firstName = await getFirstName(c.from.id);
  const lastName = await getLastName(c.from.id);

  await c.editMessageText(
    `Тебя зовут ${firstName} ${lastName}?\n\nНет ❌`,
  );
  await c.reply("Как тебя зовут?");

  await c.answerCallbackQuery();
});
