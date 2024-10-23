import { Composer, InlineKeyboard } from "grammy";
import { stickers } from "../sticker.ts";
import { log } from "../logs.ts";
import {
  clearTmp,
  deleteRegister,
  getProfile,
  getRegister,
  getTmpFirstName,
  getTmpIsFree,
  getTmpLastName,
  setProfile,
  setRegister,
  setTmpFirstName,
  setTmpIsFree,
  setTmpLastName,
} from "../db/profile.ts";
import { clearStatus, setStatus } from "../status.ts";
import { getStatus } from "../status.ts";
import { logsId } from "../config.ts";

export const registerComposer = new Composer();

// Step 1
registerComposer.chatType("private").command("start", async (c) => {
  if (c.msg.text.split(" ")[1] != "register") return;

  if (await getRegister(c.from.id)) {
    await c.reply("Ты уже отправил заявку!");
  } else {
    if (await getProfile(c.from.id)) {
      await c.reply("Ты уже прошёл регистрацию и можешь пользоваться ботом!");
    } else {
      await setStatus(c.from.id, "waitFirstName");

      await c.replyWithSticker(stickers.hello);
      await c.reply("Привет!\nНапиши, как тебя зовут (только имя).");

      await log(
        `${
          c.from.first_name + (c.from.last_name ? " " + c.from.last_name : "")
        } ${c.from.is_premium ? "⭐" : ""}\nstart register`,
        c,
      );
    }
  }
});

// Step 2
registerComposer.chatType("private").on("msg:text", async (c) => {
  const status = await getStatus(c.from.id);

  switch (status) {
    case "waitFirstName": {
      const formatted = c.msg.text.charAt(0).toUpperCase() +
        c.msg.text.slice(1);
      await setTmpFirstName(c.from.id, formatted);

      await setStatus(c.from.id, "waitLastName");
      await c.reply("Хорошо, а как твоя фамилия?");

      break;
    }
    case "waitLastName": {
      const formatted = c.msg.text.charAt(0).toUpperCase() +
        c.msg.text.slice(1);
      await setTmpLastName(c.from.id, formatted);
      await clearStatus(c.from.id);

      const reply_markup = new InlineKeyboard();
      reply_markup.text("Платно 💰", "paid");
      reply_markup.text("По льготе 🆓", "free");
      await c.reply("Ты питаешься платно или по льготе?", { reply_markup });

      break;
    }
  }
});

// Step 3
registerComposer.chatType("private").callbackQuery("paid", async (c) => {
  await setTmpIsFree(c.from.id, false);
  await c.editMessageText(c.msg!.text + "\n\nПлатно 💰");

  const reply_markup = new InlineKeyboard();
  reply_markup.text("Да ✅", "save");
  reply_markup.text("Нет ❌", "retry");

  const firstName = await getTmpFirstName(c.from.id);
  const lastName = await getTmpLastName(c.from.id);

  await c.reply(
    `Тебя зовут ${lastName} ${firstName}, ты питаешься платно, всё верно?`,
    { reply_markup },
  );
});

registerComposer.chatType("private").callbackQuery("free", async (c) => {
  await setTmpIsFree(c.from.id, true);
  await c.editMessageText(c.msg!.text + "\n\nПо льготе 🆓");

  const reply_markup = new InlineKeyboard();
  reply_markup.text("Да ✅", "save");
  reply_markup.text("Нет ❌", "retry");

  const firstName = await getTmpFirstName(c.from.id);
  const lastName = await getTmpLastName(c.from.id);

  await c.reply(
    `Тебя зовут ${lastName} ${firstName}, ты питаешься по льготе, всё верно?`,
    { reply_markup },
  );
});

// Step 4
registerComposer.chatType("private").callbackQuery("save", async (c) => {
  await c.editMessageText(c.msg!.text + "\n\nДа ✅");

  const firstName = await getTmpFirstName(c.from.id) || "";
  const lastName = await getTmpLastName(c.from.id) || "";
  const isFree = await getTmpIsFree(c.from.id) || false;

  await setRegister(c.from.id, {
    firstName,
    lastName,
    isFree,
  });

  const reply_markup = new InlineKeyboard();
  reply_markup.text("Добавить ✅", `add-${c.from.id}`);
  reply_markup.text("Отклонить ❌", `remove-${c.from.id}`);

  await c.api.sendMessage(
    logsId,
    c.from.first_name + (c.from.last_name ? " " + c.from.last_name : "") +
      (c.from.is_premium ? " ⭐" : "") + "\n" +
      `${lastName} ${firstName}, ${isFree ? "льготник" : "платник"}` + "\n" +
      (c.from.username ? "@" + c.from.username : "ссылки нет :("),
    { reply_markup },
  );

  await clearTmp(c.from.id);

  await c.reply(
    "Твоя заявка отправлена на рассмотрение!\nОбычно это занимает 15-20 минут.",
  );
});

registerComposer.chatType("private").callbackQuery("retry", async (c) => {
  await c.editMessageText(c.msg!.text + "\n\nНет ❌");

  await clearTmp(c.from.id);

  await setStatus(c.from.id, "waitFirstName");
  await c.reply("Давай заново. Как тебя зовут? (только имя)");
});

// Step 5 (in logs)
registerComposer.callbackQuery(
  /^add-[0-9]+$/i,
  async (c) => {
    const uid = +c.callbackQuery.data.split("-")[1];
    if (!uid) return;

    const register = await getRegister(uid);
    if (!register) return;

    await setProfile(uid, register);

    await deleteRegister(uid);

    await c.editMessageText(
      c.callbackQuery.message!.text + "\nДобавлен ✅",
    );

    await c.api.sendMessage(
      uid,
      "Твоя заявка одобрена! Скоро ты сможешь пользоваться ботом!",
    );

    await c.answerCallbackQuery();
  },
);

registerComposer.callbackQuery(
  /^remove-[0-9]+$/i,
  async (c) => {
    const uid = +c.callbackQuery.data.split("-")[1];
    if (!uid) return;

    await deleteRegister(uid);

    await c.editMessageText(c.callbackQuery.message!.text + "\nОтклонён ❌");

    await c.answerCallbackQuery();
  },
);
