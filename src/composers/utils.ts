import { Composer } from "grammy";
import { clearStatus } from "../status.ts";

export const utilsComposer = new Composer();

utilsComposer.chatType("private").command("cancel", async (c) => {
  await clearStatus(c.from.id);
  await c.reply("Хорошо! Текущее действие отменено.");
});
