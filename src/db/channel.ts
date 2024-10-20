import { kv } from "../mod.ts";

const channelKey = (id: number) => ["channel", id];

export const channelIsAllowed = async (id: number) =>
  (await kv.get<true>(channelKey(id))).value ? true : false;
